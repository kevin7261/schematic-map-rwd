<script>
  // 🔧 Vue Composition API 引入 (Vue Composition API Imports)
  import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'; // 引入 Vue 3 響應式 API
  import { useDataStore } from '@/stores/dataStore.js'; // 引入資料存儲

  export default {
    name: 'MapTab', // 組件名稱

    // 🔧 組件屬性定義 (Component Props Definition)
    props: {
      zoomLevel: { type: Number, default: 11 }, // 地圖縮放等級，預設為 11
      isPanelDragging: { type: Boolean, default: false }, // 面板是否正在拖曳，預設為 false
    },

    // 📡 組件事件定義 (Component Events Definition)
    emits: ['update:zoomLevel', 'update:currentCoords', 'update:activeMarkers', 'feature-selected'],

    // 🔧 組件設定函數 (Component Setup Function)
    setup(props, { emit }) {
      // 📦 資料存儲實例 (Data Store Instance)
      const dataStore = useDataStore(); // 獲取 Pinia 資料存儲實例

      // 🗺️ 地圖相關變數 (Map Related Variables)
      const mapContainer = ref(null); // 地圖容器 DOM 元素引用

      // 🎛️ 地圖控制狀態 (Map Control States)
      const isMapReady = ref(false); // 地圖是否已準備就緒的狀態標記

      // 📊 計算屬性：檢查是否有任何圖層可見 (Computed Property: Check if Any Layer is Visible)
      const isAnyLayerVisible = computed(
        () => dataStore.getMapLayers().some((l) => l.visible && l.geoJsonData) // 檢查地圖圖層中是否有可見且有資料的圖層
      );

      // 🏗️ 創建地圖實例函數 (Create Map Instance Function)
      const createMap = () => {
        // 檢查地圖實例是否已存在
        if (isMapReady.value) {
          return true; // 地圖已經創建並準備就緒
        }

        // 檢查地圖容器是否存在
        if (!mapContainer.value) return false;

        try {
          // 標記地圖為準備就緒
          isMapReady.value = true;
          console.log('🗺️ 地圖容器已準備就緒');
          return true;
        } catch (error) {
          console.error('❌ 地圖初始化失敗:', error);
          return false;
        }
      };

      // 🔄 重設地圖視圖 (Reset Map View)
      const resetView = () => {
        console.log('🔄 重設地圖視圖');
        // 由於沒有實際地圖，只記錄操作
      };

      // 🗺️ 適應台南地區邊界 (Fit to Tainan Bounds)
      const fitToTainanBounds = () => {
        console.log('🗺️ 適應台南地區邊界');
        // 由於沒有實際地圖，只記錄操作
      };

      // 📏 手動刷新地圖尺寸 (Manually Refresh Map Size)
      const invalidateMapSize = () => {
        console.log('📏 手動刷新地圖尺寸');
        // 由於沒有實際地圖，只記錄操作
      };

      // 🔍 高亮特徵 (Highlight Feature)
      const highlightFeature = (highlightData) => {
        console.log('🔍 高亮特徵:', highlightData);
        // 由於沒有實際地圖，只記錄操作
      };

      // 🎯 特徵選取處理器 (Feature Selection Handler)
      const handleFeatureSelected = (featureData) => {
        console.log('🎯 特徵選取:', featureData);
        emit('feature-selected', featureData);
      };

      // 🔄 組件掛載時初始化地圖 (Initialize Map on Component Mount)
      onMounted(() => {
        console.log('🚀 MapTab 組件已掛載');
        nextTick(() => {
          createMap();
        });
      });

      // 🧹 組件卸載時清理地圖 (Clean Up Map on Component Unmount)
      onUnmounted(() => {
        console.log('🧹 MapTab 組件已卸載');
        isMapReady.value = false;
      });

      // 👀 監聽面板拖曳狀態變化 (Watch Panel Dragging State Changes)
      watch(
        () => props.isPanelDragging,
        (isDragging) => {
          if (!isDragging && isMapReady.value) {
            // 當拖曳結束時，刷新地圖尺寸
            nextTick(() => {
              invalidateMapSize();
            });
          }
        }
      );

      // 📤 返回響應式數據和方法給模板使用 (Return Reactive Data and Methods for Template)
      return {
        // 🗺️ 地圖相關變數 (Map Related Variables)
        mapContainer, // 地圖容器 DOM 元素引用
        mapContainerId: `map-container-${Math.random().toString(36).substr(2, 9)}`, // 動態地圖容器 ID

        // 🎛️ 地圖控制狀態 (Map Control States)
        isMapReady, // 地圖是否已準備就緒的狀態標記

        // 📊 計算屬性 (Computed Properties)
        isAnyLayerVisible, // 是否有任何圖層可見

        // 🛠️ 地圖操作方法 (Map Operation Methods)
        resetView, // 重設地圖視圖
        fitToTainanBounds, // 適應台南地區邊界
        invalidateMapSize, // 手動刷新地圖尺寸
        highlightFeature, // 高亮特徵
        handleFeatureSelected, // 特徵選取處理器
      };
    },
  };
</script>

<template>
  <div class="h-100 d-flex flex-column overflow-hidden">
    <!-- 🗺️ 地圖容器 (Map Container) -->
    <div
      :id="mapContainerId"
      ref="mapContainer"
      class="flex-grow-1 w-100"
      style="background-color: #f8f9fa; border: 1px solid #dee2e6"
    >
      <!-- 🗺️ 地圖內容區域 (Map Content Area) -->
      <div class="h-100 d-flex align-items-center justify-content-center">
        <div class="text-center">
          <i class="fas fa-map-marked-alt fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">地圖功能已移除</h5>
          <p class="text-muted small">Leaflet 地圖功能已被刪除</p>
        </div>
      </div>
    </div>

    <!-- 🎛️ 地圖控制項區域 (Map Controls Area) -->
    <div class="d-flex justify-content-between align-items-center p-2 bg-light border-top">
      <!-- 📊 地圖狀態資訊 (Map Status Information) -->
      <div class="d-flex align-items-center">
        <span class="badge me-2" :class="isMapReady ? 'bg-success' : 'bg-secondary'">
          {{ isMapReady ? '已準備' : '初始化中' }}
        </span>
        <span class="badge me-2" :class="isAnyLayerVisible ? 'bg-primary' : 'bg-secondary'">
          圖層: {{ isAnyLayerVisible ? '可見' : '無' }}
        </span>
      </div>

      <!-- 🔧 地圖控制按鈕 (Map Control Buttons) -->
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="resetView"
          title="重設地圖視圖"
        >
          <i class="fas fa-home"></i>
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="fitToTainanBounds"
          title="適應台南地區邊界"
        >
          <i class="fas fa-expand-arrows-alt"></i>
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          @click="invalidateMapSize"
          title="刷新地圖尺寸"
        >
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 🗺️ 地圖容器樣式 (Map Container Styles) */
  .map-container {
    min-height: 400px;
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
  }

  /* 🎛️ 控制項樣式 (Controls Styles) */
  .badge {
    font-size: 0.75em;
  }

  /* 📱 響應式設計 (Responsive Design) */
  @media (max-width: 768px) {
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  }
</style>
