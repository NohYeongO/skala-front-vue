<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="notfound-wrapper">
    <p class="icon">☀️❓</p>
    <h2>페이지를 찾을 수 없습니다.</h2>
    <p class="message">요청하신 주소가 존재하지 않습니다.</p>
    <RouterLink to="/" class="link-home">← 메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.notfound-wrapper {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  padding: 30px 0;
}
.icon {
  font-size: 3rem;
}
.notfound-wrapper h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 10px 0;
}
.message {
  color: #868e96;
  margin-bottom: 20px;
}
.link-home {
  display: inline-block;
  padding: 8px 14px;
  font-size: 14px;
  color: #fff;
  background-color: #42b883;
  border-radius: 6px;
  text-decoration: none;
}
.link-home:hover {
  background-color: #33a06f;
}
</style>
