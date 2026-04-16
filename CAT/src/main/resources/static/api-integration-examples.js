/**
 * FRONTEND API INTEGRATION EXAMPLES
 * Replace your current localStorage logic with these fetch() calls.
 * Make sure your Spring Boot backend is running on http://localhost:8080
 */

const API_BASE = '/api';

// 1. AUTHENTICATION (Replace logic in app.js)

async function registerUser(username, password, displayName) {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName, role: 'user' })
    });
    if (!response.ok) throw new Error('Registration failed');
    return await response.json(); // Returns UserDTO
}

async function loginUser(username, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Login failed');
    const user = await response.json(); // Returns UserDTO

    // Store user ID in session storage instead of localStorage for current session
    sessionStorage.setItem('catUser', JSON.stringify({
        id: user.id,
        user: user.username,
        role: user.role,
        display: user.displayName
    }));
    return user;
}


// 2. HISTORY (Replace logic in analysis.js / app.js)

async function saveHistoryAPI(type, result) {
    const session = JSON.parse(sessionStorage.getItem('catUser'));
    if (!session) return; // Not logged in

    const response = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: session.id,
            type: type,
            result: result
        })
    });
    return await response.json();
}

async function loadHistoryAPI() {
    const session = JSON.parse(sessionStorage.getItem('catUser'));
    if (!session) return [];

    const response = await fetch(`${API_BASE}/history/${session.id}`);
    if (!response.ok) throw new Error('Failed to load history');
    return await response.json(); // Returns array of HistoryDTO
}


// 3. IOT DATA (Replace logic in iot.js)

async function saveIotDataAPI(sensorType, value) {
    const session = JSON.parse(sessionStorage.getItem('catUser'));
    if (!session) return;

    const response = await fetch(`${API_BASE}/iot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: session.id,
            sensorType: sensorType,
            value: String(value)
        })
    });
    return await response.json();
}

async function loadIotDataAPI() {
    const session = JSON.parse(sessionStorage.getItem('catUser'));
    if (!session) return [];

    const response = await fetch(`${API_BASE}/iot/${session.id}`);
    return await response.json();
}


// 4. PROJECTS (Replace logic in circuit-builder.js / breadboard.js)

async function saveProjectAPI(name, circuitDataJson) {
    const session = JSON.parse(sessionStorage.getItem('catUser'));
    if (!session) return;

    const response = await fetch(`${API_BASE}/project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: session.id,
            name: name,
            data: circuitDataJson // The JSON string of your circuit
        })
    });
    return await response.json();
}

async function loadProjectsAPI() {
    const session = JSON.parse(sessionStorage.getItem('catUser'));
    if (!session) return [];

    const response = await fetch(`${API_BASE}/project/${session.id}`);
    return await response.json(); // Returns array of ProjectDTO
}
