# SKALA Weather

날씨로 고르는 오늘의 여행. Vue 3 과정에서 과제로 만든 날씨 앱입니다.

배포 주소 https://skala-vue.beta-app.kr/

## 바로 보기

배포된 앱 상단 메뉴의 과제 기록 탭에 들어가면 과제 1부터 7까지 각 단계의 화면을 그대로 열어볼 수 있게 해 두었습니다. 각 단계 브랜치를 따로 빌드해서 같은 주소 아래에 올려 두었기 때문에 모달 안에서 버튼을 눌러 가며 당시 동작을 확인할 수 있고 브랜치와 PR로 바로 이동하는 링크도 함께 있습니다. 소개 탭에는 앱 설명과 개발 중 겪은 트러블슈팅 기록이 있습니다.

## 읽는 법

과제마다 요구사항과 구현 내용을 PR에 자세히 적어 두었습니다. README는 길어지면 읽기 불편해서 짧게 줄이고 각 과제 제목에 PR 링크를 걸어 두었습니다. 제목을 누르면 해당 PR로 이동해서 요구사항 별 구현 내용과 코드 발췌를 볼 수 있습니다.

## 과제별 정리

[과제 1 Weather Mockup](https://github.com/NohYeongO/skala-vue/pull/1)
v-for와 v-if로 날씨 카드를 그리고 :value와 @input으로 한글 검색어를 실시간 반영했습니다. 카드 클릭 상태바와 @click.stop 상세보기를 만들고 광주와 울산 그리고 체감온도 습도 풍속 필드를 추가했습니다.

[과제 2 Weather Composition](https://github.com/NohYeongO/skala-vue/pull/2)
검색 필터를 computed로 만들고 watch와 watchEffect로 상태 변화를 콘솔에 남겼습니다. 즐겨찾기 상태와 favoriteCount computed 그리고 deep watch를 직접 추가했습니다.

[과제 3 Weather Component](https://github.com/NohYeongO/skala-vue/pull/3)
기능 변경 없이 WeatherParent BaseDashboardCard SearchBar WeatherCard로 나누고 props와 emits로 연결했습니다. 체감온도 습도 풍속 목록은 WeatherDetailList로 한 번 더 분리했습니다.

[과제 4 Weather Router](https://github.com/NohYeongO/skala-vue/pull/4)
지연 로딩 라우트와 Catch all을 설정하고 대시보드 상세 소개 관광지 날씨 페이지로 나눴습니다. 이 과제부터 교재 폴더 트리에 맞춰 정리했습니다.

[과제 5 Weather Store](https://github.com/NohYeongO/skala-vue/pull/5)
configStore로 섭씨 화씨 단위를 전역에서 바꾸고 즐겨찾기는 favoriteStore로 옮겨 상세 페이지에서도 토글되게 했습니다.

[과제 6 Weather Axios](https://github.com/NohYeongO/skala-vue/pull/6)
OpenWeatherMap으로 실제 날씨와 대기질을 받고 한국관광공사 TourAPI로 관광지를 받아 관광지마다 그 자리의 날씨를 붙였습니다. 키는 .env 환경 변수로 관리합니다.

[과제 7 Weather UI Library](https://github.com/NohYeongO/skala-vue/pull/7)
Element Plus를 등록하고 화면 표시 부분을 el 컴포넌트로 바꿨습니다. 로직은 그대로 두었습니다.

[과제 8과 배포 최종 구현](https://github.com/NohYeongO/skala-vue/pull/8)
Leaflet 지도에서 아무 곳이나 눌러 그 자리의 날씨와 근처 관광지를 보고 날씨에 맞는 추천 코스를 받아 관광지 카드로 저장하는 흐름을 만들었습니다. 전국 도시 검색과 날씨별 배경 효과 그리고 과제 기록 페이지를 넣었고 GitHub Pages에 커스텀 도메인으로 배포했습니다.

## 평가 항목으로 보기

기본 문법은 과제 1 2 3에 있습니다. 디렉티브와 Composition API 그리고 컴포넌트 분리를 이 세 PR에서 볼 수 있습니다.

확장 문법은 과제 4 5 6 7과 배포 설정에 있습니다. Router Pinia Axios Element Plus 그리고 GitHub Actions 배포를 해당 PR에서 볼 수 있습니다.

앱 완성도는 과제 8 PR과 배포된 앱에서 볼 수 있습니다. 지도 추천 코스 관광지 카드 과제 기록 페이지가 여기에 해당합니다.

## 트러블슈팅

개발 중 막혔던 내용은 배포된 앱의 소개 탭과 과제 8 PR에 정리해 두었습니다. 즐겨찾기 id가 달라 카드 별이 안 켜지던 문제와 el-tag 잔상 그리고 TourAPI 빈 결과 처리와 이미지 CORS 그리고 한글 도시명 Geocoding과 Leaflet 마커 크기 문제를 다뤘습니다.
