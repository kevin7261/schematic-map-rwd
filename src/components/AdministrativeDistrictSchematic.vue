<template>
  <div class="administrative-district-schematic">
    <div id="diagram" class="w-100 h-100" style="min-height: 400px"></div>
  </div>
</template>

<script setup>
  /**
   * 📊 AdministrativeDistrictSchematic.vue - 行政區分布示意圖組件
   *
   * 功能說明：
   * 1. 📊 載入示意圖數據 - 從 data.json 載入行政區數據
   * 2. 🎨 繪製網格系統 - 主要和次要網格線
   * 3. 🔗 節點連接渲染 - 根據節點類型繪製不同的連接線和圓弧
   * 4. 📝 數值標籤顯示 - 在節點位置顯示數值
   * 5. 📱 響應式設計 - 根據容器大小自動調整
   *
   * @component AdministrativeDistrictSchematic
   * @version 1.0.0
   * @author Kevin Cheng
   */

  import { ref, onMounted, onUnmounted, nextTick } from 'vue';
  import * as d3 from 'd3';

  // 響應式數據
  const nodeData = ref(null);
  const linkData = ref(null);

  // 常數設定
  const COLOR_BACKGROUND = '#212121';
  const COLOR_GRID = '#666666';
  const COLOR_GRID_2 = '#333333';
  const MIN_GRID_WIDTH = 30;
  const MIN_GRID_HEIGHT = 30;

  /**
   * 📊 載入示意圖數據 (Load Schematic Data)
   */
  const loadData = async () => {
    try {
      // 使用 fetch 載入 data.json
      const response = await fetch('./data/data.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const schematicData = await response.json();
      console.log('response', response);

      // 直接使用 data.json 的數據格式
      nodeData.value = schematicData;
      console.log('nodeData', nodeData.value);
      setLinkData();
      await nextTick();
      resize();
    } catch (error) {
      console.log(error);
      // 如果載入失敗，顯示錯誤訊息
      console.error('無法載入 data.json 文件');
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
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  };

  /**
   * 🎨 繪製示意圖 (Draw Schematic Diagram)
   */
  const draw = () => {
    if (!nodeData.value) return;

    // 畫布長寬px
    let dimensions = getDimensions();
    console.log('dimensions', dimensions);

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
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

    // 清除之前的圖表
    d3.select('#diagram').selectAll('svg').remove();

    // 創建 SVG 元素
    const svg = d3
      .select('#diagram')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', COLOR_BACKGROUND);

    // 計算網格尺寸
    let gridWidth = width / xMax;
    let gridHeight = height / yMax;

    let minWidth = MIN_GRID_WIDTH * xMax;
    let minHeight = MIN_GRID_HEIGHT * yMax;

    if (gridWidth < MIN_GRID_WIDTH) {
      xMax = parseInt(width / MIN_GRID_WIDTH);
    }

    if (gridHeight < MIN_GRID_HEIGHT) {
      yMax = parseInt(height / MIN_GRID_HEIGHT);
    }

    console.log('width height', width, height);
    console.log('xMax yMax', xMax, yMax);
    console.log('gridWidth gridHeight', gridWidth, gridHeight);
    console.log('minWidth minHeight', minWidth, minHeight);

    // 設定比例尺
    const x = d3.scaleLinear().domain([0, xMax]).range([0, width]);
    const y = d3.scaleLinear().domain([yMax, 0]).range([0, height]);

    // 繪製主要網格線
    for (let i = 0; i <= xMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_GRID)
        .attr('x1', x(i))
        .attr('y1', 0)
        .attr('x2', x(i))
        .attr('y2', height);
    }

    for (let i = 0; i <= yMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_GRID)
        .attr('x1', 0)
        .attr('y1', y(i))
        .attr('x2', width)
        .attr('y2', y(i));
    }

    // 繪製次要網格線
    for (let i = 0; i <= xMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_GRID_2)
        .attr('x1', (x(i) + x(i + 1)) / 2)
        .attr('y1', 0)
        .attr('x2', (x(i) + x(i + 1)) / 2)
        .attr('y2', height);
    }

    for (let i = 0; i <= yMax; i++) {
      svg
        .append('line')
        .style('stroke', COLOR_GRID_2)
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
   * 📏 調整尺寸 (Resize)
   */
  const resize = () => {
    draw();
  };

  // 組件掛載
  onMounted(async () => {
    console.log('mounted');
    await loadData();
    await nextTick();
    resize();

    // 監聽窗口大小變化
    window.addEventListener('resize', resize);
  });

  // 組件卸載
  onUnmounted(() => {
    window.removeEventListener('resize', resize);
  });
</script>
