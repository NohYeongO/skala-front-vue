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
