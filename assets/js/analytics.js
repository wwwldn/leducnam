/* =========================================================
   leducnam.com — đo lường

   Điền ID vào CONFIG bên dưới là chạy. Để trống thì phần đó không tải,
   không phát sinh request nào — trang vẫn sạch như khi chưa gắn gì.

   Hai công cụ bổ sung cho nhau:
   · Cloudflare — đếm lượt xem, nguồn vào, quốc gia. Không cookie nên
     không cần banner đồng ý. Nhưng KHÔNG có sự kiện tuỳ biến.
   · Clarity    — heatmap cuộn, heatmap click, quay lại phiên xem, và
     nhận sự kiện tuỳ biến. Có cookie, xem ghi chú cuối file.

   Mọi sự kiện đi qua hàm track() nên sau này đổi công cụ chỉ phải sửa
   một chỗ duy nhất.
   ========================================================= */
(function () {
  'use strict';

  var CONFIG = {
    // Cloudflare → Web Analytics → Add a site → copy token trong đoạn script
    cloudflareToken: '',

    // Microsoft Clarity → New project → copy Project ID (dạng 'abcd1234ef')
    clarityId: '',

    // Bật/tắt việc đo thời gian dừng ở từng mục
    trackSections: true
  };

  var hasCF = /^[a-f0-9]{20,}$/i.test(CONFIG.cloudflareToken);
  var hasClarity = /^[a-z0-9]{6,}$/i.test(CONFIG.clarityId);
  if (!hasCF && !hasClarity) return;          // chưa cấu hình gì thì thôi

  /* ---------- 1. Nạp script ---------- */
  if (hasCF) {
    var cf = document.createElement('script');
    cf.defer = true;
    cf.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    cf.setAttribute('data-cf-beacon', JSON.stringify({ token: CONFIG.cloudflareToken }));
    document.head.appendChild(cf);
  }

  if (hasClarity) {
    window.clarity = window.clarity || function () {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
    var cl = document.createElement('script');
    cl.async = true;
    cl.src = 'https://www.clarity.ms/tag/' + CONFIG.clarityId;
    document.head.appendChild(cl);
  }

  /* ---------- 2. Một cửa duy nhất để gửi sự kiện ---------- */
  function track(name, value) {
    if (hasClarity && window.clarity) {
      window.clarity('event', name);
      if (value !== undefined) window.clarity('set', name, String(value));
    }
    // Đổi sang Umami/Plausible/GA4 sau này thì chỉ thêm một dòng ở đây.
  }

  /* ---------- 3. Bấm vào các kênh liên hệ ---------- */
  /* Đây là hành động đáng giá nhất trên trang — người xem chuyển thành
     người liên hệ. Nhận diện theo href nên không phụ thuộc thứ tự nút. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';

    if (href.indexOf('zalo.me') > -1) track('lien-he-zalo');
    else if (href.indexOf('tel:') === 0) track('lien-he-dien-thoai');
    else if (href.indexOf('mailto:') === 0) track('lien-he-email');
    else if (href.indexOf('github.com') > -1) track('lien-he-github');
  }, true);

  /* ---------- 4. Đổi ngôn ngữ ---------- */
  /* Cho biết trang có thực sự cần bản Anh/Trung không, hay chỉ mình bạn bấm. */
  var langMenu = document.getElementById('langMenu');
  if (langMenu) {
    langMenu.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-lang]');
      if (b) track('doi-ngon-ngu-' + b.getAttribute('data-lang'));
    });
  }

  /* ---------- 5. Cuộn sâu tới đâu ---------- */
  var marks = [25, 50, 75, 100];
  var hit = {};

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return;

    var pct = ((window.scrollY || window.pageYOffset) / max) * 100;
    for (var i = 0; i < marks.length; i++) {
      if (pct >= marks[i] && !hit[marks[i]]) {
        hit[marks[i]] = true;
        track('cuon-' + marks[i]);
      }
    }
  }

  /* Hãm bằng mốc thời gian chứ không dùng requestAnimationFrame: rAF chỉ chạy
     khi trang đang vẽ, nên có lúc cuộn xong mà mốc cuối không kịp ghi nhận. */
  var lastCheck = 0;
  window.addEventListener('scroll', function () {
    var now = Date.now();
    if (now - lastCheck < 200) return;
    lastCheck = now;
    onScroll();
  }, { passive: true });

  /* ---------- 6. Dừng ở mục nào lâu nhất ---------- */
  /* Đếm số giây mỗi mục nằm trong tầm nhìn. Lúc rời trang thì gửi tên mục
     được xem lâu nhất và tổng thời gian ở lại — trả lời trực tiếp câu
     "người ta quan tâm phần nào". */
  var dwell = {}, since = {}, sent = false;
  var started = Date.now();

  if (CONFIG.trackSections && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (!id) return;

        if (en.isIntersecting) {
          since[id] = Date.now();
        } else if (since[id]) {
          dwell[id] = (dwell[id] || 0) + (Date.now() - since[id]);
          delete since[id];
        }
      });
    }, { threshold: 0.5 });

    Array.prototype.forEach.call(document.querySelectorAll('section[id]'), function (s) {
      io.observe(s);
    });
  }

  function flush() {
    if (sent) return;
    sent = true;
    onScroll();          // chốt mốc cuộn cuối cùng

    Object.keys(since).forEach(function (id) {
      dwell[id] = (dwell[id] || 0) + (Date.now() - since[id]);
    });

    var best = null;
    Object.keys(dwell).forEach(function (id) {
      if (!best || dwell[id] > dwell[best]) best = id;
    });

    if (best && dwell[best] > 2000) track('muc-xem-lau-nhat', best);
    track('thoi-gian-o-lai-giay', Math.round((Date.now() - started) / 1000));
  }

  // pagehide đáng tin hơn beforeunload trên iOS Safari
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });
})();

/* ---------- Ghi chú riêng tư ----------
   Cloudflare không đặt cookie, không nhận diện cá nhân → không cần banner.

   Clarity CÓ đặt cookie và quay lại thao tác chuột/cuộn của khách. Mặc định
   nó che nội dung văn bản, và trang này không có form nhập liệu nào nên
   không thu được dữ liệu cá nhân. Dù vậy, khi bật Clarity nên thêm một dòng
   ở footer nói rõ trang có dùng công cụ phân tích — vừa đúng Nghị định
   13/2023, vừa là phép lịch sự với người xem.
   ------------------------------------ */
