/* =====================================================
   APP.JS — Core Navigation & Application Logic v3.0
   Backend Integration: Spring Boot @ localhost:8080
   ===================================================== */

const BASE_URL = "http://localhost:8080";
const API_BASE = `${BASE_URL}/api`;

// ================= GLOBAL STATE =================
let currentUser = null;
let currentRole = null;


// ================= AVATAR DISPLAY =================
function updateAvatarDisplay(display, role) {
  const avatarEls = document.querySelectorAll('.avatar-initials, .avatar-large');
  avatarEls.forEach(el => {
    if (el) el.textContent = display || 'US';
  });
  const editorBadge = document.getElementById('editorBadge');
  if (editorBadge && role === 'EDITOR') editorBadge.style.display = 'flex';
}

// ================= AUTH TOGGLE =================
function toggleAuth(panel) {
  document.querySelectorAll('.auth-card').forEach(c => c.classList.remove('active-auth'));
  const target = document.getElementById(panel);
  if (target) target.classList.add('active-auth');
}

async function login(e) { 
  if (e) e.preventDefault();
  console.log("LOGIN CLICKED");

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!username || !password){
      alert("Enter username and password");
      return;
  }

  const status = document.getElementById('loginStatus');
  const btn = document.getElementById('loginBtn');

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Logging in...'; }
  if (status) { status.innerText = ''; }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await res.json();
    console.log("RESPONSE:", data);

    if (!res.ok || !data.success) {
      const msg = data.message || 'Invalid username or password.';
      if (status) { status.innerText = '❌ ' + msg; status.style.color = '#ef4444'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
      return;
    }

    const userData = data.data;
    console.log("✅ LOGIN SUCCESS:", userData);

    currentUser = userData.username;
    currentRole = userData.role || 'USER';
    const display = (userData.username || 'US').toUpperCase().slice(0, 2);

    sessionStorage.setItem('catUser', JSON.stringify({
      id: userData.id,
      user: userData.username,
      email: userData.email,
      role: currentRole,
      display: display
    }));

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    updateAvatarDisplay(display, currentRole);
    if (typeof showPage === 'function') showPage('home');
    window.updateHomeActivity && window.updateHomeActivity();

  } catch (error) {
    console.error("LOGIN NETWORK ERROR:", error);
    if (status) {
      status.innerText = '❌ Server error. Is the backend running?';
      status.style.color = '#ef4444';
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
  }
}

async function register(e) {
    if (e) e.preventDefault();
    console.log("REGISTER CLICKED");
    const username = document.getElementById('reg_username').value;
    const password = document.getElementById('reg_password').value;
    const status   = document.getElementById('registerStatus');
    const btn      = document.getElementById('signupBtn');

    const emailInput = document.getElementById('reg_email');
    const email = emailInput ? emailInput.value.trim() : `${username}@cat.local`;

  if (!username || !password) {
    if (status) { status.innerText = '❌ Username and password are required.'; status.style.color = '#ef4444'; }
    return;
  }
  if (password.length < 6) {
    if (status) { status.innerText = '❌ Password must be at least 6 characters.'; status.style.color = '#ef4444'; }
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Registering...'; }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const msg = result.message || 'Registration failed.';
      if (status) { status.innerText = '❌ ' + msg; status.style.color = '#ef4444'; }
      return;
    }

    console.log("✅ REGISTER SUCCESS:", result.data);
    if (status) { status.innerText = '✅ Account created! You can now login.'; status.style.color = '#10b981'; }

    setTimeout(() => toggleAuth('login'), 1500);

  } catch (error) {
    console.error("REGISTER NETWORK ERROR:", error);
    if (status) {
      status.innerText = '❌ Server error. Is the backend running?';
      status.style.color = '#ef4444';
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Register'; }
  }
}

// ─── LOGOUT ──────────────────────────────────────────
function logout() {
  sessionStorage.removeItem('catUser');
  currentUser = null;
  currentRole = null;
  document.getElementById('app-container').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  const status = document.getElementById('loginStatus');
  if (status) { status.innerText = ''; }
}

// ─── SIDEBAR TOGGLE ───────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const appContainer = document.getElementById('app-container');
  if (window.innerWidth <= 900) {
    sidebar?.classList.toggle('open');
  } else {
    sidebar?.classList.toggle('collapsed');
    appContainer?.classList.toggle('collapsed');
  }
}

function activateMenu(element) {
  if (!element) return;
  document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
  element.classList.add('active');
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar')?.classList.remove('open');
  }
}

function activateMobileTab(element) {
  document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
  element?.classList.add('active');
}

// ─── NOTIFICATION PANEL ───────────────────────────────
function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel) panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// ─── SEARCH ───────────────────────────────────────────
function handleSearch(val) {
  if (!val.trim()) return;
  const map = {
    'simul': 'simulation', 'circuit': 'simulation', 'wire': 'simulation',
    'analyt': 'analysis', 'calc': 'analysis', 'ohm': 'analysis', 'rlc': 'analysis',
    'kvl': 'analysis', 'kcl': 'analysis', 'kmap': 'analysis', 'heat': 'analysis',
    'bread': 'breadboard',
    'iot': 'iot', 'arduino': 'iot', 'esp': 'iot', 'sensor': 'iot', 'mqtt': 'iot',
    'histor': 'history',
    'setting': 'settings', 'theme': 'settings',
    'about': 'about', 'developer': 'about', 'dhilip': 'about'
  };
  const lower = val.toLowerCase();
  for (const [key, page] of Object.entries(map)) {
    if (lower.includes(key)) {
      if (typeof showPage === 'function') showPage(page);
      return;
    }
  }
}

// ─── SETTINGS ────────────────────────────────────────
function toggleTheme() {
  const toggle = document.getElementById('themeToggle');
  document.body.setAttribute('data-theme', (!toggle || toggle.checked) ? '' : 'light');
  if (!toggle || toggle.checked) document.body.removeAttribute('data-theme');
}

function toggleAnimations() {
  const toggle = document.getElementById('animToggle');
  let styleEl = document.getElementById('dynamic-animations') || document.createElement('style');
  styleEl.id = 'dynamic-animations';
  if (toggle && !toggle.checked) {
    styleEl.innerHTML = `* { animation: none !important; transition: none !important; } .glass-card:hover { transform: none !important; }`;
    document.head.appendChild(styleEl);
  } else {
    if (document.head.contains(styleEl)) document.head.removeChild(styleEl);
  }
}

// ─── HISTORY — SAVE (Phase 5 — Fixed API URL & field names) ────
let currentFilter = 'all';

window.saveHistory = async function(type, result) {
  const session = JSON.parse(sessionStorage.getItem('catUser'));
  if (!session) return;
  try {
    const response = await fetch(`${API_BASE}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.id,
        calculationType: type,
        inputData: null,
        result: result
      })
    });

    if (response.ok) {
      if (document.getElementById('historyTimeline')) window.loadHistory();
      if (document.getElementById('homeActivity')) window.updateHomeActivity();
    }
  } catch (e) { console.error("History save error", e); };
};

// ─── HISTORY — LOAD (Phase 5 — Fixed API URL) ────────
window.loadHistory = async function () {
  const timeline = document.getElementById('historyTimeline');
  if (!timeline) return;
  const session = JSON.parse(sessionStorage.getItem('catUser'));
  if (!session) {
    timeline.innerHTML = `<p>Please log in.</p>`;
    return;
  }

  try {
    // FIXED: was /api/history/${id}, now /api/history/user/${id}
    const res = await fetch(`${API_BASE}/history/user/${session.id}`);
    const json = await res.json();

    if (!json.success) {
      timeline.innerHTML = `<p>Could not load history.</p>`;
      return;
    }

    const history = json.data || [];

    history.forEach(h => {
      // Backend returns: calculationType, timestamp
      h.type = h.calculationType || h.type || 'Activity';
      h.date = new Date(h.timestamp || h.createdAt || Date.now())
        .toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    });

    const filtered = currentFilter === 'all'
      ? history
      : history.filter(item => (item.type || '').toLowerCase().includes(currentFilter.toLowerCase()));

    const reversed = [...filtered].reverse();
    if (!reversed.length) {
      timeline.innerHTML = `<div class="history-empty glass-card">
        <div style="font-size:48px;margin-bottom:10px;">📭</div>
        <p>No activity recorded yet.</p>
        <small>Your simulations, calculations and IoT tests will appear here.</small>
      </div>`;
      return;
    }
    timeline.innerHTML = reversed.map((item, i) => `
      <div class="timeline-item glass-card" style="animation-delay:${i * 0.05}s">
        <div class="timeline-dot" style="background:${getHistoryColor(item.type)}"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-icon">${getHistoryIcon(item.type)}</span>
            <strong class="timeline-type">${item.type}</strong>
            <span class="timeline-date">${item.date}</span>
          </div>
          <p class="timeline-result">${item.result || ''}</p>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error("History load error", e);
    timeline.innerHTML = `<p>Could not load history. Is the backend running?</p>`;
  }
};

function filterHistory(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.loadHistory();
}

function clearHistory() {
  alert("Clear history is disabled. Data is safely stored on the server.");
}

function getHistoryIcon(type) {
  if (!type) return '📝';
  const t = type.toLowerCase();
  if (t.includes('simul')) return '⚡';
  if (t.includes('iot')) return '🤖';
  if (t.includes('circuit') || t.includes('kvl') || t.includes('kcl')) return '🔌';
  if (t.includes('calc') || t.includes('ohm') || t.includes('power') || t.includes('react') || t.includes('rlc')) return '🧮';
  if (t.includes('kmap') || t.includes('logic') || t.includes('boolean')) return '🔀';
  if (t.includes('heat')) return '🌡️';
  return '📝';
}

function getHistoryColor(type) {
  if (!type) return '#8892b0';
  const t = type.toLowerCase();
  if (t.includes('simul')) return '#00e5ff';
  if (t.includes('iot')) return '#10b981';
  if (t.includes('circuit') || t.includes('kvl')) return '#8b5cf6';
  if (t.includes('calc') || t.includes('ohm') || t.includes('power')) return '#f59e0b';
  if (t.includes('heat')) return '#ef4444';
  if (t.includes('logic') || t.includes('kmap')) return '#06b6d4';
  return '#64748b';
}

// ─── HOME ACTIVITY (Phase 5 — Fixed API URL) ─────────
window.updateHomeActivity = async function () {
  const container = document.getElementById('homeActivity');
  if (!container) return;

  const session = JSON.parse(sessionStorage.getItem('catUser'));
  if (!session) {
    container.innerHTML = `<p class="text-secondary text-center" style="padding:20px">Please log in to see activity.</p>`;
    return;
  }

  try {
    // FIXED: was /api/history/${id}, now /api/history/user/${id}
    const res = await fetch(`${API_BASE}/history/user/${session.id}`);
    const json = await res.json();

    if (!json.success) { container.innerHTML = `<p class="text-secondary text-center" style="padding:20px">Could not load activity.</p>`; return; }

    const history = json.data || [];
    if (!history.length) {
      container.innerHTML = `<p class="text-secondary text-center" style="padding:20px">No activity yet. Start by running a simulation!</p>`;
      return;
    }

    history.forEach(h => {
      h.type = h.calculationType || h.type || 'Activity';
      h.date = new Date(h.timestamp || h.createdAt || Date.now())
        .toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    });

    const recent = [...history].reverse().slice(0, 5);
    container.innerHTML = `<ul class="activity-list">` + recent.map(item => `
      <li class="activity-item">
        <span class="activity-icon">${getHistoryIcon(item.type)}</span>
        <div class="activity-text">
          <strong>${item.type}</strong>
          <span>${item.result || ''}</span>
          <small>${item.date}</small>
        </div>
      </li>
    `).join('') + `</ul>`;
  } catch (e) {
    console.error("Home activity fetch error", e);
  }
};

// ─── PDF / PRINT REPORT ───────────────────────────────
async function downloadCircuitPDF() {
  const style = `
    <style>
      body { font-family: Arial, sans-serif; margin: 30px; color: #111; }
      h1 { color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 8px; }
      h2 { color: #7c3aed; margin-top: 20px; }
      table { border-collapse: collapse; width: 100%; margin-top: 10px; }
      th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
      th { background: #f0f0f0; }
      .formula { background: #f5f5f5; padding: 10px; border-left: 4px solid #0ea5e9; margin: 10px 0; font-family: monospace; }
      .footer { margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
    </style>`;

  const comps = typeof componentList !== 'undefined' ? componentList : [];
  const rows = comps.length
    ? comps.map(c => `<tr><td>#${c.id}</td><td>${c.type}</td><td>${c.value}</td></tr>`).join('')
    : `<tr><td colspan="3">No components in current simulation</td></tr>`;

  let history = [];
  const session = JSON.parse(sessionStorage.getItem('catUser'));
  if (session) {
    try {
      const res = await fetch(`${API_BASE}/history/user/${session.id}`);
      const json = await res.json();
      if (json.success) {
        let data = json.data || [];
        data.forEach(h => {
          h.type = h.calculationType || h.type || 'Activity';
          h.date = new Date(h.timestamp || h.createdAt || Date.now())
            .toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        });
        history = data.slice(-8).reverse();
      }
    } catch (e) { console.error("Failed to fetch history for PDF", e); }
  }

  const histRows = history.length
    ? history.map(h => `<tr><td>${h.type}</td><td>${h.result || ''}</td><td>${h.date}</td></tr>`).join('')
    : `<tr><td colspan="3">No recent calculations</td></tr>`;

  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>CAT Engineering — Circuit Report</title>${style}</head><body>
    <h1>⚡ CAT Engineering — Circuit Analysis Report</h1>
    <p>Generated: ${new Date().toLocaleString('en-IN')} | User: ${currentUser || 'Guest'} | Role: ${currentRole || 'N/A'}</p>

    <h2>🧩 Circuit Components</h2>
    <table><thead><tr><th>ID</th><th>Type</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table>

    <h2>📐 Key Formulas</h2>
    <div class="formula">Ohm's Law: V = I × R</div>
    <div class="formula">Power: P = V × I = I² × R = V²/R</div>
    <div class="formula">KVL: ΣV = 0 (sum of all voltages in a closed loop = 0)</div>
    <div class="formula">KCL: ΣI = 0 (sum of all currents at a node = 0)</div>
    <div class="formula">Inductive Reactance: XL = 2πfL</div>
    <div class="formula">Capacitive Reactance: XC = 1/(2πfC)</div>
    <div class="formula">Impedance: Z = √(R² + (XL − XC)²)</div>

    <h2>🕐 Recent Calculations</h2>
    <table><thead><tr><th>Type</th><th>Result</th><th>Date</th></tr></thead><tbody>${histRows}</tbody></table>

    <div class="footer">
      <strong>.CAT Learning Platform v3.0</strong><br>
      Developer: Dhilipan S | Contact: dhilipan1804@outlook.in<br>
      This is an auto-generated engineering report. Values are for educational simulation purposes.
    </div>
  </body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

// ─── COMPONENT MODAL (Book Animation) ────────────────
function openComponentModal(name, definition, formula, symbol, color) {
  const modal = document.getElementById('componentModal');
  const mName = document.getElementById('modalName');
  const mDef = document.getElementById('modalDefinition');
  const mForm = document.getElementById('modalFormula');
  const mImg = document.getElementById('modalImage');
  const mSymbol = document.getElementById('modalSymbol');

  if (!modal) return;
  if (mName) mName.textContent = symbol + ' ' + name;
  if (mDef) mDef.textContent = definition;
  if (mSymbol) { mSymbol.textContent = symbol; mSymbol.style.color = color || '#00e5ff'; }

  if (mForm) {
    if (window.katex && formula) {
      try {
        let katex;
        mForm.innerHTML = katex.renderToString(formula, { throwOnError: false, displayMode: true });
      } catch (e) { mForm.textContent = formula; }
    } else {
      mForm.textContent = formula || '';
    }
  }
  if (mImg) mImg.style.display = 'none';

  modal.style.display = 'flex';
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.classList.remove('book-open');
    void modalContent.offsetWidth;
    modalContent.classList.add('book-open');
  }
}

function closeComponentModal() {
  const modal = document.getElementById('componentModal');
  if (modal) modal.style.display = 'none';
}

window.openComponentModal = openComponentModal;
window.closeComponentModal = closeComponentModal;

// ─── PDF Generation (A-to-Z Report) ──────────────────
window.downloadAtoZReport = async function () {
  if (typeof updateStatus === 'function') updateStatus("⏳ Generating A-to-Z Analysis PDF...");
  try {
    const netlist = typeof componentList !== 'undefined' ? componentList.map(c => ({
      id: c.id, type: c.type, value: c.value
    })) : [];

    const payload = { circuit_data: { netlist } };

    const res = await fetch("http://localhost:3000/download-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'circuit-analysis.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      if (typeof updateStatus === 'function') updateStatus("✅ Full A-to-Z Report Downloaded.");
    } else {
      if (typeof updateStatus === 'function') updateStatus("❌ Failed to generate report.");
    }
  } catch (e) {
    if (typeof updateStatus === 'function') updateStatus("❌ Server unavailable for PDF generation.");
    else console.warn("PDF server unavailable:", e);
  }
};

// ─── INIT ─────────────────────────────────────────────
function initApp() {
  console.log('CAT App v3.0 Initialized — Backend: ' + API_BASE);

  // Phase 4 — Restore session if exists
  const saved = sessionStorage.getItem('catUser');
  if (saved) {
    try {
      const { id, user, role, display } = JSON.parse(saved);
      currentUser = user;
      currentRole = role;
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app-container').style.display = 'flex';
      updateAvatarDisplay(display, role);
      if (typeof showPage === 'function') showPage('home');
      window.updateHomeActivity && window.updateHomeActivity();

      // Initialize Firebase and setup Realtime Listener

    } catch (e) { console.warn('Session restore failed', e); }
  }

  // Force splash screen removal
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 500);
    }
  }, 2500);

  // Setup sidebar toggle buttons
  ['menu-toggle', 'sidebar-toggle', 'mobile-toggle'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = toggleSidebar;
  });

  // History page auto-load when navigating
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
      setTimeout(() => {
        if (document.getElementById('historyTimeline')) window.loadHistory();
      }, 50);
    });
  });

  // Enter key on login
  const passInput = document.getElementById('password');
  if (passInput) passInput.addEventListener('keydown', e => { if (e.key === 'Enter') performLogin(); });
  const userInput = document.getElementById('username');
  if (userInput) userInput.addEventListener('keydown', e => { if (e.key === 'Enter') performLogin(); });

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.addEventListener("click", login);

  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) signupBtn.addEventListener("click", register);
}

document.addEventListener('DOMContentLoaded', initApp);