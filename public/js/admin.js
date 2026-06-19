let semuaPeserta = [];

function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.className = `
    fixed top-5 right-5 z-50
    px-5 py-3 rounded-xl shadow-xl
    text-white font-semibold
    transition-all duration-300
    ${type === "success" ? "bg-green-600" : "bg-red-600"}
    `;

  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function loadStatistik() {
  try {
    const res = await fetch("/api/statistik");

    const data = await res.json();

    document.getElementById("stat-total").innerText = data.total;

    document.getElementById("stat-menunggu").innerText = data.menunggu;
  } catch {
    console.log("Gagal statistik");
  }
}

async function loadPeserta() {
  try {
    const res = await fetch("/api/peserta/menunggu");

    semuaPeserta = await res.json();

    renderTabel(semuaPeserta);
  } catch {
    showToast(
      "Gagal mengambil data",

      "error",
    );
  }
}

function renderTabel(data) {
  const tbody = document.getElementById("tabel-menunggu");

  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `

        <tr>

        <td colspan="4"

        class="text-center py-10 text-slate-400">

        Belum ada antrean

        </td>

        </tr>

        `;

    return;
  }

  data.forEach((peserta) => {
    tbody.innerHTML += `

        <tr class="hover:bg-slate-50">

            <td class="p-5 font-bold">

                #${peserta.nomor_antrian}

            </td>

            <td class="p-5">

                ${peserta.nama}

            </td>

            <td class="p-5">

                <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">

                    Menunggu

                </span>

            </td>

            <td class="p-5 text-right">

                <button

                onclick="panggilPeserta(${peserta.id})"

                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition"

                >

                📢 Panggil

                </button>

            </td>

        </tr>

        `;
  });
}

async function tambahPeserta(e) {
  e.preventDefault();

  const input = document.getElementById("input-nama");

  const nama = input.value.trim();

  if (!nama) {
    return;
  }

  const tombol = e.target.querySelector("button");

  tombol.disabled = true;

  tombol.innerHTML = "Menyimpan...";

  try {
    const res = await fetch(
      "/api/peserta",

      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          nama,
        }),
      },
    );

    const data = await res.json();

    if (data.success) {
      input.value = "";

      showToast("Peserta berhasil ditambahkan");

      refreshDashboard();
    }
  } catch {
    showToast(
      "Gagal menambahkan peserta",

      "error",
    );
  }

  tombol.disabled = false;

  tombol.innerHTML = "➕ Tambahkan Antrean";
}

async function panggilPeserta(id) {
  const konfirmasi = confirm("Panggil peserta ini ?");

  if (!konfirmasi) {
    return;
  }

  try {
    const res = await fetch(
      `/api/panggil/${id}`,

      {
        method: "POST",
      },
    );

    const data = await res.json();

    if (data.success) {
      showToast("Peserta dipanggil");

      refreshDashboard();
    }
  } catch {
    showToast(
      "Gagal memanggil",

      "error",
    );
  }
}

function refreshDashboard() {
  loadPeserta();

  loadStatistik();
}

document

  .getElementById("form-registrasi")

  .addEventListener(
    "submit",

    tambahPeserta,
  );

document

  .getElementById("search-peserta")

  .addEventListener(
    "keyup",

    function (e) {
      const keyword = e.target.value.toLowerCase();

      const hasil = semuaPeserta.filter((peserta) =>
        peserta.nama

          .toLowerCase()

          .includes(keyword),
      );

      renderTabel(hasil);
    },
  );

refreshDashboard();

setInterval(
  refreshDashboard,

  5000,
);
