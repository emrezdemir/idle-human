# 01 — Genel Bakış

## Proje nedir?

**Idle Human**, tek bir insandan başlayıp medeniyeti büyüten bir **idle / clicker**
oyunudur. Oyuncu bir butona dokunarak "İnsanlık Puanı" kazanır, bu puanla pasif
üretim yapan üreticiler ve çarpan veren yükseltmeler alır, belirli bir noktada
"prestij" yaparak kalıcı bonuslarla yeniden başlar.

## Hedefler

- **Sıfır bağımlılık (runtime):** Oyun saf HTML + CSS + JavaScript. Çalışmak için
  hiçbir framework, build adımı ya da ağ bağlantısı gerektirmez.
- **Mobil öncelikli:** Önce telefon ekranı için tasarlandı; dikey, dokunma dostu.
- **Çevrimdışı oynanabilir:** Tüm mantık istemcide; kayıt cihazda (localStorage).
- **Hem web hem Android:** Aynı `www/` kaynağı tarayıcıda çalışır ve Capacitor ile
  Android paketine (APK/AAB) sarılır.
- **Play Store'a uygun:** targetSdk 35, gizlilik politikası, veri toplamayan
  tasarım, imzalı App Bundle.

## Teknoloji seçimleri ve gerekçeleri

| Seçim | Neden |
|---|---|
| Saf JS (framework yok) | Oyun mantığı küçük; framework ek yük + karmaşıklık olurdu. Yükleme anında çalışır. |
| `localStorage` ile kayıt | Sunucu yok → maliyet/gizlilik derdi yok. Çevrimdışı çalışır. |
| Web Audio API (dosyasız ses) | Ses dosyası taşımamak için tüm efektler çalışma anında sentezlenir → paket küçük. |
| Canvas efekt katmanı | DOM yerine tek canvas'ta yüzlerce parçacık → akıcı performans. |
| Capacitor 7 | Web uygulamasını minimum native kodla Android'e sarar; targetSdk 35'i hazır getirir. |
| Play App Signing | Upload anahtarını Google yönetir; anahtar kaybı felaket olmaktan çıkar. |

## Kim için?

Rahatlatıcı, "bir tık daha" hissi veren, reklamsız/ücretsiz bir zaman geçirme
oyunu arayan herkes. Hedef kitle geniş (Everyone / 3+).

## Sınırlar (bilerek yapılmayanlar)

- Gerçek zamanlı çok oyunculu yok.
- Sunucu tarafı yok (skor tablosu/bulut, Play Games üzerinden opsiyonel).
- Uygulama içi satın alma / reklam yok (politika ve sadelik gereği).
