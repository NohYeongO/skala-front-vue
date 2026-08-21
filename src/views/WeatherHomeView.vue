<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useFavoriteStore } from '@/stores/favoriteStore'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

const router = useRouter()
const favoriteStore = useFavoriteStore()

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

const cityList = [
  { id: 'city_01', name: '서울', english: 'Seoul' },
  { id: 'city_02', name: '수원', english: 'Suwon' },
  { id: 'city_03', name: '부산', english: 'Busan' },
  { id: 'city_04', name: '광주', english: 'Gwangju' },
  { id: 'city_05', name: '울산', english: 'Ulsan' },
]

const weatherList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const fetchWeatherList = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const requests = cityList.map((city) =>
      axios.get(`${BASE_URL}/weather?q=${city.english}&appid=${API_KEY}&units=metric&lang=kr`),
    )
    const responses = await axios.all(requests)
    weatherList.value = responses.map((response, index) => ({
      id: cityList[index].id,
      name: cityList[index].name,
      temp: Math.round(response.data.main.temp),
      status: response.data.weather[0].description,
      feelsLike: Math.round(response.data.main.feels_like),
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
    }))
  } catch (error) {
    console.error('날씨 API 호출 실패:', error)
    errorMessage.value = '날씨 데이터를 가져오지 못했습니다. API Key와 네트워크를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchWeatherList()
})

const searchQuery = ref('')
const selectedCityInfo = ref('날씨 카드를 클릭하면 선택된 도시가 여기에 표시됩니다.')
const selectedCityId = ref('')
const showOnlyFavorites = ref(false)

const filteredWeatherList = computed(() => {
  const query = searchQuery.value
  const baseList = showOnlyFavorites.value
    ? weatherList.value.filter((city) => favoriteStore.favoriteIds.includes(city.id))
    : weatherList.value
  if (!query) {
    return baseList
  }
  return baseList.filter((city) => city.name.includes(query))
})

watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(`[watch] 상태바 변경: "${oldInfo}" → "${newInfo}"`)
})

watchEffect(() => {
  console.log(`[watchEffect] 현재 검색어: "${searchQuery.value}"`)
})

watch(
  () => favoriteStore.favoriteIds,
  (newIds) => {
    console.log(`[watch deep] 즐겨찾기 변경: ${newIds.length}개 → [${newIds.join(', ')}]`)
  },
  { deep: true },
)

const updateQuery = (value) => {
  searchQuery.value = value
}

const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

const goDetail = (city) => {
  router.push('/weather/' + city.id)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <h2>🌦️ 날씨 대시보드</h2>

    <BaseDashboardCard>
      <SearchBar :query="searchQuery" @update-query="updateQuery" />
      <label class="favorite-filter">
        <input type="checkbox" v-model="showOnlyFavorites" />
        ⭐ 즐겨찾기만 보기 ({{ favoriteStore.favoriteCount }}개)
      </label>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>
      <p v-if="isLoading" class="loading">⏳ 실시간 날씨 데이터를 불러오는 중...</p>
      <p v-else-if="errorMessage" class="no-result">{{ errorMessage }}</p>
      <template v-else>
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city="city"
          :is-selected="city.id === selectedCityId"
          :is-favorite="favoriteStore.favoriteIds.includes(city.id)"
          @select-card="selectCity"
          @click-detail="goDetail"
          @toggle-favorite="favoriteStore.toggleFavorite"
        />

        <p v-if="showOnlyFavorites && favoriteStore.favoriteCount === 0" class="no-result">
          ⭐ 즐겨찾기한 도시가 없습니다. 카드의 별을 눌러 추가해 보세요.
        </p>
        <p v-else-if="filteredWeatherList.length === 0" class="no-result">
          😭 검색 결과와 일치하는 도시가 없습니다.
        </p>
      </template>
    </BaseDashboardCard>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.dashboard-wrapper h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}
.dashboard-wrapper h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
}
.favorite-filter {
  display: inline-block;
  margin-top: 8px;
  font-size: 14px;
  cursor: pointer;
}
.favorite-filter input {
  width: auto;
  margin-right: 4px;
}
.loading {
  text-align: center;
  color: #495057;
  padding: 10px 0;
}
.no-result {
  text-align: center;
  color: #e74c3c;
  padding: 10px 0;
}
.status-bar {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: bold;
  text-align: center;
  padding: 10px;
  border-radius: 6px;
}
</style>
