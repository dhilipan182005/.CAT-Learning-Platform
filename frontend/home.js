/* =====================================================
   HOME.JS — Component Carousel + Library + Activity v3.0
   ===================================================== */

const COMPONENTS = [
  { name: 'Resistor',          symbol: '⎍',  color: '#f59e0b', unit: 'Ohms (Ω)',
    definition: 'A passive two-terminal component that implements electrical resistance. Used to limit current, divide voltage, and set bias points.',
    formula: 'V = I \\times R', formulaText: 'V = I × R (Ohm\'s Law)' },
  { name: 'Capacitor',         symbol: '||', color: '#06b6d4', unit: 'Farads (F)',
    definition: 'Stores electrical energy in an electric field between two conductive plates. Used in filters, timing circuits, and power supplies.',
    formula: 'Q = C \\times V,\\quad X_C = \\frac{1}{2\\pi f C}', formulaText: 'Q = C×V | XC = 1/(2πfC)' },
  { name: 'Inductor',          symbol: '∿∿', color: '#8b5cf6', unit: 'Henries (H)',
    definition: 'Stores energy in a magnetic field when current flows. Opposes changes in current. Used in filters and power converters.',
    formula: 'V = L \\frac{dI}{dt},\\quad X_L = 2\\pi f L', formulaText: 'V = L×(dI/dt) | XL = 2πfL' },
  { name: 'Diode',             symbol: '▶|', color: '#ef4444', unit: 'Vf ≈ 0.7V (Si)',
    definition: 'Semiconductor device that allows current to flow primarily in one direction. Used in rectifiers and signal clipping.',
    formula: 'I = I_s\\left(e^{\\frac{V}{V_T}} - 1\\right)', formulaText: 'I = Is(e^(V/VT) − 1)' },
  { name: 'Transistor (BJT)',  symbol: '⤴',  color: '#10b981', unit: 'β (current gain)',
    definition: 'Semiconductor device used to amplify or switch signals. Acts as current-controlled current source (BJT).',
    formula: 'I_C = \\beta \\times I_B', formulaText: 'IC = β × IB' },
  { name: 'MOSFET',            symbol: '⟛',  color: '#f97316', unit: 'Threshold Vth',
    definition: 'Voltage-controlled transistor. Used as switch in digital circuits and as amplifier in analog. Very high input impedance.',
    formula: 'I_D = k(V_{GS} - V_{th})^2', formulaText: 'ID = k(VGS − Vth)²' },
  { name: 'LED',               symbol: '🔆', color: '#eab308', unit: 'Forward Voltage Vf',
    definition: 'Light-Emitting Diode — emits photons when forward biased. Used for indication, displays, and lighting.',
    formula: 'R = \\frac{V_s - V_f}{I_f}', formulaText: 'R = (Vs − Vf) / If' },
  { name: 'Relay',             symbol: '⏦', color: '#64748b', unit: 'Coil Activation V',
    definition: 'Electromagnetically operated switch. Allows a low-power signal to control a high-power circuit with full isolation.',
    formula: 'P_{coil} = V \\times I', formulaText: 'P = V × I (coil)' },
  { name: 'IC (Integrated)',   symbol: '⑃',  color: '#6366f1', unit: 'Package: DIP/SMD',
    definition: 'Set of electronic circuits on a single semiconductor chip. Combines thousands to billions of transistors.',
    formula: '\\text{Many circuits integrated on one chip}', formulaText: 'Multiple circuits on one chip' }
];

let carouselIndex = 0;
let carouselTimer = null;

function buildCarousel() {
  const track = document.getElementById('carouselTrack');
  const dots   = document.getElementById('carouselDots');
  if (!track || !dots) return;

  track.innerHTML = COMPONENTS.map((c, i) => `
    <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-index="${i}"
         onclick="openComponentModal('${c.name}', '${c.definition.replace(/'/g,"\\'")}', '${c.formula.replace(/'/g,"\\'")}', '${c.symbol}', '${c.color}')"
         style="cursor:pointer" title="Click to learn more">
      <div class="slide-symbol" style="color:${c.color}">${c.symbol}</div>
      <h3 class="slide-name">${c.name}</h3>
      <p class="slide-unit">${c.unit}</p>
      <p class="slide-def">${c.definition}</p>
      <div class="slide-formula"><span>📐</span> ${c.formulaText}</div>
      <div class="slide-hint" style="font-size:11px;color:#64748b;margin-top:8px">👆 Click for details & formula</div>
    </div>
  `).join('');

  dots.innerHTML = COMPONENTS.map((_, i) =>
    `<span class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></span>`
  ).join('');

  if (carouselTimer) clearInterval(carouselTimer);
  startCarouselTimer();
}

function moveCarousel(dir) {
  carouselIndex = (carouselIndex + dir + COMPONENTS.length) % COMPONENTS.length;
  updateCarouselUI();
  resetCarouselTimer();
}

function goToSlide(i) { carouselIndex = i; updateCarouselUI(); resetCarouselTimer(); }

function updateCarouselUI() {
  document.querySelectorAll('.carousel-slide').forEach((s, i) => s.classList.toggle('active', i === carouselIndex));
  document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

function startCarouselTimer() { carouselTimer = setInterval(() => moveCarousel(1), 5000); }
function resetCarouselTimer() { clearInterval(carouselTimer); startCarouselTimer(); }

function buildComponentGrid() {
  const grid = document.getElementById('homeComponentGrid');
  if (!grid) return;
  grid.innerHTML = COMPONENTS.map(c => `
    <div class="comp-card glass-card" style="border-top:3px solid ${c.color};cursor:pointer"
         onclick="openComponentModal('${c.name}', '${c.definition.replace(/'/g,"\\'")}', '${c.formula.replace(/'/g,"\\'")}', '${c.symbol}', '${c.color}')">
      <div class="comp-symbol" style="color:${c.color};font-size:28px">${c.symbol}</div>
      <p class="comp-name">${c.name}</p>
      <p class="comp-desc">${c.definition.substring(0, 70)}...</p>
      <span style="font-size:11px;color:${c.color};margin-top:4px;display:block">📖 Click to open</span>
    </div>
  `).join('');
}

function renderHomeActivity() {
  const container = document.getElementById('homeActivity');
  if (!container) return;
  const history = JSON.parse(localStorage.getItem('catHistory') || '[]');
  if (!history.length) {
    container.innerHTML = `<p class="text-secondary text-center" style="padding:20px">No activity yet. Start by running a simulation!</p>`;
    return;
  }
  const recent = history.slice(-5).reverse();
  container.innerHTML = `<ul class="activity-list">` + recent.map(item => `
    <li class="activity-item">
      <span class="activity-icon">${getActivityIcon(item.type)}</span>
      <div class="activity-text">
        <strong>${item.type}</strong>
        <span>${item.result}</span>
        <small>${item.date}</small>
      </div>
    </li>
  `).join('') + `</ul>`;
}

function getActivityIcon(type) {
  if (!type) return '📝';
  if (type.includes('Simul')) return '⚡';
  if (type.includes('Calc') || type.includes('Reactance') || type.includes('Ohm')) return '🧮';
  if (type.includes('IoT') || type.includes('MQTT')) return '🤖';
  if (type.includes('Circuit') || type.includes('KVL') || type.includes('KCL')) return '🔌';
  if (type.includes('K-Map') || type.includes('Logic') || type.includes('Boolean')) return '🔀';
  if (type.includes('Heat')) return '🌡️';
  return '📝';
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel) panel.classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('#notifBtn')) {
    const panel = document.getElementById('notifPanel');
    if (panel) panel.classList.remove('open');
  }
});

function initHomePage() { buildCarousel(); buildComponentGrid(); renderHomeActivity(); }

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initHomePage();
} else {
  document.addEventListener('DOMContentLoaded', initHomePage);
}

window.initHomePage       = initHomePage;
window.moveCarousel       = moveCarousel;
window.goToSlide          = goToSlide;
window.toggleNotifPanel   = toggleNotifPanel;
window.updateHomeActivity = renderHomeActivity;
