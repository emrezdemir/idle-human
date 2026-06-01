# 🧠 Memory Bank — Idle Human

Bu klasör, projenin **kalıcı hafızasıdır**: kodun nasıl çalıştığını, neden böyle
kurulduğunu ve nasıl geliştirileceğini anlatan kısa, odaklı belgeler. Amaç, projeye
(insan ya da yapay zekâ) yeni dönen birinin kodu okumadan önce **bağlamı** hızlıca
kurabilmesi.

> Kural: önemli bir mimari karar verdiğinde ya da bir sistem değiştiğinde, ilgili
> dosyayı burada güncelle. Belgeler kod kadar değerlidir.

## İçindekiler

| Dosya | Konu |
|---|---|
| [`01-overview.md`](01-overview.md) | Proje nedir, hedefler, teknoloji seçimleri |
| [`02-architecture.md`](02-architecture.md) | Dosya yapısı, modüller, veri akışı |
| [`03-game-design.md`](03-game-design.md) | Oyun mekanikleri, ekonomi, denge sabitleri |
| [`04-effects-and-audio.md`](04-effects-and-audio.md) | Görsel efekt + ses motorları |
| [`05-cloud-and-accounts.md`](05-cloud-and-accounts.md) | Hesap, bulut kayıt, Play Games katmanı |
| [`06-build-and-release.md`](06-build-and-release.md) | Capacitor, imzalama, CI/CD, sürümleme |
| [`07-conventions.md`](07-conventions.md) | Kod stili, dil, katkı kuralları |
| [`08-roadmap.md`](08-roadmap.md) | Yapıldı / sırada / fikirler |

## Hızlı başlangıç

```bash
npm ci                 # bağımlılıklar (lock dosyasından)
npm run serve          # oyunu http://localhost:8000 'de aç
npm run android:apk    # imzalı release APK (keystore.properties gerekir)
npm run android:aab    # Play Store için App Bundle
```

Mağazaya çıkış rehberi: depo kökündeki [`STORE.md`](../STORE.md).
Play Games entegrasyonu: [`../docs/PLAY_GAMES.md`](../docs/PLAY_GAMES.md).
