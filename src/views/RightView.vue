/** * 📊 右側分析面板組件 (Right Analysis Panel Component) * * 功能說明 (Features): * 1. 📋
屬性資訊顯示：顯示選中地圖要素的詳細屬性資訊 * 2. 📊 圖層資訊管理：提供圖層統計資訊和項目數量顯示 *
3. 🔄 分頁切換：支援屬性分頁和圖層資訊分頁的切換 * 4. 📱 響應式設計：適配不同螢幕尺寸的顯示需求 * 5.
🎯 狀態同步：與全域狀態管理系統保持同步 * 6. 🎨 視覺化增強：提供美觀的分頁導航和內容展示 * *
技術特點 (Technical Features): * - 使用 Vue 2 Options API 進行組件管理 * - 整合 Pinia 狀態管理系統 *
- 支援響應式佈局和動態尺寸調整 * - 提供完整的事件處理和狀態同步 * - 整合多個分頁組件的協調工作 * *
包含分頁 (Included Tabs): * - PropertiesTab：屬性分頁，顯示選中要素的詳細屬性 * -
LayerInfo：圖層資訊分頁，顯示圖層統計和項目數量 * * @file RightView.vue * @version 2.0.0 * @author
Kevin Cheng * @since 1.0.0 */
<script>
  // ==================== 📦 第三方庫引入 (Third-Party Library Imports) ====================

  /**
   * 屬性分頁組件引入
   * 提供選中地圖要素的詳細屬性顯示功能
   *
   * @see ../tabs/PropertiesTab.vue
   */
  import PropertiesTab from '../tabs/PropertiesTab.vue';

  /**
   * 空間分析分頁組件引入
   * 提供圖層資訊和統計數據顯示功能
   *
   * @see ../tabs/LayerInfo.vue
   */
  import LayerInfo from '../tabs/LayerInfo.vue';

  /**
   * Pinia 狀態管理庫引入
   * 提供集中式狀態管理和跨組件數據共享
   *
   * @see ../stores/dataStore.js
   */
  import { useDataStore } from '../stores/dataStore';

  /**
   * Vue Composition API 核心功能引入
   * 提供響應式數據和計算屬性功能
   *
   * @see https://vuejs.org/
   */
  import { computed, watch } from 'vue';
  import { getIcon } from '../utils/utils.js';

  export default {
    name: 'RightView',
    components: {
      PropertiesTab, // 物件屬性分頁組件
      LayerInfo, // 圖層資訊分頁組件
    },
    props: {
      /** 🔗 當前作用中的右側分頁標籤 */
      activeRightTab: {
        type: String,
        default: 'layer-info',
      },
      /** 📈 分析結果清單數據 */
      analysisList: {
        type: Array,
        default: () => [],
      },
      /** 📈 選中的分析項目 ID */
      selectedAnalysisId: {
        type: [Number, String],
        default: null,
      },
      /** 📏 右側面板寬度 (像素) */
      rightViewWidth: {
        type: Number,
        default: 250,
      },
    },

    /**
     * 📡 組件事件定義 (Component Events)
     * 定義向父組件發送的事件類型
     */
    emits: [
      'update:activeRightTab', // 更新作用中分頁
      'select-analysis', // 選擇分析項目
      'view-analysis', // 查看分析結果
      'delete-analysis', // 刪除分析項目
      'highlight-feature', // 高亮顯示地圖特徵
    ],

    /**
     * 🔧 組件設定函數 (Component Setup)
     * 使用 Composition API 設定組件邏輯
     */
    setup(props, { emit }) {
      // 📦 取得 Pinia 數據存儲實例
      const dataStore = useDataStore();

      // 📊 可用的分頁列表
      const availableTabs = [
        { id: 'layer-info', name: '圖層資訊', icon: getIcon('info_circle').icon },
        { id: 'properties', name: '屬性', icon: getIcon('location_dot').icon },
      ];

      // 🔘 切換分頁
      const switchTab = (tabId) => {
        emit('update:activeRightTab', tabId);
      };

      /**
       * 📊 計算活躍分析項目數量 (Calculate Active Analysis Count)
       * 統計狀態為「完成」的分析項目數量
       *
       * @returns {number} 完成狀態的分析項目數量
       */
      const getActiveAnalysisCount = () => {
        return props.analysisList.filter((a) => a.status === '完成').length;
      };

      /**
       * 👀 監聽選中物件的變化 (Watch Selected Feature Changes)
       * 當 Pinia store 中的 selectedFeature 變化時執行回調
       */
      watch(
        () => dataStore.selectedFeature,
        (newFeature) => {
          console.log('RightView - selectedFeature changed:', {
            newFeature: newFeature,
            properties: newFeature?.properties,
            store: dataStore,
          });
        },
        { immediate: true }
      ); // immediate: true 表示立即執行一次

      /**
       * 🧮 選中物件計算屬性 (Selected Feature Computed Property)
       * 從 Pinia store 獲取當前選中的地圖物件
       * 提供響應式的選中物件數據給子組件使用
       */
      const selectedFeatureComputed = computed(() => {
        const feature = dataStore.selectedFeature;
        console.log('RightView - Computing selectedFeature:', {
          feature: feature,
          properties: feature?.properties,
        });
        return feature;
      });

      // 📤 返回響應式數據和函數給模板和子組件使用
      return {
        availableTabs,
        switchTab,
        getActiveAnalysisCount, // 活躍分析計數函數
        selectedFeature: selectedFeatureComputed, // 選中物件計算屬性
      };
    },
  };
</script>

<template>
  <div class="my-right-panel h-100 d-flex flex-column overflow-hidden">
    <!-- 📑 分頁導航按鈕 -->
    <div class="d-flex justify-content-center my-bgcolor-gray-200 p-3">
      <div class="d-flex align-items-center rounded-pill shadow my-blur gap-2 p-2 w-100">
        <button
          v-for="tab in availableTabs"
          :key="tab.id"
          class="btn rounded-pill border-0 my-btn-transparent my-font-size-xs text-nowrap w-100 my-cursor-pointer"
          :class="{
            'my-btn-blue': $props.activeRightTab === tab.id,
          }"
          @click="switchTab(tab.id)"
          :title="tab.name"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- 📄 右側分頁內容區域 -->
    <div class="flex-grow-1 overflow-auto">
      <!-- 📋 物件屬性分頁內容 -->
      <div v-show="$props.activeRightTab === 'properties'" class="h-100">
        <PropertiesTab
          :selected-feature="selectedFeature"
          @highlight-feature="$emit('highlight-feature', $event)"
        />
      </div>

      <!-- 📊 圖層資訊分頁內容 -->
      <div v-show="$props.activeRightTab === 'layer-info'" class="h-100">
        <LayerInfo />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
