<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useDataStore } from '@/stores/dataStore.js';
  import { createCopyFunction } from '@/utils/utils.js';

  const dataStore = useDataStore();

  const activeLayerTab = ref(null); /** 📑 當前作用中的圖層分頁 */
  const copySuccessMessage = ref(''); /** 📋 複製成功訊息 */

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
   * 📊 取得當前選中圖層名稱 (Get Current Selected Layer Name)
   */
  const currentLayerName = computed(() => {
    if (!activeLayerTab.value) return '無開啟圖層';
    const layer = visibleLayers.value.find((l) => l.layerId === activeLayerTab.value);
    return layer ? layer.layerName || '未知圖層' : '無開啟圖層';
  });

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
   * 📊 取得當前圖層的 drawJsonData (Get Current Layer Draw JSON Data)
   */
  const getCurrentLayerDrawJsonData = () => {
    if (!activeLayerTab.value) return null;
    const currentLayer = visibleLayers.value.find(
      (layer) => layer.layerId === activeLayerTab.value
    );
    return currentLayer ? currentLayer.drawJsonData || null : null;
  };

  // 記錄上一次的圖層列表用於比較
  const previousLayers = ref([]);

  /**
   * 👀 監聽可見圖層變化，自動切換到新開啟的圖層分頁
   */
  watch(
    () => visibleLayers.value,
    (newLayers) => {
      // 如果沒有可見圖層，清除選中的分頁
      if (newLayers.length === 0) {
        activeLayerTab.value = null;
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
   * 📋 複製 JSON 數據到剪貼簿 (Copy JSON Data to Clipboard)
   * 使用 utils 中的通用複製功能
   */
  const copyJsonToClipboard = createCopyFunction({ copySuccessMessage }, 'copySuccessMessage', {
    successMessage: '✅ JSON 數據已複製到剪貼簿',
    errorMessage: '❌ 複製失敗，請手動複製',
    clearDelay: 3000,
  });

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
  <!-- 📊 繪製 JSON 數據視圖組件 -->
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
    <div v-if="visibleLayers.length > 0" class="flex-grow-1 overflow-auto my-bgcolor-white p-3">
      <!-- 📊 當前圖層資訊 -->
      <div class="mb-4">
        <h5 class="my-title-md-black">{{ currentLayerName }}</h5>
      </div>

      <!-- 📊 繪製 JSON 數據 -->
      <div v-if="getCurrentLayerDrawJsonData()">
        <!-- 📋 複製按鈕和狀態訊息 -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">繪製 JSON 數據</h6>
          <div class="d-flex align-items-center gap-2">
            <button
              @click="copyJsonToClipboard(getCurrentLayerDrawJsonData())"
              class="btn rounded-circle border-0 d-flex align-items-center justify-content-center my-btn-transparent my-font-size-xs"
              :disabled="!getCurrentLayerDrawJsonData()"
              title="複製 JSON 數據"
            >
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- 📋 複製狀態訊息 -->
        <div
          v-if="copySuccessMessage"
          class="alert alert-sm mb-3"
          :class="{
            'alert-success': copySuccessMessage.includes('✅'),
            'alert-danger': copySuccessMessage.includes('❌'),
          }"
          style="padding: 0.5rem 0.75rem; font-size: 0.875rem"
        >
          {{ copySuccessMessage }}
        </div>

        <div class="rounded-4 my-bgcolor-gray-100 p-4 mb-3">
          <pre
            class="my-font-size-sm"
            style="
              white-space: pre-wrap;
              word-wrap: break-word;
              max-height: 500px;
              overflow-y: auto;
            "
            >{{ JSON.stringify(getCurrentLayerDrawJsonData(), null, 2) }}</pre
          >
        </div>
      </div>
      <div v-else class="text-center py-5">
        <div class="my-title-md-gray">此圖層沒有可用的繪製 JSON 數據</div>
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
