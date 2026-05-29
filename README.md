# 🧬 Idle Human

Bir insandan başlayıp medeniyeti büyüten basit bir **idle / clicker** oyunu.
Saf HTML + CSS + JavaScript ile yazıldı, çalışmak için hiçbir bağımlılığı yok.
Tarayıcıda çalışır ve **Capacitor** ile Android APK'ya paketlenir.

## 🎮 Nasıl Oynanır

- 🧑 butonuna **dokun** ve İnsanlık Puanı kazan.
- Puanlarınla **Üreticiler** al (İşçi, Çiftçi, Bilim İnsanı… → Yapay Zekâ);
  bunlar saniyede otomatik puan üretir. `×1 / ×10 / ×100 / MAKS` ile toplu al.
- **Yükseltmeler** ile dokunuş gücünü veya üretimi katla.
- **Prestij** sekmesinden yeniden doğup kalıcı **Gen** puanı kazan (her Gen
  +%10 üretim).
- **Başarımları** aç; her başarım +%1 üretim bonusu verir.
- Oyun otomatik kaydeder. Geri döndüğünde **offline kazancını** toplarsın.

## 💻 Yerelde Çalıştırma

Web dosyaları `www/` klasöründe. Statik dosyalar olduğu için `www/index.html`'i
doğrudan tarayıcıda açabilirsin; ya da bir yerel sunucu çalıştır:

```bash
npm run serve          # python3 -m http.server 8000 --directory www
# Tarayıcıda: http://localhost:8000
```

## 📁 Yapı

| Yol                     | Görevi                                          |
| ----------------------- | ----------------------------------------------- |
| `www/index.html`        | Arayüz iskeleti                                 |
| `www/style.css`         | Mobil öncelikli tasarım (karanlık tema)         |
| `www/game.js`           | Oyun mantığı, kayıt, offline, prestij, başarım  |
| `www/manifest.json`     | PWA manifesti                                   |
| `capacitor.config.json` | Capacitor / Android yapılandırması              |
| `package.json`          | Bağımlılıklar ve yardımcı komutlar              |

## 📱 Android APK Oluşturma (Capacitor)

> Gereksinimler: Node.js, Android Studio (+ Android SDK). İlk kurulum internet
> erişimi ister.

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Android platformunu ekle (sadece ilk seferde)
npm run cap:add        # cap add android

# 3) Web dosyalarını native projeye kopyala
npm run cap:sync       # cap sync android

# 4a) Android Studio'da aç ve oradan derle/çalıştır
npm run cap:open

# 4b) ya da komut satırından debug APK derle
npm run android:build  # android/app/build/outputs/apk/debug/app-debug.apk
```

`capacitor.config.json` içindeki `appId` (`com.idlehuman.game`) ve `appName`
değerlerini istediğin gibi değiştirebilirsin.

> İpucu: simge ve açılış ekranı için `@capacitor/assets` paketini kullanabilir,
> tek bir kaynak görselden tüm boyutları üretebilirsin.

### Alternatifler

- **TWA** — oyunu bir URL'ye yayınlayıp
  [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) ile sar.
- **Basit WebView** — Android Studio'da boş proje açıp `www/` içeriğini
  `assets/`'e koyarak tek bir `WebView` ile göster.

## 🗺️ Yol Haritası

- [x] Toplu alım (×1 / ×10 / ×100 / MAKS) + UI cila
- [x] Prestij / yeniden doğuş sistemi (kalıcı Gen çarpanı)
- [x] Başarımlar
- [x] Ses efektleri
- [x] Android paketleme (Capacitor)
- [ ] Bulut kayıt
- [ ] Daha fazla üretici ve çağ (taş devri → uzay çağı)
- [ ] Uygulama simgesi ve açılış ekranı
