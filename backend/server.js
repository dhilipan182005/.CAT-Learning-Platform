const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const http = require("http");
const WebSocket = require("ws");

// Import newly refactored modules
const { runQuery } = require("./dbConfig");
const authController = require("./authController");
const { solveMNA } = require("./simulation");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
// 50mb limit for heavy JSON payloads
app.use(express.json({ limit: "50mb" }));

// --- SECURITY: Editor-Only Access Endpoint ---
app.get("/api/admin/login-history", authController.verifyEditor, authController.getLoginHistory);

// --- Profile & Database Upgrade: About Developer ---
app.get("/api/about", (req, res) => {
    res.json({
        success: true,
        data: {
            name: "Dhilipan S",
            email: "dhilipan1804@outlook.in",
            linkedin: "https://www.linkedin.com/in/dhilipan-s"
        }
    });
});

// --- IoT WebSockets ---
wss.on("connection", (ws) => {
    console.log("IoT Device Connected via WS");
    ws.on("message", (msg) => {
        console.log("Received Telemetry:", msg.toString());
        // Broadcast to clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(msg.toString());
            }
        });
    });
});

// --- AUTHENTICATION ROUTES ---
app.post("/login", authController.login);
app.post("/register", authController.register);

// --- CIRCUIT DB SAVING (System Stability & Lean JSON) ---
app.post("/api/circuits", authController.verifyToken, async (req, res) => {
    try {
        const { user_id, circuit_data } = req.body;
        
        // --- LEAN JSON OPTIMIZATION ---
        // We strip redundant fields to sync breadboard/scope states without bloat
        let leanData = { ...circuit_data };
        if (leanData.breadboard && leanData.breadboard.components) {
            leanData.breadboard.components = leanData.breadboard.components.map(c => ({
                t: c.type, r: c.row, c: c.col // Minified keys for high performance save
            }));
        }

        await runQuery("INSERT INTO circuits (user_id, circuit_data) VALUES (?, ?)", [user_id, JSON.stringify(leanData)]);
        
        res.status(200).json({ success: true, status: "complete", message: "Lean Circuit Data Saved" });
    } catch (e) {
        console.error("Save Error:", e);
        res.status(500).json({ success: false, status: "error", message: "Database Save Failed" });
    }
});

app.get("/api/circuits/:user_id", authController.verifyToken, async (req, res) => {
    try {
        const results = await runQuery("SELECT * FROM circuits WHERE user_id = ?", [req.params.user_id]);
        res.json({ success: true, circuits: results });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

// --- Analytics: 'A-to-Z' PDF Generation Engine ---
app.post("/generate-report", (req, res) => {
    const { circuit_data } = req.body;
    
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-disposition", "attachment; filename=circuit-analysis.pdf");
    res.setHeader("Content-type", "application/pdf");
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text("Analysis Report by Dhilipan S", { align: "center", underline: true });
    doc.moveDown(2);
    
    // Step-by-Step KVL/KCL Matrix Show
    doc.fontSize(16).text("Step-by-Step Nodal Analysis (KVL/KCL):");
    doc.moveDown();
    doc.fontSize(12).text("Matrix computations used to find Node Voltages (Vn):");
    doc.moveDown();
    
    doc.font('Courier').fontSize(12);
    doc.text("[ G11  G12  G13 ] [ V1 ]   [ I1 ]");
    doc.text("[ G21  G22  G23 ] [ V2 ] = [ I2 ]");
    doc.text("[ G31  G32  G33 ] [ V3 ]   [ I3 ]");
    doc.font('Helvetica').moveDown(2);
    
    // Formula References (LaTeX rendering equivalent)
    doc.fontSize(14).text("Formula References:");
    doc.moveDown();
    doc.fontSize(12).text("Kirchhoff's Current Law Node Equation:", { underline: true });
    doc.text("V_n = ∑ (I × R) / G_total");
    doc.moveDown();
    doc.text("Branch Current Evaluation:", { underline: true });
    doc.text("I_b = (V_a - V_b) / R");
    doc.moveDown(2);
    
    if (circuit_data) {
        doc.fontSize(14).text("Circuit Netlist:");
        doc.fontSize(12).text(JSON.stringify(circuit_data, null, 2));
    }
    
    // Evaluate through MNA logic gates
    if (circuit_data && circuit_data.components) {
        const mnaResult = solveMNA(circuit_data);
        doc.moveDown();
        doc.fontSize(14).text("Simulation Results (Node Voltages & Branch Currents):");
        doc.fontSize(12).text(JSON.stringify(mnaResult, null, 2));
    }
    
    doc.end();
});

// Map legacy download-pdf to generate-report
app.post("/download-pdf", (req, res) => {
    req.url = '/generate-report';
    app.handle(req, res);
});

// START SERVER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});