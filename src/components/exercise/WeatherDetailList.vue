<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
})

const configStore = useConfigStore()

const displayFeelsLike = computed(() => {
  const rawTemp = props.city.feelsLike
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})
</script>

<template>
  <ul class="detail-list">
    <li>🌡️ 체감온도: {{ displayFeelsLike }}{{ configStore.unitSymbol }}</li>
    <li>💧 습도: {{ city.humidity }}%</li>
    <li>💨 풍속: {{ city.windSpeed }}m/s</li>
  </ul>
</template>

<style scoped>
.detail-list {
  list-style: none;
  padding: 0;
  margin: 6px 0;
  font-size: 14px;
  color: #495057;
}
.detail-list li {
  line-height: 1.7;
}
</style>
