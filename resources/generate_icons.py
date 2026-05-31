#!/usr/bin/env python3
"""Idle Human — simge ve açılış ekranı üretici.

Tek bir betikten oyunun tüm görsel varlıklarını üretir:

  resources/icon.png        1024x1024  (@capacitor/assets kaynağı)
  resources/splash.png      2732x2732  (@capacitor/assets kaynağı)
  www/icons/icon-192.png    192x192    (PWA / web)
  www/icons/icon-512.png    512x512    (PWA / web)
  www/icons/icon-180.png    180x180    (apple-touch-icon)
  www/icons/favicon-32.png  32x32      (favicon)

Tasarım: koyu mor degrade zemin üzerinde, oyunun 🧬 temasını yansıtan
geometrik bir DNA çift sarmalı. Hiçbir emoji/yazı tipine bağımlı değil
(açılış ekranındaki yazı hariç, o da DejaVu varsa eklenir).

Çalıştırmak için: pip install pillow && python3 resources/generate_icons.py
"""

import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Tema renkleri
BG_TOP = (42, 26, 85)      # #2a1a55
BG_BOTTOM = (20, 12, 38)   # #140c26
GLOW = (108, 61, 244)      # #6c3df4 mor parıltı
STRAND_A = (94, 234, 212)  # turkuaz sarmal
STRAND_B = (244, 114, 182) # pembe sarmal
RUNG = (220, 220, 245)     # bağ çubukları


def vertical_gradient(size, top, bottom):
    """Dikey degrade bir RGBA görsel döndürür."""
    w, h = size
    base = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        base.putpixel((0, y), tuple(
            round(top[i] + (bottom[i] - top[i]) * t) for i in range(3)
        ))
    return base.resize((w, h)).convert("RGBA")


def radial_glow(size, color, center, radius, strength=140):
    """Merkezde yoğun, dışa doğru sönen yumuşak bir parıltı katmanı."""
    w, h = size
    glow = Image.new("L", (w, h), 0)
    gd = ImageDraw.Draw(glow)
    cx, cy = center
    steps = 60
    for i in range(steps, 0, -1):
        r = radius * i / steps
        a = round(strength * (1 - i / steps))
        gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=a)
    glow = glow.filter(ImageFilter.GaussianBlur(radius * 0.12))
    layer = Image.new("RGBA", (w, h), color + (0,))
    layer.putalpha(glow)
    return layer


def draw_helix(img, cx, cy, height, width, turns=2.0, dot=0.0, line=0.0):
    """Dikey bir DNA çift sarmalı çizer (yumuşatma için 4x supersample)."""
    s = 4
    w, h = img.size
    canvas = Image.new("RGBA", (w * s, h * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(canvas)
    cx, cy, height, width = cx * s, cy * s, height * s, width * s
    dot = (dot or max(6, width * 0.12)) * s
    line = (line or max(4, width * 0.05)) * s

    steps = 240
    pts_a, pts_b = [], []
    for i in range(steps + 1):
        t = i / steps
        y = cy - height / 2 + height * t
        phase = t * turns * 2 * math.pi
        xa = cx + math.sin(phase) * width / 2
        xb = cx + math.sin(phase + math.pi) * width / 2
        pts_a.append((xa, y))
        pts_b.append((xb, y))

    # Bağ çubukları (rungs)
    for i in range(0, steps + 1, 12):
        a, b = pts_a[i], pts_b[i]
        depth = (math.sin(i / steps * turns * 2 * math.pi) + 1) / 2  # 0..1
        alpha = round(90 + 120 * depth)
        d.line([a, b], fill=RUNG + (alpha,), width=int(line))

    # Sarmal şeritler
    d.line(pts_a, fill=STRAND_A + (255,), width=int(line * 1.6), joint="curve")
    d.line(pts_b, fill=STRAND_B + (255,), width=int(line * 1.6), joint="curve")

    # Nükleotit düğümleri
    for i in range(0, steps + 1, 12):
        for (x, y), col in ((pts_a[i], STRAND_A), (pts_b[i], STRAND_B)):
            d.ellipse([x - dot, y - dot, x + dot, y + dot], fill=col + (255,))

    canvas = canvas.resize((w, h), Image.LANCZOS)
    img.alpha_composite(canvas)


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0], size[1]], radius, fill=255)
    return m


def make_icon(px, rounded=True):
    img = vertical_gradient((px, px), BG_TOP, BG_BOTTOM)
    img.alpha_composite(radial_glow((px, px), GLOW, (px * 0.5, px * 0.42), px * 0.55))
    draw_helix(img, px * 0.5, px * 0.5, px * 0.66, px * 0.34)
    if rounded:
        img.putalpha(rounded_mask((px, px), int(px * 0.22)))
    return img


def make_splash(px=2732):
    img = vertical_gradient((px, px), BG_TOP, BG_BOTTOM)
    img.alpha_composite(radial_glow((px, px), GLOW, (px * 0.5, px * 0.43), px * 0.45))
    draw_helix(img, px * 0.5, px * 0.43, px * 0.34, px * 0.17)
    # Başlık (yazı tipi varsa)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(px * 0.06)
        )
        d = ImageDraw.Draw(img)
        text = "IDLE HUMAN"
        bbox = d.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        d.text(((px - tw) / 2, px * 0.63), text, font=font, fill=(236, 233, 252, 255))
    except OSError:
        pass
    return img.convert("RGB")


def main():
    os.makedirs(os.path.join(ROOT, "resources"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "www", "icons"), exist_ok=True)

    # @capacitor/assets kaynakları (tam kare, köşesiz — araç kendisi maskeler)
    make_icon(1024, rounded=False).save(os.path.join(ROOT, "resources", "icon.png"))
    make_splash(2732).save(os.path.join(ROOT, "resources", "splash.png"))

    # Web / PWA simgeleri (yuvarlatılmış)
    icons = {
        "icon-512.png": 512,
        "icon-192.png": 192,
        "icon-180.png": 180,
        "favicon-32.png": 32,
    }
    for name, size in icons.items():
        make_icon(size, rounded=True).save(os.path.join(ROOT, "www", "icons", name))

    print("Üretildi:")
    print("  resources/icon.png (1024), resources/splash.png (2732)")
    print("  www/icons/: " + ", ".join(icons))


if __name__ == "__main__":
    main()
