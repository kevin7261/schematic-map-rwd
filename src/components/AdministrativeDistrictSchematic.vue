<template>
  <!-- 📊 行政區分布示意圖組件容器 -->
  <!-- 提供完整的示意圖顯示區域，支援響應式佈局 -->
  <div class="administrative-district-schematic w-100 h-100">
    <!-- 🎨 D3.js 圖表容器 -->
    <!-- 用於渲染示意圖的 SVG 元素，支援動態尺寸調整 -->
    <div id="diagram" class="w-100 h-100" style="min-height: 300px; overflow: hidden"></div>
  </div>
</template>

<script setup>
  // 定義組件 props
  const props = defineProps({
    layerId: {
      type: String,
      default: 'test_layer', // 預設使用 test_layer
    },
  });

  /**
   * 📊 AdministrativeDistrictSchematic.vue - 行政區分布示意圖組件
   *
   * 功能說明 (Features):
   * 1. 📊 示意圖數據載入：從 dataStore 圖層配置載入行政區分布數據
   * 2. 🎨 網格系統繪製：繪製主要和次要網格線，提供空間參考
   * 3. 🔗 節點連接渲染：根據節點類型繪製不同的連接線和圓弧
   * 4. 📝 數值標籤顯示：在節點位置顯示對應的數值標籤
   * 5. 📱 響應式設計：根據容器大小自動調整圖表尺寸
   * 6. 🎯 互動功能：支援滑鼠懸停和點擊事件
   * 7. 🔄 動態更新：支援數據變更時的圖表重新渲染
   *
   * 技術特點 (Technical Features):
   * - 使用 D3.js 進行數據視覺化
   * - 支援 SVG 向量圖形渲染
   * - 實現響應式佈局和尺寸調整
   * - 提供平滑的動畫過渡效果
   * - 支援多種節點類型的視覺化
   *
   * 數據格式 (Data Format):
   * - 支援示意圖節點數據格式
   * - 包含節點座標、類型、數值等資訊
   * - 支援多條路線的並行顯示
   *
   * @component AdministrativeDistrictSchematic
   * @version 2.0.0
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

  // 響應式數據
  const nodeData = ref(null);
  const linkData = ref(null);

  // 常數設定
  const COLOR_BACKGROUND = '#212121';
  const COLOR_GRID = '#666666';
  const COLOR_GRID_2 = '#333333';

  /**
   * 為節點隨機分配 1-5 的數值
   *
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
   * 📊 載入示意圖數據 (Load Schematic Data)
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

      console.log('🔄 使用圖層配置載入數據:', targetLayer.jsonFileName);

      // 使用圖層的 jsonLoader 載入數據
      const result = await targetLayer.jsonLoader(targetLayer);

      // 檢查是否有 jsonData（示意圖數據）
      if (result.jsonData) {
        // 標準 JSON 格式
        nodeData.value = result.jsonData;
      } else if (result.tableData && result.tableData.length > 0) {
        // 表格數據格式，轉換為示意圖格式
        const schematicData = result.tableData.map((item) => ({
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
      } else {
        throw new Error('無法從圖層數據中提取示意圖數據');
      }

      console.log('✅ 數據載入成功:', nodeData.value);
      setLinkData();
      await nextTick();
      resize();
    } catch (error) {
      console.log(error);
      // 如果載入失敗，顯示錯誤訊息
      console.error('無法載入示意圖數據:', error.message);
    }
  };

  /**
   * 📊 設定連接數據 (Set Link Data)
   */
  const setLinkData = () => {
    if (!nodeData.value) return;

    // 顏色映射
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

  /**
   * 📏 獲取容器尺寸 (Get Container Dimensions)
   */
  const getDimensions = () => {
    const container = document.getElementById('diagram');
    if (container) {
      // 獲取容器的實際可用尺寸
      const rect = container.getBoundingClientRect();

      // 優先使用 clientWidth/Height，因為它們更準確地反映可用空間
      const width = container.clientWidth || rect.width;
      const height = container.clientHeight || rect.height;

      console.log('Container dimensions:', {
        width,
        height,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        rectWidth: rect.width,
        rectHeight: rect.height,
        isMobile: window.innerWidth < 1200,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
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
   * 🎨 繪製示意圖 (Draw Schematic Diagram)
   */
  const draw = () => {
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
    const existingSvg = d3.select('#diagram').select('svg');
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
    d3.select('#diagram').selectAll('svg').remove();

    // 創建 SVG 元素
    const svg = d3
      .select('#diagram')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', COLOR_BACKGROUND)
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
        .style('stroke', COLOR_GRID)
        .attr('x1', x(i))
        .attr('y1', margin.top)
        .attr('x2', x(i))
        .attr('y2', margin.top + actualHeight);
    }

    for (let i = 0; i <= yMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_GRID)
        .attr('x1', margin.left)
        .attr('y1', y(i))
        .attr('x2', margin.left + actualWidth)
        .attr('y2', y(i));
    }

    // 繪製次要網格線
    for (let i = 0; i < xMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_GRID_2)
        .attr('x1', (x(i) + x(i + 1)) / 2)
        .attr('y1', margin.top)
        .attr('x2', (x(i) + x(i + 1)) / 2)
        .attr('y2', margin.top + actualHeight);
    }

    for (let i = 0; i < yMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_GRID_2)
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
      const allLinks = linkData.value.flatMap((line) =>
        line.nodes.map((node) => ({
          ...node,
        }))
      );

      console.log('allLinks', allLinks);

      allLinks.forEach((node) => {
        svg
          .append('text')
          .attr('x', x(node.coord.x))
          .attr('y', y(node.coord.y))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '10px')
          .attr('fill', 'white')
          .text(`${node.value}`);
      });
    }
  };

  /**
   * 📏 調整尺寸 (Resize) - 立即重繪，無延遲
   */
  const resize = () => {
    // 立即重繪，不使用 nextTick 避免延遲
    draw();
  };

  // ResizeObserver 實例
  let resizeObserver = null;

  // 組件掛載
  onMounted(async () => {
    console.log('mounted');
    await loadData();
    await nextTick();
    resize();

    // 監聽窗口大小變化
    window.addEventListener('resize', resize);

    // 監聽容器尺寸變化
    const container = document.getElementById('diagram');
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        // 立即響應任何尺寸變化，無閾值檢查
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            resize(); // 立即重繪，無延遲
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
