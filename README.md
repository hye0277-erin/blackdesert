# BLACK DESERT — 게임 사이트 (리뉴얼)

검은사막 콘셉트의 다크 판타지 게임 소개 웹사이트입니다.
패럴랙스 히어로, 클래스 캐러셀, 콘텐츠/새소식 게시판 등 게임 사이트에서 자주 쓰이는 구성을 화려한 골드 톤으로 구현했습니다.

## 페이지 구성

| 페이지 | 설명 |
|---|---|
| `index.html` | 메인 — 패럴랙스 히어로(성+기사 분리 레이어), 로고 글리치, 콘텐츠 카드, 클래스 캐러셀, 커스터마이징, 루프 영상, CTA |
| `about.html` | 게임 소개 — 세계관, 핵심 특징, 숫자 카운터, 지역 |
| `class.html` | 클래스 소개 — owl 스타일 중앙 캐러셀 |
| `content.html` | 콘텐츠 상세 (`?id=01~04`) |
| `news.html` | 새소식 게시판 — 탭 필터 + 페이지네이션 |
| `news-view.html` | 새소식 상세 보기 (`?id=N`) |
| `news-write.html` | 새소식 글쓰기 (localStorage 저장) |

## 기술
- 순수 HTML / CSS / JavaScript (프레임워크 없음)
- 폰트: Cinzel(세리프) + Pretendard(산세리프)
- 공통 헤더/푸터는 `js/include.js`로 fetch 삽입

## 실행 방법
헤더/푸터가 `fetch`로 로드되므로 **반드시 로컬 서버**로 실행하세요. (`file://` 직접 열기는 동작하지 않음)

- VSCode **Live Server** 확장 → `index.html` 우클릭 → "Open with Live Server"
- 또는 `npx serve` 등 임의의 정적 서버

## 폴더 구조
```
├─ index.html, about.html, class.html, content.html
├─ news.html, news-view.html, news-write.html
├─ common/   # header.html, footer.html (공통)
├─ css/      # reset, common, layout, renewal
├─ js/       # include, common, renewal
└─ images/   # 이미지·영상 에셋
```
