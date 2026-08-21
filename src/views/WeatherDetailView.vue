<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import WeatherDetailList from '@/components/exercise/WeatherDetailList.vue'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

const cityMapping = {
  city_01: { name: '서울', region: '서울특별시', english: 'Seoul' },
  city_02: { name: '수원', region: '경기도 수원시', english: 'Suwon' },
  city_03: { name: '부산', region: '부산광역시', english: 'Busan' },
  city_04: { name: '광주', region: '광주광역시', english: 'Gwangju' },
  city_05: { name: '울산', region: '울산광역시', english: 'Ulsan' },
}

const aqiLabels = ['', '좋음', '양호', '보통', '나쁨', '매우 나쁨']

const cityData = ref(null)
const airData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const fetchCityDetail = async (targetCity) => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const weatherResponse = await axios.get(
      `${BASE_URL}/weather?q=${targetCity.english}&appid=${API_KEY}&units=metric&lang=kr`,
    )
    const raw = weatherResponse.data
    cityData.value = {
      name: targetCity.name,
      region: targetCity.region,
      temp: Math.round(raw.main.temp),
      tempMin: Math.round(raw.main.temp_min),
      tempMax: Math.round(raw.main.temp_max),
      status: raw.weather[0].description,
      feelsLike: Math.round(raw.main.feels_like),
      humidity: raw.main.humidity,
      windSpeed: raw.wind.speed,
    }

    const airResponse = await axios.get(
      `${BASE_URL}/air_pollution?lat=${raw.coord.lat}&lon=${raw.coord.lon}&appid=${API_KEY}`,
    )
    const air = airResponse.data.list[0]
    airData.value = {
      aqi: air.main.aqi,
      pm25: Math.round(air.components.pm2_5),
      pm10: Math.round(air.components.pm10),
    }
  } catch (error) {
    console.error('상세 날씨 API 호출 실패:', error)
    errorMessage.value = '상세 날씨 데이터를 가져오지 못했습니다. API Key와 네트워크를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const targetCity = cityMapping[route.params.cityId]
  if (targetCity) {
    fetchCityDetail(targetCity)
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

    <p v-if="isLoading" class="loading">⏳ 상세 날씨 데이터를 불러오는 중...</p>
    <div v-else-if="errorMessage" class="detail-card">
      <p class="no-data">{{ errorMessage }}</p>
    </div>
    <div v-else-if="cityData" class="detail-card">
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
      <p v-if="airData" class="air">
        🌫️ 대기질:
        <strong :class="'aqi-' + airData.aqi">{{ aqiLabels[airData.aqi] }}</strong> (PM2.5
        {{ airData.pm25 }} / PM10 {{ airData.pm10 }} ㎍/㎥)
      </p>
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
.air {
  margin-top: 10px;
  font-size: 14px;
  color: #495057;
}
.aqi-1 {
  color: #2e7d32;
}
.aqi-2 {
  color: #42b883;
}
.aqi-3 {
  color: #f39c12;
}
.aqi-4 {
  color: #e67e22;
}
.aqi-5 {
  color: #e74c3c;
}
.loading {
  text-align: center;
  color: #495057;
  padding: 10px 0;
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
