/**
 * 🗺️ 路由管理模組 (Router Management Module)
 * 登革熱分析系統的路由管理
 *
 * @description 定義應用程式的所有路由配置，包含路由守衛和路由過渡動畫
 * @author 登革熱分析團隊
 * @version 1.0.0
 */

import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

/**
 * 📍 路由配置陣列
 * 定義應用程式的所有路由規則
 */
const routes = [
  {
    path: '/', // 🏠 根路徑
    name: 'Home', // 路由名稱
    component: HomeView, // 對應的 Vue 組件
  },
];

/**
 * 🛣️ 路由器實例創建
 *
 * 配置說明：
 * - history: 使用 HTML5 History API 模式
 * - base: 設定應用程式的基礎路徑為 '/schematic-map-rwd/'
 * - routes: 路由配置陣列
 */
const router = createRouter({
  history: createWebHistory('/schematic-map-rwd/'),
  routes,
});

export default router;
