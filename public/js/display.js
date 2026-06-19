let lastCalledId = null;
let voices = [];

function siapkanSuara() {
    voices = window.speechSynthesis.getVoices();
}

siapkanSuara();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = siapkanSuara;
}

function batasiSuara() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
}

function panggilSuara(nomor, nama) {
    batasiSuara();
    
    const kalimat = `Panggilan. Nomor antrean, ${nomor}. Atas nama, ${nama}. Silakan menuju ruang tindakan.`;
    const utterance = new SpeechSynthesisUtterance(kalimat);
    utterance.lang = 'id-ID';
    utterance.rate = 0.8;
    
    let suaraIndo = voices.filter(voice => voice.lang.includes('id'));
    let suaraLakiLaki = suaraIndo.find(voice => 
        voice.name.toLowerCase().includes('andika') || 
        voice.name.toLowerCase().includes('male')
    );

    if (suaraLakiLaki) {
        utterance.voice = suaraLakiLaki;
    } else if (suaraIndo.length > 0) {
        utterance.voice = suaraIndo[0];
    }

    window.speechSynthesis.speak(utterance);
}

function fetchAntrian() {
    fetch('/api/antrian')
        .then(res => res.json())
        .then(data => {
            if (data.saatIni) {
                document.getElementById('current-number').innerText = data.saatIni.nomor_antrian;
                document.getElementById('current-name').innerText = data.saatIni.nama;
                
                if (data.saatIni.id !== lastCalledId) {
                    lastCalledId = data.saatIni.id;
                    panggilSuara(data.saatIni.nomor_antrian, data.saatIni.nama);
                }
            } else {
                document.getElementById('current-number').innerText = "--";
                document.getElementById('current-name').innerText = "Belum Ada Panggilan";
            }

            if (data.selanjutnya) {
                document.getElementById('next-info').innerHTML = `<span class="text-cyan-400">#${data.selanjutnya.nomor_antrian}</span> - ${data.selanjutnya.nama}`;
            } else {
                document.getElementById('next-info').innerText = "Belum ada antrean";
            }
        })
        .catch(err => console.error('Gagal mengambil data antrian:', err));
}

setInterval(fetchAntrian, 2000);

window.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', () => console.log('Audio Context Terpicu'));
    fetchAntrian();
});
