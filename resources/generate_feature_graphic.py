#!/usr/bin/env python3
"""Google Play 'feature graphic' üretici (1024x500, zorunlu mağaza görseli).

Mevcut resources/icon.png ikonunu koyu mor degrade bir zemine yerleştirir,
sağına oyun adını ve sloganını yazar.

Çıktı: resources/play/feature-graphic.png  (1024x500)

Çalıştırmak için: pip install pillow && python3 resources/generate_feature_graphic.py
"""

import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1024, 500
BG_TOP = (45, 27, 94)     # #2d1b5e
BG_BOTTOM = (27, 16, 51)  # #1b1033
TEXT = (239, 234, 255)    # #efeaff
MUTED = (179, 167, 217)   # #b3a7d9

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "play")
ICON = os.path.join(HERE, "icon.png")


def hgrad(w, h, left, right):
    """Soldan sağa yatay degrade."""
    img = Image.new("RGB", (w, h), left)
    px = img.load()
    for x in range(w):
        t = x / max(1, w - 1)
        r = int(left[0] + (right[0] - left[0]) * t)
        g = int(left[1] + (right[1] - left[1]) * t)
        b = int(left[2] + (right[2] - left[2]) * t)
        for y in range(h):
            px[x, y] = (r, g, b)
    return img


def load_font(size, bold=True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    img = hgrad(W, H, BG_TOP, BG_BOTTOM)
    draw = ImageDraw.Draw(img)

    # Sol tarafa ikon
    if os.path.exists(ICON):
        icon = Image.open(ICON).convert("RGBA")
        size = 320
        icon = icon.resize((size, size), Image.LANCZOS)
        iy = (H - size) // 2
        img.paste(icon, (70, iy), icon)
        text_x = 70 + size + 50
    else:
        text_x = 90

    # Başlık + slogan
    title_font = load_font(76, bold=True)
    sub_font = load_font(30, bold=False)

    draw.text((text_x, 175), "Idle Human", font=title_font, fill=TEXT)
    draw.text((text_x, 270), "Bir hücreden medeniyete", font=sub_font, fill=MUTED)
    draw.text((text_x, 312), "uzanan idle/clicker oyunu", font=sub_font, fill=MUTED)

    out = os.path.join(OUT_DIR, "feature-graphic.png")
    img.save(out, "PNG")
    print("yazıldı:", out, img.size)


if __name__ == "__main__":
    main()
