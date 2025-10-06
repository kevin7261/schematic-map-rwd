/** * 🌟 上半部區域組件 (Upper Area Component) * * 功能說明 (Features): * 1. 📊
分頁管理：管理儀表板和 D3.js 圖表的分頁切換 * 2. 🗺️ 地圖顯示：提供地圖視覺化和互動功能 * 3. 📈
數據視覺化：整合 D3.js 進行各種圖表繪製 * 4. 📱 響應式設計：適配不同螢幕尺寸的顯示需求 * 5. 🎯
高亮功能：提供地圖要素高亮顯示功能 * 6. 🔄 狀態同步：與父組件保持狀態同步 * * 技術特點 (Technical
Features): * - 使用 Vue 2 Options API 進行組件管理 * - 整合多個分頁組件，提供統一的介面 * -
支援響應式佈局和動態尺寸調整 * - 提供完整的事件處理和狀態管理 * - 整合地圖和圖表視覺化功能 * *
包含分頁 (Included Tabs): * - DashboardTab：儀表板分頁，顯示統計圖表和摘要資訊 * - D3jsTab：D3.js
圖表分頁，提供進階數據視覺化 * * @file UpperView.vue * @version 2.0.0 * @author Kevin Cheng * @since
1.0.0 */
<script>
  // ==================== 📦 第三方庫引入 (Third-Party Library Imports) ====================

  /**
   * Vue Composition API 核心功能引入
   * 提供響應式數據、生命週期鉤子等功能
   *
   * @see https://vuejs.org/
   */
  import { ref, watch, nextTick } from 'vue';

  // ==================== 🧩 子組件引入 (Subcomponent Imports) ====================

  /**
   * 儀表板分頁組件引入
   * 提供統計圖表和數據摘要顯示功能
   *
   * @see ../tabs/DashboardTab.vue
   */
  import DashboardTab from '../tabs/DashboardTab.vue';

  /**
   * D3.js 圖表分頁組件引入
   * 提供進階數據視覺化和圖表繪製功能
   *
   * @see ../tabs/D3jsTab.vue
   */
  import D3jsTab from '../tabs/D3jsTab.vue';

  /**
   * 處理後 JSON 數據分頁組件引入
   * 顯示圖層的處理後 JSON 數據
   *
   * @see ../tabs/processedJsonDataTab.vue
   */
  import ProcessedJsonDataTab from '../tabs/processedJsonDataTab.vue';

  /**
   * 原始 JSON 數據分頁組件引入
   * 顯示圖層的原始 JSON 數據
   *
   * @see ../tabs/jsonDataTab.vue
   */
  import JsonDataTab from '../tabs/jsonDataTab.vue';

  /**
   * 繪製數據分頁組件引入
   * 顯示圖層的繪製數據
   *
   * @see ../tabs/drawJsonDataTab.vue
   */
  import DrawJsonDataTab from '../tabs/drawJsonDataTab.vue';
  import { getIcon } from '../utils/utils.js';

  export default {
    name: 'UpperView',

    /**
     * 🧩 組件註冊 (Component Registration)
     * 註冊上半部面板內使用的子組件
     */
    components: {
      DashboardTab,
      D3jsTab,
      ProcessedJsonDataTab,
      JsonDataTab,
      DrawJsonDataTab,
    },

    /**
     * 🔧 組件屬性定義 (Component Props)
     * 接收來自父組件的配置和狀態數據
     */
    props: {
      activeUpperTab: { type: String, default: 'd3js' },
      mainPanelWidth: { type: Number, default: 60 },
      contentHeight: { type: Number, default: 500 },
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
      /** 📊 處理後 JSON 數據組件引用 */
      const ProcessedJsonDataTab = ref(null);
      /** 📊 處理後 JSON 數據容器引用 */
      const processedJsonDataContainerRef = ref(null);
      /** 📊 原始 JSON 數據組件引用 */
      const JsonDataTab = ref(null);
      /** 📊 原始 JSON 數據容器引用 */
      const jsonDataContainerRef = ref(null);

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

            // 處理處理後 JSON 數據容器
            if (processedJsonDataContainerRef.value) {
              if (dragging && tab === 'processed-json-data') {
                processedJsonDataContainerRef.value.style.pointerEvents = 'none';
                console.log('MainContent: ProcessedJsonData container pointer-events set to none');
              } else {
                processedJsonDataContainerRef.value.style.pointerEvents = 'auto';
                console.log(
                  'MainContent: ProcessedJsonData container pointer-events set to auto (dragging:',
                  dragging,
                  ', tab:',
                  tab,
                  ')'
                );
              }
            }

            // 處理原始 JSON 數據容器
            if (jsonDataContainerRef.value) {
              if (dragging && tab === 'json-data') {
                jsonDataContainerRef.value.style.pointerEvents = 'none';
                console.log('MainContent: JsonData container pointer-events set to none');
              } else {
                jsonDataContainerRef.value.style.pointerEvents = 'auto';
                console.log(
                  'MainContent: JsonData container pointer-events set to auto (dragging:',
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

          // 當切換到 D3.js 分頁時，延遲觸發 resize 以確保容器已顯示
          if (newTab === 'd3js') {
            nextTick(() => {
              setTimeout(() => {
                if (D3jsTab.value && D3jsTab.value.resize) {
                  console.log('🔄 UpperView: 切換到 D3.js 分頁，觸發 resize');
                  D3jsTab.value.resize();
                }
              }, 100); // 給容器一些時間來完成顯示動畫
            });
          }
        }
      );

      /**
       * 👀 監聽面板大小變化 (Watch Panel Size Changes)
       * 當面板寬度或高度變化時，更新相應的子組件
       */
      watch([() => props.mainPanelWidth, () => props.contentHeight], () => {
        nextTick(() => {
          // 觸發 D3jsTab 重新繪製以適應新的容器尺寸
          if (D3jsTab.value && D3jsTab.value.resize) {
            D3jsTab.value.resize();
          }
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
       * 📏 使地圖尺寸失效 (Invalidate Map Size)
       * 強制重新計算地圖尺寸並重繪示意圖
       * 用於響應容器尺寸變化
       */
      const invalidateMapSize = () => {
        console.log('📏 UpperView: invalidateMapSize 被調用');

        // 觸發 D3jsTab 重新繪製
        if (D3jsTab.value && D3jsTab.value.resize) {
          console.log('📏 UpperView: 觸發 D3jsTab resize');
          D3jsTab.value.resize();
        }

        // 觸發全域 resize 事件作為備用方案
        setTimeout(() => {
          const event = new Event('resize');
          window.dispatchEvent(event);
        }, 50);
      };

      return {
        DashboardTab, // 儀表板組件引用
        D3jsTab, // D3.js 組件引用
        ProcessedJsonDataTab, // 處理後 JSON 數據組件引用
        JsonDataTab, // 原始 JSON 數據組件引用
        dashboardContainerRef, // 儀表板容器引用
        d3jsContainerRef, // D3.js 容器引用
        processedJsonDataContainerRef, // 處理後 JSON 數據容器引用
        jsonDataContainerRef, // 原始 JSON 數據容器引用
        highlightFeature, // 高亮顯示功能
        resetView, // 重設視圖功能
        fitToTainanBounds, // 適應邊界功能
        invalidateMapSize, // 刷新地圖尺寸功能

        // 🛠️ 工具函數
        getIcon, // 圖標獲取函數
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
            <i :class="getIcon('chart_line').icon"></i>
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
            <i :class="getIcon('chart_bar').icon"></i>
          </button>
          <!-- 📄 處理後 JSON 數據按鈕 (Processed JSON Data Button) -->
          <button
            class="btn rounded-circle border-0 d-flex align-items-center justify-content-center my-btn-transparent my-font-size-xs"
            :class="{
              'my-btn-blue': activeUpperTab === 'processed-json-data',
            }"
            @click="$emit('update:activeUpperTab', 'processed-json-data')"
            style="width: 30px; height: 30px"
            title="處理後 JSON 數據"
          >
            <i class="fas fa-code"></i>
          </button>
          <!-- 📄 原始 JSON 數據按鈕 (Original JSON Data Button) -->
          <button
            class="btn rounded-circle border-0 d-flex align-items-center justify-content-center my-btn-transparent my-font-size-xs"
            :class="{
              'my-btn-blue': activeUpperTab === 'json-data',
            }"
            @click="$emit('update:activeUpperTab', 'json-data')"
            style="width: 30px; height: 30px"
            title="原始 JSON 數據"
          >
            <i class="fas fa-file-code"></i>
          </button>
          <!-- 🎨 繪製數據按鈕 (Draw Data Button) -->
          <button
            class="btn rounded-circle border-0 d-flex align-items-center justify-content-center my-btn-transparent my-font-size-xs"
            :class="{
              'my-btn-blue': activeUpperTab === 'draw-json-data',
            }"
            @click="$emit('update:activeUpperTab', 'draw-json-data')"
            style="width: 30px; height: 30px"
            title="繪製數據"
          >
            <i class="fas fa-paint-brush"></i>
          </button>
        </div>
      </div>

      <!-- D3.js 分頁內容 -->
      <div
        v-show="activeUpperTab === 'd3js'"
        ref="d3jsContainerRef"
        class="h-100 overflow-hidden pt-5 d-flex flex-column"
      >
        <!-- 🎛️ 為導航按鈕組預留空間 (Reserve Space for Navigation Buttons) -->
        <div style="height: 40px"></div>
        <D3jsTab
          ref="D3jsTab"
          class="flex-grow-1 d-flex flex-column"
          :containerHeight="contentHeight"
          :isPanelDragging="isPanelDragging"
          :activeMarkers="activeMarkers"
        />
      </div>

      <!-- 儀表板分頁內容 -->
      <div
        v-show="activeUpperTab === 'dashboard'"
        ref="dashboardContainerRef"
        class="h-100 overflow-hidden pt-5"
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

      <!-- 處理後 JSON 數據分頁內容 -->
      <div
        v-show="activeUpperTab === 'processed-json-data'"
        ref="processedJsonDataContainerRef"
        class="h-100 overflow-hidden pt-5"
      >
        <!-- 🎛️ 為導航按鈕組預留空間 (Reserve Space for Navigation Buttons) -->
        <div style="height: 40px"></div>
        <ProcessedJsonDataTab
          ref="ProcessedJsonDataTab"
          :containerHeight="contentHeight"
          :isPanelDragging="isPanelDragging"
          :activeMarkers="activeMarkers"
        />
      </div>

      <!-- 原始 JSON 數據分頁內容 -->
      <div
        v-show="activeUpperTab === 'json-data'"
        ref="jsonDataContainerRef"
        class="h-100 overflow-hidden pt-5"
      >
        <!-- 🎛️ 為導航按鈕組預留空間 (Reserve Space for Navigation Buttons) -->
        <div style="height: 40px"></div>
        <JsonDataTab
          ref="JsonDataTab"
          :containerHeight="contentHeight"
          :isPanelDragging="isPanelDragging"
          :activeMarkers="activeMarkers"
        />
      </div>

      <!-- 繪製數據分頁內容 -->
      <div
        v-show="activeUpperTab === 'draw-json-data'"
        ref="drawJsonDataContainerRef"
        class="h-100 overflow-hidden pt-5"
      >
        <!-- 🎛️ 為導航按鈕組預留空間 (Reserve Space for Navigation Buttons) -->
        <div style="height: 40px"></div>
        <DrawJsonDataTab
          ref="DrawJsonDataTab"
          :containerHeight="contentHeight"
          :isPanelDragging="isPanelDragging"
          :activeMarkers="activeMarkers"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
