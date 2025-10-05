<script setup>
  /**
   * 📊 D3jsTab.vue - D3.js 數據視覺化分頁組件
   *
   * 功能說明：
   * 1. 📑 圖層分頁導航 - 顯示所有可見圖層的標籤頁
   * 2. 📊 當前圖層資訊 - 顯示選中圖層的名稱和詳細信息
   * 3. 📈 圖層摘要資料 - 顯示總數量、行政區數量等統計信息
   * 4. 🎨 D3.js 圖表 - 使用 D3.js 繪製各種類型的圖表（網格示意圖、行政區示意圖）
   * 5. 🔄 自動切換功能 - 當新圖層開啟時自動切換到該圖層的分頁
   *
   * @component D3jsTab
   * @version 2.0.0
   * @author Kevin Cheng
   */

  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { useDataStore } from '@/stores/dataStore.js';
  import * as d3 from 'd3';

  // Props
  const props = defineProps({
    containerHeight: {
      type: Number,
      default: 600,
    },
    isPanelDragging: {
      type: Boolean,
      default: false,
    },
    activeMarkers: {
      type: Array,
      default: () => [],
    },
  });

  const dataStore = useDataStore();

  const activeLayerTab = ref(null); /** 📑 當前作用中的圖層分頁 */

  // ==================== 📊 示意圖繪製相關狀態 (Schematic Drawing State) ====================

  /** 📊 網格數據狀態 (Grid Data State) */
  const gridData = ref(null);
  const gridDimensions = ref({ x: 10, y: 10 });

  /** 📊 行政區數據狀態 (Administrative District Data State) */
  const nodeData = ref(null);
  const linkData = ref(null);

  // ==================== 🎨 視覺化常數 (Visualization Constants) ====================

  /** 🎨 顏色配置 (Color Configuration) */
  const COLOR_CONFIG = {
    BACKGROUND: '#212121',
    GRID_LINE: '#666666',
    GRID_LINE_SECONDARY: '#333333',
    NODE_FILL: '#4CAF50',
    NODE_STROKE: '#2E7D32',
    TEXT_FILL: '#FFFFFF',
  };

  /** 🎨 顏色映射 (Color Mapping) */
  const colorMap = {
    red: '#ff0000',
    lightpink: '#ffb3ba',
    blue: '#0066cc',
    green: '#00aa44',
    lightgreen: '#90ee90',
    orange: '#ff8800',
    brown: '#8b4513',
    yellow: '#ffcc00',
    purple: '#800080',
    paleturquoise: '#afeeee',
    limegreen: '#32cd32',
  };

  // ResizeObserver 實例
  let resizeObserver = null;

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
    console.log('🔄 圖層切換按鈕點擊:', activeLayerTab.value, '->', layerId);

    // 如果切換到相同圖層，不需要重新處理
    if (activeLayerTab.value === layerId) {
      console.log('🔄 相同圖層，跳過切換');
      return;
    }

    // 立即清除 SVG 內容，避免重疊
    d3.select('#schematic-container').selectAll('svg').remove();
    console.log('🗑️ 已清除 SVG 內容');

    // 清除數據狀態
    gridData.value = null;
    nodeData.value = null;
    linkData.value = null;
    console.log('🗑️ 已清除數據狀態');

    // 設置新的活動圖層
    activeLayerTab.value = layerId;
    console.log('✅ 已設置新圖層:', layerId);
  };

  /**
   * 📊 當前圖層摘要 (Current Layer Summary)
   */
  const currentLayerSummary = computed(() => {
    console.log('currentLayerSummary computed - activeLayerTab:', activeLayerTab.value);
    console.log('currentLayerSummary computed - visibleLayers:', visibleLayers.value);

    if (!activeLayerTab.value) {
      console.log('currentLayerSummary - no activeLayerTab, returning null');
      return null;
    }

    const layer = visibleLayers.value.find((l) => l.layerId === activeLayerTab.value);
    console.log('currentLayerSummary - found layer:', layer);

    const result = layer ? layer.dashboardData || null : null;
    console.log('currentLayerSummary - returning:', result);
    return result;
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
   * 🎨 判斷是否為網格示意圖圖層 (Check if Layer is Grid Schematic)
   * @param {string} layerId - 圖層 ID
   * @returns {boolean} 是否為網格示意圖圖層
   */
  const isGridSchematicLayer = (layerId) => {
    if (!layerId) return false;
    const layer = dataStore.findLayerById(layerId);
    return layer && layer.isGridSchematic === true;
  };

  // ==================== 📊 數據載入和處理函數 (Data Loading and Processing Functions) ====================

  /**
   * 🎲 為節點隨機分配 1-5 的數值 (Randomize Node Values)
   * @param {Array} nodes - 節點陣列
   * @returns {Array} - 處理後的節點陣列
   */
  const randomizeNodeValues = (nodes) => {
    console.log('🎲 開始隨機化節點數值，原始節點數量:', nodes.length);
    const randomizedNodes = nodes.map((node) => {
      const newValue = Math.floor(Math.random() * 5) + 1; // 生成 1-5 的隨機數
      console.log(`🎲 節點 ${node.coord?.x},${node.coord?.y} 從 ${node.value} 變為 ${newValue}`);
      return {
        ...node,
        value: newValue,
      };
    });
    console.log('🎲 隨機化完成，前3個節點:', randomizedNodes.slice(0, 3));
    return randomizedNodes;
  };

  /**
   * 📊 載入圖層數據 (Load Layer Data)
   * @param {string} layerId - 圖層 ID
   */
  const loadLayerData = async (layerId) => {
    try {
      // 找到指定的圖層
      const targetLayer = dataStore.findLayerById(layerId);
      if (!targetLayer) {
        throw new Error(`找不到圖層配置: ${layerId}`);
      }

      console.log('🔄 使用圖層配置載入數據:', targetLayer.jsonFileName);

      // 使用圖層的 jsonLoader 載入數據
      const result = await targetLayer.jsonLoader(targetLayer);

      // 檢查數據類型並載入相應數據
      if (result.processedJsonData) {
        if (result.processedJsonData.type === 'grid') {
          // 網格數據
          gridData.value = result.processedJsonData;
          gridDimensions.value = {
            x: result.processedJsonData.gridX,
            y: result.processedJsonData.gridY,
          };
          console.log('✅ 網格數據載入成功:', gridData.value);
        } else {
          // 行政區示意圖數據
          nodeData.value = result.processedJsonData;
          console.log('✅ 行政區數據載入成功:', nodeData.value);
          setLinkData();
        }
      } else if (result.dataTableData && result.dataTableData.length > 0) {
        // 表格數據格式，轉換為示意圖格式
        const schematicData = result.dataTableData.map((item) => ({
          color: item.color,
          name: item.name,
          nodes: item.nodes || [],
        }));

        // 為每個路線的節點隨機分配 1-5 的數值
        const processedData = schematicData.map((line) => ({
          ...line,
          nodes: randomizeNodeValues(line.nodes),
        }));

        nodeData.value = processedData;
        console.log('✅ 表格數據轉換成功:', nodeData.value);
        setLinkData();
      } else {
        throw new Error('無法從圖層數據中提取示意圖數據');
      }
    } catch (error) {
      console.error('❌ 無法載入圖層數據:', error.message);
    }
  };

  /**
   * 📊 設定連接數據 (Set Link Data)
   */
  const setLinkData = () => {
    if (!nodeData.value) return;

    linkData.value = [];

    nodeData.value.forEach((path) => {
      let thisX, thisY;
      let nodes = [];

      path.nodes.slice(0, path.nodes.length - 1).forEach((node) => {
        thisX = node.coord.x;
        thisY = node.coord.y;

        switch (node.type) {
          case 1:
          case 6:
          case 21:
          case 41:
            thisX = node.coord.x + 0.5;
            thisY = node.coord.y;
            break;
          case 2:
          case 8:
          case 12:
          case 32:
            thisX = node.coord.x;
            thisY = node.coord.y - 0.5;
            break;
          case 3:
          case 5:
          case 23:
          case 43:
            thisX = node.coord.x - 0.5;
            thisY = node.coord.y;
            break;
          case 4:
          case 7:
          case 14:
          case 34:
            thisX = node.coord.x;
            thisY = node.coord.y + 0.5;
            break;
        }

        nodes.push({
          value: node.value,
          type: node.type,
          coord: { x: thisX, y: thisY },
        });
      });

      let data = {
        color: colorMap[path.color] || path.color,
        name: path.name,
        nodes: nodes,
      };

      linkData.value.push(data);
    });

    console.log('linkData', linkData.value);
  };

  // ==================== 📏 容器尺寸和繪製函數 (Container Dimensions and Drawing Functions) ====================

  /**
   * 📏 獲取容器尺寸 (Get Container Dimensions)
   * @returns {Object} 包含 width 和 height 的尺寸物件
   */
  const getDimensions = () => {
    const container = document.getElementById('schematic-container');
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

      const dimensions = {
        width: Math.max(width, 40),
        height: Math.max(height, 30),
      };

      // 更新 dataStore 中的尺寸狀態
      dataStore.updateD3jsDimensions(dimensions.width, dimensions.height);

      return dimensions;
    }
    // 如果找不到容器，使用預設尺寸
    const defaultDimensions = {
      width: 800,
      height: 600,
    };

    // 更新 dataStore 中的尺寸狀態
    dataStore.updateD3jsDimensions(defaultDimensions.width, defaultDimensions.height);

    return defaultDimensions;
  };

  /**
   * 🎨 繪製網格示意圖 (Draw Grid Schematic)
   */
  const drawGridSchematic = () => {
    if (!gridData.value) return;

    // 獲取容器尺寸
    const dimensions = getDimensions();

    // 添加適當的邊距
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // 檢查是否已存在 SVG，如果存在且尺寸相同則不需要重繪
    const existingSvg = d3.select('#schematic-container').select('svg');
    if (existingSvg.size() > 0) {
      const existingWidth = parseFloat(existingSvg.attr('width'));
      const existingHeight = parseFloat(existingSvg.attr('height'));

      // 如果尺寸變化很小（小於 2px），則只更新尺寸而不重繪
      // 降低閾值以確保寬度變化時能正確重繪
      if (
        Math.abs(existingWidth - (width + margin.left + margin.right)) < 2 &&
        Math.abs(existingHeight - (height + margin.top + margin.bottom)) < 2
      ) {
        console.log('📏 示意圖尺寸變化太小，跳過重繪');
        return;
      }
    }

    // 清除之前的圖表
    d3.select('#schematic-container').selectAll('svg').remove();

    // 創建 SVG 元素
    const svg = d3
      .select('#schematic-container')
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
   * @param {Object} svg - D3 SVG 選擇器
   * @param {number} cellWidth - 單元格寬度
   * @param {number} cellHeight - 單元格高度
   * @param {Object} margin - 邊距配置
   */
  const drawGridNodes = (svg, cellWidth, cellHeight, margin) => {
    if (!gridData.value || !gridData.value.nodes) return;

    // 獲取當前圖層的 drawJsonData
    const currentLayer = dataStore.findLayerById(activeLayerTab.value);
    const drawJsonData = currentLayer ? currentLayer.drawJsonData : null;

    // 創建節點群組
    const nodeGroup = svg.append('g').attr('class', 'grid-nodes');

    // 繪製每個節點（只顯示數值文字，不顯示圓圈）
    gridData.value.nodes.forEach((node, index) => {
      const x = margin.left + (node.x + 0.5) * cellWidth;
      const y = margin.top + (node.y + 0.5) * cellHeight;

      // 從 drawJsonData 中獲取節點的顏色
      let nodeColor =
        drawJsonData && drawJsonData.nodes && drawJsonData.nodes[index]
          ? drawJsonData.nodes[index].color
          : '#FFFFFF'; // 預設白色

      // 檢查是否需要將節點數字變為紅色
      if (drawJsonData && drawJsonData.statsLabels) {
        const { highlightColumnIndices, highlightRowIndices } = drawJsonData.statsLabels;

        // 如果該節點所在的 column 或 row 需要高亮，則將數字變為紅色
        if (
          (cellWidth < 80 && highlightColumnIndices.includes(node.x)) ||
          (cellHeight < 80 && highlightRowIndices.includes(node.y))
        ) {
          nodeColor = '#F44336'; // 紅色
        }
      }

      // 只繪製節點數值文字，使用動態決定的顏色
      nodeGroup
        .append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', Math.min(cellWidth, cellHeight) * 0.25)
        .attr('font-weight', 'bold')
        .attr('fill', nodeColor)
        .text(node.value);
    });

    // 繪製統計數據標籤
    drawStatisticsLabels(svg, cellWidth, cellHeight, margin);
  };

  /**
   * 📊 繪製統計數據標籤 (Draw Statistics Labels)
   * @param {Object} svg - D3 SVG 選擇器
   * @param {number} cellWidth - 單元格寬度
   * @param {number} cellHeight - 單元格高度
   * @param {Object} margin - 邊距配置
   */
  const drawStatisticsLabels = (svg, cellWidth, cellHeight, margin) => {
    if (!gridData.value || !gridData.value.xRowStats || !gridData.value.yRowStats) return;

    // 創建統計標籤群組
    const statsGroup = svg.append('g').attr('class', 'statistics-labels');

    const fontSize = Math.min(cellWidth, cellHeight) * 0.25;
    const labelOffset = 5;

    // 從 drawJsonData 中獲取統計標籤數據
    const currentLayer = dataStore.findLayerById(activeLayerTab.value);
    const drawJsonData = currentLayer ? currentLayer.drawJsonData : null;

    if (drawJsonData && drawJsonData.statsLabels) {
      const { xRowStats, yRowStats, color, highlightColumnIndices, highlightRowIndices } =
        drawJsonData.statsLabels;

      // 繪製 X 排（垂直方向）統計標籤 - 只顯示最大值
      if (xRowStats) {
        xRowStats.forEach((xStat, index) => {
          const x = margin.left + (xStat.row + 0.5) * cellWidth;
          const y = margin.top - labelOffset;

          // 根據 cellWidth 和是否需要高亮決定顏色
          let textColor = color; // 預設顏色（綠色）

          // 當 cellWidth < 80px 且是需要高亮的 column 時，使用紅色
          if (cellWidth < 80 && highlightColumnIndices.includes(index)) {
            textColor = '#F44336'; // 紅色
          }

          // 只顯示最大值標籤
          statsGroup
            .append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'bottom')
            .attr('font-size', fontSize)
            .attr('font-weight', 'bold')
            .attr('fill', textColor) // 動態顏色
            .text(`${xStat.max}`);
        });
      }

      // 繪製 Y 排（水平方向）統計標籤 - 只顯示最大值
      if (yRowStats) {
        yRowStats.forEach((yStat, index) => {
          const x = margin.left - labelOffset;
          const y = margin.top + (yStat.row + 0.5) * cellHeight;

          // 根據 cellHeight 和是否需要高亮決定顏色
          let textColor = color; // 預設顏色（綠色）

          // 當 cellHeight < 80px 且是需要高亮的 row 時，使用紅色
          if (cellHeight < 80 && highlightRowIndices.includes(index)) {
            textColor = '#F44336'; // 紅色
          }

          // 只顯示最大值標籤
          statsGroup
            .append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', fontSize)
            .attr('font-weight', 'bold')
            .attr('fill', textColor) // 動態顏色
            .text(`${yStat.max}`);
        });
      }
    }
  };

  /**
   * 🎨 繪製行政區示意圖 (Draw Administrative District Schematic)
   */
  const drawAdministrativeSchematic = () => {
    if (!nodeData.value) return;

    // 畫布長寬px
    let dimensions = getDimensions();

    // 添加適當的邊距，確保內容不被截斷
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // 獲取所有節點座標
    const allPoints = nodeData.value.flatMap((d) =>
      d.nodes.map((node) => ({
        x: node.coord.x,
        y: node.coord.y,
      }))
    );

    console.log('allPoints', allPoints);

    // 找到點的最大最小值
    let xMax = d3.max(allPoints, (d) => d.x);
    let yMax = d3.max(allPoints, (d) => d.y);

    console.log('Maximum x: ', xMax);
    console.log('Maximum y: ', yMax);

    // 檢查是否已存在 SVG，如果存在且尺寸相同則不需要重繪
    const existingSvg = d3.select('#schematic-container').select('svg');
    if (existingSvg.size() > 0) {
      const existingWidth = parseFloat(existingSvg.attr('width'));
      const existingHeight = parseFloat(existingSvg.attr('height'));

      // 如果尺寸變化很小（小於 2px），則只更新尺寸而不重繪
      // 降低閾值以確保寬度變化時能正確重繪
      if (
        Math.abs(existingWidth - (width + margin.left + margin.right)) < 2 &&
        Math.abs(existingHeight - (height + margin.top + margin.bottom)) < 2
      ) {
        console.log('📏 示意圖尺寸變化太小，跳過重繪');
        return;
      }
    }

    // 清除之前的圖表
    d3.select('#schematic-container').selectAll('svg').remove();

    // 創建 SVG 元素
    const svg = d3
      .select('#schematic-container')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', COLOR_CONFIG.BACKGROUND)
      .style('transition', 'all 0.2s ease-in-out'); // 添加平滑過渡效果

    // 直接使用容器的完整尺寸，允許形狀變形以完全填滿容器
    const actualWidth = width;
    const actualHeight = height;

    // 繪製參數已準備就緒

    // 設定比例尺，使用實際繪圖區域
    const x = d3
      .scaleLinear()
      .domain([0, xMax])
      .range([margin.left, margin.left + actualWidth]);
    const y = d3
      .scaleLinear()
      .domain([yMax, 0])
      .range([margin.top, margin.top + actualHeight]);

    // 繪製主要網格線
    for (let i = 0; i <= xMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_CONFIG.GRID_LINE)
        .attr('x1', x(i))
        .attr('y1', margin.top)
        .attr('x2', x(i))
        .attr('y2', margin.top + actualHeight);
    }

    for (let i = 0; i <= yMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_CONFIG.GRID_LINE)
        .attr('x1', margin.left)
        .attr('y1', y(i))
        .attr('x2', margin.left + actualWidth)
        .attr('y2', y(i));
    }

    // 繪製次要網格線
    for (let i = 0; i < xMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_CONFIG.GRID_LINE_SECONDARY)
        .attr('x1', (x(i) + x(i + 1)) / 2)
        .attr('y1', margin.top)
        .attr('x2', (x(i) + x(i + 1)) / 2)
        .attr('y2', margin.top + actualHeight);
    }

    for (let i = 0; i < yMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_CONFIG.GRID_LINE_SECONDARY)
        .attr('x1', margin.left)
        .attr('y1', (y(i) + y(i + 1)) / 2)
        .attr('x2', margin.left + actualWidth)
        .attr('y2', (y(i) + y(i + 1)) / 2);
    }

    // 創建線條生成器
    const lineGenerator = d3
      .line()
      .x((d) => x(d.x))
      .y((d) => y(d.y))
      .curve(d3.curveNatural);

    // 繪製每個路徑的節點連接
    nodeData.value.forEach((path) => {
      path.nodes.forEach((node) => {
        let dString = '';
        let nodes = [];

        console.log('node.coord.type', node.type);

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
          case 12:
          case 43: {
            let xWidth = Math.abs(x(node.coord.x - 0.5) - x(node.coord.x));
            let yHeight = Math.abs(y(node.coord.y) - y(node.coord.y - 0.5));

            let arcWidth = 0;

            if (xWidth < yHeight) {
              arcWidth = xWidth;

              nodes = [
                { x: node.coord.x, y: y.invert(y(node.coord.y) + arcWidth) },
                { x: node.coord.x, y: node.coord.y - 0.5 },
              ];
            } else {
              arcWidth = yHeight;

              nodes = [
                { x: node.coord.x - 0.5, y: node.coord.y },
                { x: x.invert(x(node.coord.x) - arcWidth), y: node.coord.y },
              ];
            }

            console.log('xWidth yHeight arcWidth', xWidth, yHeight, arcWidth);

            console.log('nodes', nodes);

            dString = lineGenerator(nodes);

            console.log('dString', dString);

            const arc = d3
              .arc()
              .innerRadius(arcWidth - 3)
              .outerRadius(arcWidth + 3)
              .startAngle(0)
              .endAngle(Math.PI / 2);

            svg
              .append('path')
              .attr('d', arc)
              .attr(
                'transform',
                `translate(${x(node.coord.x) - arcWidth}, ${y(node.coord.y) + arcWidth})`
              )
              .attr('fill', path.color);
            break;
          }
          case 21:
          case 34: {
            let xWidth = Math.abs(x(node.coord.x - 0.5) - x(node.coord.x));
            let yHeight = Math.abs(y(node.coord.y) - y(node.coord.y - 0.5));

            let arcWidth = 0;

            if (xWidth < yHeight) {
              arcWidth = xWidth;

              nodes = [
                { x: node.coord.x, y: y.invert(y(node.coord.y) - arcWidth) },
                { x: node.coord.x, y: node.coord.y + 0.5 },
              ];
            } else {
              arcWidth = yHeight;

              nodes = [
                { x: node.coord.x + 0.5, y: node.coord.y },
                { x: x.invert(x(node.coord.x) + arcWidth), y: node.coord.y },
              ];
            }

            console.log('xWidth yHeight arcWidth', xWidth, yHeight, arcWidth);

            console.log('nodes', nodes);

            dString = lineGenerator(nodes);

            console.log('dString', dString);

            const arc = d3
              .arc()
              .innerRadius(arcWidth - 3)
              .outerRadius(arcWidth + 3)
              .startAngle(-Math.PI / 2)
              .endAngle(-Math.PI);

            svg
              .append('path')
              .attr('d', arc)
              .attr(
                'transform',
                `translate(${x(node.coord.x) + arcWidth}, ${y(node.coord.y) - arcWidth})`
              )
              .attr('fill', path.color);
            break;
          }
          case 14:
          case 23: {
            let xWidth = Math.abs(x(node.coord.x - 0.5) - x(node.coord.x));
            let yHeight = Math.abs(y(node.coord.y) - y(node.coord.y - 0.5));

            let arcWidth = 0;

            if (xWidth < yHeight) {
              arcWidth = xWidth;

              nodes = [
                { x: node.coord.x, y: y.invert(y(node.coord.y) - arcWidth) },
                { x: node.coord.x, y: node.coord.y + 0.5 },
              ];
            } else {
              arcWidth = yHeight;

              nodes = [
                { x: node.coord.x - 0.5, y: node.coord.y },
                { x: x.invert(x(node.coord.x) - arcWidth), y: node.coord.y },
              ];
            }

            console.log('xWidth yHeight arcWidth', xWidth, yHeight, arcWidth);

            console.log('nodes', nodes);

            dString = lineGenerator(nodes);

            console.log('dString', dString);

            const arc = d3
              .arc()
              .innerRadius(arcWidth - 3)
              .outerRadius(arcWidth + 3)
              .startAngle(Math.PI / 2)
              .endAngle(Math.PI);

            svg
              .append('path')
              .attr('d', arc)
              .attr(
                'transform',
                `translate(${x(node.coord.x) - arcWidth}, ${y(node.coord.y) - arcWidth})`
              )
              .attr('fill', path.color);
            break;
          }
          case 32:
          case 41: {
            let xWidth = Math.abs(x(node.coord.x - 0.5) - x(node.coord.x));
            let yHeight = Math.abs(y(node.coord.y) - y(node.coord.y - 0.5));

            let arcWidth = 0;

            if (xWidth < yHeight) {
              arcWidth = xWidth;

              nodes = [
                { x: node.coord.x, y: y.invert(y(node.coord.y) + arcWidth) },
                { x: node.coord.x, y: node.coord.y - 0.5 },
              ];
            } else {
              arcWidth = yHeight;

              nodes = [
                { x: node.coord.x + 0.5, y: node.coord.y },
                { x: x.invert(x(node.coord.x) + arcWidth), y: node.coord.y },
              ];
            }

            console.log('xWidth yHeight arcWidth', xWidth, yHeight, arcWidth);

            console.log('nodes', nodes);

            dString = lineGenerator(nodes);

            console.log('dString', dString);

            const arc = d3
              .arc()
              .innerRadius(arcWidth - 3)
              .outerRadius(arcWidth + 3)
              .startAngle(0)
              .endAngle(-Math.PI / 2);

            svg
              .append('path')
              .attr('d', arc)
              .attr(
                'transform',
                `translate(${x(node.coord.x) + arcWidth}, ${y(node.coord.y) + arcWidth})`
              )
              .attr('fill', path.color);
            break;
          }
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
    if (linkData.value) {
      // 獲取當前圖層的 drawJsonData
      const currentLayer = dataStore.findLayerById(activeLayerTab.value);
      const drawJsonData = currentLayer ? currentLayer.drawJsonData : null;

      const allLinks = linkData.value.flatMap((line) =>
        line.nodes.map((node) => ({
          ...node,
        }))
      );

      console.log('allLinks', allLinks);

      allLinks.forEach((node, index) => {
        // 從 drawJsonData 中獲取節點的顏色
        const nodeColor =
          drawJsonData && drawJsonData.nodes && drawJsonData.nodes[index]
            ? drawJsonData.nodes[index].color
            : '#FFFFFF'; // 預設白色

        svg
          .append('text')
          .attr('x', x(node.coord.x))
          .attr('y', y(node.coord.y))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '10px')
          .attr('fill', nodeColor)
          .text(`${node.value}`);
      });
    }
  };

  /**
   * 🎨 統一繪製函數 (Unified Drawing Function)
   * 根據圖層類型選擇相應的繪製方法
   */
  const drawSchematic = () => {
    if (isGridSchematicLayer(activeLayerTab.value)) {
      drawGridSchematic();
    } else {
      drawAdministrativeSchematic();
    }
  };

  /**
   * 📏 調整尺寸 (Resize)
   * 響應容器尺寸變化，重新繪製示意圖
   */
  const resize = () => {
    console.log('📏 D3jsTab: 觸發 resize，重新繪製示意圖');
    // 先更新尺寸狀態，再重新繪製
    getDimensions();
    drawSchematic();
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
   * 👀 監聽活動圖層變化，載入數據並繪製示意圖
   */
  watch(
    () => activeLayerTab.value,
    async (newLayerId, oldLayerId) => {
      if (newLayerId && newLayerId !== oldLayerId) {
        console.log('🔄 監聽器觸發圖層切換:', oldLayerId, '->', newLayerId);

        // 確保 SVG 內容已清除（雙重保險）
        d3.select('#schematic-container').selectAll('svg').remove();
        console.log('🗑️ 監聽器：已清除 SVG 內容');

        // 清除舊數據（雙重保險）
        gridData.value = null;
        nodeData.value = null;
        linkData.value = null;
        console.log('🗑️ 監聽器：已清除數據狀態');

        // 載入新圖層數據
        console.log('📊 開始載入新圖層數據:', newLayerId);
        await loadLayerData(newLayerId);

        // 等待 DOM 更新後繪製
        await nextTick();
        console.log('🎨 開始繪製新圖層示意圖');
        drawSchematic();
        console.log('✅ 圖層切換完成');
      }
    }
  );

  /**
   * 👀 監聽容器高度變化，觸發示意圖重繪
   */
  watch(
    () => props.containerHeight,
    () => {
      // 觸發示意圖重繪以適應新高度
      nextTick(() => {
        resize();
      });
    }
  );

  /**
   * 🚀 組件掛載事件 (Component Mounted Event)
   */
  onMounted(async () => {
    console.log('D3jsTab mounted - visibleLayers:', visibleLayers.value);
    console.log('D3jsTab mounted - activeLayerTab:', activeLayerTab.value);

    // 初始化第一個可見圖層為作用中分頁
    if (visibleLayers.value.length > 0 && !activeLayerTab.value) {
      activeLayerTab.value = visibleLayers.value[0].layerId;
      console.log('D3jsTab - Set initial activeLayerTab to:', activeLayerTab.value);

      // 載入初始數據
      await loadLayerData(activeLayerTab.value);
      await nextTick();
      drawSchematic();
    }

    // 監聽窗口大小變化
    window.addEventListener('resize', resize);

    // 監聽容器尺寸變化
    const container = document.getElementById('schematic-container');
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

  /**
   * 🚀 組件卸載事件 (Component Unmounted Event)
   */
  onUnmounted(() => {
    window.removeEventListener('resize', resize);

    // 清理 ResizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  // 暴露方法給父組件使用
  defineExpose({
    resize, // 調整尺寸方法
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
    <div v-if="visibleLayers.length > 0" class="flex-grow-1 d-flex flex-column my-bgcolor-white">
      <!-- 📊 圖層摘要資料 -->
      <div v-if="currentLayerSummary" class="flex-grow-1 d-flex flex-column">
        <!-- D3.js 示意圖 - 根據容器高度動態調整 -->
        <div class="flex-grow-1 d-flex flex-column">
          <div
            class="flex-grow-1"
            :style="{
              height: Math.max(props.containerHeight - 100, 300) + 'px',
              minHeight: '300px',
            }"
          >
            <!-- 🎨 統一示意圖容器 (Unified Schematic Container) -->
            <div
              id="schematic-container"
              class="w-100 h-100"
              style="min-height: 300px; overflow: hidden"
            ></div>
          </div>
        </div>
      </div>
      <div v-else class="flex-grow-1 d-flex align-items-center justify-content-center">
        <div class="text-center">
          <div class="my-title-md-gray">此圖層沒有可用的摘要資訊</div>
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

<style scoped>
  /**
   * 🎨 D3jsTab 組件樣式 (D3jsTab Component Styles)
   *
   * 定義組件內部元素的樣式規則，使用 scoped 避免樣式污染
   * 主要樣式規則已在 common.css 中定義，此處僅包含組件特定調整
   */

  /* 📊 示意圖容器樣式 (Schematic Container Styles) */
  #schematic-container {
    position: relative;
    overflow: hidden;
  }

  /* 📝 網格文字樣式 (Grid Text Styles) */
  :deep(.grid-nodes text) {
    pointer-events: none;
    user-select: none;
  }

  /* 🎯 D3.js 圖表互動樣式 (D3.js Chart Interaction Styles) */
  :deep(.bar:hover) {
    cursor: pointer;
  }

  :deep(.scatter:hover) {
    cursor: pointer;
  }

  :deep(.dot:hover) {
    cursor: pointer;
  }
</style>
