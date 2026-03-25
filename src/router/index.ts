import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import QuizPage from '../pages/QuizPage.vue'
import ResultPage from '../pages/ResultPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: QuizPage,
  },
  {
    path: '/result',
    name: 'result',
    component: ResultPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
