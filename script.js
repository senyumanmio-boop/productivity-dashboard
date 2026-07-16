// --- STATE / DATA Awal ---
let tabungan = 0;

// --- ELEMENT SELECTOR ---
const totalTabunganEl = document.getElementById('total-tabungan');
const inputAwalEl = document.getElementById('input-awal');
const btnSetAwal = document.getElementById('btn-set-awal');

const namaBarangEl = document.getElementById('nama-barang');
const nominalBelanjaEl = document.getElementById('nominal-belanja');
const btnKurangTabungan = document.getElementById('btn-kurang-tabungan');

const inputTugasEl = document.getElementById('input-tugas');
const btnTambahTugas = document.getElementById('btn-tambah-tugas');
const listTugasEl = document.getElementById('list-tugas');

const tanggalAgendaEl = document.getElementById('tanggal-agenda');
const namaAgendaEl = document.getElementById('nama-agenda');
const btnTambahAgenda = document.getElementById('btn-tambah-agenda');
const listAgendaEl = document.getElementById('list-agenda');

// --- 1. FUNGSI SAKU TRACKER ---
function updateUIAngka() {
    totalTabunganEl.innerText = `Rp ${tabungan.toLocaleString('id-ID')}`;
}

btnSetAwal.addEventListener('click', () => {
    const nilaiAwal = parseInt(inputAwalEl.value);
    if (!isNaN(nilaiAwal) && nilaiAwal > 0) {
        tabungan = nilaiAwal;
        updateUIAngka();
        inputAwalEl.value = '';
    }
});

btnKurangTabungan.addEventListener('click', () => {
    const nama = namaBarangEl.value.trim();
    const nominal = parseInt(nominalBelanjaEl.value);

    if (nama === '' || isNaN(nominal) || nominal <= 0) {
        alert('Isi nama barang dan nominal dengan benar!');
        return;
    }

    if (nominal > tabungan) {
        alert('Tabungan kamu gak cukup buat jajan ini! 😭');
        return;
    }

    tabungan -= nominal;
    updateUIAngka();

    // Reset input setelah berhasil
    namaBarangEl.value = '';
    nominalBelanjaEl.value = '';
});

// --- 2. FUNGSI TO-DO LIST (HARI INI NGAPAIN AJA) ---
btnTambahTugas.addEventListener('click', () => {
    const teksTugas = inputTugasEl.value.trim();
    if (teksTugas === '') return;

    const li = document.createElement('li');
    li.innerHTML = `
        <span>${teksTugas}</span>
        <button onclick="this.parentElement.remove()" style="color: red; background: none; border: none; cursor: pointer;">✗</button>
    `;
    listTugasEl.appendChild(li);
    inputTugasEl.value = '';
});

// --- 3. FUNGSI AGENDA BULANAN ---
btnTambahAgenda.addEventListener('click', () => {
    const tanggal = tanggalAgendaEl.value;
    const agenda = namaAgendaEl.value.trim();

    if (tanggal === '' || agenda === '') {
        alert('Pilih tanggal dan isi nama agendanya dulu!');
        return;
    }

    const li = document.createElement('li');
    li.innerHTML = `<strong>${tanggal}</strong> - ${agenda}`;
    listAgendaEl.appendChild(li);

    // Reset input
    tanggalAgendaEl.value = '';
    namaAgendaEl.value = '';
});
// ================= STATE MANAGEMENT =================
let appState = {
    saldo: 0,
    pengeluaran: [],
    tugas: [],
    agenda: []
};

// Load data dari LocalStorage saat pertama kali web dibuka
if(localStorage.getItem('dashboard_state')) {
    appState = JSON.parse(localStorage.getItem('dashboard_state'));
}

// Fungsi Simpan State Otomatis
function saveState() {
    localStorage.setItem('dashboard_state', JSON.stringify(appState));
    renderUI();
}

// ================= RENDER INTERFACE UI =================
function renderUI() {
    // 1. Render Saldo
    document.getElementById('display-saldo').innerText = `Rp ${appState.saldo.toLocaleString('id-ID')}`;

    // 2. Render Riwayat Pengeluaran
    const riwayatEl = document.getElementById('list-riwayat');
    if (appState.pengeluaran.length === 0) {
        riwayatEl.innerHTML = `<li class="empty-state">Belum ada pengeluaran.</li>`;
    } else {
        riwayatEl.innerHTML = appState.pengeluaran.map((item, idx) => `
            <li>
                <span>${item.nama}</span>
                <span class="negatif">-Rp ${item.nominal.toLocaleString('id-ID')}</span>
                <button onclick="hapusPengeluaran(${idx})">✗</button>
            </li>
        `).join('');
    }

    // 3. Render To-Do List
    const tugasEl = document.getElementById('list-tugas');
    tugasEl.innerHTML = appState.tugas.map((t, idx) => `
        <li class="${t.selesai ? 'done' : ''}">
            <span onclick="toggleTugas(${idx})">${t.teks}</span>
            <button onclick="hapusTugas(${idx})">✗</button>
        </li>
    `).join('');

    // 4. Render Agenda Bulanan
    const agendaEl = document.getElementById('list-agenda');
    agendaEl.innerHTML = appState.agenda.map((a, idx) => `
        <li>
            <span>📅 <strong>${a.tanggal}</strong> - ${a.nama}</span>
            <button onclick="hapusAgenda(${idx})">✗</button>
        </li>
    `).join('');
}

// ================= CONTROLLER / ACTION HANDLING =================
// Set Saldo Awal
document.getElementById('btn-set-saldo').addEventListener('click', () => {
    const val = parseInt(document.getElementById('input-saldo-awal').value);
    if(!isNaN(val) && val >= 0) {
        appState.saldo = val;
        document.getElementById('input-saldo-awal').value = '';
        saveState();
    }
});

// Potong Saldo (Belanja Baru)
document.getElementById('btn-potong-saldo').addEventListener('click', () => {
    const nama = document.getElementById('belanja-nama').value.trim();
    const nominal = parseInt(document.getElementById('belanja-nominal').value);

    if(!nama || isNaN(nominal) || nominal <= 0) return alert("Data belanja tidak valid!");
    if(nominal > appState.saldo) return alert("Saldo kamu tidak mencukupi!");

    appState.saldo -= nominal;
    appState.pengeluaran.push({ nama, nominal });
    
    document.getElementById('belanja-nama').value = '';
    document.getElementById('belanja-nominal').value = '';
    saveState();
});

// Tambah Tugas Harian
document.getElementById('btn-tambah-tugas').addEventListener('click', () => {
    const teks = document.getElementById('input-tugas').value.trim();
    if(!teks) return;
    appState.tugas.push({ teks, selesai: false });
    document.getElementById('input-tugas').value = '';
    saveState();
});

// Tambah Agenda Bulanan
document.getElementById('btn-tambah-agenda').addEventListener('click', () => {
    const tanggal = document.getElementById('agenda-tanggal').value;
    const nama = document.getElementById('agenda-nama').value.trim();
    if(!tanggal || !nama) return alert("Lengkapi tanggal dan nama agenda!");
    
    appState.agenda.push({ tanggal, nama });
    document.getElementById('agenda-tanggal').value = '';
    document.getElementById('agenda-nama').value = '';
    saveState();
});

// Fungsi Hapus (Global Helpers)
window.hapusPengeluaran = (idx) => { appState.pengeluaran.splice(idx, 1); saveState(); };
window.hapusTugas = (idx) => { appState.tugas.splice(idx, 1); saveState(); };
window.toggleTugas = (idx) => { appState.tugas[idx].selesai = !appState.tugas[idx].selesai; saveState(); };
window.hapusAgenda = (idx) => { appState.agenda.splice(idx, 1); saveState(); };


// ================= FITUR BOT INTELLIGENCE AI (OPENROUTER) =================
function toggleBotChat() {
    document.getElementById('bot-widget').classList.toggle('minimized');
}

document.getElementById('btn-send-bot').addEventListener('click', handleBotChat);
document.getElementById('bot-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') handleBotChat(); });

async function handleBotChat() {
    const inputEl = document.getElementById('bot-input');
    const userText = inputEl.value.trim();
    if(!userText) return;

    appendMessage(userText, 'user');
    inputEl.value = '';

    // Tampilkan loading placeholder
    const loadingId = appendMessage('Mengetik...', 'bot');

    try {
        // Panggil endpoint OpenRouter API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer KEY_OPENROUTER_KAMU_DISINI", // Ganti dengan OpenRouter API Key-mu
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.5-flash", // Atau model andalanmu yang lain
                "messages": [
                    {
                        "role": "system", 
                        "content": `Kamu adalah bot asisten evaluasi pribadi terintegrasi. Bantu user mereview kegiatannya. Data user saat ini: Saldo Sisa Rp ${appState.saldo}, Tugas Terdaftar: ${appState.tugas.length} buah.`
                    },
                    { "role": "user", "content": userText }
                ]
            })
        });

        const data = await response.json();
        const botReply = data.choices[0].message.content;
        
        // Ganti teks loading dengan respon asli dari AI
        document.getElementById(loadingId).innerText = botReply;
    } catch (error) {
        document.getElementById(loadingId).innerText = "Aduh, koneksi bot ke OpenRouter lagi terganggu nih.";
        console.error(error);
    }
}

function appendMessage(text, sender) {
    const msgBox = document.getElementById('bot-messages');
    const msgDiv = document.createElement('div');
    const uniqueId = 'msg-' + Date.now();
    msgDiv.className = `msg ${sender}`;
    msgDiv.id = uniqueId;
    msgDiv.innerText = text;
    msgBox.appendChild(msgDiv);
    msgBox.scrollTop = msgBox.scrollHeight;
    return uniqueId;
}

// Inisialisasi Tampilan Pertama Kali
renderUI();
// ==========================================
// 1. STATE MANAGEMENT & LOCAL STORAGE
// ==========================================
let sakuState = {
    saldo: 0,
    pengeluaran: [],
    tugas: [],
    agenda: []
};

// Load data otomatis saat halaman dibuka
if (localStorage.getItem('saku_dashboard_data')) {
    sakuState = JSON.parse(localStorage.getItem('saku_dashboard_data'));
}

function saveAndRefresh() {
    localStorage.setItem('saku_dashboard_data', JSON.stringify(sakuState));
    updateRenderUI();
}

// ==========================================
// 2. FUNGSI RENDER KE LAYAR UTAMA
// ==========================================
function updateRenderUI() {
    // Render Sisa Tabungan
    const saldoEl = document.querySelector('.balance-box h1, #total-tabungan, h1:contains("Rp")');
    if (saldoEl) {
        saldoEl.innerText = `Rp ${sakuState.saldo.toLocaleString('id-ID')}`;
    }

    // Render Riwayat Pengeluaran
    const riwayatContainer = document.querySelector('.log-list, #list-riwayat');
    if (riwayatContainer) {
        if (sakuState.pengeluaran.length === 0) {
            riwayatContainer.innerHTML = `<p class="empty-state" style="color: #666; font-size: 0.9rem;">Belum ada pengeluaran.</p>`;
        } else {
            riwayatContainer.innerHTML = sakuState.pengeluaran.map((item, idx) => `
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #1a2638;">
                    <span>${item.nama}</span>
                    <span style="color: #d32f2f;">-Rp ${item.nominal.toLocaleString('id-ID')}</span>
                    <button onclick="hapusItem('pengeluaran', ${idx})" style="background:none; border:none; color:#ff4444; cursor:pointer;">✗</button>
                </div>
            `).join('');
        }
    }

    // Render To-Do List Harian
    const todoContainer = document.querySelector('.todo-list, #list-tugas');
    if (todoContainer) {
        todoContainer.innerHTML = sakuState.tugas.map((t, idx) => `
            <li style="display:flex; justify-content:between; margin: 5px 0; text-decoration: ${t.selesai ? 'line-through' : 'none'}">
                <span onclick="toggleTugas(${idx})" style="cursor:pointer; flex-grow:1;">${t.teks}</span>
                <button onclick="hapusItem('tugas', ${idx})" style="background:none; border:none; color:#ff4444; cursor:pointer;">✗</button>
            </li>
        `).join('');
    }

    // Render Agenda Bulanan
    const agendaContainer = document.querySelector('.agenda-list, #list-agenda');
    if (agendaContainer) {
        agendaContainer.innerHTML = sakuState.agenda.map((a, idx) => `
            <div style="padding: 5px 0; border-bottom: 1px solid #1a2638; display:flex; justify-content:space-between;">
                <span>📅 <strong>${a.tanggal}</strong> - ${a.nama}</span>
                <button onclick="hapusItem('agenda', ${idx})" style="background:none; border:none; color:#ff4444; cursor:pointer;">✗</button>
            </div>
        `).join('');
    }
}

// ==========================================
// 3. LOGIKA TOMBOL & AKSI
// ==========================================

// Tombol Set Tabungan Awal
const btnSet = document.querySelector('button.btn-primary, button:contains("Set")') || document.querySelectorAll('button')[0];
if (btnSet) {
    btnSet.addEventListener('click', () => {
        const inputAwal = document.querySelector('input[placeholder*="500000"]');
        if (inputAwal && inputAwal.value) {
            sakuState.saldo = parseInt(inputAwal.value);
            inputAwal.value = '';
            saveAndRefresh();
        }
    });
}

// Tombol Kurangi Tabungan
const btnKurang = document.querySelector('.btn-danger, button:contains("Kurangi")') || document.querySelector('button[style*="red"]');
if (btnKurang) {
    btnKurang.addEventListener('click', () => {
        const inputNama = document.querySelector('input[placeholder*="Futsal, jajan"]');
        const inputNominal = document.querySelector('input[placeholder*="25000"]');
        
        if (inputNama && inputNominal && inputNama.value && inputNominal.value) {
            const nominal = parseInt(inputNominal.value);
            if (nominal > sakuState.saldo) return alert("Tabungan tidak cukup!");
            
            sakuState.saldo -= nominal;
            sakuState.pengeluaran.push({ nama: inputNama.value, nominal: nominal });
            
            inputNama.value = '';
            inputNominal.value = '';
            saveAndRefresh();
        }
    });
}

// Tombol Tambah Tugas Harian
const btnTugas = document.querySelector('button:contains("Tambah")') || document.querySelectorAll('button')[1];
if (btnTugas) {
    btnTugas.addEventListener('click', () => {
        const inputTugas = document.querySelector('input[placeholder*="tugas / agenda"]');
        if (inputTugas && inputTugas.value) {
            sakuState.tugas.push({ teks: inputTugas.value, selesai: false });
            inputTugas.value = '';
            saveAndRefresh();
        }
    });
}

// Tombol Masukkan ke Kalender (Agenda)
const btnAgenda = document.querySelector('button:contains("Masukkan")') || document.querySelector('.btn-secondary-full');
if (btnAgenda) {
    btnAgenda.addEventListener('click', () => {
        const inputTanggal = document.querySelector('input[type="date"]');
        const inputNamaAgenda = document.querySelector('input[placeholder*="Turnamen Futsal, Rapat OSIS"]');
        
        if (inputTanggal && inputNamaAgenda && inputTanggal.value && inputNamaAgenda.value) {
            sakuState.agenda.push({ tanggal: inputTanggal.value, nama: inputNamaAgenda.value });
            inputTanggal.value = '';
            inputNamaAgenda.value = '';
            saveAndRefresh();
        }
    });
}

// Global Helpers untuk Hapus & Toggle
window.hapusItem = (type, idx) => {
    sakuState[type].splice(idx, 1);
    saveAndRefresh();
};
window.toggleTugas = (idx) => {
    sakuState.tugas[idx].selesai = !sakuState.tugas[idx].selesai;
    saveAndRefresh();
};

// Jalankan render pertama kali saat web dimuat
document.addEventListener('DOMContentLoaded', updateRenderUI);
// Tambahkan UI Bot Melayang Secara Otomatis tanpa ngerusak HTML utama
document.body.insertAdjacentHTML('beforeend', `
    <div id="bot-fixed-widget" style="position:fixed; bottom:20px; right:20px; width:300px; background:#0d1624; border:1px solid #00e676; border-radius:10px; color:#fff; font-family:sans-serif; z-index:99999; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        <div id="bot-head" style="background:#142236; padding:10px; cursor:pointer; border-radius:10px 10px 0 0; display:flex; justify-content:space-between; align-items:center;">
            <span>🤖 <strong>Evaluator Bot</strong></span>
            <span id="bot-toggle-icon">▼</span>
        </div>
        <div id="bot-content" style="display:block;">
            <div id="bot-chat-box" style="height:200px; padding:10px; overflow-y:auto; font-size:0.85rem; border-bottom:1px solid #1a2638;">
                <div style="background:#142236; padding:6px 10px; border-radius:5px; margin-bottom:8px; max-width:85%;">Halo! Ada progres apa hari ini? Yuk evaluasi bareng.</div>
            </div>
            <div style="padding:8px; display:flex; gap:5px; background:#09101a;">
                <input type="text" id="chat-bot-input" placeholder="Ketik evaluasi..." style="flex-grow:1; background:#142236; border:1px solid #1a2638; color:#fff; padding:6px; border-radius:4px; outline:none; font-size:0.85rem;">
                <button id="chat-bot-send" style="background:#00e676; border:none; color:#000; font-weight:bold; padding:0 10px; border-radius:4px; cursor:pointer; font-size:0.85rem;">Kirim</button>
            </div>
        </div>
    </div>
`);

// Logic Toggle Minimize Bot
const botHead = document.getElementById('bot-head');
const botContent = document.getElementById('bot-content');
const botToggleIcon = document.getElementById('bot-toggle-icon');

botHead.addEventListener('click', () => {
    if (botContent.style.display === 'none') {
        botContent.style.display = 'block';
        botToggleIcon.innerText = '▼';
    } else {
        botContent.style.display = 'none';
        botToggleIcon.innerText = '▲';
    }
});

// Logic Kirim Chat Bot (Hubungkan ke OpenRouter)
document.getElementById('chat-bot-send').addEventListener('click', panggilBotAI);
document.getElementById('chat-bot-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') panggilBotAI(); });

async function panggilBotAI() {
    const inputChat = document.getElementById('chat-bot-input');
    const txt = inputChat.value.trim();
    if(!txt) return;

    const box = document.getElementById('bot-chat-box');
    box.innerHTML += `<div style="background:#00e676; color:#000; padding:6px 10px; border-radius:5px; margin-bottom:8px; max-width:85%; align-self:flex-end; margin-left:auto; text-align:right;">${txt}</div>`;
    inputChat.value = '';
    box.scrollTop = box.scrollHeight;

    // Loading teks
    const loadId = 'load-' + Date.now();
    box.innerHTML += `<div id="${loadId}" style="background:#142236; padding:6px 10px; border-radius:5px; margin-bottom:8px; max-width:85%;">Mengetik...</div>`;
    
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer KEY_OPENROUTER_KAMU", // Isi API Key OpenRouter kamu di sini
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.5-flash",
                "messages": [
                    { "role": "system", "content": "Kamu adalah asisten evaluator harian yang suportif dan santai." },
                    { "role": "user", "content": txt }
                ]
            })
        });
        const data = await res.json();
        document.getElementById(loadId).innerText = data.choices[0].message.content;
    } catch (err) {
        document.getElementById(loadId).innerText = "Gagal terkoneksi ke bot.";
    }
    box.scrollTop = box.scrollHeight;
}
