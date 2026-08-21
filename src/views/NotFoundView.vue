<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <el-result
    icon="warning"
    title="페이지를 찾을 수 없습니다."
    sub-title="요청하신 주소가 존재하지 않습니다."
  >
    <template v-slot:extra>
      <el-button type="primary" @click="goHome">← 메인 대시보드로 돌아가기</el-button>
    </template>
  </el-result>
</template>
