/**
 * 🚀 應用程式主入口文件 (Main Application Entry Point)
 *
 * 功能說明 (Features):
 * 1. 🎨 引入 Bootstrap 5 和自定義主題樣式系統
 * 2. 🧩 初始化 Vue 3 應用程式和全域組件註冊
 * 3. 🗺️ 設定 Vue Router 4 路由導航系統
 * 4. 📦 配置 Pinia 狀態管理系統
 * 5. 🌍 掛載應用程式到 DOM 容器中
 * 6. 🔧 整合第三方庫（Leaflet、Font Awesome、Bootstrap）
 * 7. 🐛 提供開發環境調試資訊輸出
 *
 * 技術棧 (Technology Stack):
 * - Vue 3 (Composition API) - 現代化前端框架
 * - Vue Router 4 - 單頁應用路由管理
 * - Pinia - Vue 3 官方推薦的狀態管理庫
 * - Bootstrap 5 - 響應式 UI 框架
 * - Leaflet - 開源地圖庫
 * - Font Awesome - 圖示字體庫
 * - D3.js - 數據視覺化庫
 * - Turf.js - 地理空間分析庫
 *
 * 架構設計 (Architecture Design):
 * - 採用 Composition API 提供更好的 TypeScript 支援
 * - 使用 Pinia 進行集中式狀態管理
 * - 模組化的樣式系統，支援主題切換
 * - 完整的第三方庫整合和配置
 *
 * 開發環境 (Development Environment):
 * - 支援熱重載和快速開發
 * - 整合 ESLint 和 Prettier 程式碼品質控制
 * - 提供詳細的調試資訊輸出
 *
 * @file main.js
 * @version 2.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 */

// ==================== 🔧 Vue 核心模組引入 (Vue Core Module Imports) ====================

/**
 * Vue 3 核心功能引入
 * 使用 createApp 創建 Vue 應用程式實例，支援 Composition API
 */
import { createApp } from 'vue';

/**
 * Pinia 狀態管理庫引入
 * Vue 3 官方推薦的狀態管理解決方案，提供更好的 TypeScript 支援
 */
import { createPinia } from 'pinia';

// ==================== 🧩 應用程式組件引入 (Application Component Imports) ====================

/**
 * 應用程式根組件
 * 定義整體佈局結構和全域狀態管理
 */
import App from './App.vue';

/**
 * Vue Router 路由配置
 * 管理單頁應用的路由導航和頁面切換
 */
import router from './router';

// ==================== 🎨 第三方樣式文件引入 (Third-Party Style Files) ====================

/**
 * Bootstrap 5 CSS 框架
 * 提供響應式佈局系統、UI 組件和工具類
 * 版本：5.3.0
 */
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Leaflet 地圖核心樣式
 * 包含地圖容器、控制項、圖層等基本樣式
 * 版本：1.9.0
 */
import 'leaflet/dist/leaflet.css';

/**
 * Font Awesome 圖示庫
 * 提供豐富的圖示字體，支援品牌圖示和通用圖示
 * 版本：6.7.2
 */
import '@fortawesome/fontawesome-free/css/all.min.css';

// ==================== 🎨 自定義樣式文件引入 (Custom Style Files) ====================

/**
 * 共用樣式文件
 * 包含自定義 CSS 變數、主題配置和通用樣式
 * 整合了所有組件的樣式定義
 */
import './assets/css/common.css';

// ==================== ⚙️ 第三方 JavaScript 文件引入 (Third-Party JavaScript Files) ====================

/**
 * Bootstrap 5 JavaScript 功能
 * 包含 Popper.js，提供以下互動功能：
 * - 下拉選單 (Dropdown)
 * - 模態框 (Modal)
 * - 工具提示 (Tooltip)
 * - 彈出提示 (Popover)
 * - 手風琴 (Collapse)
 * - 輪播圖 (Carousel)
 * 版本：5.3.0
 */
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// ==================== 🐛 開發環境調試資訊 (Development Debug Information) ====================

/**
 * 樣式文件載入完成確認
 * 在開發環境中提供視覺化確認，確保所有樣式正確載入
 */
console.log('🎨 樣式文件載入完成');

// ==================== 🚀 Vue 應用程式實例創建與配置 (Vue Application Instance Creation) ====================

/**
 * 創建 Vue 3 應用程式實例
 * 使用 createApp 函數創建應用程式實例，傳入根組件 App
 *
 * @type {App} Vue 應用程式實例
 */
const app = createApp(App);

// ==================== 📦 Pinia 狀態管理實例創建 (Pinia State Management Instance Creation) ====================

/**
 * 創建 Pinia 狀態管理實例
 * Pinia 是 Vue 3 官方推薦的狀態管理庫，提供更好的 TypeScript 支援
 * 和更簡潔的 API 設計
 *
 * @type {Store} Pinia 狀態管理實例
 */
const pinia = createPinia();

// ==================== 🗺️ 路由系統註冊 (Router System Registration) ====================

/**
 * 註冊 Vue Router 路由系統
 * 啟用單頁應用的路由導航功能，支援：
 * - 程式碼分割和懶載入
 * - 路由守衛和導航守衛
 * - 動態路由和嵌套路由
 * - 歷史模式路由
 */
app.use(router);

// ==================== 📦 狀態管理系統註冊 (State Management System Registration) ====================

/**
 * 註冊 Pinia 狀態管理系統
 * 啟用全域狀態管理功能，支援：
 * - 集中式狀態管理
 * - 響應式狀態更新
 * - 模組化狀態組織
 * - 開發者工具支援
 */
app.use(pinia);

// ==================== 🌍 應用程式掛載 (Application Mounting) ====================

/**
 * 將 Vue 應用程式掛載到 DOM 元素
 * 將應用程式實例掛載到 index.html 中 id="app" 的元素上
 * 這會觸發應用程式的初始化和渲染過程
 *
 * @param {string} '#app' - DOM 元素選擇器
 */
app.mount('#app');

// ==================== 🐛 應用程式啟動完成調試資訊 (Application Startup Debug Information) ====================

/**
 * 輸出應用程式啟動完成的調試資訊
 * 在開發環境中提供詳細的啟動狀態確認
 * 幫助開發者確認所有系統組件正確初始化
 */
console.log('🚀 登革熱分析平台已啟動');
console.log('📦 Pinia 狀態管理已初始化');
console.log('🗺️ Vue Router 路由系統已就緒');
console.log('🎨 Bootstrap 5 UI 框架已載入');
console.log('🗺️ Leaflet 地圖庫已準備就緒');
console.log('🔤 Font Awesome 圖示庫已載入');
