<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <el-button class="unit-toggler" round size="small" @click="configStore.toggleUnit">
    {{ configStore.unit === 'celsius' ? '℃ 섭씨' : '℉ 화씨' }} ⇄
  </el-button>
</template>

<style scoped>
.unit-toggler {
  font-weight: 700;
  border-color: rgba(14, 165, 233, 0.3);
  color: var(--sky-600);
}
</style>
