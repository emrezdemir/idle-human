# 02 — Mimari

## Dosya yapısı

```
idle-human/
├── www/                     # OYUN (tarayıcı + Capacitor webDir)
│   ├── index.html           # Arayüz iskeleti, <script> yükleme sırası
│   ├── style.css            # Tüm stiller (mobil öncelikli, karanlık tema)
│   ├── game.js              # Oyun mantığı: durum, ekonomi, çağlar, render, kayıt, menü
│   ├── version.js           # window.APP_VERSION: sürüm + build + changelog (CI damgalar)
│   ├── eras-art.js          # window.ERA_ART: çağlara özel SVG figürler (avatar yedeği)
│   ├── scene2d.js           # window.Scene2D: CSS/SVG 2D çağ sahnesi + flat vektör karakter
│   ├── assets/characters/   # Kullanıcının ekleyeceği 2D yüz görselleri (CC0/kendi)
│   ├── audio.js             # SFX modülü — Web Audio ile prosedürel ses
│   ├── effects.js           # Effects modülü — canvas parçacık/efekt motoru (yedek)
│   ├── effects-pixi.js      # Pixi/WebGL efekt motoru; varsa Effects'i değiştirir
│   ├── cloud.js             # Cloud modülü — hesap + bulut kayıt soyutlaması
│   ├── vendor/pixi.min.js   # PixiJS v7 (UMD) — fullscreen efekt motoru (offline)
│   ├── manifest.json        # PWA manifesti
│   └── icons/               # Web/PWA simgeleri
├── android/                 # Capacitor native Android projesi (repoda)
├── resources/               # Simge/splash kaynakları + üretici betikler
│   ├── generate_icons.py    # Simge + splash üretir (Pillow)
│   ├── generate_feature_graphic.py  # Play "feature graphic" üretir
│   ├── generate-keystore.sh # Kullanıcının imzalama anahtarını üretmesi için
│   └── play/                # Mağaza görselleri (feature graphic, 512 ikon)
├── pages/                   # GitHub Pages: landing + hakkında + sorumluluk reddi + gizlilik
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
<script src="vendor/pixi.min.js"></script>  <!-- window.PIXI (UMD) -->
<script src="version.js"></script>   <!-- window.APP_VERSION -->
<script src="eras-art.js"></script>  <!-- window.ERA_ART (SVG figürler) -->
<script src="scene2d.js"></script>   <!-- window.Scene2D (CSS/SVG 2D sahne) -->
<script src="audio.js"></script>     <!-- window.SFX -->
<script src="effects.js"></script>   <!-- window.Effects (canvas yedek) -->
<script src="effects-pixi.js"></script> <!-- WebGL varsa Effects'i Pixi ile değiştirir -->
<script src="cloud.js"></script>     <!-- window.Cloud -->
<script src="game.js"></script>      <!-- hepsini kullanır, init eder -->
```

Görsel katmanlar ve güvenli geri dönüşler:
- `effects-pixi.js`: WebGL varsa `window.Effects`'i Pixi motoruyla değiştirir;
  yoksa `effects.js` (canvas) kalır. İkisi de aynı API: `init, burst, confetti, screenShake`.
- `scene2d.js`: çağ mekanını (CSS/SVG gökyüzü + manzara + zemin) ve karakteri
  (portrenin flood-fill ile kırpılmış hâli) kurar; tık alanı `#scene2d`'dir
  (`game.js`'te `scene2dActive`). Saf DOM olduğu için her ortamda çalışır;
  Scene2D yoksa `eras-art.js` SVG figürlü 2D buton yedeğine düşer.
- Önceki Three.js 3D sahne kötü göründüğü için kaldırıldı (v1.9.0).

## Sürüm damgalama

`version.js` yerelde `build: "dev"` taşır. CI (build.yml) hem `android` hem
`pages` job'ında, derleme öncesi `build`'i kısa commit hash'iyle ve `date`'i
derleme tarihiyle değiştirir. Sürüm ekranda görünür (footer etiketi, ana menü,
ayarlar) — böylece yayınlanan build hash'i son commit'le karşılaştırılarak bir
deploy'un gerçekten çıktığı doğrulanabilir. Yeni özellik eklenince `version`
elle artırılır ve `changelog`'a en üste bir kayıt eklenir.

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
