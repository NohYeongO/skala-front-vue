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
  <div class="weather-card" :class="{ selected: isSelected }" @click="handleCardClick(city)">
    <div class="card-head">
      <button
        class="btn-favorite"
        :class="{ active: isFavorite }"
        @click.stop="handleFavoriteClick(city.id)"
      >
        ★
      </button>
      <h4>{{ city.name }}</h4>
      <span class="temp">{{ displayTemp }}{{ configStore.unitSymbol }}</span>
    </div>
    <p>현재 날씨: {{ city.status }}</p>

    <WeatherDetailList :city="city" />

    <span v-if="city.temp >= 25" class="label hot">🔥 더움 (25도 이상)</span>
    <span v-else class="label cool">❄️ 선선함 (25도 미만)</span>
    <span v-if="city.humidity >= 70" class="label humid">💦 습함 (70% 이상)</span>
    <span v-if="city.windSpeed >= 4" class="label windy">🌬️ 바람 강함 (4m/s 이상)</span>

    <button class="btn-detail" @click.stop="handleDetailClick(city)">상세보기</button>
  </div>
</template>

<style scoped>
.weather-card {
  position: relative;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.weather-card:hover {
  border-color: #42b883;
}
.weather-card.selected {
  border-color: #42b883;
  background: #f0faf5;
}
.card-head {
  display: flex;
  align-items: baseline;
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
  padding: 0;
  font-size: 18px;
  line-height: 1;
  color: #ced4da;
  background: none;
  border: none;
  cursor: pointer;
}
.btn-favorite.active {
  color: #f1c40f;
}
.label {
  display: inline-block;
  margin-top: 6px;
  margin-right: 4px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  color: #fff;
}
.hot {
  background-color: #ff7675;
}
.cool {
  background-color: #74b9ff;
}
.humid {
  background-color: #00b894;
}
.windy {
  background-color: #a29bfe;
}
.btn-detail {
  position: absolute;
  right: 12px;
  top: 12px;
  padding: 6px 10px;
  font-size: 13px;
  color: #333;
  background-color: #f1f3f5;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
}
.btn-detail:hover {
  background-color: #e9ecef;
}
</style>
