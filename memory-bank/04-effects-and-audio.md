# 04 — Efektler ve Ses

## Görsel efekt motoru (`effects.js` → `window.Effects`)

Tek bir tam ekran `<canvas id="fxCanvas">` üzerinde çalışır. `#app` bu canvas'ın
üstünde (z-index) durur; canvas `pointer-events: none` olduğu için dokunmayı
engellemez.

### Bileşenler

| Öğe | Açıklama |
|---|---|
| **Yıldız alanı** | Yavaşça yukarı süzülen, parıldayan arka plan parçacıkları (kalıcı). Sayısı ekran alanına göre ölçeklenir (maks ~70). |
| **burst(x,y)** | Tıklama patlaması: merkezsiz dağılan parçacık demeti. Kombo arttıkça sayı + hız artar. |
| **confetti()** | Yukarıdan yağan dönen dikdörtgenler (başarım/prestij/yükseltme kutlaması). |
| **screenShake(mag)** | Tüm sahneyi birkaç kare rastgele kaydırır, üstel sönümle durur. |

### API

```js
Effects.init();                    // index() içinde bir kez
Effects.burst(x, y, {count, power, color});
Effects.confetti({count});
Effects.screenShake(magnitude);
```

### Performans / erişilebilirlik

- `requestAnimationFrame` döngüsü; **sekme gizliyken durur** (visibilitychange).
- `dpr` en fazla 2 ile sınırlanır (retina'da aşırı çözünürlük yok).
- Parçacık tavanı 600 (taşarsa en eskiler atılır).
- `prefers-reduced-motion: reduce` ise patlama/konfeti/sarsıntı **tamamen kapanır**
  (yıldız sayısı da düşürülür). CSS tarafında da animasyonlar iptal edilir.

## Ses motoru (`audio.js` → `window.SFX`)

> ⚠️ Modül adı bilerek `SFX`. `Audio` kullanılamaz çünkü `window.Audio` tarayıcının
> yerleşik `HTMLAudioElement` yapıcısıdır — çakışır.

Web Audio API ile **dosyasız**: her ses çalışma anında osilatör + gain zarfıyla
sentezlenir. Hiçbir `.mp3/.wav` taşınmaz → paket küçük kalır.

### Temel yapı taşları

| Fonksiyon | Üretir |
|---|---|
| `tone(freq, dur, type, vol, when)` | ADSR benzeri zarflı tek nota |
| `sweep(f1, f2, dur, ...)` | frekansı kaydıran geçiş |
| `noise(dur, vol, when)` | sönen gürültü patlaması (vurmalı his) |

### Oyun sesleri

| Çağrı | Olay |
|---|---|
| `SFX.click(intensity)` | dokunuş; kombo yoğunluğu perdeyi yükseltir |
| `SFX.buy()` | üretici satın alma (iki notalı akor) |
| `SFX.upgrade()` | yükseltme (4 notalı fanfar) |
| `SFX.achievement()` | başarım (parlak arpej + tıngırtı) |
| `SFX.prestige()` | prestij (epik süpürme + akor) |
| `SFX.milestone()` | çağ/dönüm noktası çanı (şu an rezerve) |
| `SFX.startMusic()/stopMusic()` | çok kısık arka plan "pad" ambiyansı |

### Tarayıcı politikası

AudioContext kullanıcı etkileşimine kadar **askıda** başlar. Bu yüzden:

- `ensureAudio()` her etkileşimde `ctx.resume()` çağırır.
- `init()` içinde `pointerdown` (once) ile ilk dokunuşta ses + müzik açılır.
- Ses kapalıyken (`state.soundOn === false`) tüm sentez atlanır ve müzik durur.

## game.js ile köprü

`game.js` ses için ince sarmalayıcılar tutar (`playClick`, `playBuy`,
`playAchievement`) — bunlar `state.soundOn` kontrolünü yapıp `SFX.*` çağırır.
Geçmiş kodla uyum ve tek noktadan "ses açık mı?" kontrolü için.
