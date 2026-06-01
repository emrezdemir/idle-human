# 02 — Mimari

## Dosya yapısı

```
idle-human/
├── www/                     # OYUN (tarayıcı + Capacitor webDir)
│   ├── index.html           # Arayüz iskeleti, <script> yükleme sırası
│   ├── style.css            # Tüm stiller (mobil öncelikli, karanlık tema)
│   ├── game.js              # Oyun mantığı: durum, ekonomi, render, kayıt
│   ├── audio.js             # SFX modülü — Web Audio ile prosedürel ses
│   ├── effects.js           # Effects modülü — canvas parçacık/efekt motoru
│   ├── cloud.js             # Cloud modülü — hesap + bulut kayıt soyutlaması
│   ├── manifest.json        # PWA manifesti
│   └── icons/               # Web/PWA simgeleri
├── android/                 # Capacitor native Android projesi (repoda)
├── resources/               # Simge/splash kaynakları + üretici betikler
│   ├── generate_icons.py    # Simge + splash üretir (Pillow)
│   ├── generate_feature_graphic.py  # Play "feature graphic" üretir
│   ├── generate-keystore.sh # Kullanıcının imzalama anahtarını üretmesi için
│   └── play/                # Mağaza görselleri (feature graphic, 512 ikon)
├── pages/                   # GitHub Pages: landing + gizlilik politikası
├── memory-bank/             # BU KLASÖR — kalıcı proje hafızası
├── docs/                    # Ek rehberler (PLAY_GAMES.md)
├── STORE.md                 # Play Console'a çıkış rehberi
├── capacitor.config.json    # appId, appName, webDir, splash ayarı
├── package.json             # Komutlar + Capacitor bağımlılıkları
└── .github/workflows/build.yml  # CI: web doğrulama + APK/AAB + Pages
```

## Script yükleme sırası (index.html)

Sıra önemlidir — `game.js` diğerlerine bağımlıdır:

```html
<script src="audio.js"></script>    <!-- window.SFX -->
<script src="effects.js"></script>  <!-- window.Effects -->
<script src="cloud.js"></script>    <!-- window.Cloud -->
<script src="game.js"></script>     <!-- hepsini kullanır, init eder -->
```

> ⚠️ **Klasik script tuzağı:** Klasik `<script>` içinde top-level `const X = ...`
> **window'a bağlanmaz**. Bu yüzden her modül sonunda açıkça `window.SFX = SFX;`
> gibi bir satır var. Modül globalini kaldırırsan oyun sessizce efektsiz kalır.

## Modüller arası bağımlılık

```
game.js
 ├─ window.SFX      (ses; yoksa sessizce atlanır)
 ├─ window.Effects  (görsel; yoksa sessizce atlanır)
 └─ window.Cloud    (hesap/kayıt; yoksa yalnız yerel kayıt)
```

Her bağımlılık **opsiyoneldir**: `game.js` her çağrıdan önce `if (window.X)`
kontrolü yapar. Böylece bir modül yüklenmese de oyun çökmeden çalışır
(graceful degradation).

## Veri akışı (tek tıklama örneği)

```
Kullanıcı butona dokunur
→ handleClick(evt)
   ├─ registerComboHit()         kombo sayacını artır, çürüme zamanlayıcısını sıfırla
   ├─ clickPower()               temel güç × global çarpan × kombo çarpanı
   ├─ state.population += gain   durumu güncelle
   ├─ playClick()  → SFX.click(comboIntensity())
   ├─ spawnFloatText(x,y,...)    "+N" yüzen yazı (DOM)
   ├─ triggerClickFx(x,y)        Effects.burst + buton pop + halka
   └─ renderResource()           sayıları ve mağaza erişilebilirliğini güncelle
```

## Oyun durumu (state)

Tek bir `state` nesnesi her şeyi tutar (bkz. `newState()` — `game.js`):

```js
{
  population, totalEarned, runEarned, clicks,
  genes, prestiges,           // prestij ilerlemesi
  owned: { <genId>: adet },   // üreticiler
  upgrades: { <upgId>: true },// alınan yükseltmeler
  unlocked: { <achId>: true },// açılan başarımlar
  soundOn, lastSeen,
}
```

- **Kombo** durumu (`comboCount` vb.) bilerek `state` dışında — geçici UI tercihi,
  kaydedilmez.
- **buyAmount** (×1/×10/×100/MAKS) de geçici UI tercihi.

## Döngüler ve zamanlayıcılar

| Aralık | İş |
|---|---|
| `TICK_MS` = 100ms | `gameLoop`: pasif üretim ekle, başarım kontrol, render |
| 15s | otomatik `save(false)` |
| `requestAnimationFrame` | `Effects.frame`: canvas efekt çizimi (sekme gizliyken durur) |
| beforeunload / visibilitychange | sayfa kapanırken/gizlenirken kaydet |

## Kayıt / yükleme

- Anahtar: `SAVE_KEY = "idle-human-save-v1"`.
- `save()` → `JSON.stringify(state)` → localStorage.
- `load()` → `Object.assign(newState(), data)` ile **ileri uyumluluk**: yeni alanlar
  varsayılanından gelir, eski kayıtlar bozulmaz.
- **Offline kazanç:** `applyOfflineProgress()` `lastSeen`'den bu yana geçen süreyi
  alıp pasif üretimi geri verir (10 sn altını yok sayar).
- **Yedek kodu:** `Cloud.encodeCode(state)` tüm kaydı Base64 metne çevirir; başka
  cihazda `decodeCode` ile geri yüklenir.
