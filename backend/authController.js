const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { runQuery } = require("./dbConfig");

const JWT_SECRET = process.env.JWT_SECRET || "cat_super_secret_key_2026"; // In prod, use environment variables

// --- AUTHENTICATION ---
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const results = await runQuery("SELECT * FROM users WHERE username = ?", [username]);
        if (results.length === 0) {
            return res.json({ success: false, message: "User not found" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (match) {
            // Generate JWT Token
            const token = jwt.sign(
                { id: user.user_id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            // Asynchronous Logging - Does not await to ensure 'Zero-Lag' login response
            runQuery("INSERT INTO login_history (user_id, status) VALUES (?, ?)", [user.user_id, 'success'])
                .catch(err => console.error("Async Log Error:", err));

            res.json({ 
                success: true, 
                token: token,
                user: { user_id: user.user_id, username: user.username, role: user.role } 
            });
        } else {
            // Log failure asynchronously if we wanted to later
            res.json({ success: false, message: "Invalid password" });
        }
    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if exists
        const existing = await runQuery("SELECT user_id FROM users WHERE username = ?", [username]);
        if (existing.length > 0) {
            return res.json({ success: false, message: "Username already exists" });
        }

        const hash = await bcrypt.hash(password, 10);
        await runQuery("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", [username, hash, "user"]);
        res.json({ success: true });
    } catch (e) {
        console.error("Registration Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
};

// --- MIDDLEWARES ---

// Standard Auth Verification
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access Denied: No Token Provided!" });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

// Role-Based Access Control (Editor Only)
exports.verifyEditor = (req, res, next) => {
    // First verify token
    exports.verifyToken(req, res, () => {
        if (req.user && req.user.role === "editor") {
            next();
        } else {
            res.status(403).json({ message: "Forbidden: Editor role required." });
        }
    });
};

// --- HISTORY ADMIN ENDPOINT ---
// Protect this specifically with verifyEditor in server.js routing, but define logic here
exports.getLoginHistory = async (req, res) => {
    try {
        // Fetch recent 100 history logs. DB index on (user_id, login_time) makes this fast
        const query = `
            SELECT lh.history_id, u.username, lh.login_time, lh.status 
            FROM login_history lh
            JOIN users u ON lh.user_id = u.user_id
            ORDER BY lh.login_time DESC 
            LIMIT 100
        `;
        const history = await runQuery(query);
        res.json({ success: true, history });
    } catch (e) {
        console.error("History DB Error:", e);
        res.status(500).json({ success: false, message: "Server error retrieving history" });
    }
};
