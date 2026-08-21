<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <el-tag type="info">단위: {{ configStore.unit === 'celsius' ? '섭씨(℃)' : '화씨(℉)' }}</el-tag>
    <el-button type="primary" size="small" @click="configStore.toggleUnit">단위 변경</el-button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
</style>
