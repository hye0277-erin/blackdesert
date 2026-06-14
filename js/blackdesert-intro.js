(() => {
  const intro = document.querySelector('#blackdesertIntro');
  if (!intro) return;

  const stage = intro.querySelector('.bd-intro__stage');
  const sceneClosed = intro.querySelector('.bd-scene--closed'); // 닫힌 양문 (시작)
  const sceneOpen = intro.querySelector('.bd-scene--open');     // 빈 제단 홀
  const sceneSword = intro.querySelector('.bd-scene--sword');   // 칼 꽂힌 제단
  const beam = intro.querySelector('.bd-beam');
  const impact = intro.querySelector('.bd-impact');
  const embers = intro.querySelector('.bd-embers');
  const brand = intro.querySelector('.bd-brand');
  const topUi = intro.querySelector('.bd-ui--top');
  const hint = intro.querySelector('.bd-hint');

  // 불꽃 입자 생성
  if (embers && embers.children.length === 0) {
    const frag = document.createDocumentFragment();
    const count = window.matchMedia('(max-width: 768px)').matches ? 34 : 64;
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('i');
      dot.className = 'bd-ember';
      dot.style.setProperty('--left', `${Math.random() * 100}%`);
      dot.style.setProperty('--size', `${Math.random() * 3 + 1}px`);
      dot.style.setProperty('--dur', `${Math.random() * 4 + 4}s`);
      dot.style.setProperty('--delay', `${Math.random() * -7}s`);
      dot.style.setProperty('--x', `${Math.random() * 120 - 60}px`);
      frag.appendChild(dot);
    }
    embers.appendChild(frag);
  }

  if (!window.gsap || !window.ScrollTrigger) {
    intro.classList.add('bd-no-gsap');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    // 모션 최소화: 애니메이션 없이 최종(칼 꽂힌) 장면을 정적 표시
    intro.classList.add('bd-no-gsap');
    gsap.set([brand, topUi], { autoAlpha: 1 });
    return;
  }

  /* =========================================================
     초기 상태
     - 세 배경(닫힌문 / 빈제단 / 칼제단)을 같은 위치에 겹쳐두고
       크로스페이드 + 줌인으로 "문 안으로 들어가는" 카메라 연출
     - 시작 화면 = 닫힌 양문(07)이 보임 → 검은 화면 없음
     ========================================================= */
  gsap.set(stage, { autoAlpha: 1 });

  // 가장 안쪽 = 칼 꽂힌 제단 (마지막에 드러남)
  gsap.set(sceneSword, { autoAlpha: 0, scale: 1.06, filter: 'brightness(0.94) contrast(1.08)' });
  // 중간 = 빈 제단 홀 (문 열린 직후)
  gsap.set(sceneOpen, { autoAlpha: 0, scale: 1.12, filter: 'brightness(0.9) contrast(1.08)' });
  // 맨 위 = 닫힌 양문 (시작 화면)
  gsap.set(sceneClosed, { autoAlpha: 1, scale: 1.0, filter: 'brightness(0.92) contrast(1.1)' });

  gsap.set(beam, { autoAlpha: 0, scaleY: 0, scaleX: 1 });
  gsap.set(impact, { scale: 0.18, autoAlpha: 0 });
  gsap.set(embers, { autoAlpha: 0.18 });
  gsap.set([brand, topUi], { y: 22, autoAlpha: 0 });
  gsap.set(hint, { autoAlpha: 1, y: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: intro,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      invalidateOnRefresh: true
    }
  });

  // 0. 스크롤 시작과 함께 안내 문구가 사라짐
  tl.to(hint, { autoAlpha: 0, y: -20, duration: 0.06 }, 0.0);

  // 1. 닫힌 문을 향해 카메라가 천천히 다가감 (살짝 확대 + 밝아짐)
  tl.to(sceneClosed, {
    scale: 1.14,
    filter: 'brightness(1.0) contrast(1.12)',
    duration: 0.28
  }, 0.0);

  // 2. 문이 열림 = 닫힌 문이 살짝 더 확대되며 페이드아웃,
  //    동시에 안쪽(빈 제단 홀)이 드러남  → "문이 열리며 안으로 빨려드는" 느낌
  tl.to(sceneClosed, {
    scale: 1.5,
    autoAlpha: 0,
    filter: 'brightness(1.25) contrast(1.18)',
    duration: 0.34,
    ease: 'power2.in'
  }, 0.26);
  tl.to(sceneOpen, {
    autoAlpha: 1,
    scale: 1.0,
    duration: 0.3,
    ease: 'power2.out'
  }, 0.28);

  // 3. 카메라가 열린 문 안쪽 제단으로 계속 진입 (빈 제단 홀이 확대)
  tl.to(sceneOpen, {
    scale: 1.16,
    filter: 'brightness(0.96) contrast(1.1)',
    duration: 0.34
  }, 0.46);

  // 4. 빛기둥이 제단으로 내리꽂힘 — 곧 칼이 각인될 전조
  tl.to(beam, { autoAlpha: 0.9, scaleY: 1, duration: 0.1, ease: 'power2.in' }, 0.66);

  // 5. 섬광과 함께 칼이 제단에 "각인"되며 나타남
  //    (빈 제단 → 칼 제단으로 크로스페이드 + 순간 플래시)
  tl.to(sceneOpen, { autoAlpha: 0, duration: 0.06 }, 0.74);
  tl.to(sceneSword, {
    autoAlpha: 1,
    scale: 1.16,
    filter: 'brightness(1.0) contrast(1.1)',
    duration: 0.06
  }, 0.74);
  // 흰 섬광(빛기둥 순간 확대)
  tl.to(beam, { scaleX: 6, autoAlpha: 1, duration: 0.04 }, 0.75);
  tl.to(beam, { autoAlpha: 0, scaleX: 8, duration: 0.16 }, 0.79);

  // 6. 충격파 + 불꽃 + 화면 흔들림 (칼이 박히는 순간)
  tl.to(impact, { autoAlpha: 0.95, scale: 1.2, duration: 0.03 }, 0.76);
  tl.to(impact, { autoAlpha: 0, scale: 3.4, duration: 0.16 }, 0.79);
  tl.to(embers, { autoAlpha: 1, duration: 0.14 }, 0.74);
  tl.to(stage, {
    keyframes: [
      { x: -14, y: 6, duration: 0.01 },
      { x: 11, y: -6, duration: 0.01 },
      { x: -7, y: 3, duration: 0.01 },
      { x: 4, y: -2, duration: 0.01 },
      { x: 0, y: 0, duration: 0.01 }
    ]
  }, 0.76);
  // 임팩트 순간 전체가 번쩍였다가 안정
  tl.to(sceneSword, { filter: 'brightness(1.35) contrast(1.18)', duration: 0.03 }, 0.76);
  tl.to(sceneSword, { filter: 'brightness(0.96) contrast(1.08)', scale: 1.1, duration: 0.16 }, 0.8);

  // 7. 로고와 상단 UI 등장
  tl.to(brand, { y: 0, autoAlpha: 1, duration: 0.16, ease: 'power2.out' }, 0.86);
  tl.to(topUi, { y: 0, autoAlpha: 1, duration: 0.12, ease: 'power2.out' }, 0.9);

  // 화면 사이즈 변경 대응
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
