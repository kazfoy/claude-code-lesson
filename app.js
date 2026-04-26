const clockEl   = document.getElementById('clock');
const alarmInput = document.getElementById('alarmTime');
const toggleBtn  = document.getElementById('toggleBtn');
const statusEl   = document.getElementById('status');
const modal      = document.getElementById('modal');
const stopBtn    = document.getElementById('stopBtn');

let alarmTime  = null;
let alarmOn    = false;
let audioCtx   = null;
let beepNodes  = [];

function pad(n) { return String(n).padStart(2, '0'); }

function tick() {
  const now = new Date();
  const hh  = pad(now.getHours());
  const mm  = pad(now.getMinutes());
  const ss  = pad(now.getSeconds());
  clockEl.textContent = `${hh}:${mm}:${ss}`;

  if (alarmOn && alarmTime === `${hh}:${mm}` && ss === '00') {
    triggerAlarm();
  }
}

function startBeep() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function playBeep() {
    if (!audioCtx) return;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
    beepNodes.push(osc);
  }

  playBeep();
  const interval = setInterval(() => {
    if (!audioCtx) { clearInterval(interval); return; }
    playBeep();
  }, 600);
  beepNodes.intervalId = interval;
}

function stopBeep() {
  if (beepNodes.intervalId) clearInterval(beepNodes.intervalId);
  beepNodes = [];
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
}

function triggerAlarm() {
  modal.classList.remove('hidden');
  startBeep();
}

function reset() {
  alarmOn   = false;
  alarmTime = null;
  toggleBtn.textContent = 'セット';
  toggleBtn.className   = 'btn set';
  statusEl.textContent  = 'アラームは設定されていません';
  statusEl.className    = 'status';
}

toggleBtn.addEventListener('click', () => {
  if (alarmOn) {
    reset();
    return;
  }
  const val = alarmInput.value;
  if (!val) { statusEl.textContent = '時刻を選んでください'; return; }
  alarmTime = val;
  alarmOn   = true;
  toggleBtn.textContent = 'キャンセル';
  toggleBtn.className   = 'btn cancel';
  statusEl.textContent  = `${val} にアラームをセット中`;
  statusEl.className    = 'status active';
});

stopBtn.addEventListener('click', () => {
  stopBeep();
  modal.classList.add('hidden');
  reset();
});

setInterval(tick, 1000);
tick();
