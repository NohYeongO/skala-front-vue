<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">
      단위: <strong>{{ configStore.unit === 'celsius' ? '섭씨(℃)' : '화씨(℉)' }}</strong>
    </span>
    <button class="btn-toggle" @click="configStore.toggleUnit">단위 변경</button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.unit-label {
  font-size: 14px;
  color: #495057;
}
.btn-toggle {
  padding: 6px 10px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  background-color: #4b6584;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-toggle:hover {
  background-color: #3c5270;
}
</style>
