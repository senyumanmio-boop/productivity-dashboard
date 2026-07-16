/* ===================================================================
   RUANG — Complete Productivity Dashboard v2 — Logic
   All data stored locally via localStorage
=================================================================== */

const STORE_KEYS = {
  balance: 'ruang_balance',
  balanceSet: 'ruang_balance_set',
  expenses: 'ruang_expenses',
  monthBudget: 'ruang_month_budget',
  tasks: 'ruang_tasks',
  habits: 'ruang_habits',
  timeBlocks: 'ruang_time_blocks',
  goals: 'ruang_goals',
  mood: 'ruang_mood',
  health: 'ruang_health',
  journal: 'ruang_journal',
  projects: 'ruang_projects',
  agenda: 'ruang_agenda',
  streak: 'ruang_streak',
};

const load = (key, fallback) => {
  try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch(e){ return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

let state = {
  balance: load(STORE_KEYS.balance, 0),
  balanceSet: load(STORE_KEYS.balanceSet, false),
  monthBudget: load(STORE_KEYS.monthBudget, 1000000),
  expenses: load(STORE_KEYS.expenses, []),
  tasks: load(STORE_KEYS.tasks, []),
  habits: load(STORE_KEYS.habits, []),
  timeBlocks: load(STORE_KEYS.timeBlocks, []),
  goals: load(STORE_KEYS.goals, []),
  moodData: load(STORE_KEYS.mood, []),
  healthData: load(STORE_KEYS.health, []),
  journal: load(STORE_KEYS.journal, []),
  projects: load(STORE_KEYS.projects, []),
  agenda: load(STORE_KEYS.agenda, []),
  streak: load(STORE_KEYS.streak, 0),
};

const fmtRupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const todayISO = () => new Date().toISOString().slice(0,10);
const escapeHTML = (str) => { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; };

/* ================= NAVIGATION ================= */
const navItems = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.panel');

function goToPanel(target){
  panels.forEach(p => p.classList.toggle('is-active', p.id === target));
  navItems.forEach(n => n.classList.toggle('is-active', n.dataset.target === target));
  document.querySelector('.sidebar')?.classList.remove('is-open');
}

navItems.forEach(btn => { btn.addEventListener('click', () => goToPanel(btn.dataset.target)); });
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

/* ================= TASKS ================= */
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskCategory = document.getElementById('taskCategory');
const taskList = document.getElementById('taskList');
const taskProgressFill = document.getElementById('taskProgressFill');
const taskProgressLabel = document.getElementById('taskProgressLabel');
const tabBtns = document.querySelectorAll('.tab-btn');

const catLabel = { tugas: 'Tugas', latihan: 'Latihan', jadwal: 'Jadwal' };
let taskFilter = 'all';

function renderTasks(){
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((done/total)*100);

  let filtered = state.tasks;
  if (taskFilter === 'done') filtered = state.tasks.filter(t => t.done);
  else if (taskFilter !== 'all') filtered = state.tasks.filter(t => t.category === taskFilter);

  if (filtered.length === 0){
    taskList.innerHTML = '<li class="empty-line">Belum ada tugas. Mulai dengan menambah tugas pertama! 🎯</li>';
  } else {
    taskList.innerHTML = filtered.map(t => `
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
}

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  state.tasks.push({ id: Date.now(), text, category: taskCategory.value, done: false });
  save(STORE_KEYS.tasks, state.tasks);
  taskForm.reset();
  renderTasks();
  updateDashboard();
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
  updateDashboard();
});

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    taskFilter = btn.dataset.filter;
    renderTasks();
  });
});

/* ================= HABITS ================= */
const habitForm = document.getElementById('habitForm');
const habitName = document.getElementById('habitName');
const habitFreq = document.getElementById('habitFreq');
const habitsList = document.getElementById('habitsList');

function renderHabits(){
  if (state.habits.length === 0){
    habitsList.innerHTML = '<li class="empty-line">Belum ada kebiasaan. Mulai buat kebiasaan sehat sekarang! 💪</li>';
  } else {
    habitsList.innerHTML = state.habits.map(h => {
      const today = h.lastDone === todayISO();
      return `
        <li class="habit-item">
          <button class="habit-check ${today ? 'is-done' : ''}" data-id="${h.id}" data-action="toggle" aria-label="Tandai selesai"></button>
          <div class="habit-info">
            <div class="habit-name">${escapeHTML(h.name)}</div>
            <div class="habit-meta">${h.freq === 'daily' ? 'Setiap hari' : h.freq === 'weekly' ? 'Setiap minggu' : 'Setiap bulan'}</div>
          </div>
          <div class="habit-stat">
            <span class="habit-stat-badge">${h.streak || 0} hari</span>
            <button class="habit-del" data-id="${h.id}" data-action="delete" aria-label="Hapus">
              <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>
        </li>
      `;
    }).join('');
  }
}

habitForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = habitName.value.trim();
  if (!name) return;
  state.habits.push({ id: Date.now(), name, freq: habitFreq.value, streak: 0, lastDone: null });
  save(STORE_KEYS.habits, state.habits);
  habitForm.reset();
  renderHabits();
  updateDashboard();
});

habitsList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const h = state.habits.find(h => h.id === id);
  if (!h) return;
  if (btn.dataset.action === 'toggle'){
    if (h.lastDone === todayISO()){
      h.lastDone = null;
      h.streak = 0;
    } else {
      h.lastDone = todayISO();
      h.streak = (h.streak || 0) + 1;
    }
  } else if (btn.dataset.action === 'delete'){
    state.habits = state.habits.filter(x => x.id !== id);
  }
  save(STORE_KEYS.habits, state.habits);
  renderHabits();
  updateDashboard();
});

/* ================= TIME BLOCKING ================= */
const timeBlockForm = document.getElementById('timeBlockForm');
const blockName = document.getElementById('blockName');
const blockStart = document.getElementById('blockStart');
const blockEnd = document.getElementById('blockEnd');
const blockColor = document.getElementById('blockColor');
const timeline = document.getElementById('timeline');

function renderTimeBlocks(){
  if (state.timeBlocks.length === 0){
    timeline.innerHTML = '<div class="empty-line">Belum ada time block. Mulai atur jadwal harian Anda.</div>';
  } else {
    const sorted = state.timeBlocks.slice().sort((a, b) => a.start.localeCompare(b.start));
    timeline.innerHTML = sorted.map(tb => `
      <div class="time-block-item">
        <div class="time-block-color" style="background: ${tb.color}"></div>
        <div class="time-block-info">
          <div class="time-block-name">${escapeHTML(tb.name)}</div>
          <div class="time-block-time">${tb.start} - ${tb.end}</div>
        </div>
        <button class="task-del" data-id="${tb.id}" data-action="delete" aria-label="Hapus">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
    `).join('');
  }
}

timeBlockForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = blockName.value.trim();
  const start = blockStart.value;
  const end = blockEnd.value;
  if (!name || !start || !end) return;
  state.timeBlocks.push({ id: Date.now(), name, start, end, color: blockColor.value });
  save(STORE_KEYS.timeBlocks, state.timeBlocks);
  timeBlockForm.reset();
  renderTimeBlocks();
});

timeline.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn || btn.dataset.action !== 'delete') return;
  const id = Number(btn.dataset.id);
  state.timeBlocks = state.timeBlocks.filter(t => t.id !== id);
  save(STORE_KEYS.timeBlocks, state.timeBlocks);
  renderTimeBlocks();
});

/* ================= GOALS ================= */
const goalForm = document.getElementById('goalForm');
const goalName = document.getElementById('goalName');
const goalDesc = document.getElementById('goalDesc');
const goalType = document.getElementById('goalType');
const goalsList = document.getElementById('goalsList');

function renderGoals(){
  if (state.goals.length === 0){
    goalsList.innerHTML = '<div class="empty-line">Belum ada goal. Tentukan tujuan Anda sekarang!</div>';
  } else {
    goalsList.innerHTML = state.goals.map(g => `
      <div class="goal-card">
        <div class="goal-header">
          <div class="goal-name">${escapeHTML(g.name)}</div>
          <span class="goal-type-badge">${g.type === 'short' ? '< 1 bulan' : g.type === 'medium' ? '1-6 bulan' : '6+ bulan'}</span>
        </div>
        <div style="font-size: 13px; color: var(--text-low); margin: 4px 0;">${escapeHTML(g.desc)}</div>
        <div class="goal-progress"><div class="goal-progress-bar" style="width: ${g.progress || 0}%"></div></div>
        <div style="display: flex; gap: 6px; margin-top: 8px; font-size: 12px;">
          <input type="range" min="0" max="100" value="${g.progress || 0}" data-id="${g.id}" class="goal-progress-input" style="flex: 1;">
          <button class="goal-del" data-id="${g.id}" aria-label="Hapus" style="background: none; border: none; color: var(--text-low); cursor: pointer; width: 20px;">
            <svg viewBox="0 0 24 24" style="width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.6;"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>
      </div>
    `).join('');
    
    document.querySelectorAll('.goal-progress-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = Number(e.target.dataset.id);
        const g = state.goals.find(g => g.id === id);
        if (g) g.progress = parseInt(e.target.value);
        save(STORE_KEYS.goals, state.goals);
        renderGoals();
      });
    });

    document.querySelectorAll('.goal-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        state.goals = state.goals.filter(g => g.id !== id);
        save(STORE_KEYS.goals, state.goals);
        renderGoals();
      });
    });
  }
}

goalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = goalName.value.trim();
  if (!name) return;
  state.goals.push({ id: Date.now(), name, desc: goalDesc.value.trim(), type: goalType.value, progress: 0 });
  save(STORE_KEYS.goals, state.goals);
  goalForm.reset();
  renderGoals();
});

/* ================= MONEY ================= */
const balanceDisplay = document.getElementById('balanceDisplay');
const dashBalance = document.getElementById('dashBalance');
const monthSpent = document.getElementById('monthSpent');
const budgetLeft = document.getElementById('budgetLeft');
const setBalanceForm = document.getElementById('setBalanceForm');
const initialBalanceInput = document.getElementById('initialBalanceInput');
const setBalanceBtn = document.getElementById('setBalanceBtn');
const expenseForm = document.getElementById('expenseForm');
const expenseDesc = document.getElementById('expenseDesc');
const expenseCategory = document.getElementById('expenseCategory');
const expenseAmount = document.getElementById('expenseAmount');
const receiptBody = document.getElementById('receiptBody');
const clearExpenseBtn = document.getElementById('clearExpenseBtn');

function renderBalance(){
  balanceDisplay.textContent = fmtRupiah(state.balance);
  dashBalance.textContent = fmtRupiah(state.balance);
  setBalanceForm.style.display = state.balanceSet ? 'none' : 'flex';
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthExpenses = state.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const spent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  monthSpent.textContent = fmtRupiah(spent);
  budgetLeft.textContent = fmtRupiah(Math.max(state.monthBudget - spent, 0));
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

setBalanceBtn.addEventListener('click', () => {
  const val = parseFloat(initialBalanceInput.value);
  if (isNaN(val) || val < 0) return;
  state.balance = val;
  state.balanceSet = true;
  save(STORE_KEYS.balance, state.balance);
  save(STORE_KEYS.balanceSet, state.balanceSet);
  initialBalanceInput.value = '';
  renderBalance();
  updateDashboard();
});

expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const desc = expenseDesc.value.trim();
  const amount = parseFloat(expenseAmount.value);
  if (!desc || isNaN(amount) || amount <= 0) return;
  state.balance -= amount;
  state.expenses.push({ desc, amount, category: expenseCategory.value, date: new Date().toISOString() });
  save(STORE_KEYS.balance, state.balance);
  save(STORE_KEYS.expenses, state.expenses);
  expenseForm.reset();
  renderBalance();
  renderReceipt();
  updateDashboard();
});

clearExpenseBtn?.addEventListener('click', () => {
  if (confirm('Hapus semua pengeluaran? Tindakan ini tidak bisa dibatalkan.')) {
    state.expenses = [];
    save(STORE_KEYS.expenses, state.expenses);
    renderReceipt();
    renderBalance();
    updateDashboard();
  }
});

/* ================= MOOD & HEALTH ================= */
const moodBtns = document.querySelectorAll('.mood-btn');
const healthForm = document.getElementById('healthForm');
const sleepHours = document.getElementById('sleepHours');
const waterGlasses = document.getElementById('waterGlasses');
const moodList = document.getElementById('moodList');
const moodEmoji = document.getElementById('moodEmoji');
const moodText = document.getElementById('moodText');

const moodMap = { terrible: '😢', bad: '😞', neutral: '😐', good: '😊', excellent: '😄' };
const moodLabel = { terrible: 'Sangat Buruk', bad: 'Buruk', neutral: 'Biasa Saja', good: 'Baik', excellent: 'Sangat Baik' };

moodBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    moodBtns.forEach(b => b.classList.remove('is-selected'));
    btn.classList.add('is-selected');
    const mood = btn.dataset.mood;
    state.moodData.push({ mood, time: new Date().toISOString() });
    save(STORE_KEYS.mood, state.moodData);
    renderMoodList();
    updateDashboard();
  });
});

healthForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const sleep = parseFloat(sleepHours.value) || 0;
  const water = parseFloat(waterGlasses.value) || 0;
  state.healthData.push({ sleep, water, date: todayISO() });
  save(STORE_KEYS.health, state.healthData);
  healthForm.reset();
  renderMoodList();
});

function renderMoodList(){
  if (state.moodData.length === 0 && state.healthData.length === 0){
    moodList.innerHTML = '<li class="empty-line">Belum ada catatan. Mulai tracking mood Anda sekarang!</li>';
  } else {
    moodList.innerHTML = state.moodData.slice().reverse().slice(0, 20).map(m => `
      <li class="mood-entry">
        <span>${moodMap[m.mood]} ${moodLabel[m.mood]}</span>
        <span class="mood-time">${new Date(m.time).toLocaleTimeString('id-ID')}</span>
      </li>
    `).join('');
  }
}

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

/* ---- Pomodoro Timer ---- */
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
      alert('Sesi Pomodoro selesai! Waktu untuk istirahat.');
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

/* ================= JOURNAL ================= */
const journalForm = document.getElementById('journalForm');
const journalTitle = document.getElementById('journalTitle');
const journalBody = document.getElementById('journalBody');
const journalType = document.getElementById('journalType');
const journalList = document.getElementById('journalList');

function renderJournal(){
  if (state.journal.length === 0){
    journalList.innerHTML = '<div class="empty-line">Belum ada catatan. Mulai menulis journalmu sekarang!</div>';
  } else {
    journalList.innerHTML = state.journal.slice().reverse().map(j => `
      <div class="journal-card">
        <div class="journal-header" style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <div class="journal-title">${escapeHTML(j.title)}</div>
            <div class="journal-type" style="display: inline-block;">${j.type === 'journal' ? '📓 Journal' : j.type === 'reflection' ? '🤔 Reflection' : j.type === 'idea' ? '💡 Idea' : '🙏 Gratitude'}</div>
          </div>
        </div>
        <div class="journal-body">${escapeHTML(j.body)}</div>
        <div class="journal-meta">
          <span>${new Date(j.date).toLocaleDateString('id-ID')}</span>
          <button class="journal-del" data-id="${j.id}" aria-label="Hapus">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
          </button>
        </div>
      </div>
    `).join('');
    
    document.querySelectorAll('.journal-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        state.journal = state.journal.filter(j => j.id !== id);
        save(STORE_KEYS.journal, state.journal);
        renderJournal();
      });
    });
  }
}

journalForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = journalTitle.value.trim();
  const body = journalBody.value.trim();
  if (!title || !body) return;
  state.journal.push({ id: Date.now(), title, body, type: journalType.value, date: new Date().toISOString() });
  save(STORE_KEYS.journal, state.journal);
  journalForm.reset();
  renderJournal();
});

/* ================= PROJECTS ================= */
const projectForm = document.getElementById('projectForm');
const projectName = document.getElementById('projectName');
const projectDesc = document.getElementById('projectDesc');
const projectsList = document.getElementById('projectsList');

function renderProjects(){
  if (state.projects.length === 0){
    projectsList.innerHTML = '<li class="empty-line">Belum ada project. Mulai buat project baru!</li>';
  } else {
    projectsList.innerHTML = state.projects.map(p => `
      <li class="project-item">
        <div style="flex: 1;">
          <div class="project-name">${escapeHTML(p.name)}</div>
          <div class="project-tasks">${p.desc || 'Tidak ada deskripsi'}</div>
        </div>
        <button class="project-del" data-id="${p.id}" aria-label="Hapus" style="background: none; border: none; color: var(--text-low); cursor: pointer;">
          <svg viewBox="0 0 24 24" style="width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.6;"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </li>
    `).join('');
    
    document.querySelectorAll('.project-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        state.projects = state.projects.filter(p => p.id !== id);
        save(STORE_KEYS.projects, state.projects);
        renderProjects();
      });
    });
  }
}

projectForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = projectName.value.trim();
  if (!name) return;
  state.projects.push({ id: Date.now(), name, desc: projectDesc.value.trim() });
  save(STORE_KEYS.projects, state.projects);
  projectForm.reset();
  renderProjects();
});

/* ================= AGENDA ================= */
const agendaForm = document.getElementById('agendaForm');
const agendaInput = document.getElementById('agendaInput');
const agendaDate = document.getElementById('agendaDate');
const agendaList = document.getElementById('agendaList');
const miniCalendar = document.getElementById('miniCalendar');

function daysFromNow(dateStr){
  const diff = (new Date(dateStr) - new Date(todayISO()));
  return Math.round(diff / 86400000);
}

function renderAgenda(){
  const sorted = state.agenda.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
  
  if (sorted.length === 0){
    agendaList.innerHTML = '<li class="empty-line">Belum ada agenda. Tambahkan agenda baru ke kalender!</li>';
  } else {
    agendaList.innerHTML = sorted.map(a => `
      <li>
        <span>${escapeHTML(a.text)}</span>
        <span style="display: flex; gap: 8px; align-items: center;">
          <span class="agenda-badge">${new Date(a.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})} · H-${Math.max(daysFromNow(a.date),0)}</span>
          <button class="agenda-del" data-id="${a.id}" aria-label="Hapus agenda" style="background: none; border: none; color: var(--text-low); cursor: pointer;">✕</button>
        </span>
      </li>
    `).join('');
    
    document.querySelectorAll('.agenda-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.id);
        state.agenda = state.agenda.filter(a => a.id !== id);
        save(STORE_KEYS.agenda, state.agenda);
        renderAgenda();
        updateDashboard();
      });
    });
  }
}

agendaForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = agendaInput.value.trim();
  const date = agendaDate.value;
  if (!text || !date) return;
  state.agenda.push({ id: Date.now(), text, date });
  save(STORE_KEYS.agenda, state.agenda);
  agendaForm.reset();
  renderAgenda();
  updateDashboard();
});

/* ================= DASHBOARD ================= */
const todayScore = document.getElementById('todayScore');
const tasksDone = document.getElementById('tasksDone');
const habitsCount = document.getElementById('habitsCount');
const streakDays = document.getElementById('streakDays');
const todayActivity = document.getElementById('todayActivity');

function updateDashboard(){
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  const taskPct = total === 0 ? 0 : Math.round((done/total)*100);
  tasksDone.textContent = `${done}/${total}`;
  
  const todayHabits = state.habits.filter(h => h.lastDone === todayISO()).length;
  habitsCount.textContent = todayHabits;
  
  const avgScore = Math.round((taskPct + (todayHabits * 10)) / 2);
  todayScore.textContent = Math.min(100, avgScore) + '%';
  
  const lastMood = state.moodData.slice().reverse()[0];
  if (lastMood){
    moodEmoji.textContent = moodMap[lastMood.mood] || '😊';
    moodText.textContent = moodLabel[lastMood.mood] || 'Belum dicatat';
  }
  
  const activities = [];
  if (done > 0) activities.push({ icon: '✓', text: `${done} tugas selesai` });
  if (todayHabits > 0) activities.push({ icon: '💪', text: `${todayHabits} kebiasaan tercatat` });
  if (state.expenses.length > 0){
    const exp = state.expenses.filter(e => e.date.includes(todayISO())).reduce((s, e) => s + e.amount, 0);
    if (exp > 0) activities.push({ icon: '💰', text: `Pengeluaran: ${fmtRupiah(exp)}` });
  }
  
  const nextAgenda = state.agenda.filter(a => daysFromNow(a.date) >= 0).sort((a,b) => new Date(a.date) - new Date(b.date))[0];
  if (nextAgenda) activities.push({ icon: '📅', text: `Agenda: ${escapeHTML(nextAgenda.text)} (H-${daysFromNow(nextAgenda.date)})` });
  
  if (activities.length === 0){
    todayActivity.innerHTML = '<div class="empty-line">Mulai aktifitas Anda dengan menambah tugas atau kebiasaan hari ini!</div>';
  } else {
    todayActivity.innerHTML = activities.map(a => `<div class="activity-item"><span class="activity-icon">${a.icon}</span><span class="activity-text">${a.text}</span></div>`).join('');
  }
}

/* ================= INIT ================= */
renderBalance();
renderReceipt();
renderTasks();
renderHabits();
renderTimeBlocks();
renderGoals();
renderMoodList();
renderJournal();
renderProjects();
renderAgenda();
updateDashboard();

// Update dashboard setiap menit
setInterval(updateDashboard, 60000);
