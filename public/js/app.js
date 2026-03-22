let currentResult = null;

const pages = {
    home: document.getElementById('page-home'),
    tools: document.getElementById('page-tools'),
    about: document.getElementById('page-about')
};

const navItems = document.querySelectorAll('.nav-item');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = item.getAttribute('data-page');
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        Object.keys(pages).forEach(key => pages[key].classList.remove('active'));
        pages[pageId].classList.add('active');
        if (navMenu) navMenu.classList.remove('active');
    });
});

function showOutput(html) {
    const output = document.getElementById('output-content');
    if (output) output.innerHTML = html;
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) copyBtn.style.display = 'block';
}

function showError(msg) {
    const output = document.getElementById('output-content');
    if (output) output.innerHTML = `<div style="color: #ff6666">error: ${msg}</div>`;
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) copyBtn.style.display = 'none';
}

function showLoading() {
    const output = document.getElementById('output-content');
    if (output) output.innerHTML = `<div style="color: #888">loading...</div>`;
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) copyBtn.style.display = 'none';
}

function formatNIK(data) {
    if (!data || !data.nama) return '<div style="color:#ff6666">data tidak ditemukan</div>';
    return `
        <div style="border-left: 2px solid #ff4d4d; padding-left: 12px;">
            <div><span style="color:#888">nik</span> : ${data.nik || '-'}</div>
            <div><span style="color:#888">nama</span> : ${data.nama}</div>
            <div><span style="color:#888">ttl</span> : ${data.ttl || '-'}</div>
            <div><span style="color:#888">jk</span> : ${data.jenis_kelamin || '-'}</div>
            <div><span style="color:#888">status</span> : ${data.status_perkawinan || '-'}</div>
            <div><span style="color:#888">pekerjaan</span> : ${data.pekerjaan || '-'}</div>
            <div><span style="color:#888">alamat</span> : ${data.alamat || '-'}</div>
            <div><span style="color:#888">kelurahan</span> : ${data.kelurahan || '-'}</div>
            <div><span style="color:#888">kecamatan</span> : ${data.kecamatan || '-'}</div>
            <div><span style="color:#888">kab/kota</span> : ${data.kabupaten || '-'}</div>
            <div><span style="color:#888">provinsi</span> : ${data.provinsi || '-'}</div>
        </div>
    `;
}

function formatWallet(data) {
    if (!data) return '<div style="color:#ff6666">tidak ditemukan</div>';
    return `<pre style="margin:0; color:#aaa; font-size:0.75rem">${JSON.stringify(data, null, 2)}</pre>`;
}

function formatIP(data) {
    if (!data || data.status === 'fail') return '<div style="color:#ff6666">ip tidak valid</div>';
    return `
        <div style="border-left: 2px solid #ff4d4d; padding-left: 12px;">
            <div><span style="color:#888">ip</span> : ${data.query}</div>
            <div><span style="color:#888">negara</span> : ${data.country} (${data.countryCode})</div>
            <div><span style="color:#888">kota</span> : ${data.city}, ${data.regionName}</div>
            <div><span style="color:#888">isp</span> : ${data.isp}</div>
            <div><span style="color:#888">lokasi</span> : ${data.lat}, ${data.lon}</div>
        </div>
    `;
}

function formatNama(data) {
    if (!data) return '<div style="color:#ff6666">tidak ditemukan</div>';
    return `<pre style="margin:0; color:#aaa; font-size:0.75rem">${JSON.stringify(data, null, 2)}</pre>`;
}

async function cekNik() {
    const nik = document.getElementById('nik-input')?.value.trim();
    if (!nik || nik.length !== 16 || isNaN(nik)) {
        showError('NIK harus 16 digit angka');
        return;
    }
    showLoading();
    try {
        const res = await fetch('/api/nik', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nik })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'gagal');
        }
        const data = await res.json();
        showOutput(formatNIK(data));
        currentResult = data;
    } catch (err) {
        showError(err.message);
    }
}

async function cekWallet() {
    const bank = document.getElementById('wallet-bank')?.value;
    const number = document.getElementById('wallet-number')?.value.trim();
    if (!number) {
        showError('masukkan nomor hp');
        return;
    }
    showLoading();
    try {
        const res = await fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bank, number })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'gagal');
        }
        const data = await res.json();
        showOutput(formatWallet(data));
        currentResult = data;
    } catch (err) {
        showError(err.message);
    }
}

async function cekIp() {
    const ip = document.getElementById('ip-input')?.value.trim();
    if (!ip) {
        showError('masukkan ip address');
        return;
    }
    showLoading();
    try {
        const res = await fetch(`/api/ip?ip=${encodeURIComponent(ip)}`);
        if (!res.ok) throw new Error('gagal');
        const data = await res.json();
        showOutput(formatIP(data));
        currentResult = data;
    } catch (err) {
        showError(err.message);
    }
}

async function cekNama() {
    const nama = document.getElementById('nama-input')?.value.trim();
    if (!nama || nama.length < 3) {
        showError('nama minimal 3 karakter');
        return;
    }
    showLoading();
    try {
        const res = await fetch(`/api/nama?nama=${encodeURIComponent(nama)}`);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'gagal');
        }
        const data = await res.json();
        showOutput(formatNama(data));
        currentResult = data;
    } catch (err) {
        showError(err.message);
    }
}

document.getElementById('nik-btn')?.addEventListener('click', cekNik);
document.getElementById('wallet-btn')?.addEventListener('click', cekWallet);
document.getElementById('ip-btn')?.addEventListener('click', cekIp);
document.getElementById('nama-btn')?.addEventListener('click', cekNama);

document.getElementById('copy-btn')?.addEventListener('click', () => {
    if (currentResult) {
        navigator.clipboard.writeText(JSON.stringify(currentResult, null, 2));
        alert('copied');
    }
});

document.getElementById('nik-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') cekNik(); });
document.getElementById('wallet-number')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') cekWallet(); });
document.getElementById('ip-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') cekIp(); });
document.getElementById('nama-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') cekNama(); });
