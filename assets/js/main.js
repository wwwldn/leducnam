/* =========================================================
   leducnam.com — main.js  (vanilla, không phụ thuộc thư viện)
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Theme sáng / tối ---------- */
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('ldn-theme'); } catch (e) {}

  if (saved) {
    root.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }

  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('ldn-theme', next); } catch (e) {}
    });
  }

  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  /* ---------- 1b. Ngôn ngữ (vi / en / zh) ---------- */
  var LANGS = {
    vi: { code: 'VI', htmlLang: 'vi' },
    en: { code: 'EN', htmlLang: 'en' },
    zh: { code: 'ZH', htmlLang: 'zh-Hans' }
  };
  var DEFAULT_LANG = 'vi';
  var currentLang = DEFAULT_LANG;

  function pickLang() {
    // Tiếng Việt là mặc định. Chỉ đổi khi có ?lang= trên URL
    // hoặc khi khách đã tự chọn ngôn ngữ khác trước đó.
    var q = (location.search.match(/[?&]lang=([a-z-]+)/i) || [])[1];
    if (q && LANGS[q.toLowerCase()]) return q.toLowerCase();

    var stored = null;
    try { stored = localStorage.getItem('ldn-lang'); } catch (e) {}
    if (stored && LANGS[stored]) return stored;

    return DEFAULT_LANG;
  }

  function applyLang(lang) {
    var dict = (window.I18N && window.I18N[lang]) || (window.I18N && window.I18N[DEFAULT_LANG]);
    if (!dict) return;

    currentLang = lang;
    root.setAttribute('lang', LANGS[lang].htmlLang);

    var pairs = [
      ['data-i18n', function (el, v) { el.textContent = v; }],
      ['data-i18n-html', function (el, v) { el.innerHTML = v; }],
      ['data-i18n-alt', function (el, v) { el.setAttribute('alt', v); }],
      ['data-i18n-aria-label', function (el, v) { el.setAttribute('aria-label', v); }]
    ];

    pairs.forEach(function (pair) {
      var attr = pair[0], set = pair[1];
      Array.prototype.forEach.call(document.querySelectorAll('[' + attr + ']'), function (el) {
        var v = dict[el.getAttribute(attr)];
        if (v !== undefined) set(el, v);
      });
    });

    if (dict['meta.title']) document.title = dict['meta.title'];
    var md = document.querySelector('meta[name="description"]');
    if (md && dict['meta.desc']) md.setAttribute('content', dict['meta.desc']);

    // nút menu mobile lấy nhãn theo trạng thái đang mở/đóng
    if (navToggle) {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-label', dict[open ? 'a11y.menuClose' : 'a11y.menuOpen']);
    }

    var flag = document.getElementById('langFlag');
    var code = document.getElementById('langCode');
    if (flag) flag.className = 'flag flag--' + lang;
    if (code) code.textContent = LANGS[lang].code;

    Array.prototype.forEach.call(document.querySelectorAll('#langMenu [data-lang]'), function (b) {
      b.setAttribute('aria-selected', String(b.getAttribute('data-lang') === lang));
    });

    try { localStorage.setItem('ldn-lang', lang); } catch (e) {}
  }

  var langBox = document.getElementById('lang');
  var langBtn = document.getElementById('langBtn');

  function closeLang() {
    if (!langBox) return;
    langBox.classList.remove('is-open');
    langBtn.setAttribute('aria-expanded', 'false');
  }

  if (langBox && langBtn) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = langBox.classList.toggle('is-open');
      langBtn.setAttribute('aria-expanded', String(open));
    });

    Array.prototype.forEach.call(langBox.querySelectorAll('[data-lang]'), function (b) {
      b.addEventListener('click', function () {
        applyLang(b.getAttribute('data-lang'));
        closeLang();
      });
    });

    document.addEventListener('click', function (e) {
      if (!langBox.contains(e.target)) closeLang();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLang();
    });
  }

  /* ---------- 2. Menu mobile ---------- */

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    var d0 = (window.I18N && window.I18N[currentLang]) || {};
    navToggle.setAttribute('aria-label', d0['a11y.menuOpen'] || 'Mở menu');
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      var d = (window.I18N && window.I18N[currentLang]) || {};
      navToggle.setAttribute('aria-label', d[open ? 'a11y.menuClose' : 'a11y.menuOpen'] || (open ? 'Đóng menu' : 'Mở menu'));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- 3. Header dính + thanh tiến trình + nút lên đầu ---------- */
  var header = document.getElementById('siteHeader');
  var progress = document.getElementById('progress');
  var toTop = document.getElementById('toTop');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) header.classList.toggle('is-stuck', y > 8);
    if (toTop) toTop.classList.toggle('is-on', y > 600);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------- 4. Reveal khi cuộn tới ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
    var flowFallback = document.getElementById('flow');
    if (flowFallback) flowFallback.classList.add('is-in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });

    /* Sơ đồ luồng AI — chạy animation riêng khi vào viewport */
    var flow = document.getElementById('flow');
    if (flow) {
      var flowIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            flowIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });
      flowIO.observe(flow);
    }
  }

  /* ---------- 5. Scrollspy — highlight mục đang xem ---------- */
  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];
  var sections = [];

  Array.prototype.forEach.call(navLinks, function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ link: link, el: target });
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sections.forEach(function (s) {
          s.link.classList.toggle('is-active', s.el === entry.target);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s.el); });
  }

  /* ---------- 6. Đếm số ở hero ---------- */
  var counters = document.querySelectorAll('[data-count]');

  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countIO.unobserve(entry.target);

        var el = entry.target;
        var end = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var start = performance.now();
        var dur = 1100;

        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });

    Array.prototype.forEach.call(counters, function (el) { countIO.observe(el); });
  }

  /* ---------- 7. Ảnh chân dung: hiện placeholder nếu chưa có file ---------- */
  var portrait = document.getElementById('portrait');
  var portraitImg = document.getElementById('portraitImg');

  if (portrait && portraitImg) {
    var markEmpty = function () {
      portrait.classList.add('portrait--empty');
      if (portraitImg.parentNode) portraitImg.parentNode.removeChild(portraitImg);
    };
    portraitImg.addEventListener('error', markEmpty);
    if (portraitImg.complete && portraitImg.naturalWidth === 0) markEmpty();
  }

  /* ---------- 7b. Logo thương hiệu ---------- */
  /* Thả file assets/img/logos/<slug>.svg (hoặc .png/.webp) là logo tự thay chữ.
     slug lấy từ data-logo trên mỗi <li>. */
  Array.prototype.forEach.call(document.querySelectorAll('.brands__list [data-logo]'), function (li) {
    var base = 'assets/img/logos/' + li.getAttribute('data-logo') + '.';
    var exts = ['svg', 'png', 'webp'];   // ưu tiên svg, không có thì thử png
    var i = 0, src = '';
    var probe = new Image();

    probe.onerror = function () {
      if (++i < exts.length) { src = base + exts[i]; probe.src = src; }
    };

    probe.onload = function () {
      var box = li.querySelector('.blogo');
      if (!box) return;
      var ratio = (probe.naturalWidth && probe.naturalHeight)
        ? probe.naturalWidth / probe.naturalHeight : 3;
      // giới hạn để logo quá dài hoặc quá vuông không phá nhịp hàng
      ratio = Math.max(1, Math.min(ratio, 5));
      // URL phải tuyệt đối: đường dẫn tương đối trong custom property được
      // phân giải theo vị trí file CSS, không phải file HTML.
      var abs = (typeof URL === 'function') ? new URL(src, document.baseURI).href : src;
      box.style.setProperty('--logo', 'url("' + abs + '")');
      box.style.width = Math.round(30 * ratio) + 'px';
      li.classList.add('has-logo');
    };

    src = base + exts[0];
    probe.src = src;
  });

  /* ---------- 8. Năm ở footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- 9. Áp dụng ngôn ngữ ---------- */
  applyLang(pickLang());
})();
