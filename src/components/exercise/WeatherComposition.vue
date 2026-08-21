<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

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
  const query = searchQuery.value.trim()
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

const toggleFavorite = (cityId) => {
  const index = favoriteIds.value.findIndex((id) => id === cityId)
  if (index === -1) {
    favoriteIds.value.push(cityId)
  } else {
    favoriteIds.value.splice(index, 1)
  }
}

const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="dashboard-wrapper">
    <h2>⛅ 날씨 Composition</h2>

    <section class="search-box">
      <h3>🔍 도시 검색</h3>
      <input
        type="text"
        :value="searchQuery"
        @input="(e) => (searchQuery = e.target.value)"
        placeholder="도시 이름을 한글로 입력하세요 (예: 서울)"
      />
      <p v-if="searchQuery">
        검색 중인 도시: <strong>{{ searchQuery }}</strong> ({{ filteredWeatherList.length }}건)
      </p>
      <p v-else class="hint">검색어가 없으면 전체 도시를 표시합니다.</p>
      <label class="favorite-filter">
        <input type="checkbox" v-model="showOnlyFavorites" />
        ⭐ 즐겨찾기만 보기 ({{ favoriteCount }}개)
      </label>
    </section>

    <section class="list-box">
      <h3>🏙️ 지역별 날씨 현황</h3>
      <div
        v-for="city in filteredWeatherList"
        :key="city.id"
        class="weather-card"
        :class="{ selected: city.id === selectedCityId }"
        @click="selectCity(city)"
      >
        <div class="card-head">
          <button
            class="btn-favorite"
            :class="{ active: favoriteIds.includes(city.id) }"
            @click.stop="toggleFavorite(city.id)"
          >
            ★
          </button>
          <h4>{{ city.name }}</h4>
          <span class="temp">{{ city.temp }}°C</span>
        </div>
        <p>현재 날씨: {{ city.status }}</p>

        <ul class="detail-list">
          <li>🌡️ 체감온도: {{ city.feelsLike }}°C</li>
          <li>💧 습도: {{ city.humidity }}%</li>
          <li>💨 풍속: {{ city.windSpeed }}m/s</li>
        </ul>

        <span v-if="city.temp >= 25" class="label hot">🔥 더움 (25도 이상)</span>
        <span v-else class="label cool">❄️ 선선함 (25도 미만)</span>
        <span v-if="city.humidity >= 70" class="label humid">💦 습함 (70% 이상)</span>
        <span v-if="city.windSpeed >= 4" class="label windy">🌬️ 바람 강함 (4m/s 이상)</span>

        <button class="btn-detail" @click.stop="showDetail(city.name, city.status)">
          상세보기
        </button>
      </div>

      <p v-if="showOnlyFavorites && favoriteCount === 0" class="no-result">
        ⭐ 즐겨찾기한 도시가 없습니다. 카드의 별을 눌러 추가해 보세요.
      </p>
      <p v-else-if="filteredWeatherList.length === 0" class="no-result">
        😭 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </section>

    <div class="status-bar">{{ selectedCityInfo }}</div>
  </div>
</template>
