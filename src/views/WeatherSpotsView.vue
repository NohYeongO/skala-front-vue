<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const mockSpots = {
  city_01: {
    cityName: '서울',
    spots: [
      {
        id: 'spot_01',
        name: '경복궁',
        category: '문화유산',
        address: '종로구 사직로 161',
        temp: 28,
        status: '맑음',
      },
      {
        id: 'spot_02',
        name: '남산서울타워',
        category: '전망',
        address: '용산구 남산공원길 105',
        temp: 26,
        status: '맑음',
      },
      {
        id: 'spot_03',
        name: '여의도 한강공원',
        category: '공원',
        address: '영등포구 여의동로 330',
        temp: 29,
        status: '구름 조금',
      },
    ],
  },
  city_02: {
    cityName: '수원',
    spots: [
      {
        id: 'spot_04',
        name: '수원화성',
        category: '문화유산',
        address: '팔달구 정조로 825',
        temp: 24,
        status: '비',
      },
      {
        id: 'spot_05',
        name: '광교호수공원',
        category: '공원',
        address: '영통구 광교호수로 102',
        temp: 23,
        status: '비',
      },
      {
        id: 'spot_06',
        name: '행궁동 벽화마을',
        category: '거리',
        address: '팔달구 화서문로 16번길',
        temp: 24,
        status: '흐림',
      },
    ],
  },
  city_03: {
    cityName: '부산',
    spots: [
      {
        id: 'spot_07',
        name: '해운대해수욕장',
        category: '해변',
        address: '해운대구 우동',
        temp: 27,
        status: '구름',
      },
      {
        id: 'spot_08',
        name: '감천문화마을',
        category: '마을',
        address: '사하구 감내2로 203',
        temp: 26,
        status: '구름',
      },
      {
        id: 'spot_09',
        name: '광안리해수욕장',
        category: '해변',
        address: '수영구 광안해변로 219',
        temp: 27,
        status: '맑음',
      },
    ],
  },
  city_04: {
    cityName: '광주',
    spots: [
      {
        id: 'spot_10',
        name: '무등산국립공원',
        category: '자연',
        address: '북구 무등로 1550',
        temp: 25,
        status: '맑음',
      },
      {
        id: 'spot_11',
        name: '양림동 역사문화마을',
        category: '마을',
        address: '남구 양림동',
        temp: 29,
        status: '맑음',
      },
      {
        id: 'spot_12',
        name: '국립아시아문화전당',
        category: '문화',
        address: '동구 문화전당로 38',
        temp: 30,
        status: '맑음',
      },
    ],
  },
  city_05: {
    cityName: '울산',
    spots: [
      {
        id: 'spot_13',
        name: '대왕암공원',
        category: '자연',
        address: '동구 등대로 95',
        temp: 22,
        status: '흐림',
      },
      {
        id: 'spot_14',
        name: '태화강 국가정원',
        category: '공원',
        address: '중구 태화강국가정원길 154',
        temp: 23,
        status: '흐림',
      },
      {
        id: 'spot_15',
        name: '간절곶',
        category: '해변',
        address: '울주군 서생면 대송리',
        temp: 22,
        status: '구름',
      },
    ],
  },
}

const spotData = ref(null)

onMounted(() => {
  const cityId = route.params.cityId
  if (mockSpots[cityId]) {
    spotData.value = mockSpots[cityId]
  }
})

const goDetail = () => {
  router.push('/weather/' + route.params.cityId)
}
</script>

<template>
  <div class="spots-wrapper">
    <h2>🏞️ 관광지 날씨</h2>

    <div v-if="spotData">
      <p class="subtitle">{{ spotData.cityName }} 주요 관광지의 현재 날씨입니다.</p>
      <div v-for="spot in spotData.spots" :key="spot.id" class="spot-card">
        <div class="spot-head">
          <h3>{{ spot.name }}</h3>
          <span class="category">{{ spot.category }}</span>
        </div>
        <p class="address">📍 {{ spot.address }}</p>
        <p class="weather">🌡️ {{ spot.temp }}°C · {{ spot.status }}</p>
      </div>
    </div>
    <div v-else class="spot-card">
      <p class="no-data">😭 "{{ route.params.cityId }}"에 해당하는 관광지 정보가 없습니다.</p>
    </div>

    <div class="actions">
      <button class="btn-back" @click="goDetail">← 상세 정보로 돌아가기</button>
      <RouterLink to="/" class="link-home">메인 대시보드</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.spots-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.spots-wrapper h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}
.subtitle {
  color: #495057;
  margin-bottom: 12px;
}
.spot-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}
.spot-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.spot-head h3 {
  font-size: 1.1rem;
  font-weight: 600;
}
.category {
  font-size: 12px;
  color: #fff;
  background-color: #42b883;
  padding: 2px 8px;
  border-radius: 4px;
}
.address {
  font-size: 14px;
  color: #868e96;
  margin-top: 6px;
}
.weather {
  margin-top: 4px;
  font-weight: 600;
  color: #2c3e50;
}
.no-data {
  text-align: center;
  color: #e74c3c;
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}
.btn-back {
  padding: 8px 14px;
  font-size: 14px;
  color: #fff;
  background-color: #42b883;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-back:hover {
  background-color: #33a06f;
}
.link-home {
  font-size: 14px;
  color: #7f8c8d;
  text-decoration: none;
}
.link-home:hover {
  color: #2c3e50;
}
</style>
