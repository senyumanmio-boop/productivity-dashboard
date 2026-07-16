/* ===================================================================
   RUANG — Personal Life Dashboard — app logic
   All data is stored locally in this browser via localStorage.
=================================================================== */

const STORE_KEYS = {
  balance: 'ruang_balance',
  balanceSet: 'ruang_balance_set',
  expenses: 'ruang_expenses',
  tasks: 'ruang_tasks',
  agenda: 'ruang_agenda',
};

const load = (key, fallback) => {
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){ return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

let state = {
  balance: load(STORE_KEYS.balance, 0),
  balanceSet: load(STORE_KEYS.balanceSet, false),
  expenses: load(STORE_KEYS.expenses, []),
  tasks: load(STORE_KEYS.tasks, []),
  agenda: load(STORE_KEYS.agenda, []),
};

const fmtRupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const todayISO = () => new Date().toISOString().slice(0,10);

/* ================= NAVIGATION ================= */
const navItems = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.panel');

function goToPanel(target){
  panels.forEach(p => p.classList.toggle('is-active', p.id === target));
  navItems.forEach(n => n.classList.toggle('is-active', n.dataset.target === target));
  document.querySelector('.sidebar')?.classList.remove('is-open');
}

navItems.forEach(btn => {
  btn.addEventListener('click', () => goToPanel(btn.dataset.target));
});

document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('is-open');
});

/* ================= CLOCK & GREETING ================= */
const dateLine = document.getElementById('dateLine');
const clockText = document.getElementById('clockText');
const greetingText = document.getElementById('greetingText');

function updateClock(){
  const now = new Date();
  const hour = now.getHours();
  let greet = 'Selamat malam';
  if (hour < 10) greet = 'Selamat pagi';
  else if (hour < 15) greet = 'Selamat siang';
  else if (hour < 18) greet = 'Selamat sore';
  greetingText.textContent = `${greet}, semangat beraktivitas!`;

  dateLine.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  clockText.textContent = now.toLocaleTimeString('id-ID');
}
updateClock();
setInterval(updateClock, 1000);

/* ================= SAKU TRACKER ================= */
const balanceDisplay = document.getElementById('balanceDisplay');
const overviewBalance = document.getElementById('overviewBalance');
const overviewBalanceFoot = document.getElementById('overviewBalanceFoot');
const setBalanceForm = document.getElementById('setBalanceForm');
const initialBalanceInput = document.getElementById('initialBalanceInput');
const setBalanceBtn = document.getElementById('setBalanceBtn');
const expenseForm = document.getElementById('expenseForm');
const receiptBody = document.getElementById('receiptBody');

function renderBalance(){
  balanceDisplay.textContent = fmtRupiah(state.balance);
  overviewBalance.textContent = fmtRupiah(state.balance);
  overviewBalanceFoot.textContent = state.balanceSet ? `${state.expenses.length} transaksi tercatat` : 'Belum diatur';
  setBalanceForm.style.display = state.balanceSet ? 'none' : 'flex';
}

function renderReceipt(){
  if (state.expenses.length === 0){
    receiptBody.innerHTML = '<p class="empty-line">Belum ada pengeluaran tercatat.</p>';
    return;
  }
  receiptBody.innerHTML = state.expenses.slice().reverse().map(exp => `
    <div class="receipt-row">
      <span>
        <span class="receipt-desc">${escapeHTML(exp.desc)}</span>
        <span class="receipt-date">${new Date(exp.date).toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</span>
      </span>
      <span class="receipt-amount">-${fmtRupiah(exp.amount)}</span>
    </div>
  `).join('');
}

function escapeHTML(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

setBalanceBtn.addEventListener('click', () => {
  const val = parseFloat(initialBalanceInput.value);
  if (isNaN(val) || val < 0) return;
  state.balance = val;
  state.balanceSet = true;
  save(STORE_KEYS.balance, state.balance);
  save(STORE_KEYS.balanceSet, state.balanceSet);
  initialBalanceInput.value = '';
  renderBalance();
});

expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const desc = document.getElementById('expenseDesc').value.trim();
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  if (!desc || isNaN(amount) || amount <= 0) return;

  state.balance -= amount;
  state.expenses.push({ desc, amount, date: new Date().toISOString() });
  save(STORE_KEYS.balance, state.balance);
  save(STORE_KEYS.expenses, state.expenses);

  expenseForm.reset();
  renderBalance();
  renderReceipt();
});

/* ================= TUGAS HARIAN ================= */
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskCategory = document.getElementById('taskCategory');
const taskList = document.getElementById('taskList');
const taskProgressFill = document.getElementById('taskProgressFill');
const taskProgressLabel = document.getElementById('taskProgressLabel');
const ringFill = document.getElementById('ringFill');
const ringPercent = document.getElementById('ringPercent');
const ringFoot = document.getElementById('ringFoot');

const CIRC = 264;
const catLabel = { tugas: 'Tugas', latihan: 'Latihan', jadwal: 'Jadwal' };

function renderTasks(){
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done/total)*100);

  if (total === 0){
    taskList.innerHTML = '<li class="empty-line">Semua tugas beres! Kamu bebas bersantai sekarang. 🙌</li>';
  } else {
    taskList.innerHTML = state.tasks.map(t => `
      <li class="${t.done ? 'is-done' : ''}" data-id="${t.id}">
        <button class="task-check" data-action="toggle" data-id="${t.id}" aria-label="Tandai selesai">
          <svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>
        </button>
        <span class="task-text">${escapeHTML(t.text)}</span>
        <span class="task-cat">${catLabel[t.category] || t.category}</span>
        <button class="task-del" data-action="delete" data-id="${t.id}" aria-label="Hapus tugas">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </li>
    `).join('');
  }

  taskProgressFill.style.width = pct + '%';
  taskProgressLabel.textContent = `${done} / ${total} selesai`;

  ringFill.style.strokeDashoffset = CIRC - (CIRC * pct/100);
  ringPercent.textContent = pct + '%';
  ringFoot.textContent = `${done} dari ${total} selesai`;
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  state.tasks.push({ id: Date.now(), text, category: taskCategory.value, done: false });
  save(STORE_KEYS.tasks, state.tasks);
  taskForm.reset();
  renderTasks();
});

taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === 'toggle'){
    const t = state.tasks.find(t => t.id === id);
    if (t) t.done = !t.done;
  } else if (btn.dataset.action === 'delete'){
    state.tasks = state.tasks.filter(t => t.id !== id);
  }
  save(STORE_KEYS.tasks, state.tasks);
  renderTasks();
});

/* ================= AGENDA BULANAN ================= */
const agendaForm = document.getElementById('agendaForm');
const agendaInput = document.getElementById('agendaInput');
const agendaDate = document.getElementById('agendaDate');
const agendaList = document.getElementById('agendaList');
const upcomingList = document.getElementById('upcomingList');
const overviewAgendaCount = document.getElementById('overviewAgendaCount');

function daysFromNow(dateStr){
  const diff = (new Date(dateStr) - new Date(todayISO()));
  return Math.round(diff / 86400000);
}

function renderAgenda(){
  const sorted = state.agenda.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
  const within30 = sorted.filter(a => {
    const d = daysFromNow(a.date);
    return d >= 0 && d <= 30;
  });

  if (sorted.length === 0){
    agendaList.innerHTML = '<li class="empty-line">Belum ada agenda jangka panjang yang dicatat.</li>';
  } else {
    agendaList.innerHTML = sorted.map(a => `
      <li>
        <span>${escapeHTML(a.text)}</span>
        <span>
          <span class="agenda-badge">${new Date(a.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})} · H-${Math.max(daysFromNow(a.date),0)}</span>
          <button class="agenda-del" data-id="${a.id}" aria-label="Hapus agenda">✕</button>
        </span>
      </li>
    `).join('');
  }

  overviewAgendaCount.textContent = within30.length;

  if (within30.length === 0){
    upcomingList.innerHTML = '<li class="empty-line">Belum ada agenda yang dicatat.</li>';
  } else {
    upcomingList.innerHTML = within30.slice(0,5).map(a => `
      <li>
        <span>${escapeHTML(a.text)}</span>
        <span class="agenda-badge">H-${daysFromNow(a.date)}</span>
      </li>
    `).join('');
  }
}

agendaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = agendaInput.value.trim();
  const date = agendaDate.value;
  if (!text || !date) return;
  state.agenda.push({ id: Date.now(), text, date });
  save(STORE_KEYS.agenda, state.agenda);
  agendaForm.reset();
  renderAgenda();
});

agendaList.addEventListener('click', (e) => {
  const btn = e.target.closest('.agenda-del');
  if (!btn) return;
  state.agenda = state.agenda.filter(a => a.id !== Number(btn.dataset.id));
  save(STORE_KEYS.agenda, state.agenda);
  renderAgenda();
});

/* ================= FOKUS & LOFI ================= */
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const vinyl = document.getElementById('vinyl');
const miniPlayBtn = document.getElementById('miniPlayBtn');
const miniBars = document.querySelector('.mini-bars');
const miniIconPlay = miniPlayBtn.querySelector('.icon-play');
const miniIconPause = miniPlayBtn.querySelector('.icon-pause');

function setPlayingUI(isPlaying){
  vinyl.classList.toggle('is-spinning', isPlaying);
  miniBars.classList.toggle('is-playing', isPlaying);
  miniIconPlay.hidden = isPlaying;
  miniIconPause.hidden = !isPlaying;
  playBtn.textContent = isPlaying ? '⏸ Jeda' : '▶ Putar';
}

function togglePlay(){
  if (audio.paused){
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}
playBtn.addEventListener('click', togglePlay);
miniPlayBtn.addEventListener('click', togglePlay);
audio.addEventListener('play', () => setPlayingUI(true));
audio.addEventListener('pause', () => setPlayingUI(false));

/* ---- Pomodoro timer ---- */
const timerDisplay = document.getElementById('timerDisplay');
const timerStartBtn = document.getElementById('timerStartBtn');
const timerResetBtn = document.getElementById('timerResetBtn');
const modeBtns = document.querySelectorAll('.mode-btn');

let timerMins = 25;
let secondsLeft = timerMins * 60;
let timerInterval = null;

function renderTimer(){
  const m = Math.floor(secondsLeft / 60).toString().padStart(2,'0');
  const s = (secondsLeft % 60).toString().padStart(2,'0');
  timerDisplay.textContent = `${m}:${s}`;
}
renderTimer();

timerStartBtn.addEventListener('click', () => {
  if (timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
    timerStartBtn.textContent = 'Mulai';
    return;
  }
  timerStartBtn.textContent = 'Jeda';
  timerInterval = setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0){
      clearInterval(timerInterval);
      timerInterval = null;
      timerStartBtn.textContent = 'Mulai';
      secondsLeft = 0;
    }
    renderTimer();
  }, 1000);
});

timerResetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerStartBtn.textContent = 'Mulai';
  secondsLeft = timerMins * 60;
  renderTimer();
});

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    modeBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    timerMins = Number(btn.dataset.mins);
    clearInterval(timerInterval);
    timerInterval = null;
    timerStartBtn.textContent = 'Mulai';
    secondsLeft = timerMins * 60;
    renderTimer();
  });
});

/* ================= EVALUATOR BOT ================= */
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatLog = document.getElementById('chatLog');

function addChatMsg(text, who){
  const div = document.createElement('div');
  div.className = `chat-msg ${who}`;
  div.innerHTML = who === 'bot'
    ? `<span class="chat-avatar">🤖</span><p></p>`
    : `<span class="chat-avatar">🙂</span><p></p>`;
  div.querySelector('p').textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function evaluateProgress(){
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done/total)*100);
  const spent = state.expenses.reduce((sum, e) => sum + e.amount, 0);

  let taskLine;
  if (total === 0) taskLine = 'Belum ada tugas yang dicatat hari ini.';
  else if (pct === 100) taskLine = `Mantap, semua ${total} tugas hari ini sudah selesai! 🎉`;
  else if (pct >= 50) taskLine = `Progress bagus: ${done} dari ${total} tugas selesai (${pct}%). Lanjutkan!`;
  else taskLine = `Baru ${done} dari ${total} tugas selesai (${pct}%). Coba selesaikan satu lagi sekarang.`;

  let sakuLine;
  if (!state.balanceSet) sakuLine = 'Saku Tracker belum diatur, jadi belum bisa dievaluasi.';
  else if (spent === 0) sakuLine = 'Belum ada pengeluaran tercatat hari ini, keuanganmu aman.';
  else sakuLine = `Total pengeluaran tercatat: ${fmtRupiah(spent)}, sisa tabungan ${fmtRupiah(state.balance)}.`;

  return `${taskLine} ${sakuLine}`;
}

function botReply(userText){
  const t = userText.toLowerCase();
  if (t.includes('evaluasi') || t.includes('progress') || t.includes('gimana')){
    return evaluateProgress();
  }
  if (t.includes('capek') || t.includes('lelah') || t.includes('malas')){
    return 'Wajar kok kalau capek. Coba istirahat sebentar atau nyalain Lofi Focus di menu Fokus, lalu kembali lagi kalau sudah siap.';
  }
  if (t.includes('makasih') || t.includes('terima kasih')){
    return 'Sama-sama! Semangat terus ya 💪';
  }
  if (t.includes('halo') || t.includes('hai') || t.includes('hi')){
    return 'Halo juga! Ada yang mau dicatat atau dievaluasi hari ini?';
  }
  return 'Dicatat! Ketik "evaluasi" kapan saja kalau mau aku cek progress tugas dan tabunganmu.';
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  addChatMsg(text, 'user');
  chatInput.value = '';
  setTimeout(() => addChatMsg(botReply(text), 'bot'), 350);
});

/* ================= INIT ================= */
renderBalance();
renderReceipt();
renderTasks();
renderAgenda();
