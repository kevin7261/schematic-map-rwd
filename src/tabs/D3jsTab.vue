<script setup>
  /**
   * 📊 D3jsTab.vue - D3.js 數據視覺化分頁組件
   *
   * 功能說明：
   * 1. 📑 圖層分頁導航 - 顯示所有可見圖層的標籤頁
   * 2. 📊 當前圖層資訊 - 顯示選中圖層的名稱和詳細信息
   * 3. 📈 圖層摘要資料 - 顯示總數量、行政區數量等統計信息
   * 4. 🎨 D3.js 圖表 - 使用 D3.js 繪製各種類型的圖表
   * 5. 🔄 自動切換功能 - 當新圖層開啟時自動切換到該圖層的分頁
   *
   * @component D3jsTab
   * @version 1.0.0
   * @author Kevin Cheng
   */

  import { ref, computed, watch, onMounted, nextTick } from 'vue';
  import { useDataStore } from '@/stores/dataStore.js';
  import * as d3 from 'd3';

  const dataStore = useDataStore();

  const activeLayerTab = ref(null); /** 📑 當前作用中的圖層分頁 */
  const chartContainer = ref(null); /** 📊 圖表容器參考 */
  const currentChartType = ref('bar'); /** 📊 當前圖表類型 */
  const schematicData = ref(null); /** 📊 示意圖數據 */

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
   * 📊 當前圖層摘要 (Current Layer Summary)
   */
  const currentLayerSummary = computed(() => {
    if (!activeLayerTab.value) return null;
    const layer = visibleLayers.value.find((l) => l.layerId === activeLayerTab.value);
    return layer ? layer.summaryData || null : null;
  });

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
   * 📊 加載示意圖數據 (Load Schematic Data from data.json)
   */
  const loadSchematicData = async () => {
    try {
      const response = await fetch('/data/data.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const geoJsonData = await response.json();

      // 將 GeoJSON 數據轉換為符合 draw 程式碼格式的示意圖數據
      const paths = geoJsonData.features.map((feature) => {
        const properties = feature.properties;

        // 創建符合 draw 程式碼格式的節點數據
        const nodes = [];
        const stationCount = Math.min(properties.stationCount || 5, 8); // 限制最大站數

        // 根據路線類型創建不同的節點模式
        for (let i = 0; i < stationCount; i++) {
          let nodeX, nodeY, nodeType;

          // 根據路線類型創建不同的路徑模式
          if (properties.lineType === '主線') {
            // 主線：水平或垂直延伸
            nodeX = 2 + i;
            nodeY = 3 + Math.floor(i / 2);
            nodeType = i % 2 === 0 ? 1 : 2; // 交替水平/垂直
          } else if (properties.lineType === '支線') {
            // 支線：短距離連接
            nodeX = 1 + (i % 3);
            nodeY = 2 + Math.floor(i / 3);
            nodeType = (i % 4) + 1;
          } else {
            // 規劃中路線：曲線路徑
            nodeX = 5 + i;
            nodeY = 1 + Math.floor(i / 2);
            nodeType = (i % 8) + 1;
          }

          // 添加特殊節點類型（圓弧）
          if (i === 2 && properties.lineType === '主線') {
            nodeType = 12; // 圓弧類型
          } else if (i === 3 && properties.lineType === '支線') {
            nodeType = 21; // 圓弧類型
          }

          nodes.push({
            coord: { x: nodeX, y: nodeY },
            type: nodeType,
            value: Math.floor(Math.random() * 5) + 1,
          });
        }

        return {
          name: properties.name,
          color: getColorFromName(properties.color),
          nodes: nodes,
        };
      });

      schematicData.value = { paths };
    } catch (error) {
      // 如果載入失敗，使用預設數據
      initDefaultSchematicData();
    }
  };

  /**
   * 📊 將顏色名稱轉換為十六進制顏色代碼
   */
  const getColorFromName = (colorName) => {
    const colorMap = {
      red: '#ff6b6b',
      lightpink: '#ffb3ba',
      blue: '#4ecdc4',
      green: '#45b7d1',
      lightgreen: '#90ee90',
      orange: '#ffa500',
      brown: '#8b4513',
      yellow: '#ffff00',
      purple: '#800080',
      limegreen: '#32cd32',
      paleturquoise: '#afeeee',
    };
    return colorMap[colorName] || '#666666';
  };

  /**
   * 📊 初始化預設示意圖數據 (Initialize Default Schematic Data)
   */
  const initDefaultSchematicData = () => {
    // 創建示例示意圖數據
    schematicData.value = {
      paths: [
        {
          name: '路線A',
          color: '#ff6b6b',
          nodes: [
            { coord: { x: 2, y: 3 }, type: 1, value: 5 },
            { coord: { x: 3, y: 3 }, type: 2, value: 3 },
            { coord: { x: 3, y: 4 }, type: 3, value: 4 },
            { coord: { x: 4, y: 4 }, type: 4, value: 2 },
            { coord: { x: 4, y: 5 }, type: 1, value: 6 },
          ],
        },
        {
          name: '路線B',
          color: '#4ecdc4',
          nodes: [
            { coord: { x: 1, y: 2 }, type: 2, value: 3 },
            { coord: { x: 1, y: 3 }, type: 1, value: 4 },
            { coord: { x: 2, y: 3 }, type: 3, value: 2 },
            { coord: { x: 2, y: 4 }, type: 4, value: 5 },
          ],
        },
        {
          name: '路線C',
          color: '#45b7d1',
          nodes: [
            { coord: { x: 5, y: 1 }, type: 1, value: 4 },
            { coord: { x: 6, y: 1 }, type: 2, value: 3 },
            { coord: { x: 6, y: 2 }, type: 3, value: 2 },
            { coord: { x: 7, y: 2 }, type: 4, value: 6 },
          ],
        },
      ],
    };
  };

  /**
   * 📊 繪製示意圖 (Draw Schematic Diagram) - 簡化版本
   */
  const drawSchematicDiagram = async () => {
    if (!chartContainer.value) return;

    // 如果沒有示意圖數據，先加載
    if (!schematicData.value) {
      await loadSchematicData();
    }

    const nodeData = schematicData.value.paths;
    if (!nodeData) return;

    // 清除之前的圖表
    d3.select(chartContainer.value).selectAll('*').remove();

    // 設定圖表尺寸和邊距
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const containerWidth = chartContainer.value.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 400;

    // 獲取所有節點用於計算網格範圍
    const allPoints = nodeData.flatMap((d) =>
      d.nodes.map((node) => ({
        x: node.coord.x,
        y: node.coord.y,
      }))
    );

    // 找到點的最大最小值
    const xMax = Math.max(
      d3.max(allPoints, (d) => d.x),
      10
    );
    const yMax = Math.max(
      d3.max(allPoints, (d) => d.y),
      10
    );

    // 創建 SVG
    const svg = d3
      .select(chartContainer.value)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', '#212121');

    // 設定比例尺
    const x = d3.scaleLinear().domain([0, xMax]).range([0, width]);
    const y = d3.scaleLinear().domain([yMax, 0]).range([0, height]);

    // 繪製主要網格線
    for (let i = 0; i <= xMax; i++) {
      svg
        .append('line')
        .style('stroke', '#666666')
        .attr('x1', x(i))
        .attr('y1', 0)
        .attr('x2', x(i))
        .attr('y2', height);
    }

    for (let i = 0; i <= yMax; i++) {
      svg
        .append('line')
        .style('stroke', '#666666')
        .attr('x1', 0)
        .attr('y1', y(i))
        .attr('x2', width)
        .attr('y2', y(i));
    }

    // 繪製次要網格線
    for (let i = 0; i <= xMax; i++) {
      svg
        .append('line')
        .style('stroke', '#333333')
        .attr('x1', (x(i) + x(i + 1)) / 2)
        .attr('y1', 0)
        .attr('x2', (x(i) + x(i + 1)) / 2)
        .attr('y2', height);
    }

    for (let i = 0; i <= yMax; i++) {
      svg
        .append('line')
        .style('stroke', '#333333')
        .attr('x1', 0)
        .attr('y1', (y(i) + y(i + 1)) / 2)
        .attr('x2', width)
        .attr('y2', (y(i) + y(i + 1)) / 2);
    }

    // 創建線條生成器
    const lineGenerator = d3
      .line()
      .x((d) => x(d.x))
      .y((d) => y(d.y))
      .curve(d3.curveNatural);

    // 繪製每個路徑的節點連接
    nodeData.forEach((path) => {
      path.nodes.forEach((node) => {
        let dString = '';
        let nodes = [];

        // 根據節點類型繪製不同的連接線
        switch (node.type) {
          case 1:
            nodes = [
              { x: node.coord.x - 0.5, y: node.coord.y },
              { x: node.coord.x + 0.5, y: node.coord.y },
            ];
            dString = lineGenerator(nodes);
            break;
          case 2:
            nodes = [
              { x: node.coord.x, y: node.coord.y - 0.5 },
              { x: node.coord.x, y: node.coord.y + 0.5 },
            ];
            dString = lineGenerator(nodes);
            break;
          case 3:
            nodes = [
              { x: node.coord.x + 0.5, y: node.coord.y },
              { x: node.coord.x - 0.5, y: node.coord.y },
            ];
            dString = lineGenerator(nodes);
            break;
          case 4:
            nodes = [
              { x: node.coord.x, y: node.coord.y + 0.5 },
              { x: node.coord.x, y: node.coord.y - 0.5 },
            ];
            dString = lineGenerator(nodes);
            break;
          case 5:
            nodes = [
              { x: node.coord.x, y: node.coord.y },
              { x: node.coord.x - 0.5, y: node.coord.y },
            ];
            dString = lineGenerator(nodes);
            break;
          case 6:
            nodes = [
              { x: node.coord.x + 0.5, y: node.coord.y },
              { x: node.coord.x, y: node.coord.y },
            ];
            dString = lineGenerator(nodes);
            break;
          case 7:
            nodes = [
              { x: node.coord.x, y: node.coord.y + 0.5 },
              { x: node.coord.x, y: node.coord.y },
            ];
            dString = lineGenerator(nodes);
            break;
          case 8:
            nodes = [
              { x: node.coord.x, y: node.coord.y },
              { x: node.coord.x, y: node.coord.y - 0.5 },
            ];
            dString = lineGenerator(nodes);
            break;
          default:
            break;
        }

        if (dString !== '') {
          svg
            .append('path')
            .attr('d', dString)
            .attr('stroke', path.color)
            .attr('fill', 'none')
            .attr('stroke-width', 6);
        }
      });
    });

    // 繪製節點數值標籤
    nodeData.forEach((path) => {
      path.nodes.forEach((node) => {
        svg
          .append('text')
          .attr('x', x(node.coord.x))
          .attr('y', y(node.coord.y))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '10px')
          .attr('fill', 'white')
          .text(node.value);
      });
    });
  };

  /**
   * 📊 切換圖表類型 (Switch Chart Type)
   * @param {string} chartType - 圖表類型 ('bar', 'line', 'scatter', 'schematic')
   */
  const switchChartType = (chartType) => {
    currentChartType.value = chartType;
    updateChart();
  };

  /**
   * 📊 更新圖表 (Update Chart)
   * 根據當前圖表類型重新渲染圖表
   */
  const updateChart = async () => {
    // 示意圖不需要依賴 currentLayerSummary
    if (currentChartType.value === 'schematic') {
      nextTick(async () => {
        await drawSchematicDiagram();
      });
      return;
    }

    if (!currentLayerSummary.value || !currentLayerSummary.value.districtCount) return;

    nextTick(() => {
      // 其他圖表類型的處理...
    });
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
  <!-- 📊 多圖層 D3.js 數據視覺化儀表板視圖組件 -->
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

      <!-- 📊 圖表類型控制 -->
      <div class="mb-4">
        <div class="d-flex align-items-center gap-2">
          <span class="my-content-sm-black">圖表類型：</span>
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-sm"
              :class="{
                'btn-primary': currentChartType === 'bar',
                'btn-outline-primary': currentChartType !== 'bar',
              }"
              @click="switchChartType('bar')"
            >
              柱狀圖
            </button>
            <button
              type="button"
              class="btn btn-sm"
              :class="{
                'btn-primary': currentChartType === 'line',
                'btn-outline-primary': currentChartType !== 'line',
              }"
              @click="switchChartType('line')"
            >
              折線圖
            </button>
            <button
              type="button"
              class="btn btn-sm"
              :class="{
                'btn-primary': currentChartType === 'scatter',
                'btn-outline-primary': currentChartType !== 'scatter',
              }"
              @click="switchChartType('scatter')"
            >
              散點圖
            </button>
            <button
              type="button"
              class="btn btn-sm"
              :class="{
                'btn-primary': currentChartType === 'schematic',
                'btn-outline-primary': currentChartType !== 'schematic',
              }"
              @click="switchChartType('schematic')"
            >
              示意圖
            </button>
          </div>
        </div>
      </div>

      <!-- 📊 圖層摘要資料 -->
      <div v-if="currentLayerSummary">
        <div class="row">
          <!-- 基本統計信息 -->
          <div class="col-12 col-xl-6">
            <div class="rounded-4 my-bgcolor-gray-100 p-4 mb-3">
              <h6 class="mb-3">基本統計</h6>
              <div class="row">
                <div class="col-6">
                  <div class="text-center">
                    <div class="my-title-xl-black">{{ currentLayerSummary.totalCount }}</div>
                    <div class="my-title-sm-gray">總數量</div>
                  </div>
                </div>
                <div class="col-6" v-if="currentLayerSummary.districtCount">
                  <div class="text-center">
                    <div class="my-title-xl-black">
                      {{ currentLayerSummary.districtCount.length }}
                    </div>
                    <div class="my-title-sm-gray">行政區數量</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- D3.js 圖表 -->
          <div
            class="col-12 col-xl-6"
            v-if="
              (currentLayerSummary.districtCount && currentLayerSummary.districtCount.length > 0) ||
              currentChartType === 'schematic'
            "
          >
            <div class="rounded-4 my-bgcolor-gray-100 p-4 mb-3">
              <h6 class="mb-3">
                行政區分布 -
                {{
                  currentChartType === 'bar'
                    ? '柱狀圖'
                    : currentChartType === 'line'
                      ? '折線圖'
                      : currentChartType === 'scatter'
                        ? '散點圖'
                        : '示意圖'
                }}
              </h6>
              <div ref="chartContainer" class="w-100"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <div class="my-title-md-gray">此圖層沒有可用的摘要資訊</div>
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

<style scoped>
  /* D3.js 圖表樣式 */
  :deep(.bar:hover) {
    cursor: pointer;
  }

  :deep(.scatter:hover) {
    cursor: pointer;
  }

  :deep(.dot:hover) {
    cursor: pointer;
  }

  /* 按鈕樣式 */
  .btn-group .btn {
    border-radius: 4px;
  }
</style>
