/* =========================================================
   renewal.js — BLACK DESERT 리뉴얼 인터랙션
   - 히어로 불꽃 입자
   - 스크롤 패럴랙스 (data-parallax)
   - 스크롤 등장 애니메이션 (.rn-reveal)
   - 클래스 셀렉터
   - 커스터마이징 썸네일
   - 트레일러 모달
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------- 1. 히어로 불꽃 입자 -------- */
  function initEmbers() {
    var box = document.getElementById("heroEmbers");
    if (!box || reduceMotion) return;
    var count = window.matchMedia("(max-width: 768px)").matches ? 28 : 56;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var e = document.createElement("i");
      e.className = "rn-ember";
      e.style.setProperty("--l", (Math.random() * 100) + "%");
      e.style.setProperty("--s", (Math.random() * 3 + 1.5) + "px");
      e.style.setProperty("--d", (Math.random() * 5 + 6) + "s");
      e.style.setProperty("--dl", (Math.random() * -9) + "s");
      e.style.setProperty("--x", (Math.random() * 140 - 70) + "px");
      frag.appendChild(e);
    }
    box.appendChild(frag);
  }

  /* -------- 2. 패럴랙스 -------- */
  function initParallax() {
    if (reduceMotion) return;
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!items.length) return;

    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        // 요소가 뷰포트 근처일 때만 계산
        if (rect.bottom < -vh || rect.top > vh * 2) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
        // 화면 중앙 기준 진행도
        var center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = "translate3d(0," + (center * speed).toFixed(2) + "px,0)";
      });
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
  }

  /* -------- 2b. 히어로 마우스/스크롤 깊이감 (배경+기사 분리 레이어) -------- */
  function initHeroDepth() {
    var scene = document.getElementById("heroScene");
    if (!scene || reduceMotion) return;

    var MAX = 26;           // 최대 이동(px) 기준
    var tx = 0, ty = 0;     // 목표값
    var cx = 0, cy = 0;     // 현재값(부드럽게 추적)
    var raf = null;

    function apply() {
      // easing: 현재값이 목표값으로 서서히 이동
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      scene.style.setProperty("--mx", cx.toFixed(2) + "px");
      scene.style.setProperty("--my", cy.toFixed(2) + "px");
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = window.requestAnimationFrame(apply);
      } else { raf = null; }
    }
    function kick() { if (!raf) raf = window.requestAnimationFrame(apply); }

    // 마우스: 화면 중앙 기준 -1~1 → 반대 방향으로 이동(시차)
    window.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth - 0.5) * 2;
      var ny = (e.clientY / window.innerHeight - 0.5) * 2;
      tx = -nx * MAX;
      ty = -ny * MAX * 0.6;
      kick();
    }, { passive: true });

    // 모바일: 스크롤에 따라 약하게
    window.addEventListener("scroll", function () {
      var p = Math.min(window.scrollY / window.innerHeight, 1);
      ty = -p * MAX;
      kick();
    }, { passive: true });
  }

  /* -------- 3. 스크롤 등장 -------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".rn-reveal"));
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });

    // 안전장치: 1.6초 후에도 안 보이는 요소는 강제로 노출(관찰 누락 방지)
    window.setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-in")) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) { el.classList.add("is-in"); io.unobserve(el); }
        }
      });
    }, 1600);
  }

  /* -------- 5. 커스터마이징 썸네일 -------- */
  function initCustom() {
    var box = document.getElementById("customThumbs");
    var bg = document.getElementById("customBg");
    if (!box || !bg) return;
    var thumbs = Array.prototype.slice.call(box.querySelectorAll(".rn-custom__thumb"));
    thumbs.forEach(function (t) {
      t.addEventListener("click", function () {
        thumbs.forEach(function (x) { x.classList.remove("is-active"); });
        t.classList.add("is-active");
        var src = t.getAttribute("data-bg");
        if (src) bg.style.backgroundImage = "url('" + src + "')";
      });
    });
  }

  /* -------- 5b. 숫자 카운터 (about 페이지) -------- */
  function initStats() {
    var nums = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!nums.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
      var dur = 1400, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString();
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* -------- 6. 트레일러 모달 -------- */
  function initModal() {
    var modal = document.getElementById("trailerModal");
    var openBtn = document.getElementById("mediaThumb");
    var closeBtn = document.getElementById("modalClose");
    var videoBox = document.getElementById("modalVideo");
    if (!modal) return;

    // 로컬 영상이 있으면 사용, 없으면 안내
    var VIDEO_SRC = "images/media/black_world_loop.mp4";

    function open() {
      videoBox.innerHTML =
        '<video src="' + VIDEO_SRC + '" controls autoplay playsinline style="width:100%;height:100%;object-fit:cover;background:#000"></video>';
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      videoBox.innerHTML = "";
    }

    if (openBtn) openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
  }

  /* -------- 7. 콘텐츠 상세 (content.html?id=0X) -------- */
  var CONTENTS = {
    "01": {
      tag: "NEW CLASS", cat: "신규 클래스", date: "2026.05.22", level: "Lv. 1+",
      title: "신규 클래스 : 도사",
      img: "images/contents/content-01.jpg",
      lead: "백발의 검은 도포를 두른 신비의 검객, '도사'가 검은사막에 강림합니다. 바람을 가르는 부적과 검의 조화로 전장을 지배하세요.",
      sections: [
        { h: "클래스 소개", p: [
          "도사는 동방의 고대 무예를 계승한 근·원거리 하이브리드 클래스입니다. 부적을 매개로 한 원거리 견제와 영도(靈刀)를 이용한 근접 폭딜을 자유롭게 오가며 전투를 풀어갑니다.",
          "각성 시에는 검은 안개를 두른 '귀령' 상태로 변모해 광역 제압 능력이 극대화됩니다."
        ]},
        { h: "핵심 전투 특성", list: [
          "부적 투척으로 원거리 견제 및 디버프 부여",
          "영도 연계기로 단일 대상 강력한 폭딜",
          "회피와 동시에 반격하는 '환영보' 시스템",
          "각성 '귀령' — 광역 제압과 생존력 강화"
        ]},
        { h: "출시 기념 혜택", p: [
          "도사 캐릭터를 생성하고 첫 7일간 출석하면 전용 코스튬과 성장 패키지를 드립니다. 신규·복귀 모험가에게는 레벨업 부스터가 추가로 지급됩니다."
        ]}
      ]
    },
    "02": {
      tag: "REGION", cat: "신규 지역", date: "2026.05.15", level: "Lv. 50+",
      title: "아침의 나라 : 서울",
      img: "images/contents/content-02.jpg",
      lead: "고요한 신전과 등불이 빛나는 거리. 동방의 신비를 간직한 새로운 대륙 '아침의 나라'가 열립니다.",
      sections: [
        { h: "지역 소개", p: [
          "'아침의 나라'는 전통 건축과 자연이 어우러진 광활한 동방 대륙입니다. 고즈넉한 한옥 마을부터 안개 낀 영산까지, 발길 닿는 곳마다 새로운 이야기가 기다립니다.",
          "낮과 밤, 계절의 변화에 따라 등장하는 몬스터와 이벤트가 달라져 언제 방문해도 색다른 모험을 즐길 수 있습니다."
        ]},
        { h: "주요 콘텐츠", list: [
          "신규 필드 보스 '구미호' 토벌전",
          "전통 의상 커스터마이징 추가",
          "지역 한정 생활 콘텐츠 — 다도, 등불 만들기",
          "숨겨진 고대 유적 탐험 퀘스트"
        ]},
        { h: "탐험 팁", p: [
          "지역 곳곳의 사당에서 축복을 받으면 일정 시간 능력치가 강화됩니다. 영산 정상의 봉인된 제단은 권장 레벨 60 이상에서 도전하세요."
        ]}
      ]
    },
    "03": {
      tag: "EVENT", cat: "이벤트", date: "2026.05.10", level: "전체",
      title: "검은사막 FESTA",
      img: "images/contents/content-03.jpg",
      lead: "보랏빛 마력이 하늘을 수놓는 대축제. 한 해 가장 화려한 인게임 페스타가 시작됩니다.",
      sections: [
        { h: "이벤트 개요", p: [
          "검은사막 FESTA는 전 서버 모험가가 함께 즐기는 대규모 축제 이벤트입니다. 마법진 의식, 불꽃놀이, 한정 보스 레이드 등 다채로운 콘텐츠가 기간 한정으로 열립니다.",
          "참여만 해도 누적 보상이 쌓이며, 목표 달성 시 전용 칭호와 코스튬을 획득할 수 있습니다."
        ]},
        { h: "참여 보상", list: [
          "일일 출석 — 페스타 코인 지급",
          "마법진 의식 참여 — 한정 마운트 추첨",
          "협동 보스 토벌 — 전용 무기 스킨",
          "랭킹 달성 — '축제의 주인공' 칭호"
        ]},
        { h: "기간", p: [
          "이벤트는 업데이트 후 4주간 진행됩니다. 페스타 코인은 종료 전까지 전용 상점에서 교환해 주세요."
        ]}
      ]
    },
    "04": {
      tag: "LEAGUE", cat: "길드 리그", date: "2026.05.03", level: "Lv. 56+",
      title: "길드 리그 시즌 4",
      img: "images/contents/content-04.jpg",
      lead: "등불이 흩날리는 전장, 영토를 건 길드의 격돌. 가장 치열한 시즌이 막을 올립니다.",
      sections: [
        { h: "시즌 소개", p: [
          "길드 리그는 길드 간 대규모 거점·공성전 콘텐츠입니다. 시즌 4에서는 새로운 전장 '여명의 성채'가 추가되고, 점령 거점에 따른 보상 체계가 전면 개편되었습니다.",
          "수백 명이 동시에 부딪치는 전장에서 전략과 협동으로 명예를 쟁취하세요."
        ]},
        { h: "이번 시즌 변경점", list: [
          "신규 전장 '여명의 성채' 추가",
          "거점 점령 보상 재구성 및 상향",
          "공성 병기 '화룡포' 신규 등장",
          "시즌 랭킹 길드 전용 문장·보상 추가"
        ]},
        { h: "참여 방법", p: [
          "레벨 56 이상의 길드원으로 구성된 길드는 리그 신청서를 통해 참가할 수 있습니다. 매주 정해진 시간에 전장이 개방됩니다."
        ]}
      ]
    }
  };
  var CONTENT_ORDER = ["01", "02", "03", "04"];

  function renderContentDetail() {
    var root = document.querySelector("[data-content-detail]");
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (!CONTENTS[id]) id = "01"; // 기본값
    var d = CONTENTS[id];

    function set(elId, val) { var el = document.getElementById(elId); if (el) el.textContent = val; }

    document.title = d.title + " | BLACK DESERT";
    var bg = document.getElementById("cdBg");
    if (bg) bg.style.backgroundImage = "url('" + d.img + "')";
    set("cdTag", d.tag);
    set("cdTitle", d.title);
    set("cdDate", d.date);
    set("cdCat", d.cat);
    set("cdLead", d.lead);
    set("cdAsideCat", d.cat);
    set("cdAsideDate", d.date);
    set("cdAsideLv", d.level);

    // 본문 섹션 생성
    var article = document.getElementById("cdArticle");
    if (article) {
      var frag = document.createDocumentFragment();
      // 대표 이미지
      var fig = document.createElement("div");
      fig.className = "rn-article__img";
      var im = document.createElement("img");
      im.src = d.img; im.alt = d.title;
      fig.appendChild(im);
      frag.appendChild(fig);

      d.sections.forEach(function (sec) {
        var h = document.createElement("h3");
        h.textContent = sec.h;
        frag.appendChild(h);
        if (sec.p) sec.p.forEach(function (t) {
          var p = document.createElement("p"); p.textContent = t; frag.appendChild(p);
        });
        if (sec.list) {
          var ul = document.createElement("ul");
          sec.list.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; ul.appendChild(li); });
          frag.appendChild(ul);
        }
      });
      article.appendChild(frag);
    }

    // 관련 콘텐츠 (현재 항목 제외 3개)
    var rel = document.getElementById("cdRelated");
    if (rel) {
      CONTENT_ORDER.filter(function (k) { return k !== id; }).forEach(function (k, i) {
        var c = CONTENTS[k];
        var a = document.createElement("a");
        a.href = "content.html?id=" + k;
        a.className = "rn-card rn-reveal";
        a.setAttribute("data-delay", String(i + 1));
        a.innerHTML =
          '<span class="rn-card__img" style="background-image:url(\'' + c.img + '\')"></span>' +
          '<span class="rn-card__shade"></span>' +
          '<span class="rn-card__more" aria-hidden="true">↗</span>' +
          '<span class="rn-card__body">' +
            '<span class="rn-card__tag">' + c.tag + '</span>' +
            '<span class="rn-card__title">' + c.title + '</span>' +
            '<span class="rn-card__date">' + c.date + ' UPDATE</span>' +
          '</span>';
        rel.appendChild(a);
      });
    }
  }

  /* -------- 8. 클래스 소개 페이지 (owl 스타일 캐러셀) -------- */
  var CLASSES = [
    { name: "워리어",   en: "Warrior",   role: "근거리 · 방어형", img: "images/class/class-warrior.jpg",
      desc: "검과 방패로 공격과 방어의 균형을 이루는 정통 근접 전사. 전선의 가장 앞에서 동료를 지킵니다.",
      tags: ["근접 전투", "높은 방어력", "전선 유지"] },
    { name: "레인저",   en: "Ranger",    role: "원거리 · 기동형", img: "images/class/class-ranger.jpg",
      desc: "일정 거리를 유지하며 바람처럼 빠른 활시위로 적을 괴롭히는 원거리 사수입니다.",
      tags: ["원거리 견제", "높은 기동성", "정밀 사격"] },
    { name: "소서러",   en: "Sorceress", role: "마법 · 공격형", img: "images/class/class-sorceress.jpg",
      desc: "어둠의 마력을 다루어 근거리와 원거리 모두에 능통한 하이브리드 마법사입니다.",
      tags: ["암흑 마법", "광역 제압", "하이브리드"] },
    { name: "우사",     en: "Woosa",     role: "근거리 · 기동형", img: "images/class/class-woosa.jpg",
      desc: "부채로 나비와 바람을 조종하며 유려한 검무로 전장을 가르는 우아한 중근거리 검객입니다.",
      tags: ["연계기", "유연한 회피", "동양 무예"] },
    { name: "다크나이트", en: "Dark Knight", role: "근거리 · 공격형", img: "images/class/class-darknight.jpg",
      desc: "길고 아름다운 태도와 저주받은 마력으로 모든 것을 베어내는 암흑 기사입니다.",
      tags: ["고화력", "암흑 마검", "광역 폭딜"] },
    { name: "매구",     en: "Maegu",     role: "원근거리 · 변신형", img: "images/class/class-maegu.jpg",
      desc: "여우신과 계약하여 호령부로 적을 유혹하고, 신비한 환술로 전장을 현혹하는 술사입니다.",
      tags: ["환술", "변신", "원근 전환"] },
    { name: "하사신",   en: "Hashashin", role: "중근거리 · 암살형", img: "images/class/class-hasasin.jpg",
      desc: "사막의 그림자. 모래의 힘으로 변칙적인 공격을 퍼붓는 치명적인 암살자입니다.",
      tags: ["기습 암살", "모래 조작", "변칙 전투"] },
    { name: "가디언",   en: "Guardian",  role: "근거리 · 방어형", img: "images/class/class-gadien.jpg",
      desc: "거대한 도끼와 방패로 묵직한 일격을 선보이며 동료를 지키는 불굴의 수호자입니다.",
      tags: ["중장 방어", "강력한 일격", "탱커"] }
    // 새 클래스 추가 시: 아래 형식으로 객체 추가 + images/class/ 에 이미지 저장
    // { name:"드라카니아", en:"Drakania", role:"근거리 · 공격형", img:"images/class/class-drakania.jpg", desc:"...", tags:["...","...","..."] },
  ];

  function initClassPage() {
    var page = document.querySelector("[data-class-page]");
    if (!page) return;

    var track = document.getElementById("owlTrack");
    var dotsBox = document.getElementById("owlDots");
    var prev = document.getElementById("owlPrev");
    var next = document.getElementById("owlNext");
    var bg = document.getElementById("clsBg");
    var info = document.getElementById("clsInfo");
    if (!track) return;

    var current = 0;
    var items = [];

    // 카드 + 도트 생성
    CLASSES.forEach(function (c, i) {
      var item = document.createElement("div");
      item.className = "rn-owl__item";
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", c.name);
      item.innerHTML =
        '<span class="rn-owl__img" style="background-image:url(\'' + c.img + '\')"></span>' +
        '<span class="rn-owl__shade"></span>' +
        '<span class="rn-owl__cap">' +
          '<span class="rn-owl__cap-name">' + c.name + '</span>' +
          '<span class="rn-owl__cap-role">' + c.role + '</span>' +
        '</span>';
      item.addEventListener("click", function () { go(i); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(i); }
      });
      track.appendChild(item);
      items.push(item);

      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "rn-owl__dot";
      dot.setAttribute("aria-label", c.name + " 보기");
      dot.addEventListener("click", function () { go(i); });
      dotsBox.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsBox.children);

    function layout() {
      // 중앙 카드가 뷰포트 가운데 오도록 track 이동
      var vp = track.parentElement; // .rn-owl__viewport
      var vpW = vp.clientWidth;
      var el = items[current];
      var center = el.offsetLeft + el.offsetWidth / 2;
      var offset = vpW / 2 - center;
      track.style.transform = "translateX(" + offset + "px)";
    }

    function syncInfo() {
      var c = CLASSES[current];
      if (bg) bg.style.backgroundImage = "url('" + c.img + "')";
      if (!info) return;
      info.classList.add("is-swap");
      window.setTimeout(function () {
        document.getElementById("clsRole").textContent = c.role;
        document.getElementById("clsName").textContent = c.name;
        document.getElementById("clsEn").textContent = c.en;
        document.getElementById("clsDesc").textContent = c.desc;
        var tagBox = document.getElementById("clsTags");
        tagBox.innerHTML = "";
        c.tags.forEach(function (t) { var s = document.createElement("span"); s.textContent = t; tagBox.appendChild(s); });
        info.classList.remove("is-swap");
      }, reduceMotion ? 0 : 200);
    }

    function go(idx) {
      current = (idx + CLASSES.length) % CLASSES.length;
      items.forEach(function (it, i) { it.classList.toggle("is-center", i === current); });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === current); });
      layout();
      syncInfo();
    }

    if (prev) prev.addEventListener("click", function () { go(current - 1); });
    if (next) next.addEventListener("click", function () { go(current + 1); });
    window.addEventListener("resize", layout);
    // 이미지 로드 후 위치 보정
    window.addEventListener("load", layout);

    go(0);
  }

  /* -------- 9. 새소식 게시판 (news.html / news-view.html / news-write.html) -------- */
  var NEWS = [
    { id: 1, cat: "공지",    title: "PHOENIX : 업화의 불새 대규모 업데이트 안내", date: "2026.06.10", isNew: true,
      excerpt: "검은 일식 너머의 새로운 영역과 신규 클래스가 추가됩니다.",
      body: "검은 일식 너머에서 깨어난 고대의 힘과 함께, PHOENIX : 업화의 불새 대규모 업데이트가 진행됩니다.\n\n이번 업데이트에서는 신규 영역 '업화의 제단'이 공개되며, 강력한 신규 보스와 전용 보상이 추가됩니다. 또한 신규 클래스 '도사'가 출시되어 더욱 다채로운 전투를 즐기실 수 있습니다.\n\n자세한 내용은 인게임 공지를 통해 확인해 주세요. 모험가 여러분의 많은 관심 부탁드립니다." },
    { id: 2, cat: "업데이트", title: "신규 클래스 '도사' 출시 및 밸런스 조정", date: "2026.06.10", isNew: true,
      excerpt: "곰방대와 환도를 다루는 신규 근거리 클래스가 추가되었습니다.",
      body: "곰방대와 환도를 자유자재로 다루는 신규 근거리 클래스 '도사'가 추가되었습니다.\n\n도사는 치명적인 일격기와 화려한 연계기를 통해 적진을 빠르게 제압하는 공격형 클래스입니다. 각성 시에는 더욱 강력한 스킬을 사용할 수 있습니다.\n\n더불어 기존 클래스들의 밸런스도 조정되었습니다. 상세 패치 노트를 확인해 주세요." },
    { id: 3, cat: "이벤트",  title: "출시 기념 7일 출석 보상 이벤트", date: "2026.06.09", isNew: true,
      excerpt: "기간 내 접속만 해도 전용 코스튬과 성장 패키지를 드립니다.",
      body: "업데이트 출시를 기념하여 7일 출석 보상 이벤트를 진행합니다.\n\n이벤트 기간 동안 매일 접속하시면 전용 코스튬, 성장 패키지, 강화 재료 등 푸짐한 보상을 받으실 수 있습니다. 7일차에는 특별한 한정 보상이 기다리고 있습니다.\n\n지금 바로 접속하여 보상을 받아보세요!" },
    { id: 4, cat: "점검",    title: "6월 12일(목) 정기 점검 안내", date: "2026.06.08", isNew: false,
      excerpt: "안정적인 서비스를 위한 정기 점검이 진행됩니다. (07:00~11:00)",
      body: "안정적인 서비스 제공을 위한 정기 점검을 아래와 같이 진행합니다.\n\n■ 점검 일시 : 2026년 6월 12일(목) 07:00 ~ 11:00 (4시간)\n■ 점검 내용 : 서버 안정화 및 신규 콘텐츠 적용\n\n점검 시간은 작업 상황에 따라 변동될 수 있습니다. 이용에 불편을 드려 죄송합니다." },
    { id: 5, cat: "이벤트",  title: "검은사막 FESTA 진행 안내", date: "2026.06.05", isNew: false,
      excerpt: "마법진 의식과 한정 보스 레이드가 열리는 대규모 축제.",
      body: "전 서버 모험가가 함께 즐기는 대규모 축제 '검은사막 FESTA'가 진행됩니다.\n\n마법진 의식, 불꽃놀이, 한정 보스 레이드 등 다채로운 콘텐츠가 기간 한정으로 열립니다. 참여만 해도 누적 보상이 쌓이며, 목표 달성 시 전용 칭호와 코스튬을 획득할 수 있습니다." },
    { id: 6, cat: "업데이트", title: "아침의 나라 : 서울 지역 확장 업데이트", date: "2026.06.03", isNew: false,
      excerpt: "동방의 신비를 품은 신규 지역과 필드 보스가 추가됩니다.",
      body: "동방의 신비를 품은 신규 지역 '아침의 나라 : 서울'이 확장됩니다.\n\n고요한 신전과 등불이 빛나는 거리, 그리고 새로운 필드 보스 '구미호'가 추가됩니다. 지역 한정 생활 콘텐츠와 전통 의상 커스터마이징도 함께 만나보세요." },
    { id: 7, cat: "공지",    title: "길드 리그 시즌 4 일정 및 보상 공개", date: "2026.06.01", isNew: false,
      excerpt: "신규 전장 '여명의 성채'와 개편된 보상 체계를 확인하세요.",
      body: "길드 간 대규모 거점·공성전 콘텐츠 '길드 리그' 시즌 4의 일정과 보상이 공개되었습니다.\n\n신규 전장 '여명의 성채'가 추가되고, 점령 거점에 따른 보상 체계가 전면 개편되었습니다. 레벨 56 이상의 길드원으로 구성된 길드는 리그에 참가할 수 있습니다." },
    { id: 8, cat: "점검",    title: "긴급 점검 완료 및 보상 지급 안내", date: "2026.05.28", isNew: false,
      excerpt: "긴급 점검이 완료되었으며 보상이 일괄 지급되었습니다.",
      body: "긴급 점검이 완료되었습니다. 점검에 협조해 주신 모험가 여러분께 감사드립니다.\n\n점검으로 불편을 드린 점 사과드리며, 보상으로 게임 내 우편함을 통해 보상 패키지를 일괄 지급해 드렸습니다. 우편함을 확인해 주세요." },
    { id: 9, cat: "이벤트",  title: "한정 코스튬 패키지 판매 시작", date: "2026.05.25", isNew: false,
      excerpt: "기간 한정 디자인의 프리미엄 코스튬을 만나보세요.",
      body: "기간 한정 디자인의 프리미엄 코스튬 패키지 판매를 시작합니다.\n\n이번 패키지는 화염을 모티프로 한 고급스러운 디자인으로, 클래스별 전용 효과가 적용됩니다. 한정 판매이므로 기간을 놓치지 마세요." },
    { id: 10, cat: "업데이트", title: "전투 시스템 개선 및 신규 스킬 추가", date: "2026.05.22", isNew: false,
      excerpt: "각 클래스의 각성 스킬과 연계기가 강화되었습니다.",
      body: "전투의 손맛을 한층 강화하는 전투 시스템 개선 업데이트가 적용되었습니다.\n\n각 클래스의 각성 스킬과 연계기가 강화되었으며, 스킬 캔슬과 콤보 입력의 반응성이 개선되었습니다. 더욱 화려하고 통쾌한 전투를 경험해 보세요." },
    { id: 11, cat: "공지",    title: "개인정보처리방침 개정 안내", date: "2026.05.20", isNew: false,
      excerpt: "개인정보처리방침이 일부 개정되어 안내드립니다.",
      body: "개인정보처리방침이 일부 개정되어 안내드립니다.\n\n개정된 내용은 이용약관 페이지에서 확인하실 수 있으며, 시행일 이후 서비스를 계속 이용하시면 개정 사항에 동의하신 것으로 간주됩니다. 자세한 내용을 확인해 주세요." },
    { id: 12, cat: "이벤트",  title: "친구 초대 리워드 시즌 오픈", date: "2026.05.18", isNew: false,
      excerpt: "친구를 초대하고 함께 푸짐한 보상을 받으세요.",
      body: "친구를 초대하고 함께 모험을 즐기면 푸짐한 보상을 드리는 친구 초대 리워드 시즌이 오픈했습니다.\n\n초대한 친구의 레벨 달성 단계에 따라 양쪽 모두 보상을 받을 수 있습니다. 동료와 함께 검은사막의 세계를 누벼보세요." }
  ];
  var NEWS_PER_PAGE = 6;
  var NEWS_LS_KEY = "bd_user_news";

  // 사용자가 작성한 글(localStorage) 불러오기
  function getUserNews() {
    try { return JSON.parse(window.localStorage.getItem(NEWS_LS_KEY)) || []; }
    catch (e) { return []; }
  }
  // 정적 글 + 사용자 글 합치기 (사용자 글이 위로)
  function getAllNews() {
    return getUserNews().concat(NEWS);
  }
  function findNews(id) {
    id = parseInt(id, 10);
    var all = getAllNews();
    for (var i = 0; i < all.length; i++) { if (all[i].id === id) return all[i]; }
    return null;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initNewsPage() {
    var page = document.querySelector("[data-news-page]");
    if (!page) return;

    var listEl = document.getElementById("newsList");
    var pagerEl = document.getElementById("newsPager");
    var tabs = Array.prototype.slice.call(document.querySelectorAll("#newsTabs .rn-tab"));
    if (!listEl) return;

    var filter = "전체";
    var current = 1;

    function filtered() {
      var all = getAllNews();
      return filter === "전체" ? all : all.filter(function (n) { return n.cat === filter; });
    }

    function renderList() {
      var data = filtered();
      var totalPages = Math.max(1, Math.ceil(data.length / NEWS_PER_PAGE));
      if (current > totalPages) current = 1;
      var start = (current - 1) * NEWS_PER_PAGE;
      var pageData = data.slice(start, start + NEWS_PER_PAGE);

      listEl.innerHTML = "";
      if (!pageData.length) {
        listEl.innerHTML = '<p class="rn-news__empty">해당 분류의 소식이 없습니다.</p>';
      } else {
        pageData.forEach(function (n) {
          var item = document.createElement("a");
          item.href = "news-view.html?id=" + n.id;
          item.className = "rn-newsitem";
          item.innerHTML =
            '<span class="rn-newsitem__cat" data-cat="' + n.cat + '">' + n.cat + '</span>' +
            '<span class="rn-newsitem__main">' +
              '<span class="rn-newsitem__title">' + escapeHtml(n.title) +
                (n.isNew ? ' <span class="rn-newsitem__new">NEW</span>' : '') +
              '</span>' +
              '<span class="rn-newsitem__excerpt">' + escapeHtml(n.excerpt) + '</span>' +
            '</span>' +
            '<span class="rn-newsitem__date">' + n.date + '</span>';
          listEl.appendChild(item);
        });
      }
      renderPager(totalPages);
    }

    function renderPager(totalPages) {
      if (!pagerEl) return;
      pagerEl.innerHTML = "";
      if (totalPages <= 1) return;

      function btn(label, targetPage, opts) {
        opts = opts || {};
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        if (opts.active) b.classList.add("is-active");
        if (opts.disabled) b.disabled = true;
        else b.addEventListener("click", function () { current = targetPage; renderList(); scrollTop(); });
        return b;
      }
      pagerEl.appendChild(btn("‹", current - 1, { disabled: current === 1 }));
      for (var p = 1; p <= totalPages; p++) {
        pagerEl.appendChild(btn(String(p), p, { active: p === current }));
      }
      pagerEl.appendChild(btn("›", current + 1, { disabled: current === totalPages }));
    }

    function scrollTop() {
      var top = document.getElementById("newsTabs");
      if (top) {
        var y = top.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x) { x.classList.remove("is-active"); });
        t.classList.add("is-active");
        filter = t.getAttribute("data-cat");
        current = 1;
        renderList();
      });
    });

    renderList();
  }

  /* -------- 9b. 새소식 상세 보기 (news-view.html) -------- */
  function initNewsView() {
    var page = document.querySelector("[data-news-view]");
    if (!page) return;

    var id = new URLSearchParams(window.location.search).get("id");
    var n = findNews(id);
    var wrap = document.getElementById("newsViewBody");

    if (!n) {
      if (wrap) wrap.innerHTML = '<p class="rn-news__empty">존재하지 않는 게시글입니다.</p>';
      return;
    }

    document.title = n.title + " | BLACK DESERT";
    function set(elId, val) { var el = document.getElementById(elId); if (el) el.textContent = val; }
    var catEl = document.getElementById("nvCat");
    if (catEl) { catEl.textContent = n.cat; catEl.setAttribute("data-cat", n.cat); }
    set("nvTitle", n.title);
    set("nvDate", n.date);

    var bodyEl = document.getElementById("nvBody");
    if (bodyEl) {
      bodyEl.innerHTML = "";
      String(n.body || n.excerpt || "").split(/\n{2,}/).forEach(function (para) {
        if (!para.trim()) return;
        var p = document.createElement("p");
        p.innerHTML = escapeHtml(para).replace(/\n/g, "<br>");
        bodyEl.appendChild(p);
      });
    }

    // 이전/다음 글 네비
    var all = getAllNews();
    var idx = all.findIndex(function (x) { return x.id === n.id; });
    var prevEl = document.getElementById("nvPrev");
    var nextEl = document.getElementById("nvNext");
    // 목록은 최신이 위 → 이전(위, 더 최신)은 idx-1, 다음(아래, 더 과거)은 idx+1
    if (prevEl) {
      if (idx > 0) { prevEl.href = "news-view.html?id=" + all[idx - 1].id; prevEl.querySelector(".rn-nv__navtitle").textContent = all[idx - 1].title; }
      else { prevEl.classList.add("is-disabled"); prevEl.removeAttribute("href"); prevEl.querySelector(".rn-nv__navtitle").textContent = "최신 글입니다"; }
    }
    if (nextEl) {
      if (idx >= 0 && idx < all.length - 1) { nextEl.href = "news-view.html?id=" + all[idx + 1].id; nextEl.querySelector(".rn-nv__navtitle").textContent = all[idx + 1].title; }
      else { nextEl.classList.add("is-disabled"); nextEl.removeAttribute("href"); nextEl.querySelector(".rn-nv__navtitle").textContent = "마지막 글입니다"; }
    }
  }

  /* -------- 9c. 새소식 글쓰기 (news-write.html) -------- */
  function initNewsWrite() {
    var form = document.querySelector("[data-news-write]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var cat = form.querySelector("#nwCat").value;
      var title = form.querySelector("#nwTitle").value.trim();
      var body = form.querySelector("#nwBody").value.trim();
      var errEl = document.getElementById("nwError");

      if (!title || !body) {
        if (errEl) errEl.textContent = "제목과 내용을 모두 입력해 주세요.";
        return;
      }

      // 날짜 (YYYY.MM.DD) — Date 사용 가능(브라우저 환경)
      var d = new Date();
      var mm = ("0" + (d.getMonth() + 1)).slice(-2);
      var dd = ("0" + d.getDate()).slice(-2);
      var dateStr = d.getFullYear() + "." + mm + "." + dd;

      // 고유 id: 기존 최대 id + 1 (사용자 글은 10000번대로 분리)
      var users = getUserNews();
      var maxUserId = users.reduce(function (m, x) { return Math.max(m, x.id); }, 10000);
      var post = {
        id: maxUserId + 1,
        cat: cat,
        title: title,
        date: dateStr,
        isNew: true,
        excerpt: body.replace(/\s+/g, " ").slice(0, 60),
        body: body
      };
      users.unshift(post);
      try { window.localStorage.setItem(NEWS_LS_KEY, JSON.stringify(users)); }
      catch (err) { if (errEl) errEl.textContent = "저장에 실패했습니다."; return; }

      window.location.href = "news-view.html?id=" + post.id;
    });
  }

  /* -------- init -------- */
  function init() {
    renderContentDetail();
    initClassPage();
    initNewsPage();
    initNewsView();
    initNewsWrite();
    initEmbers();
    initParallax();
    initHeroDepth();
    initReveal();
    initCustom();
    initStats();
    initModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
