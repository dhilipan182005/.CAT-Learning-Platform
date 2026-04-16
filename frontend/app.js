/* =====================================================
   APP.JS — Core Navigation & Application Logic v3.0
   ===================================================== */

// ─── RBAC AUTHENTICATION ──────────────────────────────
const USERS = {
  devlpdhilip: { password: 'dhilip182005kavi', role: 'editor', display: 'Dev Dhilip' },
  student:     { password: 'pass123',           role: 'user',   display: 'Student' },
};

let currentUser  = null;
let currentRole  = null;
let isUploading  = false;

function toggleAuth(type) {
  document.querySelectorAll('.auth-card').forEach(c => c.classList.remove('active-auth'));
  document.getElementById(type)?.classList.add('active-auth');
}

async function performLogin() {
  const user = document.getElementById('username')?.value.trim();
  const pass = document.getElementById('password')?.value;
  const status = document.getElementById('loginStatus');

  if (!user || !pass) {
    if (status) {
      status.innerText = 'Please enter username and password.';
      status.style.color = '#ef4444';
    }
    return;
  }

  if (status) {
    status.innerText = 'Logging in...';
    status.style.color = '#00e5ff';
  }

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user.username;
      currentRole = data.user.role;
      const display = data.user.username.toUpperCase().slice(0, 2);

      sessionStorage.setItem('catUser', JSON.stringify({
        user: data.user.username,
        role: data.user.role,
        display: display,
        token: data.token,
        user_id: data.user.user_id
      }));

      const loginScreen = document.getElementById('login-screen');
      const appContainer = document.getElementById('app-container');
      if (loginScreen) loginScreen.style.display = 'none';
      if (appContainer) appContainer.style.display = 'flex';

      updateAvatarDisplay(display, data.user.role);

      if (typeof showPage === 'function') showPage('home');
      console.log(`Logged in as ${data.user.username} (${data.user.role})`);
    } else {
      if (status) {
        status.innerText = data.message || 'Login failed.';
        status.style.color = '#ef4444';
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    if (status) {
      status.innerText = 'Server unavailable. Make sure at 3000.';
      status.style.color = '#ef4444';
    }
  }
}
function login() { performLogin(); }

function updateAvatarDisplay(display, role) {
  const initials = display.toUpperCase().slice(0, 2);
  const avatarEl = document.querySelector('.avatar-initials');
  if (avatarEl) avatarEl.textContent = initials;

  const badge = document.getElementById('editorBadge');
  if (badge) {
    badge.style.display = role === 'editor' ? 'flex' : 'none';
  }
}

async function registerUser() {
  const user   = document.getElementById('reg_username')?.value.trim();
  const pass   = document.getElementById('reg_password')?.value;
  const status = document.getElementById('registerStatus');

  if (!user || !pass) {
    if (status) { status.innerText = 'Please fill all fields.'; status.style.color = '#ef4444'; }
    return;
  }

  if (status) { status.innerText = 'Creating account...'; status.style.color = '#00e5ff'; }

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    const data = await response.json();

    if (data.success) {
      if (status) { status.innerText = 'Account created! Please login.'; status.style.color = '#10b981'; }
      setTimeout(() => toggleAuth('login'), 1200);
    } else {
      if (status) { status.innerText = data.message || 'Registration failed.'; status.style.color = '#ef4444'; }
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (status) { status.innerText = 'Server unavailable.'; status.style.color = '#ef4444'; }
  }
}

// ─── SIDEBAR TOGGLE ───────────────────────────────────
function toggleSidebar() {
  const sidebar      = document.getElementById('sidebar');
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
  const toggle    = document.getElementById('animToggle');
  let styleEl     = document.getElementById('dynamic-animations') || document.createElement('style');
  styleEl.id      = 'dynamic-animations';
  if (toggle && !toggle.checked) {
    styleEl.innerHTML = `* { animation: none !important; transition: none !important; } .glass-card:hover { transform: none !important; }`;
    document.head.appendChild(styleEl);
  } else {
    if (document.head.contains(styleEl)) document.head.removeChild(styleEl);
  }
}

// ─── HISTORY ─────────────────────────────────────────
let currentFilter = 'all';

window.saveHistory = function(type, result) {
  const history = JSON.parse(localStorage.getItem('catHistory') || '[]');
  history.push({
    id: history.length + 1,
    type,
    result,
    date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  });
  localStorage.setItem('catHistory', JSON.stringify(history));
};

window.loadHistory = function() {
  const timeline = document.getElementById('historyTimeline');
  if (!timeline) return;
  const history = JSON.parse(localStorage.getItem('catHistory') || '[]');
  const filtered = currentFilter === 'all'
    ? history
    : history.filter(item => item.type.toLowerCase().includes(currentFilter.toLowerCase()));

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
        <p class="timeline-result">${item.result}</p>
      </div>
    </div>
  `).join('');
};

function filterHistory(type, btn) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.loadHistory();
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all history?')) {
    localStorage.removeItem('catHistory');
    window.loadHistory();
    if (typeof window.updateHomeActivity === 'function') window.updateHomeActivity();
  }
}

function getHistoryIcon(type) {
  if (!type) return '📝';
  const t = type.toLowerCase();
  if (t.includes('simul'))  return '⚡';
  if (t.includes('iot'))    return '🤖';
  if (t.includes('circuit') || t.includes('kvl') || t.includes('kcl')) return '🔌';
  if (t.includes('calc') || t.includes('ohm') || t.includes('power') || t.includes('react') || t.includes('rlc')) return '🧮';
  if (t.includes('kmap') || t.includes('logic') || t.includes('boolean')) return '🔀';
  if (t.includes('heat'))   return '🌡️';
  return '📝';
}

function getHistoryColor(type) {
  if (!type) return '#8892b0';
  const t = type.toLowerCase();
  if (t.includes('simul'))  return '#00e5ff';
  if (t.includes('iot'))    return '#10b981';
  if (t.includes('circuit') || t.includes('kvl')) return '#8b5cf6';
  if (t.includes('calc') || t.includes('ohm') || t.includes('power')) return '#f59e0b';
  if (t.includes('heat'))   return '#ef4444';
  if (t.includes('logic') || t.includes('kmap')) return '#06b6d4';
  return '#64748b';
}

// ─── HOME ACTIVITY ────────────────────────────────────
window.updateHomeActivity = function() {
  const container = document.getElementById('homeActivity');
  if (!container) return;
  const history = JSON.parse(localStorage.getItem('catHistory') || '[]');
  if (!history.length) {
    container.innerHTML = `<p class="text-secondary text-center" style="padding:20px">No activity yet. Start by running a simulation!</p>`;
    return;
  }
  const recent = [...history].reverse().slice(0, 5);
  container.innerHTML = `<ul class="activity-list">` + recent.map(item => `
    <li class="activity-item">
      <span class="activity-icon">${getHistoryIcon(item.type)}</span>
      <div class="activity-text">
        <strong>${item.type}</strong>
        <span>${item.result}</span>
        <small>${item.date}</small>
      </div>
    </li>
  `).join('') + `</ul>`;
};

// ─── PDF / PRINT REPORT ───────────────────────────────
async function downloadAtoZReport() {
    const reportData = {
        developer: "Dhilipan S",
        timestamp: new Date().toLocaleString(),
        oscilloscope: {
            frequency: document.getElementById('oscFreq')?.value || "N/A",
            amplitude: document.getElementById('oscAmp')?.value || "N/A",
            signalType: document.getElementById('signalType')?.value || "Sine"
        },
        breadboard: {
            components: placedComponents.map(c => c.type),
            wireCount: wires.length
        }
    };

    try {
        const response = await fetch('/generate-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Analysis_Report_v2.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            console.error("PDF Generation failed");
        }
    } catch (e) {
        console.error("Error generating report:", e);
    }
}
function downloadCircuitPDF() {
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

  const history = JSON.parse(localStorage.getItem('catHistory') || '[]').slice(-8).reverse();
  const histRows = history.length
    ? history.map(h => `<tr><td>${h.type}</td><td>${h.result}</td><td>${h.date}</td></tr>`).join('')
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
  const modal   = document.getElementById('componentModal');
  const mName   = document.getElementById('modalName');
  const mDef    = document.getElementById('modalDefinition');
  const mForm   = document.getElementById('modalFormula');
  const mImg    = document.getElementById('modalImage');
  const mSymbol = document.getElementById('modalSymbol');

  if (!modal) return;
  if (mName)   mName.textContent   = symbol + ' ' + name;
  if (mDef)    mDef.textContent    = definition;
  if (mSymbol) { mSymbol.textContent = symbol; mSymbol.style.color = color || '#00e5ff'; }

  // KaTeX rendering
  if (mForm) {
    if (window.katex && formula) {
      try {
        mForm.innerHTML = katex.renderToString(formula, { throwOnError: false, displayMode: true });
      } catch(e) {
        mForm.textContent = formula;
      }
    } else {
      mForm.textContent = formula || '';
    }
  }
  if (mImg) mImg.style.display = 'none';

  modal.style.display = 'flex';
  // Trigger book-opening animation
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.classList.remove('book-open');
    void modalContent.offsetWidth; // Force reflow
    modalContent.classList.add('book-open');
  }
}

function closeComponentModal() {
  const modal = document.getElementById('componentModal');
  if (modal) modal.style.display = 'none';
}

window.openComponentModal  = openComponentModal;
window.closeComponentModal = closeComponentModal;

// ─── INIT ─────────────────────────────────────────────
function initApp() {
  console.log('CAT App v3.0 Initialized');

  // Restore session if exists
  const saved = sessionStorage.getItem('catUser');
  if (saved) {
    try {
      const { user, role, display } = JSON.parse(saved);
      currentUser = user;
      currentRole = role;
      const loginScreen  = document.getElementById('login-screen');
      const appContainer = document.getElementById('app-container');
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app-container').style.display = 'flex';
      
      updateAvatarDisplay(display, role);
      if (typeof showPage === 'function') showPage('home');
    } catch(e) { /* ignore */ }
  }

  // Force splash screen removal if it's still present
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

  // History page auto-load
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
      setTimeout(() => {
        if (document.getElementById('historyTimeline')) window.loadHistory();
      }, 50);
    });
  });
}

// --- PDF Generation API Link ---
window.downloadAtoZReport = async function() {
    updateStatus("⏳ Generating A-to-Z Analysis PDF...");
    try {
        const netlist = typeof componentList !== 'undefined' ? componentList.map(c => ({
            id: c.id, type: c.type, value: c.value
        })) : [];
        
        const payload = { circuit_data: { netlist } };

        const res = await fetch("http://localhost:3000/download-pdf", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
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
            updateStatus("✅ Full A-to-Z Report Downloaded.");
        } else {
            updateStatus("❌ Failed to generate report.");
        }
    } catch(e) {
        updateStatus("❌ Server unavailable for PDF generation.");
    }
}

document.addEventListener('DOMContentLoaded', initApp);