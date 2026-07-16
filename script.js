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
