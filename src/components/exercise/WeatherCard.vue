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
    class="weather-card fade-up"
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
      <img
        v-if="city.icon"
        :src="`https://openweathermap.org/img/wn/${city.icon}@2x.png`"
        :alt="city.status"
        class="weather-icon"
      />
      <div class="card-title">
        <h4>{{ city.name }}</h4>
        <span class="status">{{ city.status }}</span>
      </div>
      <span class="temp"
        >{{ displayTemp }}<small>{{ configStore.unitSymbol }}</small></span
      >
      <el-button
        size="small"
        type="primary"
        plain
        round
        class="btn-detail"
        @click.stop="handleDetailClick(city)"
      >
        상세보기
      </el-button>
    </div>

    <WeatherDetailList :city="city" />

    <div class="card-tags">
      <el-tag v-if="city.temp >= 25" type="danger" size="small" round>🔥 더움</el-tag>
      <el-tag v-else type="primary" size="small" round>❄️ 선선함</el-tag>
      <el-tag v-if="city.humidity >= 70" type="success" size="small" round>💦 습함</el-tag>
      <el-tag v-if="city.windSpeed >= 4" type="warning" size="small" round>🌬️ 바람 강함</el-tag>
    </div>
  </el-card>
</template>

<style scoped>
.weather-card {
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.weather-card:hover {
  transform: translateY(-2px);
}
.weather-card.selected {
  border-color: rgba(14, 165, 233, 0.6);
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.9), rgba(255, 255, 255, 0.95));
}
.card-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
}
.btn-favorite {
  font-size: 20px;
  color: #cbd5e1;
}
.btn-favorite.active {
  color: #f59e0b;
}
.weather-icon {
  width: 48px;
  height: 48px;
  margin: -8px 0;
}
.card-title h4 {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.1;
}
.status {
  font-size: 13px;
  color: var(--ink-500);
}
.temp {
  margin-left: auto;
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--ink-900);
}
.temp small {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ink-500);
  margin-left: 2px;
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
</style>
