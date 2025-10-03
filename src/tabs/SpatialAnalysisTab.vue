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

  /**
   * 📊 取得當前圖層的項目數量 (Get Current Layer Item Count)
   */
  const getCurrentLayerItemCount = () => {
    if (!activeLayerTab.value) return 0;
    const currentLayer = visibleLayers.value.find(
      (layer) => layer.layerId === activeLayerTab.value
    );
    if (!currentLayer || !currentLayer.tableData) return 0;
    return currentLayer.tableData.length;
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
          loadLayerInfo(layer);
        }
      } else {
        analysisResults.value = null;
      }
    },
    { immediate: true }
  );

  /**
   * 📊 載入圖層基本資訊 (Load Layer Basic Information)
   * @param {Object} layer - 要載入的圖層
   */
  const loadLayerInfo = async (layer) => {
    if (!layer || !layer.geoJsonData) {
      console.warn('無法載入資訊：圖層數據不存在');
      return;
    }

    isLoadingAnalysis.value = true;

    try {
      // 模擬載入過程
      await new Promise((resolve) => setTimeout(resolve, 500));

      const features = layer.geoJsonData.features;

      // 基本統計資訊
      const stats = {
        totalFeatures: features.length,
        totalPopulation: features.reduce((sum, f) => sum + (f.properties.P_CNT || 0), 0),
        totalCount: features.reduce((sum, f) => sum + (f.properties.count || 0), 0),
        avgPopulation: 0,
        avgCount: 0,
      };

      // 計算平均值
      if (stats.totalFeatures > 0) {
        stats.avgPopulation = stats.totalPopulation / stats.totalFeatures;
        stats.avgCount = stats.totalCount / stats.totalFeatures;
      }

      analysisResults.value = {
        layerName: layer.layerName,
        timestamp: new Date().toLocaleString(),
        statistics: stats,
      };

      console.log('圖層資訊載入完成:', analysisResults.value);
    } catch (error) {
      console.error('載入圖層資訊失敗:', error);
      analysisResults.value = {
        error: '載入過程中發生錯誤',
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
              <i class="fas fa-spinner fa-spin me-2"></i>
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
