const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const KPU_TOKEN = "5iFp0UX0cAFcWəACaY7z3aPPVp0ɴKJSsNEOkPLxɢ4bt2n4Yy0Kʌ0TrʍsUluM6JSQnmHkzNe0aUyXYeS308HUm-0Xz64hzpyK-VoJ-74d_O38dQLvOEVxftxVZydHfKyObrbtxiyJiE-33NHOSbKHXyCTPbFbUmX8zD64oQ4UwcQCI8bkL7fvxbvRNrjBUxYzQGBroV0amOscizkpt5kibsFX5ZCYjZJzzf_J66KZ3M2k7G7tD7NPe5YAsntkj0gHCzM9A1yr4_enBfdeXtyqf3XpITLN-R16znPlyTFwL2dEKCCcGpCy2qUiFcN3JMq19yRrPS7_EL05136ojJ0seW0sBQC-Xt5m7WucNKIfwkYUB7GPXArGYyiGBdz0p97dm9YEuffCHZDnGAyZ7u2x2-qIHZvOWlL6H4W65lcawOtOiath72UTQTFRUuDAr5fx3CAHyUd3d4gW3I6-eXlgYl0cVQw-I_h9G1HLtSM6MIWXIOM2fgdsYa1litf434lH_2Jf6XghjzU6X0eUwaufvV26Z8CBN1qm0BJhG_zwvjqWr3U9oHAPxGqqU-g8ARgsDxmIBb1xI83B7jJjua5FRPEGGqvFWyLVeLnFhuG5q9pyiJhQm-g9m8Nw6UHud4OS-QNPexKHMec2DXttOdR8hHEe8oUBQgqv6B3nrkxof_X5sVXQKQqTRfBdoOX0yHX5NIV-oXzXUPZPDiyKpZaGYYVbhHSsWFMdP7aqbFAa9ijThc7c-LJERh4GMuyDWn9-N0aPme_X8eiLRtxnpqROtqn09uzDW9FI9mgI6-WT2i8yY8eFysxOXjn5W7RrzxAlE8qdYxDZrpAO5z9g6XLZAVFnrHHF5G51Rnd4ZFU8QY-m9iDAibKNX29yC9oRpY5bcKrkE8kJoyLVQaJFR50AF0vztIAq1Zb-8djCkblV8cK1i0N2el0ghXfcZT0mnSAzlYD_-MBk-mfatUf6HEVwv93MkhJ2pAT8AyecmaC739cDWn8Z934OBHIBBTVkgoSJpzhw9R_Z39To9fjZOCR1WjwRuEORHjbeyrZAovMbbWQX1PySh0-WZmo1d-PYLtGVknvP5pJkmYYnHuOlK";

// NIK
app.post('/api/nik', async (req, res) => {
    const { nik } = req.body;
    if (!nik || !/^\d{16}$/.test(nik)) {
        return res.status(400).json({ error: 'NIK harus 16 digit angka' });
    }

    const query = `{ findNikSidalih(nik: "${nik}", wilayah_id: 0, token: "${KPU_TOKEN}") { nama kabupaten kelurahan kecamatan provinsi ttl jenis_kelamin status_perkawinan pekerjaan alamat lhp { nama kelurahan kecamatan kabupaten provinsi } } }`;

    try {
        const response = await axios.post('https://cekdptonline.kpu.go.id/v2', { query }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });
        const data = response.data?.data?.findNikSidalih;
        if (!data || !data.nama) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        data.nik = nik;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// WALLET
app.post('/api/wallet', async (req, res) => {
    const { bank, number } = req.body;
    const valid = ['gopay', 'dana', 'ovo', 'shopeepay', 'astrapay', 'isaku'];
    if (!valid.includes(bank) || !number) {
        return res.status(400).json({ error: 'Bank atau nomor tidak valid' });
    }

    try {
        const response = await axios.get('https://api.pitucode.com/cek-name-e-wallet-id', {
            params: { bank, accountNumber: number },
            headers: { 'x-api-key': '7C0dE87fd76' },
            timeout: 10000
        });
        res.json(response.data);
    } catch (err) {
        if (err.response?.status === 400) {
            res.status(404).json({ error: 'Nomor tidak ditemukan' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// IP
app.get('/api/ip', async (req, res) => {
    const { ip } = req.query;
    if (!ip) return res.status(400).json({ error: 'IP required' });

    try {
        const response = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 10000 });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NAMA
app.get('/api/nama', async (req, res) => {
    const { nama } = req.query;
    if (!nama || nama.length < 3) {
        return res.status(400).json({ error: 'Nama minimal 3 karakter' });
    }

    try {
        const response = await axios.get('https://anggota-negara-six.vercel.app/api/lookup', {
            params: { nama },
            timeout: 10000
        });
        if (!response.data || Object.keys(response.data).length === 0) {
            return res.status(404).json({ error: 'Data tidak ditemukan' });
        }
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../views', '404.html'));
});

// 500
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).sendFile(path.join(__dirname, '../views', '500.html'));
});

module.exports = app;
