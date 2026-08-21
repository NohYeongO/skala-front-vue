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
const aqiTypes = ['', 'success', 'success', 'warning', 'danger', 'danger']

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

    <div v-loading="isLoading" class="detail-area">
      <el-alert v-if="errorMessage" type="error" :title="errorMessage" :closable="false" />
      <el-card v-else-if="cityData" shadow="never">
        <div class="detail-head">
          <el-button
            link
            class="btn-favorite"
            :class="{ active: favoriteStore.favoriteIds.includes(route.params.cityId) }"
            @click="favoriteStore.toggleFavorite(route.params.cityId)"
          >
            ★
          </el-button>
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
          <el-tag :type="aqiTypes[airData.aqi]" size="small">{{ aqiLabels[airData.aqi] }}</el-tag>
          (PM2.5 {{ airData.pm25 }} / PM10 {{ airData.pm10 }} ㎍/㎥)
        </p>
      </el-card>
      <el-empty
        v-else-if="!isLoading"
        :description="`😭 ${route.params.cityId}에 해당하는 도시 정보가 없습니다.`"
      />
    </div>

    <div class="actions">
      <el-button type="primary" @click="goHome">← 메인 대시보드로 돌아가기</el-button>
      <el-button v-if="cityData" @click="goSpots">🏞️ 관광지 날씨 보기</el-button>
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
.detail-area {
  min-height: 80px;
  margin-bottom: 15px;
}
.detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-head h3 {
  font-size: 1.3rem;
  font-weight: 700;
}
.btn-favorite {
  font-size: 22px;
  color: #ced4da;
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
.actions {
  display: flex;
  gap: 10px;
}
</style>
