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

검색어가 비어 있으면 원본 배열을 반환하고 아니면 `filter`와 `includes`로 도시명이 포함된 항목만 반환하는 `filteredWeatherList`를 `computed`로 만들었습니다.

```js
const filteredWeatherList = computed(() => {
  const query = searchQuery.value
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
<label>
  <input type="checkbox" v-model="showOnlyFavorites" />
  ⭐ 즐겨찾기만 보기 ({{ favoriteCount }}개)
</label>
<button
  class="btn-favorite"
  :class="{ active: favoriteIds.includes(city.id) }"
  @click.stop="toggleFavorite(city.id)"
>
  ★
</button>
```

즐겨찾기만 보기를 켰는데 담긴 도시가 없으면 `v-if`로 별도 안내를 보여주고 그 외 0건은 기존 검색 결과 없음 안내를 `v-else-if`로 보여줍니다.

## 과제 3. Weather Component

### 요구사항

기능 변경 없이 4개의 Component 파일로 분리한다.

1. WeatherParent.vue - 모든 반응형 데이터를 유지한다.
2. BaseDashboardCard.vue - 검색박스와 리스트박스의 디자인을 공통화하고 `<slot>`을 배치해 부모가 도시 검색과 날씨 현황을 주입한다.
3. SearchBar.vue - 부모로부터 검색 도시 반응형 데이터를 전달받아 표시하고(props) 도시 검색 시 update-query 이벤트로 검색어를 부모에게 전달한다(emits).
4. WeatherCard.vue - 선택된 도시 객체를 전달받아 표시하고(props) 카드 선택(select-card)과 상세보기(click-detail)를 부모에게 전달한다(emits).
5. 각 컴포넌트로 분리하면서 해당되는 디자인은 `<style scoped>`로 각각 분리한다.
6. [참고] Slot으로 전달되는 자식 컴포넌트(SearchBar WeatherCard)는 시각적으로는 BaseDashboardCard 내부에 있지만 스크립트적으로는 부모 스코프에서 컴파일되므로 WeatherParent에서 직접 바인딩/통신이 가능하다.
7. 본인의 Mockup 부분에서 추가로 Component하거나 위의 Component를 더 분리하여 추가 Component를 만든다.

### 구현 내용

작성 파일: `src/components/exercise/WeatherParent.vue` `BaseDashboardCard.vue` `SearchBar.vue` `WeatherCard.vue` `WeatherDetailList.vue` (과제 2 코드를 기능 변경 없이 분리)

**1. WeatherParent.vue**

과제 2의 반응형 데이터(`weatherList` `searchQuery` `selectedCityInfo` `favoriteIds` 등)와 computed watch 함수를 전부 부모에 남기고 자식 컴포넌트를 import해 조립했습니다. 자식이 올려보내는 이벤트는 부모 함수로 받아 부모 데이터만 바꿉니다.

```html
<SearchBar :query="searchQuery" @update-query="updateQuery" />
<WeatherCard
  v-for="city in filteredWeatherList"
  :key="city.id"
  :city="city"
  :is-selected="city.id === selectedCityId"
  :is-favorite="favoriteIds.includes(city.id)"
  @select-card="selectCity"
  @click-detail="showDetail"
  @toggle-favorite="toggleFavorite"
/>
```

**2. BaseDashboardCard.vue**

검색박스와 리스트박스가 같이 쓰던 배경 테두리 여백 스타일을 하나로 모으고 내용은 `<slot>`으로 비워 두어 부모가 검색창과 날씨 카드 목록을 각각 주입하도록 했습니다.

```html
<section class="base-dashboard-card">
  <slot></slot>
</section>
```

**3. SearchBar.vue**

`defineProps`로 `query`를 받아 `:value`에 바인딩하고 입력할 때마다 `handleInput` 함수에서 `defineEmits`로 등록한 `update-query` 이벤트에 입력값을 실어 부모로 올립니다. 검색어 자체는 부모만 바꾸므로 한글 입력도 부모의 `searchQuery`로 실시간 동기화됩니다.

```js
defineProps({ query: { type: String, default: '' } })
const emit = defineEmits(['update-query'])

const handleInput = (e) => {
  emit('update-query', e.target.value)
}
```

```html
<input type="text" :value="query" @input="handleInput" />
```

**4. WeatherCard.vue**

도시 객체 `city`(required)와 선택 여부 `isSelected` 즐겨찾기 여부 `isFavorite`를 props로 받아 표시만 담당합니다. 카드 클릭은 `select-card`로 상세보기는 `click-detail`로 도시 객체를 ★ 버튼은 `toggle-favorite`로 id를 `@click.stop`과 함께 부모에게 보냅니다.

```js
defineProps({
  city: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
})
const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

const handleCardClick = (city) => {
  emit('select-card', city)
}
const handleDetailClick = (city) => {
  emit('click-detail', city)
}
```

```html
<div class="weather-card" :class="{ selected: isSelected }" @click="handleCardClick(city)">
  <button class="btn-favorite" @click.stop="handleFavoriteClick(city.id)">★</button>
  <button class="btn-detail" @click.stop="handleDetailClick(city)">상세보기</button>
</div>
```

**5. style scoped 분리**

`exercise.css`에 있던 스타일을 소유 컴포넌트별로 나눠 `<style scoped>`에 넣었습니다. 카드 관련(`.weather-card` `.label` `.btn-detail` 등)은 WeatherCard 검색창 관련(`.search-bar input` `.hint`)은 SearchBar 공통 박스는 BaseDashboardCard 래퍼와 상태바 즐겨찾기 체크박스 빈 결과 안내는 WeatherParent가 가집니다.

**6. Slot 안 자식과 부모의 직접 통신**

SearchBar와 WeatherCard는 BaseDashboardCard의 slot 안에 놓이지만 WeatherParent 템플릿에서 작성되므로 부모 스코프에서 평가됩니다. 그래서 BaseDashboardCard를 거치지 않고 `:query` `@update-query` `v-model="showOnlyFavorites"`처럼 부모 데이터와 직접 바인딩했습니다.

```html
<BaseDashboardCard>
  <SearchBar :query="searchQuery" @update-query="updateQuery" />
  <label>
    <input type="checkbox" v-model="showOnlyFavorites" />
    ⭐ 즐겨찾기만 보기 ({{ favoriteCount }}개)
  </label>
</BaseDashboardCard>
```

**7. 추가 Component (WeatherDetailList.vue)**

과제 1에서 제가 추가한 Mockup 부분인 체감온도 습도 풍속 목록을 WeatherCard에서 `WeatherDetailList.vue`로 한 번 더 분리했습니다. 도시 객체 `city`만 props로 받아 표시하는 컴포넌트이고 이벤트는 없습니다. 목록 스타일(`.detail-list`)도 함께 옮겨 `<style scoped>`로 가집니다.

```js
defineProps({ city: { type: Object, required: true } })
```

```html
<ul class="detail-list">
  <li>🌡️ 체감온도: {{ city.feelsLike }}°C</li>
  <li>💧 습도: {{ city.humidity }}%</li>
  <li>💨 풍속: {{ city.windSpeed }}m/s</li>
</ul>
```

WeatherCard에서는 받은 `city`를 그대로 내려줍니다.

```html
<WeatherDetailList :city="city" />
```

## 과제 4. Weather Router

### 요구사항

1. Vue Router 설정 - 라우터 지연 로딩과 Catch-all Route를 적용한다.
2. App.vue - Navigation Bar(RouterLink)를 추가하고 메인 콘텐츠 영역(RouterView)을 배치한다.
3. WeatherHomeView.vue - WeatherParent를 대체한다. 상세보기 버튼 클릭 시 `window.alert()`를 제거하고 `router.push('/weather/' + id)`로 Programmatic Navigation 처리한다.
4. WeatherDetailView.vue - 지역별 상세 기상관측 정보를 보여준다. 도시 코드에 해당하는 Mock Data를 임시로 활용하고 동적 경로의 cityId를 기반으로 Mount 시점에 도시 객체를 선택한다.
5. WeatherAboutView.vue - 적당한 내용을 작성하고 메인 대시보드로 돌아가기를 작성한다.
6. 상기 정의된 view 이외에 본인의 추가 view를 작성하고 Routing한다.

### 구현 내용

작성 파일: `src/router/index.js` `src/App.vue` `src/views/WeatherHomeView.vue` `WeatherDetailView.vue` `WeatherAboutView.vue` `NotFoundView.vue` `WeatherSpotsView.vue`

과제 4부터 과제 설명에 나오는 프로젝트 폴더 트리에 맞춰 정리했습니다. 이전 과제 코드는 각 과제 브랜치에 남아 있습니다.

**1. Vue Router 설정**

`/`는 첫 화면이라 정적 import하고 나머지 View는 `component: () => import(...)` 동적 import로 지연 로딩했습니다. 상세 페이지는 `/weather/:cityId` 동적 세그먼트로 정의하고 마지막에 `/:pathMatch(.*)*` Catch-all Route를 두어 정의되지 않은 주소는 NotFoundView로 보냅니다.

```js
routes: [
  { path: '/', name: 'WeatherHome', component: WeatherHomeView },
  {
    path: '/about',
    name: 'WeatherAbout',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
]
```

**2. App.vue**

`RouterLink`로 날씨 대시보드(`/`)와 서비스 소개(`/about`) 링크를 가진 Navigation Bar를 만들고 아래 `<main>`에 `RouterView`를 배치했습니다. 내비게이션 스타일은 `<style scoped>`로 App.vue 안에 두었습니다.

```html
<nav class="navigation-bar">
  <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
  <span class="divider">|</span>
  <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
</nav>
<main>
  <RouterView />
</main>
```

**3. WeatherHomeView.vue**

WeatherParent의 반응형 데이터 computed watch 자식 조립을 그대로 옮기고 `showDetail`의 `window.alert`만 `useRouter`의 `router.push`로 바꿨습니다. 이를 위해 WeatherCard의 `click-detail` 이벤트가 도시 객체를 보내도록 해 id를 받을 수 있게 했습니다.

```js
const router = useRouter()

const goDetail = (city) => {
  router.push('/weather/' + city.id)
}
```

```html
<WeatherCard ... @click-detail="goDetail" />
```

**4. WeatherDetailView.vue**

도시 코드를 key로 하는 `mockDetails` 객체를 두고 `useRoute`의 `route.params.cityId`를 `onMounted` 시점에 읽어 해당 도시 객체를 `cityData`에 담았습니다. 없는 코드면 `v-else`로 안내하고 체감온도 습도 풍속은 과제 3의 `WeatherDetailList`를 재사용해 표시합니다. 돌아가기 버튼은 `router.push('/')`입니다.

```js
const route = useRoute()
const cityData = ref(null)

onMounted(() => {
  const cityId = route.params.cityId
  if (mockDetails[cityId]) {
    cityData.value = mockDetails[cityId]
  }
})
```

```html
<div v-if="cityData" class="detail-card">
  <h3>📍 {{ cityData.name }}</h3>
  <WeatherDetailList :city="cityData" />
</div>
<div v-else class="detail-card">
  <p class="no-data">😭 "{{ route.params.cityId }}"에 해당하는 도시 정보가 없습니다.</p>
</div>
```

**5. WeatherAboutView.vue**

서비스 소개 문구와 기능 목록을 적고 `RouterLink`로 메인 대시보드로 돌아가기 링크를 두었습니다. NotFoundView도 같은 방식으로 돌아가기 링크를 가집니다.

```html
<RouterLink to="/" class="link-home">← 메인 대시보드로 돌아가기</RouterLink>
```

**6. 추가 View (WeatherSpotsView.vue - 관광지 날씨)**

도시별 주요 관광지와 그 위치의 현재 날씨를 보여주는 View를 추가했습니다. 경로는 상세 페이지 아래에 붙는 `/weather/:cityId/spots`로 두어 중간에 동적 세그먼트가 오는 형태로 정의하고 Catch-all Route 앞에 지연 로딩으로 추가했습니다.

```js
{
  path: '/weather/:cityId/spots',
  name: 'WeatherSpots',
  component: () => import('../views/WeatherSpotsView.vue'),
}
```

도시 코드를 key로 하는 `mockSpots`(도시명과 관광지 배열: 이름 분류 주소 기온 상태)를 두고 상세 페이지와 같은 방식으로 `onMounted` 시점에 `route.params.cityId`로 선택해 `v-for`로 관광지 카드를 출력합니다. 없는 코드면 `v-else`로 안내합니다.

```html
<div v-for="spot in spotData.spots" :key="spot.id" class="spot-card">
  <h3>{{ spot.name }}</h3>
  <p class="address">📍 {{ spot.address }}</p>
  <p class="weather">🌡️ {{ spot.temp }}°C · {{ spot.status }}</p>
</div>
```

진입은 WeatherDetailView의 `🏞️ 관광지 날씨 보기` 버튼에서 `router.push`로 하고 관광지 페이지에는 상세로 돌아가는 버튼(`router.push`)과 메인 대시보드 `RouterLink`를 두었습니다.

```js
const goSpots = () => {
  router.push('/weather/' + route.params.cityId + '/spots')
}
```

## 과제 5. Weather Store

### 요구사항

날씨 단위를 세팅하는 `stores/configStore.js`를 작성한다. state `unit`(초기값 celsius) getters `unitSymbol`(℃ / ℉) actions `toggleUnit`(celsius와 fahrenheit 토글)

1. UnitToggler.vue - 대시보드 상단에 배치되어 단위 설정을 변경하는 UI 버튼과 영역
2. Navigation Bar 옆에 UnitToggler.vue 배치
3. 메인과 상세 날씨에 단위 설정 변경 적용
4. 본인만의 추가 Store를 작성하고 활용하거나 configStore에 state getter action을 추가한다.

### 구현 내용

작성 파일: `src/stores/configStore.js` `src/stores/favoriteStore.js` `src/components/exercise/UnitToggler.vue` (수정: `App.vue` `WeatherCard.vue` `WeatherDetailList.vue` `WeatherHomeView.vue` `WeatherDetailView.vue` `WeatherSpotsView.vue`)

**configStore.js**

`defineStore` 안에서 state는 `ref` getters는 `computed` actions는 함수로 작성하고 `return`으로 공개했습니다.

```js
export const useConfigStore = defineStore('config', () => {
  const unit = ref('celsius')

  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })

  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return { unit, unitSymbol, toggleUnit }
})
```

**1. UnitToggler.vue**

`useConfigStore()`로 스토어를 가져와 현재 단위를 표시하고 버튼 클릭 시 `toggleUnit` 액션을 호출합니다.

```html
<span class="unit-label">
  단위: <strong>{{ configStore.unit === 'celsius' ? '섭씨(℃)' : '화씨(℉)' }}</strong>
</span>
<button class="btn-toggle" @click="configStore.toggleUnit">단위 변경</button>
```

**2. Navigation Bar 옆에 배치**

App.vue의 `<nav>` 안 RouterLink 오른쪽에 `<UnitToggler />`를 두었습니다.

```html
<nav class="navigation-bar">
  <RouterLink to="/" class="nav-item">🌦️ 날씨 대시보드</RouterLink>
  <span class="divider">|</span>
  <RouterLink to="/about" class="nav-item">ℹ️ 서비스 소개</RouterLink>
  <UnitToggler />
</nav>
```

**3. 메인과 상세 날씨에 단위 적용**

온도를 보여주는 곳마다 `configStore.unit`이 fahrenheit이면 화씨로 변환하는 `computed`를 두고 기호는 `configStore.unitSymbol`로 붙였습니다. 메인 카드(WeatherCard)의 기온과 체감온도(WeatherDetailList) 상세 페이지의 기온 최저 최고 관광지 페이지의 기온에 적용했습니다.

```js
const props = defineProps({ city: { type: Object, required: true } })
const configStore = useConfigStore()

const displayTemp = computed(() => {
  const rawTemp = props.city.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return rawTemp
})
```

```html
<span class="temp">{{ displayTemp }}{{ configStore.unitSymbol }}</span>
```

상세 페이지는 기온 최저 최고 세 값을 바꿔야 해서 같은 변환식을 `convertTemp` 함수로 두고 세 개의 `computed`에서 호출했습니다. 관광지 페이지는 `v-for` 목록이라 템플릿에서 `convertTemp(spot.temp)`를 직접 호출합니다.

```js
const displayTemp = computed(() => convertTemp(cityData.value.temp))
const displayTempMin = computed(() => convertTemp(cityData.value.tempMin))
const displayTempMax = computed(() => convertTemp(cityData.value.tempMax))
```

**4. 추가 Store (favoriteStore.js - 즐겨찾기)**

과제 2부터 WeatherHomeView 안에 있던 즐겨찾기 상태를 `favoriteStore`로 옮겼습니다. 컴포넌트 안에 있을 때는 상세 페이지로 이동하면 즐겨찾기를 알 수 없고 홈을 떠났다 오면 초기화되는데 스토어로 두면 어느 페이지에서나 같은 값을 공유합니다. state `favoriteIds` getters `favoriteCount` actions `toggleFavorite` 구조는 그대로입니다.

```js
export const useFavoriteStore = defineStore('favorite', () => {
  const favoriteIds = ref([])

  const favoriteCount = computed(() => favoriteIds.value.length)

  function toggleFavorite(cityId) {
    const index = favoriteIds.value.findIndex((id) => id === cityId)
    if (index === -1) {
      favoriteIds.value.push(cityId)
    } else {
      favoriteIds.value.splice(index, 1)
    }
  }

  return { favoriteIds, favoriteCount, toggleFavorite }
})
```

WeatherHomeView는 로컬 `favoriteIds` `favoriteCount` `toggleFavorite`를 지우고 스토어를 바로 바인딩합니다. 즐겨찾기 변경 감시 `watch`는 감시 대상을 `() => favoriteStore.favoriteIds`로 바꿔 유지했습니다.

```html
<WeatherCard
  :is-favorite="favoriteStore.favoriteIds.includes(city.id)"
  @toggle-favorite="favoriteStore.toggleFavorite"
/>
```

WeatherDetailView에도 같은 스토어로 ★ 버튼을 두어 상세 페이지에서 토글한 즐겨찾기가 홈 카드와 개수에 그대로 반영됩니다.

```html
<button
  :class="{ active: favoriteStore.favoriteIds.includes(route.params.cityId) }"
  @click="favoriteStore.toggleFavorite(route.params.cityId)"
>
  ★
</button>
```

## 과제 6. Weather Axios

### 요구사항

Axios 라이브러리를 설치하고 OpenWeatherMap API 키를 발급받는다.

1. OpenWeatherMap API를 통해 실제 날씨 데이터를 가져와 적용한다.
2. OpenWeatherMap에서 제공되는 API를 추가하여 Application 기능을 확장한다.
3. 기타 외부 API를 추가하여 Application 기능을 확장한다.

### 구현 내용

수정 파일: `WeatherHomeView.vue` `WeatherDetailView.vue` `WeatherSpotsView.vue`

API 키는 루트의 `.env` 파일에 `VITE_` 접두사 환경 변수로 두고 각 View에서 `import.meta.env`로 읽습니다. `.env`는 `.gitignore`에 넣어 저장소에 올리지 않고 `.env.example`에 변수 이름만 남겼습니다. 실행하려면 `.env.example`을 `.env`로 복사해 OpenWeatherMap 키와 공공데이터포털(한국관광공사) 키를 채우면 됩니다.

```
VITE_OPENWEATHER_API_KEY=발급받은_키
VITE_TOUR_API_KEY=발급받은_키
```

```js
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
```

**1. OpenWeatherMap 실제 날씨 적용**

메인 대시보드는 mock 배열 대신 도시 목록(`id` 한글명 영문명)만 두고 `onMounted`에서 `axios.all`로 5개 도시의 Current Weather API를 동시에 호출해 기존 카드가 쓰던 필드(`temp` `status` `feelsLike` `humidity` `windSpeed`)로 매핑했습니다. 호출 중에는 `isLoading`으로 로딩 문구를 실패하면 `errorMessage`를 보여줍니다.

```js
const fetchWeatherList = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const requests = cityList.map((city) =>
      axios.get(`${BASE_URL}/weather?q=${city.english}&appid=${API_KEY}&units=metric&lang=kr`),
    )
    const responses = await axios.all(requests)
    weatherList.value = responses.map((response, index) => ({
      id: cityList[index].id,
      name: cityList[index].name,
      temp: Math.round(response.data.main.temp),
      status: response.data.weather[0].description,
      feelsLike: Math.round(response.data.main.feels_like),
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
    }))
  } catch (error) {
    console.error('날씨 API 호출 실패:', error)
    errorMessage.value = '날씨 데이터를 가져오지 못했습니다. API Key와 네트워크를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}
```

상세 페이지도 `mockDetails`를 지우고 `cityMapping`의 영문명으로 같은 API를 호출해 기온 최저 최고 체감 습도 풍속을 채웁니다.

**2. OpenWeatherMap API 추가 (Air Pollution)**

상세 페이지에서 Current Weather 응답의 `coord`로 Air Pollution API를 한 번 더 호출해 대기질 지수(`aqi` 1~5)와 PM2.5 PM10을 표시합니다. 지수는 `aqiLabels` 배열로 좋음~매우 나쁨 문구를 붙이고 `:class`로 색을 바꿉니다.

```js
const airResponse = await axios.get(
  `${BASE_URL}/air_pollution?lat=${raw.coord.lat}&lon=${raw.coord.lon}&appid=${API_KEY}`,
)
const air = airResponse.data.list[0]
airData.value = {
  aqi: air.main.aqi,
  pm25: Math.round(air.components.pm2_5),
  pm10: Math.round(air.components.pm10),
}
```

```html
<p v-if="airData" class="air">
  🌫️ 대기질: <strong :class="'aqi-' + airData.aqi">{{ aqiLabels[airData.aqi] }}</strong>
  (PM2.5 {{ airData.pm25 }} / PM10 {{ airData.pm10 }} ㎍/㎥)
</p>
```

**3. 기타 외부 API 추가 (한국관광공사 TourAPI)**

관광지 페이지는 mock 대신 도시별로 정해 둔 유명 관광지 이름 5개를 TourAPI 키워드 검색(`searchKeyword2`)으로 `axios.all` 조회해 이름 주소 대표 이미지 위경도를 받고 각 관광지의 위경도(`mapy` `mapx`)로 OpenWeather를 다시 `axios.all` 호출해 관광지별 현재 기온과 날씨를 붙였습니다.

```js
const cityMapping = {
  city_01: { name: '서울', spots: ['경복궁', '북촌한옥마을', '청계천', '덕수궁', '남산서울타워'] },
  ...
}

const tourRequests = targetCity.spots.map((keyword) =>
  axios.get(`${TOUR_BASE_URL}/searchKeyword2?serviceKey=${TOUR_API_KEY}&MobileOS=ETC&MobileApp=SkalaWeather&_type=json&keyword=${keyword}&contentTypeId=12&arrange=A&numOfRows=1&pageNo=1`),
)
const tourResponses = await axios.all(tourRequests)
const items = tourResponses.map((response) => response.data.response.body.items.item[0])

const weatherRequests = items.map((item) =>
  axios.get(`${BASE_URL}/weather?lat=${item.mapy}&lon=${item.mapx}&appid=${API_KEY}&units=metric&lang=kr`),
)
const weatherResponses = await axios.all(weatherRequests)
```

```html
<img v-if="spot.image" :src="spot.image" :alt="spot.name" class="spot-image" />
<p class="weather">
  🌡️ {{ convertTemp(spot.temp) }}{{ configStore.unitSymbol }} · {{ spot.status }}
</p>
```

## 과제 7. Weather UI Library

### 요구사항

외부 UI Library를 선정하고 3일차 과제(Weather Axios)에 자유롭게 적용한다.

### 구현 내용

선정: **Element Plus** - 교재에서 설치부터 컴포넌트 표까지 다룬 라이브러리이고 데이터 중심 대시보드에 맞아 선택했습니다. 기존 로직(스토어 라우터 API 호출)은 그대로 두고 화면 표시 부분만 Element Plus 컴포넌트로 바꿨습니다.

수정 파일: `main.js` `components/exercise/BaseDashboardCard.vue` `SearchBar.vue` `UnitToggler.vue` `WeatherCard.vue` `WeatherDetailList.vue` `views/WeatherHomeView.vue` `WeatherDetailView.vue` `WeatherSpotsView.vue` `WeatherAboutView.vue` `NotFoundView.vue`

**설치와 등록**

`npm install element-plus` 후 `main.js`에서 모듈과 CSS를 불러와 `app.use`로 등록했습니다.

```js
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

app.use(ElementPlus)
```

**적용한 컴포넌트**

- 검색창은 `el-input` 즐겨찾기만 보기는 `el-checkbox`로 바꿨습니다.
- 단위 표시와 단위 변경 버튼은 `el-tag` `el-button`으로 바꿨습니다.
- 검색박스 날씨 카드 상세 카드 관광지 카드는 `el-card`로 감쌌습니다.
- 더움 습함 바람 라벨과 대기질 등급은 `el-tag`의 `type`으로 색을 줬습니다.
- 체감온도 습도 풍속 목록은 `el-descriptions` 관광지 사진은 `el-image`를 썼습니다.
- 로딩은 `v-loading` 실패 문구와 상태바는 `el-alert` 결과 없음은 `el-empty`로 처리했습니다.
- 404 페이지는 `el-result`로 바꿨습니다.

SearchBar는 부모 props를 받아 표시만 하므로 `v-model` 대신 `:model-value`와 `@input`으로 값을 받고 부모로 올립니다. `el-input`의 `input` 이벤트는 입력값 자체를 넘겨주므로 핸들러가 값을 그대로 emit합니다.

```html
<el-input
  :model-value="query"
  placeholder="도시 이름을 한글로 입력하세요 (예: 서울)"
  clearable
  @input="handleInput"
/>
```

```js
const handleInput = (value) => {
  emit('update-query', value)
}
```

로딩은 목록 영역에 `v-loading`을 걸고 실패와 결과 없음은 `el-alert` `el-empty`로 바꿨습니다.

```html
<div v-loading="isLoading" class="card-list">
  <el-alert v-if="errorMessage" type="error" :title="errorMessage" :closable="false" />
  <template v-else>
    <WeatherCard v-for="city in filteredWeatherList" ... />
    <el-empty
      v-if="!isLoading && filteredWeatherList.length === 0"
      description="😭 검색 결과와 일치하는 도시가 없습니다."
    />
  </template>
</div>
```

라벨은 `el-tag`의 `type`으로 색을 정합니다. 대기질은 등급별 type 배열을 두고 바인딩했습니다.

```html
<el-tag v-if="city.temp >= 25" type="danger" size="small">🔥 더움 (25도 이상)</el-tag>
<el-tag v-else type="primary" size="small">❄️ 선선함 (25도 미만)</el-tag>
```

```js
const aqiTypes = ['', 'success', 'success', 'warning', 'danger', 'danger']
```

```html
<el-tag :type="aqiTypes[airData.aqi]" size="small">{{ aqiLabels[airData.aqi] }}</el-tag>
```
