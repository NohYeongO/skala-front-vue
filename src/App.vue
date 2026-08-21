<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <h1>⛅ SKALA Weather</h1>
    <nav class="navigation-bar">
      <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
      <span class="divider">|</span>
      <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
    </nav>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  color: #2c3e50;
}
.app-container h1 {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
}
.navigation-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 600px;
  margin: 0 auto 20px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}
.nav-item {
  color: #7f8c8d;
  font-weight: bold;
  text-decoration: none;
}
.nav-item:hover {
  color: #2c3e50;
}
.divider {
  margin: 0 15px;
  color: #dcdde1;
}
</style>
