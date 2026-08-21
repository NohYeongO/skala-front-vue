## SKALA - Vue 과제

## 과제 1. Weather Mockup

### 요구사항

1. 배열 렌더링 (v-for) - 날씨 데이터 배열을 카드로 반복 출력하고 `:key`에 id를 바인딩한다.
2. 조건부 렌더링 (v-if) - 기온 25도 이상은 `🔥 더움 (25도 이상)` 미만은 `❄️ 선선함 (25도 미만)` 라벨을 붙인다.
3. 양방향 바인딩 및 한글 처리 (:value, @input) - 도시 이름을 한글로 검색하는 input을 만들고 입력한 도시명을 출력한다.
4. 이벤트 및 수식어 - 카드를 누르면 상태바에 `{도시}이 선택되었습니다.`를 표기하고 [상세보기] 버튼은 버블링 없이 `window.alert`로 날씨를 띄운다.
5. 본인만의 데이터를 추가하고 이를 기초로 Mockup을 추가한다.

### 구현 내용

작성 파일: `src/components/exercise/WeatherMockup.vue`

**1. 배열 렌더링**

`ref`로 선언한 `weatherList`를 `v-for`로 반복하고 `:key`에 `city.id`를 바인딩했습니다.

```html
<div v-for="city in weatherList" :key="city.id" class="weather-card"></div>
```

**2. 조건부 렌더링**

`v-if` / `v-else`로 기온 25도 기준 라벨을 분기했습니다.

```html
<span v-if="city.temp >= 25" class="label hot">🔥 더움 (25도 이상)</span>
<span v-else class="label cool">❄️ 선선함 (25도 미만)</span>
```

**3. 양방향 바인딩 및 한글 처리**

`v-model` 대신 `:value`와 `@input`을 조합해 한글 입력이 타이핑 즉시 반영되도록 했고 입력한 도시명을 아래에 출력했습니다.

```html
<input type="text" :value="searchCity" @input="(e) => (searchCity = e.target.value)" />
<p v-if="searchCity">입력한 도시명: <strong>{{ searchCity }}</strong></p>
```

**4. 이벤트 및 수식어**

카드 `@click`으로 상태바 문구를 바꾸고 [상세보기] 버튼에는 `@click.stop`을 붙여 카드로 버블링되지 않게 했습니다.

```html
<div class="weather-card" @click="selectCity(city)">
  <button @click.stop="showDetail(city.name, city.status)">상세보기</button>
</div>
```

```js
const selectCity = (city) => {
  selectedCityId.value = city.id
  statusMessage.value = `${city.name}이 선택되었습니다.`
}
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
```

**5. 본인만의 데이터 및 Mockup 추가**

도시 `광주` `울산`을 추가하고 각 도시에 `feelsLike`(체감온도) `humidity`(습도) `windSpeed`(풍속) 필드를 넣었습니다.

```js
{ id: 'city_04', name: '광주', temp: 29, status: '맑음', feelsLike: 33, humidity: 62, windSpeed: 1.8 }
```

카드에 세 값을 표시하고 습도 70% 이상 `💦 습함` 풍속 4m/s 이상 `🌬️ 바람 강함` 라벨을 `v-if`로 추가했습니다.

```html
<li>🌡️ 체감온도: {{ city.feelsLike }}°C</li>
<span v-if="city.humidity >= 70" class="label humid">💦 습함 (70% 이상)</span>
<span v-if="city.windSpeed >= 4" class="label windy">🌬️ 바람 강함 (4m/s 이상)</span>
```

## 과제 2. Weather Composition

### 요구사항

1. 반응형 상태 관리 - 검색어(searchQuery) 선택된 도시(selectedCityInfo) 날씨 데이터 배열(weatherList)을 반응형 상태로 정의한다. (1일차 동일)
2. 검색 도시 (computed 활용) - 검색어가 도시 이름에 포함된 항목만 필터링한 Computed 배열(filteredWeatherList)을 만든다.
3. 반응형 변수 변화 감시 (watch, watchEffect) - selectedCityInfo는 `watch`로 감시해 상태바 문구가 바뀔 때마다 콘솔로그를 남기고 searchQuery는 `watchEffect`로 추적해 타이핑할 때마다 콘솔로그를 남긴다.
4. 검색 결과 표시 - 검색어가 비면 원본 데이터를 출력하고 일치하는 데이터가 있으면 해당 데이터를 출력하며 없으면 일치하는 도시가 없다고 안내한다.
5. 본인만의 반응형 상태 변수 Computed Watcher를 추가한다.

### 구현 내용

작성 파일: `src/components/exercise/WeatherComposition.vue` (과제 1 코드를 기반으로 작성)

**1. 반응형 상태 관리**

과제 1의 데이터를 그대로 가져오고 변수명을 요구사항에 맞춰 `searchQuery` `selectedCityInfo` `weatherList`로 정의했습니다.

```js
const weatherList = ref([{ id: 'city_01', name: '서울', temp: 28, status: '맑음', ... }])
const searchQuery = ref('')
const selectedCityInfo = ref('날씨 카드를 클릭하면 선택된 도시가 여기에 표시됩니다.')
```

**2. 검색 도시 (computed)**

검색어를 `trim`한 뒤 비어 있으면 원본 배열을 반환하고 아니면 `filter`와 `includes`로 도시명이 포함된 항목만 반환하는 `filteredWeatherList`를 `computed`로 만들었습니다.

```js
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) {
    return weatherList.value
  }
  return weatherList.value.filter((city) => city.name.includes(query))
})
```

**3. 반응형 변수 변화 감시 (watch, watchEffect)**

`selectedCityInfo`는 `watch`로 이전 값과 새 값을 콘솔에 남기고 `searchQuery`는 `watchEffect` 안에서 읽기만 해도 자동 추적되므로 타이핑할 때마다 콘솔에 찍히게 했습니다.

```js
watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(`[watch] 상태바 변경: "${oldInfo}" → "${newInfo}"`)
})
watchEffect(() => {
  console.log(`[watchEffect] 현재 검색어: "${searchQuery.value}"`)
})
```

**4. 검색 결과 표시**

`v-for` 대상을 `weatherList`에서 `filteredWeatherList`로 바꿔 검색어가 비면 전체 도시가 나오고 일치하는 도시만 남게 했습니다. 결과가 0건이면 `v-if`로 안내 문구를 표시합니다.

```html
<div v-for="city in filteredWeatherList" :key="city.id" class="weather-card"></div>
<p v-if="filteredWeatherList.length === 0" class="no-result">
  😭 검색 결과와 일치하는 도시가 없습니다.
</p>
```

**5. 본인만의 반응형 상태 변수 Computed Watcher 추가 (즐겨찾기)**

즐겨찾기 id 배열 `favoriteIds`와 즐겨찾기만 보기 여부 `showOnlyFavorites`를 반응형 상태로 추가했습니다. 카드의 ★ 버튼을 `@click.stop`으로 눌러 `findIndex` `push` `splice`로 토글합니다.

```js
const favoriteIds = ref([])
const showOnlyFavorites = ref(false)

const toggleFavorite = (cityId) => {
  const index = favoriteIds.value.findIndex((id) => id === cityId)
  if (index === -1) {
    favoriteIds.value.push(cityId)
  } else {
    favoriteIds.value.splice(index, 1)
  }
}
```

`favoriteCount` computed로 개수를 표시하고 `filteredWeatherList` 안에서 즐겨찾기만 보기가 켜져 있으면 `includes`로 먼저 거른 뒤 검색어 필터를 이어서 적용하도록 computed를 체이닝했습니다.

```js
const favoriteCount = computed(() => favoriteIds.value.length)

const baseList = showOnlyFavorites.value
  ? weatherList.value.filter((city) => favoriteIds.value.includes(city.id))
  : weatherList.value
```

`favoriteIds`는 ref로 감싼 배열이라 `push` `splice`로 내부만 바뀌면 일반 `watch`로는 감지되지 않아 `{ deep: true }` 옵션으로 감시하고 변경될 때마다 콘솔로그를 남깁니다.

```js
watch(
  favoriteIds,
  (newIds) => {
    console.log(`[watch deep] 즐겨찾기 변경: ${newIds.length}개 → [${newIds.join(', ')}]`)
  },
  { deep: true },
)
```

```html
<label
  ><input type="checkbox" v-model="showOnlyFavorites" /> ⭐ 즐겨찾기만 보기 ({{ favoriteCount
  }}개)</label
>
<button
  class="btn-favorite"
  :class="{ active: favoriteIds.includes(city.id) }"
  @click.stop="toggleFavorite(city.id)"
>
  ★
</button>
```

즐겨찾기만 보기를 켰는데 담긴 도시가 없으면 `v-if`로 별도 안내를 보여주고 그 외 0건은 기존 검색 결과 없음 안내를 `v-else-if`로 보여줍니다.
