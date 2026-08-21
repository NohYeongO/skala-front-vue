<script setup>
import { ref } from 'vue'

const repoUrl = 'https://github.com/NohYeongO/skala-front-vue'
const archiveBase = import.meta.env.BASE_URL + 'archive/'

const activeItem = ref(null)
const showViewer = ref(false)

const openViewer = (item) => {
  activeItem.value = item
  showViewer.value = true
}

const assignments = [
  {
    number: 1,
    title: 'Weather Mockup',
    unit: 'Vue Syntax',
    branch: 'weather-mockup',
    archive: '01-mockup',
    pr: 1,
    summary:
      'v-for로 날씨 카드 반복 출력, 25도 기준 v-if 라벨, :value/@input으로 한글 검색어 실시간 반영, 카드 클릭 상태바와 @click.stop 상세보기 alert. 광주·울산 도시와 체감온도·습도·풍속 필드를 추가했습니다.',
    files: ['src/components/exercise/WeatherMockup.vue', 'src/assets/exercise.css'],
    learned: ['v-for / :key', 'v-if / v-else', ':value + @input', '@click.stop', ':class'],
  },
  {
    number: 2,
    title: 'Weather Composition',
    unit: 'Composition API',
    branch: 'weather-composition',
    archive: '02-composition',
    pr: 2,
    summary:
      'filteredWeatherList를 computed로 만들고 selectedCityInfo는 watch, searchQuery는 watchEffect로 감시했습니다. 즐겨찾기 상태(favoriteIds) computed(favoriteCount) deep watch를 직접 추가했습니다.',
    files: ['src/components/exercise/WeatherComposition.vue'],
    learned: ['computed', 'watch / deep watch', 'watchEffect', 'v-model checkbox'],
  },
  {
    number: 3,
    title: 'Weather Component',
    unit: 'Vue Components',
    branch: 'weather-component',
    archive: '03-component',
    pr: 3,
    summary:
      '기능 변경 없이 WeatherParent · BaseDashboardCard(slot) · SearchBar(props/emits) · WeatherCard(props/emits)로 분리하고 디자인을 scoped style로 나눴습니다. 체감온도·습도·풍속 목록은 WeatherDetailList로 한 번 더 분리했습니다.',
    files: [
      'src/components/exercise/WeatherParent.vue',
      'src/components/exercise/BaseDashboardCard.vue',
      'src/components/exercise/SearchBar.vue',
      'src/components/exercise/WeatherCard.vue',
      'src/components/exercise/WeatherDetailList.vue',
    ],
    learned: ['defineProps', 'defineEmits / emit', '<slot>', '<style scoped>'],
  },
  {
    number: 4,
    title: 'Weather Router',
    unit: 'Vue Router',
    branch: 'weather-router',
    archive: '04-router',
    pr: 4,
    summary:
      '지연 로딩 라우트와 Catch-all을 설정하고 App.vue에 내비게이션(RouterLink)과 RouterView를 배치했습니다. 상세보기는 router.push로 /weather/:cityId 상세 페이지로 이동하고 관광지 날씨 View(/weather/:cityId/spots)를 추가했습니다. 이 과제부터 교재 폴더 트리로 정리했습니다.',
    files: [
      'src/router/index.js',
      'src/views/WeatherHomeView.vue',
      'src/views/WeatherDetailView.vue',
      'src/views/WeatherAboutView.vue',
      'src/views/WeatherSpotsView.vue',
      'src/views/NotFoundView.vue',
    ],
    learned: ['createRouter / 지연 로딩', '동적 세그먼트 useRoute', 'router.push', 'Catch-all'],
  },
  {
    number: 5,
    title: 'Weather Store',
    unit: 'Pinia',
    branch: 'weather-store',
    archive: '05-store',
    pr: 5,
    summary:
      'configStore(unit / unitSymbol / toggleUnit)와 UnitToggler를 만들어 내비게이션 옆에 두고 메인·상세·관광지 기온에 단위 변환을 적용했습니다. 즐겨찾기는 favoriteStore로 옮겨 상세 페이지에서도 ★를 토글할 수 있게 했습니다.',
    files: [
      'src/stores/configStore.js',
      'src/stores/favoriteStore.js',
      'src/components/exercise/UnitToggler.vue',
    ],
    learned: ['defineStore', 'state / getters / actions', 'useXxxStore()'],
  },
  {
    number: 6,
    title: 'Weather Axios',
    unit: 'Axios',
    branch: 'weather-axios',
    archive: '06-axios',
    pr: 6,
    summary:
      'OpenWeatherMap Current Weather로 실제 날씨를 적용하고 Air Pollution API로 대기질을 추가했습니다. 한국관광공사 TourAPI로 관광지를 받아 관광지마다 OpenWeather를 호출해 날씨를 붙였습니다. 키는 .env의 VITE_ 변수로 관리합니다.',
    files: [
      'src/views/WeatherHomeView.vue',
      'src/views/WeatherDetailView.vue',
      'src/views/WeatherSpotsView.vue',
      '.env.example',
    ],
    learned: [
      'axios.get / axios.all',
      'async / await / try-catch-finally',
      'isLoading 처리',
      'import.meta.env',
    ],
  },
  {
    number: 7,
    title: 'Weather UI Library',
    unit: 'UI Libraries',
    branch: 'weather-ui-library',
    archive: '07-ui-library',
    pr: 7,
    summary:
      'Element Plus를 등록하고 el-input · el-checkbox · el-button · el-tag · el-card · el-descriptions · el-image · el-alert · el-empty · el-result · v-loading으로 화면 표시 부분을 교체했습니다. 로직(스토어 라우터 API)은 그대로 두었습니다.',
    files: ['src/main.js', 'src/components/exercise/*.vue', 'src/views/*.vue'],
    learned: ['app.use(ElementPlus)', 'el-* 컴포넌트', 'v-loading'],
  },
]
</script>

<template>
  <div class="history-wrapper">
    <h2>📚 과제 기록</h2>
    <p class="intro">
      과제 1부터 7까지 단계별로 만든 화면과 구성입니다. 각 단계는 GitHub 브랜치에 그대로 남아 있어
      브랜치 링크를 누르면 당시 코드를 볼 수 있습니다. 현재 앱은 이 단계들을 이어받아 과제
      8(확장)에서 지도 · 추천 코스 · 관광지 카드로 발전시킨 결과입니다.
    </p>

    <el-timeline>
      <el-timeline-item
        v-for="item in assignments"
        :key="item.number"
        :timestamp="`과제 ${item.number} · ${item.unit}`"
        placement="top"
        type="primary"
        :hollow="item.number !== 7"
      >
        <el-card shadow="hover" class="history-card fade-up">
          <div class="history-body">
            <div class="history-info">
              <h3>{{ item.title }}</h3>
              <p class="summary">{{ item.summary }}</p>
              <div class="learned">
                <el-tag v-for="tag in item.learned" :key="tag" size="small" round>{{ tag }}</el-tag>
              </div>
              <details class="files">
                <summary>당시 구성 파일 {{ item.files.length }}개</summary>
                <ul>
                  <li v-for="file in item.files" :key="file">
                    <code>{{ file }}</code>
                  </li>
                </ul>
              </details>
              <div class="links">
                <el-button type="primary" size="small" round @click="openViewer(item)">
                  🔍 실제 화면 열기
                </el-button>
                <el-button
                  tag="a"
                  :href="`${repoUrl}/tree/${item.branch}`"
                  target="_blank"
                  size="small"
                  type="primary"
                  plain
                  round
                >
                  브랜치 {{ item.branch }}
                </el-button>
                <el-button
                  tag="a"
                  :href="`${repoUrl}/pull/${item.pr}`"
                  target="_blank"
                  size="small"
                  round
                >
                  PR #{{ item.pr }}
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <el-dialog
      v-model="showViewer"
      :title="activeItem ? `과제 ${activeItem.number} · ${activeItem.title} (당시 빌드)` : ''"
      width="min(1100px, 96vw)"
      top="4vh"
      class="viewer-dialog"
      destroy-on-close
    >
      <div v-if="activeItem" class="viewer">
        <div class="viewer-bar">
          <span>당시 앱을 그대로 빌드한 화면입니다. 안에서 버튼과 링크를 눌러 보세요.</span>
          <a :href="archiveBase + activeItem.archive + '/'" target="_blank" class="viewer-link"
            >새 탭에서 열기 ↗</a
          >
        </div>
        <iframe
          :src="archiveBase + activeItem.archive + '/'"
          :title="`과제 ${activeItem.number} ${activeItem.title}`"
          class="viewer-frame"
        ></iframe>
        <p class="viewer-note">
          화면이 비어 있으면 아직 배포되지 않은 환경입니다. 로컬에서는 `npm run build:all` 후 `npm
          run preview`로 확인할 수 있습니다.
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.history-wrapper {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
}
.history-wrapper h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 10px;
}
.intro {
  font-size: 14px;
  line-height: 1.7;
  color: var(--ink-700);
  margin-bottom: 18px;
}
.history-card {
  border-radius: 22px 22px 22px 6px;
}
.history-body {
  display: flex;
  gap: 16px;
}
.history-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.history-info h3 {
  font-size: 1.1rem;
  font-weight: 700;
}
.summary {
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink-700);
}
.learned {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.files summary {
  font-size: 13px;
  color: var(--sky-600);
  cursor: pointer;
}
.files ul {
  margin: 6px 0 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--ink-500);
  line-height: 1.7;
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.links .el-button + .el-button {
  margin-left: 0;
}
.viewer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.viewer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--ink-500);
}
.viewer-link {
  color: var(--sky-600);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}
.viewer-frame {
  width: 100%;
  height: min(72vh, 760px);
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 14px;
  background: #fff;
}
.viewer-note {
  font-size: 12px;
  color: var(--ink-500);
}
@media (max-width: 640px) {
  .viewer-frame {
    height: 65vh;
  }
  .history-body {
    flex-direction: column;
  }
}
</style>
