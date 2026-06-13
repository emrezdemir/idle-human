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

| # | id | İsim | baseCost | baseRate (/sn) |
|---|---|---|---|---|
| 1 | worker | İşçi | 15 | 0.2 |
| 2 | farmer | Çiftçi | 100 | 1 |
| 3 | craftsman | Zanaatkâr | 1.1K | 8 |
| 4 | merchant | Tüccar | 12K | 47 |
| 5 | scientist | Bilim İnsanı | 130K | 260 |
| 6 | engineer | Mühendis | 1.4M | 1.4K |
| 7 | factory | Fabrika | 20M | 7.8K |
| 8 | ai | Yapay Zekâ | 330M | 44K |
| 9 | robot | Robot Ordusu | 5B | 260K |
| 10 | rocket | Uzay Filosu | 75B | 1.6M |
| 11 | colony | Gezegen Kolonisi | 1T | 9M |
| 12 | dyson | Dyson Küresi | 15T | 55M |

> Denge notu: maliyet/üretim oranları klasik clicker eğrisini izler (her kademe
> bir öncekinin ~10-15 katı). Yeni kademe eklerken bu oranı koru.

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
