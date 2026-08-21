<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { storeToRefs } from 'pinia'
import { useWeatherStore } from '@/stores/weatherStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useConfigStore } from '@/stores/configStore'
import { applySkyTheme } from '@/composables/useSkyTheme'
import noImage from '@/assets/no-image.svg'

const router = useRouter()
const weatherStore = useWeatherStore()
const favoriteStore = useFavoriteStore()
const configStore = useConfigStore()
const { weatherList, searchedList, isLoading } = storeToRefs(weatherStore)

const TOUR_API_KEY = import.meta.env.VITE_TOUR_API_KEY
const TOUR_BASE_URL = 'https://apis.data.go.kr/B551011/KorService2'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

const selectedCityInfo = ref(
  '아직 고른 곳이 없어요. 지도에서 도시 마커나 원하는 위치를 눌러 보세요.',
)
const selectedCityId = ref('')
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다. 현재 ${city.temp}℃ ${city.status}`
  applySkyTheme(city.main, city.temp)
}

const displayTemp = (temp) => {
  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }
  return temp
}

const mapRef = ref(null)
let map = null
let markerLayer = null
let spotLayer = null

const nearbySpots = ref([])
const nearbyCityName = ref('')
const isSpotsLoading = ref(false)

const fetchNearbySpots = async (city) => {
  isSpotsLoading.value = true
  try {
    const response = await axios.get(
      `${TOUR_BASE_URL}/locationBasedList2?serviceKey=${TOUR_API_KEY}&MobileOS=ETC&MobileApp=SkalaWeather&_type=json&mapX=${city.lon}&mapY=${city.lat}&radius=10000&contentTypeId=12&arrange=E&numOfRows=40&pageNo=1`,
    )
    const body = response.data.response.body
    const items = body.items && body.items.item ? body.items.item : []
    nearbySpots.value = items.map((item) => ({
      id: item.contentid,
      name: item.title,
      address: item.addr1,
      image: item.firstimage,
      lat: Number(item.mapy),
      lon: Number(item.mapx),
    }))
    nearbyCityName.value = city.name
    renderSpotMarkers()
  } catch (error) {
    console.error('근처 관광지 API 호출 실패:', error)
    nearbySpots.value = []
  } finally {
    isSpotsLoading.value = false
  }
}

const spotPopupHtml = (spot) => {
  return `<div class="spot-popup"><img src="${spot.image || noImage}" alt="${spot.name}" /><b>${spot.name}</b><span>${spot.address}</span></div>`
}

const renderSpotMarkers = () => {
  spotLayer.clearLayers()
  nearbySpots.value.forEach((spot) => {
    L.circleMarker([spot.lat, spot.lon], {
      radius: 7,
      color: '#fff',
      weight: 2,
      fillColor: '#10b981',
      fillOpacity: 0.95,
    })
      .bindPopup(spotPopupHtml(spot), { maxWidth: 220 })
      .addTo(spotLayer)
  })
}

let pointLayer = null
const pointWeather = ref(null)

const pointPopupHtml = (point) => `
  <div class="point-popup">
    <div class="point-head">
      <img src="https://openweathermap.org/img/wn/${point.icon}@2x.png" alt="${point.status}" />
      <div><b>${point.name}</b><span>${point.status}</span></div>
      <strong>${displayTemp(point.temp)}°</strong>
    </div>
    <p>체감 ${displayTemp(point.feelsLike)}° · 습도 ${point.humidity}% · 바람 ${point.windSpeed}m/s</p>
    <div class="point-actions">
      <button class="point-spots-btn">🏞️ 관광지 날씨</button>
      <button class="point-plan-btn">🧭 추천 코스 보기</button>
    </div>
  </div>`

const renderPointMarker = () => {
  pointLayer.clearLayers()
  if (!pointWeather.value) {
    return
  }
  const point = pointWeather.value
  const marker = L.marker([point.lat, point.lon], {
    icon: L.divIcon({
      className: 'temp-marker-wrap',
      html: `<div class="point-pin">📍</div>`,
      iconAnchor: [14, 28],
    }),
  })
    .bindPopup(pointPopupHtml(point), { maxWidth: 300, minWidth: 240, offset: [0, -24] })
    .addTo(pointLayer)
  marker.on('popupopen', (event) => {
    const element = event.popup.getElement()
    element.querySelector('.point-plan-btn').addEventListener('click', () => {
      router.push(`/plan?lat=${point.lat}&lon=${point.lon}`)
    })
    element.querySelector('.point-spots-btn').addEventListener('click', () => {
      router.push(`/spots?lat=${point.lat}&lon=${point.lon}&name=${point.name}`)
    })
  })
  marker.openPopup()
}

const explorePoint = async (latlng) => {
  isSpotsLoading.value = true
  try {
    const response = await axios.get(
      `${BASE_URL}/weather?lat=${latlng.lat}&lon=${latlng.lng}&appid=${API_KEY}&units=metric&lang=kr`,
    )
    const raw = response.data
    pointWeather.value = {
      name: raw.name || '선택한 위치',
      main: raw.weather[0].main,
      temp: Math.round(raw.main.temp),
      feelsLike: Math.round(raw.main.feels_like),
      status: raw.weather[0].description,
      icon: raw.weather[0].icon,
      humidity: raw.main.humidity,
      windSpeed: raw.wind.speed,
      lat: latlng.lat,
      lon: latlng.lng,
    }
    selectedCityId.value = ''
    selectedCityInfo.value = `지도에서 고른 위치 ${pointWeather.value.name} · 현재 ${pointWeather.value.temp}℃ ${pointWeather.value.status}`
    applySkyTheme(pointWeather.value.main, pointWeather.value.temp)
    map.flyTo([latlng.lat, latlng.lng], Math.max(map.getZoom(), 11))
    await fetchNearbySpots({ name: pointWeather.value.name, lat: latlng.lat, lon: latlng.lng })
    if (nearbySpots.value.length) {
      pointWeather.value.name = nearbySpots.value[0].address.split(' ').slice(0, 2).join(' ')
      nearbyCityName.value = pointWeather.value.name
      selectedCityInfo.value = `지도에서 고른 위치 ${pointWeather.value.name} · 현재 ${pointWeather.value.temp}℃ ${pointWeather.value.status}`
    }
    renderPointMarker()
  } catch (error) {
    console.error('위치 날씨 API 호출 실패:', error)
  } finally {
    isSpotsLoading.value = false
  }
}

const goNearbySpots = () => {
  const base =
    pointWeather.value ||
    [...weatherList.value, ...searchedList.value].find((city) => city.id === selectedCityId.value)
  router.push(`/spots?lat=${base.lat}&lon=${base.lon}&name=${base.name}`)
}

const resetMap = () => {
  spotLayer.clearLayers()
  pointLayer.clearLayers()
  pointWeather.value = null
  nearbySpots.value = []
  nearbyCityName.value = ''
  selectedCityId.value = ''
  selectedCityInfo.value = '아직 고른 곳이 없어요. 지도에서 도시 마커나 원하는 위치를 눌러 보세요.'
  map.flyTo([35.9, 127.8], 7)
}

const markerHtml = (city) => {
  const isFavorite = favoriteStore.favoriteIds.includes(city.id)
  const isSelected = selectedCityId.value === city.id
  return `
    <div class="temp-marker ${isFavorite ? 'is-favorite' : ''} ${isSelected ? 'is-selected' : ''}">
      <img src="https://openweathermap.org/img/wn/${city.icon}.png" alt="${city.status}" />
      <b>${displayTemp(city.temp)}°</b>
      <span>${city.name}</span>
      ${isFavorite ? '<i>★</i>' : ''}
    </div>`
}

const renderMarkers = () => {
  if (!map) {
    return
  }
  markerLayer.clearLayers()
  ;[...weatherList.value, ...searchedList.value].forEach((city) => {
    const marker = L.marker([city.lat, city.lon], {
      icon: L.divIcon({
        className: 'temp-marker-wrap',
        html: markerHtml(city),
        iconAnchor: [34, 20],
      }),
    })
    marker.on('click', () => {
      pointLayer.clearLayers()
      pointWeather.value = null
      selectCity(city)
      map.flyTo([city.lat, city.lon], 12)
      fetchNearbySpots(city)
    })
    marker.addTo(markerLayer)
  })
}

onMounted(() => {
  map = L.map(mapRef.value, {
    zoomControl: false,
    attributionControl: false,
    minZoom: 7,
    maxZoom: 14,
    maxBounds: [
      [32.8, 124.0],
      [39.0, 131.5],
    ],
    maxBoundsViscosity: 1.0,
  }).setView([35.9, 127.8], 7)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 14,
  }).addTo(map)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  spotLayer = L.layerGroup().addTo(map)
  pointLayer = L.layerGroup().addTo(map)
  markerLayer = L.layerGroup().addTo(map)
  map.on('click', (event) => {
    explorePoint(event.latlng)
  })
  if (weatherList.value.length === 0) {
    weatherStore.fetchWeatherList()
  } else {
    renderMarkers()
  }
})

watch(weatherList, renderMarkers)
watch(searchedList, renderMarkers, { deep: true })
watch(selectedCityId, renderMarkers)
watch(() => favoriteStore.favoriteIds, renderMarkers, { deep: true })
watch(
  () => configStore.unit,
  () => {
    renderMarkers()
    renderPointMarker()
  },
)
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="map-section">
      <div class="map-head">
        <h2>🗺️ 전국 날씨 지도</h2>
        <span v-if="nearbyCityName" class="map-hint">
          📍 {{ nearbyCityName }} 근처 관광지 {{ nearbySpots.length }}곳 · 초록 점을 눌러 보세요
        </span>
        <span v-else class="map-hint"
          >도시 마커를 누르거나 지도 아무 곳이나 클릭해 보세요 · ★는 즐겨찾기</span
        >
        <el-button
          v-if="nearbyCityName || pointWeather"
          size="small"
          round
          type="primary"
          plain
          @click="goNearbySpots"
        >
          🏞️ 이 위치 관광지 날씨 보기
        </el-button>
        <el-button v-if="nearbyCityName || pointWeather" size="small" round @click="resetMap">
          전국 보기
        </el-button>
      </div>
      <div class="map-frame">
        <div ref="mapRef" class="weather-map" v-loading="isLoading || isSpotsLoading"></div>
        <div v-if="!nearbyCityName && !pointWeather && !isLoading" class="map-guide fade-up">
          <p class="map-guide-title">👆 지도를 눌러 보세요</p>
          <ul>
            <li><b>도시 마커</b>를 누르면 그 도시 날씨와 근처 관광지가 초록 점으로 떠요</li>
            <li><b>지도 아무 곳</b>이나 클릭하면 그 자리의 날씨를 바로 알려줘요</li>
            <li>팝업에서 <b>관광지 날씨</b>와 <b>여행 코스</b>로 이어집니다 · ★는 즐겨찾기</li>
          </ul>
        </div>
      </div>
    </section>

    <el-alert
      type="info"
      :title="selectedCityInfo"
      :closable="false"
      show-icon
      class="status-bar"
    />
  </div>
</template>

<style>
.temp-marker-wrap {
  width: auto !important;
  height: auto !important;
  background: none;
  border: none;
}
.temp-marker {
  position: relative;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  border: 1.5px solid rgba(14, 165, 233, 0.35);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.25);
  font-family: 'Pretendard', sans-serif;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.temp-marker:hover {
  transform: translateY(-2px) scale(1.04);
}
.temp-marker img {
  width: 28px;
  height: 28px;
}
.temp-marker b {
  font-size: 15px;
  color: #0f172a;
}
.temp-marker span {
  font-size: 12px;
  color: #64748b;
  margin-left: 4px;
}
.temp-marker i {
  position: absolute;
  top: -9px;
  right: -6px;
  font-style: normal;
  font-size: 14px;
  color: #f59e0b;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.temp-marker.is-favorite {
  border-color: #f59e0b;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}
.temp-marker.is-selected {
  background: #0ea5e9;
  border-color: #0ea5e9;
}
.temp-marker.is-selected b,
.temp-marker.is-selected span {
  color: #fff;
}
.leaflet-popup-content-wrapper {
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
}
.leaflet-popup-content {
  margin: 10px 12px;
}
.spot-popup {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: 'Pretendard', sans-serif;
}
.spot-popup img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 4px;
}
.spot-popup b {
  font-size: 14px;
  color: #0f172a;
}
.spot-popup span {
  font-size: 12px;
  color: #64748b;
}
.point-pin {
  font-size: 28px;
  line-height: 1;
  filter: drop-shadow(0 4px 6px rgba(15, 23, 42, 0.3));
}
.point-popup {
  font-family: 'Pretendard', sans-serif;
  min-width: 220px;
}
.point-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.point-head img {
  width: 44px;
  height: 44px;
  margin: -6px 0;
}
.point-head div {
  display: flex;
  flex-direction: column;
}
.point-head b {
  font-size: 14px;
  color: #0f172a;
}
.point-head span {
  font-size: 12px;
  color: #64748b;
}
.point-head strong {
  margin-left: auto;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
}
.point-popup p {
  margin: 6px 0 8px;
  font-size: 12px;
  color: #475569;
}
.point-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.point-spots-btn,
.point-plan-btn {
  width: 100%;
  white-space: nowrap;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: #0ea5e9;
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}
.point-plan-btn:hover {
  background: #0284c7;
}
.point-spots-btn {
  background: #10b981;
}
.point-spots-btn:hover {
  background: #059669;
}
</style>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
}
.map-section {
  margin-bottom: 14px;
}
.map-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.map-head h2 {
  font-size: 1.4rem;
  font-weight: 800;
}
.map-head .map-hint {
  margin-left: auto;
  font-size: 13px;
  color: var(--ink-500);
}
.map-frame {
  position: relative;
}
.map-guide {
  position: absolute;
  left: 18px;
  bottom: 18px;
  z-index: 500;
  max-width: 360px;
  padding: 16px 18px;
  border-radius: 22px 22px 22px 6px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(12px);
  pointer-events: none;
}
.map-guide-title {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 6px;
}
.map-guide ul {
  padding-left: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink-700);
}
.map-guide b {
  color: var(--sky-600);
}
.weather-map {
  height: min(72vh, 680px);
  min-height: 440px;
  border-radius: 36px 36px 36px 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 18px 44px rgba(14, 165, 233, 0.18);
}
.status-bar {
  border-radius: 16px;
}
@media (max-width: 600px) {
  .weather-map {
    height: 60vh;
    min-height: 360px;
    border-radius: 24px 24px 24px 8px;
  }
  .map-guide {
    left: 10px;
    right: 10px;
    bottom: 10px;
    max-width: none;
    padding: 12px 14px;
  }
  .map-head .map-hint {
    order: 3;
    width: 100%;
    margin-left: 0;
  }
}
</style>
