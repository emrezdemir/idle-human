/* =========================================================
   Idle Human — çağ figürleri (eras-art.js)
   Her çağ için tek ve tutarlı stilde özel SVG silüet-rozet.
   Emoji yerine bunlar kullanılır; window.ERA_ART[id] -> SVG metni.
   viewBox 0 0 100 100; ortak yapı: renkli rozet diski + insan silüeti
   (kafa + gövde) + çağa özel aksesuar. game.js bunları avatar,
   gösterge, liste ve kutlama penceresinde kullanır.
   ========================================================= */

"use strict";

(() => {
  const SKIN = "#e8b98f";

  // Ortak parçalar
  const badge = (c) => `<circle cx="50" cy="50" r="48" fill="${c}" opacity="0.16"/>`;
  const head = (skin = SKIN) => `<circle cx="50" cy="38" r="12" fill="${skin}"/>`;
  const torso = (c) => `<path d="M32 82 Q32 57 50 57 Q68 57 68 82 Z" fill="${c}"/>`;

  // Bir figürü sar: rozet rengi + parça dizisi
  const fig = (bg, parts) =>
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="era-fig" aria-hidden="true">` +
    badge(bg) + parts + `</svg>`;

  const ART = {
    // Taş Devri — kürk, dağınık saç, sopa
    stone: fig("#8a5a2b",
      torso("#6b4226") +
      head() +
      `<path d="M38 33 Q44 22 50 30 Q56 22 62 33 Z" fill="#3b2a1a"/>` + // dağınık saç
      `<rect x="70" y="44" width="6" height="34" rx="3" fill="#7a5230"/>` + // sopa
      `<circle cx="73" cy="44" r="7" fill="#6b4628"/>`),

    // Avcılık — yay ve ok
    hunter: fig("#6e7b3a",
      torso("#5a4a2a") +
      head() +
      `<path d="M40 30 Q50 24 60 30" fill="none" stroke="#3b2a1a" stroke-width="4"/>` + // saç bandı
      `<path d="M24 24 Q14 50 24 76" fill="none" stroke="#7a5230" stroke-width="4"/>` + // yay
      `<line x1="24" y1="24" x2="24" y2="76" stroke="#cbb892" stroke-width="2"/>` + // yay ipi
      `<line x1="24" y1="50" x2="48" y2="50" stroke="#d8c9a0" stroke-width="3"/>`), // ok

    // Tarım Devrimi — hasır şapka, buğday
    agri: fig("#3f9d4f",
      torso("#6b8e3a") +
      head() +
      `<path d="M34 30 H66 L60 24 H40 Z" fill="#caa24a"/>` + // hasır şapka tepe
      `<ellipse cx="50" cy="31" rx="20" ry="4" fill="#b88f3c"/>` + // şapka kenarı
      `<g stroke="#e6c85a" stroke-width="2"><line x1="74" y1="48" x2="74" y2="78"/>` +
      `<line x1="74" y1="54" x2="68" y2="50"/><line x1="74" y1="54" x2="80" y2="50"/>` +
      `<line x1="74" y1="62" x2="68" y2="58"/><line x1="74" y1="62" x2="80" y2="58"/></g>`), // buğday

    // Antik Çağ — toga, defne tacı
    antiquity: fig("#c9a23b",
      torso("#e8e2d0") +
      `<path d="M50 57 L42 82 H58 Z" fill="#d8d0b8"/>` + // toga kıvrımı
      head("#ecc196") +
      `<path d="M36 32 Q34 22 44 26" fill="none" stroke="#5a8a3a" stroke-width="3"/>` + // defne sol
      `<path d="M64 32 Q66 22 56 26" fill="none" stroke="#5a8a3a" stroke-width="3"/>`), // defne sağ

    // Orta Çağ — miğfer, kılıç
    medieval: fig("#8a8f9e",
      torso("#6b7280") +
      head("#ecc196") +
      `<path d="M37 38 Q37 24 50 24 Q63 24 63 38 Z" fill="#aeb4c2"/>` + // miğfer
      `<rect x="48" y="38" width="4" height="8" fill="#2a2f3a"/>` + // vizör yarığı
      `<rect x="72" y="40" width="5" height="40" fill="#cdd3df"/>` + // kılıç
      `<rect x="67" y="52" width="15" height="4" fill="#7a5230"/>`), // kabza

    // Rönesans — bere, paleti
    renaissance: fig("#b0506a",
      torso("#7a3050") +
      head() +
      `<ellipse cx="50" cy="27" rx="16" ry="7" fill="#3a2030" transform="rotate(-12 50 27)"/>` + // bere
      `<circle cx="24" cy="60" r="9" fill="#e8d8c0"/>` + // palet
      `<circle cx="21" cy="57" r="1.6" fill="#ef476f"/><circle cx="27" cy="56" r="1.6" fill="#06d6a0"/>` +
      `<circle cx="24" cy="63" r="1.6" fill="#ffd166"/>`),

    // Sanayi Devrimi — silindir şapka, dişli
    industrial: fig("#9a7b3a",
      torso("#3a3a42") +
      head() +
      `<rect x="40" y="14" width="20" height="14" fill="#26262e"/>` + // şapka tepe
      `<rect x="34" y="27" width="32" height="4" fill="#26262e"/>` + // şapka kenarı
      `<g fill="#caa24a"><circle cx="74" cy="62" r="9"/></g>` +
      `<circle cx="74" cy="62" r="4" fill="#9a7b3a"/>` +
      `<g stroke="#caa24a" stroke-width="3"><line x1="74" y1="50" x2="74" y2="74"/><line x1="62" y1="62" x2="86" y2="62"/></g>`), // dişli

    // Bilgi Çağı — kulaklık, ekran parıltısı
    info: fig("#2bb6c9",
      torso("#2a6b7a") +
      head() +
      `<path d="M37 38 Q37 26 50 26 Q63 26 63 38" fill="none" stroke="#1b2a33" stroke-width="3"/>` + // kulaklık bandı
      `<rect x="34" y="36" width="5" height="9" rx="2" fill="#1b2a33"/>` +
      `<rect x="61" y="36" width="5" height="9" rx="2" fill="#1b2a33"/>` +
      `<rect x="68" y="50" width="16" height="11" rx="2" fill="#0f3b45"/>` + // ekran
      `<rect x="70" y="52" width="12" height="3" fill="#36d1dc"/>`),

    // Uzay Çağı — kask kubbesi, anten
    space: fig("#5566cc",
      torso("#dfe6f5") +
      `<line x1="50" y1="24" x2="50" y2="14" stroke="#aab4d8" stroke-width="2"/><circle cx="50" cy="13" r="3" fill="#ffd166"/>` + // anten
      head("#ecc196") +
      `<circle cx="50" cy="37" r="17" fill="#bcd0ff" opacity="0.35" stroke="#bcd0ff" stroke-width="2"/>` + // kask kubbesi
      `<path d="M40 33 Q46 30 52 33" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.7"/>`), // yansıma

    // Galaktik Çağ — siborg, halka
    galactic: fig("#9b59ff",
      `<ellipse cx="50" cy="38" rx="26" ry="9" fill="none" stroke="#c9a8ff" stroke-width="2" opacity="0.7"/>` + // halka
      torso("#2a1840") +
      `<rect x="38" y="27" width="24" height="22" rx="6" fill="#cfc2e8"/>` + // siborg kafa
      `<rect x="43" y="35" width="14" height="5" rx="2" fill="#9b59ff"/>` + // göz bandı
      `<circle cx="50" cy="37.5" r="2" fill="#36d1dc"/>`),
  };

  window.ERA_ART = ART;
})();
