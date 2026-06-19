const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Database terhubung");
  }
});

db.run(`

CREATE TABLE IF NOT EXISTS peserta(

id INTEGER PRIMARY KEY AUTOINCREMENT,

nomor_antrian INTEGER UNIQUE,

nama TEXT NOT NULL,

status TEXT DEFAULT 'menunggu'

)

`);

app.post("/api/peserta", (req, res) => {
  const { nama } = req.body;

  if (!nama) {
    return res.status(400).json({
      error: "Nama wajib diisi",
    });
  }

  db.get(
    "SELECT MAX(nomor_antrian) as terakhir FROM peserta",

    [],

    (err, row) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      const nomor = (row.terakhir || 0) + 1;

      db.run(
        `INSERT INTO peserta
(nomor_antrian,nama,status)

VALUES(?,?,?)`,

        [nomor, nama, "menunggu"],

        function (err) {
          if (err) {
            return res.status(500).json({
              error: err.message,
            });
          }

          res.json({
            success: true,

            id: this.lastID,

            nomor_antrian: nomor,

            nama,
          });
        },
      );
    },
  );
});

app.get("/api/peserta/menunggu", (req, res) => {
  db.all(
    `SELECT * FROM peserta

WHERE status='menunggu'

ORDER BY nomor_antrian ASC`,

    [],

    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json(rows);
    },
  );
});

app.get("/api/statistik", (req, res) => {
  db.get(
    `SELECT COUNT(*) as total

FROM peserta`,

    [],

    (err, total) => {
      db.get(
        `SELECT COUNT(*) as menunggu

FROM peserta

WHERE status='menunggu'`,

        [],

        (err2, menunggu) => {
          res.json({
            total: total.total,

            menunggu: menunggu.menunggu,
          });
        },
      );
    },
  );
});

app.get("/api/antrian", (req, res) => {
  db.get(
    `SELECT *

FROM peserta

WHERE status='dipanggil'

ORDER BY nomor_antrian DESC

LIMIT 1`,

    [],

    (err, saatIni) => {
      db.get(
        `SELECT *

FROM peserta

WHERE status='menunggu'

ORDER BY nomor_antrian ASC

LIMIT 1`,

        [],

        (err, selanjutnya) => {
          res.json({
            saatIni: saatIni || null,

            selanjutnya: selanjutnya || null,
          });
        },
      );
    },
  );
});

app.post("/api/panggil/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    `UPDATE peserta

SET status='selesai'

WHERE status='dipanggil'`,

    [],

    () => {
      db.run(
        `UPDATE peserta

SET status='dipanggil'

WHERE id=?`,

        [id],

        function (err) {
          if (err) {
            return res.status(500).json({
              error: err.message,
            });
          }

          res.json({
            success: true,
          });
        },
      );
    },
  );
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
