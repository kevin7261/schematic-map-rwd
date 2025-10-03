<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useDataStore } from '@/stores/dataStore.js';

  const dataStore = useDataStore();

  const activeLayerTab = ref(null); /** 📑 當前作用中的圖層分頁 */
  const analysisResults = ref(null); /** 📊 分析結果 */
  const isLoadingAnalysis = ref(false); /** 🔄 分析載入狀態 */

  // 獲取所有開啟且有資料的圖層
  const visibleLayers = computed(() => {
    const allLayers = dataStore.getAllLayers();
    return allLayers.filter((layer) => layer.visible);
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

  // 記錄上一次的圖層列表用於比較
  const previousLayers = ref([]);

  /**
   * 👀 監聽可見圖層變化，自動切換到新開啟的圖層分頁並執行分析
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
   * 👀 監聽當前選中的圖層變化，自動執行分析
   */
  watch(
    () => activeLayerTab.value,
    (newLayerId) => {
      if (newLayerId) {
        const layer = dataStore.findLayerById(newLayerId);
        if (layer && layer.geoJsonData) {
          performSpatialAnalysis(layer);
        }
      } else {
        analysisResults.value = null;
      }
    },
    { immediate: true }
  );

  /**
   * 📊 執行空間分析 (Perform Spatial Analysis)
   * @param {Object} layer - 要分析的圖層
   */
  const performSpatialAnalysis = async (layer) => {
    if (!layer || !layer.geoJsonData) {
      console.warn('無法執行分析：圖層數據不存在');
      return;
    }

    isLoadingAnalysis.value = true;

    try {
      // 模擬分析過程（實際應用中這裡會是真正的空間分析算法）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const features = layer.geoJsonData.features;

      // 基本統計分析
      const stats = {
        totalFeatures: features.length,
        totalPopulation: features.reduce((sum, f) => sum + (f.properties.population || 0), 0),
        totalCount: features.reduce((sum, f) => sum + (f.properties.count || 0), 0),
        avgPopulation: 0,
        avgCount: 0,
        categories: {},
        spatialDistribution: {
          north: 0,
          south: 0,
          east: 0,
          west: 0,
        },
      };

      // 計算平均值
      stats.avgPopulation = stats.totalPopulation / stats.totalFeatures;
      stats.avgCount = stats.totalCount / stats.totalFeatures;

      // 統計分類
      features.forEach((feature) => {
        const category = feature.properties.category || '未知';
        stats.categories[category] = (stats.categories[category] || 0) + 1;

        // 簡單的空間分布分析（基於經緯度）
        const [lon, lat] = feature.geometry.coordinates;
        if (lat > 24.5) stats.spatialDistribution.north++;
        else if (lat < 23.5) stats.spatialDistribution.south++;
        if (lon > 121) stats.spatialDistribution.east++;
        else if (lon < 120.5) stats.spatialDistribution.west++;
      });

      // 計算密度和變異係數
      const populationValues = features.map((f) => f.properties.population || 0);
      const countValues = features.map((f) => f.properties.count || 0);

      const populationStd = Math.sqrt(
        populationValues.reduce((sum, val) => sum + Math.pow(val - stats.avgPopulation, 2), 0) /
          populationValues.length
      );
      const countStd = Math.sqrt(
        countValues.reduce((sum, val) => sum + Math.pow(val - stats.avgCount, 2), 0) /
          countValues.length
      );

      stats.coefficientOfVariation = {
        population: populationStd / stats.avgPopulation,
        count: countStd / stats.avgCount,
      };

      // 空間聚集分析（簡化版）
      const distances = [];
      for (let i = 0; i < features.length; i++) {
        for (let j = i + 1; j < features.length; j++) {
          const [lon1, lat1] = features[i].geometry.coordinates;
          const [lon2, lat2] = features[j].geometry.coordinates;
          const distance = Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));
          distances.push(distance);
        }
      }

      stats.spatialClustering = {
        avgDistance: distances.reduce((sum, d) => sum + d, 0) / distances.length,
        minDistance: Math.min(...distances),
        maxDistance: Math.max(...distances),
      };

      analysisResults.value = {
        layerName: layer.layerName,
        timestamp: new Date().toLocaleString(),
        statistics: stats,
        features: features.map((f) => ({
          name: f.properties.name,
          population: f.properties.population,
          count: f.properties.count,
          category: f.properties.category,
          coordinates: f.geometry.coordinates,
        })),
      };

      console.log('空間分析完成:', analysisResults.value);
    } catch (error) {
      console.error('空間分析失敗:', error);
      analysisResults.value = {
        error: '分析過程中發生錯誤',
        details: error.message,
      };
    } finally {
      isLoadingAnalysis.value = false;
    }
  };

  /**
   * 🚀 組件掛載事件 (Component Mounted Event)
   */
  onMounted(() => {
    // 初始化第一個可見圖層為作用中分頁
    if (visibleLayers.value.length > 0 && !activeLayerTab.value) {
      activeLayerTab.value = visibleLayers.value[0].layerId;
    }
  });
</script>

<template>
  <!-- 📊 空間分析分頁視圖組件 -->
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
          <!-- 分析狀態區域 -->
          <div v-if="isLoadingAnalysis" class="pb-2">
            <div class="my-title-xs-gray pb-1">分析狀態</div>
            <div class="my-content-sm-black pb-1">
              <i class="fas fa-spinner fa-spin me-2"></i>
              正在分析圖層數據...
            </div>
          </div>

          <!-- 分析結果顯示區域 -->
          <template v-if="analysisResults && !analysisResults.error">
            <!-- 只顯示總要素數 -->
            <div class="pb-2">
              <div class="my-title-xs-gray pb-1">總要素數</div>
              <div class="my-content-sm-black pb-1">
                {{ analysisResults.statistics.totalFeatures }}
              </div>
            </div>
          </template>

          <!-- 錯誤顯示 -->
          <div v-else-if="analysisResults && analysisResults.error" class="pb-2">
            <div class="my-title-xs-gray pb-1">分析錯誤</div>
            <div class="my-content-sm-black pb-1">{{ analysisResults.error }}</div>
            <div v-if="analysisResults.details" class="my-content-xs-gray pb-1">
              詳細信息：{{ analysisResults.details }}
            </div>
          </div>

          <!-- 初始狀態 -->
          <div v-else-if="!isLoadingAnalysis" class="pb-2">
            <div class="my-title-xs-gray pb-1">分析狀態</div>
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
