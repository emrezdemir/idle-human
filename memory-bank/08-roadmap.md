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
      prestij sesleri + kısık arka plan ambiyansı + çağ atlama çanı)
- [x] **Hesap & bulut kayıt katmanı** (taşınabilir yedek kodu + Play Games hook'u)
- [x] Capacitor 7, native android/ projesi, imzalı AAB+APK, CI/CD
- [x] Gizlilik politikası, mağaza görselleri, STORE.md rehberi
- [x] memory-bank/ (bu dokümantasyon)
- [x] **Idle savaş + boss sistemi** (1.11) — aşamalar, süre sınırlı boss, +%5 kalıcı bonus
- [x] **Boss ganimeti: ekipman + kritik** (1.12) — silah/zırh/yüzük + 4 nadirlik
- [x] **Reroll + denge cila paketi** (1.13) — ekipman yeniden çekme, azalan
      getirili kritik formülü, boss timeout %35 hasar korur, milestone tetikleniyor
- [x] **Güvenli kayıt** (1.13) — `_prev` rotasyonu, JSON şema doğrulama,
      bozuk kayıttan otomatik kurtarma
- [x] **Tüm yıkıcı işlemler özel modal** (1.13) — prestij, sıfırla, reroll,
      geri yükle için ortak `#confirmModal` + `#restoreModal`
- [x] **combat.js modülü** (1.13) — savaş + ekipman game.js'ten ayrıldı
- [x] **Cross-platform `npm run serve`** (1.13) — npx http-server tabanlı

## Sırada (kısa vade)

- [ ] **Play Games Services native eklentisini bağla** (bkz. `docs/PLAY_GAMES.md`).
      Gerekli: Play Console + Google Cloud OAuth + SHA-1 + games-ids.xml.
- [ ] Ekran görüntüleri çek (Play listesi için en az 2, ideal 4–8 dikey) —
      yeni boss savaşı + ekipman ekranı dahil.
- [ ] İlk **internal testing** sürümünü Play Console'a yükle.

## Orta vade fikirler

- [ ] **Görevler / günlük hedefler** sistemi (yeni `www/quests.js` modülü).
- [ ] **Çevrimdışı kazanç sınırı** + "2× izle" yerine "2× topla" düğmesi.
- [ ] Üreticilere **görsel kademe rozetleri** (10/25/50/100'de ikon değişimi).
- [ ] Otomatik bulut↔yerel **birleştirme** (`mergePreferHigher`).
- [ ] **Tema seçenekleri** (renk paletleri) ve düşük güç modu.
- [ ] Sayı son eklerini genişlet (Dc ötesi) ve bilimsel gösterim seçeneği.
- [ ] **Ekipman setleri** — 3 slot aynı nadirlikte → küçük set bonusu.
- [ ] **Ekipman parçalama** — gereksiz parça yok et, reroll ucuzlat.
- [ ] **Yeni düşman türleri** — boss tipleri (hızlı/zırhlı/iyileşen).

## Uzun vade / belki

- [ ] Play Games **skor tabloları** ve **başarımları** (Console tarafı).
- [ ] PWA "yükle" istemi + servis çalışanı ile tam çevrimdışı önbellek.
- [ ] Yerelleştirme (i18n) altyapısı — şu an metinler gömülü Türkçe.
- [ ] iOS paketi (Capacitor iOS) — ayrı imzalama/yayın akışı gerekir.

## Bilinen sınırlar

- Kayıt tek cihazda; bulut yalnızca elle yedek kodu ya da (yapılandırılırsa) Play.
- Çok büyük sayılarda (1e300+) JS `Number` hassasiyeti sınırına yaklaşılır;
  şimdilik oyun dengesi buraya ulaşmadan çok önce biter.
- Boss timeout dengesini değiştirirken `BOSS_TIMEOUT_HEAL` (`combat.js`) ile
  oyna; çok düşük → duvar anlamsızlaşır, çok yüksek → "ilerleyemiyorum" hissi.
