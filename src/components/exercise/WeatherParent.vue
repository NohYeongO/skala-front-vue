<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    feelsLike: 30,
    humidity: 55,
    windSpeed: 2.1,
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 24,
    status: '비',
    feelsLike: 25,
    humidity: 88,
    windSpeed: 3.4,
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    feelsLike: 29,
    humidity: 74,
    windSpeed: 5.6,
  },
  {
    id: 'city_04',
    name: '광주',
    temp: 29,
    status: '맑음',
    feelsLike: 33,
    humidity: 62,
    windSpeed: 1.8,
  },
  {
    id: 'city_05',
    name: '울산',
    temp: 23,
    status: '흐림',
    feelsLike: 23,
    humidity: 79,
    windSpeed: 4.2,
  },
])

const searchQuery = ref('')
const selectedCityInfo = ref('날씨 카드를 클릭하면 선택된 도시가 여기에 표시됩니다.')
const selectedCityId = ref('')
const favoriteIds = ref([])
const showOnlyFavorites = ref(false)

const favoriteCount = computed(() => favoriteIds.value.length)

const filteredWeatherList = computed(() => {
  const query = searchQuery.value
  const baseList = showOnlyFavorites.value
    ? weatherList.value.filter((city) => favoriteIds.value.includes(city.id))
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
  favoriteIds,
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

const toggleFavorite = (cityId) => {
  const index = favoriteIds.value.findIndex((id) => id === cityId)
  if (index === -1) {
    favoriteIds.value.push(cityId)
  } else {
    favoriteIds.value.splice(index, 1)
  }
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <h2>⛅ 날씨 Component</h2>

    <BaseDashboardCard>
      <SearchBar :query="searchQuery" @update-query="updateQuery" />
      <label class="favorite-filter">
        <input type="checkbox" v-model="showOnlyFavorites" />
        ⭐ 즐겨찾기만 보기 ({{ favoriteCount }}개)
      </label>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>
      <WeatherCard
        v-for="city in filteredWeatherList"
        :key="city.id"
        :city="city"
        :is-selected="city.id === selectedCityId"
        :is-favorite="favoriteIds.includes(city.id)"
        @select-card="selectCity"
        @click-detail="showDetail"
        @toggle-favorite="toggleFavorite"
      />

      <p v-if="showOnlyFavorites && favoriteCount === 0" class="no-result">
        ⭐ 즐겨찾기한 도시가 없습니다. 카드의 별을 눌러 추가해 보세요.
      </p>
      <p v-else-if="filteredWeatherList.length === 0" class="no-result">
        😭 검색 결과와 일치하는 도시가 없습니다.
      </p>
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
