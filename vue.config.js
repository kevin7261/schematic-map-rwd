/**
 * 🔧 vue.config.js - Vue CLI 專案配置文件
 *
 * 功能說明：
 * 1. 🌐 配置專案的公開路徑，用於 GitHub Pages 部署
 * 2. 📦 設定 Babel 轉譯依賴項目，確保舊瀏覽器兼容性
 * 3. 🖥️ 配置開發伺服器的端口和主機設定
 * 4. 🚀 優化建置和開發環境的各項設定
 *
 * 設計理念：
 * - 支援 GitHub Pages 部署的路徑配置
 * - 提供穩定的開發環境設定
 * - 確保跨平台和跨瀏覽器的兼容性
 *
 * @config vue.config.js
 * @version 1.0.0
 */

const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  /**
   * 🌐 公開路徑設定 (Public Path Configuration)
   * 設定應用程式的基礎 URL 路徑，用於正確載入靜態資源
   * - 開發環境：通常為 '/'
   * - GitHub Pages：需要設定為專案名稱路徑
   */
  publicPath: '/schematic-map-rwd/',

  /**
   * 📄 頁面標題設定 (Page Title Configuration)
   * 設定應用程式的頁面標題
   */
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = 'Schematic Map RWD';
      return args;
    });
  },

  /**
   * 📦 依賴項目轉譯設定 (Transpile Dependencies)
   * 啟用 Babel 轉譯 node_modules 中的依賴項目
   * - true：轉譯所有依賴項目，確保舊瀏覽器兼容性
   * - false：不轉譯依賴項目，建置速度較快但可能有兼容性問題
   */
  transpileDependencies: true,

  /**
   * 🖥️ 開發伺服器配置 (Development Server Configuration)
   * 設定本地開發環境的伺服器參數
   */
  devServer: {
    /**
     * 🔌 服務端口
     * 設定開發伺服器監聽的端口號
     */
    port: 8080,

    /**
     * 🌐 主機設定
     * '0.0.0.0' 允許外部設備訪問（如手機、其他電腦）
     * 'localhost' 僅允許本機訪問
     */
    host: '0.0.0.0',
  },
});
