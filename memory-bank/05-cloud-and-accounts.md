# 05 — Hesap ve Bulut Kayıt

## Tasarım felsefesi

Oyun **sunucusuz** çalışır (gizlilik + maliyet). Yine de oyuncunun ilerlemesini
**taşıyabilmesi** ve (Android'de) **buluta yedekleyebilmesi** istendi. Çözüm: tek
bir soyutlama (`cloud.js` → `window.Cloud`) arkasında üç sağlayıcı.

## Üç sağlayıcı

| Sağlayıcı | Durum | Nasıl çalışır |
|---|---|---|
| **local** | Varsayılan, her zaman | Kayıt yalnızca `localStorage` (game.js'in işi). |
| **code** | Her yerde çalışır | Tüm kaydı Base64 "yedek kodu"na çevirir; kullanıcı kopyalar/yapıştırır. Sunucu gerektirmez. |
| **play** | Opsiyonel (Android) | Google Play Games "Saved Games" + oturum. Eklenti + Play Console yapılandırması gerekir. |

> Anahtar fikir: `game.js` yalnızca `Cloud.*` çağırır; hangi sağlayıcının aktif
> olduğunu bilmez. Gerçek bir backend (ör. Firebase) eklemek istenirse **sadece
> `cloud.js`** değişir.

## Taşınabilir yedek kodu (code)

```js
const code = Cloud.encodeCode(JSON.stringify(state)); // "IH1:<base64>"
const saveString = Cloud.decodeCode(code);            // geri çözer
```

- `"IH1:"` sürüm öneki — ileride format değişirse ayırt etmek için.
- Unicode güvenli (`TextEncoder`/`TextDecoder` + `btoa`/`atob`).
- UI: hesap penceresinde metin kutusu + "Kopyala" / "Geri Yükle" düğmeleri.

## Play Games katmanı (play)

`cloud.js`, `window.Capacitor.Plugins.PlayGamesServices` eklentisini **opsiyonel**
arar. Eklenti yoksa `isPlayAvailable()` `false` döner ve hesap penceresindeki Play
bölümü gizlenir — oyun normal çalışır.

Beklenen eklenti arayüzü (sözleşme):

```
PlayGamesServices.signIn()
PlayGamesServices.signOut()
PlayGamesServices.getCurrentPlayer() -> { displayName }
PlayGamesServices.saveGame({ title, description, data })
PlayGamesServices.loadGame({ title }) -> { data }
```

### Neden eklenti henüz repoya gömülü değil?

Play Games Services'i **gerçekten** çalıştırmak için şunlar gerekir ve bunların
hepsi proje sahibinin hesabına bağlıdır (kodla halledilemez):

1. Google Play Console'da **Play Games Services** yapılandırması.
2. Bir **Google Cloud** projesi + OAuth 2.0 istemci kimliği.
3. Uygulamanın **SHA-1 imza parmak izi**nin Console'a tanıtılması.
4. `android/app/src/main/res/values/games-ids.xml` içine **App ID**.

Bu yüzden `cloud.js` katmanı **hazır ve test edilebilir** (eklenti yokken zarifçe
devre dışı), ama native eklentiyi eklemek/yapılandırmak ayrı bir adım olarak
[`docs/PLAY_GAMES.md`](../docs/PLAY_GAMES.md)'de adım adım anlatılır. Böylece
yapılandırma tamamlanmadan derleme kırılmaz.

## Çakışma / birleştirme stratejisi (öneri)

Bulut ile yerel kayıt çakışırsa basit kural: **daha yüksek `totalEarned` kazanır**.
Şu an UI "buluta yedekle" ve "geri yükle"yi ayrı tutuyor (kullanıcı karar verir);
otomatik birleştirme eklenirse `cloud.js`'e bir `mergePreferHigher(a, b)` koyulmalı.

## Gizlilik

- `code` sağlayıcısı hiçbir veriyi dışarı göndermez (sadece panoya kopyalar).
- `play` sağlayıcısı yalnızca kullanıcı giriş yaparsa devreye girer ve veriyi
  kullanıcının **kendi** Google hesabının Saved Games alanına yazar.
- Gizlilik politikası (`pages/privacy.html`) bu yüzden "veri toplamıyoruz" diyebiliyor:
  uygulama hiçbir sunucuya veri yollamaz; Play Games kullanıcının kendi hesabıdır.
