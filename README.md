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

## Đo lường

Mở [assets/js/analytics.js](assets/js/analytics.js), điền ID vào `CONFIG` đầu file.
**Để trống thì không tải gì, không phát sinh request nào** — trang vẫn sạch.

```js
cloudflareToken: '',   // Cloudflare → Web Analytics → Add a site
clarityId:       '',   // Microsoft Clarity → New project → Project ID
```

Hai công cụ trả lời hai loại câu hỏi khác nhau:

| | Cloudflare | Clarity |
|---|---|---|
| Lượt xem, nguồn vào, quốc gia | ✅ | ✅ |
| Thời gian dừng | ❌ | ✅ |
| Heatmap cuộn / click | ❌ | ✅ |
| Xem lại phiên truy cập | ❌ | ✅ |
| Cookie → cần banner | Không | **Có** |
| Nặng | ~1 KB | ~40 KB |

Cloudflare cố tình tối giản và **không có API sự kiện tuỳ biến**, nên các sự
kiện dưới đây chỉ chạy khi bật Clarity:

| Sự kiện | Trả lời câu hỏi |
|---|---|
| `lien-he-zalo` · `-dien-thoai` · `-email` · `-github` | Kênh nào thực sự được bấm |
| `doi-ngon-ngu-en` · `-zh` · `-vi` | Bản dịch có ai dùng không |
| `cuon-25` → `cuon-100` | Người xem đọc tới đâu rồi bỏ |
| `muc-xem-lau-nhat` | Dừng lâu nhất ở mục nào |
| `thoi-gian-o-lai-giay` | Ở lại bao lâu |

Đổi sang Umami / Plausible / GA4 sau này chỉ phải sửa hàm `track()` — một chỗ duy nhất.

> ⚠️ Bật Clarity thì nên thêm một dòng ở footer nói rõ trang có dùng công cụ
> phân tích. Clarity đặt cookie và ghi lại thao tác chuột/cuộn (mặc định che
> nội dung chữ). Nghị định 13/2023 về bảo vệ dữ liệu cá nhân.

## Repo tự chứa

Không phụ thuộc gì bên ngoài lúc chạy — không CDN, không Google Fonts
(trừ khi bạn tự bật đo lường). Clone về
là mở được ngay, kể cả offline. Mọi file gốc để dựng lại tài nguyên đều nằm
trong repo:

| Script | Sinh ra | Nguồn |
|---|---|---|
| `tools/prepare_logos.py` | `assets/img/logos/*.png` | `tools/logo-src/` |
| `tools/make_og.py` | `assets/img/og-cover.jpg` | `assets/img/portrait.jpg` |
| `tools/fetch_fonts.py` | `assets/fonts/` + `assets/css/fonts.css` | Google Fonts (chỉ khi chạy script) |
| `tools/bump_version.py` | đổi `?v=` trong `index.html` | — |

Font Be Vietnam Pro được tự host (166 KB, hai bộ ký tự vietnamese + latin,
giấy phép SIL OFL). Chữ Hán ở bản tiếng Trung dùng font hệ thống nên không phải
tải thêm megabyte nào.

## Logo thương hiệu

Dải logo dưới hero tự nhận file — **không cần sửa code**. Chỉ cần thả file vào:

```
assets/img/logos/gree.png          ✓
assets/img/logos/hoasen.png        ✓
assets/img/logos/samsung.png       ✓
assets/img/logos/tpbank.png        ✓
assets/img/logos/kyanon.png        ✓
assets/img/logos/newlifepack.png   ✓
```

Nhận `.svg` → `.png` → `.webp` (ưu tiên svg). Có file thì hiện logo, chưa có thì
giữ nguyên chữ — nên thiếu file không làm vỡ gì.

Hai chỗ hoạt động khác nhau:

- **Thẻ dự án** — logo thay icon vuông, đổi riêng từng thẻ. Thẻ nào có file thì
  đổi thẻ đó, thẻ khác giữ icon. Tên công ty vẫn hiện bằng chữ ở dòng dưới.
- **Dải thương hiệu** — chạy kiểu *đủ mới đổi*: chỉ chuyển sang logo khi **cả
  sáu** thương hiệu đều có file. Một logo đứng cạnh năm dòng chữ trông như lỗi,
  nên khi còn thiếu thì giữ nguyên toàn bộ chữ.

**Thẻ dự án dùng logo màu thật**, bỏ khung viền (khung lồng khung nhìn rối, và
logo dạng badge vốn đã có nền màu riêng). Nền tối thì logo được lót một tấm
trắng, vì logo chữ xanh đậm như Gree hay Samsung sẽ chìm mất.

**Dải thương hiệu cũng dùng màu thật.** Ban đầu định tô một màu theo kiểu logo
wall, nhưng ba logo là badge nền màu đặc — tô một màu sẽ biến chúng thành khối
vuông đặc, mất hết nhận diện.

Kích thước tự cân theo tỉ lệ ảnh: logo ngang dài (Samsung) và logo vuông
(TPBank) mà cùng chiều cao thì cái dài trông to gấp mấy lần, nên chiều cao được
hạ dần theo độ dài.

### Chuẩn hoá file nguồn

Logo tải về thường mỗi cái một kiểu — nền trắng, badge nền màu, dính chữ thừa,
kích thước loạn. Có script đưa hết về một chuẩn:

```
python tools/prepare_logos.py
```

Script đọc file gốc trong `tools/logo-src/`, gỡ nền trắng bằng flood fill
từ 4 góc (giữ nguyên mảng âm bên trong logo), bo góc cho badge nền màu, cắt sát
nội dung rồi xuất PNG cao 120px vào `assets/img/logos/`. Thêm logo mới thì thêm
một dòng vào `LOGOS` trong script.

Cùng bộ file đó dùng cho **cả hai chỗ**: dải thương hiệu (cao 30px) và dòng
tên công ty trên từng thẻ dự án (cao 18px). Thêm file một lần là hiện ở cả hai.

Muốn thêm thương hiệu: thêm `data-logo="slug"` vào phần tử tương ứng trong
`index.html` (kèm `<span class="blogo">` và `<span class="bword">`), đặt file
tên `slug.svg`.

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

> ⚠️ Sửa `style.css`, `main.js` hay `i18n.js` xong thì chạy
> `python tools/bump_version.py` để đổi số `?v=` trên link trong `index.html`.
> Quên bước này thì trình duyệt vẫn dùng bản cũ trong cache và tưởng là code lỗi.

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
