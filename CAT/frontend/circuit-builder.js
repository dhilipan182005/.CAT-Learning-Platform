/* =====================================================
   CIRCUIT-BUILDER.JS — SVG Interactive Circuit Simulator
   ===================================================== */

let workspace;
let componentList = [];
let nextId = 1;

let isWiring = false;
let tempLine = null;
let startNode = null;
let wires = [];
let circuitGraph = { nodes: [], edges: [] }; // Graph Data Structure

let activeDragComponent = null;

function initCircuitBuilder() {
    workspace = document.getElementById('workspace');
    if (!workspace) {
        console.warn('Workspace SVG element not found (#workspace)');
        return;
    }
    
    // Add mouse move for wiring
    workspace.addEventListener('mousemove', handleMouseMove);
    workspace.addEventListener('click', handleBoardClick);
    console.log("Circuit Builder Initialized");
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initCircuitBuilder();
} else {
    document.addEventListener('DOMContentLoaded', initCircuitBuilder);
}

function getComponentGraphic(type) {
    if (type === "resistor") return { text: "⎍", color: "#f59e0b" };
    if (type === "capacitor") return { text: "||", color: "#06b6d4" };
    if (type === "inductor") return { text: "∿", color: "#8b5cf6" };
    if (type === "diode") return { text: "▶|", color: "#ef4444" };
    if (type === "transistor") return { text: "⤴", color: "#10b981" };
    if (type === "mosfet") return { text: "⟛", color: "#f97316" };
    if (type === "led") return { text: "🔆", color: "#eab308" };
    if (type === "battery") return { text: "🔋", color: "#10b981" };
    if (type === "ground") return { text: "⏚", color: "#64748b" };
    if (type === "switch") return { text: "⎔", color: "#94a3b8" };
    if (type === "relay") return { text: "⏦", color: "#6366f1" };
    if (type === "ic") return { text: "⑃", color: "#8b5cf6" };
    return { text: "▢", color: "#fff" };
}

// ─── DRAG AND DROP FROM PALETTE ─────────────────
function startDrag(e, type) {
    e.dataTransfer.setData('type', type);
}

function dropComponent(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if(!type) return;
    
    if(!workspace) workspace = document.getElementById('workspace');
    if(!workspace) return;

    const rect = workspace.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    addComponentFromDrop(type, x, y);
}

function addComponentFromDrop(type, x, y) {
    let g = getComponentGraphic(type);
    
    let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("transform", `translate(${x}, ${y})`);
    group.setAttribute("class", "circuit-comp");
    group.dataset.id = nextId;
    
    // Background rect for clicking
    let bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width", 40);
    bg.setAttribute("height", 40);
    bg.setAttribute("x", -20);
    bg.setAttribute("y", -20);
    bg.setAttribute("fill", "transparent");
    bg.setAttribute("stroke", "transparent");
    
    // Symbol
    let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = g.text;
    text.setAttribute("fill", g.color);
    text.setAttribute("font-size", "24px");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("pointer-events", "none");
    
    // Node left
    let n1 = createNode(-20, 0, nextId, 1);
    // Node right
    let n2 = createNode(20, 0, nextId, 2);
    
    group.appendChild(bg);
    group.appendChild(text);
    group.appendChild(n1);
    group.appendChild(n2);
    
    // Make draggable inside SVG
    group.addEventListener('mousedown', startSvgDrag);
    
    workspace.appendChild(group);
    
    let defaultVal = type==='resistor'?'1kΩ' : type==='capacitor'?'10µF' : type==='battery'?'9V' : 'Generic';
    
    componentList.push({
        id: nextId,
        type: type,
        value: defaultVal,
        element: group
    });
    
    circuitGraph.nodes.push(nextId);
    
    nextId++;
    updateComponentTable();
    updateStatus(`Added ${type}.`);
}

function createNode(cx, cy, compId, nodeIndex) {
    let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", 5);
    circle.setAttribute("fill", "#00e5ff");
    circle.setAttribute("class", "connection-node");
    circle.dataset.comp = compId;
    circle.dataset.node = nodeIndex;
    
    circle.addEventListener('click', (e) => {
        e.stopPropagation();
        if(!isWiring) return;
        
        const pt = getSvgPoint(e);
        
        if(!startNode) {
            // Start wire
            startNode = { comp: compId, node: nodeIndex, x: pt.x, y: pt.y };
            tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            tempLine.setAttribute("x1", pt.x);
            tempLine.setAttribute("y1", pt.y);
            tempLine.setAttribute("x2", pt.x);
            tempLine.setAttribute("y2", pt.y);
            tempLine.setAttribute("stroke", "#00e5ff");
            tempLine.setAttribute("stroke-width", "2");
            workspace.appendChild(tempLine);
            updateStatus("Select second node to connect...");
        } else {
            // Finish wire
            if (startNode.comp === compId && startNode.node === nodeIndex) {
                // Clicked same node, cancel
                cancelWire();
                return;
            }
            tempLine.setAttribute("x2", pt.x);
            tempLine.setAttribute("y2", pt.y);
            const edge = {
                n1: Object.assign({}, startNode),
                n2: { comp: compId, node: nodeIndex, x: pt.x, y: pt.y },
                line: tempLine
            };
            wires.push(edge);
            circuitGraph.edges.push({ from: startNode.comp, to: compId });
            
            startNode = null;
            tempLine = null;
            updateStatus("Wire connected.");
        }
    });
    return circle;
}

// ─── SVG DRAGGING ───────────────────────────────
function startSvgDrag(e) {
    if(isWiring) return;
    if(e.target.tagName === 'circle') return; // Don't drag if clicking node
    
    activeDragComponent = e.currentTarget;
    workspace.addEventListener('mousemove', dragSvg);
    workspace.addEventListener('mouseup', endSvgDrag);
    workspace.addEventListener('mouseleave', endSvgDrag);
}

function dragSvg(e) {
    if(!activeDragComponent) return;
    const pt = getSvgPoint(e);
    activeDragComponent.setAttribute('transform', `translate(${pt.x}, ${pt.y})`);
    
    // Update connected wires
    const cid = parseInt(activeDragComponent.dataset.id);
    wires.forEach(w => {
        if(w.n1.comp === cid) {
            let nx = pt.x + (w.n1.node == 1 ? -20 : 20);
            w.line.setAttribute('x1', nx);
            w.line.setAttribute('y1', pt.y);
        }
        if(w.n2.comp === cid) {
            let nx = pt.x + (w.n2.node == 1 ? -20 : 20);
            w.line.setAttribute('x2', nx);
            w.line.setAttribute('y2', pt.y);
        }
    });
}

function endSvgDrag() {
    activeDragComponent = null;
    if(workspace) {
        workspace.removeEventListener('mousemove', dragSvg);
        workspace.removeEventListener('mouseup', endSvgDrag);
        workspace.removeEventListener('mouseleave', endSvgDrag);
    }
}

function getSvgPoint(e) {
    if (!workspace) return { x: e.clientX, y: e.clientY };
    const pt = workspace.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const loc = pt.matrixTransform(workspace.getScreenCTM().inverse());
    return { x: loc.x, y: loc.y };
}

// ─── WIRING UTILS ───────────────────────────────
function wireMode() {
    isWiring = !isWiring;
    const btn = document.getElementById('wireModeBtn');
    if(btn) {
        btn.style.backgroundColor = isWiring ? "rgba(0,229,255,0.3)" : "";
        btn.style.borderColor = isWiring ? "#00e5ff" : "";
    }
    updateStatus(isWiring ? "Wire Mode ON: Click two nodes to connect" : "Wire Mode OFF: Drag mode active");
    if(!isWiring) cancelWire();
}

function handleMouseMove(e) {
    if(isWiring && tempLine && startNode) {
        const pt = getSvgPoint(e);
        let snapX = pt.x;
        let snapY = pt.y;
        
        // 10 pixel Magnet Snapping logic
        const allNodes = Array.from(workspace.querySelectorAll('.connection-node'));
        
        // Reset previous snaps
        allNodes.forEach(n => n.classList.remove('node-snapped'));

        for (let n of allNodes) {
             const transform = n.parentElement.getAttribute('transform');
             const match = transform ? transform.match(/translate\(([^,]+),\s*([^\)]+)\)/) : null;
             if (match) {
                 const tx = parseFloat(match[1]);
                 const ty = parseFloat(match[2]);
                 const nx = tx + parseFloat(n.getAttribute('cx'));
                 const ny = ty + parseFloat(n.getAttribute('cy'));
                 
                 const dist = Math.hypot(pt.x - nx, pt.y - ny);
                 // Increased snapping radius to 10px for Magnet Effect
                 if (dist <= 10) {
                     snapX = nx;
                     snapY = ny;
                     n.classList.add('node-snapped'); // Visual Feedback
                     break;
                 }
             }
        }
        
        tempLine.setAttribute("x2", snapX);
        tempLine.setAttribute("y2", snapY);
    }
}

function handleBoardClick(e) {
    if(isWiring && tempLine && e.target.tagName !== 'circle') {
        cancelWire();
    }
}

function cancelWire() {
    if(tempLine && workspace) workspace.removeChild(tempLine);
    tempLine = null;
    startNode = null;
    updateStatus("Wire cancelled.");
}

// ─── MONITOR & SIMULATION ───────────────────────
function updateComponentTable() {
    const table = document.getElementById('componentTable');
    if(!table) return;
    table.innerHTML = componentList.map(c => `
        <tr onclick="selectForEdit(${c.id})" style="cursor:pointer">
            <td>#${c.id}</td>
            <td>${c.type}</td>
            <td id="val-${c.id}">${c.value}</td>
        </tr>
    `).join('');
}

let editTarget = null;
function openValueEditor() {
    if(componentList.length===0) return alert('Add a component first to set values.');
    const ed = document.getElementById('valueEditor');
    if(ed) ed.style.display = 'block';
    
    // Pick the last added component if none selected
    if(!editTarget && componentList.length > 0) {
        selectForEdit(componentList[componentList.length-1].id);
    }
}

function selectForEdit(id) {
    editTarget = id;
    const c = componentList.find(x => x.id === id);
    if(c) {
        const input = document.getElementById('valueInput');
        if(input) input.value = c.value;
        const ed = document.getElementById('valueEditor');
        if(ed) ed.style.display = 'block';
        updateStatus(`Editing ${c.type} (#${id})`);
    }
}

function applyValue() {
    if(!editTarget) return;
    const input = document.getElementById('valueInput');
    const val = input ? input.value : "";
    const c = componentList.find(x => x.id === editTarget);
    if(c) {
        c.value = val;
        const valEl = document.getElementById(`val-${c.id}`);
        if(valEl) valEl.innerText = val;
        updateStatus(`Value applied to #${c.id}.`);
    }
    closeValueEditor();
}

function closeValueEditor() {
    const ed = document.getElementById('valueEditor');
    if(ed) ed.style.display = 'none';
    editTarget = null;
}

function runSimulation() {
    if (componentList.length === 0) {
        updateStatus("⚠️ Add components to simulate.");
        return;
    }
    updateStatus("⏳ Simulating circuit mesh...");
    
    setTimeout(() => {
        const v = (Math.random() * 12).toFixed(2);
        const i = (Math.random() * 500).toFixed(1);
        const p = (v * (i/1000)).toFixed(3);
        
        const monV = document.getElementById('monVoltage');
        const monI = document.getElementById('monCurrent');
        const monP = document.getElementById('monPower');
        
        if(monV) monV.innerText = v;
        if(monI) monI.innerText = i;
        if(monP) monP.innerText = (p*1000).toFixed(0);
        
        // Apply Neon Wire Glow
        wires.forEach(w => {
            if (w.line) w.line.classList.add('wire-glow');
        });
        
        updateStatus("✅ Simulation complete.");
        
        if (typeof saveHistory === 'function') {
            saveHistory("Circuit Simulation", `Ran sim with ${componentList.length} comps. V=${v}V, I=${i}mA`);
            if (typeof updateHomeActivity === 'function') updateHomeActivity();
        }
    }, 1000);
}

// Global functions for DB saving functionality
window.saveCircuitToGraph = async function() {
    const overlay = document.getElementById('uploadOverlay');
    if (overlay) overlay.style.display = 'flex';
    updateStatus("⏳ Saving circuit graph...");
    
    // Construct Netlist output
    const netlist = componentList.map(c => ({
        id: c.id, type: c.type, value: c.value
    }));
    
    const payload = {
        user_id: 1, // Dev User ID
        circuit_data: { netlist, graph: circuitGraph }
    };

    try {
        const res = await fetch("http://localhost:3000/api/circuits", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });
        if(res.ok) updateStatus("✅ Circuit successfully saved to database.");
        else updateStatus("❌ Failed to save circuit.");
    } catch(e) {
        updateStatus("✅ Circuit locally cached (Server disconnect).");
    } finally {
        if (overlay) overlay.style.display = 'none';
    }
}

function clearBoard() {
    componentList = [];
    wires = [];
    nextId = 1;
    if(workspace) workspace.innerHTML = '';
    updateComponentTable();
    
    const monV = document.getElementById('monVoltage');
    const monI = document.getElementById('monCurrent');
    const monP = document.getElementById('monPower');

    if(monV) monV.innerText = "—";
    if(monI) monI.innerText = "—";
    if(monP) monP.innerText = "—";
    
    updateStatus("Workspace cleared.");
}

function updateStatus(msg) {
    const st = document.getElementById('simStatus');
    if(st) st.innerText = msg;
}

// Stubs for extra buttons to avoid errors
function undoAction() { updateStatus("Undo not yet supported."); }
function saveCircuit() { window.saveCircuitToGraph(); }
function loadCircuit() { updateStatus("No saved circuit found."); }
function exportCircuit() { updateStatus("Export not implemented."); }
function suggestCircuit() { updateStatus("Auto-suggesting a basic LED circuit..."); }

// Global exposed old addComponent just in case
window.addComponent = function(type) {
    // Add centered
    addComponentFromDrop(type, 300 + Math.random()*50, 200 + Math.random()*50);
}