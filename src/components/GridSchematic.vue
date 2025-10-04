<template>
  <!-- 📊 網格示意圖組件容器 -->
  <!-- 提供完整的網格示意圖顯示區域，支援響應式佈局 -->
  <div class="grid-schematic w-100 h-100">
    <!-- 🎨 D3.js 網格圖表容器 -->
    <!-- 用於渲染網格示意圖的 SVG 元素，支援動態尺寸調整 -->
    <div id="grid-diagram" class="w-100 h-100" style="min-height: 300px; overflow: hidden"></div>
  </div>
</template>

<script setup>
  /**
   * 📊 GridSchematic.vue - 網格示意圖組件
   *
   * 功能說明 (Features):
   * 1. 📊 網格數據載入：從 dataStore 圖層配置載入網格尺寸數據
   * 2. 🎨 網格系統繪製：根據 x*y 尺寸繪製滿版網格
   * 3. 🔢 節點數值顯示：在每個網格節點顯示對應的數值
   * 4. 📱 響應式設計：根據容器大小自動調整網格尺寸
   * 5. 🎯 互動功能：支援滑鼠懸停和點擊事件
   * 6. 🔄 動態更新：支援數據變更時的網格重新渲染
   * 7. 🎨 視覺化增強：提供美觀的網格樣式和動畫效果
   *
   * 技術特點 (Technical Features):
   * - 使用 D3.js 進行網格視覺化
   * - 支援 SVG 向量圖形渲染
   * - 實現響應式佈局和尺寸調整
   * - 提供平滑的動畫過渡效果
   * - 支援網格節點的數值顯示
   *
   * 數據格式 (Data Format):
   * - 支援網格尺寸參數 (gridX, gridY)
   * - 包含節點座標、數值等資訊
   * - 支援網格節點的隨機數值生成
   *
   * @component GridSchematic
   * @version 1.0.0
   * @author Kevin Cheng
   * @since 1.0.0
   */

  // ==================== 📦 第三方庫引入 (Third-Party Library Imports) ====================

  /**
   * Vue 3 Composition API 核心功能引入
   * 提供響應式數據、生命週期鉤子等功能
   *
   * @see https://vuejs.org/
   */
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';

  // 📦 Pinia 狀態管理引入
  import { useDataStore } from '@/stores/dataStore';

  /**
   * D3.js 數據視覺化庫引入
   * 提供強大的數據視覺化和 DOM 操作功能
   *
   * @see https://d3js.org/
   */
  import * as d3 from 'd3';

  // ==================== 🔧 組件屬性定義 (Component Props) ====================

  /**
   * 定義組件接收的外部屬性
   */
  const props = defineProps({
    /**
     * 📊 圖層 ID
     * 指定要載入的圖層配置
     * @type {String}
     * @default 'test_layer'
     */
    layerId: {
      type: String,
      default: 'test_layer',
    },
  });

  // ==================== 📊 響應式狀態定義 (Reactive State Definition) ====================

  /**
   * 📊 網格數據狀態 (Grid Data State)
   * 存儲從圖層載入的網格數據
   * @type {Ref<Object|null>}
   */
  const gridData = ref(null);

  /**
   * 📏 網格尺寸狀態 (Grid Dimensions State)
   * 存儲網格的 x 和 y 尺寸
   * @type {Ref<Object>}
   */
  const gridDimensions = ref({ x: 10, y: 10 });

  // ==================== 🎨 視覺化常數 (Visualization Constants) ====================

  /**
   * 🎨 顏色配置 (Color Configuration)
   * 定義網格示意圖的視覺樣式
   */
  const COLOR_CONFIG = {
    BACKGROUND: '#212121', // 背景色
    GRID_LINE: '#666666', // 主要網格線顏色
    GRID_LINE_SECONDARY: '#333333', // 次要網格線顏色
    NODE_FILL: '#4CAF50', // 節點填充色
    NODE_STROKE: '#2E7D32', // 節點邊框色
    TEXT_FILL: '#FFFFFF', // 文字顏色
  };

  // ==================== 🔧 核心功能函數 (Core Functions) ====================

  /**
   * 📊 載入網格數據 (Load Grid Data)
   * 從 dataStore 中載入指定圖層的網格數據
   */
  const loadData = async () => {
    try {
      // 取得 dataStore 實例
      const dataStore = useDataStore();

      // 找到指定的圖層
      const targetLayer = dataStore.findLayerById(props.layerId);
      if (!targetLayer) {
        throw new Error(`找不到圖層配置: ${props.layerId}`);
      }

      console.log('🔄 使用圖層配置載入網格數據:', targetLayer.jsonFileName);

      // 使用圖層的 jsonLoader 載入數據
      const result = await targetLayer.jsonLoader(targetLayer);

      // 檢查是否有網格數據
      if (result.jsonData && result.jsonData.type === 'grid') {
        gridData.value = result.jsonData;
        gridDimensions.value = {
          x: result.jsonData.gridX,
          y: result.jsonData.gridY,
        };
        console.log('✅ 網格數據載入成功:', gridData.value);
        await nextTick();
        drawGrid();
      } else {
        throw new Error('無法從圖層數據中提取網格數據');
      }
    } catch (error) {
      console.error('❌ 無法載入網格數據:', error.message);
    }
  };

  /**
   * 📏 獲取容器尺寸 (Get Container Dimensions)
   * 計算網格圖表的可用繪圖區域
   * @returns {Object} 包含 width 和 height 的尺寸物件
   */
  const getDimensions = () => {
    const container = document.getElementById('grid-diagram');
    if (container) {
      // 獲取容器的實際可用尺寸
      const rect = container.getBoundingClientRect();
      const width = container.clientWidth || rect.width;
      const height = container.clientHeight || rect.height;

      console.log('📏 容器尺寸:', {
        width,
        height,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        rectWidth: rect.width,
        rectHeight: rect.height,
      });

      return {
        width: Math.max(width, 400),
        height: Math.max(height, 300),
      };
    }
    // 如果找不到容器，使用預設尺寸
    return {
      width: 800,
      height: 600,
    };
  };

  /**
   * 🎨 繪製網格示意圖 (Draw Grid Schematic)
   * 使用 D3.js 繪製網格示意圖
   */
  const drawGrid = () => {
    if (!gridData.value) return;

    // 獲取容器尺寸
    const dimensions = getDimensions();

    // 添加適當的邊距
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // 檢查是否已存在 SVG，如果存在且尺寸相同則不需要重繪
    const existingSvg = d3.select('#grid-diagram').select('svg');
    if (existingSvg.size() > 0) {
      const existingWidth = parseFloat(existingSvg.attr('width'));
      const existingHeight = parseFloat(existingSvg.attr('height'));

      // 如果尺寸變化很小（小於 5px），則只更新尺寸而不重繪
      if (
        Math.abs(existingWidth - (width + margin.left + margin.right)) < 5 &&
        Math.abs(existingHeight - (height + margin.top + margin.bottom)) < 5
      ) {
        return;
      }
    }

    // 清除之前的圖表
    d3.select('#grid-diagram').selectAll('svg').remove();

    // 創建 SVG 元素
    const svg = d3
      .select('#grid-diagram')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', COLOR_CONFIG.BACKGROUND)
      .style('transition', 'all 0.2s ease-in-out');

    // 計算網格單元格尺寸
    const cellWidth = width / gridDimensions.value.x;
    const cellHeight = height / gridDimensions.value.y;

    console.log('📊 網格單元格尺寸:', { cellWidth, cellHeight });

    // 繪製網格線
    drawGridLines(svg, width, height, cellWidth, cellHeight, margin);

    // 繪製網格節點
    drawGridNodes(svg, cellWidth, cellHeight, margin);
  };

  /**
   * 📏 繪製網格線 (Draw Grid Lines)
   * 繪製網格的主要和次要網格線
   * @param {Object} svg - D3 SVG 選擇器
   * @param {number} width - 繪圖區域寬度
   * @param {number} height - 繪圖區域高度
   * @param {number} cellWidth - 單元格寬度
   * @param {number} cellHeight - 單元格高度
   * @param {Object} margin - 邊距配置
   */
  const drawGridLines = (svg, width, height, cellWidth, cellHeight, margin) => {
    // 繪製垂直網格線
    for (let i = 0; i <= gridDimensions.value.x; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_CONFIG.GRID_LINE)
        .style('stroke-width', 1)
        .attr('x1', margin.left + i * cellWidth)
        .attr('y1', margin.top)
        .attr('x2', margin.left + i * cellWidth)
        .attr('y2', margin.top + height);
    }

    // 繪製水平網格線
    for (let i = 0; i <= gridDimensions.value.y; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_CONFIG.GRID_LINE)
        .style('stroke-width', 1)
        .attr('x1', margin.left)
        .attr('y1', margin.top + i * cellHeight)
        .attr('x2', margin.left + width)
        .attr('y2', margin.top + i * cellHeight);
    }

    // 繪製次要網格線（網格中心線）
    for (let i = 0; i < gridDimensions.value.x; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_CONFIG.GRID_LINE_SECONDARY)
        .style('stroke-width', 0.5)
        .attr('x1', margin.left + (i + 0.5) * cellWidth)
        .attr('y1', margin.top)
        .attr('x2', margin.left + (i + 0.5) * cellWidth)
        .attr('y2', margin.top + height);
    }

    for (let i = 0; i < gridDimensions.value.y; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_CONFIG.GRID_LINE_SECONDARY)
        .style('stroke-width', 0.5)
        .attr('x1', margin.left)
        .attr('y1', margin.top + (i + 0.5) * cellHeight)
        .attr('x2', margin.left + width)
        .attr('y2', margin.top + (i + 0.5) * cellHeight);
    }
  };

  /**
   * 🔢 繪製網格節點 (Draw Grid Nodes)
   * 在每個網格單元格中心繪製節點和數值
   * @param {Object} svg - D3 SVG 選擇器
   * @param {number} cellWidth - 單元格寬度
   * @param {number} cellHeight - 單元格高度
   * @param {Object} margin - 邊距配置
   */
  const drawGridNodes = (svg, cellWidth, cellHeight, margin) => {
    if (!gridData.value || !gridData.value.nodes) return;

    // 創建節點群組
    const nodeGroup = svg.append('g').attr('class', 'grid-nodes');

    // 繪製每個節點
    gridData.value.nodes.forEach((node) => {
      const x = margin.left + (node.x + 0.5) * cellWidth;
      const y = margin.top + (node.y + 0.5) * cellHeight;

      // 繪製節點圓圈
      nodeGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', Math.min(cellWidth, cellHeight) * 0.3)
        .style('fill', COLOR_CONFIG.NODE_FILL)
        .style('stroke', COLOR_CONFIG.NODE_STROKE)
        .style('stroke-width', 2)
        .style('opacity', 0.8)
        .on('mouseover', function () {
          d3.select(this).style('opacity', 1).style('stroke-width', 3);
        })
        .on('mouseout', function () {
          d3.select(this).style('opacity', 0.8).style('stroke-width', 2);
        });

      // 繪製節點數值文字
      nodeGroup
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', Math.min(cellWidth, cellHeight) * 0.2)
        .attr('font-weight', 'bold')
        .attr('fill', COLOR_CONFIG.TEXT_FILL)
        .text(node.value);
    });
  };

  /**
   * 📏 調整尺寸 (Resize)
   * 響應容器尺寸變化，重新繪製網格
   */
  const resize = () => {
    drawGrid();
  };

  // ==================== 🔄 生命週期管理 (Lifecycle Management) ====================

  // ResizeObserver 實例
  let resizeObserver = null;

  // 組件掛載
  onMounted(async () => {
    console.log('📊 網格示意圖組件掛載');
    await loadData();
    await nextTick();
    resize();

    // 監聽窗口大小變化
    window.addEventListener('resize', resize);

    // 監聽容器尺寸變化
    const container = document.getElementById('grid-diagram');
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            resize();
          }
        }
      });
      resizeObserver.observe(container);

      // 同時監聽父容器
      const parentContainer = container.parentElement;
      if (parentContainer) {
        resizeObserver.observe(parentContainer);
      }
    }
  });

  // 組件卸載
  onUnmounted(() => {
    window.removeEventListener('resize', resize);

    // 清理 ResizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
</script>

<style scoped>
  /**
   * 🎨 網格示意圖組件樣式 (Grid Schematic Component Styles)
   *
   * 定義組件內部元素的樣式規則，使用 scoped 避免樣式污染
   * 主要樣式規則已在 common.css 中定義，此處僅包含組件特定調整
   */

  /* 📊 網格示意圖容器樣式 (Grid Schematic Container Styles) */
  .grid-schematic {
    position: relative;
    overflow: hidden;
  }

  /* 🎨 網格節點懸停效果 (Grid Node Hover Effects) */
  .grid-nodes circle {
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }

  .grid-nodes circle:hover {
    filter: brightness(1.2);
  }

  /* 📝 網格文字樣式 (Grid Text Styles) */
  .grid-nodes text {
    pointer-events: none;
    user-select: none;
  }
</style>
