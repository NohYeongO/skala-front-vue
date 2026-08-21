<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore } from '@/stores/configStore'
import { cityList } from '@/stores/weatherStore'
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

const courseTypes = {
  outdoor: { label: '야외 코스', contentTypeId: 12, emoji: '🏞️' },
  indoor: { label: '실내 코스', contentTypeId: 14, emoji: '🏛️' },
}

const weatherEmojis = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
}

const customPoint = ref(null)
const selectedCityId = ref(cityList[0].id)
const weather = ref(null)
const courseType = ref('outdoor')
const recommendedType = ref('outdoor')
const reason = ref('')
const courseList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const cardSpot = ref(null)
const showSpotCard = ref(false)

const cityOptions = computed(() => {
  if (customPoint.value) {
    return [{ id: 'custom', name: `📍 ${customPoint.value.name}` }, ...cityList]
  }
  return cityList
})

const selectedCity = computed(() =>
  cityOptions.value.find((city) => city.id === selectedCityId.value),
)

const weatherUrl = computed(() => {
  if (selectedCityId.value === 'custom') {
    return `${BASE_URL}/weather?lat=${customPoint.value.lat}&lon=${customPoint.value.lon}&appid=${API_KEY}&units=metric&lang=kr`
  }
  return `${BASE_URL}/weather?q=${selectedCity.value.english}&appid=${API_KEY}&units=metric&lang=kr`
})

const skyClass = computed(() => {
  if (!weather.value) {
    return 'sky-default'
  }
  return 'sky-' + skyThemeOf(weather.value.main, weather.value.temp)
})

const displayTemp = computed(() => {
  if (!weather.value) {
    return ''
  }
  if (configStore.unit === 'fahrenheit') {
    return Math.round((weather.value.temp * 9) / 5 + 32)
  }
  return weather.value.temp
})

const decideCourse = (data) => {
  if (['Rain', 'Drizzle', 'Thunderstorm', 'Snow'].includes(data.main)) {
    return { type: 'indoor', reason: `${data.status} 예보라 실내 코스를 추천해요` }
  }
  if (data.temp >= 30) {
    return { type: 'indoor', reason: `기온이 ${data.temp}℃로 더워서 실내 코스를 추천해요` }
  }
  if (data.aqi >= 4) {
    return { type: 'indoor', reason: '미세먼지가 나빠서 실내 코스를 추천해요' }
  }
  return {
    type: 'outdoor',
    reason: `${data.status}에 ${data.temp}℃, 야외 코스 다니기 좋은 날이에요`,
  }
}

const fetchCourse = async (type) => {
  const { lat, lon } = weather.value
  const response = await axios.get(
    `${TOUR_BASE_URL}/locationBasedList2?serviceKey=${TOUR_API_KEY}&MobileOS=ETC&MobileApp=SkalaWeather&_type=json&mapX=${lon}&mapY=${lat}&radius=10000&contentTypeId=${courseTypes[type].contentTypeId}&arrange=E&numOfRows=5&pageNo=1`,
  )
  const body = response.data.response.body
  const items = body.items && body.items.item ? body.items.item : []
  courseList.value = items.map((item) => ({
    id: item.contentid,
    name: item.title,
    address: item.addr1,
    image: item.firstimage,
    distance: Math.round(item.dist / 100) / 10,
  }))
}

const fetchPlan = async () => {
  isLoading.value = true
  errorMessage.value = ''
  courseList.value = []
  try {
    const weatherResponse = await axios.get(weatherUrl.value)
    const raw = weatherResponse.data
    if (selectedCityId.value === 'custom') {
      customPoint.value.name = raw.name || '선택한 위치'
    }
    const airResponse = await axios.get(
      `${BASE_URL}/air_pollution?lat=${raw.coord.lat}&lon=${raw.coord.lon}&appid=${API_KEY}`,
    )
    weather.value = {
      temp: Math.round(raw.main.temp),
      status: raw.weather[0].description,
      main: raw.weather[0].main,
      emoji: weatherEmojis[raw.weather[0].main] || '🌫️',
      humidity: raw.main.humidity,
      windSpeed: raw.wind.speed,
      aqi: airResponse.data.list[0].main.aqi,
      lat: raw.coord.lat,
      lon: raw.coord.lon,
    }
    applySkyTheme(weather.value.main, weather.value.temp)
    const decision = decideCourse(weather.value)
    recommendedType.value = decision.type
    courseType.value = decision.type
    reason.value = decision.reason
    await fetchCourse(courseType.value)
    if (courseList.value.length === 0 && courseType.value === 'indoor') {
      courseType.value = 'outdoor'
      reason.value = `${decision.reason} (근처에 실내 장소가 없어 야외 코스로 보여드려요)`
      await fetchCourse('outdoor')
    }
    if (selectedCityId.value === 'custom' && courseList.value.length) {
      customPoint.value.name = courseList.value[0].address.split(' ').slice(0, 2).join(' ')
    }
  } catch (error) {
    console.error('여행 코스 API 호출 실패:', error)
    errorMessage.value = '여행 코스를 만들지 못했습니다. API Key와 네트워크를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

const changeCourseType = async (type) => {
  courseType.value = type
  isLoading.value = true
  errorMessage.value = ''
  try {
    await fetchCourse(type)
  } catch (error) {
    console.error('여행 코스 API 호출 실패:', error)
    errorMessage.value = '여행 코스를 만들지 못했습니다. API Key와 네트워크를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

const openSpotCard = (spot) => {
  cardSpot.value = spot
  showSpotCard.value = true
}

const goSpotDetail = (spot) => {
  router.push('/spot/' + spot.id)
}

onMounted(() => {
  const queryCity = cityList.find((city) => city.id === route.query.city)
  if (route.query.lat && route.query.lon) {
    customPoint.value = {
      lat: Number(route.query.lat),
      lon: Number(route.query.lon),
      name: '지도에서 고른 위치',
    }
    selectedCityId.value = 'custom'
  } else if (queryCity && queryCity.id !== selectedCityId.value) {
    selectedCityId.value = queryCity.id
  } else {
    fetchPlan()
  }
})

watch(selectedCityId, () => {
  fetchPlan()
})
</script>

<template>
  <div class="plan-wrapper">
    <section class="hero" :class="skyClass">
      <div class="hero-head">
        <h2>🧭 오늘의 여행 코스</h2>
        <el-select v-model="selectedCityId" size="large" class="city-select">
          <el-option
            v-for="city in cityOptions"
            :key="city.id"
            :label="city.name"
            :value="city.id"
          />
        </el-select>
      </div>

      <div v-if="weather" class="hero-weather">
        <span class="hero-emoji">{{ weather.emoji }}</span>
        <div class="hero-temp">
          <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
          <span>{{ weather.status }}</span>
        </div>
        <div class="hero-meta">
          <span>💧 {{ weather.humidity }}%</span>
          <span>💨 {{ weather.windSpeed }}m/s</span>
          <span>🌫️ 대기질 {{ weather.aqi }}/5</span>
        </div>
      </div>

      <p v-if="reason" class="hero-reason">{{ reason }}</p>

      <div v-if="weather" class="hero-switch">
        <el-radio-group :model-value="courseType" size="small" @change="changeCourseType">
          <el-radio-button value="outdoor">🏞️ 야외 코스</el-radio-button>
          <el-radio-button value="indoor">🏛️ 실내 코스</el-radio-button>
        </el-radio-group>
        <el-tag
          v-if="courseType === recommendedType"
          type="success"
          effect="dark"
          size="small"
          round
          disable-transitions
        >
          추천 코스
        </el-tag>
      </div>
    </section>

    <section v-loading="isLoading" class="course-area">
      <el-alert v-if="errorMessage" type="error" :title="errorMessage" :closable="false" />
      <template v-else-if="courseList.length">
        <h3>
          {{ courseTypes[courseType].emoji }} {{ selectedCity.name }}
          {{ courseTypes[courseType].label }}
        </h3>
        <el-timeline>
          <el-timeline-item
            v-for="(spot, index) in courseList"
            :key="spot.id"
            :timestamp="`${index + 1}번째 · ${selectedCityId === 'custom' ? '선택 위치' : '도심'}에서 ${spot.distance}km`"
            placement="top"
            type="primary"
            :hollow="index !== 0"
          >
            <el-card shadow="hover" class="course-card">
              <div class="course-body">
                <el-image
                  :src="spot.image || noImage"
                  :alt="spot.name"
                  class="course-image"
                  fit="cover"
                />
                <div class="course-info">
                  <h4>{{ spot.name }}</h4>
                  <p class="course-address">📍 {{ spot.address }}</p>
                  <div class="course-actions">
                    <el-button size="small" type="primary" plain round @click="goSpotDetail(spot)">
                      상세보기
                    </el-button>
                    <el-button size="small" type="success" plain round @click="openSpotCard(spot)">
                      🏞️ 관광지 카드 만들기
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </template>
      <el-empty
        v-else-if="!isLoading"
        :description="`근처에서 ${courseTypes[courseType].label}로 만들 장소를 찾지 못했어요. 다른 코스로 바꿔 보세요.`"
      />
    </section>

    <SpotCardDialog
      :show="showSpotCard"
      :spot="cardSpot"
      :city-name="selectedCity.name"
      :weather="weather"
      @close="showSpotCard = false"
    />
  </div>
</template>

<style scoped>
.plan-wrapper {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}
.hero {
  border-radius: 32px 32px 32px 8px;
  padding: 24px 26px;
  color: #fff;
  margin-bottom: 18px;
  box-shadow: 0 12px 30px rgba(14, 165, 233, 0.25);
}
.sky-default {
  background: linear-gradient(135deg, #7dd3fc, #38bdf8);
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
.hero-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.hero-head h2 {
  font-size: 1.5rem;
  font-weight: 700;
}
.city-select {
  width: 170px;
}
.hero-weather {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 18px;
}
.hero-emoji {
  font-size: 3.2rem;
}
.hero-temp {
  display: flex;
  flex-direction: column;
}
.hero-temp strong {
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1;
}
.hero-temp span {
  font-size: 1.05rem;
  opacity: 0.95;
}
.hero-meta {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  opacity: 0.95;
  text-align: right;
}
.hero-reason {
  margin-top: 14px;
  font-size: 1rem;
  font-weight: 600;
}
.hero-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
.course-area {
  min-height: 120px;
}
.course-area h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 14px;
}
.course-card {
  border-radius: 12px;
}
.course-body {
  display: flex;
  gap: 14px;
}
.course-image {
  width: 88px;
  height: 88px;
  border-radius: 10px;
  flex-shrink: 0;
}
.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.course-info h4 {
  font-size: 1.05rem;
  font-weight: 600;
}
.course-address {
  font-size: 13px;
  color: #64748b;
}
.course-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.course-actions .el-button + .el-button {
  margin-left: 0;
}
@media (max-width: 600px) {
  .hero {
    padding: 18px;
    border-radius: 24px 24px 24px 8px;
  }
  .hero-head {
    flex-wrap: wrap;
  }
  .hero-weather {
    flex-wrap: wrap;
  }
  .hero-meta {
    margin-left: 0;
    flex-direction: row;
    gap: 10px;
    text-align: left;
  }
  .course-body {
    flex-direction: column;
  }
  .course-image {
    width: 100%;
    height: 140px;
  }
}
</style>
