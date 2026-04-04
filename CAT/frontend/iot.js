/* =====================================================
   IOT.JS — IoT Simulation Lab v3.0
   MCU selector, Sensor library, MQTT Live Simulator
   ===================================================== */

const MCU_SPECS = {
  uno: { title:'Arduino UNO', chip:'ATmega328P', clock:'16 MHz', flash:'32 KB', sram:'2 KB', io:'14 Digital I/O (6 PWM)', analog:'6 Analog', voltage:'5V', color:'#2196f3' },
  nano: { title:'Arduino Nano', chip:'ATmega328P', clock:'16 MHz', flash:'32 KB', sram:'2 KB', io:'22 Digital I/O (6 PWM)', analog:'8 Analog', voltage:'5V', color:'#4caf50' },
  esp32: { title:'ESP32', chip:'Xtensa Dual-Core LX6', clock:'240 MHz', flash:'4 MB', sram:'520 KB', io:'34 GPIO', analog:'18 × 12-bit ADC', voltage:'3.3V', extras:'WiFi 802.11 b/g/n | BT 4.2 BLE', color:'#f44336' },
  esp8266: { title:'ESP8266', chip:'Tensilica L106', clock:'80–160 MHz', flash:'4 MB', sram:'64 KB', io:'11 GPIO', analog:'1 × 10-bit ADC', voltage:'3.3V', extras:'WiFi 802.11 b/g/n', color:'#ff9800' }
};

const SENSOR_EXAMPLES = {
  temperature: { label:'🌡️ Temperature Sensor (DHT11)', code:`#include <DHT.h>\n#define DHTPIN 2\n#define DHTTYPE DHT11\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() { Serial.begin(9600); dht.begin(); }\n\nvoid loop() {\n  float temp = dht.readTemperature();\n  float hum  = dht.readHumidity();\n  Serial.print("Temp: "); Serial.print(temp); Serial.println("°C");\n  Serial.print("Humidity: "); Serial.print(hum); Serial.println("%");\n  delay(2000);\n}` },
  ultrasonic: { label:'📻 Ultrasonic Sensor (HC-SR04)', code:`#define TRIG_PIN 9\n#define ECHO_PIN 10\n\nvoid setup() { Serial.begin(9600); pinMode(TRIG_PIN, OUTPUT); pinMode(ECHO_PIN, INPUT); }\n\nvoid loop() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long duration = pulseIn(ECHO_PIN, HIGH);\n  float distance = duration * 0.034 / 2;\n  Serial.print("Distance: "); Serial.print(distance); Serial.println(" cm");\n  delay(500);\n}` },
  ldr: { label:'☀️ LDR Light Sensor', code:`#define LDR_PIN A0\n#define LED_PIN 13\n\nvoid setup() { Serial.begin(9600); pinMode(LED_PIN, OUTPUT); }\n\nvoid loop() {\n  int lightLevel = analogRead(LDR_PIN);\n  Serial.print("Light: "); Serial.println(lightLevel);\n  if (lightLevel < 300) { digitalWrite(LED_PIN, HIGH); Serial.println("DARK - LED ON"); }\n  else { digitalWrite(LED_PIN, LOW); Serial.println("BRIGHT - LED OFF"); }\n  delay(1000);\n}` },
  ir: { label:'🔴 IR Obstacle Sensor', code:`#define IR_PIN 7\n#define BUZZER_PIN 8\n\nvoid setup() { pinMode(IR_PIN, INPUT); pinMode(BUZZER_PIN, OUTPUT); Serial.begin(9600); }\n\nvoid loop() {\n  int obstacle = digitalRead(IR_PIN);\n  if (obstacle == LOW) { Serial.println("OBSTACLE DETECTED!"); digitalWrite(BUZZER_PIN, HIGH); delay(200); digitalWrite(BUZZER_PIN, LOW); }\n  else { Serial.println("Path is clear."); }\n  delay(300);\n}` },
  gas: { label:'💨 Gas Sensor (MQ-2)', code:`#define GAS_PIN A0\n#define ALARM_PIN 13\n#define THRESHOLD 400\n\nvoid setup() { Serial.begin(9600); pinMode(ALARM_PIN, OUTPUT); }\n\nvoid loop() {\n  int gasLevel = analogRead(GAS_PIN);\n  Serial.print("Gas: "); Serial.println(gasLevel);\n  if (gasLevel > THRESHOLD) { Serial.println("WARNING: GAS DETECTED!"); digitalWrite(ALARM_PIN, HIGH); }\n  else { Serial.println("Air: Normal"); digitalWrite(ALARM_PIN, LOW); }\n  delay(1000);\n}` },
  humidity: { label:'💧 Humidity Sensor (DHT22)', code:`#include <DHT.h>\n#define DHTPIN 4\n#define DHTTYPE DHT22\nDHT dht(DHTPIN, DHTTYPE);\n\nvoid setup() { Serial.begin(9600); dht.begin(); }\n\nvoid loop() {\n  float hum  = dht.readHumidity();\n  float temp = dht.readTemperature();\n  Serial.print("Humidity: "); Serial.print(hum); Serial.println("%");\n  Serial.print("Temp: "); Serial.print(temp); Serial.println("°C");\n  delay(2000);\n}` }
};

let activeMCU   = null;
let mqttTimer   = null;
let mqttChart   = null;
let mqttRunning = false;
let mqttDataSets = { temp: [], hum: [], dist: [], labels: [] };

function selectMCU(type) {
  activeMCU = type;
  const spec = MCU_SPECS[type];
  if (!spec) return;
  document.querySelectorAll('.mcu-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById(`mcu-${type}`);
  if (card) card.classList.add('active');
  const info = document.getElementById('mcuInfo');
  if (info) {
    info.style.borderLeft = `4px solid ${spec.color}`;
    info.innerHTML = `
      <div class="mcu-spec-grid">
        <div class="mcu-spec-title" style="color:${spec.color}">${spec.title}</div>
        <div class="mcu-spec-row"><span>Chip</span><strong>${spec.chip}</strong></div>
        <div class="mcu-spec-row"><span>Clock</span><strong>${spec.clock}</strong></div>
        <div class="mcu-spec-row"><span>Flash</span><strong>${spec.flash}</strong></div>
        <div class="mcu-spec-row"><span>SRAM</span><strong>${spec.sram}</strong></div>
        <div class="mcu-spec-row"><span>I/O</span><strong>${spec.io}</strong></div>
        <div class="mcu-spec-row"><span>Analog</span><strong>${spec.analog}</strong></div>
        <div class="mcu-spec-row"><span>Voltage</span><strong>${spec.voltage}</strong></div>
        ${spec.extras ? `<div class="mcu-spec-row"><span>Wireless</span><strong>${spec.extras}</strong></div>` : ''}
      </div>`;
  }
  const badge = document.getElementById('activeMCU');
  if (badge) badge.textContent = `MCU: ${spec.title}`;
}

function loadSensorExample(type) {
  const ex = SENSOR_EXAMPLES[type];
  if (!ex) return;
  const editor = document.getElementById('iotCode');
  if (editor) editor.value = ex.code;
  document.querySelectorAll('.sensor-card').forEach(c => c.classList.remove('active'));
  event.currentTarget?.classList.add('active');
  const output = document.getElementById('iotOutput');
  if (output) output.innerHTML = `<span style="color:var(--accent-primary)">${ex.label} loaded. Click ▶ Run to simulate.</span>`;
}

function runIoTSimulation() {
  const code   = document.getElementById('iotCode')?.value.trim();
  const output = document.getElementById('iotOutput');
  if (!code) { output.innerHTML = `<span style="color:#ef4444">Error: Code editor is empty.</span>`; return; }
  output.innerHTML = `<span style="color:#fbbf24">⏳ Compiling... flashing to ${activeMCU ? MCU_SPECS[activeMCU].title : 'virtual device'}...</span>`;
  setTimeout(() => {
    let lines   = [];
    const mcuN  = activeMCU ? MCU_SPECS[activeMCU].title : 'Virtual Device';
    lines.push(`<span style="color:#00e5ff">[INIT] ${mcuN} started.</span>`);
    if (code.includes('Serial.begin')) lines.push(`<span style="color:#a8ff78">[SERIAL] Serial @ 9600 baud initialized.</span>`);
    if (code.includes('setup()') && code.includes('loop()')) lines.push(`<span style="color:#a8ff78">[BUILD] Sketch compiled successfully.</span>`);
    if (code.includes('begin()')) lines.push(`<span style="color:#a8ff78">[SENSOR] Library initialized.</span>`);
    if (code.includes('pinMode')) lines.push(`<span style="color:#a8ff78">[GPIO] Pins configured.</span>`);
    if (code.includes('analogRead')) lines.push(`<span style="color:#fbbf24">[ADC] Analog value: ${Math.floor(Math.random()*1024)}</span>`);
    if (code.includes('readTemperature') || code.includes('temp')) lines.push(`<span style="color:#fbbf24">[SENSOR] Temp: ${(20+Math.random()*15).toFixed(1)}°C</span>`);
    if (code.includes('readHumidity') || code.includes('hum')) lines.push(`<span style="color:#fbbf24">[SENSOR] Humidity: ${(40+Math.random()*40).toFixed(1)}%</span>`);
    if (code.includes('distance') || code.includes('pulseIn')) lines.push(`<span style="color:#fbbf24">[SENSOR] Distance: ${(5+Math.random()*200).toFixed(1)} cm</span>`);
    if (code.includes('gasLevel') || code.includes('GAS')) lines.push(`<span style="color:#fbbf24">[SENSOR] Gas: ${Math.floor(Math.random()*800)} (Threshold: 400)</span>`);
    if (lines.length < 3) lines.push(`<span style="color:#fbbf24">[EXEC] Generic routines executed.</span>`);
    lines.push(`<span style="color:#10b981">[DONE] Simulation complete on ${mcuN}.</span>`);
    output.innerHTML = lines.join('<br>');
    if (typeof saveHistory === 'function') saveHistory('IoT Simulation', `Ran on ${mcuN}`);
  }, 1800);
}

function clearIoTCode() {
  const editor = document.getElementById('iotCode');
  if (editor) editor.value = '';
  const output = document.getElementById('iotOutput');
  if (output) output.innerHTML = `<span class="text-secondary">Simulation output will appear here...</span>`;
  document.querySelectorAll('.sensor-card').forEach(c => c.classList.remove('active'));
}

// ─── MQTT LIVE TELEMETRY SIMULATOR ──────────────────
function initMQTTChart() {
  const ctx = document.getElementById('mqttChart');
  if (!ctx || !window.Chart) return;
  if (mqttChart) { mqttChart.destroy(); mqttChart = null; }
  mqttDataSets = { temp: [], hum: [], dist: [], labels: [] };
  mqttChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: mqttDataSets.labels,
      datasets: [
        { label: 'Temperature (°C)', data: mqttDataSets.temp, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.15)', tension: 0.4, fill: true, pointRadius: 2 },
        { label: 'Humidity (%)',     data: mqttDataSets.hum,  borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.10)',  tension: 0.4, fill: true, pointRadius: 2 },
        { label: 'Distance (cm)',    data: mqttDataSets.dist, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.10)', tension: 0.4, fill: true, pointRadius: 2 }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 300 },
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

function startMQTTSimulator() {
  if (mqttRunning) return;
  mqttRunning = true;
  initMQTTChart();

  const badge = document.getElementById('mqttStatus');
  if (badge) { badge.textContent = '🟢 MQTT Connected'; badge.style.color = '#10b981'; }

  const topicLog = document.getElementById('mqttTopicLog');

  let tick = 0;
  mqttTimer = setInterval(() => {
    tick++;
    const t    = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const temp = +(22 + Math.sin(tick * 0.3) * 5 + Math.random() * 2).toFixed(1);
    const hum  = +(55 + Math.cos(tick * 0.2) * 10 + Math.random() * 3).toFixed(1);
    const dist = +(30 + Math.sin(tick * 0.5) * 20 + Math.random() * 5).toFixed(1);

    // Keep last 20 points
    if (mqttDataSets.labels.length >= 20) {
      mqttDataSets.labels.shift(); mqttDataSets.temp.shift();
      mqttDataSets.hum.shift(); mqttDataSets.dist.shift();
    }
    mqttDataSets.labels.push(t);
    mqttDataSets.temp.push(temp);
    mqttDataSets.hum.push(hum);
    mqttDataSets.dist.push(dist);

    if (mqttChart) mqttChart.update();

    // Update numeric badges
    const el = id => document.getElementById(id);
    if (el('mqttTemp'))  el('mqttTemp').textContent  = temp + ' °C';
    if (el('mqttHum'))   el('mqttHum').textContent   = hum  + ' %';
    if (el('mqttDist'))  el('mqttDist').textContent  = dist + ' cm';

    // Topic log
    if (topicLog) {
      const entry = document.createElement('div');
      entry.style.cssText = 'font-family:monospace;font-size:12px;color:#94a3b8;padding:2px 0;';
      entry.textContent   = `[${t}] device/sensors → T:${temp}°C | H:${hum}% | D:${dist}cm`;
      topicLog.insertBefore(entry, topicLog.firstChild);
      if (topicLog.children.length > 12) topicLog.removeChild(topicLog.lastChild);
    }
  }, 1200);
}

function stopMQTTSimulator() {
  mqttRunning = false;
  if (mqttTimer) { clearInterval(mqttTimer); mqttTimer = null; }
  const badge = document.getElementById('mqttStatus');
  if (badge) { badge.textContent = '🔴 MQTT Disconnected'; badge.style.color = '#ef4444'; }
  if (typeof saveHistory === 'function') saveHistory('IoT MQTT Session', `Simulated telemetry — ${mqttDataSets.labels.length} data points`);
}

// ─── AI Scanners ─────────────────────────────────────
function previewScan(input) {
  const preview = document.getElementById('scanPreview');
  if (!input.files[0] || !preview) return;
  const reader = new FileReader();
  reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
  reader.readAsDataURL(input.files[0]);
}

function previewValueScan(input) {
  const preview = document.getElementById('valueScanPreview');
  if (!input.files[0] || !preview) return;
  const reader = new FileReader();
  reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
  reader.readAsDataURL(input.files[0]);
}

function scanCircuit() {
  const result = document.getElementById('scanResult');
  const file   = document.getElementById('scanInput')?.files[0];
  if (!file) { result.innerHTML = `<span style="color:#ef4444">Upload a circuit image first.</span>`; return; }
  result.innerHTML = `<span style="color:#fbbf24">🔍 Scanning circuit with AI...</span>`;
  setTimeout(() => {
    result.innerHTML = `
      <strong style="color:#10b981">✅ Components Detected:</strong><br>
      • Resistor × 3 (10kΩ, 4.7kΩ, 1kΩ)<br>
      • Capacitor × 2 (100µF, 10µF)<br>
      • LED × 2<br>
      • NPN Transistor (BC547) × 1<br>
      • IC (NE555 Timer) × 1<br>
      • Power Supply: 9V<br><br>
      <em style="color:#8892b0">AI Backend: Demo mode — connect YOLO/OpenCV for real detection.</em>`;
  }, 2000);
}

function scanValues() {
  const result = document.getElementById('valueResult');
  const file   = document.getElementById('valueScan')?.files[0];
  if (!file) { result.innerHTML = `<span style="color:#ef4444">Upload a resistor image first.</span>`; return; }
  result.innerHTML = `<span style="color:#fbbf24">🎨 Detecting color bands...</span>`;
  setTimeout(() => {
    const val = Math.floor(Math.random() * 99 + 1) * 100;
    result.innerHTML = `
      <strong style="color:#10b981">✅ Resistor Detected:</strong><br>
      Bands: Brown–Black–Red–Gold<br>
      <strong>Value: ${val.toLocaleString()} Ω (${val/1000} kΩ)</strong><br>
      Tolerance: ±5%<br><br>
      <em style="color:#8892b0">AI Backend: Demo mode.</em>`;
  }, 2000);
}