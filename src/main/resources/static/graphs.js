/* =====================================================
   GRAPHS.JS — Oscilloscope & Signal Generator
   ===================================================== */

let scopeChartInstance = null;

function drawWave() {
    let freqInput = document.getElementById("oscFreq");
    let ampInput = document.getElementById("oscAmp");
    let typeInput = document.getElementById("signalType");
    
    // Default values if empty
    let freq = freqInput && freqInput.value ? parseFloat(freqInput.value) : 5;
    let amp = ampInput && ampInput.value ? parseFloat(ampInput.value) : 10;
    let type = typeInput ? typeInput.value : 'Sine';

    if (isNaN(freq) || isNaN(amp)) return alert("Enter valid numbers for Scope");

    let labels = [];
    let dataSets = [];
    
    // Generate 100 points
    for(let t = 0; t <= 100; t++) {
        let time = t / 100; // 0 to 1 second simulated window
        labels.push(time.toFixed(2) + "s");
        
        let val = 0;
        if(type === 'Sine') {
            val = amp * Math.sin(2 * Math.PI * freq * time);
        } else if(type === 'Square') {
            val = Math.sign(Math.sin(2 * Math.PI * freq * time)) * amp;
        } else if(type === 'Triangle') {
            val = (2 * amp / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * time));
        }
        
        dataSets.push(val);
    }

    if (scopeChartInstance) {
        scopeChartInstance.destroy();
    }

    let canvas = document.getElementById("scope");
    if (!canvas) return console.warn("Canvas #scope missing");
    
    let ctx = canvas.getContext("2d");
    
    // Check if Chart is defined (from CDN in index.html)
    if (typeof Chart === 'undefined') {
        return console.warn("Chart.js not loaded. Oscilloscope requires Chart JS.");
    }
    
    scopeChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${type} Wave (${freq}Hz, ${amp}V)`,
                data: dataSets,
                borderColor: '#00e5ff',
                backgroundColor: 'rgba(0,229,255,0.1)',
                borderWidth: 2,
                tension: type==='Sine'?0.4:0.01,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: { 
                y: { 
                    suggestedMin: -amp - (amp*0.2), 
                    suggestedMax: amp + (amp*0.2),
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#8892b0' }
                },
                x: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: '#8892b0', maxTicksLimit: 10 }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff' } }
            }
        }
    });

    if (typeof saveHistory === 'function') {
        saveHistory('Oscilloscope', `Generated ${type} wave: ${freq}Hz, ${amp}V`);
    }
}