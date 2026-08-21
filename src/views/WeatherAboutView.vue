<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const troubleshooting = [
  {
    title: '즐겨찾기 개수는 늘었는데 카드 별이 안 켜짐',
    cause:
      '검색한 도시의 상세 페이지에서 ★를 누르면 좌표 4자리로 키를 만들고 카드 쪽 id는 좌표 3자리라 서로 다른 id로 저장됐습니다.',
    fix: '상세로 이동할 때 도시 id를 쿼리(?id=)로 넘기고 상세에서는 route.query.id를 즐겨찾기 키로 쓰도록 통일했습니다.',
  },
  {
    title: '코스 추천 태그가 안 사라짐',
    cause: 'el-tag를 v-if로 지웠는데 내장 사라짐 애니메이션이 끝나지 않아 잔상이 남았습니다.',
    fix: 'disable-transitions 속성으로 해결했습니다.',
  },
  {
    title: '실내 장소가 없는 곳에서 API 오류 문구',
    cause: 'TourAPI가 결과 0건이면 items를 빈 문자열로 주어 .map에서 예외가 났습니다.',
    fix: '빈 결과를 정상 처리하고 실내 추천인데 0건이면 야외 코스로 자동 전환하도록 했습니다.',
  },
  {
    title: '관광지 사진을 카드 이미지(canvas)에 그릴 수 없음',
    cause: '사진 서버가 CORS 헤더를 주지 않아 html2canvas가 이미지를 읽지 못했습니다.',
    fix: 'CORS를 허용하는 이미지 프록시(images.weserv.nl)를 거쳐 불러오도록 했습니다.',
  },
  {
    title: '"강릉"처럼 단독 이름은 Geocoding 검색이 안 됨',
    cause:
      'OpenWeather Geocoding이 강릉시는 찾지만 강릉은 못 찾고 안동은 중국 단둥이 먼저 나왔습니다.',
    fix: '입력값 → 입력값+시 → 입력값+군 순으로 재시도하고 country가 KR인 결과만 쓰도록 했습니다.',
  },
  {
    title: 'TourAPI areaCode 필터로 검색하면 결과가 비어 있음',
    cause: '행정구역 개편 이후 지역 코드가 맞지 않았습니다.',
    fix: 'areaCode 대신 좌표 기반(locationBasedList2)과 키워드 검색으로 바꿨습니다.',
  },
  {
    title: '지도 기온 마커가 세로로 찌그러짐',
    cause: 'Leaflet divIcon 기본 크기(12×12)가 인라인으로 박혀 내용이 넘쳤습니다.',
    fix: '마커 래퍼의 width/height를 auto로 풀고 width: max-content로 잡았습니다.',
  },
]

const goHome = () => {
  router.push('/')
}

const goHistory = () => {
  router.push('/history')
}
</script>

<template>
  <div class="about-wrapper">
    <h2>ℹ️ 서비스 소개</h2>

    <el-card shadow="never" class="about-card fade-up">
      <p>
        <strong>SKALA Weather</strong>는 Vue 3 과정 실습으로 만든 "날씨로 고르는 오늘의 여행"
        앱입니다.
      </p>
      <ul>
        <li>
          전국 날씨 지도에서 도시 마커나 아무 위치나 눌러 그 자리의 날씨와 근처 관광지를 봅니다.
        </li>
        <li>
          도시 날씨 탭에서 대표 지역을 고르거나 전국 어느 도시든 검색해 카드로 모아 두고 ★
          즐겨찾기합니다.
        </li>
        <li>
          오늘의 날씨(비 · 폭염 · 미세먼지)에 맞춰 야외/실내 추천 코스를 받고 관광지 카드를 이미지로
          저장합니다.
        </li>
        <li>
          Vue Router · Pinia · Axios · Element Plus · Leaflet · html2canvas를 사용했고 OpenWeather와
          한국관광공사 TourAPI를 연동했습니다.
        </li>
      </ul>
    </el-card>

    <el-card shadow="never" class="about-card fade-up">
      <h3>🛠️ 트러블슈팅 기록</h3>
      <el-collapse>
        <el-collapse-item
          v-for="(item, index) in troubleshooting"
          :key="index"
          :title="`${index + 1}. ${item.title}`"
        >
          <p><strong>원인</strong> {{ item.cause }}</p>
          <p><strong>해결</strong> {{ item.fix }}</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <div class="actions">
      <el-button type="primary" @click="goHome">← 메인 대시보드로 돌아가기</el-button>
      <el-button @click="goHistory">📚 과제 기록 보기</el-button>
    </div>
  </div>
</template>

<style scoped>
.about-wrapper {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}
.about-wrapper h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 16px;
}
.about-wrapper h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 10px;
}
.about-card {
  margin-bottom: 15px;
  line-height: 1.7;
}
.about-card ul {
  padding-left: 20px;
  margin-top: 8px;
}
.about-card :deep(.el-collapse) {
  border: none;
}
.about-card :deep(.el-collapse-item__header) {
  font-weight: 600;
  background: transparent;
}
.about-card :deep(.el-collapse-item__wrap) {
  background: transparent;
}
.about-card p strong {
  color: var(--sky-600);
  margin-right: 6px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
