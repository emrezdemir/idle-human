# 🧬 Idle Human

Bir insandan başlayıp medeniyeti büyüten basit bir **idle / clicker** oyunu.
Saf HTML + CSS + JavaScript ile yazıldı, hiçbir bağımlılığı yok. Tarayıcıda
çalışır ve daha sonra **Android APK**'ya paketlenebilir.

## 🎮 Nasıl Oynanır

- 🧑 butonuna **dokun** ve İnsanlık Puanı kazan.
- Puanlarınla **Üreticiler** al (İşçi, Çiftçi, Bilim İnsanı…); bunlar saniyede
  otomatik puan üretir.
- **Yükseltmeler** ile dokunuş gücünü veya üretimi katla.
- Oyun otomatik kaydeder. Geri döndüğünde **offline kazancını** toplarsın.

## 💻 Yerelde Çalıştırma

Tek dosya — sunucuya bile gerek yok, `index.html` dosyasını tarayıcıda açman
yeterli. Yine de basit bir yerel sunucu önerilir:

```bash
# Python ile
python3 -m http.server 8000
# Sonra tarayıcıda: http://localhost:8000
```

## 📁 Yapı

| Dosya         | Görevi                                              |
| ------------- | --------------------------------------------------- |
| `index.html`  | Arayüz iskeleti                                     |
| `style.css`   | Mobil öncelikli tasarım (karanlık tema)             |
| `game.js`     | Oyun mantığı, kayıt sistemi, offline ilerleme       |

## 📱 Android'e Paketleme

Oyun bir web uygulaması olduğu için Android'e birkaç yolla taşınabilir:

### Seçenek 1 — Capacitor (önerilen)

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Idle Human" "com.example.idlehuman" --web-dir=.
npx cap add android
npx cap copy
npx cap open android   # Android Studio açılır, oradan APK derlenir
```

### Seçenek 2 — TWA (Trusted Web Activity)

Oyunu bir URL'ye yayınlayıp [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
ile saran bir TWA paketi oluşturabilirsin.

### Seçenek 3 — Basit WebView

Android Studio'da boş bir proje açıp tek bir `WebView` ekleyerek
`assets/` klasörüne bu dosyaları koyman da yeterli.

## 🗺️ Yol Haritası (Fikirler)

- [ ] Prestij / yeniden doğuş sistemi (kalıcı çarpanlar)
- [ ] Başarımlar (achievements)
- [ ] Ses efektleri ve müzik
- [ ] Bulut kayıt
- [ ] Daha fazla üretici ve çağ (taş devri → uzay çağı)
