const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

// --- CONNECTION POOLING ---
// Create a pool rather than a single connection to handle multiple simultaneous requests efficiently
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "182005kavi",
    database: "cat_app",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function runQuery(query, params = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error("Database Query Error:", error);
        throw error;
    }
}

async function initializeDatabase() {
    try {
        // ALWAYS CREATE USERS FIRST due to Foreign Keys
        await runQuery(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                linkedin_url VARCHAR(255),
                developer_bio TEXT
            ) ENGINE=InnoDB;
        `);
        
        // NOW create tables referencing users
        await runQuery(`
            CREATE TABLE IF NOT EXISTS circuits (
                circuit_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                circuit_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // --- NEW: Role-Based History Table ---
        await runQuery(`
            CREATE TABLE IF NOT EXISTS login_history (
                history_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'success',
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        await runQuery(`
            CREATE TABLE IF NOT EXISTS components (
                comp_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                formula VARCHAR(255),
                description_link VARCHAR(255),
                pin_x FLOAT DEFAULT 0,
                pin_y FLOAT DEFAULT 0
            ) ENGINE=InnoDB;
        `);

        // --- NEW: Performance Indexing ---
        // Indexes on user_id and login_time to guarantee instant retrieval for history logs
        await runQuery(`
            CREATE INDEX idx_user_history ON login_history (user_id, login_time DESC)
        `).catch(err => {
            if (err.code !== 'ER_DUP_KEYNAME') console.warn("Index warning (might exist):", err.message);
        });

        // Check if devlpdhilip exists
        const existingDev = await runQuery("SELECT user_id FROM users WHERE username = 'devlpdhilip'");
        if (existingDev.length === 0) {
            const devPassHash = await bcrypt.hash("dhilip182005kavi", 10);
            await runQuery(`
                INSERT INTO users (username, password_hash, role)
                VALUES (?, ?, ?)
            `, ["devlpdhilip", devPassHash, "editor"]);
            console.log("👤 Default Editor user created.");
        } else {
            console.log("👤 Default Editor user already exists.");
        }
        
        console.log("✅ Database Schema Initialized with Pooling & Indexes.");
    } catch (e) {
        console.error("DB Init Error:", e);
    }
}

// Call on startup
initializeDatabase().catch(console.error);

module.exports = {
    pool,
    runQuery
};
