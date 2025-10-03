<script setup>
  import { ref, onMounted } from 'vue';
  import { useDataStore } from '../stores/dataStore';

  const dataStore = ref([]); /** 📊 地鐵線路數據 */
  const sortState = ref({ key: null, order: 'asc' }); /** 📊 排序狀態 */

  // 取得 Pinia store 實例
  const piniaDataStore = useDataStore();

  /**
   * 📊 取得表格欄位名稱 (Get Table Columns)
   * @returns {string[]} - 欄位名稱陣列
   */
  const getColumns = () => {
    if (!dataStore.value || dataStore.value.length === 0) {
      return [];
    }

    const allKeys = new Set();
    dataStore.value.forEach((item) => {
      Object.keys(item).forEach((key) => {
        const value = item[key];
        if (key === 'nodes') {
          allKeys.add('節點數量');
        } else if (typeof value !== 'object' || value === null) {
          allKeys.add(key);
        }
      });
    });

    return Array.from(allKeys);
  };

  /**
   * 📊 取得排序後的資料 (Get Sorted Data)
   * @returns {Array} 排序後的資料陣列
   */
  const getSortedData = () => {
    if (!dataStore.value || dataStore.value.length === 0) return [];

    if (!sortState.value.key) {
      return dataStore.value;
    }

    return [...dataStore.value].sort((a, b) => {
      const aValue = a[sortState.value.key];
      const bValue = b[sortState.value.key];

      // 對於節點數量，需要特殊處理
      if (sortState.value.key === '節點數量') {
        const aCount = a.nodes ? a.nodes.length : 0;
        const bCount = b.nodes ? b.nodes.length : 0;
        return sortState.value.order === 'asc' ? aCount - bCount : bCount - aCount;
      }

      // 字串類型的比較
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.value.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // 一般數值類型的比較
      return sortState.value.order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  /**
   * 📊 處理排序點擊 (Handle Sort Click)
   * @param {string} key - 排序欄位
   */
  const handleSort = (key) => {
    if (sortState.value.key === key) {
      // 切換排序方向
      sortState.value.order = sortState.value.order === 'asc' ? 'desc' : 'asc';
    } else {
      // 設定新的排序欄位
      sortState.value.key = key;
      sortState.value.order = 'asc';
    }
  };

  /**
   * 🎨 取得排序圖示 (Get Sort Icon)
   * @param {string} key - 欄位名稱
   * @returns {string} FontAwesome 圖示類別
   */
  const getSortIcon = (key) => {
    if (!sortState.value || sortState.value.key !== key) {
      return 'fas fa-sort';
    }
    return sortState.value.order === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  /**
   * 🎨 為項目分配顏色 (Assign Color to Item)
   * @param {Object} item - 項目對象
   * @param {number} index - 項目索引
   * @returns {string} 顏色值
   */
  const getItemColor = (item, index) => {
    // 如果項目本身有顏色，使用項目的顏色
    if (item.color) {
      return item.color;
    }

    // 根據分類分配顏色
    const categoryColors = {
      主要城市: '#e74c3c', // 紅色
      歷史城市: '#3498db', // 藍色
      港口城市: '#2ecc71', // 綠色
      工業城市: '#f39c12', // 橙色
      農業城市: '#9b59b6', // 紫色
    };

    if (item.category && categoryColors[item.category]) {
      return categoryColors[item.category];
    }

    // 如果沒有分類，根據索引分配預設顏色
    const defaultColors = [
      '#e74c3c',
      '#3498db',
      '#2ecc71',
      '#f39c12',
      '#9b59b6',
      '#1abc9c',
      '#34495e',
      '#e67e22',
    ];
    return defaultColors[index % defaultColors.length];
  };

  /**
   * 🎯 處理項目點擊 (Handle Item Click)
   * @param {Object} item - 點擊的項目
   */
  const handleItemClick = (item) => {
    console.log('點擊項目:', item);

    // 為項目分配顏色
    const itemIndex = dataStore.value.findIndex((i) => i === item);
    const itemColor = getItemColor(item, itemIndex);

    // 創建符合 PropertiesTab 期望的 feature 格式
    const feature = {
      properties: {
        id: item.id || item.name || 'unknown',
        layerId: 'datatable', // 標識這是來自 DataTable 的數據
        propertyData: { ...item, color: itemColor }, // 將整個 item 作為屬性數據，並添加顏色
        itemColor: itemColor, // 單獨存儲顏色供PropertiesTab使用
      },
    };

    console.log('設置 selectedFeature:', feature);
    piniaDataStore.setSelectedFeature(feature);
  };

  /**
   * 📥 載入數據 (Load Data)
   */
  const loadData = async () => {
    try {
      const response = await fetch('/schematic-map-rwd/data/data.json');
      const data = await response.json();
      dataStore.value = data;
      console.log('載入地鐵數據:', data.length, '條線路');
    } catch (error) {
      console.error('載入數據失敗:', error);
    }
  };

  /**
   * 🚀 組件掛載事件 (Component Mounted Event)
   */
  onMounted(() => {
    console.log('[DataTableTab] Component Mounted');
    loadData();
  });
</script>

<template>
  <!-- 📊 地鐵線路資料表格組件 -->
  <div class="d-flex flex-column my-bgcolor-gray-200 h-100">
    <!-- 📋 表格內容區域 -->
    <div v-if="dataStore.length > 0" class="flex-grow-1 overflow-hidden">
      <div class="h-100 d-flex flex-column">
        <div class="flex-grow-1 overflow-auto">
          <table class="table w-100 mb-0">
            <thead class="sticky-top my-table-thead">
              <tr class="text-center text-nowrap">
                <template v-for="column in getColumns()" :key="column">
                  <th
                    v-if="!column.endsWith('_color')"
                    @click="handleSort(column)"
                    class="my-bgcolor-white-hover p-1 my-cursor-pointer"
                  >
                    <span class="my-title-xs-gray text-nowrap">
                      {{ column }}
                    </span>
                    <span class="my-title-xs-gray text-nowrap ms-2">
                      <i :class="getSortIcon(column)"></i>
                    </span>
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in getSortedData()"
                :key="index"
                class="my-table-tr-hover text-center text-nowrap border-bottom my-cursor-pointer"
                @click="handleItemClick(item)"
              >
                <template v-for="column in getColumns()" :key="column">
                  <td
                    v-if="!column.endsWith('_color')"
                    class="border-0 text-nowrap text-truncate p-0"
                    style="max-width: 80px"
                  >
                    <div v-if="column === 'color'" class="d-flex p-0">
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
                    <!-- 處理節點數量 -->
                    <div v-else-if="column === '節點數量'" class="my-content-xs-black px-3 py-2">
                      {{ item.nodes ? item.nodes.length : 0 }}
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

      <!-- 🔍 調試信息 -->
      <div class="border-top p-2 bg-light">
        <small class="text-muted"
          >Debug: selectedFeature = {{ piniaDataStore.selectedFeature ? '有值' : 'null' }}</small
        >
      </div>
    </div>

    <!-- 📭 無數據的空狀態 -->
    <div v-else class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="my-title-md-gray p-3">載入中...</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .my-table-thead {
    border-bottom: 2px solid var(--my-color-gray-300) !important;
  }
</style>
