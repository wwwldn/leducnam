# -*- coding: utf-8 -*-
"""Tạo assets/img/og-cover.jpg (1200x630) từ portrait.jpg"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = r"d:/NAMLE/GIT/source/leducnam.com"
W, H = 1200, 630
NAVY = (11, 27, 51)
NAVY_D = (7, 19, 42)
AI = (47, 107, 255)

# --- nền gradient chéo navy ---
grad = Image.new("RGB", (W, H), NAVY)
d = ImageDraw.Draw(grad)
for y in range(H):
    t = y / H
    d.line([(0, y), (W, y)],
           fill=(int(NAVY[0]*(1-t)+NAVY_D[0]*t),
                 int(NAVY[1]*(1-t)+NAVY_D[1]*t),
                 int(NAVY[2]*(1-t)+NAVY_D[2]*t)))

# --- halo xanh AI ---
halo = Image.new("RGB", (W, H), (0, 0, 0))
hd = ImageDraw.Draw(halo)
hd.ellipse([620, -140, 1320, 560], fill=(30, 70, 160))
halo = halo.filter(ImageFilter.GaussianBlur(120))
grad = Image.blend(grad, Image.blend(grad, halo, 0.55), 1.0)

# --- lưới mờ ---
g = ImageDraw.Draw(grad)
for x in range(0, W, 56):
    g.line([(x, 0), (x, H)], fill=(22, 42, 76), width=1)
for y in range(0, H, 56):
    g.line([(0, y), (W, y)], fill=(22, 42, 76), width=1)

# --- ảnh chân dung, bo tròn ---
p = Image.open(os.path.join(BASE, "assets/img/portrait.jpg")).convert("RGB")
S = 340
side = min(p.size)
p = p.crop(((p.width-side)//2, 0, (p.width-side)//2+side, side)).resize((S, S), Image.LANCZOS)

mask = Image.new("L", (S*4, S*4), 0)
ImageDraw.Draw(mask).ellipse([0, 0, S*4, S*4], fill=255)
mask = mask.resize((S, S), Image.LANCZOS)

PX, PY = 790, (H - S)//2
ring = ImageDraw.Draw(grad)
ring.ellipse([PX-8, PY-8, PX+S+8, PY+S+8], outline=AI, width=4)
grad.paste(p, (PX, PY), mask)

# --- chữ ---
def font(size, bold=True):
    for name in (("segoeuib.ttf" if bold else "segoeui.ttf"), "arialbd.ttf" if bold else "arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()

t = ImageDraw.Draw(grad)
X = 80

t.rectangle([X, 168, X+30, 172], fill=AI)
t.text((X+44, 154), "IT MANAGER", font=font(22), fill=(120, 165, 255))
t.text((X, 200), "Lê Đức Nam", font=font(78), fill=(255, 255, 255))
t.text((X, 306), "AI đồng hành trong vận hành", font=font(34), fill=(200, 216, 245))
t.text((X, 352), "& quản trị hệ thống", font=font(34), fill=(200, 216, 245))
t.text((X, 436), "leducnam.com", font=font(24, False), fill=(120, 165, 255))

grad.save(os.path.join(BASE, "assets/img/og-cover.jpg"), "JPEG", quality=88, optimize=True)
print("saved og-cover.jpg", grad.size)
