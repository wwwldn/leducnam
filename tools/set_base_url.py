# -*- coding: utf-8 -*-
"""Đổi địa chỉ gốc của trang trong các thẻ URL tuyệt đối.

Một số thẻ bắt buộc phải ghi URL đầy đủ, không dùng đường dẫn tương đối được:
canonical, og:url, og:image, hreflang, JSON-LD, sitemap. Nếu chúng trỏ tới một
tên miền chưa hoạt động thì Google không index được, và link chia sẻ lên
Zalo/Facebook mất ảnh thumbnail.

    python tools/set_base_url.py                                  # xem đang dùng gì
    python tools/set_base_url.py https://leducnam.com/            # đổi sang domain thật
    python tools/set_base_url.py https://wwwldn.github.io/leducnam/

Chỉ đụng tới URL. Tên hiển thị "leducnam.com" ở footer và og:site_name giữ
nguyên vì đó là tên thương hiệu, không phải địa chỉ.
"""
import io
import os
import re
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['index.html', 'sitemap.xml', 'robots.txt']


def current_base():
    html = io.open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    return m.group(1) if m else None


def main():
    old = current_base()
    if not old:
        sys.exit('Khong tim thay the canonical trong index.html')

    if len(sys.argv) < 2:
        print('Dang dung: %s' % old)
        print('Doi bang: python tools/set_base_url.py <url-moi>')
        return

    new = sys.argv[1]
    if not new.endswith('/'):
        new += '/'
    if new == old:
        print('Da la %s roi, khong can doi.' % new)
        return

    total = 0
    for name in FILES:
        path = os.path.join(ROOT, name)
        if not os.path.exists(path):
            continue
        text = io.open(path, encoding='utf-8').read()
        text, n = re.subn(re.escape(old), new, text)
        if name == 'sitemap.xml':
            text = re.sub(r'<lastmod>[^<]*</lastmod>',
                          '<lastmod>%s</lastmod>' % date.today().isoformat(), text)
        if n:
            io.open(path, 'w', encoding='utf-8').write(text)
        print('  %-12s %d cho' % (name, n))
        total += n

    print('\n  %s\n  -> %s\n  tong %d cho' % (old, new, total))
    if total:
        print('\n  Nho commit va push de GitHub Pages nhan ban moi.')


if __name__ == '__main__':
    main()
