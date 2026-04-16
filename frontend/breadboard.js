/* =================================================================
   BREADBOARD.JS — MB-102 Standard Physics Engine v3.0
   Author: Dhilipan S  |  CAT Learning Platform
   
   Implements:
   - 5x60 coordinate grid (standard MB-102 layout)
   - Snap-to-Grid component placement with Z-axis depth
   - Point-to-Point Manhattan wire routing with crossing arcs
   - Electrical connectivity (vertical tie-points + horizontal rails)
   ================================================================= */

const BB_ROWS   = 5;    // Rows A-E on each half
const BB_COLS   = 60;   // Standard 60 column breadboard

// --- State ---
let selectedBBComp   = null;   // Currently selected tool
let currentWireSource = null;  // Source node for wire drawing
let placedComponents  = [];    // Array of placed component objects
let wires             = [];    // Array of wire objects
let netList           = {};    // Electrical node connectivity map

// --- DOM refs (set in initBreadboard) ---
let bbWireLayer;

/* ─── INIT ─────────────────────────────────────────── */
function initBreadboard() {
    bbWireLayer = document.getElementById('bbWireLayer');
    buildMB102Board();
    updateBBStatus("MB-102 Board Ready — Select a component and click a hole.");
    console.log("[BB] MB-102 Physics Engine v3.0 initialized.");
}

document.addEventListener('DOMContentLoaded', initBreadboard);

/* ─── BOARD CONSTRUCTION ────────────────────────────── */
function buildMB102Board() {
    // --- Power Rails ---
    buildPowerRail('bbTopRail',    'top-pos', '+');
    buildPowerRail('bbTopNegRail', 'top-neg', '−');
    
    // --- Upper half (rows A-E) ---
    buildMainGrid('bbMainArea');
    
    // --- Lower half is rendered inside bbMainArea as a two-section grid ---
    buildPowerRail('bbBotRail',    'bot-pos', '+');
    buildPowerRail('bbBotNegRail', 'bot-neg', '−');

    // Reset wire SVG layer
    if (bbWireLayer) bbWireLayer.innerHTML = '';
}

function buildPowerRail(containerId, railType, polarity) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    for (let c = 0; c < BB_COLS; c++) {
        // Group break every 5 holes (standard 5-hole rail groups with gap)
        if (c > 0 && c % 5 === 0) {
            const gap = document.createElement('div');
            gap.className = 'bb-gap';
            container.appendChild(gap);
        }

        const hole = document.createElement('div');
        hole.className = `bb-hole rail-hole rail-${railType}`;
        hole.id = `rail-${railType}-${c}`;
        hole.dataset.rail = railType;
        hole.dataset.col  = c;
        hole.title = `${polarity} Rail, Col ${c + 1}`;
        hole.onclick = () => handleHoleClick(railType, c, hole);
        container.appendChild(hole);
    }
}

function buildMainGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const ALPHABET_TOP = ['a','b','c','d','e'];
    const ALPHABET_BOT = ['f','g','h','i','j'];

    // --- Top half (A-E) ---
    const topSection = document.createElement('div');
    topSection.className = 'bb-section';
    ALPHABET_TOP.forEach((rowLabel, ri) => {
        topSection.appendChild(buildGridRow(rowLabel, ri, 'top'));
    });
    container.appendChild(topSection);

    // --- Center divider ---
    const divider = document.createElement('div');
    divider.className = 'bb-center-gap';
    divider.innerHTML = '<span>DIP</span>';
    container.appendChild(divider);

    // --- Bottom half (F-J) ---
    const botSection = document.createElement('div');
    botSection.className = 'bb-section';
    ALPHABET_BOT.forEach((rowLabel, ri) => {
        botSection.appendChild(buildGridRow(rowLabel, ri + 5, 'bot'));
    });
    container.appendChild(botSection);
}

function buildGridRow(rowLabel, riIndex, section) {
    const rowWrapper = document.createElement('div');
    rowWrapper.className = 'bb-row-wrapper';

    // Row label (A, B, C...)
    const labelEl = document.createElement('span');
    labelEl.className = 'bb-row-label';
    labelEl.textContent = rowLabel.toUpperCase();
    rowWrapper.appendChild(labelEl);

    const rowDiv = document.createElement('div');
    rowDiv.className = 'bb-row';

    for (let c = 0; c < BB_COLS; c++) {
        // Visual 5-hole group gaps (every 5 cols)
        if (c > 0 && c % 5 === 0) {
            const gap = document.createElement('div');
            gap.className = 'bb-gap';
            rowDiv.appendChild(gap);
        }

        const hole = document.createElement('div');
        hole.className = `bb-hole main-hole`;
        hole.id = `hole-${rowLabel}-${c}`;
        hole.dataset.row    = rowLabel;
        hole.dataset.col    = c;
        hole.dataset.section = section;
        hole.title = `${rowLabel.toUpperCase()}${c + 1}`;
        hole.onclick = () => handleHoleClick(rowLabel, c, hole);
        rowDiv.appendChild(hole);
    }
    rowWrapper.appendChild(rowDiv);

    // Column numbers at row 'a' and 'f' only
    if (rowLabel === 'a' || rowLabel === 'f') {
        const numRow = document.createElement('div');
        numRow.className = 'bb-row bb-col-numbers';
        for (let c = 0; c < BB_COLS; c++) {
            if (c > 0 && c % 5 === 0) {
                const g = document.createElement('div'); g.className = 'bb-gap';
                numRow.appendChild(g);
            }
            const num = document.createElement('span');
            num.className = 'bb-col-num';
            num.textContent = (c % 10 === 0) ? (c + 1) : '';
            numRow.appendChild(num);
        }
        rowWrapper.appendChild(numRow);
    }

    return rowWrapper;
}

/* ─── INTERACTION ────────────────────────────────────── */
function selectBBComp(type) {
    selectedBBComp  = type;
    currentWireSource = null; // Cancel any pending wire
    document.querySelectorAll('.bb-comp-btn').forEach(b => b.classList.remove('active-tool'));
    document.querySelectorAll(`.bb-comp-btn[onclick*="${type}"]`).forEach(b => b.classList.add('active-tool'));
    document.getElementById('bbSelectedComp').innerText = `Selected: ${type.toUpperCase()}`;
    updateBBStatus(`Tool: ${type.toUpperCase()} — Click a hole to place.`);
}

function handleHoleClick(row, col, el) {
    if (!selectedBBComp) return updateBBStatus("⚠ Select a component or wire tool first.");

    if (selectedBBComp === 'wire') {
        handleWireTool(row, col, el);
    } else {
        placeComponent(row, col, el);
    }
}

/* ─── COMPONENT PLACEMENT PHYSICS ───────────────────── */
function placeComponent(row, col, holeEl) {
    const holeId = holeEl.id;
    if (holeEl.classList.contains('occupied')) {
        updateBBStatus(`⚠ Hole ${holeId} is occupied.`);
        return;
    }

    const compDef = getComponentDef(selectedBBComp);
    const pinSpan = compDef.pins; // How many holes the component spans

    // Check all required holes are free
    for (let i = 0; i < pinSpan; i++) {
        const pid = (typeof row === 'string')
            ? `hole-${row}-${parseInt(col) + i}`
            : `rail-${row}-${parseInt(col) + i}`;
        const ph = document.getElementById(pid);
        if (!ph || ph.classList.contains('occupied')) {
            updateBBStatus(`⚠ Not enough free holes at ${holeId}.`);
            return;
        }
    }

    // Mark holes as occupied, render with depth
    const colNum = parseInt(col);
    for (let i = 0; i < pinSpan; i++) {
        const pid = (typeof row === 'string')
            ? `hole-${row}-${colNum + i}`
            : `rail-${row}-${colNum + i}`;
        const ph = document.getElementById(pid);
        if (!ph) continue;
        ph.classList.add('occupied');
        
        if (i === 0) {
            // The body span — elevated above board
            const body = document.createElement('div');
            body.className = `bb-comp-body bb-comp-${selectedBBComp}`;
            body.style.width = `${pinSpan * 22 + (Math.floor(pinSpan / 5)) * 4}px`;
            body.innerHTML   = `<span>${compDef.symbol}</span><small>${compDef.label}</small>`;
            body.title       = `${compDef.label} — Col ${colNum + 1} to ${colNum + pinSpan}`;
            body.onclick     = (e) => { e.stopPropagation(); selectPlacedComp(body, row, colNum); };
            ph.appendChild(body);
        } else {
            // Pin dots at other holes
            const pin = document.createElement('div');
            pin.className = 'bb-comp-pin';
            ph.appendChild(pin);
        }

        // Update electrical net
        const nodeKey = (typeof row === 'string') ? `col-${colNum + i}` : `rail-${row}`;
        if (!netList[nodeKey]) netList[nodeKey] = [];
        netList[nodeKey].push({ type: selectedBBComp, hole: pid });
    }

    placedComponents.push({ type: selectedBBComp, row, col: colNum, pins: pinSpan });
    updateBBStatus(`✓ ${compDef.label} placed at ${holeEl.id.replace('hole-', '').toUpperCase()}`);
    highlightConnectedNodes(row, colNum);
}

function selectPlacedComp(bodyEl, row, col) {
    document.querySelectorAll('.bb-comp-body').forEach(b => b.classList.remove('comp-selected'));
    bodyEl.classList.add('comp-selected');
    const nodeKey = (typeof row === 'string') ? `col-${col}` : `rail-${row}`;
    const connected = netList[nodeKey] || [];
    updateBBStatus(`📌 Selected. Node: ${nodeKey}. Connected components: ${connected.map(n=>n.type).join(', ') || 'None'}`);
}

/* ─── ELECTRICAL CONNECTIVITY ───────────────────────── */
function highlightConnectedNodes(row, col) {
    // Vertical tie-point: all holes in the same column (a-e or f-j) are connected
    if (typeof row === 'string') {
        const section = ['a','b','c','d','e'].includes(row) ? ['a','b','c','d','e'] : ['f','g','h','i','j'];
        section.forEach(r => {
            const h = document.getElementById(`hole-${r}-${col}`);
            if (h) h.classList.add('bb-net-highlight');
        });
        // Remove highlight after 1 second
        setTimeout(() => {
            section.forEach(r => {
                const h = document.getElementById(`hole-${r}-${col}`);
                if (h) h.classList.remove('bb-net-highlight');
            });
        }, 1200);
    }
}

/* ─── WIRE TOOL — MANHATTAN ROUTING ─────────────────── */
function handleWireTool(row, col, el) {
    if (!currentWireSource) {
        currentWireSource = { row, col, el };
        el.classList.add('wire-source');
        updateBBStatus(`📍 Source locked: ${el.id}. Click destination hole.`);
    } else {
        drawManhattanWire(currentWireSource, { row, col, el });
        currentWireSource.el.classList.remove('wire-source');
        currentWireSource = null;
        updateBBStatus("🔗 Wire connected. Select next source or change tool.");
    }
}

function drawManhattanWire(start, end) {
    const sEl = start.el;
    const eEl = end.el;
    if (!bbWireLayer) return;

    const svgRect = bbWireLayer.getBoundingClientRect();
    const sRect   = sEl.getBoundingClientRect();
    const eRect   = eEl.getBoundingClientRect();

    const x1 = sRect.left + sRect.width  / 2 - svgRect.left;
    const y1 = sRect.top  + sRect.height / 2 - svgRect.top;
    const x2 = eRect.left + eRect.width  / 2 - svgRect.left;
    const y2 = eRect.top  + eRect.height / 2 - svgRect.top;

    // Manhattan route: go vertical first, then horizontal
    const midX = x1;
    const midY = y2;

    // Check if this wire crosses any existing wire segment — add jump arc
    const hasCross = wires.some(w => segmentsIntersect(x1, y1, midX, midY, w.x1, w.y1, w.mx, w.my) ||
                                      segmentsIntersect(midX, midY, x2, y2, w.mx, w.my, w.x2, w.y2));

    let d = '';
    if (hasCross) {
        // Add a small arc "jump" over the crossing wire
        const jx = midX;
        const jy = (midY + y1) / 2; // midpoint of vertical segment
        d = `M ${x1} ${y1} L ${jx} ${jy - 6} A 6 6 0 0 1 ${jx} ${jy + 6} L ${midX} ${midY} L ${x2} ${y2}`;
    } else {
        d = `M ${x1} ${y1} L ${midX} ${midY} L ${x2} ${y2}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', getWireColor(wires.length));
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.style.filter = 'drop-shadow(0 0 4px currentColor)';

    // End-point dots
    const dotS = makeDot(x1, y1, path.getAttribute('stroke'));
    const dotE = makeDot(x2, y2, path.getAttribute('stroke'));

    bbWireLayer.appendChild(path);
    bbWireLayer.appendChild(dotS);
    bbWireLayer.appendChild(dotE);

    wires.push({ x1, y1, mx: midX, my: midY, x2, y2, start, end, path });

    // Update electrical net — connect two node groups
    const nodeA = `col-${start.col}`;
    const nodeB = `col-${end.col}`;
    if (!netList[nodeA]) netList[nodeA] = [];
    if (!netList[nodeB]) netList[nodeB] = [];
    netList[nodeA].push({ wire: true, to: nodeB });
}

function makeDot(cx, cy, color) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy);
    c.setAttribute('r', '4'); c.setAttribute('fill', color);
    return c;
}

function getWireColor(idx) {
    const colors = ['#00e5ff','#ff3b30','#30d158','#ffd60a','#bf5af2','#ff9f0a','#64d2ff'];
    return colors[idx % colors.length];
}

/* ─── WIRE CROSSING DETECTION ──────────────────────── */
function segmentsIntersect(ax1,ay1,ax2,ay2, bx1,by1,bx2,by2) {
    const d  = (ax2-ax1)*(by2-by1) - (ay2-ay1)*(bx2-bx1);
    if (d === 0) return false;
    const t = ((bx1-ax1)*(by2-by1) - (by1-ay1)*(bx2-bx1)) / d;
    const u = ((bx1-ax1)*(ay2-ay1) - (by1-ay1)*(ax2-ax1)) / d;
    return t > 0 && t < 1 && u > 0 && u < 1;
}

/* ─── COMPONENT DEFINITIONS ──────────────────────────── */
function getComponentDef(type) {
    const defs = {
        resistor:   { symbol: '⎍',   label: 'R',   pins: 2, color: '#c87941' },
        capacitor:  { symbol: '||',  label: 'C',   pins: 2, color: '#4a90d9' },
        inductor:   { symbol: '∿',   label: 'L',   pins: 2, color: '#7b68ee' },
        led:        { symbol: '▶●', label: 'LED', pins: 2, color: '#30d158' },
        diode:      { symbol: '▶|',  label: 'D',   pins: 2, color: '#ff9f0a' },
        transistor: { symbol: 'NPN', label: 'Q',   pins: 3, color: '#64d2ff' },
        ic:         { symbol: '■■■', label: 'IC',  pins: 8, color: '#1c1c1e' },
    };
    return defs[type] || { symbol: '•', label: type, pins: 1, color: '#fff' };
}

/* ─── POWER ──────────────────────────────────────────── */
function applyBBPower() {
    const v = parseFloat(document.getElementById('bbVoltage')?.value) || 5;
    // Illuminate red rails with glow
    document.querySelectorAll('.rail-top-pos, .rail-bot-pos').forEach(h => {
        h.style.boxShadow = '0 0 8px 2px rgba(255,59,48,0.7)';
        h.style.background = '#3d1a1a';
    });
    document.querySelectorAll('.rail-top-neg, .rail-bot-neg').forEach(h => {
        h.style.boxShadow = '0 0 8px 2px rgba(0,122,255,0.7)';
        h.style.background = '#0a1a2d';
    });
    updateBBStatus(`⚡ Rails energized at ${v}V. VCC = +${v}V, GND = 0V`);
}

/* ─── CLEAR ──────────────────────────────────────────── */
function clearBreadboard() {
    placedComponents = [];
    wires  = [];
    netList = {};
    if (bbWireLayer) bbWireLayer.innerHTML = '';
    // Reset rail colors
    document.querySelectorAll('.rail-hole').forEach(h => {
        h.style.boxShadow = '';
        h.style.background = '';
    });
    buildMB102Board();
    updateBBStatus("Board cleared. Ready for new circuit.");
}

/* ─── STATUS ──────────────────────────────────────────── */
function updateBBStatus(msg) {
    const st = document.getElementById('bbStatus');
    if (st) st.innerText = `Status: ${msg}`;
}
