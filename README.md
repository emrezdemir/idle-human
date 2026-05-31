# 🧬 Idle Human

Bir insandan başlayıp medeniyeti büyüten basit bir **idle / clicker** oyunu.
Saf HTML + CSS + JavaScript ile yazıldı, çalışmak için hiçbir bağımlılığı yok.
Tarayıcıda çalışır ve **Capacitor** ile Android APK'ya paketlenir.

### ▶ Hemen Oyna / İndir

- **Tarayıcıda oyna:** https://emrezdemir.github.io/idle-human/
- **Android APK indir:** https://github.com/emrezdemir/idle-human/releases/latest/download/idle-human.apk

> Her iki bağlantı da `main`'e push'ta CI tarafından otomatik güncellenir.

## 🎮 Nasıl Oynanır

- 🧑 butonuna **dokun** ve İnsanlık Puanı kazan.
- Puanlarınla **Üreticiler** al — İşçi ve Çiftçi'den başlayıp Yapay Zekâ,
  Uzay Filosu, Gezegen Kolonisi ve **Dyson Küresi**'ne kadar uzanan 12 kademe
  (taş devri → uzay çağı). `×1 / ×10 / ×100 / MAKS` ile toplu al.
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
| `www/icons/`            | Web / PWA simgeleri (üretilmiş PNG'ler)         |
| `resources/`            | Simge & açılış kaynakları + üretici betik       |
| `capacitor.config.json` | Capacitor / Android yapılandırması              |
| `package.json`          | Bağımlılıklar ve yardımcı komutlar              |
| `.github/workflows/`    | CI: otomatik APK derleme                         |

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

### 🎨 Simge ve Açılış Ekranı

Uygulama simgesi ve açılış ekranı `resources/icon.png` (1024×1024) ve
`resources/splash.png` (2732×2732) kaynaklarından üretilir. Bu kaynaklar
`resources/generate_icons.py` ile (saf Python + Pillow) oluşturulmuştur —
tasarımı değiştirmek için betiği düzenleyip tekrar çalıştırman yeterli:

```bash
pip install pillow
python3 resources/generate_icons.py   # PNG'leri yeniden üretir
```

Native projeye (Android) işlemek için:

```bash
npm run assets   # capacitor-assets generate --assetPath resources
```

## 🤖 Sürekli Entegrasyon (CI)

`.github/workflows/build.yml`, her `main` push'unda ve PR'da çalışır:

1. **Web doğrulama** — `game.js` söz dizimi + JSON dosyaları kontrol edilir.
2. **Android APK** — Capacitor projesi kurulur, simgeler işlenir ve debug APK
   derlenir.

Derlenen APK, ilgili çalışmanın **Actions → Artifacts** bölümünden
`idle-human-debug-apk` adıyla indirilebilir.

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
- [x] Daha fazla üretici ve çağ (taş devri → uzay çağı)
- [x] Uygulama simgesi ve açılış ekranı
- [x] CI ile otomatik APK derleme
- [ ] Bulut kayıt
