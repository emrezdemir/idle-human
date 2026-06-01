#!/usr/bin/env bash
#
# Idle Human — release imzalama anahtarı (keystore) üretici.
#
# Bu betik SENİN bilgisayarında çalışır ve imzalama anahtarını ÜRETİR.
# Anahtarı kimseyle paylaşma, repoya commit'leme. Güvenli bir yere yedekle
# (parola yöneticisi vb.). Anahtarı kaybedersen uygulamayı güncelleyemezsin
# (Play App Signing açıksa upload anahtarını sıfırlayabilirsin).
#
# Kullanım:
#   bash resources/generate-keystore.sh
#
# Sonra ekrana yazılan 4 değeri GitHub deposunda secret olarak ekle:
#   Settings -> Secrets and variables -> Actions -> New repository secret
#
set -euo pipefail

KEYSTORE="idle-human-release.keystore"
ALIAS="idlehuman"

if [ -f "$KEYSTORE" ]; then
  echo "HATA: $KEYSTORE zaten var. Üzerine yazmamak için durduruldu." >&2
  exit 1
fi

# Parolayı sor (ekranda görünmez). İki parola da aynı kullanılır.
read -r -s -p "Keystore parolası belirle (en az 6 karakter): " STOREPASS
echo
read -r -s -p "Parolayı tekrar gir: " STOREPASS2
echo
if [ "$STOREPASS" != "$STOREPASS2" ]; then
  echo "HATA: parolalar eşleşmedi." >&2
  exit 1
fi

keytool -genkeypair -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$STOREPASS" -keypass "$STOREPASS" \
  -dname "CN=Idle Human, OU=Games, O=Idle Human, L=Istanbul, ST=Istanbul, C=TR"

echo
echo "=================================================================="
echo " Keystore üretildi: $KEYSTORE"
echo " Bunu GÜVENLE yedekle ve ASLA repoya koyma."
echo "=================================================================="
echo
echo "GitHub'a eklenecek secret'lar:"
echo
echo "  ANDROID_KEYSTORE_PASSWORD = (girdiğin parola)"
echo "  ANDROID_KEY_PASSWORD      = (aynı parola)"
echo "  ANDROID_KEY_ALIAS         = $ALIAS"
echo
echo "  ANDROID_KEYSTORE_BASE64   = aşağıdaki tek satır:"
echo "------------------------------------------------------------------"
base64 -w0 "$KEYSTORE" 2>/dev/null || base64 "$KEYSTORE" | tr -d '\n'
echo
echo "------------------------------------------------------------------"
