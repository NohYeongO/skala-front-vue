<script setup>
import WeatherMockup from './components/exercise/WeatherMockup.vue'
import WeatherComposition from './components/exercise/WeatherComposition.vue'
import WeatherParent from './components/exercise/WeatherParent.vue'
</script>

<template>
  <div>
    <div class="app-container">
      <h1>⛅ 과제 1: 날씨 (Mockup)</h1>
      <hr />
      <WeatherMockup />
    </div>
    <div class="app-container">
      <h1>⛅ 과제 2: 날씨 (Composition)</h1>
      <hr />
      <WeatherComposition />
    </div>
    <div class="app-container">
      <h1>⛅ 과제 3: 날씨 (Component)</h1>
      <hr />
      <WeatherParent />
    </div>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
