/* =========================================================
   include.js  –  공통 HTML(header/footer) 인클루드
   [data-include="header"] 위치에 common/header.html 등을 fetch 후 삽입한다.
   ⚠ 로컬에서 file:// 로 직접 열면 fetch(CORS) 가 막히므로,
     반드시 로컬 서버(예: VSCode Live Server, `npx serve`)로 실행할 것.
   ========================================================= */
(function () {
  "use strict";

  // include 대상 매핑
  var MAP = {
    header: "common/header.html",
    footer: "common/footer.html",
  };

  // 모든 [data-include] 요소 처리
  function loadIncludes() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll("[data-include]")
    );

    var jobs = targets.map(function (el) {
      var key = el.getAttribute("data-include");
      var url = MAP[key] || key; // 매핑에 없으면 경로 그대로 사용

      return fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.text();
        })
        .then(function (html) {
          el.outerHTML = html; // 래퍼 div 제거하고 통째로 교체
        })
        .catch(function (err) {
          console.error("[include] '" + url + "' 로드 실패:", err.message);
          el.innerHTML =
            '<!-- include 실패: ' +
            url +
            " (로컬 서버 환경에서 실행해 주세요) -->";
        });
    });

    return Promise.all(jobs);
  }

  // DOM 준비 후 인클루드 → 완료 이벤트 발행
  function init() {
    loadIncludes().then(function () {
      // common.js / main.js 가 헤더/푸터 DOM 에 접근할 수 있도록 신호 전달
      document.dispatchEvent(new CustomEvent("includes:loaded"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
