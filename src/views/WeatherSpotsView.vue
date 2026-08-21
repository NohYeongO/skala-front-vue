<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore } from '@/stores/configStore'
import { cityList } from '@/stores/weatherStore'
import { applySkyTheme } from '@/composables/useSkyTheme'
import noImage from '@/assets/no-image.svg'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const TOUR_API_KEY = import.meta.env.VITE_TOUR_API_KEY
const TOUR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2'

const basePoint = ref(null)
const baseWeather = ref(null)
const spotList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const fetchSpots = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const weatherUrl = basePoint.value.english
      ? `${BASE_URL}/weather?q=${basePoint.value.english}&appid=${API_KEY}&units=metric&lang=kr`
      : `${BASE_URL}/weather?lat=${basePoint.value.lat}&lon=${basePoint.value.lon}&appid=${API_KEY}&units=metric&lang=kr`
    const weatherResponse = await axios.get(weatherUrl)
    const raw = weatherResponse.data
    basePoint.value.lat = raw.coord.lat
    basePoint.value.lon = raw.coord.lon
    baseWeather.value = {
      temp: Math.round(raw.main.temp),
      status: raw.weather[0].description,
      main: raw.weather[0].main,
      icon: raw.weather[0].icon,
    }
    applySkyTheme(baseWeather.value.main, baseWeather.value.temp)

    const tourResponse = await axios.get(
      `${TOUR_BASE_URL}/locationBasedList2?serviceKey=${TOUR_API_KEY}&MobileOS=ETC&MobileApp=SkalaWeather&_type=json&mapX=${basePoint.value.lon}&mapY=${basePoint.value.lat}&radius=10000&contentTypeId=12&arrange=E&numOfRows=20&pageNo=1`,
    )
    const body = tourResponse.data.response.body
    const items = body.items && body.items.item ? body.items.item : []

    const weatherRequests = items.map((item) =>
      axios.get(
        `${BASE_URL}/weather?lat=${item.mapy}&lon=${item.mapx}&appid=${API_KEY}&units=metric&lang=kr`,
      ),
    )
    const weatherResponses = await axios.all(weatherRequests)

    spotList.value = items.map((item, index) => ({
      id: item.contentid,
      name: item.title,
      address: item.addr1,
      image: item.firstimage,
      distance: Math.round(item.dist / 100) / 10,
      temp: Math.round(weatherResponses[index].data.main.temp),
      status: weatherResponses[index].data.weather[0].description,
      icon: weatherResponses[index].data.weather[0].icon,
    }))
  } catch (error) {
    console.error('관광지 API 호출 실패:', error)
    errorMessage.value = '관광지 데이터를 가져오지 못했습니다. API Key와 네트워크를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (route.query.lat && route.query.lon) {
    basePoint.value = {
      name: route.query.name || '지도에서 고른 위치',
      lat: Number(route.query.lat),
      lon: Number(route.query.lon),
    }
    fetchSpots()
    return
  }
  const targetCity = cityList.find((city) => city.id === route.params.cityId)
  if (targetCity) {
    basePoint.value = { name: targetCity.name, english: targetCity.english }
    fetchSpots()
  }
})

const convertTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const goBack = () => {
  router.back()
}

const goSpotDetail = (spot) => {
  router.push('/spot/' + spot.id)
}
</script>

<template>
  <div class="spots-wrapper">
    <h2>🏞️ 관광지 날씨</h2>

    <div v-loading="isLoading" class="spot-area">
      <el-alert v-if="errorMessage" type="error" :title="errorMessage" :closable="false" />
      <template v-else-if="basePoint">
        <div v-if="baseWeather" class="base-card fade-up">
          <img
            :src="`https://openweathermap.org/img/wn/${baseWeather.icon}@2x.png`"
            :alt="baseWeather.status"
            class="base-icon"
          />
          <div>
            <p class="base-name">📍 {{ basePoint.name }} 기준</p>
            <strong
              >{{ convertTemp(baseWeather.temp) }}{{ configStore.unitSymbol }}
              {{ baseWeather.status }}</strong
            >
            <p class="subtitle">
              반경 10km 관광지 {{ spotList.length }}곳 · 관광지마다 그 자리의 날씨를 보여줘요
            </p>
          </div>
        </div>
        <el-card v-for="spot in spotList" :key="spot.id" class="spot-card fade-up" shadow="hover">
          <div class="spot-body">
            <el-image
              :src="spot.image || noImage"
              :alt="spot.name"
              class="spot-image"
              fit="cover"
            />
            <div class="spot-info">
              <h3>{{ spot.name }}</h3>
              <p class="address">{{ spot.address }}</p>
              <p class="distance">기준점에서 {{ spot.distance }}km</p>
              <el-button
                size="small"
                type="primary"
                plain
                round
                class="btn-detail"
                @click="goSpotDetail(spot)"
              >
                상세보기
              </el-button>
            </div>
            <div class="spot-weather">
              <img :src="`https://openweathermap.org/img/wn/${spot.icon}.png`" :alt="spot.status" />
              <strong>{{ convertTemp(spot.temp) }}{{ configStore.unitSymbol }}</strong>
              <span>{{ spot.status }}</span>
            </div>
          </div>
        </el-card>
        <el-empty
          v-if="!isLoading && spotList.length === 0"
          description="반경 10km 안에서 관광지를 찾지 못했어요."
        />
      </template>
      <el-empty
        v-else-if="!isLoading"
        description="😭 기준 위치 정보가 없습니다. 지도나 상세 페이지에서 들어와 주세요."
      />
    </div>

    <div class="actions">
      <el-button type="primary" @click="goBack">← 이전으로</el-button>
      <RouterLink to="/" class="link-home">메인 대시보드</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.spots-wrapper {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}
.spots-wrapper h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 16px;
}
.spot-area {
  min-height: 80px;
}
.base-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  margin-bottom: 14px;
  border-radius: 26px 26px 26px 8px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
}
.base-icon {
  width: 64px;
  height: 64px;
}
.base-name {
  font-size: 13px;
  color: var(--ink-500);
}
.base-card strong {
  font-size: 1.25rem;
  font-weight: 800;
}
.subtitle {
  color: var(--ink-500);
  font-size: 13px;
}
.spot-card {
  margin-bottom: 10px;
}
.spot-body {
  display: flex;
  align-items: center;
  gap: 14px;
}
.spot-image {
  width: 84px;
  height: 84px;
  border-radius: 18px;
  flex-shrink: 0;
}
.spot-info {
  flex: 1;
  min-width: 0;
}
.spot-info h3 {
  font-size: 1.05rem;
  font-weight: 700;
}
.address {
  font-size: 13px;
  color: var(--ink-500);
  margin-top: 4px;
}
.distance {
  margin-top: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sky-600);
}
.btn-detail {
  margin-top: 8px;
}
.spot-weather {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
}
.spot-weather img {
  width: 40px;
  height: 40px;
  margin-bottom: -6px;
}
.spot-weather strong {
  font-size: 1.15rem;
  font-weight: 800;
}
.spot-weather span {
  font-size: 12px;
  color: var(--ink-500);
}
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}
.link-home {
  font-size: 14px;
  color: var(--ink-500);
  text-decoration: none;
}
.link-home:hover {
  color: var(--sky-600);
}
</style>
