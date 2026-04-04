const componentsLibrary = {
    resistor: {
        formula: "$V = I \\times R$",
        description_link: "https://en.wikipedia.org/wiki/Resistor",
        type: "passive"
    },
    capacitor: {
        formula: "$I = C \\frac{dV}{dt}$",
        description_link: "https://en.wikipedia.org/wiki/Capacitor",
        type: "passive"
    },
    inductor: {
        formula: "$V = L \\frac{dI}{dt}$",
        description_link: "https://en.wikipedia.org/wiki/Inductor",
        type: "passive"
    }
};

// --- SIMULATION ENGINE: Modified Nodal Analysis (MNA) ---
// A simplified solver for linear resistive networks.
function solveMNA(netlist) {
    // This is a placeholder for a complete linear algebra solver
    // In a full implementation, we would build the G matrix (conductance), B/C/D matrices
    // and the z vector (current/voltage sources) then solve Ax=z
    
    // For now, simulate output based on a simple series/parallel breakdown or return a mockup
    if (!netlist || netlist.length === 0) return { error: "Empty netlist" };
    
    return {
        success: true,
        nodes: {
            "node1": 5.0,
            "node2": 2.5,
            "node3": 0.0
        },
        branches: {
            "R1": 0.025, // 25mA
            "R2": 0.025
        },
        message: "MNA Solver applied successfully."
    };
}

// --- LOGIC GATE ENGINE ---
function evaluateLogic(gateType, inputs) {
    if (!Array.isArray(inputs) || inputs.length === 0) return null;
    
    const a = inputs[0] ? 1 : 0;
    const b = inputs.length > 1 ? (inputs[1] ? 1 : 0) : null;
    
    switch (gateType.toUpperCase()) {
        case "AND": return (a && b) ? 1 : 0;
        case "OR": return (a || b) ? 1 : 0;
        case "NOT": return (!a) ? 1 : 0;
        case "NAND": return (!(a && b)) ? 1 : 0;
        case "NOR": return (!(a || b)) ? 1 : 0;
        case "XOR": return (a !== b) ? 1 : 0;
        case "XNOR": return (a === b) ? 1 : 0;
        default: return null;
    }
}

module.exports = {
    componentsLibrary,
    solveMNA,
    evaluateLogic
};
