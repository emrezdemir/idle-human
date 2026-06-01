# 08 — Yol Haritası

## Yapıldı

- [x] Temel idle/clicker döngüsü (dokun, üret, yükselt)
- [x] 12 üretici (taş devri → uzay çağı), toplu alım (×1/×10/×100/MAKS)
- [x] 14 yükseltme (dokunuş / tüm üretim / üretici-özel çarpanlar)
- [x] Prestij sistemi (Gen çarpanı, kare kök eğrisi)
- [x] 20 başarım (+%1 üretim/başarım)
- [x] Offline kazanç + otomatik kayıt + yüzen yazı
- [x] **Kombo sistemi** (hızlı tıklama → dokunuş çarpanı + artan ses/efekt)
- [x] **Görsel efekt motoru** (arka plan parçacıkları, tıklama patlaması, konfeti,
      ekran sarsıntısı, buton parıltı/pop, halka dalgası)
- [x] **Prosedürel ses motoru** (dosyasız Web Audio; tıklama/satın alma/başarım/
      prestij sesleri + kısık arka plan ambiyansı)
- [x] **Hesap & bulut kayıt katmanı** (taşınabilir yedek kodu + Play Games hook'u)
- [x] Capacitor 7, native android/ projesi, imzalı AAB+APK, CI/CD
- [x] Gizlilik politikası, mağaza görselleri, STORE.md rehberi
- [x] memory-bank/ (bu dokümantasyon)

## Sırada (kısa vade)

- [ ] **Play Games Services native eklentisini bağla** (bkz. `docs/PLAY_GAMES.md`).
      Gerekli: Play Console + Google Cloud OAuth + SHA-1 + games-ids.xml.
- [ ] Ekran görüntüleri çek (Play listesi için en az 2, ideal 4–8 dikey).
- [ ] İlk **internal testing** sürümünü Play Console'a yükle.
- [ ] Başarım/çağ açılışında `SFX.milestone()` çanını tetikle (şu an rezerve).

## Orta vade fikirler

- [ ] **Görevler / günlük hedefler** sistemi (yeni `www/quests.js` modülü).
- [ ] **Çevrimdışı kazanç sınırı** + "2× izle" yerine "2× topla" düğmesi.
- [ ] Üreticilere **görsel kademe rozetleri** (10/25/50/100'de ikon değişimi).
- [ ] Otomatik bulut↔yerel **birleştirme** (`mergePreferHigher`).
- [ ] **Tema seçenekleri** (renk paletleri) ve düşük güç modu.
- [ ] Sayı son eklerini genişlet (Dc ötesi) ve bilimsel gösterim seçeneği.

## Uzun vade / belki

- [ ] Play Games **skor tabloları** ve **başarımları** (Console tarafı).
- [ ] PWA "yükle" istemi + servis çalışanı ile tam çevrimdışı önbellek.
- [ ] Yerelleştirme (i18n) altyapısı — şu an metinler gömülü Türkçe.
- [ ] iOS paketi (Capacitor iOS) — ayrı imzalama/yayın akışı gerekir.

## Bilinen sınırlar

- Kayıt tek cihazda; bulut yalnızca elle yedek kodu ya da (yapılandırılırsa) Play.
- Çok büyük sayılarda (1e300+) JS `Number` hassasiyeti sınırına yaklaşılır;
  şimdilik oyun dengesi buraya ulaşmadan çok önce biter.
