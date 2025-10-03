<script setup>
  import { ref, computed, defineEmits, onMounted, watch } from 'vue';
  import { useDataStore } from '@/stores/dataStore.js';

  const emit = defineEmits(['highlight-on-map', 'feature-selected']);

  const dataStore = useDataStore();

  const activeLayerTab = ref(null); /** 📑 當前作用中的圖層分頁 */
  const layerSortStates = ref({}); /** 📊 每個圖層的排序狀態 */

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
   * 根據圖層的所有資料，動態獲取所有適合顯示在表格中的欄位名稱
   * @param {object} layer - 圖層物件
   * @returns {string[]} - 一個包含所有欄位名稱的字串陣列
   */
  const getLayerColumns = (layer) => {
    // 使用原始資料而不是排序後的資料，避免因排序影響欄位偵測
    const data = layer.tableData;

    // 如果沒有資料或資料為空，返回一個空陣列
    if (!data || data.length === 0) {
      return [];
    }

    // 收集所有資料項目中出現的欄位名稱
    const allKeys = new Set();

    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        const value = item[key];
        // 保留基本欄位：color, name, nodes
        if (key === 'color' || key === 'name' || key === 'nodes') {
          allKeys.add(key);
        }
        // 只保留值不是物件，或值雖是物件但為 null 的鍵
        else if (typeof value !== 'object' || value === null) {
          allKeys.add(key);
        }
      });
    });

    return Array.from(allKeys);
  };

  /**
   * 📊 取得圖層資料數量 (Get Layer Data Count)
   * @param {Object} layer - 圖層物件
   * @returns {number} 資料數量
   */
  const getLayerDataCount = (layer) => {
    const count = layer.tableData?.length || 0;
    console.log('DataTable - Layer data count:', {
      layerId: layer.layerId,
      layerName: layer.layerName,
      hasTableData: !!layer.tableData,
      dataCount: count,
      sampleData: layer.tableData?.[0] || null,
    });
    return count;
  };

  /**
   * 📊 取得排序後的資料 (Get Sorted Data)
   * @param {Object} layer - 圖層物件
   * @returns {Array} 排序後的資料陣列
   */
  const getSortedData = (layer) => {
    if (!layer.tableData) return [];

    const sortState = layerSortStates.value[layer.layerId];
    if (!sortState || !sortState.key) {
      return layer.tableData;
    }

    return [...layer.tableData].sort((a, b) => {
      const aValue = a[sortState.key];
      const bValue = b[sortState.key];

      // 定義應該按數值排序的欄位（即使它們被儲存為字串）
      const numericFields = ['count', 'spatial_lag', '#', 'P_CNT', '感染率(%)'];

      // 如果是數值欄位，強制轉換為數值進行排序
      if (numericFields.includes(sortState.key)) {
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return sortState.order === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // 字串類型的比較
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // 一般數值類型的比較
      return sortState.order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  /**
   * 📊 處理排序點擊 (Handle Sort Click)
   * @param {string} layerId - 圖層 ID
   * @param {string} key - 排序欄位
   */
  const handleSort = (layerId, key) => {
    if (!layerSortStates.value[layerId]) {
      layerSortStates.value[layerId] = { key: null, order: 'asc' };
    }

    const sortState = layerSortStates.value[layerId];

    if (sortState.key === key) {
      // 切換排序方向
      sortState.order = sortState.order === 'asc' ? 'desc' : 'asc';
    } else {
      // 設定新的排序欄位
      sortState.key = key;
      sortState.order = 'asc';
    }
  };

  /**
   * 🎨 取得排序圖示 (Get Sort Icon)
   * @param {string} layerId - 圖層 ID
   * @param {string} key - 欄位名稱
   * @returns {string} FontAwesome 圖示類別
   */
  const getSortIcon = (layerId, key) => {
    const sortState = layerSortStates.value[layerId];
    if (!sortState || sortState.key !== key) {
      return 'fas fa-sort';
    }
    return sortState.order === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  /**
   * 🎯 處理項目點擊 (Handle Item Click)
   * @param {Object} item - 點擊的項目
   * @param {Object} layer - 圖層物件
   */
  const handleItemClick = (item, layer) => {
    console.log('點擊項目:', { item, layer: layer.layerName });

    // 創建符合 PropertiesTab 期望的 feature 格式
    const feature = {
      properties: {
        id: item['#'] || item.id || 'unknown',
        layerId: layer.layerId,
        propertyData: { ...item },
        itemColor: item.color || '#6c757d',
      },
    };

    console.log('設置 selectedFeature:', feature);
    dataStore.setSelectedFeature(feature);

    // 觸發 feature-selected 事件，讓 HomeView 自動切換到屬性標籤
    emit('feature-selected', feature);
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
    console.log('[DataTableTab] Component Mounted');

    // 初始化第一個可見圖層為作用中分頁
    if (visibleLayers.value.length > 0 && !activeLayerTab.value) {
      activeLayerTab.value = visibleLayers.value[0].layerId;
    }
  });
</script>

<template>
  <!-- 📊 多圖層資料表格分頁組件 -->
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
            <span class="my-title-sm-black">
              <span v-if="getLayerFullTitle(layer).groupName" class="my-title-xs-gray"
                >{{ getLayerFullTitle(layer).groupName }} -
              </span>
              <span>{{ getLayerFullTitle(layer).layerName }}</span>
              <span class="my-content-xs-gray ms-2" v-if="getLayerDataCount(layer)">
                {{ getLayerDataCount(layer) }}
              </span>
            </span>
          </div>
          <div class="w-100" :class="`my-bgcolor-${layer.colorName}`" style="min-height: 4px"></div>
        </li>
      </ul>
    </div>

    <!-- 📋 圖層表格內容區域 -->
    <div v-if="visibleLayers.length > 0" class="flex-grow-1 overflow-hidden">
      <div
        v-for="layer in visibleLayers"
        :key="layer.layerId"
        v-show="activeLayerTab === layer.layerId"
        class="h-100"
      >
        <div class="h-100 d-flex flex-column">
          <div class="flex-grow-1 overflow-auto">
            <table class="table w-100 mb-0">
              <thead class="sticky-top my-table-thead">
                <tr class="text-center text-nowrap">
                  <template v-for="column in getLayerColumns(layer)" :key="column">
                    <th
                      v-if="!column.endsWith('_color')"
                      @click="handleSort(layer.layerId, column)"
                      class="my-bgcolor-white-hover p-1 my-cursor-pointer"
                    >
                      <span class="my-title-xs-gray text-nowrap">
                        {{ column === 'nodes' ? '節點數' : column }}
                      </span>
                      <span class="my-title-xs-gray text-nowrap ms-2">
                        <i :class="getSortIcon(layer.layerId, column)"></i>
                      </span>
                    </th>
                  </template>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in getSortedData(layer)"
                  :key="item.id"
                  class="my-table-tr-hover text-center text-nowrap border-bottom my-cursor-pointer"
                  @click="handleItemClick(item, layer)"
                >
                  <template v-for="column in getLayerColumns(layer)" :key="column">
                    <td
                      v-if="!column.endsWith('_color')"
                      class="border-0 text-nowrap text-truncate p-0"
                      style="max-width: 80px"
                    >
                      <!-- 特殊處理：color 欄位顯示顏色圓點 -->
                      <div
                        v-if="column === 'color'"
                        class="d-flex align-items-center justify-content-center px-3 py-2"
                      >
                        <div
                          class="rounded-circle me-2"
                          style="width: 12px; height: 12px; flex-shrink: 0"
                          :style="{
                            backgroundColor: item[column],
                          }"
                          :title="item[column]"
                        ></div>
                        <div class="my-content-xs-black">
                          {{ item[column] || '-' }}
                        </div>
                      </div>
                      <!-- 特殊處理：nodes 欄位顯示節點數量 -->
                      <div v-else-if="column === 'nodes'" class="my-content-xs-black px-3 py-2">
                        {{ Array.isArray(item[column]) ? item[column].length : '-' }}
                      </div>
                      <!-- 特殊處理：name 欄位 -->
                      <div v-else-if="column === 'name'" class="my-content-xs-black px-3 py-2">
                        {{ item[column] || '-' }}
                      </div>
                      <div v-else-if="column === '#'" class="d-flex p-0">
                        <div
                          style="min-width: 6px"
                          :style="{
                            backgroundColor: item['color'],
                          }"
                        ></div>
                        <div class="my-content-xs-black w-100 px-3 py-2">
                          {{ item[column] || '-' }}
                        </div>
                      </div>
                      <!-- 特殊處理：spatial_lag 欄位顯示顏色圓點在數字前面 -->
                      <div
                        v-else-if="column === 'spatial_lag'"
                        class="d-flex align-items-center justify-content-center px-3 py-2"
                      >
                        <div
                          v-if="item['spatial_lag_color']"
                          class="rounded-circle me-2"
                          style="width: 12px; height: 12px; flex-shrink: 0"
                          :style="{
                            backgroundColor: item['spatial_lag_color'],
                          }"
                          :title="item['spatial_lag_color']"
                        ></div>
                        <div class="my-content-xs-black">
                          {{
                            typeof item[column] === 'number'
                              ? item[column].toFixed(2)
                              : item[column] || '-'
                          }}
                        </div>
                      </div>
                      <!-- 特殊處理：binaryValue 欄位顯示顏色圓點在數字前面 -->
                      <div
                        v-else-if="column === 'binaryValue'"
                        class="d-flex align-items-center justify-content-center px-3 py-2"
                      >
                        <div
                          v-if="item['joinCounts_color']"
                          class="rounded-circle me-2"
                          style="width: 12px; height: 12px; flex-shrink: 0"
                          :style="{
                            backgroundColor: item['joinCounts_color'],
                          }"
                          :title="item['joinCounts_color']"
                        ></div>
                        <div class="my-content-xs-black">
                          {{ item[column] }}
                        </div>
                      </div>
                      <!-- 特殊處理：count 欄位顯示顏色圓點在數字前面 -->
                      <div
                        v-else-if="column === 'count'"
                        class="d-flex align-items-center justify-content-center px-3 py-2"
                      >
                        <div
                          v-if="item['color']"
                          class="rounded-circle me-2"
                          style="width: 12px; height: 12px; flex-shrink: 0"
                          :style="{
                            backgroundColor: item['color'],
                          }"
                          :title="item['color']"
                        ></div>
                        <div class="my-content-xs-black">
                          {{ item[column] }}
                        </div>
                      </div>
                      <!-- 特殊處理：感染率(%) 欄位顯示顏色圓點在數字前面 -->
                      <div
                        v-else-if="column === '感染率(%)'"
                        class="d-flex align-items-center justify-content-center px-3 py-2"
                      >
                        <div
                          v-if="item['infection_rate_color']"
                          class="rounded-circle me-2"
                          style="width: 12px; height: 12px; flex-shrink: 0"
                          :style="{
                            backgroundColor: item['infection_rate_color'],
                          }"
                          :title="item['infection_rate_color']"
                        ></div>
                        <div class="my-content-xs-black">
                          {{ item[column] || '-' }}
                        </div>
                      </div>
                      <div v-else class="my-content-xs-black px-3 py-2">
                        {{ item[column] || '-' }}
                      </div>
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 📭 無開啟圖層的空狀態 -->
    <div v-else class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="my-title-md-gray p-3">沒有開啟的圖層</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .my-table-thead {
    border-bottom: 2px solid var(--my-color-gray-300) !important;
  }
</style>
