# 06 — Derleme ve Yayın

## Capacitor kurulumu

- **Capacitor 7** (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`).
- `webDir: "www"` — derleme adımı yok; `www/` doğrudan native projeye kopyalanır.
- `appId: com.idlehuman.game`, `appName: Idle Human`.
- Native `android/` projesi **repoda tutulur** (imzalama/sürüm/targetSdk'yı açıkça
  kontrol edebilmek için). `npx cap sync android` web varlıklarını kopyalar.

### Sürüm hedefleri (Capacitor 7 varsayılanları)

| | Değer |
|---|---|
| compileSdk / targetSdk | 35 |
| minSdk | 23 |
| Android Gradle Plugin | 8.7.2 |
| Gradle | 8.11.1 |
| Java | 21 |

## İmzalama

`android/app/build.gradle`, kök dizindeki `keystore.properties` dosyasından okur:

```properties
storeFile=release.keystore
storePassword=...
keyAlias=idlehuman
keyPassword=...
```

- Dosya **yoksa** (örn. fork PR'ları) release imzasız kalır, debug etkilenmez —
  derleme kırılmaz.
- Bu dosya ve `*.keystore` **`.gitignore`'da** → asla commit'lenmez.
- Anahtarı kullanıcı kendi üretir: `bash resources/generate-keystore.sh`.

## Yerel komutlar (package.json)

```bash
npm ci                 # bağımlılıklar (lock'tan, tekrarlanabilir)
npm run serve          # www/'i 8000'de servis et
npm run cap:sync       # web -> android kopyala
npm run android:debug  # imzasız debug APK
npm run android:apk    # imzalı release APK
npm run android:aab    # imzalı App Bundle (Play Store)
```

Çıktılar:
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`
- Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## CI/CD (`.github/workflows/build.yml`)

Üç iş (job):

1. **web** — `node --check www/game.js` + JSON doğrulama. Hızlı kapı.
2. **android** — `npm ci` → `cap sync` → Gradle. Mantık:
   - `ANDROID_KEYSTORE_BASE64` secret'ı **varsa**: keystore'u çöz, `keystore.properties`
     yaz, **imzalı AAB + APK** derle, `idle-human.aab` / `idle-human.apk` olarak çıkar.
   - **yoksa**: imzasız **debug APK** derle (`idle-human.apk`).
   - Her iki durumda artifact yükler; `main`'e push + imza varsa `latest` Release'i
     günceller. Sırlar `always()` ile temizlenir.
3. **pages** — `main`'e push'ta: `pages/` (landing + gizlilik) + `www/` (`/game/`)
   GitHub Pages'e dağıtılır.

### Gerekli GitHub secret'ları

| Secret | Kaynak |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `generate-keystore.sh` çıktısı (base64) |
| `ANDROID_KEYSTORE_PASSWORD` | belirlediğin parola |
| `ANDROID_KEY_ALIAS` | `idlehuman` |
| `ANDROID_KEY_PASSWORD` | aynı parola |

> Secret'lar tanımlı değilse pipeline yine yeşil olur, sadece imzasız APK üretir.
> Böylece katkıda bulunanların fork'larında CI kırılmaz.

## Sürümleme

Yeni sürüm öncesi `android/app/build.gradle`:
- `versionCode` **+1** (Play aynı kodu reddeder).
- `versionName` güncelle (ör. `1.0.0` → `1.1.0`).

Sonra `main`'e push → CI imzalı AAB üretir → Play Console'a yükle.

## Kalıcı indirme bağlantıları

- APK: `https://github.com/emrezdemir/idle-human/releases/latest/download/idle-human.apk`
- AAB: `https://github.com/emrezdemir/idle-human/releases/latest/download/idle-human.aab`
- Oyna: `https://emrezdemir.github.io/idle-human/`
