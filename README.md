# 🧬 Idle Human

Bir insandan başlayıp medeniyeti büyüten basit bir **idle / clicker** oyunu.
Saf HTML + CSS + JavaScript ile yazıldı, çalışmak için hiçbir bağımlılığı yok.
Tarayıcıda çalışır ve **Capacitor** ile Android APK'ya paketlenir.

### ▶ Hemen Oyna / İndir

- **Tarayıcıda oyna:** https://emrezdemir.github.io/idle-human/
- **Android APK indir:** https://github.com/emrezdemir/idle-human/releases/latest/download/idle-human.apk

> Her iki bağlantı da `main`'e push'ta CI tarafından otomatik güncellenir.

## 🎮 Nasıl Oynanır

- 🧑 butonuna **dokun** — düşmana saldır, İnsanlık Puanı kazan.
- Puanlarınla **Üreticiler** al — İşçi ve Çiftçi'den başlayıp Yapay Zekâ,
  Uzay Filosu, Gezegen Kolonisi ve **Dyson Küresi**'ne kadar uzanan 12 kademe
  (taş devri → uzay çağı). `×1 / ×10 / ×100 / MAKS` ile toplu al.
- **Yükseltmeler** ile dokunuş gücünü veya üretimi katla.
- **Aşama / Boss savaşı** — her aşamada düşman; her 10. aşamada **BOSS**
  (süre sınırlı). Boss yenince ekipman düşer + kalıcı +%5 üretim.
- **Ekipman (⚔️ sekmesi)** — Silah (hasar), Zırh (üretim), Yüzük (kritik
  şansı). 4 nadirlik (Sıradan → Efsanevi). Slota dokun → **🔁 yeniden çek**.
- **Prestij** sekmesinden yeniden doğup kalıcı **Gen** puanı kazan (her Gen
  +%10 üretim).
- **Başarımları** aç; her başarım +%1 üretim bonusu verir.
- Oyun otomatik kaydeder (rotasyonlu yedek ile). Geri döndüğünde **offline
  kazancını** toplarsın.

## 💻 Yerelde Çalıştırma

Web dosyaları `www/` klasöründe. Statik dosyalar olduğu için `www/index.html`'i
doğrudan tarayıcıda açabilirsin; ya da bir yerel sunucu çalıştır:

```bash
npm run serve          # cross-platform: npx http-server (otomatik tarayıcı açar)
# Tarayıcıda: http://localhost:8000

# Alternatifler (Python):
npm run serve:py       # Mac/Linux (python3)
npm run serve:py-win   # Windows (py launcher)
```

## ✨ Öne çıkanlar

- **Idle savaş + boss** — üretim otomatik DPS; her 10. aşamada süre sınırlı
  BOSS. Yenilen her boss kalıcı +%5 üretim verir.
- **Ekipman + nadirlik + kritik** — boss'lardan ⚔️/🛡️/💍 düşer (Sıradan →
  Efsanevi). Yüzükle kritik şansı (×3 hasar). Slota dokun → **reroll**.
- **Kombo sistemi** — hızlı ardışık dokunuşlar komboyu büyütür, dokunuş gücünü
  %100'e kadar çarpar; ses ve efekt şiddeti komboyla artar.
- **Görsel efektler** — arka plan parçacık alanı, tıklama patlamaları, konfeti,
  ekran sarsıntısı, buton parıltısı ve halka dalgaları (tek `<canvas>` üzerinde).
- **Prosedürel ses** — dosyasız Web Audio; tüm efektler çalışma anında sentezlenir
  + kısık arka plan ambiyansı + çağ atlamada milestone çanı.
- **Güvenli kayıt** — otomatik rotasyonlu yedek; bozuk kayıtta otomatik
  kurtarma. Yedek koduna şema doğrulama.
- **Hesap & bulut kayıt** — taşınabilir yedek kodu (her yerde çalışır) +
  Google Play Games entegrasyonu için hazır katman.
- `prefers-reduced-motion` desteği — hareket azaltma tercihine saygı duyar.

## 📁 Yapı

| Yol                     | Görevi                                          |
| ----------------------- | ----------------------------------------------- |
| `www/index.html`        | Arayüz iskeleti, script yükleme sırası          |
| `www/style.css`         | Mobil öncelikli tasarım (karanlık tema) + efektler |
| `www/game.js`           | Oyun mantığı, kayıt, offline, prestij, başarım, kombo, modal'lar |
| `www/combat.js`         | `Combat` — savaş runtime, boss, ekipman, reroll |
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
- [x] Idle savaş + boss sistemi (aşamalar, süre sınırlı boss)
- [x] Ekipman + nadirlik + kritik (boss ganimeti)
- [x] Reroll (ekipman yeniden çekme) + kritik azalan getiri dengelemesi
- [x] Güvenli kayıt rotasyonu + JSON şema doğrulama
- [x] Tüm yıkıcı işlemler için özel modal'lar (native confirm/prompt kaldırıldı)
- [ ] Play Games native eklentisini bağla (bkz. `docs/PLAY_GAMES.md`)
- [ ] Görevler / günlük hedefler sistemi

Ayrıntılı yol haritası: [`memory-bank/08-roadmap.md`](memory-bank/08-roadmap.md).
