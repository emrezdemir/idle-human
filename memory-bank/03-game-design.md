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

## Denge değiştirirken dikkat

- Sabitler `game.js` başındaki tanım bloklarında toplu duruyor.
- Bir üreticinin `baseRate`'ini değiştirmek tüm geç-oyun ekonomisini kaydırır.
- `costGrowth`'u türler arası tutarlı tut (1.15) — aksi halde bazı üreticiler
  "ölü seçenek" olur.
