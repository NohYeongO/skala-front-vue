<script setup>
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from './components/exercise/UnitToggler.vue'
import WeatherAmbience from './components/exercise/WeatherAmbience.vue'
</script>

<template>
  <div class="app-shell">
    <WeatherAmbience />
    <header class="app-header">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">⛅</span>
        <div>
          <h1>SKALA Weather</h1>
          <p>날씨로 고르는 오늘의 여행</p>
        </div>
      </RouterLink>
      <nav class="navigation-bar">
        <RouterLink to="/" class="nav-item">🗺️<span class="nav-text">날씨 지도</span></RouterLink>
        <RouterLink to="/cities" class="nav-item"
          >🏙️<span class="nav-text">도시 날씨</span></RouterLink
        >
        <RouterLink to="/plan" class="nav-item"
          >🧭<span class="nav-text">여행 코스</span></RouterLink
        >
        <RouterLink to="/history" class="nav-item"
          >📚<span class="nav-text">과제 기록</span></RouterLink
        >
        <RouterLink to="/about" class="nav-item">ℹ️<span class="nav-text">소개</span></RouterLink>
      </nav>
      <UnitToggler />
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 18px;
  margin-bottom: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.12);
  backdrop-filter: blur(14px);
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
}
.brand-mark {
  font-size: 1.9rem;
}
.brand h1 {
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.1;
}
.brand p {
  font-size: 12px;
  color: var(--ink-500);
}
.navigation-bar {
  display: flex;
  gap: 4px;
  margin-left: auto;
  padding: 4px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.08);
}
.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-700);
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
}
.nav-item:hover {
  color: var(--sky-600);
}
.nav-item.router-link-exact-active {
  background: #fff;
  color: var(--sky-600);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.18);
}
.app-main {
  min-height: 60vh;
}
@media (max-width: 720px) {
  .app-header {
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 14px;
    top: 8px;
  }
  .brand p {
    display: none;
  }
  .navigation-bar {
    order: 3;
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
    flex-wrap: nowrap;
    overflow-x: auto;
  }
  .nav-item {
    flex: 1;
    justify-content: center;
    text-align: center;
    white-space: nowrap;
    padding: 7px 8px;
    font-size: 13px;
  }
  .unit-toggler {
    margin-left: auto;
  }
}
@media (max-width: 430px) {
  .nav-text {
    display: none;
  }
  .nav-item {
    font-size: 18px;
    padding: 6px 0;
  }
}
</style>
