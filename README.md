# 웹툰 MG 정산 계산기 (Webtoon MG Calculator)

!

---

## 소개

이 코드는 웹툰 작가를 위한 Minimum Guarantee (MG) 정산 방식을 시뮬레이션하고 분석하는 웹 기반 계산기입니다. 복잡한 MG 정산 과정(선차감, 후차감, 누적MG, 월MG)을 입력값만으로 쉽게 비교 분석해서 작가가 수익 구조를 빠르게 파악할 수 있습니다.

## 주요 기능

정산 방식 시뮬레이션: 누적 MG 및 월 MG 방식을 선택하여 시뮬레이션 가능.
차감 방식 비교: 선차감 (Pre-deduction)과 후차감 (Post-deduction)에 따른 월별 수익 비교.
런칭 특수성 반영: 첫 달 런칭 시 한 번에 공개하는 회차 수와 이에 따른 MG 지급액을 정확히 계산. (왜냐면 네이버는 3~5화, 카카오페이지는 20~25화를 첫달에 오픈하기 때문.)
수익 분석: 첫 달 및 평균 평상시 월 수익, 연재 종료 시점의 총 수익 및 미상환 MG 잔액까지 종합 분석.

---

## 기술 스택 (Tech Stack)

| 구분 | 기술 | 사용 목적 |
| :--- | :--- | :--- |
| **언어 (Language)** | JavaScript | 모든 MG 정산 및 수익 분석 로직 구현 |
| **마크업 (Markup)** | HTML | 계산기 구조 및 입력 폼 구성 |
| **스타일링 (Styling)** | CSS | 파스텔톤 기반의 세련된 디자인 및 사용자 인터페이스 구현 |

### 환경 및 도구

버전 관리: Git & GitHub
배포: Netlify
분석: Google Analytics (GA4)
개발 환경: VS Code (Visual Studio Code)

---

## 사용 방법 및 배포

### 1. 사용 방법

1.  배포된 [프로젝트 링크](https://webtoon-mg-calc.netlify.app/)에 접속합니다.
2.  '계약 조건', '연재 정보', '월별 예상 수익' 섹션에 필요한 값을 입력합니다.
3.  `총 정산 결과 계산하기` 버튼을 클릭하여 결과를 확인합니다.

### 2. 로컬에서 실행

1.  저장소를 클론합니다: `git clone https://github.com/pinetree5115-collab/webtoon-mg-calc.git`
2.  폴더로 이동 후 `index.html` 파일을 웹 브라우저로 실행합니다.

---

## 🔗 링크

[GitHub Repository (현재 레포지토리 링크)](https://github.com/pinetree5115-collab/webtoon-mg-calc)

[배포된 웹사이트 링크](https://webtoon-mg-calc.netlify.app/)