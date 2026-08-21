<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore } from '@/stores/configStore'
import { applySkyTheme, skyThemeOf } from '@/composables/useSkyTheme'
import SpotCardDialog from '@/components/exercise/SpotCardDialog.vue'
import noImage from '@/assets/no-image.svg'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const TOUR_API_KEY = import.meta.env.VITE_TOUR_API_KEY
const TOUR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2'

const weatherEmojis = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
}
const aqiLabels = ['', '좋음', '양호', '보통', '나쁨', '매우 나쁨']
const aqiTypes = ['', 'success', 'success', 'warning', 'danger', 'danger']

const spot = ref(null)
const weather = ref(null)
const airData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const showSpotCard = ref(false)

const heroClass = computed(() => 'sky-' + skyThemeOf(weather.value.main, weather.value.temp))

const convertTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const fetchSpotDetail = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const tourResponse = await axios.get(
      `${TOUR_BASE_URL}/detailCommon2?serviceKey=${TOUR_API_KEY}&MobileOS=ETC&MobileApp=SkalaWeather&_type=json&contentId=${route.params.contentId}`,
    )
    const body = tourResponse.data.response.body
    const item = body.items && body.items.item ? body.items.item[0] : null
    if (!item) {
      return
    }
    spot.value = {
      id: item.contentid,
      name: item.title,
      address: item.addr1,
      tel: item.tel,
      homepage: item.homepage,
      overview: item.overview,
      image: item.firstimage,
      lat: Number(item.mapy),
      lon: Number(item.mapx),
    }

    const weatherResponse = await axios.get(
      `${BASE_URL}/weather?lat=${spot.value.lat}&lon=${spot.value.lon}&appid=${API_KEY}&units=metric&lang=kr`,
    )
    const raw = weatherResponse.data
    weather.value = {
      temp: Math.round(raw.main.temp),
      feelsLike: Math.round(raw.main.feels_like),
      status: raw.weather[0].description,
      main: raw.weather[0].main,
      icon: raw.weather[0].icon,
      emoji: weatherEmojis[raw.weather[0].main] || '🌫️',
      humidity: raw.main.humidity,
      windSpeed: raw.wind.speed,
    }
    applySkyTheme(weather.value.main, weather.value.temp)

    const airResponse = await axios.get(
      `${BASE_URL}/air_pollution?lat=${spot.value.lat}&lon=${spot.value.lon}&appid=${API_KEY}`,
    )
    const air = airResponse.data.list[0]
    airData.value = {
      aqi: air.main.aqi,
      pm25: Math.round(air.components.pm2_5),
      pm10: Math.round(air.components.pm10),
    }
  } catch (error) {
    console.error('관광지 상세 API 호출 실패:', error)
    errorMessage.value = '관광지 상세 정보를 가져오지 못했습니다. API Key와 네트워크를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSpotDetail()
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="spot-detail-wrapper">
    <h2>🏞️ 관광지 상세</h2>

    <div v-loading="isLoading" class="spot-detail-area">
      <el-alert v-if="errorMessage" type="error" :title="errorMessage" :closable="false" />
      <template v-else-if="spot && weather">
        <div class="spot-hero fade-up" :class="heroClass">
          <el-image
            :src="spot.image || noImage"
            :alt="spot.name"
            class="spot-hero-image"
            fit="cover"
          />
          <div class="spot-hero-body">
            <h3>{{ spot.name }}</h3>
            <p class="address">📍 {{ spot.address }}</p>
            <div class="spot-hero-weather">
              <img
                :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
                :alt="weather.status"
              />
              <strong
                >{{ convertTemp(weather.temp) }}<small>{{ configStore.unitSymbol }}</small></strong
              >
              <span>{{ weather.status }}</span>
            </div>
            <p class="spot-hero-meta">
              체감 {{ convertTemp(weather.feelsLike) }}{{ configStore.unitSymbol }} · 습도
              {{ weather.humidity }}% · 바람 {{ weather.windSpeed }}m/s
              <template v-if="airData">
                · 대기질
                <el-tag :type="aqiTypes[airData.aqi]" size="small" round effect="dark">
                  {{ aqiLabels[airData.aqi] }}
                </el-tag>
              </template>
            </p>
          </div>
        </div>

        <el-card shadow="never" class="spot-info-card fade-up">
          <h4>소개</h4>
          <p v-if="spot.overview" class="overview" v-html="spot.overview"></p>
          <p v-else class="overview empty">등록된 소개글이 없습니다.</p>
          <el-descriptions :column="1" size="small" class="spot-meta">
            <el-descriptions-item v-if="spot.tel" label="📞 전화">{{
              spot.tel
            }}</el-descriptions-item>
            <el-descriptions-item v-if="spot.homepage" label="🔗 홈페이지">
              <span class="homepage" v-html="spot.homepage"></span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </template>
      <el-empty v-else-if="!isLoading" description="😭 관광지 정보를 찾지 못했습니다." />
    </div>

    <div class="actions">
      <el-button type="primary" @click="goBack">← 이전으로</el-button>
      <el-button v-if="spot && weather" type="success" plain @click="showSpotCard = true"
        >🏞️ 관광지 카드 만들기</el-button
      >
    </div>

    <SpotCardDialog
      :show="showSpotCard"
      :spot="spot"
      :city-name="spot ? spot.address.split(' ')[0] : ''"
      :weather="weather"
      @close="showSpotCard = false"
    />
  </div>
</template>

<style scoped>
.spot-detail-wrapper {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}
.spot-detail-wrapper h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 16px;
}
.spot-detail-area {
  min-height: 80px;
  margin-bottom: 16px;
}
.spot-hero {
  display: flex;
  gap: 18px;
  padding: 18px;
  border-radius: 32px 32px 32px 8px;
  color: #fff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  margin-bottom: 14px;
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
.spot-hero-image {
  width: 180px;
  height: 180px;
  border-radius: 24px;
  flex-shrink: 0;
}
.spot-hero-body {
  flex: 1;
  min-width: 0;
}
.spot-hero-body h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: inherit;
}
.address {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}
.spot-hero-weather {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.spot-hero-weather img {
  width: 56px;
  height: 56px;
  margin: -10px -6px -10px -12px;
}
.spot-hero-weather strong {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.spot-hero-weather small {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.85;
}
.spot-hero-weather span {
  font-size: 1rem;
}
.spot-hero-meta {
  margin-top: 8px;
  font-size: 13px;
  opacity: 0.95;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.spot-info-card h4 {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.overview {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink-700);
}
.overview.empty {
  color: var(--ink-500);
}
.spot-meta {
  margin-top: 12px;
}
.homepage :deep(a) {
  color: var(--sky-600);
}
.actions {
  display: flex;
  gap: 10px;
}
@media (max-width: 600px) {
  .spot-hero {
    flex-direction: column;
  }
  .spot-hero-image {
    width: 100%;
    height: 180px;
  }
}
</style>
