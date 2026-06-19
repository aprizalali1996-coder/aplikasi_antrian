const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error('Gagal memuat database:', err.message);
    else console.log('Sukses terhubung ke database SQLite.');
});

db.run(`CREATE TABLE IF NOT EXISTS peserta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomor_antrian INTEGER NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'menunggu'
)`);

app.post('/api/peserta', (req, res) => {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ error: 'Nama harus diisi' });

    db.get(`SELECT MAX(nomor_antrian) as terakhir FROM peserta`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        const nomorBerikutnya = (row.terakhir || 0) + 1;

        db.run(`INSERT INTO peserta (nomor_antrian, nama, status) VALUES (?, ?, 'menunggu')`, 
        [nomorBerikutnya, nama], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID, nomor_antrian: nomorBerikutnya, nama });
        });
    });
});

app.get('/api/antrian', (req, res) => {
    db.get(`SELECT * FROM peserta WHERE status = 'dipanggil' ORDER BY nomor_antrian DESC LIMIT 1`, [], (err, saatIni) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get(`SELECT * FROM peserta WHERE status = 'menunggu' ORDER BY nomor_antrian ASC LIMIT 1`, [], (err, selanjutnya) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ saatIni: saatIni || null, selanjutnya: selanjutnya || null });
        });
    });
});

app.get('/api/peserta/menunggu', (req, res) => {
    db.all(`SELECT * FROM peserta WHERE status = 'menunggu' ORDER BY nomor_antrian ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/panggil/:id', (req, res) => {
    const { id } = req.params;
    db.run(`UPDATE peserta SET status = 'selesai' WHERE status = 'dipanggil'`, [], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`UPDATE peserta SET status = 'dipanggil' WHERE id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});