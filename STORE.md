# Google Play Store yayın rehberi — Idle Human

Bu dosya, oyunu Google Play Store'a yüklemek için gereken her şeyi adım adım anlatır.
İki bölümden oluşur: **(A) Teknik kurulum (GitHub)** ve **(B) Play Console listesi**.

---

## A. Teknik kurulum — imzalı derleme (tek seferlik)

Uygulama her `main` push'unda otomatik olarak **imzalı AAB + APK** üretir.
Bunun çalışması için GitHub deposuna 4 adet *secret* eklemen gerekir.

### A.1 Kendi imzalama anahtarını üret

İmzalama anahtarını (keystore) **sen** üretirsin; böylece özel anahtar yalnızca
sende kalır. Kök dizinde şunu çalıştır:

```bash
bash resources/generate-keystore.sh
```

Betik bir parola sorar, `idle-human-release.keystore` dosyasını üretir ve
GitHub'a eklemen gereken 4 secret değerini (base64 dâhil) ekrana yazar.

> ⚠️ **Keystore'u kaybetme!** `idle-human-release.keystore` dosyasını ve parolayı
> güvenli bir yerde sakla (parola yöneticisi vb.) ve **asla repoya commit'leme**
> (`.gitignore` zaten `*.keystore` dosyalarını hariç tutar). Google Play App
> Signing açıksa upload anahtarını sıfırlayabilirsin, ama yine de yedeklemen
> şiddetle önerilir.

### A.2 GitHub secret'larını ekle

Depo → **Settings → Secrets and variables → Actions → New repository secret**.
Betiğin ekrana yazdığı değerlerle aşağıdaki 4 secret'ı ekle:

| Secret adı | Açıklama |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Keystore'un base64 hâli (uzun tek satır) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore deposu parolası |
| `ANDROID_KEY_ALIAS` | Anahtar takma adı (`idlehuman`) |
| `ANDROID_KEY_PASSWORD` | Anahtar parolası (aynı parola) |

### A.3 Derlemeyi tetikle

Secret'lar eklendikten sonra `main`'e bir commit push'la (ya da Actions sekmesinden
**Build** workflow'unu `Run workflow` ile elle çalıştır). Workflow bitince:

- **`idle-human.aab`** → Play Console'a yüklenecek dosya
- **`idle-human.apk`** → yan yükleme / test için

Bunlar hem **Actions → ilgili çalışma → Artifacts** altında, hem de
**Releases → latest** altında indirilebilir olur:

- `https://github.com/emrezdemir/idle-human/releases/latest/download/idle-human.aab`
- `https://github.com/emrezdemir/idle-human/releases/latest/download/idle-human.apk`

---

## B. Play Console listesi

[Google Play Console](https://play.google.com/console) → **Create app**.

### B.1 Uygulama künyesi

| Alan | Değer |
|---|---|
| App name | `Idle Human` |
| Default language | Türkçe (tr-TR) |
| App or game | **Game** |
| Free or paid | **Free** |
| Paket adı (otomatik) | `com.idlehuman.game` |

### B.2 Mağaza listesi metinleri

**Kısa açıklama** (en fazla 80 karakter):

```
Bir hücreden başla, tıkla ve büyüt; bir insandan koca bir medeniyete uzan.
```

**Tam açıklama** (en fazla 4000 karakter):

```
Idle Human, tek bir hücreden başlayıp insana ve oradan koca bir medeniyete
uzanan sade ve bağımlılık yapan bir idle/clicker oyunudur.

🧬 EVRİM
Tek hücreden başla; tıkla, kaynak biriktir ve yaşamın bir sonraki aşamasına geç.
Her katman yeni yükseltmeler ve dönüm noktaları açar.

⏳ IDLE ÜRETİM
Oyun sen yokken de çalışır. Geri döndüğünde seni biriken kaynaklar bekler;
böylece her oturumda ilerlemeni hissedersin.

⚡ YÜKSELTMELER
Üretimini katlayan onlarca yükseltme. Stratejini kur, en verimli yolu bul,
sayıların büyümesini izle.

💾 OTOMATİK KAYIT
İlerlemen cihazında otomatik olarak kaydedilir. Kaldığın yerden devam et.

🆓 TAMAMEN ÜCRETSİZ
Reklam yok, uygulama içi satın alma yok, gizli ücret yok. Sadece oyna.

📴 ÇEVRİMDIŞI OYNANABİLİR
İnternet bağlantısı olmadan da oynayabilirsin.

Rahatlatıcı, zaman geçiren ve "bir tık daha" dedirten bir deneyim arıyorsan
Idle Human tam sana göre. Hücreden medeniyete giden yolculuk seni bekliyor!
```

### B.3 Grafik varlıklar

| Varlık | Gereksinim | Dosya |
|---|---|---|
| Uygulama ikonu | 512×512 PNG (32-bit) | `resources/play/icon-512.png` |
| Feature graphic | 1024×500 PNG/JPG | `resources/play/feature-graphic.png` |
| Telefon ekran görüntüsü | En az 2 adet (16:9 veya 9:16), 320–3840 px | *aşağıya bak* |

**Ekran görüntüleri:** Oyunu aç (`https://emrezdemir.github.io/idle-human/game/`
ya da telefona kurulu APK), birkaç farklı ekranını yakala (başlangıç, yükseltmeler,
ilerleme). En az 2, ideali 4–8 adet dikey (telefon) görüntü yükle.

### B.4 İçerik derecelendirmesi (Content rating)

Anketi doldur. Bu oyun için tüm hassas içerik soruları **Hayır** olur
(şiddet, cinsellik, kumar, vb. yok). Sonuç büyük olasılıkla **Everyone / 3+**.

### B.5 Veri güvenliği (Data safety)

- **Uygulama veri topluyor mu / paylaşıyor mu?** → **Hayır**
- Oyun yalnızca cihazda yerel kayıt (localStorage) tutar; hiçbir veri sunucuya gitmez.
- Gizlilik politikası URL'i (zorunlu):
  **`https://emrezdemir.github.io/idle-human/privacy.html`**

### B.6 Kategori ve iletişim

| Alan | Değer |
|---|---|
| Kategori | Games → Simulation (ya da Casual) |
| İletişim e-postası | emrebourne@gmail.com |
| Web sitesi | https://emrezdemir.github.io/idle-human/ |

### B.7 Sürümü yükle

**Production → Create new release** (önce **Internal testing** ile denemen önerilir):

1. **Play App Signing**'i kabul et (önerilir; Google imza anahtarını yönetir,
   sen yalnızca upload anahtarını kullanırsın — bu repodaki keystore odur).
2. `idle-human.aab` dosyasını yükle.
3. Sürüm notlarını gir, kaydet, gözden geçir ve yayına gönder.

İlk inceleme genelde birkaç saat–birkaç gün sürer.

---

## Sürüm yükseltme

Yeni sürüm çıkarmadan önce `android/app/build.gradle` içinde:

- `versionCode`'u **bir artır** (Play aynı kodu iki kez kabul etmez), örn. 1 → 2
- `versionName`'i güncelle, örn. `"1.0.0"` → `"1.1.0"`

Sonra `main`'e push'la; yeni imzalı AAB otomatik üretilir.
