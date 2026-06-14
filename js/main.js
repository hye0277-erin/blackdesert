/* =========================================================
   main.js  –  메인 페이지 인터랙션
   - Swiper 초기화 (Hero / Hot Contents)
   - GSAP ScrollTrigger 등장 인터랙션
   - Customizing 썸네일 active + 배경 전환 + parallax
   - Trailer modal open/close (ESC 포함)
   - 히어로 슬라이드 카운터
   ========================================================= */
(function () {
  "use strict";

  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    initHeroParallax();
    initHeroSlides();
    initContentsSwiper();
    initClassSlider();
    initCustomizing();
    initTrailerModal();
    initGsap();
  });

  /* =======================================================
     01-a. HERO 이미지 배경 패럴럭스
     - 스크롤 내릴수록 배경이 살짝 더 깊게 내려가 깊이감 부여
     - prefers-reduced-motion 시 미적용
     ======================================================= */
  function initHeroParallax() {
    var slides = document.getElementById("heroSlides");
    if (!slides || REDUCE) return;
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.to(slides, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* =======================================================
     01-b. HERO 배경 이미지 교차(크로스페이드) 순환
     - data-images 의 목록을 일정 간격으로 교차 전환
     - 두 개의 레이어를 번갈아 fade 시켜 부드럽게 전환
     - 이미지가 1장이면 순환하지 않음 / REDUCE 시 첫 장 고정
     ======================================================= */
  function initHeroSlides() {
    var wrap = document.getElementById("heroSlides");
    if (!wrap) return;

    var layers = wrap.querySelectorAll(".hero__img");
    if (layers.length < 2) return;

    var list = (wrap.getAttribute("data-images") || "")
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
    if (list.length < 2 || REDUCE) return;

    // 다음 이미지 미리 로드 (전환 시 깜빡임 방지)
    list.forEach(function (src) {
      var im = new Image();
      im.src = src;
    });

    var INTERVAL = 6000; // 한 장이 머무는 시간(ms) — CSS Ken Burns 8s 와 어울림
    var index = 0;       // 현재 보이는 이미지의 list 인덱스
    var front = 0;       // 현재 활성 레이어 인덱스(0/1)

    setInterval(function () {
      // 탭이 백그라운드면 건너뜀
      if (document.hidden) return;

      index = (index + 1) % list.length;
      var back = front === 0 ? 1 : 0;

      // 뒤 레이어에 다음 이미지 적용 후 교차
      layers[back].style.backgroundImage = "url('" + list[index] + "')";
      // Ken Burns 재시작을 위해 애니메이션 리셋 후 활성화
      void layers[back].offsetWidth;
      layers[back].classList.add("is-active");
      layers[front].classList.remove("is-active");

      front = back;
    }, INTERVAL);
  }

  /* =======================================================
     02. HOT CONTENTS Swiper
     ======================================================= */
  function initContentsSwiper() {
    var el = document.getElementById("contentsSwiper");
    if (!el || typeof Swiper === "undefined") return;

    var curEl = document.getElementById("contentsCur");
    var totalEl = document.getElementById("contentsTotal");

    var swiper = new Swiper(el, {
      slidesPerView: 1.15,
      spaceBetween: 16,
      speed: 600,
      navigation: {
        prevEl: "#contentsPrev",
        nextEl: "#contentsNext",
      },
      breakpoints: {
        768:  { slidesPerView: 2.2, spaceBetween: 18 },
        1024: { slidesPerView: 3,   spaceBetween: 20 },
        1200: { slidesPerView: 4,   spaceBetween: 20 },
      },
      on: {
        init: function () {
          if (totalEl) totalEl.textContent = this.slides.length;
        },
        slideChange: function () {
          if (curEl) curEl.textContent = this.realIndex + 1;
        },
      },
    });

    return swiper;
  }

  /* =======================================================
     03. CHOOSE YOUR CLASS – 가로 스크롤 슬라이더 (좌우 화살표)
     ======================================================= */
  function initClassSlider() {
    var list = document.getElementById("classList");
    var prev = document.getElementById("classPrev");
    var next = document.getElementById("classNext");
    if (!list || !prev || !next) return;

    // 카드 1장 + gap 만큼 이동
    function step() {
      var card = list.querySelector(".class-card");
      if (!card) return list.clientWidth;
      var styles = getComputedStyle(list);
      var gap = parseInt(styles.columnGap || styles.gap, 10) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    // 스크롤 위치에 따라 화살표 비활성화
    function update() {
      var max = list.scrollWidth - list.clientWidth - 1;
      prev.disabled = list.scrollLeft <= 0;
      next.disabled = list.scrollLeft >= max;
    }

    prev.addEventListener("click", function () {
      list.scrollBy({ left: -step(), behavior: "smooth" });
    });
    next.addEventListener("click", function () {
      list.scrollBy({ left: step(), behavior: "smooth" });
    });
    list.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* =======================================================
     04. CUSTOMIZING – 썸네일 active + 배경 전환 + dots
     ======================================================= */
  function initCustomizing() {
    var thumbWrap = document.getElementById("customThumbs");
    var bg = document.getElementById("customBg");
    var dotsWrap = document.getElementById("customDots");
    if (!thumbWrap || !bg) return;

    var thumbs = Array.prototype.slice.call(thumbWrap.querySelectorAll(".thumb"));
    var dots = dotsWrap
      ? Array.prototype.slice.call(dotsWrap.querySelectorAll("button"))
      : [];

    function activate(index) {
      thumbs.forEach(function (t, i) {
        t.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === index);
      });

      var src = thumbs[index].getAttribute("data-bg");
      if (src) {
        // 부드러운 페이드 전환
        bg.style.opacity = "0.4";
        setTimeout(function () {
          bg.style.backgroundImage = "url('" + src + "')";
          bg.style.opacity = "1";
        }, 180);
      }
    }

    thumbs.forEach(function (t, i) {
      t.addEventListener("click", function () { activate(i); });
    });
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { activate(i); });
    });
  }

  /* =======================================================
     05. TRAILER MODAL open/close
     ======================================================= */
  function initTrailerModal() {
    var modal = document.getElementById("trailerModal");
    var videoBox = document.getElementById("modalVideo");
    var closeBtn = document.getElementById("modalClose");
    if (!modal || !videoBox) return;

    var openers = document.querySelectorAll("[data-open-modal]");
    var closers = document.querySelectorAll("[data-close-modal]");
    var lastFocused = null;

    // 임시 영상 URL (실제 트레일러로 교체)
    var VIDEO_SRC =
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0";

    function open() {
      lastFocused = document.activeElement;
      videoBox.innerHTML =
        '<iframe src="' +
        VIDEO_SRC +
        '" title="검은사막 트레일러" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      videoBox.innerHTML = ""; // iframe 제거로 재생 정지
      if (lastFocused) lastFocused.focus();
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        open();
      });
    });
    closers.forEach(function (el) {
      el.addEventListener("click", close);
    });
    if (closeBtn) closeBtn.addEventListener("click", close);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  /* =======================================================
     07. GSAP ScrollTrigger 인터랙션
     ======================================================= */
  function initGsap() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      // GSAP 미로딩 시 reveal 요소가 숨겨지지 않도록 안전장치
      document.documentElement.classList.remove("gsap-ready");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // 모션 최소화 옵션: gsap-ready 를 부여하지 않아 reveal 요소를 그대로 노출
    if (REDUCE) {
      document.documentElement.classList.remove("gsap-ready");
      gsap.set(".js-reveal, .js-reveal-left, .js-reveal-right", {
        opacity: 1, x: 0, y: 0,
      });
      return;
    }

    document.documentElement.classList.add("gsap-ready");
    var EASE = "power3.out";

    /* ---- HERO 중앙 카피 로드 등장 (y:30→0), CTA 0.3s delay ---- */
    var heroCopy = gsap.utils.toArray(".hero__title, .hero__sub");
    var heroCta = document.querySelector(".hero__cta");
    gsap.set(".hero .js-reveal", { opacity: 0, y: 30 });
    var heroTl = gsap.timeline({ delay: 0.2 });
    heroTl.to(heroCopy, {
      opacity: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.12,
    });
    if (heroCta) {
      heroTl.to(heroCta, {
        opacity: 1, y: 0, duration: 0.9, ease: EASE,
      }, "+=0.3");
    }

    /* ---- 섹션 타이틀 / 일반 reveal (fade-up) ---- */
    /* .final 은 .section 클래스가 없어 별도로 포함 (미포함 시 opacity:0 으로 숨겨진 채 노출 안 됨) */
    gsap.utils.toArray(".section .js-reveal, .final .js-reveal").forEach(function (el) {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, ease: EASE,
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    /* ---- HOT CONTENTS 카드 순차 등장 ---- */
    var cards = gsap.utils.toArray("#contentsSwiper .content-card");
    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.12,
          scrollTrigger: { trigger: "#contents", start: "top 70%" },
        }
      );
    }

    /* ---- CLASS 카드 stagger 등장 (좌우 번갈아) ---- */
    var classCards = gsap.utils.toArray(".class-card");
    classCards.forEach(function (card, i) {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 1, ease: EASE, delay: i * 0.1,
          scrollTrigger: { trigger: ".class__list", start: "top 75%" },
        }
      );
    });

    /* ---- CUSTOMIZING : 텍스트 좌측 / 썸네일 우측 등장 + 배경 parallax ---- */
    gsap.fromTo(
      ".js-reveal-left",
      { opacity: 0, x: -50 },
      {
        opacity: 1, x: 0, duration: 1.1, ease: EASE, stagger: 0.12,
        scrollTrigger: { trigger: ".custom", start: "top 70%" },
      }
    );
    gsap.fromTo(
      ".js-reveal-right",
      { opacity: 0, x: 50 },
      {
        opacity: 1, x: 0, duration: 1.1, ease: EASE,
        scrollTrigger: { trigger: ".custom", start: "top 70%" },
      }
    );
    // 배경 parallax
    gsap.to("#customBg", {
      yPercent: 12, ease: "none",
      scrollTrigger: {
        trigger: ".custom", start: "top bottom", end: "bottom top", scrub: true,
      },
    });

    /* ---- MEDIA 썸네일 scale-in ---- */
    gsap.fromTo(
      ".media__thumb",
      { opacity: 0, scale: 0.92 },
      {
        opacity: 1, scale: 1, duration: 1.1, ease: EASE,
        scrollTrigger: { trigger: ".media", start: "top 72%" },
      }
    );

    /* ---- FINAL CTA 배경 slow zoom + 텍스트 fade-up ---- */
    gsap.fromTo(
      "#finalBg",
      { scale: 1.15 },
      {
        scale: 1, ease: "none",
        scrollTrigger: {
          trigger: ".final", start: "top bottom", end: "bottom top", scrub: true,
        },
      }
    );
  }
})();
