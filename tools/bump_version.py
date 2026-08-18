# -*- coding: utf-8 -*-
"""Đổi số ?v= trên link CSS/JS trong index.html để trình duyệt tải bản mới.

Chạy sau MỖI lần sửa style.css / main.js / i18n.js:

    python tools/bump_version.py

Không có tham số thì lấy số hiện tại + 1. Muốn đặt số cụ thể:

    python tools/bump_version.py 12
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'index.html')

html = io.open(INDEX, encoding='utf-8').read()

found = [int(n) for n in re.findall(r'\.(?:css|js)\?v=(\d+)', html)]
if not found:
    sys.exit('Khong tim thay ?v= nao trong index.html')

new = int(sys.argv[1]) if len(sys.argv) > 1 else max(found) + 1

html, count = re.subn(r'(\.(?:css|js))\?v=\d+', r'\1?v=%d' % new, html)
io.open(INDEX, 'w', encoding='utf-8').write(html)

print('v=%s -> v=%d  (%d link)' % ('/'.join(str(x) for x in sorted(set(found))), new, count))
