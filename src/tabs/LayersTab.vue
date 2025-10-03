<script>
  /**
   * 📋 LayersTab.vue - 圖層列表分頁組件
   *
   * 功能說明：
   * 1. 🎛️ 提供完整的圖層管理介面，包含顯示/隱藏控制
   * 2. 📊 顯示圖層的載入狀態和進度資訊
   * 3. 🔍 提供年份和城市篩選功能
   * 4. 📋 按統計區級別組織圖層群組
   * 5. 🎨 提供視覺化的圖層狀態指示器
   * 6. 📱 支援響應式設計和觸控操作
   *
   * 架構說明：
   * - 篩選控制區：年份和城市選擇器
   * - 圖層群組區：按統計區級別分組的圖層列表
   * - 狀態指示區：顯示圖層載入和可見性狀態
   *
   * 設計理念：
   * - 直觀的圖層管理介面
   * - 清晰的視覺狀態回饋
   * - 高效的篩選和組織功能
   *
   * @component LayersTab
   * @version 1.0.0
   */

  // 🔧 Vue Composition API 引入 (Vue Composition API Imports)
  import { computed, ref } from 'vue'; // 引入響應式 API
  import { useDataStore } from '@/stores/dataStore.js'; // 引入資料存儲
  import { getIcon } from '../utils/utils.js'; // 引入圖標工具函數

  export default {
    name: 'LayersTab',

    /**
     * 🔧 組件設定函數 (Component Setup)
     * 使用 Composition API 設定組件邏輯和狀態管理
     */
    setup() {
      // 📦 取得 Pinia 數據存儲實例 (Get Pinia Data Store Instance)
      const dataStore = useDataStore();

      // 📚 組件引用 (Component References)
      /** 📋 圖層列表 DOM 元素引用，用於滾動和操作 */
      const layerListRef = ref(null);

      // 🧮 計算屬性 (Computed Properties)
      /** 📊 從 store 中獲取圖層數據，當 store 狀態改變時自動更新 */
      const layers = computed(() => dataStore.layers);

      // 🔧 圖層操作函數 (Layer Operation Functions)

      /**
       * 🔘 切換圖層可見性 (Toggle Layer Visibility)
       * 呼叫 store 中的 action 來切換指定圖層的顯示/隱藏狀態
       *
       * @param {string} layerId - 要切換的圖層 ID
       */
      const toggleLayer = (layerId) => {
        console.log('🔘 LayersTab: 切換圖層', layerId);
        dataStore.toggleLayerVisibility(layerId);
      };

      /**
       * 🎛️ 處理開關變更事件 (Handle Toggle Change Event)
       * 避免重複觸發，只在實際需要時切換圖層
       * 提供詳細的狀態檢查和錯誤處理
       *
       * @param {string} layerId - 圖層 ID
       * @param {Event} event - 變更事件對象
       */
      const handleToggleChange = (layerId, event) => {
        // 防止事件冒泡，避免觸發父元素的事件
        event.stopPropagation();

        // 在所有圖層群組中查找指定的圖層（支援新的兩層結構）
        const layer = dataStore.layers
          .flatMap((mainGroup) => mainGroup.subGroups || [mainGroup]) // 處理新舊結構
          .flatMap((group) => group.groupLayers)
          .find((l) => l.layerId === layerId);

        // 檢查圖層是否存在
        if (!layer) {
          console.error('❌ LayersTab: 找不到圖層', layerId);
          return;
        }

        // 記錄詳細的狀態資訊用於除錯
        console.log('🎛️ LayersTab: 開關變更觸發', {
          layerId,
          layerName: layer.layerName,
          currentVisible: layer.visible,
          targetChecked: event.target.checked,
          isPopulationLayer: layer.isPopulationLayer,
          isLoaded: layer.isLoaded,
          isLoading: layer.isLoading,
        });

        // 只有當當前狀態與 checkbox 狀態不一致時才切換
        // 這可以避免重複觸發和狀態衝突
        if (layer.visible !== event.target.checked) {
          console.log('🎛️ LayersTab: 執行圖層切換', layerId, '新狀態:', event.target.checked);
          dataStore.toggleLayerVisibility(layerId);
        } else {
          console.log('🎛️ LayersTab: 狀態已一致，跳過切換', layerId);
        }
      };

      // 📤 返回響應式數據和方法給模板使用 (Return Reactive Data and Methods for Template)
      return {
        // 📊 圖層數據和狀態 (Layer Data and States)
        layers, // 圖層群組數據
        layerListRef, // 圖層列表 DOM 引用

        // 🔧 圖層操作函數 (Layer Operation Functions)
        toggleLayer, // 切換圖層可見性
        handleToggleChange, // 處理開關變更事件

        // 🛠️ 工具函數 (Utility Functions)
        getIcon, // 圖標獲取函數
      };
    },
  };
</script>

<template>
  <div class="h-100 d-flex flex-column overflow-hidden my-bgcolor-gray-100">
    <div class="flex-grow-1 overflow-auto layer-list-container" ref="layerListRef">
      <div class="mb-3">
        <!-- 主群組 -->
        <div v-for="mainGroup in layers" :key="mainGroup.groupName" class="p-3">
          <!-- 主群組標題 -->
          <div class="d-flex align-items-center justify-content-center pb-2">
            <div class="my-title-sm-gray">{{ mainGroup.groupName }}</div>
          </div>

          <!-- 子群組 -->
          <div v-for="subGroup in mainGroup.subGroups" :key="subGroup.groupName" class="mb-3">
            <!-- 子群組標題 -->
            <div class="d-flex align-items-center pb-2">
              <div class="my-title-xs-gray">{{ subGroup.groupName }}</div>
            </div>

            <!-- 圖層列表 -->
            <div v-for="layer in subGroup.groupLayers" :key="layer.layerId" class="mb-1">
              <!-- 圖層卡片 -->
              <div class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0">
                <!-- 圖層圖示 -->
                <div :class="`my-bgcolor-${layer.colorName}`" style="min-width: 6px"></div>
                <div class="w-100">
                  <div class="d-flex">
                    <!-- 圖層名稱 - 點擊可切換圖層 -->
                    <div
                      class="d-flex align-items-center text-start w-100 px-3 py-2 cursor-pointer"
                      @click="toggleLayer(layer.layerId)"
                    >
                      <span class="my-content-sm-black">
                        {{ layer.layerName }}
                        <span class="my-content-xs-gray ms-2">
                          {{ layer.summaryData?.totalCount }}
                        </span>
                      </span>
                    </div>
                    <!-- 切換圖層可見性 - 只有開關本身處理切換 -->
                    <div
                      class="d-flex align-items-center justify-content-center px-3 py-2"
                      @click.stop
                    >
                      <input
                        type="checkbox"
                        :id="'switch-' + layer.layerId"
                        :checked="layer.visible"
                        :disabled="layer.isLoading"
                        @change="handleToggleChange(layer.layerId, $event)"
                      />
                      <label :for="'switch-' + layer.layerId"></label>
                    </div>
                  </div>
                  <!-- 左側面板不顯示人口圖層、面域分析圖層和點位分析圖層的 legend -->
                  <div
                    v-if="
                      layer.legendData &&
                      layer.visible &&
                      !layer.isPopulationLayer &&
                      !layer.isAnalysisLayer &&
                      !layer.isPointCombinedLayer &&
                      !(layer.layerName && layer.layerName.includes('人口分佈'))
                    "
                    class="px-3 pb-2"
                  >
                    <div
                      v-for="data in layer.legendData"
                      :key="data.color"
                      class="d-flex align-items-center"
                    >
                      <div
                        style="min-width: 6px; min-height: 18px"
                        :style="{
                          backgroundColor: data.color,
                        }"
                      ></div>
                      <div class="my-content-xs-black text-nowrap ms-2">{{ data.label }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 🎨 圖層切換開關樣式 (Layer Toggle Switch Styles) */
  /* https://www.tpisoftware.com/tpu/articleDetails/2744 */

  .cursor-pointer {
    cursor: pointer;
  }

  /* 載入中的圖層顯示不同樣式 */
  .btn:has(input:disabled) {
    opacity: 0.7;
  }

  input[type='checkbox'] {
    height: 0;
    width: 0;
    visibility: hidden;
  }

  label {
    cursor: pointer;
    width: 28px;
    height: 16px;
    background: var(--my-color-gray-300);
    display: block;
    border-radius: 16px;
    position: relative;
    transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* 優化背景色過渡 */
  }

  label:after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px;
    height: 12px;
    background: var(--my-color-white);
    border-radius: 12px;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); /* 優化滑動過渡 */
  }

  input:checked + label {
    background: var(--my-color-green);
  }

  input:checked + label:after {
    transform: translateX(12px);
  }

  /* 禁用狀態樣式 */
  input:disabled + label {
    cursor: not-allowed;
    opacity: 0.6;
    background: var(--my-color-gray-200);
  }

  input:disabled + label:after {
    background: var(--my-color-gray-300);
  }
</style>
