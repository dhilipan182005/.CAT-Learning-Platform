/* =====================================================
   ANALYSIS.JS — All Calculators + KVL/KCL/K-Map/Heat
   ===================================================== */

// --- History Tracker ---
function saveHistory(type, result) {
    let history = JSON.parse(localStorage.getItem('catHistory') || '[]');
    history.unshift({
        id: Date.now().toString().slice(-6),
        type: type,
        result: result,
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    });
    if (history.length > 50) history.pop();
    localStorage.setItem('catHistory', JSON.stringify(history));
}

function showResult(id, text, isError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? '#ef4444' : '#a8ff78';
}

// --- Basic Calculators ---

function calcCurrent() {
    let V = parseFloat(document.getElementById("v_i").value);
    let R = parseFloat(document.getElementById("r_i").value);
    if (isNaN(V) || isNaN(R) || R === 0) return showResult("currentResult", "Enter valid V and R (R ≠ 0)", true);
    let I = V / R;
    let txt = `I = ${V}V ÷ ${R}Ω = ${I.toFixed(4)} A`;
    showResult("currentResult", txt);
    saveHistory("Current Calc", txt);
}

function calcVoltage() {
    let I = parseFloat(document.getElementById("i_v").value);
    let R = parseFloat(document.getElementById("r_v").value);
    if (isNaN(I) || isNaN(R)) return showResult("voltageResult", "Enter valid I and R", true);
    let V = I * R;
    let txt = `V = ${I}A × ${R}Ω = ${V.toFixed(4)} V`;
    showResult("voltageResult", txt);
    saveHistory("Voltage Calc", txt);
}

function calcResistance() {
    let V = parseFloat(document.getElementById("v_r").value);
    let I = parseFloat(document.getElementById("i_r").value);
    if (isNaN(V) || isNaN(I) || I === 0) return showResult("resistanceResult", "Enter valid V and I (I ≠ 0)", true);
    let R = V / I;
    let txt = `R = ${V}V ÷ ${I}A = ${R.toFixed(4)} Ω`;
    showResult("resistanceResult", txt);
    saveHistory("Resistance Calc", txt);
}

function calcPower() {
    let V = parseFloat(document.getElementById("v_p").value);
    let I = parseFloat(document.getElementById("i_p").value);
    if (isNaN(V) || isNaN(I)) return showResult("powerResult", "Enter valid V and I", true);
    let P = V * I;
    let txt = `P = ${V}V × ${I}A = ${P.toFixed(4)} W`;
    showResult("powerResult", txt);
    saveHistory("Power Calc", txt);
}

function ohmCalc() {
    let V = parseFloat(document.getElementById("voltage").value);
    let R = parseFloat(document.getElementById("resistance").value);
    if (isNaN(V) || isNaN(R) || R === 0) return showResult("ohmResult", "Enter valid V and R (R ≠ 0)", true);
    let I = V / R;
    let P = V * I;
    let txt = `I = ${I.toFixed(4)} A | P = ${P.toFixed(4)} W`;
    showResult("ohmResult", txt);
    saveHistory("Ohm's Law", txt);
}

function seriesRes() {
    let input = document.getElementById("seriesR").value.split(",");
    let total = 0;
    input.forEach(r => { let v = parseFloat(r); if (!isNaN(v)) total += v; });
    let txt = `R_total = ${total.toFixed(4)} Ω`;
    showResult("seriesResult", txt);
    saveHistory("Series Resistance", txt);
}

function parallelRes() {
    let input = document.getElementById("parallelR").value.split(",");
    let sum = 0;
    input.forEach(r => { let v = parseFloat(r); if (!isNaN(v) && v !== 0) sum += 1 / v; });
    if (sum === 0) return showResult("parallelResult", "No valid resistances", true);
    let txt = `R_eq = ${(1 / sum).toFixed(4)} Ω`;
    showResult("parallelResult", txt);
    saveHistory("Parallel Resistance", txt);
}

function calcXL() {
    let f = parseFloat(document.getElementById("freq_l").value);
    let L = parseFloat(document.getElementById("inductance").value);
    if (isNaN(f) || isNaN(L)) return showResult("xlResult", "Enter valid f and L", true);
    let XL = 2 * Math.PI * f * L;
    let txt = `XL = 2π × ${f}Hz × ${L}H = ${XL.toFixed(4)} Ω`;
    showResult("xlResult", txt);
    saveHistory("Inductive Reactance", txt);
}

function calcXC() {
    let f = parseFloat(document.getElementById("freq_c").value);
    let C = parseFloat(document.getElementById("capacitance").value);
    if (isNaN(f) || isNaN(C) || f === 0 || C === 0) return showResult("xcResult", "Enter valid f and C", true);
    let XC = 1 / (2 * Math.PI * f * C);
    let txt = `XC = 1/(2π × ${f} × ${C}) = ${XC.toFixed(4)} Ω`;
    showResult("xcResult", txt);
    saveHistory("Capacitive Reactance", txt);
}

function calcZ() {
    let R = parseFloat(document.getElementById("res_z").value);
    let X = parseFloat(document.getElementById("react_z").value);
    if (isNaN(R) || isNaN(X)) return showResult("zResult", "Enter valid R and X", true);
    let Z = Math.sqrt(R * R + X * X);
    let angle = Math.atan2(X, R) * 180 / Math.PI;
    let txt = `Z = √(${R}² + ${X}²) = ${Z.toFixed(4)} Ω ∠${angle.toFixed(1)}°`;
    showResult("zResult", txt);
    saveHistory("Impedance Calc", txt);
}

function rlcCalc() {
    let R = parseFloat(document.getElementById("rlcR").value);
    let L = parseFloat(document.getElementById("rlcL").value);
    let C = parseFloat(document.getElementById("rlcC").value);
    let f = parseFloat(document.getElementById("rlcF").value);
    if (isNaN(R) || isNaN(L) || isNaN(C) || isNaN(f)) return showResult("rlcResult", "Enter all 4 values", true);
    let XL  = 2 * Math.PI * f * L;
    let XC  = 1 / (2 * Math.PI * f * C);
    let Z   = Math.sqrt(R * R + (XL - XC) ** 2);
    let fr  = 1 / (2 * Math.PI * Math.sqrt(L * C));
    let txt = `Z = ${Z.toFixed(4)} Ω | XL=${XL.toFixed(2)} Ω | XC=${XC.toFixed(2)} Ω | f₀=${fr.toFixed(2)} Hz`;
    showResult("rlcResult", txt);
    saveHistory("RLC Impedance", txt);
}

// --- KVL Solver (Step-by-step) ---
function solveKVL() {
    const raw   = document.getElementById("kvlInput").value;
    const vals  = raw.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (vals.length === 0) return showResult("kvlResult", "Enter comma-separated voltages e.g. 12,-5,-7", true);
    const sum   = vals.reduce((a, b) => a + b, 0);
    const steps = vals.map((v, i) => `V${i + 1}=${v}V`).join(' + ');
    const balanced = Math.abs(sum) < 0.001;
    const txt = `${steps} = ${sum.toFixed(4)}V  →  ${balanced ? '✅ KVL Satisfied (loop balanced)' : `⚠️ Imbalance: ${sum.toFixed(4)}V`}`;
    showResult("kvlResult", txt);
    saveHistory("KVL Solver", `Sum = ${sum.toFixed(4)}V — ${balanced ? 'Balanced' : 'Unbalanced'}`);
}

// --- KCL Solver (Step-by-step) ---
function solveKCL() {
    const raw    = document.getElementById("kclInput").value;
    const vals   = raw.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    if (vals.length === 0) return showResult("kclResult", "Enter currents e.g. 2,3,-5 (+in, -out)", true);
    const sum    = vals.reduce((a, b) => a + b, 0);
    const steps  = vals.map((v, i) => `I${i + 1}=${v}A`).join(' + ');
    const balanced = Math.abs(sum) < 0.001;
    const txt = `${steps} = ${sum.toFixed(4)}A  →  ${balanced ? '✅ KCL Satisfied (node balanced)' : `⚠️ Imbalance: ${sum.toFixed(4)}A. Check node connections.`}`;
    showResult("kclResult", txt);
    saveHistory("KCL Solver", `Sum = ${sum.toFixed(4)}A — ${balanced ? 'Balanced' : 'Unbalanced'}`);
}

// --- Logic Gate Simulator ---
function logicSim() {
    let gate = document.getElementById("logicGate").value;
    let a    = parseInt(document.getElementById("logicA").value) > 0 ? 1 : 0;
    let b    = parseInt(document.getElementById("logicB").value) > 0 ? 1 : 0;
    let res  = 0;
    switch (gate) {
        case 'AND':  res = a & b; break;
        case 'OR':   res = a | b; break;
        case 'NOT':  res = a === 0 ? 1 : 0; break;
        case 'NAND': res = !(a & b) ? 1 : 0; break;
        case 'NOR':  res = !(a | b) ? 1 : 0; break;
        case 'XOR':  res = a ^ b; break;
        case 'XNOR': res = (a ^ b) === 0 ? 1 : 0; break;
    }
    let txt = `${gate}(${a}, ${gate !== 'NOT' ? b : ''}) = ${res}  [${res === 1 ? 'HIGH ✓' : 'LOW ✗'}]`;
    showResult("logicResult", txt);
    saveHistory("Logic Gate", txt);
}

// --- Boolean / K-Map Simplifier ---
function simplifyBoolean() {
    const expr = document.getElementById("kmapInput")?.value?.trim();
    if (!expr) return showResult("kmapResult", "Enter a Boolean expression", true);

    // Tokenize and simplify common rules
    let simplified = expr.trim();

    // Apply basic identities
    simplified = simplified
        .replace(/\bA\.A\b/gi, 'A')
        .replace(/\bA\+A\b/gi, 'A')
        .replace(/\bA\.0\b|\b0\.A\b/gi, '0')
        .replace(/\bA\.1\b|\b1\.A\b/gi, 'A')
        .replace(/\bA\+0\b|\b0\+A\b/gi, 'A')
        .replace(/\bA\+1\b|\b1\+A\b/gi, '1')
        // Double negation: A'' = A
        .replace(/''|!!/g, '')
        // De Morgan hints
        .replace(/!(A\.B)/gi, "A'+B'")
        .replace(/!(A\+B)/gi, "A'.B'");

    // Generate truth table for 2-variable expressions
    let tableHTML = '';
    const hasA = /\bA\b/i.test(expr);
    const hasB = /\bB\b/i.test(expr);
    if (hasA && hasB) {
        const combos = [[0,0],[0,1],[1,0],[1,1]];
        tableHTML = `<table style="margin-top:10px;border-collapse:collapse;font-size:13px;width:100%">
          <thead><tr><th>A</th><th>B</th><th>Output</th></tr></thead><tbody>`;
        combos.forEach(([a, b]) => {
            let eval_expr = expr
                .replace(/A'/gi, `(${1-a})`).replace(/B'/gi, `(${1-b})`)
                .replace(/A/gi, a).replace(/B/gi, b)
                .replace(/\./g, '&&').replace(/\+/g, '||').replace(/!/g, '!');
            let out = 0;
            try { out = eval(eval_expr) ? 1 : 0; } catch(e) { out = '?'; }
            tableHTML += `<tr style="text-align:center"><td>${a}</td><td>${b}</td><td>${out}</td></tr>`;
        });
        tableHTML += `</tbody></table>`;
    }

    const resultEl = document.getElementById("kmapResult");
    if (resultEl) {
        resultEl.innerHTML = `<span style="color:#a8ff78">Simplified: <strong>${simplified}</strong></span>${tableHTML}`;
    }
    saveHistory("K-Map Simplifier", `${expr} → ${simplified}`);
}

// --- Heat Dissipation Calculator ---
function calcHeatDissipation() {
    const P    = parseFloat(document.getElementById("heatPower")?.value);
    const area = parseFloat(document.getElementById("heatArea")?.value);
    const Ta   = parseFloat(document.getElementById("heatAmbient")?.value) || 25;
    if (isNaN(P) || isNaN(area)) return showResult("heatResult", "Enter Power (W) and Area (cm²)", true);

    // Thermal resistance for natural convection ≈ 50°C/W per 10 cm²
    const Rth  = 50 / area;         // °C/W
    const Tjun = Ta + P * Rth;      // Junction temperature
    const Pdiss = P;
    const heat_flux = (P / area * 10000).toFixed(2); // W/m²

    const txt = `P=${P}W | Area=${area}cm² | Rth≈${Rth.toFixed(2)}°C/W | ΔT=${(P*Rth).toFixed(1)}°C | T_junction≈${Tjun.toFixed(1)}°C | Heat Flux=${heat_flux} W/m²`;
    showResult("heatResult", txt);
    saveHistory("Heat Dissipation", `P=${P}W, Area=${area}cm², T_j≈${Tjun.toFixed(1)}°C`);
}

// --- Oscilloscope Viewer & Simulation State ---
let simState = 'stopped';
let simOffset = 0;
let simInterval = null;

function toggleSimState(state) {
    simState = state;
    document.querySelectorAll('.btn-sim-control').forEach(b => b.classList.remove('active'));
    
    if (state === 'play') {
        document.getElementById('simPlay').classList.add('active');
        if (!simInterval) startWaveAnimation();
    } else if (state === 'pause') {
        document.getElementById('simPause').classList.add('active');
    } else {
        document.getElementById('simStop').classList.add('active');
        simOffset = 0;
        const canvas = document.getElementById("scope");
        if (canvas) canvas.getContext("2d").clearRect(0,0, canvas.width, canvas.height);
    }
}

function startWaveAnimation() {
    function animate() {
        if (simState === 'stopped') {
            simInterval = null;
            return;
        }
        if (simState === 'play') {
            simOffset += 0.1;
            drawWave();
        }
        requestAnimationFrame(animate);
    }
    simInterval = true;
    animate();
}

function drawWave() {
    const canvas = document.getElementById("scope");
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const freq = parseFloat(document.getElementById("oscFreq").value) || 1;
    const amp  = parseFloat(document.getElementById("oscAmp").value) || 1;
    const type = document.getElementById("signalType")?.value || "Sine";

    if (canvas.width !== canvas.offsetWidth) canvas.width = canvas.offsetWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Grid
    ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
    ctx.lineWidth   = 1;
    const W = canvas.width, H = canvas.height, cx = H / 2;
    for (let i = 0; i <= 10; i++) {
        ctx.beginPath(); ctx.moveTo(W * i / 10, 0); ctx.lineTo(W * i / 10, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, H * i / 10); ctx.lineTo(W, H * i / 10); ctx.stroke();
    }

    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth   = 2;
    ctx.shadowBlur  = 10;
    ctx.shadowColor = "#00e5ff";

    ctx.beginPath();
    for (let x = 0; x < W; x++) {
        const t = (x / W * 4 * Math.PI) + (simState !== 'stopped' ? simOffset : 0);
        let y = 0;
        if (type === "Sine")     y = Math.sin(freq * t) * amp;
        if (type === "Square")   y = Math.sign(Math.sin(freq * t)) * amp;
        if (type === "Triangle") y = (2 / Math.PI) * Math.asin(Math.sin(freq * t)) * amp;
        const py = cx - y * (H / 2 - 20);
        x === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function generateSignal() {
    const canvas = document.getElementById("signalCanvas");
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const freq = parseFloat(document.getElementById("signalFreq").value) || 1;
    const amp  = parseFloat(document.getElementById("signalAmp").value) || 1;

    canvas.width = canvas.offsetWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth   = 2;
    const W = canvas.width, H = canvas.height, cx = H / 2;

    ctx.beginPath();
    for (let x = 0; x < W; x++) {
        const t  = x / W * 4 * Math.PI;
        const y  = Math.sin(freq * t) * Math.min(amp, 1);
        const py = cx - y * (H / 2 - 4);
        x === 0 ? ctx.moveTo(x, py) : ctx.lineTo(x, py);
    }
    ctx.stroke();
}

// --- Analysis Report PDF ---
function downloadOhmReport() {
    if (typeof downloadCircuitPDF === 'function') {
        downloadCircuitPDF();
    }
}
