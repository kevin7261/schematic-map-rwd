/**
 * 📦 數據存儲模組 (Data Store Module) - Pinia Store
 *
 * 功能說明 (Features):
 * 1. 🏙️ 使用者選擇的城市管理
 * 2. 🗺️ 動態生成圖層群組（委託 layerFactory）
 * 3. 👁️ 圖層顯示狀態與資料載入流程控制
 * 5. 📊 選中要素和圖層的狀態管理
 * 6. 🔄 分析結果的存儲和更新
 * 7. 📈 統計數據的計算和快取
 *
 * 架構設計 (Architecture Design):
 * - 使用 Pinia 進行集中式狀態管理
 * - 採用 LayerProcessor 類別封裝複雜的載入與分析流程
 * - 提供響應式狀態更新和數據同步
 * - 支援狀態持久化和恢復
 *
 * 設計重點 (Design Principles):
 * - 以 LayerProcessor 類別封裝載入與分析的流程，降低 toggleLayerVisibility 複雜度
 * - 合併 layer 配置與保存狀態時，嚴格保留函式引用（避免被持久化狀態覆蓋）
 * - 提供統一的 API 介面，簡化組件間的數據交互
 * - 支援異步操作和錯誤處理
 *
 * 狀態結構 (State Structure):
 * - layers: 圖層列表和配置
 * - selectedFeature: 當前選中的地理要素
 * - selectedLayer: 當前選中的圖層
 * - colorModes: 顏色模式配置
 * - loadingStates: 載入狀態管理
 *
 * @file dataStore.js
 * @version 2.0.0
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

// ==================== 🔧 工具函數引入 (Utility Function Imports) ====================

/**
 * 數據處理工具函數引入
 * 提供分類計算和顏色指定功能
 */

/**
 * 圖層工廠工具函數引入
 * 提供動態圖層生成和數據可用性檢查
 */
import {
  generateDynamicLayers, // 動態生成圖層配置
} from '../utils/layerFactory.js';

// ==================== 🏭 圖層處理器類別 (Layer Processor Class) ====================

/**
 * 🏭 圖層載入處理器類別 (Layer Loading Processor Class)
 *
 * 功能說明：
 * - 負責處理不同類型圖層的資料載入、合併與分析流程
 * - 封裝複雜的資料處理邏輯，提供統一的錯誤處理機制
 * - 支援異步操作和進度追蹤
 * - 提供可重用的圖層處理方法
 *
 * 設計模式：
 * - 策略模式：根據圖層類型選擇不同的處理策略
 * - 模板方法模式：定義統一的處理流程
 * - 觀察者模式：提供進度更新和狀態通知
 *
 * 支援的圖層類型：
 * - 人口社會圖資：GeoJSON 地理數據
 * - 合併圖層：GeoJSON + Excel 統計數據
 * - 時序圖層：時序數據
 *
 * @class LayerProcessor
 * @version 2.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 */
class LayerProcessor {
  /**
   * 建構函數
   * 初始化圖層處理器，建立與數據存儲的關聯
   *
   * @param {Object} dataStore - Pinia 數據存儲實例
   */
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  /**
   * 處理需要合併 Excel 的圖層
   * 載入 GeoJSON 和 Excel 數據，合併後進行分類處理
   * @param {Object} layer - 圖層配置對象
   * @returns {number} - 處理的要素數量
   * @throws {Error} - 當載入或處理過程中發生錯誤時
   */
  async processExcelMergedLayer(layer) {
    // ==================== 📋 步驟 1: 解構圖層配置參數 (Step 1: Destructure Layer Configuration Parameters) ====================

    // 從圖層配置對象中解構所需的函數和參數
    // 這些參數定義了數據載入、合併和分析的具體流程
    const {
      geojsonLoader, // GeoJSON 數據載入函數
      excelSheetLoader, // Excel 數據載入函數
      mergeFunction, // 數據合併函數
      classificationFunction, // 分類計算函數
      geojsonMergeField, // GeoJSON 合併欄位名
      excelMergeField, // Excel 合併欄位名
    } = layer;

    // ==================== 📁 步驟 2: 並行載入數據源 (Step 2: Load Data Sources in Parallel) ====================

    // 同時載入 GeoJSON 和 Excel 數據，提高載入效率
    // 使用 Promise.all 可以並行執行多個異步操作
    const geojsonResult = await geojsonLoader(layer);
    const excelResult = await excelSheetLoader(layer);

    // ==================== 🔗 步驟 3: 合併地理數據和統計數據 (Step 3: Merge Geographic and Statistical Data) ====================

    // 使用合併函數將 GeoJSON 地理數據與 Excel 統計數據合併
    // 合併基於指定的欄位進行關聯，確保數據的一致性
    const mergedResult = mergeFunction(
      geojsonResult.geoJsonData, // 載入的 GeoJSON 地理數據
      excelResult, // 載入的 Excel 統計數據
      geojsonMergeField, // GeoJSON 中用於合併的欄位名
      excelMergeField // Excel 中用於合併的欄位名
    );

    const classificationResult = classificationFunction(mergedResult.mergedGeoJSON);

    // 更新圖層資料
    this.updateLayerData(layer, {
      geoJsonData: classificationResult.geoJsonData,
      tableData: classificationResult.geoJsonData.features.map((f) => f.properties.tableData),
      summaryData: geojsonResult.summaryData,
      legendData: classificationResult.legendData,
      legendData_InfectionRate: classificationResult.legendData_InfectionRate,
    });

    return classificationResult.geoJsonData.features.length;
  }

  /**
   * 處理僅載入 GeoJSON 的圖層
   * 載入 GeoJSON 數據
   * @param {Object} layer - 圖層配置對象
   * @returns {number} - 處理的要素數量
   * @throws {Error} - 當載入過程中發生錯誤時
   */
  async processGeoJsonOnlyLayer(layer) {
    const geojsonResult = await layer.geojsonLoader(layer);

    // 準備要更新的資料
    const updateData = {
      geoJsonData: geojsonResult.geoJsonData,
      tableData: geojsonResult.tableData,
      summaryData: geojsonResult.summaryData,
      legendData: geojsonResult.legendData,
    };

    // 如果是人口分佈圖層，需要包含所有人口相關的圖例資料
    if (layer.isPopulationLayer) {
      // 包含所有人口屬性圖例
      Object.keys(geojsonResult).forEach((key) => {
        if (key.startsWith('legendData_')) {
          updateData[key] = geojsonResult[key];
        }
      });
    }

    this.updateLayerData(layer, updateData);

    // 對於示意圖數據，geoJsonData 可能為 null
    if (geojsonResult.geoJsonData && geojsonResult.geoJsonData.features) {
      return geojsonResult.geoJsonData.features.length;
    } else {
      // 示意圖數據或其他非地圖數據
      return 0;
    }
  }

  /**
   * 處理需要分析的 GeoJSON 圖層
   * 載入 GeoJSON 數據並進行分類處理
   * @param {Object} layer - 圖層配置對象
   * @returns {number} - 處理的要素數量
   * @throws {Error} - 當載入或分析過程中發生錯誤時
   */
  async processAnalysisGeoJsonLayer(layer) {
    const geojsonResult = await layer.geojsonLoader(layer);

    const classificationResult = layer.classificationFunction(geojsonResult.geoJsonData);

    // 更新圖層資料
    this.updateLayerData(layer, {
      geoJsonData: classificationResult.geoJsonData,
      tableData: classificationResult.geoJsonData.features.map((f) => f.properties.tableData),
      summaryData: geojsonResult.summaryData,
      legendData: classificationResult.legendData,
      legendData_InfectionRate: classificationResult.legendData_InfectionRate,
    });

    return classificationResult.geoJsonData.features.length;
  }

  /**
   * 更新圖層資料的通用方法
   * @param {Object} layer - 要更新的圖層對象
   * @param {Object} data - 要合併的數據對象
   */
  updateLayerData(layer, data) {
    Object.assign(layer, data);
    layer.isLoaded = true;
  }

  /**
   * 記錄分析結果
   */
  logAnalysisResults() {
    // 保留函數但移除 console.log 以避免重複輸出
    // 如果需要調試，可以在此處添加條件性的 console.log
  }

  /**
   * 驗證圖層配置的完整性與正確性
   * @param {Object} layer - 圖層配置對象
   * @returns {boolean} - 驗證通過返回 true
   * @throws {Error} - 驗證失敗拋出錯誤
   */
  validateLayerConfig(layer) {
    // 檢查 Excel 合併欄位
    if (layer.excelSheetLoader && layer.mergeFunction) {
      if (!layer.geojsonMergeField || !layer.excelMergeField) {
        throw new Error(
          `❌ 圖層 "${layer.layerName}" 缺少合併欄位定義: geojsonMergeField="${layer.geojsonMergeField}", excelMergeField="${layer.excelMergeField}"`
        );
      }
    }

    return true;
  }
}

// ==================== 主要數據存儲定義 ====================

export const useDataStore = defineStore(
  'data',
  () => {
    // 位置篩選功能已移除

    // 初始化圖層處理器
    const layerProcessor = new LayerProcessor();

    // ==================== 圖層狀態管理 ====================

    // 存儲所有圖層的狀態 (visible, isLoaded, geoJsonData 等)
    const layerStates = ref({});

    // 動態生成圖層配置，並與保存的狀態合併
    const layers = computed(() => {
      // 讓 computed 依賴於 layerStates，確保狀態更新時重新計算
      layerStates.value; // 觸發響應式依賴

      return mergeLayersWithStates(
        generateDynamicLayers() // 生成圖層配置
      );
    });

    // 將動態生成的圖層配置與保存的狀態合併
    const mergeLayersWithStates = (dynamicLayers) => {
      // 收集當前動態生成的所有圖層 ID（支援新的兩層結構）
      const currentLayerIds = new Set();
      dynamicLayers.forEach((mainGroup) => {
        if (mainGroup.subGroups) {
          // 新結構：主群組包含子群組
          mainGroup.subGroups.forEach((subGroup) => {
            subGroup.groupLayers.forEach((layer) => {
              currentLayerIds.add(layer.layerId);
            });
          });
        } else {
          // 舊結構：直接包含圖層
          mainGroup.groupLayers.forEach((layer) => {
            currentLayerIds.add(layer.layerId);
          });
        }
      });

      // 清理不再存在的圖層狀態
      const newLayerStates = {};
      Object.keys(layerStates.value).forEach((layerId) => {
        if (currentLayerIds.has(layerId)) {
          newLayerStates[layerId] = layerStates.value[layerId];
        }
      });
      layerStates.value = newLayerStates;

      return dynamicLayers.map((mainGroup) => {
        if (mainGroup.subGroups) {
          // 新結構：處理主群組和子群組
          return {
            ...mainGroup,
            subGroups: mainGroup.subGroups.map((subGroup) => ({
              ...subGroup,
              groupLayers: subGroup.groupLayers.map((layer) => {
                const savedState = layerStates.value[layer.layerId];
                if (savedState) {
                  // 合併保存的狀態與新的配置
                  return {
                    ...layer,
                    ...savedState,
                    // 確保函數引用不被覆蓋
                    geojsonLoader: layer.geojsonLoader,
                    excelSheetLoader: layer.excelSheetLoader,
                    mergeFunction: layer.mergeFunction,
                    classificationFunction: layer.classificationFunction,
                  };
                }
                return layer;
              }),
            })),
          };
        } else {
          // 舊結構：直接處理群組
          return {
            ...mainGroup,
            groupLayers: mainGroup.groupLayers.map((layer) => {
              const savedState = layerStates.value[layer.layerId];
              if (savedState) {
                // 合併保存的狀態與新的配置
                return {
                  ...layer,
                  ...savedState,
                  // 確保函數引用不被覆蓋
                  geojsonLoader: layer.geojsonLoader,
                  excelSheetLoader: layer.excelSheetLoader,
                  mergeFunction: layer.mergeFunction,
                  classificationFunction: layer.classificationFunction,
                };
              }
              return layer;
            }),
          };
        }
      });
    };

    // 保存圖層狀態到 layerStates
    const saveLayerState = (layerId, stateData) => {
      if (!layerStates.value[layerId]) {
        layerStates.value[layerId] = {};
      }
      Object.assign(layerStates.value[layerId], stateData);
    };

    // ==================== 圖層搜尋函數 ====================

    // 在新的分組結構中搜尋指定 ID 的圖層（支援新的兩層結構）
    const findLayerById = (layerId) => {
      for (const mainGroup of layers.value) {
        if (mainGroup.subGroups) {
          // 新結構：主群組包含子群組
          for (const subGroup of mainGroup.subGroups) {
            for (const layer of subGroup.groupLayers) {
              if (layer.layerId === layerId) {
                return layer;
              }
            }
          }
        } else {
          // 舊結構：直接包含圖層
          for (const layer of mainGroup.groupLayers) {
            if (layer.layerId === layerId) {
              return layer;
            }
          }
        }
      }
      return null;
    };

    // 從分組結構中提取所有圖層的扁平陣列（支援新的兩層結構）
    const getAllLayers = () => {
      const allLayers = [];
      for (const mainGroup of layers.value) {
        if (mainGroup.subGroups) {
          // 新結構：主群組包含子群組
          for (const subGroup of mainGroup.subGroups) {
            allLayers.push(...subGroup.groupLayers);
          }
        } else {
          // 舊結構：直接包含圖層
          allLayers.push(...mainGroup.groupLayers);
        }
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
        isAnalysisLayer: layer.isAnalysisLayer,
        isPopulationLayer: layer.isPopulationLayer,
        hasGeojsonLoader: !!layer.geojsonLoader,
        hasExcelSheetLoader: !!layer.excelSheetLoader,
        hasClassificationFunction: !!layer.classificationFunction,
      });

      // 如果要開啟圖層且不是人口分佈圖層，則關閉其他非人口分佈圖層
      if (
        !layer.visible &&
        !layer.isPopulationLayer &&
        !(layer.layerName && layer.layerName.includes('人口分佈'))
      ) {
        console.log('🔧 DataStore: 開啟非人口分佈圖層，關閉其他非人口分佈圖層');

        // 找到所有其他開啟的非人口分佈圖層並關閉
        const allLayers = getAllLayers();
        allLayers.forEach((otherLayer) => {
          if (
            otherLayer.layerId !== layerId &&
            otherLayer.visible &&
            !otherLayer.isPopulationLayer &&
            !(otherLayer.layerName && otherLayer.layerName.includes('人口分佈'))
          ) {
            console.log('🔧 DataStore: 關閉圖層:', otherLayer.layerName);
            otherLayer.visible = false;
            saveLayerState(otherLayer.layerId, { visible: false });
          }
        });
      }
      // 切換可見性狀態
      layer.visible = !layer.visible;

      // 保存圖層的可見性狀態
      saveLayerState(layerId, { visible: layer.visible });

      // 如果是面域圖層且被開啟，自動啟用基本數據顏色模式
      if (layer.visible && layer.isAnalysisLayer && !layer.isPopulationLayer) {
        console.log('🔧 DataStore: 自動啟用基本數據顏色模式 for 面域圖層:', layer.layerName);
        setBasicDataColors(true);
      }

      // 如果是點位圖層且被開啟，自動啟用基本數據顏色模式
      if (layer.visible && layer.isPointCombinedLayer) {
        console.log('🔧 DataStore: 自動啟用基本數據顏色模式 for 點位圖層:', layer.layerName);
        setBasicDataColors(true);
      }

      // 如果是人口分佈圖層且被開啟，自動啟用基本數據顏色模式
      if (
        layer.visible &&
        (layer.isPopulationLayer || (layer.layerName && layer.layerName.includes('人口分佈')))
      ) {
        console.log('🔧 DataStore: 自動啟用基本數據顏色模式 for 人口分佈圖層:', layer.layerName);
        setBasicDataColors(true);
      }

      // 如果圖層被開啟且尚未載入，則載入資料
      const shouldLoad = layer.visible && !layer.isLoaded && !layer.isLoading;
      console.log('🔧 DataStore: 載入條件檢查', {
        visible: layer.visible,
        isLoaded: layer.isLoaded,
        isLoading: layer.isLoading,
        isAnalysisLayer: layer.isAnalysisLayer,
        shouldLoad,
      });

      if (shouldLoad) {
        try {
          layer.isLoading = true;
          saveLayerState(layerId, { isLoading: layer.isLoading });

          // 驗證圖層配置
          try {
            layerProcessor.validateLayerConfig(layer);
          } catch (configError) {
            console.error(`❌ 圖層配置驗證失敗:`, configError);
            layer.visible = false;
            saveLayerState(layerId, { visible: false });
            throw configError; // 重新拋出以便後續處理
          }

          let dataCount = 0;

          // 根據圖層類型選擇處理方法
          try {
            if (layer.excelSheetLoader && layer.mergeFunction) {
              dataCount = await layerProcessor.processExcelMergedLayer(layer);
            } else if (
              layer.geojsonLoader &&
              !layer.excelSheetLoader &&
              !layer.classificationFunction
            ) {
              dataCount = await layerProcessor.processGeoJsonOnlyLayer(layer);
            } else if (layer.geojsonLoader && layer.classificationFunction) {
              dataCount = await layerProcessor.processAnalysisGeoJsonLayer(layer);
            } else {
              console.warn(`❌ 圖層 "${layer.layerName}" 缺少必要的載入函數`);
              layer.visible = false;
              return;
            }
          } catch (processingErr) {
            console.warn(`❌ 圖層 "${layer.layerName}" 載入失敗:`, processingErr);
            throw processingErr; // 重新拋出以便外層 catch 處理
          }

          console.log(`✅ 圖層 "${layer.layerName}" 載入完成 (${dataCount} 筆資料)`);
          console.log(`📊 圖層摘要資料:`, layer.summaryData);

          // 記錄分析結果
          layerProcessor.logAnalysisResults();

          // 保存完整的圖層狀態
          saveLayerState(layerId, {
            isLoaded: layer.isLoaded,
            geoJsonData: layer.geoJsonData,
            tableData: layer.tableData,
            summaryData: layer.summaryData,
            legendData: layer.legendData,
            legendData_InfectionRate: layer.legendData_InfectionRate,
            legendData_POPULATION_DENSITY: layer.legendData_POPULATION_DENSITY,
            legendData_P_CNT: layer.legendData_P_CNT,
            legendData_M_CNT: layer.legendData_M_CNT,
            legendData_F_CNT: layer.legendData_F_CNT,
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

    // ==================== 地圖物件和顏色模式管理 ====================

    // 選中的地圖物件
    const selectedFeature = ref(null);

    // 基本數據顏色模式控制
    const useBasicDataColors = ref(true);

    // 人口分析屬性顏色模式控制
    const usePopulationColors = ref(false);
    const selectedPopulationAttribute = ref('POPULATION_DENSITY'); // 預設選擇人口密度

    // 感染率顏色模式控制
    const useInfectionRateColors = ref(false);

    // 互斥切換基本數據顏色模式
    const setBasicDataColors = (enabled) => {
      useBasicDataColors.value = enabled;
      if (enabled) {
        usePopulationColors.value = false;
        useInfectionRateColors.value = false;
      }
    };

    // 互斥切換人口分析顏色模式
    const setPopulationColors = (enabled, attribute = null) => {
      usePopulationColors.value = enabled;
      if (enabled) {
        useBasicDataColors.value = false;
        useInfectionRateColors.value = false;
        if (attribute) {
          selectedPopulationAttribute.value = attribute;
        }
      }
    };

    // 互斥切換感染率顏色模式
    const setInfectionRateColors = (enabled) => {
      useInfectionRateColors.value = enabled;
      if (enabled) {
        useBasicDataColors.value = false;
        usePopulationColors.value = false;
      }
    };

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
        if (mainGroup.subGroups) {
          // 新結構：主群組包含子群組
          for (const subGroup of mainGroup.subGroups) {
            for (const layer of subGroup.groupLayers) {
              if (layer.layerId === layerId) {
                return subGroup.groupName; // 返回子群組名稱
              }
            }
          }
        } else {
          // 舊結構：直接包含圖層
          for (const layer of mainGroup.groupLayers) {
            if (layer.layerId === layerId) {
              return mainGroup.groupName;
            }
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
      useBasicDataColors, // 基本數據顏色模式狀態
      setBasicDataColors, // 互斥切換基本數據顏色模式
      usePopulationColors, // 人口分析顏色模式狀態
      selectedPopulationAttribute, // 選中的人口分析屬性
      setPopulationColors, // 互斥切換人口分析顏色模式
      useInfectionRateColors, // 感染率顏色模式狀態
      setInfectionRateColors, // 互斥切換感染率顏色模式
      visibleLayers: computed(() => getAllLayers().filter((layer) => layer.visible)),
      loadingLayers: computed(() => getAllLayers().filter((layer) => layer.isLoading)),
      // 新增的動態系統相關函數
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
