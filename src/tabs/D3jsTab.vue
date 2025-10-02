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

  import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue';
  import { useDataStore } from '@/stores/dataStore.js';
  import * as d3 from 'd3';

  const dataStore = useDataStore();

  const activeLayerTab = ref(null); /** 📑 當前作用中的圖層分頁 */
  const chartContainer = ref(null); /** 📊 圖表容器參考 */
  const currentChartType = ref('bar'); /** 📊 當前圖表類型 */

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
   * 📊 繪製柱狀圖 (Draw Bar Chart)
   * @param {Array} districtCount - 行政區統計數據
   */
  const drawBarChart = (districtCount) => {
    if (!chartContainer.value || !districtCount || districtCount.length === 0) {
      return;
    }

    // 清除之前的圖表
    d3.select(chartContainer.value).selectAll('*').remove();

    // 設定圖表尺寸和邊距
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const containerWidth = chartContainer.value.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 300;

    // 創建 SVG
    const svg = d3
      .select(chartContainer.value)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 設定比例尺
    const maxCount = d3.max(districtCount, (d) => d.count);
    const xScale = d3
      .scaleBand()
      .domain(districtCount.map((d) => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

    // 創建柱狀
    g.selectAll('.bar')
      .data(districtCount)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(d.name))
      .attr('y', (d) => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(d.count))
      .attr('fill', 'var(--my-color-blue)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 1);
      });

    // 添加 X 軸
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // 添加 Y 軸
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666');

    // 添加數值標籤
    g.selectAll('.value-label')
      .data(districtCount)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#333')
      .text((d) => d.count);
  };

  /**
   * 📊 繪製折線圖 (Draw Line Chart)
   * @param {Array} districtCount - 行政區統計數據
   */
  const drawLineChart = (districtCount) => {
    if (!chartContainer.value || !districtCount || districtCount.length === 0) {
      return;
    }

    // 清除之前的圖表
    d3.select(chartContainer.value).selectAll('*').remove();

    // 設定圖表尺寸和邊距
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const containerWidth = chartContainer.value.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 300;

    // 創建 SVG
    const svg = d3
      .select(chartContainer.value)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 設定比例尺
    const maxCount = d3.max(districtCount, (d) => d.count);
    const xScale = d3
      .scaleBand()
      .domain(districtCount.map((d) => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

    // 創建折線生成器
    const line = d3
      .line()
      .x((d) => xScale(d.name) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // 創建折線
    g.append('path')
      .datum(districtCount)
      .attr('fill', 'none')
      .attr('stroke', 'var(--my-color-blue)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // 添加數據點
    g.selectAll('.dot')
      .data(districtCount)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.count))
      .attr('r', 4)
      .attr('fill', 'var(--my-color-blue)')
      .on('mouseover', function () {
        d3.select(this).attr('r', 6);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 4);
      });

    // 添加 X 軸
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // 添加 Y 軸
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666');

    // 添加數值標籤
    g.selectAll('.value-label')
      .data(districtCount)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.count) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text((d) => d.count);
  };

  /**
   * 📊 繪製散點圖 (Draw Scatter Plot)
   * @param {Array} districtCount - 行政區統計數據
   */
  const drawScatterPlot = (districtCount) => {
    if (!chartContainer.value || !districtCount || districtCount.length === 0) {
      return;
    }

    // 清除之前的圖表
    d3.select(chartContainer.value).selectAll('*').remove();

    // 設定圖表尺寸和邊距
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const containerWidth = chartContainer.value.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 300;

    // 創建 SVG
    const svg = d3
      .select(chartContainer.value)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 設定比例尺
    const maxCount = d3.max(districtCount, (d) => d.count);
    const xScale = d3
      .scaleBand()
      .domain(districtCount.map((d) => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

    // 創建散點
    g.selectAll('.scatter')
      .data(districtCount)
      .enter()
      .append('circle')
      .attr('class', 'scatter')
      .attr('cx', (d) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.count))
      .attr('r', 6)
      .attr('fill', 'var(--my-color-blue)')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function () {
        d3.select(this).attr('r', 8);
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 6);
      });

    // 添加 X 軸
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // 添加 Y 軸
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666');

    // 添加數值標籤
    g.selectAll('.value-label')
      .data(districtCount)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', (d) => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.count) - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#333')
      .text((d) => d.count);
  };

  /**
   * 📊 切換圖表類型 (Switch Chart Type)
   * @param {string} chartType - 圖表類型 ('bar', 'line', 'scatter')
   */
  const switchChartType = (chartType) => {
    currentChartType.value = chartType;
    updateChart();
  };

  /**
   * 📊 更新圖表 (Update Chart)
   * 根據當前圖表類型重新渲染圖表
   */
  const updateChart = () => {
    if (!currentLayerSummary.value || !currentLayerSummary.value.districtCount) return;

    nextTick(() => {
      switch (currentChartType.value) {
        case 'bar':
          drawBarChart(currentLayerSummary.value.districtCount);
          break;
        case 'line':
          drawLineChart(currentLayerSummary.value.districtCount);
          break;
        case 'scatter':
          drawScatterPlot(currentLayerSummary.value.districtCount);
          break;
        default:
          drawBarChart(currentLayerSummary.value.districtCount);
      }
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
        // console.log(
        //   `🔄 自動切換到新開啟的圖層: ${newLayers.find((layer) => layer.layerId === newestAddedLayerId)?.layerName}`
        // );
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
   * 👀 監聽當前圖層摘要變化，更新圖表
   */
  watch(
    () => currentLayerSummary.value,
    (newSummary) => {
      if (newSummary && newSummary.districtCount) {
        nextTick(() => {
          updateChart();
        });
      }
    },
    { immediate: true }
  );

  /**
   * 🚀 組件掛載事件 (Component Mounted Event)
   */
  onMounted(() => {
    // console.log('[D3jsTab] Component Mounted');

    // 初始化第一個可見圖層為作用中分頁
    if (visibleLayers.value.length > 0 && !activeLayerTab.value) {
      activeLayerTab.value = visibleLayers.value[0].layerId;
    }
  });

  // 監聽窗口大小變化，重新繪製圖表
  const handleResize = () => {
    if (currentLayerSummary.value && currentLayerSummary.value.districtCount) {
      nextTick(() => {
        updateChart();
      });
    }
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  // 組件卸載時移除事件監聽
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
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
            v-if="currentLayerSummary.districtCount && currentLayerSummary.districtCount.length > 0"
          >
            <div class="rounded-4 my-bgcolor-gray-100 p-4 mb-3">
              <h6 class="mb-3">
                行政區分布 -
                {{
                  currentChartType === 'bar'
                    ? '柱狀圖'
                    : currentChartType === 'line'
                      ? '折線圖'
                      : '散點圖'
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
