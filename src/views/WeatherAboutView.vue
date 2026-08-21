<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="about-wrapper">
    <h2>ℹ️ 서비스 소개</h2>

    <el-card shadow="never" class="about-card">
      <p><strong>SKALA Weather</strong>는 Vue 3 과정 실습용 날씨 대시보드입니다.</p>
      <ul>
        <li>도시별 날씨 카드를 한글 검색으로 찾고 ★ 즐겨찾기로 모아 볼 수 있습니다.</li>
        <li>
          상세보기 버튼을 누르면 <code>/weather/도시ID</code> 경로의 상세 기상관측 페이지로
          이동합니다.
        </li>
        <li>Vue Router로 새로고침 없이 화면이 전환됩니다.</li>
      </ul>
    </el-card>

    <el-button type="primary" @click="goHome">← 메인 대시보드로 돌아가기</el-button>
  </div>
</template>

<style scoped>
.about-wrapper {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
.about-wrapper h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
}
.about-card {
  margin-bottom: 15px;
  line-height: 1.7;
}
.about-card ul {
  padding-left: 20px;
  margin-top: 8px;
}
</style>
