<script setup>
import { ref, computed } from 'vue'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'
import noImage from '@/assets/no-image.svg'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  spot: {
    type: Object,
    default: null,
  },
  cityName: {
    type: String,
    default: '',
  },
  weather: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const caption = ref('')
const isSaving = ref(false)
const spotCardRef = ref(null)

const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const proxiedImage = computed(() => {
  if (!props.spot || !props.spot.image) {
    return noImage
  }
  return 'https://images.weserv.nl/?url=' + encodeURIComponent(props.spot.image)
})

const defaultCaption = computed(() => {
  if (!props.spot || !props.weather) {
    return ''
  }
  return `${props.weather.temp}℃ ${props.weather.status}, ${props.spot.name}에서`
})

const saveSpotCard = async () => {
  isSaving.value = true
  try {
    const canvas = await html2canvas(spotCardRef.value, {
      useCORS: true,
      scale: 2,
      backgroundColor: null,
    })
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `spot-card-${props.cityName}-${props.spot.name}.png`
    link.click()
    ElMessage.success('관광지 카드를 저장했습니다.')
  } catch (error) {
    console.error('관광지 카드 저장 실패:', error)
    ElMessage.error('관광지 카드 저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  caption.value = ''
  emit('close')
}
</script>

<template>
  <el-dialog
    :model-value="show"
    title="🏞️ 관광지 카드 만들기"
    width="min(560px, 94vw)"
    @close="handleClose"
  >
    <div v-if="spot && weather" class="spotcard-editor">
      <div
        ref="spotCardRef"
        class="spotcard"
        :style="{ backgroundImage: 'url(' + proxiedImage + ')' }"
      >
        <div class="spotcard-top">
          <span class="spotcard-city">{{ cityName }}</span>
          <span class="spotcard-date">{{ today }}</span>
        </div>
        <div class="spotcard-weather">
          <span class="spotcard-emoji">{{ weather.emoji }}</span>
          <span class="spotcard-temp">{{ weather.temp }}℃</span>
          <span class="spotcard-status">{{ weather.status }}</span>
        </div>
        <div class="spotcard-bottom">
          <p class="spotcard-spot">📍 {{ spot.name }}</p>
          <p class="spotcard-caption">{{ caption || defaultCaption }}</p>
        </div>
      </div>

      <div class="spotcard-controls">
        <el-input
          v-model="caption"
          :placeholder="defaultCaption"
          maxlength="40"
          show-word-limit
          clearable
        />
      </div>
    </div>

    <template v-slot:footer>
      <el-button @click="handleClose">닫기</el-button>
      <el-button type="primary" :loading="isSaving" @click="saveSpotCard">PNG로 저장</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.spotcard-editor {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.spotcard {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: 14px;
  padding: clamp(12px, 4vw, 22px);
  color: #fff;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.25);
}
.spotcard::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.25) 0%,
    rgba(0, 0, 0, 0) 35%,
    rgba(0, 0, 0, 0) 55%,
    rgba(0, 0, 0, 0.55) 100%
  );
  pointer-events: none;
}
.spotcard > * {
  position: relative;
  z-index: 1;
}
.spotcard-top {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  letter-spacing: 0.5px;
  opacity: 0.95;
}
.spotcard-city {
  font-weight: 700;
}
.spotcard-weather {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px 10px;
}
.spotcard-emoji {
  font-size: clamp(1.6rem, 6vw, 2.4rem);
}
.spotcard-temp {
  font-size: clamp(1.8rem, 7vw, 2.6rem);
  font-weight: 800;
}
.spotcard-status {
  font-size: 1.1rem;
}
.spotcard-spot {
  font-size: 1.05rem;
  font-weight: 600;
}
.spotcard-caption {
  margin-top: 4px;
  font-size: 0.95rem;
  opacity: 0.95;
}
.spotcard-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
@media (max-width: 600px) {
  .spotcard {
    aspect-ratio: 4 / 3;
  }
  .spotcard-top {
    font-size: 12px;
  }
  .spotcard-status {
    font-size: 0.95rem;
  }
  .spotcard-spot {
    font-size: 0.95rem;
  }
  .spotcard-caption {
    font-size: 0.85rem;
  }
}
@media (max-width: 360px) {
  .spotcard {
    aspect-ratio: 1 / 1;
  }
}
</style>
