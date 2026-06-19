document.getElementById('form-registrasi').addEventListener('submit', function(e) {
    e.preventDefault();
    const namaInput = document.getElementById('input-nama');
    const nama = namaInput.value.trim();

    if (!nama) return;

    const btn = this.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-pulse">Menyimpan...</span>';

    fetch('/api/peserta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            namaInput.value = '';
            loadDaftarTunggu();
        }
    })
    .catch(err => console.error('Gagal mendaftarkan peserta:', err))
    .finally(() => {
        btn.innerHTML = originalText;
    });
});

function loadDaftarTunggu() {
    fetch('/api/peserta/menunggu')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabel-menunggu');
            tbody.innerHTML = '';
            
            document.getElementById('stat-menunggu').innerText = data.length;
            if(data.length > 0) {
                 const highestNo = Math.max(...data.map(p => p.nomor_antrian));
                 document.getElementById('stat-total').innerText = highestNo;
            }

            if (data.length === 0) {
                tbody.innerHTML = `<tr>
                    <td colspan="4" class="px-8 py-12 text-center">
                        <div class="flex flex-col items-center justify-center text-slate-400">
                            <span class="text-sm">Tidak ada peserta dalam antrean.</span>
                        </div>
                    </td>
                </tr>`;
                return;
            }

            data.forEach(peserta => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50/50 smooth-transition group";
                tr.innerHTML = `
                    <td class="px-8 py-4 font-bold text-slate-800">
                        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                            ${peserta.nomor_antrian}
                        </div>
                    </td>
                    <td class="px-8 py-4 font-medium text-slate-800">${peserta.nama}</td>
                    <td class="px-8 py-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                            Menunggu
                        </span>
                    </td>
                    <td class="px-8 py-4 text-right">
                        <button onclick="panggilPeserta(${peserta.id})" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-lg shadow-sm hover:shadow smooth-transition">
                            Panggil
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('Gagal mengambil daftar tunggu:', err));
}

function panggilPeserta(id) {
    fetch(`/api/panggil/${id}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadDaftarTunggu();
            }
        })
        .catch(err => console.error('Gagal melakukan panggilan:', err));
}

window.addEventListener('DOMContentLoaded', loadDaftarTunggu);
