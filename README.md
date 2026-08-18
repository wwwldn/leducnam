# leducnam.com

Website giới thiệu cá nhân — HTML/CSS/JS thuần, không build, không dependency.
Mở `index.html` bằng trình duyệt là chạy.

## Nội dung trang (theo thứ tự)

1. Hero — định vị *IT Manager / Lead System Architect* + 3 con số (14+ năm · 200K users · 500+ chi nhánh)
2. Dải thương hiệu — Gree · Hoa Sen Group · Samsung · TPBank · Kyanon Digital · NewLifePack
3. Về tôi
4. Cách tôi làm việc (3 bước)
5. **AI trong vận hành** (nền tối, sơ đồ động) — OpenClaw · FrontDesk AI · Cổng tra cứu mã lỗi
6. Dự án tiêu biểu — 9 card, ưu tiên hệ thống & vận hành
7. Kinh nghiệm — timeline 5 mốc + học vấn/chứng chỉ
8. Kỹ năng — 4 nhóm
9. Liên hệ

## Đa ngôn ngữ

Ba thứ tiếng: **Tiếng Việt (mặc định)** · English · 中文. Nút cờ ở góc phải header.

- Toàn bộ bản dịch nằm ở [assets/js/i18n.js](assets/js/i18n.js), một khối cho mỗi ngôn ngữ.
- Trong HTML, phần tử cần dịch mang thuộc tính:
  `data-i18n` (text) · `data-i18n-html` (có `<strong>`, `<br>`) ·
  `data-i18n-alt` · `data-i18n-aria-label`.
- Thứ tự ưu tiên khi chọn ngôn ngữ: `?lang=en` trên URL → lựa chọn đã lưu
  trong trình duyệt → tiếng Việt. **Không** tự đổi theo ngôn ngữ trình duyệt,
  để khách vào lần đầu luôn thấy bản tiếng Việt.
- Link chia sẻ theo ngôn ngữ: `leducnam.com/?lang=en`, `leducnam.com/?lang=zh`.

### Sửa nội dung

Sửa ở `i18n.js` chứ **không** sửa thẳng trong `index.html` — chữ trong HTML chỉ là
bản dự phòng khi JS chưa chạy, còn thứ hiển thị thật là giá trị trong `i18n.js`.
Nếu thêm mục mới vào trang, nhớ thêm khoá vào **cả ba** khối `vi`/`en`/`zh`.

### Thêm ngôn ngữ thứ tư

1. Thêm một khối `xx: { ... }` vào `i18n.js`.
2. Thêm `xx: { code: 'XX', htmlLang: 'xx' }` vào `LANGS` trong `main.js`.
3. Thêm một `<li>` vào `#langMenu` trong `index.html` và một class `.flag--xx` trong CSS.

## Cấu trúc

```
index.html              # toàn bộ nội dung (7 mục theo wireframe)
assets/css/style.css    # design tokens + layout + responsive + dark mode
assets/js/main.js       # theme toggle, đổi ngôn ngữ, menu mobile, reveal, scrollspy
assets/js/i18n.js       # bản dịch vi / en / zh
assets/img/favicon.svg  # favicon
assets/img/portrait.jpg # ảnh chân dung (513×560)
assets/img/og-cover.jpg # ảnh share Zalo/Facebook (1200×630)
robots.txt / sitemap.xml
```

## Việc còn lại (tuỳ chọn)

1. **LinkedIn** — hiện đang dùng GitHub. Muốn thêm LinkedIn thì copy 1 khối
   `.clink` trong mục `#contact` và đổi link.
2. **Ảnh chân dung độ phân giải cao hơn** — bản hiện tại 513×560 vừa đủ cho
   khung 400px, nhưng ảnh ~800×1000 sẽ nét hơn trên màn Retina.
   Thay file là xong, không cần sửa code.
3. **Tạo lại ảnh OG** sau khi đổi ảnh chân dung:
   chạy `python tools/make_og.py` (cần Pillow).

## Thông tin liên hệ đang dùng

| Kênh | Giá trị | Ghi chú |
|---|---|---|
| Zalo | `https://zalo.me/0973705507` | **số không hiển thị**, chỉ là link |
| Điện thoại | 0858 668 844 | hiển thị + `tel:` |
| Email | namleduc@hotmail.com | `mailto:` |
| GitHub | github.com/wwwldn | |

## Deploy

- **GitHub Pages / Cloudflare Pages / Netlify**: push repo → trỏ root, không cần build command.
- **Hosting thường**: upload nguyên thư mục vào `public_html`.
- Nhớ trỏ domain `leducnam.com` và bật HTTPS.

## Tuỳ biến nhanh

Toàn bộ màu nằm ở block `:root` đầu file `style.css`:

```css
--ai:      #2f6bff;   /* màu nhấn AI-blue */
--navy-800:#0b1b33;   /* nền các section tối */
```

Đổi `--ai` là đổi toàn bộ điểm nhấn AI trên trang.
