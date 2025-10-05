<script>
  /**
   * 🏠 App.vue - 應用程式主組件 (Main Application Component)
   *
   * 功能說明 (Features):
   * 1. 🏗️ 提供應用程式整體框架和佈局結構
   * 2. ⏳ 管理全域載入狀態和進度顯示
   * 3. 🦶 提供應用程式頁腳，包含版權和技術資訊
   * 4. 🚀 管理 Vue Router 的路由導航系統
   * 5. 📱 實現響應式滿版佈局，無邊距和空隙
   * 6. 🎨 整合全域樣式系統和主題配置
   * 7. 🔧 提供全域錯誤處理和異常捕獲
   *
   * 架構說明 (Architecture):
   * - 內容層：路由視圖容器，動態顯示不同頁面組件
   * - 狀態層：整合 Pinia 狀態管理系統
   * - 樣式層：統一管理全域樣式和主題
   * - 路由層：處理頁面導航和路由切換
   *
   * 設計理念 (Design Principles):
   * - 滿版無邊距佈局設計，最大化內容顯示空間
   * - 模組化組件架構，便於維護和擴展
   * - 響應式設計，適配多種設備尺寸
   * - 統一的視覺風格和用戶體驗
   *
   * 技術特點 (Technical Features):
   * - 使用 Vue 3 Composition API 提供更好的邏輯復用
   * - 整合 Bootstrap 5 響應式佈局系統
   * - 支援全域載入狀態管理
   * - 提供完整的路由導航功能
   *
   * @component App
   * @version 2.0.0
   * @author Kevin Cheng
   * @since 1.0.0
   */

  // ==================== 🔧 Vue Composition API 引入 (Vue Composition API Imports) ====================

  // App.vue 目前主要作為路由容器，不需要額外的 Vue API

  export default {
    /**
     * 組件名稱
     * 用於 Vue DevTools 調試和組件識別
     */
    name: 'App',

    /**
     * 🧩 組件註冊 (Component Registration)
     * 註冊應用程式層級使用的組件
     * 目前為空，所有子組件都在各自的路由視圖中註冊
     */
    components: {},

    /**
     * 🔧 組件設定函數 (Component Setup)
     * 使用 Composition API 設定應用程式層級的狀態管理
     *
     * 功能說明：
     * - 管理全域載入狀態和進度顯示
     * - 提供統一的載入提示和進度反饋
     * - 支援載入文字和進度條的動態更新
     *
     * @returns {Object} 返回響應式數據和函數供模板使用
     */
    setup() {
      // App.vue 目前主要作為路由容器，不需要額外的狀態管理
      return {};
    },
  };
</script>

<template>
  <!-- 🏠 App.vue - 主應用程式組件 (Main Application Component) -->
  <!-- 提供應用程式整體框架，使用 Bootstrap 實現滿版無空隙佈局 -->
  <div id="app" class="d-flex flex-column vh-100">
    <!--
      📱 主要內容區域 (Main Content Area)

      功能說明：
      - 使用 Bootstrap 的 flexbox 佈局系統
      - 實現垂直方向的彈性佈局
      - 隱藏溢出內容，保持整潔的視覺效果
      - 包含路由視圖容器，動態顯示不同頁面組件

      樣式說明：
      - d-flex: 啟用 flexbox 佈局
      - flex-column: 垂直方向排列子元素
      - overflow-hidden: 隱藏溢出內容
    -->
    <div class="d-flex flex-column overflow-hidden">
      <!--
        🗺️ 路由視圖容器 (Router View Container)

        功能說明：
        - 根據當前路由動態顯示對應的頁面組件
        - 支援路由切換和頁面導航
        - 自動處理組件的載入和卸載

        路由配置：
        - /: HomeView (首頁)
        - /code: CodeView (程式碼查看頁面)
      -->
      <router-view />
    </div>
  </div>
</template>

<style>
  /**
   * 🎨 應用程式全域樣式 (Application Global Styles)
   *
   * 功能說明：
   * - 引入共用 CSS 樣式表
   * - 定義應用程式層級的樣式規則
   * - 整合第三方庫樣式和自定義樣式
   * - 提供統一的視覺風格和主題配置
   *
   * 樣式架構：
   * - 第三方庫樣式：Bootstrap、Font Awesome
   * - 自定義樣式：common.css 中的統一樣式定義
   * - 組件樣式：各組件內部的 scoped 樣式
   *
   * 設計原則：
   * - 模組化樣式管理，避免樣式衝突
   * - 響應式設計，適配多種設備
   * - 統一的顏色方案和字體系統
   * - 良好的可維護性和擴展性
   *
   * 注意事項：
   * - 大部分樣式已移至 common.css 中統一管理
   * - 避免在此處定義過多的樣式規則
   * - 優先使用 Bootstrap 的工具類
   */

  /* ==================== 📦 共用樣式表引入 (Common Stylesheets Import) ==================== */

  /**
   * 引入共用樣式表
   * 包含所有自定義樣式、CSS 變數和主題配置
   * 提供統一的樣式基礎和視覺規範
   */
  @import './assets/css/common.css';

  /* ==================== 📱 應用程式特定樣式 (App-Specific Styles) ==================== */

  /**
   * 應用程式層級樣式
   * 目前大部分樣式已整合至 common.css 中
   * 此處僅保留必要的應用程式特定樣式
   *
   * 注意：避免在此處定義過多的樣式規則
   * 優先使用 common.css 中的統一樣式定義
   */
</style>
