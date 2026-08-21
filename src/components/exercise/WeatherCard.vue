<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import WeatherDetailList from './WeatherDetailList.vue'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

const handleCardClick = (city) => {
  emit('select-card', city)
}

const handleFavoriteClick = (cityId) => {
  emit('toggle-favorite', cityId)
}

const handleDetailClick = (city) => {
  emit('click-detail', city)
}

const configStore = useConfigStore()

const displayTemp = computed(() => {
  const rawTemp = props.city.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})
</script>

<template>
  <el-card
    class="weather-card"
    :class="{ selected: isSelected }"
    shadow="hover"
    @click="handleCardClick(city)"
  >
    <div class="card-head">
      <el-button
        link
        class="btn-favorite"
        :class="{ active: isFavorite }"
        @click.stop="handleFavoriteClick(city.id)"
      >
        ★
      </el-button>
      <h4>{{ city.name }}</h4>
      <span class="temp">{{ displayTemp }}{{ configStore.unitSymbol }}</span>
      <el-button size="small" class="btn-detail" @click.stop="handleDetailClick(city)">
        상세보기
      </el-button>
    </div>
    <p>현재 날씨: {{ city.status }}</p>

    <WeatherDetailList :city="city" />

    <el-tag v-if="city.temp >= 25" type="danger" size="small">🔥 더움 (25도 이상)</el-tag>
    <el-tag v-else type="primary" size="small">❄️ 선선함 (25도 미만)</el-tag>
    <el-tag v-if="city.humidity >= 70" type="success" size="small">💦 습함 (70% 이상)</el-tag>
    <el-tag v-if="city.windSpeed >= 4" type="warning" size="small">🌬️ 바람 강함 (4m/s 이상)</el-tag>
  </el-card>
</template>

<style scoped>
.weather-card {
  margin-bottom: 10px;
  cursor: pointer;
}
.weather-card.selected {
  border-color: #42b883;
  background: #f0faf5;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-head h4 {
  font-size: 1.05rem;
  font-weight: 600;
}
.temp {
  font-size: 0.95rem;
  color: #495057;
}
.btn-favorite {
  font-size: 18px;
  color: #ced4da;
}
.btn-favorite.active {
  color: #f1c40f;
}
.btn-detail {
  margin-left: auto;
}
.el-tag {
  margin-top: 6px;
  margin-right: 4px;
}
</style>
