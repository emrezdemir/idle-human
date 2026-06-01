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

## ✨ Öne çıkanlar

- **Kombo sistemi** — hızlı ardışık dokunuşlar komboyu büyütür, dokunuş gücünü
  %100'e kadar çarpar; ses ve efekt şiddeti komboyla artar.
- **Görsel efektler** — arka plan parçacık alanı, tıklama patlamaları, konfeti,
  ekran sarsıntısı, buton parıltısı ve halka dalgaları (tek `<canvas>` üzerinde).
- **Prosedürel ses** — dosyasız Web Audio; tüm efektler çalışma anında sentezlenir
  + kısık arka plan ambiyansı.
- **Hesap & bulut kayıt** — taşınabilir yedek kodu (her yerde çalışır) +
  Google Play Games entegrasyonu için hazır katman.
- `prefers-reduced-motion` desteği — hareket azaltma tercihine saygı duyar.

## 📁 Yapı

| Yol                     | Görevi                                          |
| ----------------------- | ----------------------------------------------- |
| `www/index.html`        | Arayüz iskeleti, script yükleme sırası          |
| `www/style.css`         | Mobil öncelikli tasarım (karanlık tema) + efektler |
| `www/game.js`           | Oyun mantığı, kayıt, offline, prestij, başarım, kombo |
| `www/audio.js`          | `SFX` — prosedürel ses motoru (Web Audio)       |
| `www/effects.js`        | `Effects` — canvas parçacık/efekt motoru        |
| `www/cloud.js`          | `Cloud` — hesap + bulut kayıt soyutlaması        |
| `www/manifest.json`     | PWA manifesti                                   |
| `www/icons/`            | Web / PWA simgeleri (üretilmiş PNG'ler)         |
| `android/`              | Capacitor native Android projesi (repoda)        |
| `resources/`            | Simge & açılış kaynakları + üretici betikler     |
| `memory-bank/`          | Projenin kalıcı hafızası (mimari dokümantasyonu) |
| `docs/PLAY_GAMES.md`    | Play Games giriş & bulut kayıt kurulum rehberi   |
| `STORE.md`              | Play Store'a çıkış rehberi                        |
| `.github/workflows/`    | CI: web doğrulama + imzalı APK/AAB + Pages       |

> 🧠 Kodun nasıl çalıştığını ve neden böyle kurulduğunu anlamak için
> **[`memory-bank/`](memory-bank/README.md)** klasörüne bak — mimari, oyun
> tasarımı, efekt/ses motorları ve yayın akışı orada belgelenmiştir.

## 📱 Android (Capacitor 7)

Native `android/` projesi repoda tutulur. İlk kurulumdan sonra:

```bash
npm ci                  # bağımlılıklar (kilit dosyasından)
npm run cap:sync        # web -> android kopyala
npm run android:debug   # imzasız debug APK
npm run android:apk     # imzalı release APK (keystore.properties gerekir)
npm run android:aab     # imzalı App Bundle (Play Store)
```

Hedef: **targetSdk 35 / minSdk 23** — güncel Play Store gereksinimleriyle uyumlu.
Çıktılar `android/app/build/outputs/` altında.

### 🎨 Simge ve Açılış Ekranı

Simge/splash `resources/generate_icons.py` (Pillow) ile üretilir; Play "feature
graphic" için `resources/generate_feature_graphic.py`:

```bash
pip install pillow
python3 resources/generate_icons.py
npx @capacitor/assets generate --assetPath resources --android  # native'e işle
```

## 🤖 Sürekli Entegrasyon (CI)

`.github/workflows/build.yml`, her `main` push'unda ve PR'da çalışır:

1. **Web doğrulama** — JS söz dizimi + JSON dosyaları kontrol edilir.
2. **Android** — `keystore` secret'ları tanımlıysa **imzalı AAB + APK** üretip
   `latest` Release'e koyar (Play'e yüklenebilir). Secret yoksa **imzasız test
   APK**'sı üretip yine Release'e koyar (sadece yan yükleme/test; Play'e yüklenemez).
3. **GitHub Pages** — oyun + indirme sayfası + gizlilik politikası yayınlanır.

Kalıcı indirme bağlantıları:
- APK: `https://github.com/emrezdemir/idle-human/releases/latest/download/idle-human.apk`
  (her zaman güncel — imza varsa imzalı, yoksa imzasız test sürümü)
- AAB: `https://github.com/emrezdemir/idle-human/releases/latest/download/idle-human.aab`
  (yalnızca keystore secret'ları eklendikten sonra yayınlanır)

## 🛒 Google Play Store

Mağazaya çıkış: **[STORE.md](STORE.md)**. Play Games ile giriş & bulut kayıt
kurulumu: **[docs/PLAY_GAMES.md](docs/PLAY_GAMES.md)**.

## 🗺️ Yol Haritası

- [x] Toplu alım (×1 / ×10 / ×100 / MAKS) + UI cila
- [x] Prestij / yeniden doğuş sistemi (kalıcı Gen çarpanı)
- [x] Başarımlar
- [x] Zengin görsel efektler + prosedürel ses + kombo sistemi
- [x] Android paketleme (Capacitor 7, imzalı AAB/APK)
- [x] Daha fazla üretici ve çağ (taş devri → uzay çağı)
- [x] Uygulama simgesi ve açılış ekranı
- [x] CI ile otomatik imzalı derleme + GitHub Pages
- [x] Bulut kayıt (taşınabilir yedek kodu + Play Games hazır katmanı)
- [ ] Play Games native eklentisini bağla (bkz. `docs/PLAY_GAMES.md`)

Ayrıntılı yol haritası: [`memory-bank/08-roadmap.md`](memory-bank/08-roadmap.md).
