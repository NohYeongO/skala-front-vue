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

도시 객체 `city`(required)와 선택 여부 `isSelected` 즐겨찾기 여부 `isFavorite`를 props로 받아 표시만 담당합니다. 카드 클릭은 `select-card`로 도시 객체를 상세보기는 `click-detail`로 도시명과 상태를 ★ 버튼은 `toggle-favorite`로 id를 `@click.stop`과 함께 부모에게 보냅니다.

```js
defineProps({
  city: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
})
const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])
```

```html
<div class="weather-card" :class="{ selected: isSelected }" @click="emit('select-card', city)">
  <button class="btn-favorite" @click.stop="emit('toggle-favorite', city.id)">★</button>
  <button class="btn-detail" @click.stop="emit('click-detail', city.name, city.status)">
    상세보기
  </button>
</div>
```

**5. style scoped 분리**

`exercise.css`에 있던 스타일을 소유 컴포넌트별로 나눠 `<style scoped>`에 넣었습니다. 카드 관련(`.weather-card` `.label` `.btn-detail` 등)은 WeatherCard 검색창 관련(`.search-bar input` `.hint`)은 SearchBar 공통 박스는 BaseDashboardCard 래퍼와 상태바 즐겨찾기 체크박스 빈 결과 안내는 WeatherParent가 가집니다.

**6. Slot 안 자식과 부모의 직접 통신**

SearchBar와 WeatherCard는 BaseDashboardCard의 slot 안에 놓이지만 WeatherParent 템플릿에서 작성되므로 부모 스코프에서 평가됩니다. 그래서 BaseDashboardCard를 거치지 않고 `:query` `@update-query` `v-model="showOnlyFavorites"`처럼 부모 데이터와 직접 바인딩했습니다.

```html
<BaseDashboardCard>
  <SearchBar :query="searchQuery" @update-query="updateQuery" />
  <label
    ><input type="checkbox" v-model="showOnlyFavorites" /> ⭐ 즐겨찾기만 보기 ({{ favoriteCount
    }}개)</label
  >
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
