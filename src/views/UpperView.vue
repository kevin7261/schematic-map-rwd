<script>
  // 🔧 Vue Composition API 引入
  import { ref, watch, nextTick } from 'vue';
  // 🧩 子組件引入
  import DashboardTab from '../tabs/DashboardTab.vue';
  import D3jsTab from '../tabs/D3jsTab.vue';

  export default {
    name: 'UpperView',

    /**
     * 🧩 組件註冊 (Component Registration)
     * 註冊上半部面板內使用的子組件
     */
    components: {
      DashboardTab,
      D3jsTab,
    },

    /**
     * 🔧 組件屬性定義 (Component Props)
     * 接收來自父組件的配置和狀態數據
     */
    props: {
      activeUpperTab: { type: String, default: 'd3js' },
      mainPanelWidth: { type: Number, default: 60 },
      contentHeight: { type: Number, default: 500 },
      showTainanLayer: { type: Boolean, default: false },
      selectedFilter: { type: String, default: '' },
      zoomLevel: { type: Number, default: 11 },
      isPanelDragging: { type: Boolean, default: false },
      activeMarkers: { type: Number, default: 0 },
    },

    /**
     * 📡 組件事件定義 (Component Events)
     * 定義向父組件發送的事件類型
     */
    emits: [
      'update:activeUpperTab', // 更新作用中分頁
      'update:zoomLevel', // 更新地圖縮放等級
      'update:currentCoords', // 更新當前座標
      'update:activeMarkers', // 更新作用中標記數量
      'feature-selected', // 選中地圖特徵
    ],

    /**
     * 🔧 組件設定函數 (Component Setup)
     * 使用 Composition API 設定組件邏輯
     */
    setup(props) {
      // 📚 子組件引用 (Child Component References)
      /** 📊 儀表板視圖組件引用 */
      const DashboardTab = ref(null);
      /** 📊 儀表板容器引用 (用於控制滑鼠事件) */
      const dashboardContainerRef = ref(null);
      /** 📊 D3.js 視圖組件引用 */
      const D3jsTab = ref(null);
      /** 📊 D3.js 容器引用 (用於控制滑鼠事件) */
      const d3jsContainerRef = ref(null);

      /**
       * 👀 監聽拖曳狀態和分頁變化 (Watch Dragging State and Tab Changes)
       * 調整儀表板容器的滑鼠指標事件，防止拖曳時的干擾
       */
      watch(
        [() => props.isPanelDragging, () => props.activeUpperTab],
        ([dragging, tab]) => {
          nextTick(() => {
            // 處理儀表板容器
            if (dashboardContainerRef.value) {
              if (dragging && tab === 'dashboard') {
                // 拖曳時禁用儀表板的滑鼠事件
                dashboardContainerRef.value.style.pointerEvents = 'none';
                console.log('MainContent: Dashboard container pointer-events set to none');
              } else {
                // 恢復儀表板的滑鼠事件
                dashboardContainerRef.value.style.pointerEvents = 'auto';
                console.log(
                  'MainContent: Dashboard container pointer-events set to auto (dragging:',
                  dragging,
                  ', tab:',
                  tab,
                  ')'
                );
              }
            }

            // 處理 D3.js 容器
            if (d3jsContainerRef.value) {
              if (dragging && tab === 'd3js') {
                // 拖曳時禁用 D3.js 容器的滑鼠事件
                d3jsContainerRef.value.style.pointerEvents = 'none';
                console.log('MainContent: D3.js container pointer-events set to none');
              } else {
                // 恢復 D3.js 容器的滑鼠事件
                d3jsContainerRef.value.style.pointerEvents = 'auto';
                console.log(
                  'MainContent: D3.js container pointer-events set to auto (dragging:',
                  dragging,
                  ', tab:',
                  tab,
                  ')'
                );
              }
            }
          });
        },
        { immediate: true }
      ); // immediate: true 表示立即執行一次

      /**
       * 👀 監聽分頁變化 (Watch Tab Changes)
       * 當切換分頁時觸發相應的更新動作，確保組件正常顯示
       */
      watch(
        () => props.activeUpperTab,
        (newTab, oldTab) => {
          console.log('🔄 UpperView: Tab changed from', oldTab, 'to', newTab);
        }
      );

      /**
       * 👀 監聽面板大小變化 (Watch Panel Size Changes)
       * 當面板寬度或高度變化時，更新相應的子組件
       */
      watch([() => props.mainPanelWidth, () => props.contentHeight], () => {
        nextTick(() => {
          // Dashboard現在是純文字統計，不需要重新計算圖表大小
        });
      });

      /**
       * 🎯 高亮顯示指定地圖特徵 (Highlight Feature on Map)
       * 如果當前不在地圖分頁，會自動切換到地圖分頁再執行高亮
       * 注意：地圖功能已移除，此函數現在為空函數
       *
       * @param {Object} highlightData - 包含 layerId 和 id 的高亮數據物件
       */
      const highlightFeature = (highlightData) => {
        console.log('🎯 UpperView: highlightFeature called with data:', highlightData);
        console.log('🎯 highlightFeature: 地圖功能已移除，無需高亮顯示');
        // 地圖功能已移除，不需要高亮顯示
      };

      /**
       * 🔄 重設地圖視圖 (Reset Map View)
       * 將地圖恢復到初始視圖狀態
       * 注意：地圖功能已移除，此函數現在為空函數
       */
      const resetView = () => {
        // 地圖功能已移除，不需要重設視圖
        console.log('🔄 resetView: 地圖功能已移除，無需重設視圖');
      };

      /**
       * 🗺️ 適應台南地區邊界 (Fit to Tainan Bounds)
       * 調整地圖視圖以完整顯示台南地區
       * 注意：地圖功能已移除，此函數現在為空函數
       */
      const fitToTainanBounds = () => {
        // 地圖功能已移除，不需要適應邊界
        console.log('🗺️ fitToTainanBounds: 地圖功能已移除，無需適應邊界');
      };

      /**
       * 📏 手動刷新地圖尺寸 (Manually Refresh Map Size)
       * 當容器大小變化但自動偵測失效時使用
       * 注意：地圖功能已移除，此函數現在為空函數
       */
      const invalidateMapSize = () => {
        // 地圖功能已移除，不需要刷新地圖尺寸
        console.log('🔄 invalidateMapSize: 地圖功能已移除，無需刷新尺寸');
      };

      return {
        DashboardTab, // 儀表板組件引用
        D3jsTab, // D3.js 組件引用
        dashboardContainerRef, // 儀表板容器引用
        d3jsContainerRef, // D3.js 容器引用
        highlightFeature, // 高亮顯示功能
        resetView, // 重設視圖功能
        fitToTainanBounds, // 適應邊界功能
        invalidateMapSize, // 刷新地圖尺寸功能
      };
    },
  };
</script>

<template>
  <div class="d-flex flex-column my-bgcolor-gray-200 h-100">
    <div class="flex-grow-1 overflow-hidden position-relative">
      <!-- 統一的導航按鈕組 -->
      <div class="position-absolute top-0 start-0 m-3" style="z-index: 1000">
        <div class="d-flex align-items-center rounded-pill shadow my-blur gap-1 p-2">
          <!-- 📈 D3.js 按鈕 (D3.js Button) -->
          <button
            class="btn rounded-circle border-0 d-flex align-items-center justify-content-center my-btn-transparent my-font-size-xs"
            :class="{
              'my-btn-blue': activeUpperTab === 'd3js',
            }"
            @click="$emit('update:activeUpperTab', 'd3js')"
            style="width: 30px; height: 30px"
            title="D3.js 數據視覺化"
          >
            <i class="fas fa-chart-line"></i>
          </button>
          <!-- 📊 儀表板按鈕 (Dashboard Button) -->
          <button
            class="btn rounded-circle border-0 d-flex align-items-center justify-content-center my-btn-transparent my-font-size-xs"
            :class="{
              'my-btn-blue': activeUpperTab === 'dashboard',
            }"
            @click="$emit('update:activeUpperTab', 'dashboard')"
            style="width: 30px; height: 30px"
            title="資料儀表板"
          >
            <i class="fas fa-chart-bar"></i>
          </button>
        </div>
      </div>

      <!-- D3.js 分頁內容 -->
      <div
        v-show="activeUpperTab === 'd3js'"
        ref="d3jsContainerRef"
        class="h-100 overflow-auto pt-5"
      >
        <!-- 🎛️ 為導航按鈕組預留空間 (Reserve Space for Navigation Buttons) -->
        <div style="height: 40px"></div>
        <D3jsTab
          ref="D3jsTab"
          :containerHeight="contentHeight"
          :isPanelDragging="isPanelDragging"
          :activeMarkers="activeMarkers"
        />
      </div>

      <!-- 儀表板分頁內容 -->
      <div
        v-show="activeUpperTab === 'dashboard'"
        ref="dashboardContainerRef"
        class="h-100 overflow-auto pt-5"
      >
        <!-- 🎛️ 為導航按鈕組預留空間 (Reserve Space for Navigation Buttons) -->
        <div style="height: 40px"></div>
        <DashboardTab
          ref="DashboardTab"
          :containerHeight="contentHeight"
          :isPanelDragging="isPanelDragging"
          :activeMarkers="activeMarkers"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
