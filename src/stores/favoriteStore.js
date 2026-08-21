import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useFavoriteStore = defineStore('favorite', () => {
  const favoriteIds = ref([])

  const favoriteCount = computed(() => favoriteIds.value.length)

  function toggleFavorite(cityId) {
    const index = favoriteIds.value.findIndex((id) => id === cityId)
    if (index === -1) {
      favoriteIds.value.push(cityId)
    } else {
      favoriteIds.value.splice(index, 1)
    }
  }

  return { favoriteIds, favoriteCount, toggleFavorite }
})
