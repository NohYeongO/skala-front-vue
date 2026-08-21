<script setup>
defineProps({
  query: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

const handleInput = (value) => {
  emit('update-query', value)
}
</script>

<template>
  <div class="search-bar">
    <h3>🔍 도시 검색</h3>
    <el-input
      :model-value="query"
      placeholder="도시 이름을 한글로 입력하세요 (예: 서울)"
      clearable
      @input="handleInput"
    />
    <p v-if="query">
      검색 중인 도시: <strong>{{ query }}</strong>
    </p>
    <p v-else class="hint">검색어가 없으면 전체 도시를 표시합니다.</p>
  </div>
</template>

<style scoped>
.search-bar h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
}
.search-bar p {
  margin-top: 8px;
}
.hint {
  color: #868e96;
  font-size: 14px;
}
</style>
