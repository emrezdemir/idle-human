# 03 — Oyun Tasarımı

## Temel döngü (core loop)

1. **Dokun** → İnsanlık Puanı kazan (aktif gelir).
2. **Üretici al** → saniyede pasif puan (idle gelir).
3. **Yükseltme al** → dokunuş/üretim çarpanları.
4. Puan büyür → daha pahalı üreticiler açılır (taş devri → uzay çağı).
5. **Prestij** → her şeyi sıfırla, kalıcı **Gen** çarpanı kazan, daha hızlı büyü.
6. **Başarımlar** yol boyunca kalıcı +%1 üretim bonusları verir.

## Kombo sistemi (yeni)

Hızlı ardışık tıklama "kombo"yu büyütür ve dokunuş gücünü çarpar:

- `COMBO_WINDOW = 1500ms`: bu süre içinde tıklamazsan kombo sıfırlanır.
- `COMBO_MAX = 50`: kombo tavanı.
- `COMBO_BONUS_AT_MAX = 1.0`: tam komboda **+%100** dokunuş gücü.
- `comboIntensity()` 0..1 döner; hem **ses perdesini** hem **efekt şiddetini** sürer.
- Önemli: ekranda gösterilen "Dokunuş başına" değeri **kombosuz** temel güçtür
  (`baseClickPower`); kombo ayrı bir göstergede gösterilir ki sayı zıplamasın.

## Üreticiler (GENERATORS)

12 kademe, taş devrinden uzay çağına. Her biri:
`cost = baseCost × costGrowth^owned`, `costGrowth = 1.15` (tür standardı).
`era` = açılması için ulaşılması gereken çağ indeksi (çağ kilidi, aşağıya bak).

| # | id | İsim | baseCost | baseRate (/sn) | era (çağ) |
|---|---|---|---|---|---|
| 1 | worker | İşçi | 15 | 0.2 | 0 · Taş Devri |
| 2 | farmer | Çiftçi | 100 | 1 | 2 · Tarım Devrimi |
| 3 | craftsman | Zanaatkâr | 1.1K | 8 | 3 · Antik Çağ |
| 4 | merchant | Tüccar | 12K | 47 | 4 · Orta Çağ |
| 5 | scientist | Bilim İnsanı | 130K | 260 | 5 · Rönesans |
| 6 | engineer | Mühendis | 1.4M | 1.4K | 6 · Sanayi Devrimi |
| 7 | factory | Fabrika | 20M | 7.8K | 6 · Sanayi Devrimi |
| 8 | ai | Yapay Zekâ | 330M | 44K | 7 · Bilgi Çağı |
| 9 | robot | Robot Ordusu | 5B | 260K | 7 · Bilgi Çağı |
| 10 | rocket | Uzay Filosu | 75B | 1.6M | 8 · Uzay Çağı |
| 11 | colony | Gezegen Kolonisi | 1T | 9M | 8 · Uzay Çağı |
| 12 | dyson | Dyson Küresi | 15T | 55M | 9 · Galaktik Çağ |

> Denge notu: maliyet/üretim oranları klasik clicker eğrisini izler (her kademe
> bir öncekinin ~10-15 katı). Yeni kademe eklerken bu oranı koru.

## Çağ kilidi (v1.14)

Üreticiler ve yükseltmeler artık sadece "param yetiyor mu" ile değil, **çağa
göre** açılır (`isUnlocked(item) = state.era >= item.era`). Çağa girilmeden
ilgili kart **soluk + 🔒** görünür ("… Çağı'nda açılır") ve satın alınamaz.
Amaç tematik tutarlılık: Sanayi Devrimi'nde Yapay Zekâ/Dyson satın alınamaz.

**Kritik tasarım kararı — eşik hizalaması:** Üretici maliyetleri (15 → 15T,
~13×/adım) ile çağ eşikleri farklı ölçekteydi; 12 üretici ~1e13'te (Sanayi
Devrimi) biterken çağlar 1e21'e kadar gidiyordu. Bu yüzden çağ eşikleri (`ERAS
threshold`) **üretici merdivenine indirildi** — her çağ, kendi üreticisini tam
karşılayabildiğin an açacak şekilde. Sonuç: üretici açılışı ≈ karşılanabilirlik
ile çakışır (ilerleme yavaşlamaz) ama önündeki çağın üreticisini erkenden
**alamazsın** (puan biriktirip atlama engellenir). Üretici/yükseltme
**maliyetleri değişmedi** → eski kayıtlar güvenli; yalnızca çağ etiketi ekonomiyle
tutarlı hale gelir (örn. eskiden "Sanayi Devrimi"nde Dyson olan kayıt artık doğru
şekilde "Galaktik Çağ" görünür ve tüm çağ çarpanını alır = tek seferlik güç artışı).

> Eşik değiştirirken **GENERATORS.era / UPGRADES.era eşleşmesini koru**: bir
> üreticinin `era`'sı, eşiği o üreticinin baseCost'undan belirgin düşük bir
> çağa denk gelmemeli (yoksa ya çok erken açılır ya hiç karşılanamaz).

## Toplu alım

`buyAmount ∈ {1, 10, 100, "max"}`. Maliyet **geometrik seri** ile hesaplanır
(`bulkCost`), MAKS için `maxAffordable` logaritma ile en fazla alınabilir adedi bulur.

## Yükseltmeler (UPGRADES)

Tek seferlik, kalıcı çarpanlar. Üç tür:

- `click` → dokunuş gücünü çarpar (×2..×4).
- `all` → tüm pasif üretimi çarpar (×2..×4).
- `gen` → belirli bir üreticinin üretimini çarpar (`targetId`).

## Prestij

- Eşik: `GENES_THRESHOLD = 1e6` (bir tur içinde kazanılması gereken).
- Kazanç: `genes = floor(sqrt(runEarned / 1e6))` → kare kök eğrisi (klasik prestij).
- Bonus: her Gen `GENE_BONUS = 0.1` → **+%10** tüm üretim (çarpımsal değil toplamsal:
  `1 + genes*0.1`).
- Prestijde sıfırlanan: population, runEarned, owned, upgrades.
- Korunan: genes, totalEarned, prestiges, unlocked (başarımlar), clicks, soundOn.

## Başarımlar (ACHIEVEMENTS)

20 adet. Her açılan başarım `ACH_BONUS = 0.01` → **+%1** tüm üretim.
`check(state) → bool` ile koşul tanımlanır; tıklama, puan, üretici sayısı,
prestij vb. eşiklerine bağlı.

## Küresel çarpan

```
globalMultiplier = geneMultiplier() × achievementMultiplier()
                 = (1 + genes*0.1) × (1 + unlockedCount*0.01)
```
Hem dokunuşa hem pasif üretime uygulanır.

## Sayı biçimlendirme

`fmt(n)`: 1000 altı tam sayı; üstü K/M/B/T/Qa/Qi/... son ekleriyle (SUFFIXES dizisi,
12 kademe). Yeni çok büyük değerler gerekirse SUFFIXES'i genişlet.

## Savaş + ekipman (combat.js)

`window.Combat` (www/combat.js) ayrı modül. game.js init'te bağımlılıkları (DI)
geçer, sonra her tick'te `Combat.dealDamage(totalPerSecond()*dt)` çağrılır.

| Sabit | Değer | Anlam |
|---|---|---|
| `ENEMY_BASE_HP` | 8 | aşama 1 düşman canı |
| `ENEMY_HP_GROWTH` | 1.45 | her aşamada × |
| `BOSS_EVERY` | 10 | her 10. aşamada boss |
| `BOSS_HP_MULT` | 6 | boss'un can çarpanı |
| `BOSS_TIME` | 30000 ms | boss süre limiti |
| `BOSS_TIMEOUT_HEAL` | 0.65 | süre dolarsa %65 iyileşir (eskiden tam) |
| `BOSS_REWARD_MULT` | 10 | boss puan ödülü ×10 (eskiden ×5) |
| `BOSS_BONUS` | 0.05 | yenilen her boss kalıcı +%5 üretim |

### Ekipman + kritik

3 slot (silah/zırh/yüzük), 4 nadirlik (Sıradan/Nadir/Destansı/Efsanevi).
Parça gücü `(4 + stage·0.6) × rarityMult` formülüyle aşamayla ölçeklenir.

**Kritik şansı (yeni)**: `floor(sqrt(ringPct × 5))`, %60 tavanlı. Azalan getiri
sayesinde tek efsanevi yüzük artık tavanı anında doldurmaz.
- ring %16 → %8.9 · ring %40 → %14.1 · ring %180 → %30 · ring %720 → %60

**Reroll**: ekipman kartına dokunmak, slotu rastgele yeni nadirlik+güçle
değiştirir. Bedel: `max(1000, totalPerSecond × 60)` — yaklaşık 1 dakikalık
üretim. Onay özel modal'la alınır.

## Denge değiştirirken dikkat

- Sabitler `game.js` ve `combat.js` başındaki tanım bloklarında toplu duruyor.
- Bir üreticinin `baseRate`'ini değiştirmek tüm geç-oyun ekonomisini kaydırır.
- `costGrowth`'u türler arası tutarlı tut (1.15) — aksi halde bazı üreticiler
  "ölü seçenek" olur.
- Boss zaman aşımı oranı (`BOSS_TIMEOUT_HEAL`) çok düşürülürse boss duvarı
  anlamsızlaşır; çok yükseltilirse oyuncu yine "ilerleyemiyorum" hisseder.
- Kritik formülünde 5 katsayısı (`sqrt(ringPct·5)`) — efsanevinin tavanı tek
  başına dolurmaması için seçildi. Değiştirirken yüzüğün anlamlı kalmasına
  dikkat et.
