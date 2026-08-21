<script setup>
defineProps({
  query: {
    type: String,
    default: '',
  },
  isSearching: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-query', 'search'])

const handleInput = (value) => {
  emit('update-query', value)
}

const handleSearch = () => {
  emit('search')
}
</script>

<template>
  <div class="search-bar">
    <h3>🔍 도시 검색</h3>
    <div class="search-row">
      <el-input
        :model-value="query"
        placeholder="도시 이름을 입력하세요 (예: 춘천, 강릉, 전주)"
        clearable
        @input="handleInput"
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" :loading="isSearching" @click="handleSearch">전국 검색</el-button>
    </div>
    <p v-if="query">
      검색 중인 도시: <strong>{{ query }}</strong>
      <span class="hint">· 목록에 없으면 [전국 검색]을 눌러 API로 찾아요</span>
    </p>
    <p v-else class="hint">
      입력하면 아래 목록이 바로 걸러지고 [전국 검색]으로 다른 도시도 불러올 수 있어요.
    </p>
  </div>
</template>

<style scoped>
.search-bar h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 10px;
}
.search-row {
  display: flex;
  gap: 8px;
}
.search-bar p {
  margin-top: 8px;
}
.hint {
  color: #868e96;
  font-size: 14px;
}
</style>
