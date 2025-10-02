/**
 * 🗺️ mapStore.js - 地圖與面板狀態管理存儲
 *
 * 功能說明：
 * 1. 📐 管理響應式面板佈局的尺寸狀態
 * 2. 🗺️ 管理地圖的縮放等級和座標位置
 * 3. 🎛️ 管理地圖圖層的引用和狀態
 * 4. 📱 管理視窗大小變化的響應式狀態
 * 5. 🧮 提供計算屬性以動態計算面板尺寸
 *
 * 設計理念：
 * - 使用 Composition API 提供更靈活的狀態管理
 * - 集中管理所有與地圖和佈局相關的狀態
 * - 提供響應式計算屬性以支援動態佈局
 *
 * @store useMapStore
 * @version 1.0.0
 */

// 🔧 Vue Composition API 核心功能引入
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 🗺️ 地圖與面板存儲定義 (Map and Panel Store Definition)
 * 統一管理地圖狀態和響應式面板佈局
 */
export const useMapStore = defineStore('map', () => {
  // ==================== 📐 面板尺寸狀態 (Panel Size States) ====================

  /** 📏 左側面板寬度（像素） */
  const leftViewWidth = ref(300);

  /** 📏 右側面板寬度（像素） */
  const rightViewWidth = ref(300);

  /** 📏 底部面板高度（像素） */
  const bottomViewHeight = ref(250);

  /** 📏 瀏覽器視窗寬度（像素） */
  const windowWidth = ref(window.innerWidth);

  /** 📏 瀏覽器視窗高度（像素） */
  const windowHeight = ref(window.innerHeight);

  // ==================== 🗺️ 地圖狀態管理 (Map State Management) ====================

  /** 🔍 地圖縮放等級 */
  const zoomLevel = ref(10);

  /** 📍 地圖中心座標 */
  const currentCoords = ref({
    lat: 25.051474, // 緯度（台北市中心）
    lng: 121.557989, // 經度（台北市中心）
  });

  // ==================== 🎨 地圖圖層狀態 (Map Layer States) ====================

  /** 🗺️ 地圖圖層引用集合 */
  const mapLayers = ref({
    geojsonLayer: null, // GeoJSON 向量圖層
    pointLayer: null, // 點位圖層
    heatmapLayer: null, // 熱力圖圖層
    clusterLayer: null, // 聚類圖層
    bufferLayer: null, // 緩衝區圖層
  });

  // ==================== 🧮 計算屬性 (Computed Properties) ====================

  /**
   * 📏 主要面板寬度計算
   * 根據視窗寬度和左右面板寬度動態計算中間主要面板的可用寬度
   * @returns {number} 主要面板的像素寬度
   */
  const mainPanelWidth = computed(() => {
    const availableWidth = windowWidth.value - leftViewWidth.value - rightViewWidth.value;
    return Math.max(200, availableWidth); // 確保最小寬度為 200px
  });

  // ==================== 📤 返回狀態和方法 (Return States and Methods) ====================

  return {
    // 📐 面板尺寸狀態
    leftViewWidth, // 左側面板寬度
    rightViewWidth, // 右側面板寬度
    bottomViewHeight, // 底部面板高度
    windowWidth, // 視窗寬度
    windowHeight, // 視窗高度

    // 🗺️ 地圖狀態
    zoomLevel, // 縮放等級
    currentCoords, // 中心座標
    mapLayers, // 圖層引用集合

    // 🧮 計算屬性
    mainPanelWidth, // 主要面板寬度
  };
});
