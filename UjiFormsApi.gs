/**
 * PENGUJI: apakah Apps Script boleh memanggil Google Forms REST API?
 *
 * Ini penting karena hanya REST API yang bisa memasang GAMBAR sebagai pilihan
 * jawaban (Apps Script FormApp tidak bisa - kelas Choice tidak punya gambar).
 * Kalau ini berhasil, soal mencocokkan gambar bisa dibuat DAN tetap dinilai
 * otomatis. Kalau gagal, pesan galatnya memberi tahu langkah yang kurang.
 */
function ujiFormsApi() {
  var token = ScriptApp.getOAuthToken();
  var r = UrlFetchApp.fetch('https://forms.googleapis.com/v1/forms', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ info: { title: 'UJI Forms API - boleh dihapus' } }),
    muteHttpExceptions: true
  });
  var kode = r.getResponseCode();
  var isi = r.getContentText();
  Logger.log('=== KODE HTTP: ' + kode + ' ===');
  Logger.log(isi.slice(0, 900));
  if (kode === 200) {
    var f = JSON.parse(isi);
    Logger.log('BERHASIL. formId=' + f.formId);
    // langsung uji pasang GAMBAR sebagai pilihan jawaban
    var BASE = 'https://dimassastra.github.io/Game-Lentera-Bali/';
    var u = UrlFetchApp.fetch('https://forms.googleapis.com/v1/forms/' + f.formId + ':batchUpdate', {
      method: 'post', contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify({ requests: [{ createItem: {
        item: {
          title: 'Canang',
          questionItem: {
            question: {
              required: true,
              grading: { pointValue: 10, correctAnswers: { answers: [{ value: 'B' }] } },
              choiceQuestion: { type: 'RADIO', options: [
                { value: 'A', image: { sourceUri: BASE + 'foto/s11-pura-besakih.jpg' } },
                { value: 'B', image: { sourceUri: BASE + 'foto/s13-canang-sari-detail.jpg' } },
                { value: 'C', image: { sourceUri: BASE + 'foto/s12-penjor.jpg' } }
              ] }
            }
          }
        },
        location: { index: 0 }
      } }] }),
      muteHttpExceptions: true
    });
    Logger.log('=== batchUpdate (gambar sebagai pilihan): ' + u.getResponseCode() + ' ===');
    Logger.log(u.getContentText().slice(0, 700));
    Logger.log('Tautan uji: https://docs.google.com/forms/d/' + f.formId + '/edit');
  }
}
