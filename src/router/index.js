import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      component: WeatherHomeView,
    },
    {
      path: '/cities',
      name: 'WeatherCities',
      component: () => import('../views/WeatherCitiesView.vue'),
    },
    {
      path: '/history',
      name: 'WeatherHistory',
      component: () => import('../views/WeatherHistoryView.vue'),
    },
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
      path: '/plan',
      name: 'WeatherPlan',
      component: () => import('../views/WeatherPlanView.vue'),
    },
    {
      path: '/weather/:cityId/spots',
      name: 'WeatherSpots',
      component: () => import('../views/WeatherSpotsView.vue'),
    },
    {
      path: '/spots',
      name: 'NearbySpots',
      component: () => import('../views/WeatherSpotsView.vue'),
    },
    {
      path: '/spot/:contentId',
      name: 'SpotDetail',
      component: () => import('../views/WeatherSpotDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
