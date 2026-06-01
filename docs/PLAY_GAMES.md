# 🎮 Google Play Games ile Giriş & Bulut Kayıt — Kurulum Rehberi

Bu rehber, oyundaki **"Google Play ile Giriş"** ve **buluta yedekleme**
özelliğini gerçekten çalışır hale getirmek için gereken adımları anlatır.

Oyun kodu tarafı **zaten hazır**: `www/cloud.js` içindeki `Cloud` katmanı,
`PlayGamesServices` adında bir Capacitor eklentisi varsa otomatik kullanır;
yoksa zarifçe devre dışı kalır (oyun yine çalışır). Yani burada yapılacak iş,
**native eklentiyi eklemek** ve **Google tarafını yapılandırmak**.

> Neden hazır gömülü değil? Çünkü çalışması tamamen senin Google hesabına bağlı
> (Play Console + Cloud projesi + imza parmak izi). Bunlar olmadan eklentiyi
> gömseydik derleme/çalışma kırılırdı. Bu yüzden katman opsiyonel bırakıldı.

---

## Genel bakış (büyük resim)

```
Oyun (cloud.js)  ──>  Capacitor eklentisi  ──>  Play Games Services SDK
                                                      │
                                                      ├─ Oturum (kim bu oyuncu)
                                                      └─ Saved Games (bulut kayıt)
                                                          │
                                              Google tarafı: Play Console + Cloud OAuth
```

Dört parça gerekir:
1. **Play Console**'da Play Games Services yapılandırması (App ID).
2. **Google Cloud**'da OAuth 2.0 istemcisi + uygulamanın **SHA-1** parmak izi.
3. **Native eklenti** (Capacitor) projeye eklenir.
4. **`games-ids.xml`** ve manifest meta-data ile App ID native projeye tanıtılır.

---

## Adım 1 — İmza parmak izini (SHA-1) al

Play Games, uygulamanı imza anahtarınla tanır. İki parmak izi gerekir:

- **Upload anahtarı** (senin `idle-human-release.keystore`):
  ```bash
  keytool -list -v -keystore idle-human-release.keystore -alias idlehuman
  ```
  Çıktıdaki `SHA1:` satırını not al.

- **Play App Signing anahtarı** (Google'ın yönettiği): Play Console →
  uygulaman → **Setup → App signing** sayfasında "App signing key certificate"
  altındaki SHA-1. İkisini de Cloud'a eklemen gerekecek (özellikle yayınlanan
  sürümler App Signing anahtarıyla imzalanır).

---

## Adım 2 — Google Cloud OAuth istemcisi

1. [Google Cloud Console](https://console.cloud.google.com) → yeni proje
   (ya da Play Console'un otomatik oluşturduğu projeyi kullan).
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Tür: **Android**.
4. **Package name:** `com.idlehuman.game`
5. **SHA-1:** Adım 1'deki parmak izi (hem upload hem App Signing için birer tane).
6. Ayrıca **OAuth consent screen**'i doldur (uygulama adı, e-posta, gizlilik URL'i:
   `https://emrezdemir.github.io/idle-human/privacy.html`).

---

## Adım 3 — Play Console'da Play Games Services

1. [Play Console](https://play.google.com/console) → uygulaman →
   **Grow → Play Games Services → Setup and management → Configuration**.
2. "Yes, my game already uses Google APIs" → Adım 2'deki Cloud projesini seç.
3. Bir **App ID** üretilir (sayısal, ör. `1234567890`). Bunu not al — native
   projeye gömülecek.
4. **Credentials** ekle: Android kimlik bilgisi olarak package name + SHA-1.
5. İstersen burada **achievements** ve **leaderboards** da tanımlayabilirsin
   (oyun ileride bunları kullanabilir).
6. Test için kendi Google hesabını **testers** listesine ekle (yayınlanmadan
   önce yalnızca testçiler giriş yapabilir).

---

## Adım 4 — Native eklentiyi ekle

Capacitor için bir Play Games eklentisi kur. (Topluluk eklentileri zamanla
değişir; sözleşme `cloud.js`'te tanımlı: `signIn/signOut/getCurrentPlayer/
saveGame/loadGame`.) Örnek:

```bash
npm install capacitor-plugin-play-games-services   # ya da eşdeğeri
npx cap sync android
```

> Seçtiğin eklentinin API'si farklıysa, köprüyü tek yerden — `www/cloud.js`'teki
> `playPlugin()` ve onu kullanan fonksiyonlar — uyarlaman yeterli. Oyun kodunun
> geri kalanı değişmez.

Eklenti, `window.Capacitor.Plugins.PlayGamesServices` olarak görünmeli. `cloud.js`
bunu otomatik bulur ve hesap penceresindeki **"Google Play ile Giriş"** bölümü
kendiliğinden görünür hale gelir.

---

## Adım 5 — App ID'yi native projeye tanıt

`android/app/src/main/res/values/games-ids.xml` oluştur:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="game_services_project_id">1234567890</string>
    <!-- Adım 3'teki sayısal App ID -->
</resources>
```

`android/app/src/main/AndroidManifest.xml` içinde `<application>` altına:

```xml
<meta-data android:name="com.google.android.gms.games.APP_ID"
           android:value="@string/game_services_project_id" />
```

> Not: `games-ids.xml` ve manifest değişikliği native dosyalardır; `android/`
> repoda tutulduğu için bunlar commit'lenir (sır değildir — App ID gizli değil).

---

## Adım 6 — Test et

1. `npm run android:apk` (imzalı) ya da Android Studio'dan çalıştır.
2. Hesap (👤) → **"Google Play ile Giriş"**. Testers listesindeki hesapla gir.
3. Bir miktar ilerle → **"Buluta Yedekle"**.
4. Uygulamayı sil/yeniden kur → giriş yap → kaydın geri geldiğini doğrula.

### Sık karşılaşılan sorunlar

| Belirti | Olası neden |
|---|---|
| Giriş penceresi açılıp hemen kapanıyor | SHA-1 yanlış/eksik (upload **ve** App Signing ikisi de eklenmeli) |
| "App not configured" hatası | Play Console'da Play Games Services yayımlanmamış/eksik |
| Giriş çalışıyor ama Saved Games boş | Saved Games özelliği Console'da etkin değil ya da `title` tutarsız |
| Yalnızca senin hesabın giriyor | Henüz test aşamasında — testers listesine ekle ya da yayınla |

---

## Güvenlik & gizlilik notu

- Bu akış kullanıcının **kendi** Google hesabını kullanır; veri senin sunucuna
  gitmez (zaten sunucun yok). Kayıt, kullanıcının Google Drive "Saved Games"
  alanında saklanır.
- Bu yüzden gizlilik politikası "veri toplamıyoruz" diyebiliyor — doğru kalır.
- App ID ve OAuth client ID **gizli değildir**; repoda durabilir. **Keystore ve
  parolalar** gizlidir; onlar asla repoya girmez.

---

İlgili belgeler: [`../STORE.md`](../STORE.md) (mağazaya çıkış),
[`../memory-bank/05-cloud-and-accounts.md`](../memory-bank/05-cloud-and-accounts.md)
(katmanın mimarisi).
