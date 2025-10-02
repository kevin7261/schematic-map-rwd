<script>
  import DetailItem from '../components/DetailItem.vue';
  import { useDataStore } from '../stores/dataStore';
  import { computed, ref, watch, onMounted, nextTick, onUnmounted } from 'vue';
  import * as d3 from 'd3';
  import { calculateSpatialAnalysis } from '../utils/spatialAnalysis/calculateSpatialAnalysis.js';
  import {
    calculateClassification_SpatialLag,
    calculateClassification_JoinCounts,
  } from '../utils/dataProcessor.js';

  export default {
    name: 'SpatialAnalysisTab',

    /**
     * 🧩 組件註冊 (Component Registration)
     * 註冊空間分析分頁內使用的子組件
     */
    components: {
      DetailItem, // 詳細資訊項目組件
    },

    /**
     * 🔧 組件設定函數 (Component Setup)
     * 使用 Composition API 設定組件邏輯
     */
    setup() {
      // 📦 取得 Pinia 數據存儲實例
      const dataStore = useDataStore();

      const activeLayerTab = ref(null); /** 📑 當前作用中的圖層分頁 */
      const moranPlotChart = ref(null); /** 📊 Moran Plot 圖表容器參考 */
      const moranRefChart = ref(null); /** 📊 Moran Reference Distribution 圖表容器參考 */
      const moranStdPlotChart = ref(null); /** 📊 Standardized Moran Plot 圖表容器參考 */

      // 添加 resize 觀察器
      const resizeObserver = ref(null);

      // K 鄰居數量輸入相關
      const kNeighborsInput = ref(8); // 預設值為 8
      const isRecalculating = ref(false); // 重新計算狀態

      // 二元分類閾值輸入相關
      const binaryThresholdInput = ref(22); // 預設值為 22
      const isRecalculatingJoinCounts = ref(false); // Join Counts 重新計算狀態

      /**
       * 📊 計算 count 統計資訊 (Calculate Count Statistics)
       * 計算當前圖層的 count 最大值、最小值和平均值
       */
      const calculateCountStatistics = () => {
        if (!currentLayer.value || !currentLayer.value.geoJsonData) {
          return { min: 0, max: 0, avg: 0 };
        }

        const counts = currentLayer.value.geoJsonData.features
          .map((feature) => parseFloat(feature.properties.count || 0))
          .filter((count) => !isNaN(count));

        if (counts.length === 0) {
          return { min: 0, max: 0, avg: 0 };
        }

        const min = Math.min(...counts);
        const max = Math.max(...counts);
        const avg = Math.round((min + max) / 2); // 四捨五入為整數

        return { min, max, avg };
      };

      /**
       * 📊 當前圖層的 count 統計資訊
       */
      const currentCountStatistics = computed(() => {
        return calculateCountStatistics();
      });

      /**
       * 📊 獲取所有可見圖層 (Get All Visible Layers)
       * 返回所有可見的圖層，不管是否有空間分析數據
       */
      const visibleLayers = computed(() => {
        const allLayers = dataStore.getAllLayers();
        const filtered = allLayers.filter((layer) => layer.visible);
        return filtered;
      });

      /**
       * 📑 設定作用中圖層分頁 (Set Active Layer Tab)
       * @param {string} layerId - 圖層 ID
       */
      const setActiveLayerTab = (layerId) => {
        activeLayerTab.value = layerId;
      };

      /**
       * 📊 取得圖層完整標題 (包含群組名稱) (Get Layer Full Title with Group Name)
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
       * 🎨 處理基本數據顏色模式變更 (Handle Basic Data Color Mode Change)
       * @param {Event} event - 變更事件
       */
      const handleBasicDataColorModeChange = (event) => {
        const checked = event.target.checked;
        // 如果要關閉基本數據，但沒有其他顏色模式開啟，則不允許關閉
        if (!checked) {
          const hasOtherColorMode =
            dataStore.useSpatialLagColors ||
            dataStore.useJoinCountsColors ||
            dataStore.useInfectionRateColors ||
            dataStore.usePopulationColors;
          if (!hasOtherColorMode) {
            return; // 不允許關閉
          }
        }
        dataStore.setBasicDataColors(checked);
      };

      /**
       * 🎨 處理 Spatial Lag 顏色模式變更 (Handle Spatial Lag Color Mode Change)
       * @param {Event} event - 變更事件
       */
      const handleSpatialLagColorModeChange = (event) => {
        const checked = event.target.checked;
        dataStore.setSpatialLagColors(checked);
        // 如果關閉 Spatial Lag，且沒有其他顏色模式開啟，則自動開啟基本數據
        if (!checked) {
          const hasOtherColorMode =
            dataStore.useJoinCountsColors ||
            dataStore.useInfectionRateColors ||
            dataStore.usePopulationColors;
          if (!hasOtherColorMode && !dataStore.useBasicDataColors) {
            dataStore.setBasicDataColors(true);
          }
        }
      };

      /**
       * 🎨 處理 Join Counts 顏色模式變更 (Handle Join Counts Color Mode Change)
       * @param {Event} event - 變更事件
       */
      const handleJoinCountsColorModeChange = (event) => {
        const checked = event.target.checked;
        dataStore.setJoinCountsColors(checked);
        // 如果關閉 Join Counts，且沒有其他顏色模式開啟，則自動開啟基本數據
        if (!checked) {
          const hasOtherColorMode =
            dataStore.useSpatialLagColors ||
            dataStore.useInfectionRateColors ||
            dataStore.usePopulationColors;
          if (!hasOtherColorMode && !dataStore.useBasicDataColors) {
            dataStore.setBasicDataColors(true);
          }
        }
      };

      /**
       * 🎨 處理人口分析顏色模式變更 (Handle Population Color Mode Change)
       * @param {string} attribute - 人口屬性 (H_CNT, M_CNT, F_CNT, INFO_TIME)
       */
      const handlePopulationColorModeChange = (attribute) => {
        const isCurrentlySelected =
          dataStore.usePopulationColors && dataStore.selectedPopulationAttribute === attribute;
        const newState = !isCurrentlySelected;
        dataStore.setPopulationColors(newState, attribute);

        // 如果關閉人口分析，且沒有其他顏色模式開啟，則自動開啟基本數據
        if (!newState) {
          const hasOtherColorMode =
            dataStore.useSpatialLagColors ||
            dataStore.useJoinCountsColors ||
            dataStore.useInfectionRateColors;
          if (!hasOtherColorMode && !dataStore.useBasicDataColors) {
            dataStore.setBasicDataColors(true);
          }
        }
      };

      /**
       * 🎨 處理感染率顏色模式變更 (Handle Infection Rate Color Mode Change)
       */
      const handleInfectionRateColorModeChange = (event) => {
        const checked = event.target.checked;
        dataStore.setInfectionRateColors(checked);
        // 如果關閉感染率，且沒有其他顏色模式開啟，則自動開啟基本數據
        if (!checked) {
          const hasOtherColorMode =
            dataStore.useSpatialLagColors ||
            dataStore.useJoinCountsColors ||
            dataStore.usePopulationColors;
          if (!hasOtherColorMode && !dataStore.useBasicDataColors) {
            dataStore.setBasicDataColors(true);
          }
        }
      };

      /**
       * 🔄 重新計算空間分析（二元分類閾值版本）
       * 使用新的二元分類閾值重新計算當前圖層的空間分析（與鄰居數量 K 的邏輯完全一致）
       */
      const recalculateJoinCounts = async () => {
        // 開始重新計算空間分析
        // 檢查當前圖層
        // 檢查二元分類閾值

        if (
          !currentLayer.value ||
          !currentLayer.value.geoJsonData ||
          isRecalculatingJoinCounts.value
        ) {
          // 條件不符合，無法重新計算
          return;
        }

        try {
          isRecalculatingJoinCounts.value = true;

          // 確保二元分類閾值為整數
          const thresholdValue = Math.round(binaryThresholdInput.value);

          // 使用新的二元分類閾值重新計算空間分析
          const spatialResult = calculateSpatialAnalysis(currentLayer.value.geoJsonData, {
            k: currentLayer.value.spatialAnalysisData?.kNeighbors || kNeighborsInput.value,
            transformation: 'R',
            valueField: currentLayer.value.valueField || 'count',
            binaryThreshold: thresholdValue,
          });

          // 重新計算 Spatial Lag 分類
          const spatialLagClassificationResult = calculateClassification_SpatialLag(
            spatialResult.geoJsonData
          );

          // 重新計算 Join Counts 分類
          const joinCountsClassificationResult = calculateClassification_JoinCounts(
            spatialLagClassificationResult.geoJsonData,
            thresholdValue
          );

          // 更新當前圖層數據
          const layer = dataStore.findLayerById(currentLayer.value.layerId);
          // 找到圖層

          if (layer) {
            // 開始更新圖層數據

            // 創建新的對象來觸發響應式更新
            const newSpatialAnalysisData = {
              ...spatialResult.spatialAnalysisData,
              kNeighbors:
                currentLayer.value.spatialAnalysisData?.kNeighbors || kNeighborsInput.value,
            };

            // 準備要保存的狀態數據
            const stateData = {
              geoJsonData: joinCountsClassificationResult.geoJsonData,
              tableData: joinCountsClassificationResult.geoJsonData.features.map(
                (f) => f.properties.tableData
              ),
              legendData_SpatialLag: spatialLagClassificationResult.legendData_SpatialLag,
              legendData_JoinCounts: joinCountsClassificationResult.legendData_JoinCounts,
              spatialAnalysisData: newSpatialAnalysisData,
            };

            // 使用 dataStore 的 saveLayerState 來保存狀態
            dataStore.saveLayerState(currentLayer.value.layerId, stateData);

            // 圖層狀態保存完成
            // 新的空間分析數據已更新

            // 觸發地圖重新渲染 - 通過切換顏色模式來強制重新載入圖層
            if (dataStore.useSpatialLagColors) {
              // 如果當前使用 Spatial Lag 顏色，先關閉再開啟來觸發重新渲染
              dataStore.setSpatialLagColors(false);
              await nextTick();
              dataStore.setSpatialLagColors(true);
            } else if (dataStore.useJoinCountsColors) {
              // 如果當前使用 Join Counts 顏色，先關閉再開啟來觸發重新渲染
              dataStore.setJoinCountsColors(false);
              await nextTick();
              dataStore.setJoinCountsColors(true);
            } else if (dataStore.useBasicDataColors) {
              // 如果當前使用基本數據顏色，先關閉再開啟來觸發重新渲染
              dataStore.setBasicDataColors(false);
              await nextTick();
              dataStore.setBasicDataColors(true);
            }

            // 使用 nextTick 確保 DOM 更新
            await nextTick();

            // 注意：不需要同步輸入框的值，讓用戶輸入的值保持不變
            // 輸入框的值只在圖層切換時通過 watcher 同步
          } else {
            // 找不到圖層
          }

          // 空間分析重新計算完成
        } catch (error) {
          // 重新計算空間分析時發生錯誤
        } finally {
          isRecalculatingJoinCounts.value = false;
        }
      };

      /**
       * 🔄 重新計算空間分析 (Recalculate Spatial Analysis)
       * 使用新的 K 鄰居數量重新計算當前圖層的空間分析
       */
      const recalculateSpatialAnalysis = async () => {
        // 開始重新計算空間分析
        // 檢查當前圖層
        // 檢查 K 值

        if (!currentLayer.value || !currentLayer.value.geoJsonData || isRecalculating.value) {
          // 條件不符合，無法重新計算
          return;
        }

        try {
          isRecalculating.value = true;

          // 確保二元分類閾值為整數
          const thresholdValue = Math.round(binaryThresholdInput.value);

          // 使用新的 K 值重新計算空間分析
          const spatialResult = calculateSpatialAnalysis(currentLayer.value.geoJsonData, {
            k: kNeighborsInput.value,
            transformation: 'R',
            valueField: currentLayer.value.valueField || 'count',
            binaryThreshold: thresholdValue,
          });

          // 重新計算 Spatial Lag 分類
          const spatialLagClassificationResult = calculateClassification_SpatialLag(
            spatialResult.geoJsonData
          );

          // 重新計算 Join Counts 分類
          const joinCountsClassificationResult = calculateClassification_JoinCounts(
            spatialLagClassificationResult.geoJsonData,
            thresholdValue
          );

          // 更新當前圖層數據
          const layer = dataStore.findLayerById(currentLayer.value.layerId);
          // 找到圖層

          if (layer) {
            // 開始更新圖層數據

            // 創建新的對象來觸發響應式更新
            const newSpatialAnalysisData = {
              ...spatialResult.spatialAnalysisData,
              kNeighbors: kNeighborsInput.value,
            };

            // 準備要保存的狀態數據
            const stateData = {
              geoJsonData: joinCountsClassificationResult.geoJsonData,
              tableData: joinCountsClassificationResult.geoJsonData.features.map(
                (f) => f.properties.tableData
              ),
              legendData_SpatialLag: spatialLagClassificationResult.legendData_SpatialLag,
              legendData_JoinCounts: joinCountsClassificationResult.legendData_JoinCounts,
              spatialAnalysisData: newSpatialAnalysisData,
            };

            // 使用 dataStore 的 saveLayerState 來保存狀態
            dataStore.saveLayerState(currentLayer.value.layerId, stateData);

            // 圖層狀態保存完成
            // 新的空間分析數據已更新

            // 觸發地圖重新渲染 - 通過切換顏色模式來強制重新載入圖層
            if (dataStore.useSpatialLagColors) {
              // 如果當前使用 Spatial Lag 顏色，先關閉再開啟來觸發重新渲染
              dataStore.setSpatialLagColors(false);
              await nextTick();
              dataStore.setSpatialLagColors(true);
            } else if (dataStore.useJoinCountsColors) {
              // 如果當前使用 Join Counts 顏色，先關閉再開啟來觸發重新渲染
              dataStore.setJoinCountsColors(false);
              await nextTick();
              dataStore.setJoinCountsColors(true);
            } else if (dataStore.useBasicDataColors) {
              // 如果當前使用基本數據顏色，先關閉再開啟來觸發重新渲染
              dataStore.setBasicDataColors(false);
              await nextTick();
              dataStore.setBasicDataColors(true);
            }

            // 使用 nextTick 確保 DOM 更新
            await nextTick();

            // 注意：不需要同步輸入框的值，讓用戶輸入的值保持不變
            // 輸入框的值只在圖層切換時通過 watcher 同步
          } else {
            // 找不到圖層
          }

          // 空間分析重新計算完成
        } catch (error) {
          // 重新計算空間分析時發生錯誤
        } finally {
          isRecalculating.value = false;
        }
      };

      /**
       * 📊 當前選中的圖層 (Current Selected Layer)
       */
      const currentLayer = computed(() => {
        if (!activeLayerTab.value) return null;

        // 從可見圖層中找（確保顯示/隱藏功能正常）
        const layer = visibleLayers.value.find((l) => l.layerId === activeLayerTab.value);

        // 調試輸出（開發環境）
        if (layer && process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log('🔍 當前圖層調試信息:', {
            layerId: layer.layerId,
            layerName: layer.layerName,
            isLoaded: layer.isLoaded,
            hasLegendData: !!layer.legendData,
            legendDataLength: layer.legendData?.length || 0,
            hasBasicDataColors: dataStore.useBasicDataColors,
            legendData: layer.legendData,
          });
        }

        return layer;
      });

      /**
       * 📊 預設的人口圖層legend數據
       */
      // 生成與實際數據處理一致的預設顏色方案
      const generateDefaultColors = (interpolator) => {
        return d3.range(5).map((i) => {
          const color = interpolator(i / 4);
          return d3.color(color).copy({ opacity: 0.75 }).toString();
        });
      };

      const defaultPopulationLegends = {
        legendData_POPULATION_DENSITY: generateDefaultColors(d3.interpolateGreens).map(
          (color, index) => ({
            color,
            label: index === 0 ? '最低' : index === 4 ? '最高' : `第${index + 1}級`,
          })
        ),
        legendData_P_CNT: generateDefaultColors(d3.interpolateBlues).map((color, index) => ({
          color,
          label: index === 0 ? '最低' : index === 4 ? '最高' : `第${index + 1}級`,
        })),
        legendData_M_CNT: generateDefaultColors(d3.interpolatePurples).map((color, index) => ({
          color,
          label: index === 0 ? '最低' : index === 4 ? '最高' : `第${index + 1}級`,
        })),
        legendData_F_CNT: generateDefaultColors(d3.interpolateReds).map((color, index) => ({
          color,
          label: index === 0 ? '最低' : index === 4 ? '最高' : `第${index + 1}級`,
        })),
      };

      /**
       * 📊 當前圖層（用於人口圖層的legend顯示，可能包括未載入的圖層）
       */
      const currentPopulationLayerForLegend = computed(() => {
        // 先檢查是否有選中的人口圖層
        if (activeLayerTab.value) {
          // 先從可見圖層中找
          const visibleLayer = visibleLayers.value.find((l) => l.layerId === activeLayerTab.value);
          if (visibleLayer && visibleLayer.isPopulationLayer) {
            // 優先使用實際數據，只有在沒有數據時才使用預設值
            return {
              ...visibleLayer,
              legendData_POPULATION_DENSITY:
                visibleLayer.legendData_POPULATION_DENSITY ||
                defaultPopulationLegends.legendData_POPULATION_DENSITY,
              legendData_P_CNT:
                visibleLayer.legendData_P_CNT || defaultPopulationLegends.legendData_P_CNT,
              legendData_M_CNT:
                visibleLayer.legendData_M_CNT || defaultPopulationLegends.legendData_M_CNT,
              legendData_F_CNT:
                visibleLayer.legendData_F_CNT || defaultPopulationLegends.legendData_F_CNT,
            };
          }

          // 檢查是否為未載入的人口圖層
          const allLayers = dataStore.getAllLayers();
          const populationLayer = allLayers.find(
            (l) => l.layerId === activeLayerTab.value && l.isPopulationLayer
          );
          if (populationLayer) {
            // 如果圖層已載入，優先使用實際數據
            if (populationLayer.isLoaded) {
              return {
                ...populationLayer,
                legendData_POPULATION_DENSITY:
                  populationLayer.legendData_POPULATION_DENSITY ||
                  defaultPopulationLegends.legendData_POPULATION_DENSITY,
                legendData_P_CNT:
                  populationLayer.legendData_P_CNT || defaultPopulationLegends.legendData_P_CNT,
                legendData_M_CNT:
                  populationLayer.legendData_M_CNT || defaultPopulationLegends.legendData_M_CNT,
                legendData_F_CNT:
                  populationLayer.legendData_F_CNT || defaultPopulationLegends.legendData_F_CNT,
              };
            } else {
              // 未載入時使用預設值
              return {
                ...populationLayer,
                ...defaultPopulationLegends,
              };
            }
          }
        }

        // 默認返回預設legend數據
        return {
          ...defaultPopulationLegends,
          isPopulationLayer: true,
          type: 'polygon',
        };
      });

      /**
       * 📊 當前圖層空間分析數據 (Current Layer Spatial Analysis Data)
       */
      const currentSpatialAnalysisData = computed(() => {
        return currentLayer.value?.spatialAnalysisData || null;
      });

      // 監聽當前空間分析數據變化，同步 K 值
      watch(
        currentSpatialAnalysisData,
        (newData) => {
          if (newData && newData.kNeighbors) {
            kNeighborsInput.value = newData.kNeighbors;
          }
        },
        { immediate: true }
      );

      // 監聽當前空間分析數據變化，同步二元分類閾值（與鄰居數量 K 的邏輯一致）
      watch(
        currentSpatialAnalysisData,
        (newData) => {
          if (newData && newData.joinCounts && newData.joinCounts.threshold) {
            binaryThresholdInput.value = newData.joinCounts.threshold;
          } else if (currentLayer.value && currentLayer.value.geoJsonData) {
            // 如果沒有空間分析數據，使用 count 的最大值與最小值的平均值作為預設值
            const stats = calculateCountStatistics();
            binaryThresholdInput.value = stats.avg;
          }
        },
        { immediate: true }
      );

      // 監聽當前圖層變化，確保二元分類閾值預設值正確更新
      watch(
        currentLayer,
        (newLayer) => {
          if (newLayer && newLayer.geoJsonData) {
            // 每次圖層變化時，重新計算預設值
            const stats = calculateCountStatistics();

            // 只有在沒有空間分析數據時才使用預設值，避免覆蓋已計算的閾值
            if (!newLayer.spatialAnalysisData?.joinCounts?.threshold) {
              binaryThresholdInput.value = stats.avg;
            }
          }
        },
        { immediate: true }
      );

      /**
       * 📊 是否有空間分析數據 (Has Spatial Analysis Data)
       */
      const hasSpatialAnalysisData = computed(() => {
        return !!currentSpatialAnalysisData.value;
      });

      /**
       * 🔒 基本數據是否應該被禁用 (Should Basic Data Be Disabled)
       * 當基本數據開啟且沒有其他顏色模式開啟時，不允許關閉
       */
      const isBasicDataDisabled = computed(() => {
        if (!dataStore.useBasicDataColors) {
          return false; // 基本數據未開啟，不需要禁用
        }

        // 檢查是否有其他顏色模式開啟
        const hasOtherColorMode =
          dataStore.useSpatialLagColors ||
          dataStore.useJoinCountsColors ||
          dataStore.useInfectionRateColors ||
          dataStore.usePopulationColors;

        return !hasOtherColorMode; // 沒有其他顏色模式時才禁用基本數據
      });

      /**
       * 📊 是否有有效的 Moran 數據用於繪圖
       */
      const hasValidMoranData = computed(() => {
        return currentSpatialAnalysisData.value?.moran?.originalValues?.length > 0;
      });

      /**
       * 📊 Moran's I 值
       */
      const moranIValue = computed(() => {
        return parseFloat(currentSpatialAnalysisData.value?.moran?.I || 0);
      });

      /**
       * 📊 PySDA 圖表數據
       */
      const pysdaFigureData = computed(() => {
        return currentLayer.value?.pysdaFigureData || null;
      });

      /**
       * 📊 是否有有效的 PySDA 圖表數據
       */
      const hasValidPysdaFigureData = computed(() => {
        const figureData = pysdaFigureData.value;
        return !!figureData && !!figureData.nodes && !!figureData.bounds && !!figureData.timeSeries;
      });

      /**
       * 📊 MSTDBSCAN 分析結果數據
       */
      const mstdbscanResults = computed(() => {
        return currentLayer.value?.mstdbscanResults || null;
      });

      /**
       * 📊 是否有有效的 MSTDBSCAN 結果數據
       */
      const hasValidMstdbscanResults = computed(() => {
        const results = mstdbscanResults.value;
        return (
          !!results &&
          !!results.clusters &&
          !!results.points &&
          results.clusters.length > 0 &&
          results.points.length > 0
        );
      });

      /**
       * 🏷️ 獲取轉換方式標籤
       */
      const getTransformLabel = (transform) => {
        const labels = {
          R: 'R: 行標準化 (Row-standardized)',
          B: 'B: 二進制 (Binary)',
          D: 'D: 距離 (Distance)',
          U: 'U: 未標準化 (Unstandardized)',
        };
        return labels[transform] || transform;
      };

      /**
       * 🏷️ 獲取 Moran's I 模式解釋
       */
      const getMoranPattern = (moranI, isSignificant) => {
        const I = parseFloat(moranI);

        if (!isSignificant) {
          return '隨機分佈 (無顯著空間自相關)';
        }

        if (I > 0.3) {
          return '強正空間自相關 (高值聚集、低值聚集)';
        } else if (I > 0.1) {
          return '中等正空間自相關 (相似值傾向聚集)';
        } else if (I > 0) {
          return '弱正空間自相關 (輕微聚集傾向)';
        } else if (I > -0.1) {
          return '弱負空間自相關 (輕微分散傾向)';
        } else if (I > -0.3) {
          return '中等負空間自相關 (不同值傾向相鄰)';
        } else {
          return '強負空間自相關 (高低值交替分佈)';
        }
      };

      /**
       * 🏷️ 獲取 Geary's C 模式解釋
       */
      const getGearyPattern = (gearyC, isSignificant) => {
        const C = parseFloat(gearyC);

        if (!isSignificant) {
          return '隨機分佈 (無顯著空間自相關)';
        }

        if (C < 0.5) {
          return '強正向空間自相關 (鄰近值傾向相似)';
        } else if (C < 0.8) {
          return '中等正向空間自相關 (相似值傾向聚集)';
        } else if (C < 1.0) {
          return '弱正向空間自相關 (輕微聚集傾向)';
        } else if (C < 1.2) {
          return '弱負向空間自相關 (輕微分散傾向)';
        } else if (C < 1.5) {
          return '中等負向空間自相關 (不同值傾向相鄰)';
        } else {
          return '強負向空間自相關 (高低值交替分佈)';
        }
      };

      /**
       * 🏷️ 獲取 Getis-Ord G 模式解釋
       */
      const getGetisOrdPattern = (getisG, isSignificant) => {
        const G = parseFloat(getisG);

        if (!isSignificant) {
          return '隨機分佈 (無顯著空間聚集)';
        }

        // Getis-Ord G 值的解釋：
        // G > 期望值：高值空間聚集（熱點）
        // G < 期望值：低值空間聚集（冷點）
        // 通常期望值接近 1/n，但這裡我們基於統計顯著性來解釋

        if (G > 0.1) {
          return '強高值空間聚集 (明顯熱點效應)';
        } else if (G > 0.05) {
          return '中等高值空間聚集 (顯著熱點效應)';
        } else if (G > 0) {
          return '弱高值空間聚集 (輕微熱點效應)';
        } else {
          return '低值空間聚集 (冷點效應)';
        }
      };

      /**
       * 🎨 格式化數值 (Format Numeric Value)
       * 根據值的類型進行適當的格式化處理
       */
      const formatValue = (value) => {
        if (typeof value === 'number') {
          if (value < 0.001) {
            return value.toExponential(2);
          }
          return parseFloat(value.toFixed(2));
        }
        return value;
      };

      /**
       * 📊 繪製 Moran 參考分布圖 (Draw Moran Reference Distribution Plot)
       */
      const drawMoranRefPlot = () => {
        if (!moranRefChart.value) {
          // moranRefChart 容器不存在
          return;
        }
        const moranData = currentSpatialAnalysisData.value?.moran;
        if (!moranData || !moranData.sim) {
          // Moran 數據或 sim 不存在
          return;
        }

        // 清除舊的 SVG
        d3.select(moranRefChart.value).selectAll('svg').remove();

        // 強制重新計算容器大小
        const containerRect = moranRefChart.value.getBoundingClientRect();
        const containerWidth = containerRect.width;

        if (containerWidth <= 0) {
          setTimeout(() => drawMoranRefPlot(), 100);
          return;
        }

        const containerHeight = 400;
        const margin = { top: 40, right: 30, bottom: 50, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        const svg = d3
          .select(moranRefChart.value)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // x 軸範圍自動擴展，確保 sim/I 都在範圍內
        const sim = moranData.sim;
        const I = moranData.I;
        const xMin = Math.min(d3.min(sim), I, 0) - 0.05 * Math.abs(d3.max(sim) - d3.min(sim));
        const xMax = Math.max(d3.max(sim), I, 0) + 0.05 * Math.abs(d3.max(sim) - d3.min(sim));
        const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, width]);

        // KDE
        const kde = kernelDensityEstimator(kernelEpanechnikov(0.05), xScale.ticks(100));
        const density = kde(sim);
        const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(density, (d) => d[1]) * 1.05])
          .range([height, 0]);

        // 灰色 KDE
        g.append('path')
          .datum(density)
          .attr('fill', '#cccccc')
          .attr('stroke', 'none')
          .attr(
            'd',
            d3
              .area()
              .x((d) => xScale(d[0]))
              .y0(height)
              .y1((d) => yScale(d[1]))
          );

        // 藍色短線在 0
        g.append('line')
          .attr('x1', xScale(0))
          .attr('x2', xScale(0))
          .attr('y1', yScale(0))
          .attr('y2', yScale(d3.max(density, (d) => d[1]) * 0.15))
          .attr('stroke', '#1f77b4')
          .attr('stroke-width', 4);

        // 紅色短線在 Moran's I
        g.append('line')
          .attr('x1', xScale(I))
          .attr('x2', xScale(I))
          .attr('y1', yScale(0))
          .attr('y2', yScale(d3.max(density, (d) => d[1]) * 0.15))
          .attr('stroke', 'red')
          .attr('stroke-width', 4);

        // 紅色短線下方 Moran's I 數值
        g.append('text')
          .attr('x', xScale(I))
          .attr('y', yScale(0) + 18)
          .attr('text-anchor', 'middle')
          .style('font-size', '13px')
          .style('fill', 'red')
          .text(I.toFixed(2));

        // x 軸
        g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale));

        // y 軸
        g.append('g').call(d3.axisLeft(yScale).ticks(5));

        // x 軸標籤
        g.append('text')
          .attr('transform', `translate(${width / 2},${height + 36})`)
          .style('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(`Moran I: ${I.toFixed(2)}`);

        // y 軸標籤
        g.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left + 15)
          .attr('x', 0 - height / 2)
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .style('font-size', '14px')
          .text('Density');

        // 標題
        g.append('text')
          .attr('x', width / 2)
          .attr('y', -18)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text('Reference Distribution');
      };

      // KDE 輔助函數
      function kernelDensityEstimator(kernel, X) {
        return function (V) {
          return X.map((x) => [x, d3.mean(V, (v) => kernel(x - v))]);
        };
      }

      function kernelEpanechnikov(k) {
        return (v) => (Math.abs((v /= k)) <= 1 ? (0.75 * (1 - v * v)) / k : 0);
      }

      /**
       * 📊 繪製原始 Moran Plot (Draw Original Moran Plot)
       */
      const drawMoranPlot = () => {
        if (!moranPlotChart.value) {
          // moranPlotChart 容器不存在
          return;
        }
        const moranData = currentSpatialAnalysisData.value?.moran;
        if (!moranData || !moranData.originalValues || !moranData.lagValues) {
          // Moran Plot 數據不完整
          return;
        }

        // 清除舊的 SVG
        d3.select(moranPlotChart.value).selectAll('svg').remove();

        // 強制重新計算容器大小
        const containerRect = moranPlotChart.value.getBoundingClientRect();
        const containerWidth = containerRect.width;

        if (containerWidth <= 0) {
          setTimeout(() => drawMoranPlot(), 100);
          return;
        }

        const containerHeight = 400;
        const margin = { top: 40, right: 30, bottom: 50, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        const svg = d3
          .select(moranPlotChart.value)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // 使用 standardizedValues/standardizedLagValues 畫圖
        const plotData = moranData.standardizedValues.map((x, i) => ({
          x: x,
          y: moranData.standardizedLagValues[i],
        }));

        // x/y 軸自動包住所有點，加一點 padding
        const xDomain = d3.extent(plotData, (d) => d.x);
        const yDomain = d3.extent(plotData, (d) => d.y);
        const xPadding = (xDomain[1] - xDomain[0]) * 0.1;
        const yPadding = (yDomain[1] - yDomain[0]) * 0.1;
        const xScale = d3
          .scaleLinear()
          .domain([xDomain[0] - xPadding, xDomain[1] + xPadding])
          .range([0, width]);
        const yScale = d3
          .scaleLinear()
          .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
          .range([height, 0]);

        // 添加軸線
        g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale));
        g.append('g').call(d3.axisLeft(yScale));

        // 添加原點參考線
        g.append('line')
          .attr('x1', xScale(0))
          .attr('x2', xScale(0))
          .attr('y1', 0)
          .attr('y2', height)
          .attr('stroke', '#cccccc')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-width', 1);

        g.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', yScale(0))
          .attr('y2', yScale(0))
          .attr('stroke', '#cccccc')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-width', 1);

        // 添加軸標籤
        g.append('text')
          .attr('transform', `translate(${width / 2},${height + 36})`)
          .style('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(`${currentLayer.value?.value?.valueField || 'count'} (standardized)`);

        g.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left + 15)
          .attr('x', 0 - height / 2)
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(`${currentLayer.value?.value?.valueField || 'count'}_lag (standardized)`);

        // 添加標題
        g.append('text')
          .attr('x', width / 2)
          .attr('y', -18)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text(`Moran Plot - ${currentLayer.value?.value?.valueField || 'count'}`);

        // 繪製散點
        g.selectAll('.dot')
          .data(plotData)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('cx', (d) => xScale(d.x))
          .attr('cy', (d) => yScale(d.y))
          .attr('r', 3)
          .attr('fill', '#1f77b4')
          .attr('opacity', 0.7);

        // 計算並繪製回歸線
        const n = plotData.length;
        const sumX = plotData.reduce((sum, d) => sum + d.x, 0);
        const sumY = plotData.reduce((sum, d) => sum + d.y, 0);
        const sumXY = plotData.reduce((sum, d) => sum + d.x * d.y, 0);
        const sumXX = plotData.reduce((sum, d) => sum + d.x * d.x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const lineData = [
          { x: xDomain[0], y: slope * xDomain[0] + intercept },
          { x: xDomain[1], y: slope * xDomain[1] + intercept },
        ];

        g.append('line')
          .attr('x1', xScale(lineData[0].x))
          .attr('y1', yScale(lineData[0].y))
          .attr('x2', xScale(lineData[1].x))
          .attr('y2', yScale(lineData[1].y))
          .attr('stroke', 'red')
          .attr('stroke-width', 2);
      };

      /**
       * 📊 繪製標準化 Moran Plot (Draw Standardized Moran Plot)
       */
      const drawMoranStdPlot = () => {
        if (!moranStdPlotChart.value) {
          // moranStdPlotChart 容器不存在
          return;
        }
        const moranData = currentSpatialAnalysisData.value?.moran;
        if (!moranData || !moranData.standardizedValues || !moranData.standardizedLagValues) {
          // 標準化 Moran Plot 數據不完整
          return;
        }

        // 清除舊的 SVG
        d3.select(moranStdPlotChart.value).selectAll('svg').remove();

        // 強制重新計算容器大小
        const containerRect = moranStdPlotChart.value.getBoundingClientRect();
        const containerWidth = containerRect.width;

        if (containerWidth <= 0) {
          setTimeout(() => drawMoranStdPlot(), 100);
          return;
        }

        const containerHeight = 400;
        const margin = { top: 40, right: 30, bottom: 50, left: 60 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;

        const svg = d3
          .select(moranStdPlotChart.value)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // 準備數據
        const plotData = moranData.standardizedValues.map((x, i) => ({
          x: x,
          y: moranData.standardizedLagValues[i],
        }));

        // 設定比例尺
        const xDomain = d3.extent(plotData, (d) => d.x);
        const yDomain = d3.extent(plotData, (d) => d.y);

        // 擴展定義域以包含原點
        const xExtended = [Math.min(xDomain[0], -3), Math.max(xDomain[1], 3)];
        const yExtended = [Math.min(yDomain[0], -3), Math.max(yDomain[1], 3)];

        const xScale = d3.scaleLinear().domain(xExtended).range([0, width]);
        const yScale = d3.scaleLinear().domain(yExtended).range([height, 0]);

        // 添加軸線
        g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(xScale));
        g.append('g').call(d3.axisLeft(yScale));

        // 添加原點參考線
        g.append('line')
          .attr('x1', xScale(0))
          .attr('x2', xScale(0))
          .attr('y1', 0)
          .attr('y2', height)
          .attr('stroke', '#cccccc')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-width', 1);

        g.append('line')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', yScale(0))
          .attr('y2', yScale(0))
          .attr('stroke', '#cccccc')
          .attr('stroke-dasharray', '3,3')
          .attr('stroke-width', 1);

        // 添加軸標籤
        g.append('text')
          .attr('transform', `translate(${width / 2},${height + 36})`)
          .style('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(`${currentLayer.value?.value?.valueField || 'count'} (standardized)`);

        g.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left + 15)
          .attr('x', 0 - height / 2)
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(`${currentLayer.value?.value?.valueField || 'count'}_lag (standardized)`);

        // 添加標題
        g.append('text')
          .attr('x', width / 2)
          .attr('y', -18)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text(`Moran Scatterplot (${formatValue(currentSpatialAnalysisData.value?.moran?.I)})`);

        // 繪製散點
        g.selectAll('.dot')
          .data(plotData)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('cx', (d) => xScale(d.x))
          .attr('cy', (d) => yScale(d.y))
          .attr('r', 3)
          .attr('fill', '#1f77b4')
          .attr('opacity', 0.7);

        // 計算並繪製回歸線
        const n = plotData.length;
        const sumX = plotData.reduce((sum, d) => sum + d.x, 0);
        const sumY = plotData.reduce((sum, d) => sum + d.y, 0);
        const sumXY = plotData.reduce((sum, d) => sum + d.x * d.y, 0);
        const sumXX = plotData.reduce((sum, d) => sum + d.x * d.x, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const lineData = [
          { x: xExtended[0], y: slope * xExtended[0] + intercept },
          { x: xExtended[1], y: slope * xExtended[1] + intercept },
        ];

        g.append('line')
          .attr('x1', xScale(lineData[0].x))
          .attr('y1', yScale(lineData[0].y))
          .attr('x2', xScale(lineData[1].x))
          .attr('y2', yScale(lineData[1].y))
          .attr('stroke', 'red')
          .attr('stroke-width', 2);
      };

      // 監聽圖表容器大小變化
      const observeChartContainers = () => {
        if (!resizeObserver.value) {
          resizeObserver.value = new ResizeObserver((entries) => {
            for (let entry of entries) {
              // 添加延遲以確保容器尺寸穩定
              setTimeout(() => {
                if (entry.target === moranPlotChart.value) {
                  drawMoranPlot();
                } else if (entry.target === moranRefChart.value) {
                  drawMoranRefPlot();
                } else if (entry.target === moranStdPlotChart.value) {
                  drawMoranStdPlot();
                }
              }, 50);
            }
          });
        }

        // 確保 DOM 元素存在後再設置觀察器
        if (moranPlotChart.value) {
          resizeObserver.value.observe(moranPlotChart.value);
        }
        if (moranRefChart.value) {
          resizeObserver.value.observe(moranRefChart.value);
        }
        if (moranStdPlotChart.value) {
          resizeObserver.value.observe(moranStdPlotChart.value);
        }
      };

      /**
       * 📊 統一更新所有 Moran 圖表 (Update All Moran Plots)
       * 確保所有圖表都使用最新的容器寬度重繪
       */
      const updateAllMoranPlots = () => {
        if (hasValidMoranData.value) {
          nextTick(() => {
            drawMoranPlot();
            drawMoranRefPlot();
            drawMoranStdPlot();
          });
        }
      };

      /**
       * 📏 處理視窗大小變化 (Handle Window Resize)
       * 當視窗大小變化時重新繪製所有圖表
       */
      const handleWindowResize = () => {
        // 使用防抖機制避免過於頻繁的重繪
        if (window.moranPlotsResizeTimeout) {
          clearTimeout(window.moranPlotsResizeTimeout);
        }
        window.moranPlotsResizeTimeout = setTimeout(() => {
          updateAllMoranPlots();
        }, 150);
      };

      /**
       * 📊 重新設置 ResizeObserver (Re-setup ResizeObserver)
       * 當 DOM 元素準備好後重新設置觀察器
       */
      const reSetupResizeObserver = () => {
        // 先清理舊的觀察器
        if (resizeObserver.value) {
          resizeObserver.value.disconnect();
          resizeObserver.value = null;
        }
        // 等待 DOM 更新後重新設置
        nextTick(() => {
          observeChartContainers();
        });
      };

      // 👁️ 監控可見圖層變化，自動選擇第一個圖層
      watch(
        visibleLayers,
        (newLayers) => {
          // 如果沒有選中的圖層但有可見圖層，選中第一個
          if (newLayers.length > 0 && !activeLayerTab.value) {
            setActiveLayerTab(newLayers[0].layerId);
          }
          // 如果當前選中的圖層不在可見圖層中，切換到第一個可見圖層
          else if (
            activeLayerTab.value &&
            !newLayers.some((l) => l.layerId === activeLayerTab.value)
          ) {
            if (newLayers.length > 0) {
              setActiveLayerTab(newLayers[0].layerId);
            } else {
              activeLayerTab.value = null;
            }
          }
          // 如果沒有可見圖層，清除選中的圖層
          else if (newLayers.length === 0) {
            activeLayerTab.value = null;
          }
        },
        { immediate: true }
      );

      // 監聽數據變化，重新繪製圖表
      watch(
        [
          currentSpatialAnalysisData,
          () => moranPlotChart.value,
          () => moranRefChart.value,
          () => moranStdPlotChart.value,
        ],
        ([newData, newPlotChart, newRefChart, newStdPlotChart]) => {
          if (newData && newPlotChart && newRefChart && newStdPlotChart) {
            updateAllMoranPlots();
            // 重新設置 ResizeObserver
            reSetupResizeObserver();
          }
        },
        { immediate: true }
      );

      // 🚀 組件掛載時的初始化
      onMounted(async () => {
        // 自動選中第一個可見圖層
        if (visibleLayers.value.length > 0 && !activeLayerTab.value) {
          setActiveLayerTab(visibleLayers.value[0].layerId);
        }

        // 延遲設置 ResizeObserver 確保 DOM 完全準備好
        setTimeout(() => {
          observeChartContainers();
        }, 500);

        // 添加視窗大小變化監聽
        window.addEventListener('resize', handleWindowResize);
      });

      // 在組件卸載時清理觀察器
      onUnmounted(() => {
        // 清理 ResizeObserver
        if (resizeObserver.value) {
          resizeObserver.value.disconnect();
        }

        // 清理視窗大小變化監聽
        window.removeEventListener('resize', handleWindowResize);

        // 清理防抖計時器
        if (window.moranPlotsResizeTimeout) {
          clearTimeout(window.moranPlotsResizeTimeout);
          delete window.moranPlotsResizeTimeout;
        }
      });

      // 📤 返回響應式數據給模板使用
      return {
        dataStore, // 數據存儲實例
        visibleLayers, // 可見圖層
        activeLayerTab, // 活動圖層分頁
        currentLayer, // 當前圖層
        currentPopulationLayerForLegend, // 用於人口圖層legend顯示的圖層
        currentSpatialAnalysisData, // 當前空間分析數據
        hasSpatialAnalysisData, // 是否有空間分析數據
        isBasicDataDisabled, // 基本數據是否被禁用
        setActiveLayerTab, // 設定活動圖層分頁
        getLayerFullTitle, // 取得圖層完整標題
        getTransformLabel, // 獲取轉換方式標籤
        getMoranPattern, // 獲取 Moran's I 模式解釋
        getGearyPattern, // 獲取 Geary's C 模式解釋
        getGetisOrdPattern, // 獲取 Getis-Ord G 模式解釋
        formatValue, // 格式化數值
        handleBasicDataColorModeChange, // 處理基本數據顏色模式變更
        handleSpatialLagColorModeChange, // 處理 Spatial Lag 顏色模式變更
        handleJoinCountsColorModeChange, // 處理 Join Counts 顏色模式變更
        handlePopulationColorModeChange, // 處理人口分析顏色模式變更
        handleInfectionRateColorModeChange, // 處理感染率顏色模式變更
        // K 鄰居數量相關
        kNeighborsInput, // K 鄰居數量輸入值
        isRecalculating, // 重新計算狀態
        recalculateSpatialAnalysis, // 重新計算空間分析函數
        // 二元分類閾值相關
        binaryThresholdInput, // 二元分類閾值輸入值
        isRecalculatingJoinCounts, // Join Counts 重新計算狀態
        recalculateJoinCounts, // 重新計算 Join Counts 函數
        currentCountStatistics, // 當前圖層的 count 統計資訊
        // Moran Plot 相關
        hasValidMoranData, // 是否有有效的 Moran 數據
        moranIValue, // Moran's I 值
        moranPlotChart, // Moran Plot 圖表容器引用
        drawMoranPlot, // 繪製 Moran Plot
        // PySDA 圖表相關
        pysdaFigureData, // PySDA 圖表數據
        hasValidPysdaFigureData, // 是否有有效的 PySDA 圖表數據
        // MSTDBSCAN 圖表相關
        mstdbscanResults, // MSTDBSCAN 結果數據
        hasValidMstdbscanResults, // 是否有有效的 MSTDBSCAN 結果數據
        moranRefChart, // Moran Reference Distribution 圖表容器引用
        drawMoranRefPlot, // 繪製 Moran Reference Distribution Plot
        moranStdPlotChart, // Standardized Moran Plot 圖表容器引用
        drawMoranStdPlot, // 繪製標準化 Moran Plot
      };
    },
  };
</script>

<template>
  <div class="h-100 flex-grow-1 d-flex flex-column my-bgcolor-gray-200">
    <!-- 📋 圖層選擇器 -->
    <div v-if="visibleLayers.length > 0">
      <ul class="nav nav-tabs nav-fill">
        <li v-for="layer in visibleLayers" :key="layer.layerId" class="nav-item">
          <button
            class="nav-link rounded-0 border-0 btn w-100 d-flex align-items-center justify-content-center"
            :class="{
              'active my-bgcolor-white': activeLayerTab === layer.layerId,
              'my-bgcolor-gray-200': activeLayerTab !== layer.layerId,
            }"
            @click="setActiveLayerTab(layer.layerId)"
          >
            <span>
              <span v-if="getLayerFullTitle(layer).groupName" class="my-title-xs-gray"
                >{{ getLayerFullTitle(layer).groupName }} -
              </span>
              <span class="my-title-sm-black">{{ getLayerFullTitle(layer).layerName }}</span>
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- 📊 空間分析內容 -->
    <div v-if="currentLayer" class="my-bgcolor-white h-100">
      <div>
        <!-- 🎨 圖層顏色條 -->
        <div
          v-if="currentLayer"
          :class="`my-bgcolor-${currentLayer.colorName}`"
          :style="{ minHeight: '4px' }"
        ></div>

        <div>
          <!-- 人口分析分佈圖層（即使沒有空間分析數據也要顯示） -->
          <template
            v-if="
              currentLayer &&
              (currentLayer.isPopulationLayer ||
                (currentLayer.layerName && currentLayer.layerName.includes('人口分佈')))
            "
          >
            <!-- 人口分析圖層信息顯示區塊 -->
            <div class="p-3">
              <!-- 基本數據圖層顯示按鈕 -->
              <div class="mb-1">
                <div
                  :class="[
                    'btn rounded-0 border-0 d-flex shadow-sm p-0',
                    isBasicDataDisabled
                      ? 'my-bgcolor-gray-100'
                      : 'my-bgcolor-white-hover cursor-pointer',
                  ]"
                  @click="
                    !isBasicDataDisabled &&
                    handleBasicDataColorModeChange({
                      target: { checked: !dataStore.useBasicDataColors },
                    })
                  "
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">基本數據</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'basic-data-switch-population'"
                          :checked="dataStore.useBasicDataColors"
                          :disabled="isBasicDataDisabled"
                          @change="handleBasicDataColorModeChange"
                        />
                        <label :for="'basic-data-switch-population'"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-2"></div>

              <div class="my-title-sm-black mb-3">人口圖層資訊</div>

              <DetailItem label="圖層名稱" :value="currentLayer.layerName || '未知圖層'" />
              <DetailItem
                label="區域數量"
                :value="currentLayer.summaryData?.totalCount || '載入中...'"
              />
              <DetailItem
                label="總人口"
                :value="(currentLayer.summaryData?.totalPopulation || 0).toLocaleString()"
              />

              <!-- 顯示當前選中的人口圖層是否已載入 -->
              <div v-if="!currentLayer.isLoaded" class="alert alert-info small mt-3">
                此圖層尚未載入數據。請在左側圖層列表中開啟此圖層以載入詳細數據。
              </div>

              <hr class="my-3" />

              <!-- 人口分析分布控制按鈕 -->
              <div class="my-title-sm-black mb-3">人口分析</div>

              <!-- POPULATION_DENSITY (人口密度) -->
              <div class="mb-1">
                <div
                  class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0 cursor-pointer"
                  @click="handlePopulationColorModeChange('POPULATION_DENSITY')"
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">人口密度 (每平方公尺)</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'pop-density-switch-detail'"
                          :checked="
                            dataStore.usePopulationColors &&
                            dataStore.selectedPopulationAttribute === 'POPULATION_DENSITY'
                          "
                          @change="handlePopulationColorModeChange('POPULATION_DENSITY')"
                        />
                        <label :for="'pop-density-switch-detail'"></label>
                      </div>
                    </div>
                    <!-- POPULATION_DENSITY 圖例 -->
                    <div class="px-3 pb-2">
                      <div
                        v-for="data in currentPopulationLayerForLegend.legendData_POPULATION_DENSITY"
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
                      <!-- 缺值統計 -->
                      <div
                        v-if="
                          currentPopulationLayerForLegend.legendData_POPULATION_DENSITY?.[0]
                            ?.summary
                        "
                        class="mt-2"
                      >
                        <div class="my-content-xs-gray">
                          缺值:
                          {{
                            currentPopulationLayerForLegend.legendData_POPULATION_DENSITY[0].summary
                              .zeroOrMissingCount
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-1"></div>

              <!-- P_CNT (全部人口) -->
              <div class="mb-1">
                <div
                  class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0 cursor-pointer"
                  @click="handlePopulationColorModeChange('P_CNT')"
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">全部人口</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'p-cnt-switch-detail'"
                          :checked="
                            dataStore.usePopulationColors &&
                            dataStore.selectedPopulationAttribute === 'P_CNT'
                          "
                          @change="handlePopulationColorModeChange('P_CNT')"
                        />
                        <label :for="'p-cnt-switch-detail'"></label>
                      </div>
                    </div>
                    <!-- P_CNT 圖例 -->
                    <div class="px-3 pb-2">
                      <div
                        v-for="data in currentPopulationLayerForLegend.legendData_P_CNT"
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
                      <!-- 缺值統計 -->
                      <div
                        v-if="currentPopulationLayerForLegend.legendData_P_CNT?.[0]?.summary"
                        class="mt-2"
                      >
                        <div class="my-content-xs-gray">
                          缺值:
                          {{
                            currentPopulationLayerForLegend.legendData_P_CNT[0].summary
                              .zeroOrMissingCount
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-1"></div>

              <!-- M_CNT (男性人口) -->
              <div class="mb-1">
                <div
                  class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0 cursor-pointer"
                  @click="handlePopulationColorModeChange('M_CNT')"
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">男性人口</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'m-cnt-switch-detail'"
                          :checked="
                            dataStore.usePopulationColors &&
                            dataStore.selectedPopulationAttribute === 'M_CNT'
                          "
                          @change="handlePopulationColorModeChange('M_CNT')"
                        />
                        <label :for="'m-cnt-switch-detail'"></label>
                      </div>
                    </div>
                    <!-- M_CNT 圖例 -->
                    <div class="px-3 pb-2">
                      <div
                        v-for="data in currentPopulationLayerForLegend.legendData_M_CNT"
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
                      <!-- 缺值統計 -->
                      <div
                        v-if="currentPopulationLayerForLegend.legendData_M_CNT?.[0]?.summary"
                        class="mt-2"
                      >
                        <div class="my-content-xs-gray">
                          缺值:
                          {{
                            currentPopulationLayerForLegend.legendData_M_CNT[0].summary
                              .zeroOrMissingCount
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-1"></div>

              <!-- F_CNT (女性人口) -->
              <div class="mb-1">
                <div
                  class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0 cursor-pointer"
                  @click="handlePopulationColorModeChange('F_CNT')"
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">女性人口</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'f-cnt-switch-detail'"
                          :checked="
                            dataStore.usePopulationColors &&
                            dataStore.selectedPopulationAttribute === 'F_CNT'
                          "
                          @change="handlePopulationColorModeChange('F_CNT')"
                        />
                        <label :for="'f-cnt-switch-detail'"></label>
                      </div>
                    </div>
                    <!-- F_CNT 圖例 -->
                    <div class="px-3 pb-2">
                      <div
                        v-for="data in currentPopulationLayerForLegend.legendData_F_CNT"
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
                      <!-- 缺值統計 -->
                      <div
                        v-if="currentPopulationLayerForLegend.legendData_F_CNT?.[0]?.summary"
                        class="mt-2"
                      >
                        <div class="my-content-xs-gray">
                          缺值:
                          {{
                            currentPopulationLayerForLegend.legendData_F_CNT[0].summary
                              .zeroOrMissingCount
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 空間分析數據 -->
          <template v-else-if="hasSpatialAnalysisData">
            <div class="p-3">
              <!-- 基本數據圖層顯示按鈕 -->
              <div class="mb-1">
                <div
                  :class="[
                    'btn rounded-0 border-0 d-flex shadow-sm p-0',
                    isBasicDataDisabled
                      ? 'my-bgcolor-gray-100'
                      : 'my-bgcolor-white-hover cursor-pointer',
                  ]"
                  @click="
                    !isBasicDataDisabled &&
                    handleBasicDataColorModeChange({
                      target: { checked: !dataStore.useBasicDataColors },
                    })
                  "
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">基本數據</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'basic-data-switch'"
                          :checked="dataStore.useBasicDataColors"
                          :disabled="isBasicDataDisabled"
                          @change="handleBasicDataColorModeChange"
                        />
                        <label :for="'basic-data-switch'"></label>
                      </div>
                    </div>
                    <!-- 基本數據圖例 -->
                    <div
                      v-if="dataStore.useBasicDataColors && currentLayer.legendData"
                      class="px-3 pb-2"
                    >
                      <div v-for="data in currentLayer.legendData" :key="data.color" class="d-flex">
                        <div
                          style="min-width: 6px"
                          :style="{
                            backgroundColor: data.color,
                          }"
                        ></div>
                        <div class="my-content-xs-black text-nowrap ms-2">
                          {{ data.label }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-2"></div>

              <DetailItem
                label="分析欄位"
                :value="currentLayer.value ? currentLayer.value.valueField : 'count'"
              />
              <DetailItem
                :label="`${currentLayer.value ? currentLayer.value.valueField : 'count'}平均`"
                :value="formatValue(currentSpatialAnalysisData.originalMean)"
              />
            </div>
          </template>

          <!-- 感染率分析 -->
          <template v-if="hasSpatialAnalysisData">
            <hr class="my-0" />

            <div class="p-3">
              <div class="my-title-sm-black mb-3">感染率分析</div>

              <!-- 感染率顏色模式控制 -->
              <div class="mb-1">
                <div
                  class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0 cursor-pointer"
                  @click="
                    handleInfectionRateColorModeChange({
                      target: { checked: !dataStore.useInfectionRateColors },
                    })
                  "
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">感染率 (%)</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'infection-rate-switch'"
                          :checked="dataStore.useInfectionRateColors"
                          @change="handleInfectionRateColorModeChange"
                        />
                        <label :for="'infection-rate-switch'"></label>
                      </div>
                    </div>
                    <!-- 感染率圖例 -->
                    <div
                      v-if="
                        dataStore.useInfectionRateColors && currentLayer.legendData_InfectionRate
                      "
                      class="px-3 pb-2"
                    >
                      <div
                        v-for="data in currentLayer.legendData_InfectionRate"
                        :key="data.color"
                        class="d-flex"
                      >
                        <div
                          style="min-width: 6px"
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
          </template>

          <!-- 顏色模式控制 -->
          <template v-if="hasSpatialAnalysisData">
            <hr class="my-0" />

            <div class="p-3">
              <!-- 空間滯後值顏色開關 -->
              <div class="mb-1">
                <div
                  class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0 cursor-pointer"
                  @click="
                    handleSpatialLagColorModeChange({
                      target: { checked: !dataStore.useSpatialLagColors },
                    })
                  "
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">Spatial Lag</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'spatial-lag-switch'"
                          :checked="dataStore.useSpatialLagColors"
                          @change="handleSpatialLagColorModeChange"
                        />
                        <label :for="'spatial-lag-switch'"></label>
                      </div>
                    </div>
                    <!-- 空間滯後值圖例 -->
                    <div
                      v-if="dataStore.useSpatialLagColors && currentLayer.legendData_SpatialLag"
                      class="px-3 pb-2"
                    >
                      <div
                        v-for="data in currentLayer.legendData_SpatialLag"
                        :key="data.color"
                        class="d-flex"
                      >
                        <div
                          style="min-width: 6px"
                          :style="{
                            backgroundColor: data.color,
                          }"
                        ></div>
                        <div class="my-content-xs-black text-nowrap ms-2">{{ data.label }}</div>
                      </div>
                      <!-- 缺值統計 -->
                      <div v-if="currentLayer.legendData_SpatialLag?.[0]?.summary" class="mt-2">
                        <div class="my-content-xs-gray">
                          缺值:
                          {{ currentLayer.legendData_SpatialLag[0].summary.zeroOrMissingCount }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-2"></div>

              <!-- Spatial Lag -->
              <!-- K 鄰居數量輸入 -->
              <div class="pb-2">
                <div class="my-title-xs-gray pb-1">鄰居數量 (K)</div>
                <div class="d-flex align-items-center pb-1">
                  <input
                    v-model.number="kNeighborsInput"
                    type="number"
                    min="1"
                    max="50"
                    class="form-control form-control-sm my-content-sm-black me-2"
                    style="width: 80px"
                    :disabled="isRecalculating"
                  />
                  <button
                    @click="recalculateSpatialAnalysis"
                    class="btn my-btn-blue my-font-size-xs"
                    :disabled="isRecalculating || !currentLayer || !currentLayer.geoJsonData"
                  >
                    <span
                      v-if="isRecalculating"
                      class="spinner-border spinner-border-sm me-1"
                      role="status"
                    ></span>
                    {{ isRecalculating ? '計算中...' : '確定' }}
                  </button>
                </div>
              </div>
              <DetailItem
                label="轉換方式"
                :value="getTransformLabel(currentSpatialAnalysisData.transform)"
              />
              <DetailItem
                label="Spatial Lag平均"
                :value="formatValue(currentSpatialAnalysisData.lagMean)"
              />
              <DetailItem
                label="Spatial Lag標準差"
                :value="formatValue(currentSpatialAnalysisData.lagStd)"
              />
              <DetailItem
                :label="`${currentLayer.value ? currentLayer.value.valueField : 'count'}與Spatial Lag相關係數`"
                :value="formatValue(currentSpatialAnalysisData.correlation)"
              />
            </div>
          </template>

          <!-- 顏色模式控制 -->
          <template v-if="hasSpatialAnalysisData">
            <hr class="my-0" />

            <div class="p-3">
              <!-- Join Counts 顏色模式控制 -->
              <div class="mb-1">
                <div
                  class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0 cursor-pointer"
                  @click="
                    handleJoinCountsColorModeChange({
                      target: { checked: !dataStore.useJoinCountsColors },
                    })
                  "
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">Join Counts</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'join-counts-switch'"
                          :checked="dataStore.useJoinCountsColors"
                          @change="handleJoinCountsColorModeChange"
                        />
                        <label :for="'join-counts-switch'"></label>
                      </div>
                    </div>
                    <!-- Join Counts 圖例 -->
                    <div
                      v-if="dataStore.useJoinCountsColors && currentLayer.legendData_JoinCounts"
                      class="px-3 pb-2"
                    >
                      <div
                        v-for="data in currentLayer.legendData_JoinCounts"
                        :key="data.color"
                        class="d-flex"
                      >
                        <div
                          style="min-width: 6px"
                          :style="{
                            backgroundColor: data.color,
                          }"
                        ></div>
                        <div class="my-content-xs-black text-nowrap ms-2">{{ data.label }}</div>
                      </div>
                      <!-- 缺值統計 -->
                      <div
                        v-if="currentLayer.legendData_JoinCounts?.[0]?.summary?.missingCount > 0"
                        class="mt-2"
                      >
                        <div class="my-content-xs-gray">
                          缺值:
                          {{ currentLayer.legendData_JoinCounts[0].summary.missingCount }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-2"></div>

              <!-- 二元分類閾值輸入 -->
              <div class="pb-2">
                <div class="my-title-xs-gray pb-1">二元分類閾值</div>
                <div class="d-flex align-items-center pb-1">
                  <input
                    v-model.number="binaryThresholdInput"
                    type="number"
                    min="0"
                    max="1000"
                    step="1"
                    class="form-control form-control-sm my-content-sm-black me-2"
                    style="width: 80px"
                    :disabled="isRecalculatingJoinCounts"
                  />
                  <button
                    @click="recalculateJoinCounts"
                    class="btn my-btn-blue my-font-size-xs"
                    :disabled="
                      isRecalculatingJoinCounts || !currentLayer || !currentLayer.geoJsonData
                    "
                  >
                    <span
                      v-if="isRecalculatingJoinCounts"
                      class="spinner-border spinner-border-sm me-1"
                      role="status"
                    ></span>
                    {{ isRecalculatingJoinCounts ? '計算中...' : '確定' }}
                  </button>
                </div>
              </div>

              <!-- Join Counts 空間自相關分析 -->
              <template v-if="currentSpatialAnalysisData && currentSpatialAnalysisData.joinCounts">
                <DetailItem
                  label="count最大值"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.max)"
                />
                <DetailItem
                  label="count最小值"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.min)"
                />
                <DetailItem
                  label="count平均值"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.mean)"
                />
                <DetailItem
                  label="0-0 鄰接數量"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.bb)"
                />
                <DetailItem
                  label="1-1 鄰接數量"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.ww)"
                />
                <DetailItem
                  label="0-1 鄰接數量"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.bw)"
                />
                <DetailItem
                  label="所有鄰接總數"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.total)"
                />
                <DetailItem
                  label="0-0 模擬平均值(隨機分布預期值)"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.mean_bb)"
                />
                <DetailItem
                  label="0-1 模擬平均值(隨機分布預期值)"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.mean_bw)"
                />
                <DetailItem
                  label="0-0 模擬p值(顯著聚集判斷)"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.p_sim_bb)"
                />
                <DetailItem
                  label="0-1 模擬p值(顯著隔離判斷)"
                  :value="formatValue(currentSpatialAnalysisData.joinCounts.p_sim_bw)"
                />
              </template>
            </div>
          </template>

          <!-- 面域分析結果 -->
          <template
            v-if="
              currentLayer && currentLayer.isAnalysisLayer && !currentLayer.isPointCombinedLayer
            "
          >
            <hr class="my-0" />

            <!-- Moran's I 空間自相關分析 -->
            <template v-if="currentSpatialAnalysisData && currentSpatialAnalysisData.moran">
              <hr class="my-0" />

              <div class="p-3">
                <div class="my-title-sm-black mb-3">Moran's I 空間自相關分析</div>

                <DetailItem
                  label="Moran's I"
                  :value="formatValue(currentSpatialAnalysisData.moran.I)"
                />
                <DetailItem
                  label="p-sim (顯著性)"
                  :value="formatValue(currentSpatialAnalysisData.moran.p_sim)"
                />
                <DetailItem
                  label="統計顯著性"
                  :value="
                    currentSpatialAnalysisData.moran.significant
                      ? '顯著 (p < 0.05)'
                      : '不顯著 (p ≥ 0.05)'
                  "
                />
                <DetailItem
                  label="空間自相關模式"
                  :value="
                    getMoranPattern(
                      currentSpatialAnalysisData.moran.I,
                      currentSpatialAnalysisData.moran.significant
                    )
                  "
                />
              </div>

              <!-- Moran Plot 視覺化 -->
              <hr class="my-0" />
              <div class="p-3">
                <div class="my-title-sm-black mb-3">Moran Plot 視覺化</div>

                <div v-if="hasValidMoranData" class="mb-4">
                  <!-- Moran Plot -->
                  <div class="mb-4">
                    <div class="plot-card">
                      <h6 class="plot-title">
                        Moran Plot -
                        {{ currentLayer.value ? currentLayer.value.valueField : 'count' }}
                      </h6>
                      <div
                        ref="moranPlotChart"
                        class="plot-container"
                        style="height: 400px; width: 100%"
                      ></div>
                    </div>
                  </div>
                  <!-- Reference Distribution -->
                  <div class="mb-4">
                    <div class="plot-card">
                      <h6 class="plot-title">Reference Distribution</h6>
                      <div
                        ref="moranRefChart"
                        class="plot-container"
                        style="height: 400px; width: 100%"
                      ></div>
                    </div>
                  </div>
                  <!-- Moran Scatterplot -->
                  <div class="mb-4">
                    <div class="plot-card">
                      <h6 class="plot-title">
                        Moran Scatterplot ({{ formatValue(currentSpatialAnalysisData.moran.I) }})
                      </h6>
                      <div
                        ref="moranStdPlotChart"
                        class="plot-container"
                        style="height: 400px; width: 100%"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- 無 Moran Plot 數據提示 -->
                <div v-else class="text-muted small text-center p-3">
                  Moran Plot 數據尚未生成。請確保已完成空間分析並有有效的 Moran's I 計算結果。
                </div>
              </div>
            </template>

            <!-- Geary's C 空間自相關分析 -->
            <template v-if="currentSpatialAnalysisData && currentSpatialAnalysisData.geary">
              <hr class="my-0" />

              <div class="p-3">
                <div class="my-title-sm-black mb-3">Geary's C 空間自相關分析</div>

                <DetailItem
                  label="Geary's C"
                  :value="formatValue(currentSpatialAnalysisData.geary.C)"
                />
                <DetailItem
                  label="p-sim (顯著性)"
                  :value="formatValue(currentSpatialAnalysisData.geary.p_sim)"
                />
                <DetailItem
                  label="統計顯著性"
                  :value="
                    currentSpatialAnalysisData.geary.significant
                      ? '顯著 (p < 0.05)'
                      : '不顯著 (p ≥ 0.05)'
                  "
                />
                <DetailItem
                  label="空間自相關模式"
                  :value="
                    getGearyPattern(
                      currentSpatialAnalysisData.geary.C,
                      currentSpatialAnalysisData.geary.significant
                    )
                  "
                />
              </div>
            </template>

            <!-- Getis-Ord G 空間自相關分析 -->
            <template v-if="currentSpatialAnalysisData && currentSpatialAnalysisData.getisord">
              <hr class="my-0" />

              <div class="p-3">
                <div class="my-title-sm-black mb-3">Getis-Ord G 空間自相關分析</div>

                <DetailItem
                  v-if="
                    currentSpatialAnalysisData && currentSpatialAnalysisData.minThresholdDistance
                  "
                  label="最小距離門檻"
                  :value="`${formatValue(currentSpatialAnalysisData.minThresholdDistance)} 公尺`"
                />
                <DetailItem
                  label="Getis-Ord G"
                  :value="formatValue(currentSpatialAnalysisData.getisord.G)"
                />
                <DetailItem
                  label="p-sim (顯著性)"
                  :value="formatValue(currentSpatialAnalysisData.getisord.p_sim)"
                />
                <DetailItem
                  label="Z 值 (標準化)"
                  :value="formatValue(currentSpatialAnalysisData.getisord.z_sim)"
                />
                <DetailItem
                  label="統計顯著性"
                  :value="
                    currentSpatialAnalysisData.getisord.significant
                      ? '顯著 (p < 0.05)'
                      : '不顯著 (p ≥ 0.05)'
                  "
                />
                <DetailItem
                  label="空間聚集模式"
                  :value="
                    getGetisOrdPattern(
                      currentSpatialAnalysisData.getisord.G,
                      currentSpatialAnalysisData.getisord.significant
                    )
                  "
                />
              </div>
            </template>
          </template>

          <!-- 點位分析結果 -->
          <template v-if="currentLayer.isPointCombinedLayer">
            <!-- Moran's I 空間自相關分析 -->
            <template v-if="currentSpatialAnalysisData && currentSpatialAnalysisData.moran">
              <hr class="my-0" />

              <div class="p-3">
                <div class="my-title-sm-black mb-3">Moran's I 空間自相關分析</div>

                <DetailItem
                  label="Moran's I"
                  :value="formatValue(currentSpatialAnalysisData.moran.I)"
                />
                <DetailItem
                  label="p-sim (顯著性)"
                  :value="formatValue(currentSpatialAnalysisData.moran.p_sim)"
                />
                <DetailItem
                  label="統計顯著性"
                  :value="
                    currentSpatialAnalysisData.moran.significant
                      ? '顯著 (p < 0.05)'
                      : '不顯著 (p ≥ 0.05)'
                  "
                />
                <DetailItem
                  label="空間自相關模式"
                  :value="
                    getMoranPattern(
                      currentSpatialAnalysisData.moran.I,
                      currentSpatialAnalysisData.moran.significant
                    )
                  "
                />
              </div>

              <!-- Moran Plot 視覺化 -->
              <hr class="my-0" />
              <div class="p-3">
                <div class="my-title-sm-black mb-3">Moran Plot 視覺化</div>

                <div v-if="hasValidMoranData" class="mb-4">
                  <!-- Moran Plot -->
                  <div class="mb-4">
                    <div class="plot-card">
                      <h6 class="plot-title">
                        Moran Plot -
                        {{ currentLayer.value ? currentLayer.value.valueField : 'count' }}
                      </h6>
                      <div
                        ref="moranPlotChart"
                        class="plot-container"
                        style="height: 400px; width: 100%"
                      ></div>
                    </div>
                  </div>
                  <!-- Reference Distribution -->
                  <div class="mb-4">
                    <div class="plot-card">
                      <h6 class="plot-title">Reference Distribution</h6>
                      <div
                        ref="moranRefChart"
                        class="plot-container"
                        style="height: 400px; width: 100%"
                      ></div>
                    </div>
                  </div>
                  <!-- Moran Scatterplot -->
                  <div class="mb-4">
                    <div class="plot-card">
                      <h6 class="plot-title">
                        Moran Scatterplot ({{ formatValue(currentSpatialAnalysisData.moran.I) }})
                      </h6>
                      <div
                        ref="moranStdPlotChart"
                        class="plot-container"
                        style="height: 400px; width: 100%"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- 無 Moran Plot 數據提示 -->
                <div v-else class="text-muted small text-center p-3">
                  Moran Plot 數據尚未生成。請確保已完成空間分析並有有效的 Moran's I 計算結果。
                </div>
              </div>
            </template>

            <!-- Geary's C 空間自相關分析 -->
            <template v-if="currentSpatialAnalysisData && currentSpatialAnalysisData.geary">
              <hr class="my-0" />

              <div class="p-3">
                <div class="my-title-sm-black mb-3">Geary's C 空間自相關分析</div>

                <DetailItem
                  label="Geary's C"
                  :value="formatValue(currentSpatialAnalysisData.geary.C)"
                />
                <DetailItem
                  label="p-sim (顯著性)"
                  :value="formatValue(currentSpatialAnalysisData.geary.p_sim)"
                />
                <DetailItem
                  label="統計顯著性"
                  :value="
                    currentSpatialAnalysisData.geary.significant
                      ? '顯著 (p < 0.05)'
                      : '不顯著 (p ≥ 0.05)'
                  "
                />
                <DetailItem
                  label="空間自相關模式"
                  :value="
                    getGearyPattern(
                      currentSpatialAnalysisData.geary.C,
                      currentSpatialAnalysisData.geary.significant
                    )
                  "
                />
              </div>
            </template>

            <!-- Getis-Ord G 空間自相關分析 -->
            <template v-if="currentSpatialAnalysisData && currentSpatialAnalysisData.getisord">
              <hr class="my-0" />

              <div class="p-3">
                <div class="my-title-sm-black mb-3">Getis-Ord G 空間自相關分析</div>

                <DetailItem
                  v-if="
                    currentSpatialAnalysisData && currentSpatialAnalysisData.minThresholdDistance
                  "
                  label="最小距離門檻"
                  :value="`${formatValue(currentSpatialAnalysisData.minThresholdDistance)} 公尺`"
                />
                <DetailItem
                  label="Getis-Ord G"
                  :value="formatValue(currentSpatialAnalysisData.getisord.G)"
                />
                <DetailItem
                  label="p-sim (顯著性)"
                  :value="formatValue(currentSpatialAnalysisData.getisord.p_sim)"
                />
                <DetailItem
                  label="Z 值 (標準化)"
                  :value="formatValue(currentSpatialAnalysisData.getisord.z_sim)"
                />
                <DetailItem
                  label="統計顯著性"
                  :value="
                    currentSpatialAnalysisData.getisord.significant
                      ? '顯著 (p < 0.05)'
                      : '不顯著 (p ≥ 0.05)'
                  "
                />
                <DetailItem
                  label="空間聚集模式"
                  :value="
                    getGetisOrdPattern(
                      currentSpatialAnalysisData.getisord.G,
                      currentSpatialAnalysisData.getisord.significant
                    )
                  "
                />
              </div>
            </template>
          </template>

          <!-- 點位分析結果 -->
          <template v-if="currentLayer.isPointCombinedLayer">
            <div class="p-3">
              <!-- 基本數據圖層顯示按鈕 -->
              <div class="mb-1">
                <div
                  class="btn rounded-0 border-0 d-flex shadow-sm my-bgcolor-white-hover p-0 cursor-pointer"
                  @click="
                    handleBasicDataColorModeChange({
                      target: { checked: !dataStore.useBasicDataColors },
                    })
                  "
                >
                  <!-- 顏色條 -->
                  <div class="my-bgcolor-gray-200" style="min-width: 6px"></div>
                  <div class="w-100">
                    <div class="d-flex">
                      <!-- 標題 -->
                      <div class="d-flex align-items-center text-start w-100 px-3 py-2">
                        <span class="my-content-sm-black">基本數據</span>
                      </div>
                      <!-- 切換開關 -->
                      <div class="d-flex align-items-center justify-content-center px-3 py-2">
                        <input
                          type="checkbox"
                          :id="'basic-data-switch-points'"
                          :checked="dataStore.useBasicDataColors"
                          @change="handleBasicDataColorModeChange"
                        />
                        <label :for="'basic-data-switch-points'"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-2"></div>

              <DetailItem label="圖層類型" value="點位分析" />
              <DetailItem
                label="分析欄位"
                :value="currentLayer.value ? currentLayer.value.valueField : 'count'"
              />
            </div>

            <!-- 點位雙分析結果（PySDA + MSTDBSCAN） -->
            <template v-if="currentLayer.pysdaSummary || currentLayer.mstdbscanSummary">
              <!-- PySDA 分析結果 -->
              <template v-if="currentLayer.pysdaSummary">
                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">PySDA 時空點擴散分析結果</div>

                  <!-- PySDA 分析參數 -->
                  <div class="my-title-sm-black mb-2">分析參數</div>
                  <DetailItem label="空間搜索半徑 (SR)" value="300 公尺" />
                  <DetailItem label="最小時間窗口 (T1)" value="6 天" />
                  <DetailItem label="最大時間窗口 (T2)" value="23 天" />
                  <DetailItem label="重抽樣次數" value="9 次" />
                  <DetailItem label="信心水平" value="0.80" />
                </div>

                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">PySDA 摘要統計</div>

                  <!-- 基本統計 -->
                  <DetailItem label="節點總數 (nodes)" :value="currentLayer.pysdaSummary.nodes" />
                  <DetailItem label="鄰接對數量 (npair)" :value="currentLayer.pysdaSummary.npair" />
                  <DetailItem
                    label="移動鏈接數量 (slink)"
                    :value="currentLayer.pysdaSummary.slink"
                  />
                  <DetailItem
                    label="子聚類數量 (sub-cluster)"
                    :value="currentLayer.pysdaSummary['sub-cluster']"
                  />
                </div>

                <hr class="my-0" />

                <div class="p-3">
                  <div class="small text-muted mb-2">最終結果（經篩選後）：</div>

                  <DetailItem
                    label="最終鄰接對 (final_cpair)"
                    :value="currentLayer.pysdaSummary.final_cpair"
                  />
                  <DetailItem
                    label="最終移動鏈接 (final_slink)"
                    :value="currentLayer.pysdaSummary.final_slink"
                  />
                  <DetailItem
                    label="進展鏈接數量 (progressno)"
                    :value="currentLayer.pysdaSummary.progressno"
                  />
                  <DetailItem
                    label="關鍵值門檻 (critical_value)"
                    :value="formatValue(currentLayer.pysdaSummary.critical_value)"
                  />
                </div>

                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">PySDA 結果解釋</div>

                  <div class="small text-muted mb-2">
                    <strong>鄰接對 (Neighboring Pairs)：</strong>在時間窗口 T1 (6天) 和空間半徑
                    300公尺內的病例對，表示可能共同源頭的傳播關係。
                  </div>
                  <div class="small text-muted mb-2">
                    <strong>移動鏈接 (Shifting Links)：</strong>在時間窗口 T1-T2 (6-23天)
                    和空間半徑內的病例對，表示可能的疾病傳播路徑。
                  </div>
                  <div class="small text-muted mb-2">
                    <strong>子聚類 (Sub-clusters)：</strong
                    >根據鄰接對識別出的疾病聚集區域，代表潛在的感染熱點。
                  </div>
                  <div class="small text-muted mb-2">
                    <strong>進展鏈接 (Progression Links)：</strong
                    >子聚類之間的傳播連接，顯示疫情在時空中的擴散模式。
                  </div>
                </div>

                <!-- PySDA 詳細結果 -->
                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">PySDA 詳細分析結果</div>

                  <div v-if="currentLayer.pysdaResults" class="small">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">節點數據表：</span>
                      <span class="badge bg-secondary"
                        >{{ currentLayer.pysdaResults.nodes?.length || 0 }} 筆</span
                      >
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">鄰接對表：</span>
                      <span class="badge bg-secondary"
                        >{{ currentLayer.pysdaResults.npairs?.length || 0 }} 筆</span
                      >
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">移動鏈接表：</span>
                      <span class="badge bg-secondary"
                        >{{ currentLayer.pysdaResults.slinks?.length || 0 }} 筆</span
                      >
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">子聚類表：</span>
                      <span class="badge bg-secondary"
                        >{{ currentLayer.pysdaResults.subclusters?.length || 0 }} 筆</span
                      >
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">進展鏈接表：</span>
                      <span class="badge bg-secondary"
                        >{{ currentLayer.pysdaResults.prog_links?.length || 0 }} 筆</span
                      >
                    </div>
                  </div>
                </div>

                <!-- PySDA 視覺化圖表 -->
                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">PySDA 視覺化圖表</div>

                  <div v-if="hasValidPysdaFigureData" class="mb-4">
                    <!-- (a) 點分布圖 -->
                    <div class="col-12 mb-3">
                      <div class="plot-card">
                        <h6 class="plot-title">(a) point</h6>
                        <div ref="pointChart" class="plot-container"></div>
                      </div>
                    </div>

                    <!-- (b) 子聚類圖 -->
                    <div class="col-12 mb-3">
                      <div class="plot-card">
                        <h6 class="plot-title">(b) subcluster</h6>
                        <div ref="subclusterChart" class="plot-container"></div>
                      </div>
                    </div>

                    <!-- (c) 進展鏈接圖 -->
                    <div class="col-12 mb-3">
                      <div class="plot-card">
                        <h6 class="plot-title">(c) progression link</h6>
                        <div ref="progressionChart" class="plot-container"></div>
                      </div>
                    </div>

                    <!-- (d) 時間序列圖 -->
                    <div class="col-12 mb-3">
                      <div class="plot-card">
                        <h6 class="plot-title">(d) case by time</h6>
                        <div ref="timeSeriesChart" class="plot-container"></div>
                      </div>
                    </div>
                  </div>

                  <!-- 無圖表數據提示 -->
                  <div v-else class="text-muted small text-center p-3">
                    圖表數據尚未生成。請確保已完成 PySDA 分析並檢測到聚類。
                  </div>
                </div>
              </template>

              <!-- MSTDBSCAN 分析結果 -->
              <template v-if="currentLayer.mstdbscanSummary">
                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">MSTDBSCAN 時空動態聚類分析結果</div>

                  <!-- MSTDBSCAN 分析參數 -->
                  <div class="my-title-sm-black mb-2">分析參數</div>
                  <DetailItem label="空間搜索半徑 (eps_spatial)" value="300 公尺" />
                  <DetailItem label="最小時間窗口 (eps_temporalLow)" value="1 天" />
                  <DetailItem label="最大時間窗口 (eps_temporalHigh)" value="2 天" />
                  <DetailItem label="最小鄰居點數 (min_pts)" value="3 個點" />
                  <DetailItem label="中心移動比例 (movingRatio)" value="0.1" />
                  <DetailItem label="面積變化比例 (areaRatio)" value="0.1" />
                </div>

                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">MSTDBSCAN 摘要統計</div>

                  <!-- 基本統計 -->
                  <DetailItem
                    label="總聚類數量 (total_clusters)"
                    :value="currentLayer.mstdbscanSummary.total_clusters"
                  />
                  <DetailItem
                    label="總動態點數 (total_points)"
                    :value="currentLayer.mstdbscanSummary.total_points"
                  />
                  <DetailItem
                    label="時間窗口數量 (time_windows)"
                    :value="currentLayer.mstdbscanSummary.time_windows"
                  />
                  <DetailItem
                    label="演化類型種類"
                    :value="currentLayer.mstdbscanSummary.evolution_types?.join(', ') || 'N/A'"
                  />
                </div>

                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">MSTDBSCAN 結果解釋</div>

                  <div class="small text-muted mb-2">
                    <strong>時空動態聚類：</strong>MSTDBSCAN
                    在每個時間窗口識別聚類，並追蹤它們的演化模式。
                  </div>
                  <div class="small text-muted mb-2">
                    <strong>演化類型：</strong>包括
                    Emerge（出現）、Steady（穩定）、Growth（成長）、Move（移動）、Split（分裂）、Merge（合併）等。
                  </div>
                  <div class="small text-muted mb-2">
                    <strong>動態點角色：</strong>每個點在不同時間可能扮演
                    core（核心）、border（邊界）或 noise（噪聲）角色。
                  </div>
                  <div class="small text-muted mb-2">
                    <strong>中心移動與面積變化：</strong
                    >追蹤聚類中心位置和覆蓋面積的變化，判斷聚類的動態行為。
                  </div>
                </div>

                <!-- MSTDBSCAN 詳細結果 -->
                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">MSTDBSCAN 詳細分析結果</div>

                  <div v-if="currentLayer.mstdbscanResults" class="small">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">動態聚類表：</span>
                      <span class="badge bg-secondary"
                        >{{ currentLayer.mstdbscanResults.clusters?.length || 0 }} 筆</span
                      >
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">動態點表：</span>
                      <span class="badge bg-secondary"
                        >{{ currentLayer.mstdbscanResults.points?.length || 0 }} 筆</span
                      >
                    </div>
                    <div
                      v-if="currentLayer.mstdbscanResults.polygons"
                      class="d-flex justify-content-between mb-2"
                    >
                      <span class="text-muted">區域動態表：</span>
                      <span class="badge bg-secondary"
                        >{{ currentLayer.mstdbscanResults.polygons?.length || 0 }} 筆</span
                      >
                    </div>
                  </div>
                </div>

                <!-- MSTDBSCAN 視覺化圖表 -->
                <hr class="my-0" />

                <div class="p-3">
                  <div class="my-title-sm-black mb-3">MSTDBSCAN 視覺化圖表</div>

                  <div v-if="hasValidMstdbscanResults" class="mb-4">
                    <!-- (a) 聚類演化圖 -->
                    <div class="col-12 mb-3">
                      <div class="plot-card">
                        <h6 class="plot-title">(a) 聚類演化</h6>
                        <div ref="mstdbscanClusterEvolution" class="plot-container"></div>
                      </div>
                    </div>

                    <!-- (b) 點分布圖 -->
                    <div class="col-12 mb-3">
                      <div class="plot-card">
                        <h6 class="plot-title">(b) 聚類分布</h6>
                        <div ref="mstdbscanPointDistribution" class="plot-container"></div>
                      </div>
                    </div>

                    <!-- (c) 演化類型分布圖 -->
                    <div class="col-12 mb-3">
                      <div class="plot-card">
                        <h6 class="plot-title">(c) 演化類型統計</h6>
                        <div ref="mstdbscanEvolutionTypes" class="plot-container"></div>
                      </div>
                    </div>

                    <!-- (d) 時間序列圖 -->
                    <div class="col-12 mb-3">
                      <div class="plot-card">
                        <h6 class="plot-title">(d) 聚類時間序列</h6>
                        <div ref="mstdbscanTimeSeriesChart" class="plot-container"></div>
                      </div>
                    </div>
                  </div>

                  <!-- 無圖表數據提示 -->
                  <div v-else class="text-muted small text-center p-3">
                    圖表數據尚未生成。請確保已完成 MSTDBSCAN 分析並檢測到聚類。
                  </div>
                </div>
              </template>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- 📭 無可見圖層的空狀態 -->
    <div v-else class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="my-title-md-gray p-3">沒有開啟的圖層</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* PySDA 圖表現在使用與 Moran Plot 相同的樣式 */
  /* 🎨 空間滯後值開關樣式 (Spatial Lag Switch Styles) */
  /* 與 LayersTab 開關樣式保持一致 */

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

  .cursor-pointer {
    cursor: pointer;
  }

  /* 📊 Moran Plot 相關樣式 */
  .plot-card {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 12px;
    height: 100%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .plot-title {
    text-align: center;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #333;
  }

  .plot-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 280px;
    width: 100%;
  }

  /* 響應式設計 */
  @media (max-width: 768px) {
    .plot-container {
      min-height: 220px;
    }

    .plot-card {
      margin-bottom: 16px;
    }
  }

  @media (max-width: 576px) {
    .plot-container {
      min-height: 200px;
    }
  }
</style>
