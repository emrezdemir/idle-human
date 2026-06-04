/* =========================================================
   Idle Human — sürüm bilgisi (version.js)
   - "version": elle yönetilen anlamsal sürüm (yeni özellikte artır).
   - "build" ve "date": CI derlemede otomatik damgalar (bkz.
     .github/workflows/build.yml). Yerelde "dev" kalır. Ekranda görünür,
     böylece bir deploy'un gerçekten yayınlandığını anlamak kolaydır.
   - "changelog": ekranda gösterilen sürüm geçmişi (en yeni en üstte).
   ========================================================= */

"use strict";

window.APP_VERSION = {
  version: "1.5.0",
  build: "dev", // CI bunu kısa commit hash'iyle değiştirir
  date: "",     // CI bunu derleme tarihiyle (YYYY-MM-DD) değiştirir

  changelog: [
    {
      version: "1.5.0",
      title: "3D avatar (Three.js)",
      notes: [
        "Tıklanan karakter artık kodla üretilen 3D figür (düşük-poligon).",
        "Çağa göre gövde rengi + tepe aksesuarı değişir; hafif döner.",
        "Dokununca zıplar (squash & stretch). WebGL yoksa SVG'ye düşer.",
      ],
    },
    {
      version: "1.4.0",
      title: "Özel çağ figürleri + PixiJS",
      notes: [
        "Çağ emojileri yerine tek stilde özel SVG figür seti (avatar evrimi).",
        "Efekt motoru PixiJS (WebGL) ile yenilendi; daha akıcı parçacık/konfeti.",
        "WebGL yoksa otomatik olarak canvas motoruna güvenli geri dönüş.",
      ],
    },
    {
      version: "1.3.0",
      title: "Çağ & evrim sistemi",
      notes: [
        "10 çağlık yolculuk: Taş Devri'nden Galaktik Çağ'a.",
        "İlerledikçe tıklanan avatar evrilir ve arka plan tonu değişir.",
        "Her çağ kalıcı üretim çarpanı + kısa hikâye verir (prestijde korunur).",
        "Çağ göstergesi + 'Çağlar' yol haritası listesi eklendi.",
      ],
    },
    {
      version: "1.2.0",
      title: "Hakkında, sorumluluk reddi ve gizlilik",
      notes: [
        "Menüye 'Hakkında' eklendi: oyun bilgisi, sorumluluk reddi ve gizlilik özeti.",
        "Gizlilik, sorumluluk reddi ve hakkında sayfaları web sitesine de eklendi.",
        "Tam gizlilik politikasına oyun içinden bağlantı.",
      ],
    },
    {
      version: "1.1.1",
      title: "Daha temiz arayüz",
      notes: [
        "Hesap & bulut artık tek yerden: sağ üstteki 👤 profili.",
        "Alt buton çubuğu kaldırıldı; hızlı sessize-al (🔊) üst bara taşındı.",
        "Menü sadeleşti: Oyuna Dön, Ayarlar, Sürüm Geçmişi.",
      ],
    },
    {
      version: "1.1.0",
      title: "Ana menü, ayarlar ve sürüm geçmişi",
      notes: [
        "Ana menü eklendi (☰): Devam Et, Ayarlar, Sürüm Geçmişi, Hesap.",
        "Ayarlar penceresi: ses efektleri ve müzik ayrı ayrı açılıp kapanır.",
        "Ekranda sürüm + build bilgisi gösteriliyor; deploy doğrulaması kolaylaştı.",
        "Sürüm geçmişi (changelog) oyun içinden görülebiliyor.",
      ],
    },
    {
      version: "1.0.1",
      title: "İndirilebilir test APK'sı",
      notes: [
        "Mobilde çift dokunmada yakınlaştırma sorunu giderildi.",
        "İmza yokken bile her sürümde indirilebilir test APK'sı yayınlanıyor.",
      ],
    },
    {
      version: "1.0.0",
      title: "İlk sürüm",
      notes: [
        "Tıkla-üret oynanışı, otomatik üreticiler ve yükseltmeler.",
        "Prestij (Genler), başarımlar, kombo sistemi.",
        "Görsel efektler, prosedürel ses, çevrimdışı kazanç.",
        "Bulut kayıt katmanı ve taşınabilir yedek kodu.",
      ],
    },
  ],
};
