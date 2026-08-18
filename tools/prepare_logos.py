# -*- coding: utf-8 -*-
"""Chuẩn hoá logo thương hiệu về assets/img/logos/.

Ảnh logo tải trên mạng thường lệch chuẩn mỗi cái một kiểu: cái nền trắng,
cái là badge nền màu, cái dính thêm chữ thừa, kích thước thì loạn. Script này
đưa hết về một chuẩn: cao 120px, nền trong suốt nếu gỡ được, viền bo nếu là
badge, và cắt sát nội dung.

    python tools/prepare_logos.py                 # đọc tools/logo-src/
    python tools/prepare_logos.py D:/anh-logo     # hoặc chỉ định thư mục khác

File gốc nằm sẵn trong tools/logo-src/ nên repo tự chứa, clone sang máy khác
chạy lại được ngay.

Muốn thêm logo mới: bỏ file vào tools/logo-src/ rồi thêm một dòng vào LOGOS.
"""
import io
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(ROOT, 'assets', 'img', 'logos')
SRC_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools', 'logo-src')

# slug -> (file nguồn, gỡ nền?, là badge nền màu?, cắt trước theo tỉ lệ (l,t,r,b), ngưỡng gỡ nền)
# Ngưỡng cao hơn cho ảnh JPEG: nén JPEG để lại quầng sáng quanh nét, ngưỡng thấp
# sẽ chừa lại viền trắng lởm chởm.
LOGOS = {
    'gree':        ('gree.png', True, False, None, 26),
    'samsung':     ('samsung.avif', True, False, None, 26),
    'tpbank':      ('tpbank.webp', False, True, None, 0),
    'newlifepack': ('newlifepack.jpg', False, True, (0.0, 0.0, 1.0, 0.74), 0),  # bỏ dòng "XÃ CỦ CHI TP.HCM"
    'hoasen':      ('hoasen.png', False, True, None, 0),
    'kyanon':      ('kyanon.jpg', True, False, None, 62),   # JPEG, nén để lại quầng nên cần ngưỡng cao
}

TARGET_H = 120          # cao chuẩn, đủ nét cho màn Retina ở ~30–40px
PAD = 0.06              # đệm quanh logo đã gỡ nền


def drop_background(im, tol=26):
    """Gỡ nền bằng flood fill từ 4 góc — chỉ xoá nền BÊN NGOÀI, giữ nguyên
    khoảng trắng nằm trong lòng logo (ví dụ mảng âm bên trong vòng tròn Gree)."""
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()

    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    seed = px[0, 0][:3]

    visited = bytearray(w * h)
    stack = [c for c in corners]

    def near(c):
        return (abs(c[0] - seed[0]) <= tol and
                abs(c[1] - seed[1]) <= tol and
                abs(c[2] - seed[2]) <= tol)

    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        idx = y * w + x
        if visited[idx]:
            continue
        visited[idx] = 1
        c = px[x, y]
        if not near(c):
            continue
        px[x, y] = (c[0], c[1], c[2], 0)
        stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return im


def round_corners(im, ratio=0.16):
    """Bo góc cho badge nền màu để nó đọc ra như một ô icon gọn gàng."""
    im = im.convert('RGBA')
    r = int(min(im.size) * ratio)
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1],
                                           radius=r, fill=255)
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    return out


def main():
    if not os.path.isdir(SRC_DIR):
        sys.exit('Khong thay thu muc nguon: ' + SRC_DIR)
    if not os.path.isdir(DEST):
        os.makedirs(DEST)

    for slug, (fname, strip_bg, badge, crop, tol) in LOGOS.items():
        path = os.path.join(SRC_DIR, fname)
        if not os.path.exists(path):
            print('  bo qua %-12s (khong co file)' % slug)
            continue

        im = Image.open(path).convert('RGBA')

        if crop:
            w, h = im.size
            im = im.crop((int(w * crop[0]), int(h * crop[1]),
                          int(w * crop[2]), int(h * crop[3])))

        if strip_bg:
            im = drop_background(im, tol)
            bbox = im.split()[3].getbbox()
            if bbox:
                im = im.crop(bbox)
            pad = int(max(im.size) * PAD)
            canvas = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
            canvas.paste(im, (pad, pad), im)
            im = canvas
        elif badge:
            im = round_corners(im)

        w = max(1, round(im.width * TARGET_H / im.height))
        im = im.resize((w, TARGET_H), Image.LANCZOS)
        im.save(os.path.join(DEST, slug + '.png'), optimize=True)
        print('  %-12s -> %dx%d  %s' % (slug, im.width, im.height,
                                        'badge bo goc' if badge else 'da go nen'))


if __name__ == '__main__':
    main()
