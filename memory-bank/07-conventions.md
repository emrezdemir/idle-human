# 07 — Kurallar ve Stil

## Dil

- **Kullanıcıya görünen tüm metin Türkçe** (arayüz, mağaza, gizlilik).
- **Kod yorumları Türkçe** — proje boyunca tutarlı.
- Değişken/fonksiyon adları İngilizce (ör. `clickPower`, `totalPerSecond`).

## JavaScript

- `"use strict";` her dosyanın başında.
- Modüller **IIFE + açık `window.X = X`** deseniyle (build adımı yok, ES module yok).
  Klasik `<script>` kullanıldığı için top-level `const` window'a bağlanmaz — bağla.
- Bağımlılıklar **opsiyonel**: başka modülü çağırmadan önce `if (window.X)` kontrol et.
- Saf fonksiyonları (hesaplama) yan etkili olanlardan (render/DOM) ayrı tut.
- DOM erişimi tek yerden: `el` nesnesi + `document.getElementById`. Sık render edilen
  yolda `innerHTML`'i yeniden yazmak yerine `refreshAffordability` gibi nokta
  güncelleme tercih et (performans).

## CSS

- Tek dosya (`style.css`), **mobil öncelikli**, karanlık tema.
- Renkler/ölçüler `:root` CSS değişkenlerinde — sabit renk gömme.
- Animasyonlar `@keyframes` ile; `prefers-reduced-motion` her zaman onurlandırılır.
- `z-index` katmanları: `#fxCanvas` (0) < `#app` (1) < toast/modal (10–30).

## Dosya ekleme

Yeni bir oyun sistemi (ör. görevler) eklerken:
1. Mantığı ayrı bir `www/<sistem>.js` modülüne koy, `window.<Ad>` olarak dışa aç.
2. `index.html`'de `game.js`'ten **önce** yükle.
3. `game.js`'te opsiyonel olarak kullan (`if (window.<Ad>)`).
4. `memory-bank/`'ı güncelle.

## Commit mesajları

- Türkçe, emirsiz/özetleyici: "X eklendi", "Y düzeltildi".
- Tek satır başlık + gerekiyorsa madde imli gövde.

## Test

- Ağır framework yok. Doğrulama:
  - `node --check www/*.js` (söz dizimi) — CI'da çalışır.
  - Gerektiğinde **jsdom** ile geçici smoke test (DOM'da yükle, tıkla, doğrula).
    Test bittiğinde geçici dosyaları sil; repoda bırakma.
- Davranış değişikliğinde elle tarayıcıda da dene (`npm run serve`).

## Güvenlik / gizlilik

- **Sır gömme.** Keystore, parola, token asla repoya girmez (`.gitignore`).
- Veri toplama yok; yeni bir izin/SDK eklenirse gizlilik politikası güncellenir.

## Bağımlılık politikası

- Runtime bağımlılığı **yok** (oyun saf JS kalmalı).
- Yalnızca **araç** bağımlılıkları (Capacitor CLI, @capacitor/assets) `devDependencies`.
