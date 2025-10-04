/** * 📊 圖層資訊顯示組件 (Layer Information Display Component) * * 功能概述 (Function Overview): *
本組件負責顯示當前選中圖層的詳細資訊，包括基本統計數據、項目數量、 *
以及相關的技術參數。提供直觀的圖層資訊查看介面。 * * 主要功能 (Main Features): * 1. 📋
圖層資訊展示：顯示當前選中圖層的基本資訊和統計數據 * 2. 📊
項目數量統計：計算並顯示圖層中包含的資料項目總數 * 3. 🔄
多圖層支援：支援多個圖層的分頁切換和資訊顯示 * 4. 📱 響應式設計：適配不同螢幕尺寸的顯示需求 * 5. 🎯
即時更新：當圖層狀態變化時自動更新顯示內容 * 6. 📐 技術參數顯示：顯示 D3.js 繪圖區域的尺寸資訊 * *
技術特點 (Technical Features): * - 使用 Vue 3 Composition API 進行現代化狀態管理 * - 整合 Pinia
狀態管理系統實現跨組件數據共享 * - 支援動態圖層切換和資訊即時更新 * - 提供簡潔直觀的圖層資訊展示介面
* - 具備載入狀態指示和錯誤處理機制 * * 顯示內容 (Display Content): * -
項目數量：當前圖層包含的資料項目總數 * - 圖層標題：包含群組名稱和圖層名稱的完整標題 * -
分頁導航：支援多圖層的分頁切換功能 * - 技術參數：D3.js 繪圖區域的寬度和高度資訊 * -
載入狀態：顯示資料載入進度和狀態 * * @file LayerInfo.vue * @version 2.1.0 * @author Kevin Cheng *
@since 1.0.0 * @updated 2024 - 重構為圖層資訊顯示組件 */
<script setup>
  // ==================== 📦 第三方庫引入 (Third-Party Library Imports) ====================

  /**
   * Vue 3 Composition API 核心功能引入
   * 提供響應式數據管理、計算屬性、生命週期鉤子等現代化 Vue 開發功能
   *
   * @description 包含：
   * - ref: 創建響應式基本類型數據
   * - computed: 創建計算屬性，自動追蹤依賴變化
   * - watch: 監聽響應式數據變化
   * - onMounted: 組件掛載完成後的生命週期鉤子
   *
   * @see https://vuejs.org/guide/extras/composition-api-faq.html
   */
  import { ref, computed, watch, onMounted } from 'vue';

  /**
   * Pinia 狀態管理庫引入
   * 提供集中式狀態管理和跨組件數據共享能力
   *
   * @description 主要功能：
   * - 集中管理應用程式全域狀態
   * - 提供響應式狀態更新機制
   * - 支援跨組件狀態共享
   * - 整合開發者工具支援
   *
   * @see https://pinia.vuejs.org/introduction.html
   */
  import { useDataStore } from '@/stores/dataStore.js';

  /**
   * 工具函數引入
   * 提供圖示 HTML 生成和組件引入功能
   */
  import { getIconHtml } from '../utils/utils.js';
  import DetailItem from '../components/DetailItem.vue';

  // ==================== 🏪 狀態管理初始化 (State Management Initialization) ====================

  /**
   * 獲取 Pinia 數據存儲實例
   * 用於訪問全域狀態和圖層數據，實現組件間的數據共享
   *
   * @type {Object} Pinia store 實例
   * @description 提供對全域圖層數據、設定狀態等的訪問權限
   */
  const dataStore = useDataStore();

  // ==================== 📊 響應式狀態定義 (Reactive State Definition) ====================

  /**
   * 📑 當前作用中的圖層分頁 (Active Layer Tab)
   * 追蹤使用者當前選中的圖層分頁，用於控制資訊內容顯示
   *
   * @type {Ref<string|null>}
   * @description
   * - 存儲當前選中圖層的 layerId
   * - null 表示沒有選中任何圖層
   * - 用於控制哪個圖層的資訊需要顯示
   */
  const activeLayerTab = ref(null);

  /**
   * 📊 分析結果 (Analysis Results)
   * 存儲圖層分析的結果數據，用於顯示統計資訊
   *
   * @type {Ref<Object|null>}
   * @description
   * - 包含圖層統計數據的物件
   * - null 表示尚未載入分析結果
   * - 結構包含 layerName, timestamp, statistics 等欄位
   */
  const analysisResults = ref(null);

  /**
   * 🔄 分析載入狀態 (Analysis Loading State)
   * 追蹤分析過程的載入狀態，用於顯示載入指示器
   *
   * @type {Ref<boolean>}
   * @description
   * - true: 正在載入分析結果，顯示載入動畫
   * - false: 載入完成，顯示分析結果或錯誤訊息
   */
  const isLoadingAnalysis = ref(false);

  // ==================== 📊 計算屬性定義 (Computed Properties Definition) ====================

  /**
   * 獲取所有可見且有資料的圖層 (Get All Visible Layers with Data)
   * 從全域狀態中篩選出可見且已載入資料的圖層
   *
   * @type {ComputedRef<Array>}
   * @description
   * - 返回包含所有可見圖層的陣列
   * - 用於生成分頁導航和圖層切換功能
   * - 每個圖層包含 layerId, layerName, tableData 等屬性
   * - 自動響應全域狀態變化
   *
   * @returns {Array<Object>} 可見圖層陣列
   */
  const visibleLayers = computed(() => {
    // 從數據存儲中獲取所有圖層
    const allLayers = dataStore.getAllLayers();
    // 篩選出可見的圖層（layer.visible === true）
    return allLayers.filter((layer) => layer.visible);
  });

  // ==================== 🎯 核心功能函數 (Core Function Functions) ====================

  /**
   * 📑 設定作用中圖層分頁 (Set Active Layer Tab)
   * 切換到指定的圖層分頁並觸發相關的資訊載入
   *
   * @param {string} layerId - 要切換到的圖層 ID
   * @description 更新 activeLayerTab 狀態，觸發圖層資訊載入
   */
  const setActiveLayerTab = (layerId) => {
    activeLayerTab.value = layerId;
  };

  /**
   * 📊 取得圖層完整標題 (包含群組名稱) (Get Layer Full Title with Group Name)
   * 組合群組名稱和圖層名稱，形成完整的圖層標題
   *
   * @param {Object} layer - 圖層物件
   * @returns {Object} 包含 groupName 和 layerName 的物件
   * @description
   * - 從 dataStore 中查找對應的群組名稱
   * - 返回結構化的標題資訊
   * - 處理圖層不存在的情況
   */
  const getLayerFullTitle = (layer) => {
    if (!layer) return { groupName: null, layerName: '未知圖層' };
    const groupName = dataStore.findGroupNameByLayerId(layer.layerId);
    return {
      groupName: groupName,
      layerName: layer.layerName,
    };
  };

  /**
   * 📊 取得當前圖層的項目數量 (Get Current Layer Item Count)
   * 計算當前選中圖層中包含的資料項目總數
   *
   * @returns {number} 當前圖層的項目數量
   * @description
   * - 查找當前選中的圖層
   * - 返回 tableData 陣列的長度
   * - 處理圖層不存在或無資料的情況
   */
  const getCurrentLayerItemCount = () => {
    if (!activeLayerTab.value) return 0;
    const currentLayer = visibleLayers.value.find(
      (layer) => layer.layerId === activeLayerTab.value
    );
    if (!currentLayer || !currentLayer.tableData) return 0;
    return currentLayer.tableData.length;
  };

  // ==================== 👀 響應式監聽器 (Reactive Watchers) ====================

  /**
   * 記錄上一次的圖層列表用於比較變化
   * 用於偵測新增的圖層並自動切換到最新圖層
   */
  const previousLayers = ref([]);

  /**
   * 👀 監聽可見圖層變化，自動切換到新開啟的圖層分頁
   * 當圖層可見性發生變化時，自動調整當前選中的分頁
   *
   * @description 主要邏輯：
   * - 偵測新增的圖層並自動切換到最新圖層
   * - 處理圖層被隱藏時的分頁切換
   * - 當沒有可見圖層時清除選中狀態
   * - 維護圖層列表的歷史記錄
   */
  watch(
    () => visibleLayers.value,
    (newLayers) => {
      // 如果沒有可見圖層，清除選中的分頁和分析結果
      if (newLayers.length === 0) {
        activeLayerTab.value = null;
        analysisResults.value = null;
        previousLayers.value = [];
        return;
      }

      // 找出新增的圖層（比較新舊圖層列表）
      const previousLayerIds = previousLayers.value.map((layer) => layer.layerId);
      const newLayerIds = newLayers.map((layer) => layer.layerId);
      const addedLayerIds = newLayerIds.filter((id) => !previousLayerIds.includes(id));

      // 如果有新增的圖層，自動切換到最新新增的圖層
      if (addedLayerIds.length > 0) {
        const newestAddedLayerId = addedLayerIds[addedLayerIds.length - 1];
        activeLayerTab.value = newestAddedLayerId;
      }
      // 如果當前沒有選中分頁，或選中的分頁不在可見列表中，選中第一個
      else if (
        !activeLayerTab.value ||
        !newLayers.find((layer) => layer.layerId === activeLayerTab.value)
      ) {
        activeLayerTab.value = newLayers[0].layerId;
      }

      // 更新記錄的圖層列表
      previousLayers.value = [...newLayers];
    },
    { deep: true, immediate: true }
  );

  /**
   * 👀 監聽當前選中的圖層變化，自動執行資訊載入
   * 當 activeLayerTab 發生變化時，自動載入對應圖層的資訊
   *
   * @description 主要邏輯：
   * - 當切換到新圖層時，自動載入該圖層的資訊
   * - 當清除選中狀態時，清除分析結果
   * - 確保圖層資訊與當前選中狀態保持同步
   */
  watch(
    () => activeLayerTab.value,
    (newLayerId) => {
      if (newLayerId) {
        const layer = dataStore.findLayerById(newLayerId);
        if (layer && layer.jsonData) {
          loadLayerInfo(layer);
        }
      } else {
        analysisResults.value = null;
      }
    },
    { immediate: true }
  );

  // ==================== 📊 資料處理函數 (Data Processing Functions) ====================

  /**
   * 📊 載入圖層基本資訊 (Load Layer Basic Information)
   * 分析指定圖層的資料並計算統計資訊
   *
   * @param {Object} layer - 要載入資訊的圖層物件
   * @description 主要功能：
   * - 分析圖層中的 features 資料
   * - 計算總數量、總人口數、平均值等統計指標
   * - 提供載入狀態指示和錯誤處理
   * - 將結果存儲到 analysisResults 中
   */
  const loadLayerInfo = async (layer) => {
    if (!layer || !layer.jsonData) {
      console.warn('無法載入資訊：圖層數據不存在');
      return;
    }

    isLoadingAnalysis.value = true;

    try {
      // 模擬載入過程，提供視覺反饋
      await new Promise((resolve) => setTimeout(resolve, 500));

      const features = layer.jsonData.features;

      // 計算基本統計資訊
      const stats = {
        totalFeatures: features.length,
        totalPopulation: features.reduce((sum, f) => sum + (f.properties.P_CNT || 0), 0),
        totalCount: features.reduce((sum, f) => sum + (f.properties.count || 0), 0),
        avgPopulation: 0,
        avgCount: 0,
      };

      // 計算平均值（避免除零錯誤）
      if (stats.totalFeatures > 0) {
        stats.avgPopulation = stats.totalPopulation / stats.totalFeatures;
        stats.avgCount = stats.totalCount / stats.totalFeatures;
      }

      // 儲存分析結果
      analysisResults.value = {
        layerName: layer.layerName,
        timestamp: new Date().toLocaleString(),
        statistics: stats,
      };

      console.log('圖層資訊載入完成:', analysisResults.value);
    } catch (error) {
      console.error('載入圖層資訊失敗:', error);
      // 儲存錯誤資訊以供顯示
      analysisResults.value = {
        error: '載入過程中發生錯誤',
        details: error.message,
      };
    } finally {
      isLoadingAnalysis.value = false;
    }
  };

  // ==================== 🚀 生命週期鉤子 (Lifecycle Hooks) ====================

  /**
   * 🚀 組件掛載事件 (Component Mounted Event)
   * 組件初始化完成後的設定工作
   *
   * @description 主要工作：
   * - 初始化第一個可見圖層為作用中分頁
   * - 確保組件載入後有正確的初始狀態
   */
  onMounted(() => {
    // 初始化第一個可見圖層為作用中分頁
    if (visibleLayers.value.length > 0 && !activeLayerTab.value) {
      activeLayerTab.value = visibleLayers.value[0].layerId;
    }
  });
</script>

<template>
  <!-- 📊 圖層資訊分頁視圖組件 -->
  <div class="d-flex flex-column my-bgcolor-gray-200 h-100">
    <!-- 📑 圖層分頁導航 -->
    <div v-if="visibleLayers.length > 0" class="">
      <ul class="nav nav-tabs nav-fill">
        <li
          v-for="layer in visibleLayers"
          :key="layer.layerId"
          class="nav-item d-flex flex-column align-items-center"
        >
          <!-- tab按鈕 -->
          <div
            class="btn nav-link rounded-0 border-0 position-relative d-flex align-items-center justify-content-center my-bgcolor-gray-200"
            :class="{
              active: activeLayerTab === layer.layerId,
            }"
            @click="setActiveLayerTab(layer.layerId)"
          >
            <span>
              <span v-if="getLayerFullTitle(layer).groupName" class="my-title-xs-gray"
                >{{ getLayerFullTitle(layer).groupName }} -
              </span>
              <span class="my-title-sm-black">{{ getLayerFullTitle(layer).layerName }}</span>
            </span>
          </div>
          <div class="w-100" :class="`my-bgcolor-${layer.colorName}`" style="min-height: 4px"></div>
        </li>
      </ul>
    </div>

    <!-- 有開啟圖層時的內容 -->
    <div v-if="visibleLayers.length > 0" class="my-bgcolor-white h-100">
      <div>
        <div class="p-3">
          <!-- 載入狀態區域 -->
          <div v-if="isLoadingAnalysis" class="pb-2">
            <div class="my-title-xs-gray pb-1">載入狀態</div>
            <div class="my-content-sm-black pb-1">
              <span v-html="getIconHtml('spinner', 'fa-spin me-2')"></span>
              正在載入圖層資訊...
            </div>
          </div>

          <!-- 圖層資訊顯示區域 -->
          <template v-if="visibleLayers.length > 0">
            <div class="pb-2">
              <div class="my-title-xs-gray pb-1">項目數量</div>
              <div class="my-content-sm-black pb-1">
                {{ getCurrentLayerItemCount() }}
              </div>
            </div>

            <!-- D3jsTab 繪製範圍尺寸 -->
            <DetailItem label="D3js Width" :value="dataStore.d3jsDimensions.width + 'px'" />
            <DetailItem label="D3js Height" :value="dataStore.d3jsDimensions.height + 'px'" />
          </template>

          <!-- 錯誤顯示 -->
          <div v-else-if="analysisResults && analysisResults.error" class="pb-2">
            <div class="my-title-xs-gray pb-1">載入錯誤</div>
            <div class="my-content-sm-black pb-1">{{ analysisResults.error }}</div>
            <div v-if="analysisResults.details" class="my-content-xs-gray pb-1">
              詳細信息：{{ analysisResults.details }}
            </div>
          </div>

          <!-- 初始狀態 -->
          <div v-else-if="!isLoadingAnalysis" class="pb-2">
            <div class="my-title-xs-gray pb-1">載入狀態</div>
            <div class="my-content-sm-black pb-1">等待圖層數據載入...</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 沒有開啟圖層時的空狀態 -->
    <div v-else class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="my-title-md-gray p-3">沒有開啟的圖層</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
