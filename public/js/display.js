let lastCalled = null;

let voices = [];

function siapkan() {
  voices = speechSynthesis.getVoices();
}

siapkan();

speechSynthesis.onvoiceschanged = siapkan;

function panggilSuara(
  nomor,

  nama,
) {
  speechSynthesis.cancel();

  const teks = `Nomor antrian ${nomor}. Atas nama ${nama}. Silakan menuju ruang tindakan`;

  const ucapan = new SpeechSynthesisUtterance(teks);

  ucapan.lang = "id-ID";

  ucapan.rate = 0.85;

  const indo = voices.find((v) => v.lang === "id-ID");

  if (indo) {
    ucapan.voice = indo;
  }

  speechSynthesis.speak(ucapan);
}

function ambil() {
  fetch("/api/antrian")
    .then((res) => res.json())

    .then((data) => {
      if (data.saatIni) {
        document.getElementById("current-number").innerText =
          data.saatIni.nomor_antrian;

        document.getElementById("current-name").innerText = data.saatIni.nama;

        if (data.saatIni.id !== lastCalled) {
          lastCalled = data.saatIni.id;

          panggilSuara(
            data.saatIni.nomor_antrian,

            data.saatIni.nama,
          );
        }
      }

      if (data.selanjutnya) {
        document.getElementById("next-info").innerHTML =
          `#${data.selanjutnya.nomor_antrian} - ${data.selanjutnya.nama}`;
      }
    });
}

window.onload = () => {
  ambil();

  setInterval(
    ambil,

    3000,
  );
};
