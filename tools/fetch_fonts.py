# -*- coding: utf-8 -*-
"""Tải font Be Vietnam Pro về assets/fonts/ và sinh assets/css/fonts.css.

Mục đích: bỏ hẳn phụ thuộc vào Google Fonts. Trang tự chứa font nên tải nhanh
hơn (không phải bắt tay thêm một domain nữa), chạy được cả khi không có mạng,
và không gửi request nào sang máy chủ bên thứ ba khi khách vào xem.

    python tools/fetch_fonts.py

Be Vietnam Pro dùng giấy phép SIL Open Font License nên được phép tự host.
Chỉ lấy hai bộ ký tự vietnamese + latin; chữ Hán ở bản tiếng Trung dùng font
hệ thống (khai báo sẵn trong font stack), không cần tải thêm.
"""
import io
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, 'assets', 'fonts')
CSS_OUT = os.path.join(ROOT, 'assets', 'css', 'fonts.css')

FAMILY = 'Be Vietnam Pro'
WEIGHTS = [400, 500, 600, 700, 800]
SUBSETS = ('vietnamese', 'latin')          # bỏ latin-ext: trang không dùng tới
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

API = ('https://fonts.googleapis.com/css2?family='
       + FAMILY.replace(' ', '+') + ':wght@' + ';'.join(str(w) for w in WEIGHTS)
       + '&display=swap')


def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binary else data.decode('utf-8')


def main():
    if not os.path.isdir(FONT_DIR):
        os.makedirs(FONT_DIR)

    css = get(API)

    # Google trả về từng khối: /* subset */ @font-face { ... }
    blocks = re.findall(r'/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{.*?\})', css, re.S)
    if not blocks:
        sys.exit('Khong doc duoc CSS tu Google Fonts')

    out, total = [], 0
    out.append('/* Be Vietnam Pro — tự host, sinh bởi tools/fetch_fonts.py.')
    out.append('   SIL Open Font License. Đừng sửa tay file này, sửa script rồi chạy lại. */')

    for subset, block in blocks:
        if subset not in SUBSETS:
            continue

        weight = re.search(r'font-weight:\s*(\d+)', block).group(1)
        url = re.search(r'url\((https://[^)]+\.woff2)\)', block).group(1)
        rng = re.search(r'unicode-range:\s*([^;]+);', block).group(1).strip()

        name = 'be-vietnam-pro-%s-%s.woff2' % (weight, subset)
        path = os.path.join(FONT_DIR, name)
        if not os.path.exists(path):
            data = get(url, binary=True)
            io.open(path, 'wb').write(data)
        total += os.path.getsize(path)

        out.append('')
        out.append('@font-face{')
        out.append("  font-family:'%s';" % FAMILY)
        out.append('  font-style:normal;')
        out.append('  font-weight:%s;' % weight)
        out.append('  font-display:swap;')
        out.append("  src:url('../fonts/%s') format('woff2');" % name)
        out.append('  unicode-range:%s;' % rng)
        out.append('}')
        print('  %-38s %5.1f KB' % (name, os.path.getsize(path) / 1024))

    io.open(CSS_OUT, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print('\n  tong: %.1f KB -> assets/css/fonts.css' % (total / 1024))


if __name__ == '__main__':
    main()
