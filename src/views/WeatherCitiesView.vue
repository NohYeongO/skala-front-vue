<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useWeatherStore } from '@/stores/weatherStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useConfigStore } from '@/stores/configStore'
import { applySkyTheme } from '@/composables/useSkyTheme'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

const router = useRouter()
const weatherStore = useWeatherStore()
const favoriteStore = useFavoriteStore()
const configStore = useConfigStore()
const { weatherList, searchedList, isLoading, errorMessage } = storeToRefs(weatherStore)
const isSearching = ref(false)

const searchQuery = ref('')
const selectedCityInfo = ref(
  '대표 지역을 누르거나 도시를 검색하면 여기에 선택한 도시가 표시됩니다.',
)
const selectedCityId = ref('')
const showOnlyFavorites = ref(false)
const pickedIds = ref([])

const pickedList = computed(() =>
  pickedIds.value
    .map((id) => [...searchedList.value, ...weatherList.value].find((city) => city.id === id))
    .filter((city) => city),
)

const filteredWeatherList = computed(() => {
  const query = searchQuery.value
  const baseList = showOnlyFavorites.value
    ? pickedList.value.filter((city) => favoriteStore.favoriteIds.includes(city.id))
    : pickedList.value
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

const displayTemp = (temp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }
  return temp
}

const pickCity = (city) => {
  if (!pickedIds.value.includes(city.id)) {
    pickedIds.value.unshift(city.id)
  }
  selectCity(city)
}

const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다. 현재 ${city.temp}℃ ${city.status}`
  applySkyTheme(city.main, city.temp)
}

const searchByApi = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    ElMessage.warning('검색할 도시 이름을 입력하세요.')
    return
  }
  isSearching.value = true
  try {
    const city = await weatherStore.searchCity(query)
    if (!city) {
      ElMessage.error(`"${query}" 도시를 찾지 못했어요.`)
      return
    }
    searchQuery.value = ''
    pickCity(city)
    ElMessage.success(`${city.name} 날씨를 불러왔어요.`)
  } catch (error) {
    console.error('도시 검색 실패:', error)
    ElMessage.error('도시 검색에 실패했어요. 잠시 후 다시 시도하세요.')
  } finally {
    isSearching.value = false
  }
}

const goDetail = (city) => {
  if (city.searched) {
    router.push(
      `/weather/search?id=${city.id}&lat=${city.lat}&lon=${city.lon}&name=${city.name}&region=${city.region}`,
    )
    return
  }
  router.push('/weather/' + city.id)
}

onMounted(() => {
  if (weatherList.value.length === 0) {
    weatherStore.fetchWeatherList()
  }
  searchedList.value.forEach((city) => {
    if (!pickedIds.value.includes(city.id)) {
      pickedIds.value.push(city.id)
    }
  })
})
</script>

<template>
  <div class="cities-wrapper">
    <h2>🏙️ 도시 날씨</h2>

    <BaseDashboardCard>
      <SearchBar
        :query="searchQuery"
        :is-searching="isSearching"
        @update-query="updateQuery"
        @search="searchByApi"
      />
      <h3 class="slider-title">🚩 대표 지역</h3>
      <el-alert v-if="errorMessage" type="error" :title="errorMessage" :closable="false" />
      <el-scrollbar v-else>
        <div v-loading="isLoading" class="city-slider">
          <button
            v-for="city in weatherList"
            :key="city.id"
            class="city-chip"
            :class="{ active: city.id === selectedCityId }"
            @click="pickCity(city)"
          >
            <img :src="`https://openweathermap.org/img/wn/${city.icon}.png`" :alt="city.status" />
            <span class="chip-name">{{ city.name }}</span>
            <strong>{{ displayTemp(city.temp) }}°</strong>
            <i v-if="favoriteStore.favoriteIds.includes(city.id)">★</i>
          </button>
        </div>
      </el-scrollbar>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <div class="board-head">
        <h3>🔎 내가 찾은 날씨</h3>
        <el-checkbox v-model="showOnlyFavorites" class="favorite-filter">
          ⭐ 즐겨찾기만 보기 ({{ favoriteStore.favoriteCount }}개)
        </el-checkbox>
      </div>
      <div class="card-list card-grid">
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

        <el-empty
          v-if="pickedList.length === 0"
          description="위의 대표 지역을 누르거나 도시를 검색하면 여기에 날씨 카드가 모여요."
        />
        <el-empty
          v-else-if="showOnlyFavorites && filteredWeatherList.length === 0"
          description="⭐ 즐겨찾기한 도시가 없습니다. 카드의 별을 눌러 추가해 보세요."
        />
        <el-empty
          v-else-if="filteredWeatherList.length === 0"
          description="😭 검색어와 일치하는 도시가 없어요. [전국 검색]으로 불러와 보세요."
        />
      </div>
    </BaseDashboardCard>

    <el-alert
      type="success"
      :title="selectedCityInfo"
      :closable="false"
      center
      class="status-bar"
    />
  </div>
</template>

<style scoped>
.cities-wrapper {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}
.cities-wrapper h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 16px;
}
.cities-wrapper h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 10px;
}
.slider-title {
  margin-top: 14px;
}
.city-slider {
  display: flex;
  gap: 10px;
  padding: 4px 2px 10px;
  min-height: 64px;
}
.city-chip {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 8px 14px 8px 8px;
  border-radius: 999px;
  border: 1px solid rgba(14, 165, 233, 0.25);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  font-family: inherit;
}
.city-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.2);
}
.city-chip.active {
  background: var(--sky-500);
  border-color: var(--sky-500);
  color: #fff;
}
.city-chip img {
  width: 32px;
  height: 32px;
}
.chip-name {
  font-size: 14px;
  font-weight: 600;
}
.city-chip strong {
  font-size: 15px;
  font-weight: 800;
}
.city-chip i {
  position: absolute;
  top: -6px;
  right: -2px;
  font-style: normal;
  font-size: 13px;
  color: #f59e0b;
}
.board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.board-head h3 {
  margin-bottom: 0;
}
.card-list {
  min-height: 80px;
  margin-top: 10px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.card-grid :deep(.el-empty) {
  grid-column: 1 / -1;
}
.status-bar {
  border-radius: 16px;
}
</style>
