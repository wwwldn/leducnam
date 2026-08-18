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

  /* ---------- 2. Menu mobile ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Mở menu');
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
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

  /* ---------- 8. Năm ở footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
