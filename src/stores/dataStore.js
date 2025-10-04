/**
 * 📦 數據存儲模組 (Data Store Module) - Pinia Store
 *
 * 功能說明 (Features):
 * 1. 🏙️ 使用者選擇的城市管理
 * 2. 🗺️ 靜態定義圖層群組配置
 * 3. 👁️ 圖層顯示狀態與資料載入流程控制
 * 4. 📊 選中要素和圖層的狀態管理
 * 5. 🔄 分析結果的存儲和更新
 * 6. 📈 統計數據的計算和快取
 *
 * 架構設計 (Architecture Design):
 * - 使用 Pinia 進行集中式狀態管理
 * - 提供響應式狀態更新和數據同步
 * - 支援狀態持久化和恢復
 *
 * 設計重點 (Design Principles):
 * - 簡化的圖層管理流程
 * - 提供統一的 API 介面，簡化組件間的數據交互
 * - 支援異步操作和錯誤處理
 *
 * 狀態結構 (State Structure):
 * - layers: 圖層列表和配置
 * - selectedFeature: 當前選中的地理要素
 *
 * @file dataStore.js
 * @version 3.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 */
// ==================== 📦 第三方庫引入 (Third-Party Library Imports) ====================

/**
 * Pinia 狀態管理庫引入
 * Vue 3 官方推薦的狀態管理解決方案
 * 提供更好的 TypeScript 支援和開發者體驗
 *
 * @see https://pinia.vuejs.org/
 */
import { defineStore } from 'pinia';

/**
 * Vue 3 Composition API 核心功能引入
 * 提供響應式數據和計算屬性功能
 *
 * @see https://vuejs.org/
 */
import { ref, computed } from 'vue';

/**
 * 數據處理工具函數引入
 * 提供數據載入功能
 */
import { loadDataLayerJson } from '../utils/dataProcessor.js';

// ==================== 主要數據存儲定義 ====================

export const useDataStore = defineStore(
  'data',
  () => {
    // ==================== 圖層狀態管理 ====================

    // 存儲所有圖層的狀態 (visible, isLoaded, jsonData 等)
    const layerStates = ref({});

    // 靜態定義的圖層配置
    const layers = ref([
      {
        groupName: '測試圖層',
        groupLayers: [
          {
            layerId: 'test_layer',
            layerName: '測試圖層',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: null,
            colorName: 'orange',
            jsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            jsonLoader: loadDataLayerJson,
            jsonFileName: 'test/test.json',
            isDataLayer: true,
            hideFromMap: true,
            display: true,
          },
        ],
      },
      {
        groupName: '數據圖層',
        groupLayers: [
          {
            layerId: 'taipei_metro',
            layerName: 'Taipei Metro',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: null,
            colorName: 'orange',
            jsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            jsonLoader: loadDataLayerJson,
            jsonFileName: 'taipei/taipei_schematic.json',
            isDataLayer: true,
            hideFromMap: true,
            display: true,
          },
          {
            layerId: 'taipei_metro_2',
            layerName: 'Taipei Metro 2',
            visible: false,
            isLoading: false,
            isLoaded: false,
            type: 'point',
            shape: null,
            colorName: 'orange',
            jsonData: null,
            summaryData: null,
            tableData: null,
            legendData: null,
            jsonLoader: loadDataLayerJson,
            jsonFileName: 'taipei/taipei_schematic_2.json',
            isDataLayer: true,
            hideFromMap: true,
            display: true,
          },
        ],
      },
    ]);

    // 將靜態圖層配置與保存的狀態合併
    const mergeLayersWithStates = () => {
      // 收集當前所有圖層 ID
      const currentLayerIds = new Set();
      layers.value.forEach((mainGroup) => {
        mainGroup.groupLayers.forEach((layer) => {
          currentLayerIds.add(layer.layerId);
        });
      });

      // 清理不再存在的圖層狀態
      const newLayerStates = {};
      Object.keys(layerStates.value).forEach((layerId) => {
        if (currentLayerIds.has(layerId)) {
          newLayerStates[layerId] = layerStates.value[layerId];
        }
      });
      layerStates.value = newLayerStates;

      // 合併保存的狀態與靜態配置
      layers.value.forEach((mainGroup) => {
        mainGroup.groupLayers.forEach((layer) => {
          const savedState = layerStates.value[layer.layerId];
          if (savedState) {
            // 合併保存的狀態與靜態配置
            Object.assign(layer, savedState);
            // 確保函數引用不被覆蓋
            if (layer.jsonLoader) layer.jsonLoader = loadDataLayerJson;
          }
        });
      });
    };

    // 初始化時合併圖層狀態
    mergeLayersWithStates();

    // 保存圖層狀態到 layerStates
    const saveLayerState = (layerId, stateData) => {
      if (!layerStates.value[layerId]) {
        layerStates.value[layerId] = {};
      }
      Object.assign(layerStates.value[layerId], stateData);
    };

    // ==================== 圖層搜尋函數 ====================

    // 在靜態圖層配置中搜尋指定 ID 的圖層
    const findLayerById = (layerId) => {
      for (const mainGroup of layers.value) {
        for (const layer of mainGroup.groupLayers) {
          if (layer.layerId === layerId) {
            return layer;
          }
        }
      }
      return null;
    };

    // 從靜態圖層配置中提取所有圖層的扁平陣列
    const getAllLayers = () => {
      const allLayers = [];
      for (const mainGroup of layers.value) {
        allLayers.push(...mainGroup.groupLayers);
      }
      return allLayers;
    };

    /**
     * 獲取可用於地圖顯示的圖層（過濾掉 hideFromMap 的圖層）
     * @returns {Array} 可用於地圖顯示的圖層列表
     */
    const getMapLayers = () => {
      return getAllLayers().filter((layer) => !layer.hideFromMap);
    };

    // ==================== 主要圖層處理函數 ====================

    // 控制圖層的顯示/隱藏，並在需要時自動載入資料
    const toggleLayerVisibility = async (layerId) => {
      const layer = findLayerById(layerId);
      if (!layer) {
        console.error(`❌ DataStore: Layer with id "${layerId}" not found.`);
        return;
      }

      console.log('🔧 DataStore: 找到圖層', {
        layerId,
        layerName: layer.layerName,
        currentVisible: layer.visible,
        isLoaded: layer.isLoaded,
        isLoading: layer.isLoading,
      });

      // 切換可見性狀態
      layer.visible = !layer.visible;

      // 保存圖層的可見性狀態
      saveLayerState(layerId, { visible: layer.visible });

      // 如果圖層被開啟且尚未載入，則載入資料
      const shouldLoad = layer.visible && !layer.isLoaded && !layer.isLoading;
      console.log('🔧 DataStore: 載入條件檢查', {
        visible: layer.visible,
        isLoaded: layer.isLoaded,
        isLoading: layer.isLoading,
        shouldLoad,
      });

      if (shouldLoad) {
        try {
          layer.isLoading = true;
          saveLayerState(layerId, { isLoading: layer.isLoading });

          // 載入圖層數據
          const result = await layer.jsonLoader(layer);

          // 更新圖層資料
          layer.jsonData = result.jsonData;
          layer.tableData = result.tableData;
          layer.summaryData = result.summaryData;
          layer.legendData = result.legendData || null;
          layer.isLoaded = true;

          console.log(`✅ 圖層 "${layer.layerName}" 載入完成`);
          console.log(`📊 圖層摘要資料:`, layer.summaryData);

          // 保存完整的圖層狀態
          saveLayerState(layerId, {
            isLoaded: layer.isLoaded,
            jsonData: layer.jsonData,
            tableData: layer.tableData,
            summaryData: layer.summaryData,
            legendData: layer.legendData,
          });
        } catch (error) {
          console.error(`❌ 載入圖層 "${layer.layerName}" 失敗:`, error);
          layer.visible = false; // 載入失敗時恢復可見性狀態
          saveLayerState(layerId, { visible: false });
        } finally {
          layer.isLoading = false;
          saveLayerState(layerId, { isLoading: false });
        }
      }
    };

    // ==================== 地圖物件管理 ====================

    // 選中的地圖物件
    const selectedFeature = ref(null);

    const setSelectedFeature = (feature) => {
      // 記錄選取變化的log
      if (feature) {
        console.log('🎯 DataStore: 設置選中要素:', feature.properties?.id);
      } else {
        console.log('🗑️ DataStore: 清除選中要素');
      }
      selectedFeature.value = feature;
    };

    const clearSelectedFeature = () => {
      console.log('🗑️ DataStore: 清除選中要素');
      selectedFeature.value = null;
    };

    /**
     * 根據圖層ID找到對應的群組名稱
     * @param {string} layerId - 圖層ID
     * @returns {string|null} - 群組名稱，如果找不到則返回null
     */
    const findGroupNameByLayerId = (layerId) => {
      for (const mainGroup of layers.value) {
        for (const layer of mainGroup.groupLayers) {
          if (layer.layerId === layerId) {
            return mainGroup.groupName;
          }
        }
      }
      return null;
    };

    // ==================== 返回的狀態和方法 ====================

    return {
      layers,
      findLayerById, // 根據 ID 尋找圖層
      getAllLayers, // 獲取所有圖層的扁平陣列
      findGroupNameByLayerId, // 根據圖層ID找到對應的群組名稱
      toggleLayerVisibility,
      selectedFeature,
      setSelectedFeature,
      clearSelectedFeature,
      visibleLayers: computed(() => getAllLayers().filter((layer) => layer.visible)),
      loadingLayers: computed(() => getAllLayers().filter((layer) => layer.isLoading)),
      // 狀態管理相關函數
      layerStates,
      saveLayerState,
      mergeLayersWithStates,
      getMapLayers,
    };
  },
  {
    persist: true,
  }
);
