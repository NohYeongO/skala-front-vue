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
  <el-descriptions :column="1" size="small" class="detail-list">
    <el-descriptions-item label="🌡️ 체감온도">
      {{ displayFeelsLike }}{{ configStore.unitSymbol }}
    </el-descriptions-item>
    <el-descriptions-item label="💧 습도">{{ city.humidity }}%</el-descriptions-item>
    <el-descriptions-item label="💨 풍속">{{ city.windSpeed }}m/s</el-descriptions-item>
  </el-descriptions>
</template>

<style scoped>
.detail-list {
  margin: 6px 0;
}
</style>
