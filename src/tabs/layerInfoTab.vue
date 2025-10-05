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
載入狀態：顯示資料載入進度和狀態 * * @file layerInfoTab.vue * @version 2.1.0 * @author Kevin Cheng *
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
   * - 每個圖層包含 layerId, layerName, dataTableData 等屬性
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
   * 🎨 格式化顯示值 (Format Display Value)
   * 根據值的類型進行適當的格式化處理，避免顯示 [object Object]
   *
   * @param {any} value - 要格式化的值
   * @returns {string} 格式化後的顯示值
   * @description
   * - 處理基本類型：直接返回
   * - 處理陣列：格式化陣列內容
   * - 處理物件：轉換為 JSON 字串或顯示物件屬性
   * - 處理 null/undefined：顯示適當的預設值
   */
  const formatDisplayValue = (value) => {
    // 處理 null 或 undefined
    if (value === null || value === undefined) {
      return '無資料';
    }

    // 處理基本類型
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    // 處理陣列
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '空陣列';
      }

      // 檢查陣列內容是否為物件
      const hasObjects = value.some((item) => typeof item === 'object' && item !== null);

      if (hasObjects) {
        // 如果是物件陣列，顯示物件的主要屬性
        return value
          .map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              // 嘗試顯示物件的主要屬性
              const keys = Object.keys(item);
              if (keys.length > 0) {
                const mainKey = keys[0];
                return `${index + 1}: ${mainKey}=${item[mainKey]}`;
              }
              return `${index + 1}: 物件`;
            }
            return String(item);
          })
          .join(', ');
      } else {
        // 基本類型陣列，直接連接
        return value.join(', ');
      }
    }

    // 處理物件
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return '空物件';
      }

      // 如果物件屬性較少，顯示所有屬性
      if (keys.length <= 3) {
        return keys.map((key) => `${key}: ${value[key]}`).join(', ');
      }

      // 如果物件屬性較多，顯示前幾個屬性
      const previewKeys = keys.slice(0, 2);
      return (
        previewKeys.map((key) => `${key}: ${value[key]}`).join(', ') +
        ` ... (共 ${keys.length} 個屬性)`
      );
    }

    // 其他類型，轉換為字串
    return String(value);
  };

  /**
   * 📊 取得當前圖層資訊數據 (Get Current Layer Info Data)
   * 獲取當前選中圖層的 layerInfoData
   *
   * @returns {Object|null} 當前圖層的資訊數據
   * @description
   * - 查找當前選中的圖層
   * - 返回 layerInfoData 對象
   * - 處理圖層不存在或無資料的情況
   */
  const getCurrentLayerInfoData = () => {
    if (!activeLayerTab.value) return null;
    const currentLayer = visibleLayers.value.find(
      (layer) => layer.layerId === activeLayerTab.value
    );
    return currentLayer ? currentLayer.layerInfoData || null : null;
  };

  /**
   * 取得目前圖層的 layerInfoData（過濾掉 gridX/gridY，避免與有效值重覆顯示）
   */
  const currentLayerInfoEntries = computed(() => {
    const data = getCurrentLayerInfoData();
    if (!data) return [];
    return Object.entries(data).filter(([key]) => key !== 'gridX' && key !== 'gridY');
  });

  /**
   * 取得當前圖層在重繪後的實際網格狀態（可見行列與單元尺寸）
   */
  const getComputedGridState = () => {
    if (!activeLayerTab.value) return null;
    const layerState = dataStore.layerStates?.[activeLayerTab.value];
    return layerState && layerState.computedGridState ? layerState.computedGridState : null;
  };

  /**
   * 📏 計算網格寬度 (Calculate Grid Width)
   * 根據 D3js 容器尺寸和網格配置計算每個網格單元的寬度
   *
   * @returns {number} 網格單元寬度（像素）
   * @description
   * - 從當前圖層的 layerInfoData 或 processedJsonData 中獲取網格配置
   * - 根據 D3js 容器尺寸和網格 X 方向數量計算單元寬度
   * - 如果沒有網格配置則返回 0
   */
  const getGridWidth = () => {
    const layerInfoData = getCurrentLayerInfoData();
    const currentLayer = visibleLayers.value.find(
      (layer) => layer.layerId === activeLayerTab.value
    );

    // 優先使用重繪後計算出的 cellWidth
    const computedState = getComputedGridState();
    if (computedState && computedState.cellWidth > 0) {
      return computedState.cellWidth;
    }

    if (!dataStore.d3jsDimensions.width) {
      return 0;
    }

    // 嘗試從不同來源獲取網格配置
    let gridX = null;

    // 1. 從 layerInfoData 獲取
    if (layerInfoData && layerInfoData.gridX) {
      gridX = layerInfoData.gridX;
    }
    // 2. 從 processedJsonData 獲取
    else if (
      currentLayer &&
      currentLayer.processedJsonData &&
      currentLayer.processedJsonData.gridX
    ) {
      gridX = currentLayer.processedJsonData.gridX;
    }
    // 3. 從 dashboardData 獲取
    else if (currentLayer && currentLayer.dashboardData && currentLayer.dashboardData.gridX) {
      gridX = currentLayer.dashboardData.gridX;
    }
    // 4. 從台北捷運等示意圖數據計算網格尺寸
    else if (
      currentLayer &&
      currentLayer.processedJsonData &&
      Array.isArray(currentLayer.processedJsonData) &&
      currentLayer.processedJsonData.length > 0 &&
      currentLayer.processedJsonData[0].nodes
    ) {
      // 這是台北捷運等示意圖數據，需要從節點座標計算網格尺寸
      const allXCoords = [];

      currentLayer.processedJsonData.forEach((line) => {
        if (line.nodes && Array.isArray(line.nodes)) {
          line.nodes.forEach((node) => {
            if (node.coord && typeof node.coord.x === 'number') {
              allXCoords.push(node.coord.x);
            }
          });
        }
      });

      if (allXCoords.length > 0) {
        const minX = Math.min(...allXCoords);
        const maxX = Math.max(...allXCoords);
        gridX = maxX - minX + 1; // 網格寬度 = 最大x - 最小x + 1
        console.log('🔍 從台北捷運數據計算網格寬度:', {
          minX,
          maxX,
          gridX,
          allXCoords: allXCoords.slice(0, 10),
        });
      }
    }

    if (!gridX) {
      console.log('🔍 Grid Width Debug: 找不到 gridX 配置', {
        layerInfoData,
        currentLayer: currentLayer
          ? {
              processedJsonData: currentLayer.processedJsonData,
              dashboardData: currentLayer.dashboardData,
            }
          : null,
      });

      // 如果是非網格圖層，返回 0 表示不適用
      if (currentLayer && !currentLayer.isGridSchematic) {
        console.log('🔍 非網格圖層，Grid Width 不適用');
        return 0;
      }

      return 0;
    }

    // 計算網格單元寬度：容器寬度 / 網格 X 方向數量
    const containerWidth = dataStore.d3jsDimensions.width;
    const cellWidth = Math.floor(containerWidth / gridX);

    console.log('🔍 Grid Width Debug:', {
      containerWidth,
      gridX,
      cellWidth,
    });

    return cellWidth;
  };

  /**
   * 📏 計算網格高度 (Calculate Grid Height)
   * 根據 D3js 容器尺寸和網格配置計算每個網格單元的高度
   *
   * @returns {number} 網格單元高度（像素）
   * @description
   * - 從當前圖層的 layerInfoData 或 processedJsonData 中獲取網格配置
   * - 根據 D3js 容器尺寸和網格 Y 方向數量計算單元高度
   * - 如果沒有網格配置則返回 0
   */
  const getGridHeight = () => {
    const layerInfoData = getCurrentLayerInfoData();
    const currentLayer = visibleLayers.value.find(
      (layer) => layer.layerId === activeLayerTab.value
    );

    // 優先使用重繪後計算出的 cellHeight
    const computedState = getComputedGridState();
    if (computedState && computedState.cellHeight > 0) {
      return computedState.cellHeight;
    }

    if (!dataStore.d3jsDimensions.height) {
      return 0;
    }

    // 嘗試從不同來源獲取網格配置
    let gridY = null;

    // 1. 從 layerInfoData 獲取
    if (layerInfoData && layerInfoData.gridY) {
      gridY = layerInfoData.gridY;
    }
    // 2. 從 processedJsonData 獲取
    else if (
      currentLayer &&
      currentLayer.processedJsonData &&
      currentLayer.processedJsonData.gridY
    ) {
      gridY = currentLayer.processedJsonData.gridY;
    }
    // 3. 從 dashboardData 獲取
    else if (currentLayer && currentLayer.dashboardData && currentLayer.dashboardData.gridY) {
      gridY = currentLayer.dashboardData.gridY;
    }
    // 4. 從台北捷運等示意圖數據計算網格尺寸
    else if (
      currentLayer &&
      currentLayer.processedJsonData &&
      Array.isArray(currentLayer.processedJsonData) &&
      currentLayer.processedJsonData.length > 0 &&
      currentLayer.processedJsonData[0].nodes
    ) {
      // 這是台北捷運等示意圖數據，需要從節點座標計算網格尺寸
      const allYCoords = [];

      currentLayer.processedJsonData.forEach((line) => {
        if (line.nodes && Array.isArray(line.nodes)) {
          line.nodes.forEach((node) => {
            if (node.coord && typeof node.coord.y === 'number') {
              allYCoords.push(node.coord.y);
            }
          });
        }
      });

      if (allYCoords.length > 0) {
        const minY = Math.min(...allYCoords);
        const maxY = Math.max(...allYCoords);
        gridY = maxY - minY + 1; // 網格高度 = 最大y - 最小y + 1
        console.log('🔍 從台北捷運數據計算網格高度:', {
          minY,
          maxY,
          gridY,
          allYCoords: allYCoords.slice(0, 10),
        });
      }
    }

    if (!gridY) {
      console.log('🔍 Grid Height Debug: 找不到 gridY 配置', {
        layerInfoData,
        currentLayer: currentLayer
          ? {
              processedJsonData: currentLayer.processedJsonData,
              dashboardData: currentLayer.dashboardData,
            }
          : null,
      });

      // 如果是非網格圖層，返回 0 表示不適用
      if (currentLayer && !currentLayer.isGridSchematic) {
        console.log('🔍 非網格圖層，Grid Height 不適用');
        return 0;
      }

      return 0;
    }

    // 計算網格單元高度：容器高度 / 網格 Y 方向數量
    const containerHeight = dataStore.d3jsDimensions.height;
    const cellHeight = Math.floor(containerHeight / gridY);

    console.log('🔍 Grid Height Debug:', {
      containerHeight,
      gridY,
      cellHeight,
    });

    return cellHeight;
  };

  /**
   * 取得有效的 Grid X（顯示中的欄數）
   */
  const getEffectiveGridX = () => {
    const computedState = getComputedGridState();
    if (computedState && computedState.visibleX) return computedState.visibleX;

    // 後備：沿用原本的 gridX 推導邏輯
    const layerInfoData = getCurrentLayerInfoData();
    const currentLayer = visibleLayers.value.find(
      (layer) => layer.layerId === activeLayerTab.value
    );

    let gridX = null;
    if (layerInfoData && layerInfoData.gridX) gridX = layerInfoData.gridX;
    else if (currentLayer && currentLayer.processedJsonData && currentLayer.processedJsonData.gridX)
      gridX = currentLayer.processedJsonData.gridX;
    else if (currentLayer && currentLayer.dashboardData && currentLayer.dashboardData.gridX)
      gridX = currentLayer.dashboardData.gridX;
    return gridX || 0;
  };

  /**
   * 取得有效的 Grid Y（顯示中的列數）
   */
  const getEffectiveGridY = () => {
    const computedState = getComputedGridState();
    if (computedState && computedState.visibleY) return computedState.visibleY;

    // 後備：沿用原本的 gridY 推導邏輯
    const layerInfoData = getCurrentLayerInfoData();
    const currentLayer = visibleLayers.value.find(
      (layer) => layer.layerId === activeLayerTab.value
    );

    let gridY = null;
    if (layerInfoData && layerInfoData.gridY) gridY = layerInfoData.gridY;
    else if (currentLayer && currentLayer.processedJsonData && currentLayer.processedJsonData.gridY)
      gridY = currentLayer.processedJsonData.gridY;
    else if (currentLayer && currentLayer.dashboardData && currentLayer.dashboardData.gridY)
      gridY = currentLayer.dashboardData.gridY;
    return gridY || 0;
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
    if (!layer || !layer.processedJsonData) {
      console.warn('無法載入資訊：圖層數據不存在');
      return;
    }

    isLoadingAnalysis.value = true;

    try {
      // 模擬載入過程，提供視覺反饋
      await new Promise((resolve) => setTimeout(resolve, 500));

      const features = layer.processedJsonData.features;

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
        if (layer && layer.processedJsonData) {
          loadLayerInfo(layer);
        }
      } else {
        analysisResults.value = null;
      }
    },
    { immediate: true }
  );

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
          <template v-if="visibleLayers.length > 0 && getCurrentLayerInfoData()">
            <!-- 顯示 layerInfoData 的所有內容 -->
            <div v-for="[key, value] in currentLayerInfoEntries" :key="key" class="pb-2">
              <div class="my-title-xs-gray pb-1">{{ key }}</div>
              <div class="my-content-sm-black pb-1">
                {{ formatDisplayValue(value) }}
              </div>
            </div>

            <!-- D3jsTab 繪製範圍尺寸 -->
            <DetailItem label="D3js Width" :value="dataStore.d3jsDimensions.width + 'px'" />
            <DetailItem label="D3js Height" :value="dataStore.d3jsDimensions.height + 'px'" />

            <!-- Grid 網格尺寸 -->
            <DetailItem
              label="Grid Width"
              :value="getGridWidth() > 0 ? getGridWidth() + 'px' : 'N/A'"
            />
            <DetailItem
              label="Grid Height"
              :value="getGridHeight() > 0 ? getGridHeight() + 'px' : 'N/A'"
            />

            <!-- Grid 維度（顯示中的 gridX / gridY） -->
            <DetailItem
              label="gridX"
              :value="getEffectiveGridX() > 0 ? getEffectiveGridX() : 'N/A'"
            />
            <DetailItem
              label="gridY"
              :value="getEffectiveGridY() > 0 ? getEffectiveGridY() : 'N/A'"
            />
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
