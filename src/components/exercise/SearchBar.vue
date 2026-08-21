<script setup>
defineProps({
  query: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

const handleInput = (e) => {
  emit('update-query', e.target.value)
}
</script>

<template>
  <div class="search-bar">
    <h3>🔍 도시 검색</h3>
    <input
      type="text"
      :value="query"
      @input="handleInput"
      placeholder="도시 이름을 한글로 입력하세요 (예: 서울)"
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
.search-bar input {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  outline: none;
}
.search-bar input:focus {
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.2);
}
.search-bar p {
  margin-top: 8px;
}
.hint {
  color: #868e96;
  font-size: 14px;
}
</style>
