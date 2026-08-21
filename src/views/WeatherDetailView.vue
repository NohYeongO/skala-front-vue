<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import WeatherDetailList from '@/components/exercise/WeatherDetailList.vue'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()

const mockDetails = {
  city_01: {
    name: '서울',
    region: '서울특별시 중구',
    temp: 28,
    tempMin: 22,
    tempMax: 31,
    status: '맑음',
    feelsLike: 30,
    humidity: 55,
    windSpeed: 2.1,
    observedAt: '2026-08-21 14:00',
  },
  city_02: {
    name: '수원',
    region: '경기도 수원시 영통구',
    temp: 24,
    tempMin: 21,
    tempMax: 26,
    status: '비',
    feelsLike: 25,
    humidity: 88,
    windSpeed: 3.4,
    observedAt: '2026-08-21 14:00',
  },
  city_03: {
    name: '부산',
    region: '부산광역시 해운대구',
    temp: 26,
    tempMin: 24,
    tempMax: 29,
    status: '구름',
    feelsLike: 29,
    humidity: 74,
    windSpeed: 5.6,
    observedAt: '2026-08-21 14:00',
  },
  city_04: {
    name: '광주',
    region: '광주광역시 북구',
    temp: 29,
    tempMin: 23,
    tempMax: 32,
    status: '맑음',
    feelsLike: 33,
    humidity: 62,
    windSpeed: 1.8,
    observedAt: '2026-08-21 14:00',
  },
  city_05: {
    name: '울산',
    region: '울산광역시 남구',
    temp: 23,
    tempMin: 21,
    tempMax: 25,
    status: '흐림',
    feelsLike: 23,
    humidity: 79,
    windSpeed: 4.2,
    observedAt: '2026-08-21 14:00',
  },
}

const cityData = ref(null)

onMounted(() => {
  const cityId = route.params.cityId
  if (mockDetails[cityId]) {
    cityData.value = mockDetails[cityId]
  }
})

const convertTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const displayTemp = computed(() => convertTemp(cityData.value.temp))
const displayTempMin = computed(() => convertTemp(cityData.value.tempMin))
const displayTempMax = computed(() => convertTemp(cityData.value.tempMax))

const goHome = () => {
  router.push('/')
}

const goSpots = () => {
  router.push('/weather/' + route.params.cityId + '/spots')
}
</script>

<template>
  <div class="detail-wrapper">
    <h2>📊 지역별 상세 기상관측 정보</h2>

    <div v-if="cityData" class="detail-card">
      <div class="detail-head">
        <button
          class="btn-favorite"
          :class="{ active: favoriteStore.favoriteIds.includes(route.params.cityId) }"
          @click="favoriteStore.toggleFavorite(route.params.cityId)"
        >
          ★
        </button>
        <h3>📍 {{ cityData.name }}</h3>
        <span class="region">{{ cityData.region }}</span>
      </div>
      <p class="temp">{{ displayTemp }}{{ configStore.unitSymbol }}</p>
      <p class="status">{{ cityData.status }}</p>
      <p class="range">
        최저 {{ displayTempMin }}{{ configStore.unitSymbol }} / 최고 {{ displayTempMax
        }}{{ configStore.unitSymbol }}
      </p>
      <WeatherDetailList :city="cityData" />
      <p class="observed">관측 시각: {{ cityData.observedAt }}</p>
    </div>
    <div v-else class="detail-card">
      <p class="no-data">😭 "{{ route.params.cityId }}"에 해당하는 도시 정보가 없습니다.</p>
    </div>

    <div class="actions">
      <button class="btn-home" @click="goHome">← 메인 대시보드로 돌아가기</button>
      <button v-if="cityData" class="btn-spots" @click="goSpots">🏞️ 관광지 날씨 보기</button>
    </div>
  </div>
</template>

<style scoped>
.detail-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.detail-wrapper h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}
.detail-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}
.detail-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.detail-head h3 {
  font-size: 1.3rem;
  font-weight: 700;
}
.btn-favorite {
  padding: 0;
  font-size: 22px;
  line-height: 1;
  color: #ced4da;
  background: none;
  border: none;
  cursor: pointer;
}
.btn-favorite.active {
  color: #f1c40f;
}
.region {
  color: #868e96;
  font-size: 14px;
}
.temp {
  font-size: 2.4rem;
  font-weight: 700;
  margin: 8px 0 0;
}
.status {
  font-size: 1.1rem;
  color: #495057;
}
.range {
  font-size: 14px;
  color: #495057;
  margin: 6px 0;
}
.observed {
  margin-top: 10px;
  font-size: 13px;
  color: #868e96;
}
.no-data {
  text-align: center;
  color: #e74c3c;
}
.actions {
  display: flex;
  gap: 10px;
}
.btn-home {
  padding: 8px 14px;
  font-size: 14px;
  color: #fff;
  background-color: #42b883;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-home:hover {
  background-color: #33a06f;
}
.btn-spots {
  padding: 8px 14px;
  font-size: 14px;
  color: #2c3e50;
  background-color: #f1f3f5;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
}
.btn-spots:hover {
  background-color: #e9ecef;
}
</style>
