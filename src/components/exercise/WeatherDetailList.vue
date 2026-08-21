<script setup>
defineProps({
  city: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <ul class="detail-list">
    <li>🌡️ 체감온도: {{ city.feelsLike }}°C</li>
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
