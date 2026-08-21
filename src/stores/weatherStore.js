import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'

export const cityList = [
  { id: 'city_01', name: '서울', region: '서울특별시', english: 'Seoul' },
  { id: 'city_02', name: '인천', region: '인천광역시', english: 'Incheon' },
  { id: 'city_03', name: '대전', region: '대전광역시', english: 'Daejeon' },
  { id: 'city_04', name: '대구', region: '대구광역시', english: 'Daegu' },
  { id: 'city_05', name: '광주', region: '광주광역시', english: 'Gwangju' },
  { id: 'city_06', name: '울산', region: '울산광역시', english: 'Ulsan' },
  { id: 'city_07', name: '부산', region: '부산광역시', english: 'Busan' },
  { id: 'city_08', name: '세종', region: '세종특별자치시', english: 'Sejong' },
  { id: 'city_09', name: '제주', region: '제주특별자치도', english: 'Jeju' },
]

const toCityWeather = (data, base) => ({
  id: base.id,
  name: base.name,
  region: base.region,
  temp: Math.round(data.main.temp),
  status: data.weather[0].description,
  main: data.weather[0].main,
  icon: data.weather[0].icon,
  feelsLike: Math.round(data.main.feels_like),
  humidity: data.main.humidity,
  windSpeed: data.wind.speed,
  lat: data.coord.lat,
  lon: data.coord.lon,
  searched: base.searched || false,
})

export const useWeatherStore = defineStore('weather', () => {
  const weatherList = ref([])
  const searchedList = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function fetchWeatherList() {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const requests = cityList.map((city) =>
        axios.get(`${BASE_URL}/weather?q=${city.english}&appid=${API_KEY}&units=metric&lang=kr`),
      )
      const responses = await axios.all(requests)
      weatherList.value = responses.map((response, index) =>
        toCityWeather(response.data, cityList[index]),
      )
    } catch (error) {
      console.error('날씨 API 호출 실패:', error)
      errorMessage.value = '날씨 데이터를 가져오지 못했습니다. API Key와 네트워크를 확인하세요.'
    } finally {
      isLoading.value = false
    }
  }

  async function findPlace(query) {
    const candidates = [query, `${query}시`, `${query}군`]
    for (const keyword of candidates) {
      const geoResponse = await axios.get(`${GEO_URL}?q=${keyword}&limit=5&appid=${API_KEY}`)
      const place = geoResponse.data.find((item) => item.country === 'KR')
      if (place) {
        return place
      }
    }
    return null
  }

  async function searchCity(query) {
    const place = await findPlace(query)
    if (!place) {
      return null
    }
    const koreanName = place.local_names && place.local_names.ko ? place.local_names.ko : place.name
    const id = `search_${place.lat.toFixed(3)}_${place.lon.toFixed(3)}`
    const existing = searchedList.value.find((city) => city.id === id)
    if (existing) {
      return existing
    }
    const weatherResponse = await axios.get(
      `${BASE_URL}/weather?lat=${place.lat}&lon=${place.lon}&appid=${API_KEY}&units=metric&lang=kr`,
    )
    const city = toCityWeather(weatherResponse.data, {
      id,
      name: koreanName,
      region: place.state || '검색한 도시',
      searched: true,
    })
    searchedList.value.unshift(city)
    return city
  }

  return { weatherList, searchedList, isLoading, errorMessage, fetchWeatherList, searchCity }
})
