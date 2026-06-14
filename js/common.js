/* =========================================================
   common.js  –  헤더/푸터 공통 동작
   - 헤더 스크롤 active 처리
   - 모바일 햄버거 메뉴 open/close (+ body scroll lock)
   - TOP 버튼 노출 / scroll to top
   - GNB 현재 섹션 active 표시
   include.js 의 'includes:loaded' 이후 헤더/푸터 DOM 이 존재하므로
   해당 이벤트 시점에 바인딩한다.
   ========================================================= */
(function () {
  "use strict";

  function initCommon() {
    initHeaderScroll();
    initMobileMenu();
    initTopButton();
    initGnbActive();
  }

  /* -------- 헤더 스크롤 active -------- */
  function initHeaderScroll() {
    var header = document.getElementById("header");
    if (!header) return;

    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------- 모바일 햄버거 메뉴 -------- */
  function initMobileMenu() {
    var btn = document.getElementById("hamburger");
    var menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;

    var open = function () {
      btn.classList.add("is-active");
      menu.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-label", "메뉴 닫기");
      document.body.classList.add("is-locked");
    };
    var close = function () {
      btn.classList.remove("is-active");
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-label", "메뉴 열기");
      document.body.classList.remove("is-locked");
    };
    var toggle = function () {
      if (menu.classList.contains("is-open")) close();
      else open();
    };

    btn.addEventListener("click", toggle);

    // 메뉴 내부 링크 클릭 시 닫기
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });

    // ESC 로 닫기
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) close();
    });

    // 데스크톱 폭으로 리사이즈되면 메뉴 정리
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1024 && menu.classList.contains("is-open")) close();
    });
  }

  /* -------- TOP 버튼 -------- */
  function initTopButton() {
    var topBtn = document.getElementById("topBtn");
    if (!topBtn) return;

    var onScroll = function () {
      if (window.scrollY > 600) topBtn.classList.add("is-show");
      else topBtn.classList.remove("is-show");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    topBtn.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* -------- GNB 현재 섹션 active -------- */
  function initGnbActive() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll(".gnb__link[href^='#']")
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      if (id) map[id] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = map[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach(function (l) { l.removeAttribute("aria-current"); });
            link.setAttribute("aria-current", "page");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) observer.observe(sec);
    });
  }

  // 인클루드 완료 후 실행 (헤더/푸터 DOM 보장)
  document.addEventListener("includes:loaded", initCommon);
})();
