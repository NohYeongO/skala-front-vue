<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useConfigStore } from '@/stores/configStore'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const TOUR_API_KEY = import.meta.env.VITE_TOUR_API_KEY
const TOUR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2'

const cityMapping = {
  city_01: { name: '서울', spots: ['경복궁', '북촌한옥마을', '청계천', '덕수궁', '남산서울타워'] },
  city_02: {
    name: '수원',
    spots: ['화성행궁', '광교호수공원', '행궁동 벽화마을', '방화수류정', '장안문'],
  },
  city_03: {
    name: '부산',
    spots: ['해운대해수욕장', '광안리해수욕장', '감천문화마을', '용두산공원', '태종대'],
  },
  city_04: {
    name: '광주',
    spots: ['무등산국립공원', '광주호 호수생태원', '5·18 민주광장', '펭귄마을', '사직공원'],
  },
  city_05: {
    name: '울산',
    spots: ['대왕암공원', '태화강 국가정원', '간절곶', '울산대공원', '장생포 고래문화마을'],
  },
}

const cityName = ref('')
const spotList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const fetchSpots = async (targetCity) => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const tourRequests = targetCity.spots.map((keyword) =>
      axios.get(
        `${TOUR_BASE_URL}/searchKeyword2?serviceKey=${TOUR_API_KEY}&MobileOS=ETC&MobileApp=SkalaWeather&_type=json&keyword=${keyword}&contentTypeId=12&arrange=A&numOfRows=1&pageNo=1`,
      ),
    )
    const tourResponses = await axios.all(tourRequests)
    const items = tourResponses.map((response) => response.data.response.body.items.item[0])

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
      temp: Math.round(weatherResponses[index].data.main.temp),
      status: weatherResponses[index].data.weather[0].description,
    }))
  } catch (error) {
    console.error('관광지 API 호출 실패:', error)
    errorMessage.value = '관광지 데이터를 가져오지 못했습니다. API Key와 네트워크를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const targetCity = cityMapping[route.params.cityId]
  if (targetCity) {
    cityName.value = targetCity.name
    fetchSpots(targetCity)
  }
})

const convertTemp = (rawTemp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
}

const goDetail = () => {
  router.push('/weather/' + route.params.cityId)
}
</script>

<template>
  <div class="spots-wrapper">
    <h2>🏞️ 관광지 날씨</h2>

    <div v-loading="isLoading" class="spot-area">
      <el-alert v-if="errorMessage" type="error" :title="errorMessage" :closable="false" />
      <template v-else-if="cityName">
        <p class="subtitle">{{ cityName }} 주요 관광지의 현재 날씨입니다.</p>
        <el-card v-for="spot in spotList" :key="spot.id" class="spot-card" shadow="hover">
          <div class="spot-body">
            <el-image
              v-if="spot.image"
              :src="spot.image"
              :alt="spot.name"
              class="spot-image"
              fit="cover"
            />
            <div class="spot-info">
              <h3>{{ spot.name }}</h3>
              <p class="address">📍 {{ spot.address }}</p>
              <p class="weather">
                🌡️ {{ convertTemp(spot.temp) }}{{ configStore.unitSymbol }} · {{ spot.status }}
              </p>
            </div>
          </div>
        </el-card>
      </template>
      <el-empty
        v-else-if="!isLoading"
        :description="`😭 ${route.params.cityId}에 해당하는 도시 정보가 없습니다.`"
      />
    </div>

    <div class="actions">
      <el-button type="primary" @click="goDetail">← 상세 정보로 돌아가기</el-button>
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
.spot-area {
  min-height: 80px;
}
.subtitle {
  color: #495057;
  margin-bottom: 12px;
}
.spot-card {
  margin-bottom: 10px;
}
.spot-body {
  display: flex;
  gap: 14px;
}
.spot-image {
  width: 96px;
  height: 96px;
  border-radius: 6px;
}
.spot-info {
  flex: 1;
}
.spot-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
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
.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
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
