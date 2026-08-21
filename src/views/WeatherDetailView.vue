<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { cityList } from '@/stores/weatherStore'
import { applySkyTheme, skyThemeOf } from '@/composables/useSkyTheme'
import WeatherDetailList from '@/components/exercise/WeatherDetailList.vue'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

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
    const weatherUrl = targetCity.english
      ? `${BASE_URL}/weather?q=${targetCity.english}&appid=${API_KEY}&units=metric&lang=kr`
      : `${BASE_URL}/weather?lat=${targetCity.lat}&lon=${targetCity.lon}&appid=${API_KEY}&units=metric&lang=kr`
    const weatherResponse = await axios.get(weatherUrl)
    const raw = weatherResponse.data
    cityData.value = {
      name: targetCity.name,
      region: targetCity.region,
      temp: Math.round(raw.main.temp),
      tempMin: Math.round(raw.main.temp_min),
      tempMax: Math.round(raw.main.temp_max),
      status: raw.weather[0].description,
      main: raw.weather[0].main,
      icon: raw.weather[0].icon,
      feelsLike: Math.round(raw.main.feels_like),
      humidity: raw.main.humidity,
      windSpeed: raw.wind.speed,
    }
    applySkyTheme(cityData.value.main, cityData.value.temp)

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

const favoriteKey = computed(() => route.query.id || route.params.cityId)

onMounted(() => {
  if (route.params.cityId === 'search' && route.query.lat && route.query.lon) {
    fetchCityDetail({
      name: route.query.name || '검색한 도시',
      region: route.query.region || '',
      lat: route.query.lat,
      lon: route.query.lon,
    })
    return
  }
  const targetCity = cityList.find((city) => city.id === route.params.cityId)
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

const heroClass = computed(() => 'sky-' + skyThemeOf(cityData.value.main, cityData.value.temp))

const displayTemp = computed(() => convertTemp(cityData.value.temp))
const displayTempMin = computed(() => convertTemp(cityData.value.tempMin))
const displayTempMax = computed(() => convertTemp(cityData.value.tempMax))

const goHome = () => {
  router.push('/')
}

const goPlan = () => {
  if (route.params.cityId === 'search') {
    router.push(`/plan?lat=${route.query.lat}&lon=${route.query.lon}`)
    return
  }
  router.push('/plan?city=' + route.params.cityId)
}
</script>

<template>
  <div class="detail-wrapper">
    <h2>📊 지역별 상세 기상관측 정보</h2>

    <div v-loading="isLoading" class="detail-area">
      <el-alert v-if="errorMessage" type="error" :title="errorMessage" :closable="false" />
      <div v-else-if="cityData" class="detail-hero fade-up" :class="heroClass">
        <div class="detail-head">
          <el-button
            link
            class="btn-favorite"
            :class="{ active: favoriteStore.favoriteIds.includes(favoriteKey) }"
            @click="favoriteStore.toggleFavorite(favoriteKey)"
          >
            ★
          </el-button>
          <h3>{{ cityData.name }}</h3>
          <span class="region">{{ cityData.region }}</span>
        </div>
        <div class="detail-main">
          <img
            :src="`https://openweathermap.org/img/wn/${cityData.icon}@4x.png`"
            :alt="cityData.status"
            class="detail-icon"
          />
          <div>
            <p class="temp">
              {{ displayTemp }}<small>{{ configStore.unitSymbol }}</small>
            </p>
            <p class="status">{{ cityData.status }}</p>
            <p class="range">
              최저 {{ displayTempMin }}{{ configStore.unitSymbol }} · 최고 {{ displayTempMax
              }}{{ configStore.unitSymbol }}
            </p>
          </div>
        </div>
        <div class="detail-glass">
          <WeatherDetailList :city="cityData" />
          <p v-if="airData" class="air">
            🌫️ 대기질
            <el-tag :type="aqiTypes[airData.aqi]" size="small" round effect="dark">{{
              aqiLabels[airData.aqi]
            }}</el-tag>
            PM2.5 {{ airData.pm25 }} · PM10 {{ airData.pm10 }} ㎍/㎥
          </p>
        </div>
      </div>
      <el-empty
        v-else-if="!isLoading"
        :description="`😭 ${route.params.cityId}에 해당하는 도시 정보가 없습니다.`"
      />
    </div>

    <div class="actions">
      <el-button type="primary" @click="goHome">← 메인 대시보드로 돌아가기</el-button>
      <el-button v-if="cityData" type="success" plain @click="goPlan">🧭 추천 코스 보기</el-button>
    </div>
  </div>
</template>

<style scoped>
.detail-wrapper {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}
.detail-wrapper h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 16px;
}
.detail-area {
  min-height: 80px;
  margin-bottom: 16px;
}
.detail-hero {
  border-radius: 32px 32px 32px 8px;
  padding: 26px 28px;
  color: #fff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
}
.sky-clear {
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 55%, #22d3ee 100%);
}
.sky-clouds {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 60%, #7dd3fc 100%);
}
.sky-rain {
  background: linear-gradient(135deg, #475569 0%, #1e3a8a 60%, #0f172a 100%);
}
.sky-snow {
  background: linear-gradient(135deg, #bae6fd 0%, #e0f2fe 60%, #f8fafc 100%);
  color: #1e293b;
}
.sky-hot {
  background: linear-gradient(135deg, #f97316 0%, #fb7185 60%, #f43f5e 100%);
}
.detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.detail-head h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: inherit;
}
.btn-favorite {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.55);
}
.btn-favorite.active {
  color: #fbbf24;
}
.region {
  font-size: 14px;
  opacity: 0.85;
}
.detail-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.detail-icon {
  width: 120px;
  height: 120px;
  margin: -14px -10px -14px -18px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}
.temp {
  font-size: 3.4rem;
  font-weight: 800;
  line-height: 1;
}
.temp small {
  font-size: 1.2rem;
  font-weight: 600;
  margin-left: 2px;
  opacity: 0.85;
}
.status {
  font-size: 1.15rem;
  margin-top: 4px;
}
.range {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}
.detail-glass {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
}
.detail-glass :deep(.el-descriptions__body),
.detail-glass :deep(.el-descriptions__table),
.detail-glass :deep(.el-descriptions__cell),
.detail-glass :deep(.el-descriptions__label),
.detail-glass :deep(.el-descriptions__content) {
  color: inherit;
  background: transparent;
}
.detail-glass :deep(.el-descriptions__label) {
  opacity: 0.85;
}
.air {
  margin-top: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
@media (max-width: 600px) {
  .detail-hero {
    padding: 18px;
  }
  .detail-main {
    flex-wrap: wrap;
  }
  .detail-icon {
    width: 90px;
    height: 90px;
  }
  .temp {
    font-size: 2.6rem;
  }
}
</style>
