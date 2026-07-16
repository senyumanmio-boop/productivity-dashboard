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
