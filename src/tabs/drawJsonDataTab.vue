<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useDataStore } from '@/stores/dataStore.js';

  const dataStore = useDataStore();

  const activeLayerTab = ref(null); /** 📑 當前作用中的圖層分頁 */

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
   * 📊 取得當前圖層的繪製數據 (Get Current Layer Draw Data)
   */
  const currentLayerDrawData = computed(() => {
    if (!activeLayerTab.value) return null;
    const layer = visibleLayers.value.find((l) => l.layerId === activeLayerTab.value);
    return layer ? layer.drawJsonData || null : null;
  });

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
        console.log(
          `🔄 自動切換到新開啟的圖層: ${newLayers.find((layer) => layer.layerId === newestAddedLayerId)?.layerName}`
        );
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
   * 🚀 組件掛載事件 (Component Mounted Event)
   */
  onMounted(() => {
    console.log('[DrawJsonDataTab] Component Mounted');

    // 初始化第一個可見圖層為作用中分頁
    if (visibleLayers.value.length > 0 && !activeLayerTab.value) {
      activeLayerTab.value = visibleLayers.value[0].layerId;
    }
  });
</script>

<template>
  <!-- 📊 多圖層繪製數據視圖組件 -->
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
      <!-- 當前圖層標題 -->
      <div class="p-3 border-bottom">
        <div class="my-title-sm-black">
          {{
            getLayerFullTitle(visibleLayers.find((l) => l.layerId === activeLayerTab))?.groupName
          }}
          -
          {{
            getLayerFullTitle(visibleLayers.find((l) => l.layerId === activeLayerTab))?.layerName
          }}
        </div>
      </div>

      <!-- 繪製數據內容 -->
      <div v-if="currentLayerDrawData" class="p-3 h-100 overflow-auto">
        <div class="mb-3">
          <div class="my-title-xs-gray pb-2">繪製數據類型</div>
          <div class="my-content-sm-black pb-2">
            <span class="badge bg-primary">{{ currentLayerDrawData.type }}</span>
          </div>
        </div>

        <!-- 網格示意圖數據 -->
        <div v-if="currentLayerDrawData.type === 'grid'" class="mb-3">
          <div class="my-title-xs-gray pb-2">網格配置</div>
          <div class="my-content-sm-black pb-2">
            <div>網格尺寸: {{ currentLayerDrawData.gridX }} × {{ currentLayerDrawData.gridY }}</div>
            <div>總節點數: {{ currentLayerDrawData.totalNodes }}</div>
            <div>總連線數: {{ currentLayerDrawData.totalLinks }}</div>
          </div>
        </div>

        <!-- 台北捷運數據 -->
        <div v-if="currentLayerDrawData.type === 'metro'" class="mb-3">
          <div class="my-title-xs-gray pb-2">捷運配置</div>
          <div class="my-content-sm-black pb-2">
            <div>總路線數: {{ currentLayerDrawData.totalLines }}</div>
            <div>總節點數: {{ currentLayerDrawData.totalNodes }}</div>
            <div>總連線數: {{ currentLayerDrawData.totalLinks }}</div>
          </div>

          <!-- 路線列表 -->
          <div class="my-title-xs-gray pb-2">路線列表</div>
          <div class="my-content-sm-black pb-2">
            <div v-for="line in currentLayerDrawData.lines" :key="line.name" class="mb-1">
              <span class="badge me-2" :style="{ backgroundColor: line.color }">{{
                line.name
              }}</span>
              <span class="text-muted">({{ line.nodeCount }} 個節點)</span>
            </div>
          </div>
        </div>

        <!-- 節點數據預覽 -->
        <div class="mb-3">
          <div class="my-title-xs-gray pb-2">節點數據預覽 (前10個)</div>
          <div class="my-content-sm-black pb-2">
            <pre
              class="bg-light p-2 rounded"
              style="font-size: 0.8rem; max-height: 200px; overflow-y: auto"
              >{{ JSON.stringify(currentLayerDrawData.nodes?.slice(0, 10), null, 2) }}</pre
            >
          </div>
        </div>

        <!-- 連線數據預覽 -->
        <div class="mb-3">
          <div class="my-title-xs-gray pb-2">連線數據預覽 (前10個)</div>
          <div class="my-content-sm-black pb-2">
            <pre
              class="bg-light p-2 rounded"
              style="font-size: 0.8rem; max-height: 200px; overflow-y: auto"
              >{{ JSON.stringify(currentLayerDrawData.links?.slice(0, 10), null, 2) }}</pre
            >
          </div>
        </div>

        <!-- 完整數據下載 -->
        <div class="mb-3">
          <div class="my-title-xs-gray pb-2">完整數據</div>
          <div class="my-content-sm-black pb-2">
            <button
              class="btn btn-sm btn-outline-primary"
              @click="
                () => {
                  const dataStr = JSON.stringify(currentLayerDrawData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${currentLayerName}_drawData.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }
              "
            >
              下載完整繪製數據
            </button>
          </div>
        </div>
      </div>

      <!-- 無繪製數據時 -->
      <div v-else class="p-3 h-100 d-flex align-items-center justify-content-center">
        <div class="text-center">
          <div class="my-title-sm-gray mb-2">無繪製數據</div>
          <div class="my-content-xs-gray">當前圖層尚未生成繪製數據</div>
        </div>
      </div>
    </div>

    <!-- 無開啟圖層時的內容 -->
    <div v-else class="my-bgcolor-white h-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="my-title-sm-gray mb-2">無開啟圖層</div>
        <div class="my-content-xs-gray">請先開啟圖層以查看繪製數據</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .nav-tabs .nav-link.active {
    background-color: #f8f9fa;
    border-color: #dee2e6 #dee2e6 #f8f9fa;
  }

  .nav-tabs .nav-link {
    color: #495057;
    border: 1px solid transparent;
  }

  .nav-tabs .nav-link:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
