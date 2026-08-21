import { ref } from 'vue'

export const skyTheme = ref('default')

export const skyThemeOf = (main, temp) => {
  if (temp >= 30) {
    return 'hot'
  }
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(main)) {
    return 'rain'
  }
  if (main === 'Snow') {
    return 'snow'
  }
  if (main === 'Clear') {
    return 'clear'
  }
  return 'clouds'
}

export const applySkyTheme = (main, temp) => {
  skyTheme.value = skyThemeOf(main, temp)
  document.body.dataset.weather = skyTheme.value
}
