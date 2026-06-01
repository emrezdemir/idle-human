/* =========================================================
   Idle Human — hesap & bulut kayıt katmanı (cloud.js)

   Bu modül oyunun "giriş yap + ilerlemeyi taşı/yedekle" ihtiyacını
   tek bir arayüz arkasında toplar. Üç sağlayıcı (provider) tasarlandı:

     1) "local"  — varsayılan. Kayıt yalnızca cihazda (localStorage).
     2) "code"   — taşınabilir yedek kodu: tüm kaydı Base64 bir metne
                   çevirir; kullanıcı bunu kopyalayıp başka cihaza yapıştırır.
                   Hiçbir sunucu gerektirmez, hemen çalışır.
     3) "play"   — Google Play Games Services (Saved Games + oturum).
                   Yalnızca native Android derlemesinde ve Play Console
                   yapılandırması tamamlandığında etkinleşir. Eklenti yoksa
                   otomatik olarak devre dışı kalır (oyun yine de çalışır).

   Oyun kodu yalnızca Cloud.* fonksiyonlarını çağırır; hangi sağlayıcının
   kullanıldığını bilmek zorunda değildir. Böylece ileride gerçek bir
   bulut backend'i (Firebase vb.) eklemek için sadece bu dosya değişir.
   ========================================================= */

"use strict";

const Cloud = (() => {
  // Play Games eklentisi: capacitor-plugin-play-games-services gibi bir
  // eklenti enjekte edilirse window üzerinde belirir. Yoksa null kalır.
  function playPlugin() {
    const cap = window.Capacitor;
    if (cap && cap.Plugins && cap.Plugins.PlayGamesServices) {
      return cap.Plugins.PlayGamesServices;
    }
    return null;
  }

  function isPlayAvailable() {
    return !!playPlugin();
  }

  let signedInName = null;

  /* --- Play Games oturumu --- */

  async function signIn() {
    const plugin = playPlugin();
    if (!plugin) {
      return { ok: false, reason: "unavailable" };
    }
    try {
      await plugin.signIn();
      let name = "Oyuncu";
      try {
        const info = await plugin.getCurrentPlayer?.();
        name = (info && (info.displayName || info.name)) || name;
      } catch (e) {
        /* isim alınamadıysa varsayılan kalır */
      }
      signedInName = name;
      return { ok: true, name };
    } catch (e) {
      return { ok: false, reason: "cancelled", error: String(e) };
    }
  }

  async function signOut() {
    const plugin = playPlugin();
    signedInName = null;
    if (plugin && plugin.signOut) {
      try {
        await plugin.signOut();
      } catch (e) {
        /* yoksay */
      }
    }
  }

  function currentUser() {
    return signedInName;
  }

  /* --- Play Games "Saved Games" ile bulut kayıt --- */

  async function uploadToPlay(saveString) {
    const plugin = playPlugin();
    if (!plugin || !plugin.saveGame) return { ok: false, reason: "unavailable" };
    try {
      await plugin.saveGame({
        title: "idle-human",
        description: "Idle Human ilerleme kaydı",
        data: saveString,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  async function downloadFromPlay() {
    const plugin = playPlugin();
    if (!plugin || !plugin.loadGame) return { ok: false, reason: "unavailable" };
    try {
      const res = await plugin.loadGame({ title: "idle-human" });
      return { ok: true, data: (res && res.data) || null };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  /* --- Taşınabilir yedek kodu (sunucusuz, her yerde çalışır) --- */

  // Unicode güvenli Base64 kodlama/çözme.
  function encodeCode(saveString) {
    const bytes = new TextEncoder().encode(saveString);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return "IH1:" + btoa(bin); // "IH1:" sürüm öneki
  }

  function decodeCode(code) {
    const trimmed = (code || "").trim();
    const payload = trimmed.startsWith("IH1:") ? trimmed.slice(4) : trimmed;
    const bin = atob(payload);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  return {
    isPlayAvailable,
    signIn,
    signOut,
    currentUser,
    uploadToPlay,
    downloadFromPlay,
    encodeCode,
    decodeCode,
  };
})();

// Klasik <script> içinde top-level `const` window'a bağlanmaz; açıkça bağla.
window.Cloud = Cloud;
