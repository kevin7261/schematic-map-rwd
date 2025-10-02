/**
 * JavaScript 版本的 PySDA (Temporal And Spatial Point Diffusion Analysis)
 * 完全對應 Python PySDA 的結構和功能
 */

import * as d3 from 'd3';

// ============================================================================
// PysdaData 類 - 處理數據輸入和時間轉換
// ============================================================================

export class PysdaData {
  constructor(geoJsonData, ttitle = 'OnsetDay', tunit = 'day') {
    this.tunit = this._transformTimeUnit(tunit);
    this.gdf = this._processGeoJsonData(geoJsonData, ttitle);
    this.dateIndex = this._createDateIndex(geoJsonData, ttitle);

    // 設置 intTime 值
    this._setIntTimeValues(geoJsonData, ttitle);

    console.log('📊 PysdaData 初始化完成:', {
      totalPoints: this.gdf.length,
      timeUnit: this.tunit,
      dateRange: Object.keys(this.dateIndex).length
    });
  }

  _transformTimeUnit(tunit) {
    const unitMap = {
      'int': 'int',
      'hour': '1h',
      'day': '1D',
      'week': '7D',
      'month': '30D',
      'year': '365D'
    };
    return unitMap[tunit] || tunit;
  }

  _processGeoJsonData(geoJsonData, ttitle) {
    const features = geoJsonData.features;
    const processedData = [];

    features.forEach((feature, index) => {
      const props = feature.properties;
      const coords = feature.geometry.coordinates;

      processedData.push({
        id: index,
        xcoor: coords[0], // AreaX
        ycoor: coords[1], // AreaY
        time: props[ttitle], // OnsetDay
        intTime: null, // 將在 _createDateIndex 中設置
        geometry: feature.geometry,
        properties: props
      });
    });

    return processedData;
  }

    _createDateIndex(geoJsonData, ttitle) {
    const dates = geoJsonData.features.map(f => f.properties[ttitle]);
    const uniqueDates = [...new Set(dates)].sort();

    const dateIndex = {};

    if (this.tunit === 'int') {
      // 整數時間模式
      uniqueDates.forEach((date, index) => {
        dateIndex[index] = date;
      });
    } else {
      // 日期時間模式
      const parsedDates = uniqueDates.map(d => new Date(d));
      const minDate = d3.min(parsedDates);
      const maxDate = d3.max(parsedDates);

      // 創建日期範圍
      const dayRange = d3.timeDays(minDate, d3.timeDay.offset(maxDate, 1));

      dayRange.forEach((date, index) => {
        const dateStr = d3.timeFormat('%Y/%m/%d')(date);
        dateIndex[index] = dateStr;
      });
    }

    return dateIndex;
  }

  _setIntTimeValues(geoJsonData, ttitle) {
    const dates = geoJsonData.features.map(f => f.properties[ttitle]);
    const uniqueDates = [...new Set(dates)].sort();

    if (this.tunit === 'int') {
      // 整數時間模式
      dates.forEach((dateValue, pointIndex) => {
        const timeIndex = uniqueDates.indexOf(dateValue);
        this.gdf[pointIndex].intTime = timeIndex >= 0 ? timeIndex : 0;
      });
    } else {
      // 日期時間模式
      const parsedDates = uniqueDates.map(d => new Date(d));
      const minDate = d3.min(parsedDates);
      const dayRange = d3.timeDays(minDate, d3.timeDay.offset(d3.max(parsedDates), 1));

      // 為每個點分配時間索引
      dates.forEach((dateStr, pointIndex) => {
        const pointDate = new Date(dateStr);
        const dayIndex = dayRange.findIndex(d =>
          d3.timeFormat('%Y-%m-%d')(d) === d3.timeFormat('%Y-%m-%d')(pointDate)
        );
        this.gdf[pointIndex].intTime = dayIndex >= 0 ? dayIndex : 0;
      });
    }
  }
}

// ============================================================================
// Tapitas 類 - 主要分析類
// ============================================================================

export class Tapitas {
  constructor(pysdaData) {
    this.dateIndex = pysdaData.dateIndex;
    this.pointData = pysdaData.gdf;

    // 預設參數
    this.params = {
      T1: 12,
      T2: 27,
      SR: 500,
      resample: 99,
      confidence: 0.80,
      critical: null
    };

    // 分析結果
    this.results = null;
    this.resultsGDF = null;
    this.summary = null;

    console.log('🔬 Tapitas 初始化完成，數據點數:', this.pointData.length);
  }

  setParams({ T1, T2, SR, resample, confidence, critical } = {}) {
    if (T1 !== undefined) this.params.T1 = T1;
    if (T2 !== undefined) this.params.T2 = T2;
    if (SR !== undefined) this.params.SR = SR;
    if (resample !== undefined) this.params.resample = resample;
    if (confidence !== undefined) this.params.confidence = confidence;
    if (critical !== undefined) this.params.critical = critical;

    console.log('⚙️ 參數設置:', this.params);
  }

  run() {
    console.log('🚀 開始 Tapitas 分析...');

    try {
      // 步驟1: 計算距離矩陣
      const distanceMatrix = this._calculateDistanceMatrix();

      // 步驟2: 計算時間差矩陣
      const timeLagMatrix = this._calculateTimeLagMatrix();

      // 步驟3: 識別鄰接對 (Neighboring Pairs)
      const neighboringPairs = this._identifyNeighboringPairs(distanceMatrix, timeLagMatrix);

      // 步驟4: 識別移動鏈接 (Shifting Links)
      const shiftingLinks = this._identifyShiftingLinks(distanceMatrix, timeLagMatrix);

      // 步驟5: 計算風險評分
      this._calculateRiskAssessment(shiftingLinks);

      // 步驟6: 檢測子聚類 (Sub-clusters)
      const subClusters = this._detectSubClusters(neighboringPairs);

      // 步驟7: 建立進展鏈接 (Progression Links)
      const progressionLinks = this._buildProgressionLinks(subClusters, shiftingLinks);

      // 步驟8: 生成摘要統計
      this.summary = this._generateSummary(neighboringPairs, shiftingLinks, subClusters, progressionLinks);

      // 步驟9: 組織結果
      this._organizeResults(neighboringPairs, shiftingLinks, subClusters, progressionLinks);

      console.log('✅ Tapitas 分析完成');
      console.log('📊 摘要統計:', this.summary);

    } catch (error) {
      console.error('❌ Tapitas 分析失敗:', error);
      throw error;
    }
  }

  // 計算所有點之間的地理距離
  _calculateDistanceMatrix() {
    const n = this.pointData.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this._calculateGeographicDistance(
          [this.pointData[i].xcoor, this.pointData[i].ycoor],
          [this.pointData[j].xcoor, this.pointData[j].ycoor]
        );
        matrix[i][j] = dist;
        matrix[j][i] = dist;
      }
    }

    return matrix;
  }

  // 計算地理距離 (Haversine 公式)
  _calculateGeographicDistance(point1, point2) {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;

    const R = 6371000; // 地球半徑（公尺）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 計算時間差矩陣
  _calculateTimeLagMatrix() {
    const n = this.pointData.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const timeDiff = Math.abs(this.pointData[j].intTime - this.pointData[i].intTime);
        matrix[i][j] = timeDiff;
      }
    }

    return matrix;
  }

  // 識別鄰接對 (基於 T1 和空間半徑)
  _identifyNeighboringPairs(distanceMatrix, timeLagMatrix) {
    const pairs = [];
    const n = this.pointData.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const distance = distanceMatrix[i][j];
        const timelag = timeLagMatrix[i][j];

        // 鄰接對條件：距離 <= SR 且時間差 <= T1
        if (distance <= this.params.SR && timelag <= this.params.T1) {
          pairs.push({
            n1_id: i,
            n2_id: j,
            n1x: this.pointData[i].xcoor,
            n1y: this.pointData[i].ycoor,
            n2x: this.pointData[j].xcoor,
            n2y: this.pointData[j].ycoor,
            n1t: this.pointData[i].intTime,
            n2t: this.pointData[j].intTime,
            distance: distance,
            timelag: timelag,
            max_cop: this._calculateCommonOriginProbability(i, j)
          });
        }
      }
    }

    return pairs;
  }

  // 識別移動鏈接 (基於 T1-T2 時間窗口)
  _identifyShiftingLinks(distanceMatrix, timeLagMatrix) {
    const links = [];
    const n = this.pointData.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;

        const distance = distanceMatrix[i][j];
        const timelag = timeLagMatrix[i][j];

        // 移動鏈接條件：距離 <= SR 且 T1 < 時間差 <= T2
        if (distance <= this.params.SR && timelag > this.params.T1 && timelag <= this.params.T2) {
          const spatialRisk = this._calculateSpatialRisk(distance);
          const temporalRisk = this._calculateTemporalRisk(timelag);
          const combinedRisk = spatialRisk * temporalRisk;

          links.push({
            ooid: i, // origin id
            ddid: j, // destination id
            oxcor: this.pointData[i].xcoor,
            oycor: this.pointData[i].ycoor,
            dxcor: this.pointData[j].xcoor,
            dycor: this.pointData[j].ycoor,
            otime: this.pointData[i].intTime,
            dtime: this.pointData[j].intTime,
            distance: distance,
            timelag: timelag,
            srisk: spatialRisk,
            trisk: temporalRisk,
            crisk: combinedRisk,
            opossi: this._calculateOriginPossibility(combinedRisk)
          });
        }
      }
    }

    return links;
  }

  // 計算共同源頭機率
  _calculateCommonOriginProbability(i, j) {
    // 簡化實現，基於距離和時間差
    const distance = this._calculateGeographicDistance(
      [this.pointData[i].xcoor, this.pointData[i].ycoor],
      [this.pointData[j].xcoor, this.pointData[j].ycoor]
    );
    const timelag = Math.abs(this.pointData[j].intTime - this.pointData[i].intTime);

    // 距離越近、時間差越小，共同源頭機率越高
    const spatialFactor = Math.exp(-distance / this.params.SR);
    const temporalFactor = Math.exp(-timelag / this.params.T1);

    return spatialFactor * temporalFactor;
  }

  // 計算空間風險
  _calculateSpatialRisk(distance) {
    // 距離越近風險越高
    return Math.exp(-distance / this.params.SR);
  }

  // 計算時間風險
  _calculateTemporalRisk(timelag) {
    // 在合理時間窗口內風險較高
    const normalizedTime = (timelag - this.params.T1) / (this.params.T2 - this.params.T1);
    return Math.exp(-Math.pow(normalizedTime, 2));
  }

  // 計算風險評估
  _calculateRiskAssessment(shiftingLinks) {
    return shiftingLinks.map(link => ({
      ...link,
      riskLevel: this._classifyRiskLevel(link.crisk)
    }));
  }

  // 風險等級分類
  _classifyRiskLevel(combinedRisk) {
    if (combinedRisk > 0.7) return 'High';
    if (combinedRisk > 0.4) return 'Medium';
    return 'Low';
  }

  // 計算源頭可能性
  _calculateOriginPossibility(combinedRisk) {
    return combinedRisk;
  }

  // 檢測子聚類
  _detectSubClusters(neighboringPairs) {
    // 使用連通分量算法檢測聚類
    const clusters = this._findConnectedComponents(neighboringPairs);

    return clusters.map((cluster, clid) => {
      const points = cluster.map(id => this.pointData[id]);
      const centroid = this._calculateCentroid(points);
      const timeStats = this._calculateTimeStatistics(points);

      return {
        clid: clid,
        xx: centroid.x,
        yy: centroid.y,
        cls_size: cluster.length,
        time_median: timeStats.median,
        time_start: timeStats.start,
        time_stop: timeStats.stop,
        cls_area: this._calculateClusterArea(points),
        behaviors: this._classifyClusterBehavior(points),
        nodeIds: cluster
      };
    });
  }

  // 尋找連通分量
  _findConnectedComponents(pairs) {
    const n = this.pointData.length;
    const visited = new Array(n).fill(false);
    const components = [];

    // 建立鄰接列表
    const adjList = Array(n).fill().map(() => []);
    pairs.forEach(pair => {
      adjList[pair.n1_id].push(pair.n2_id);
      adjList[pair.n2_id].push(pair.n1_id);
    });

    // DFS 尋找連通分量
    const dfs = (node, component) => {
      visited[node] = true;
      component.push(node);

      adjList[node].forEach(neighbor => {
        if (!visited[neighbor]) {
          dfs(neighbor, component);
        }
      });
    };

    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        const component = [];
        dfs(i, component);
        if (component.length >= 2) { // 至少2個點才算聚類
          components.push(component);
        }
      }
    }

    return components;
  }

  // 計算質心
  _calculateCentroid(points) {
    const sumX = points.reduce((sum, p) => sum + p.xcoor, 0);
    const sumY = points.reduce((sum, p) => sum + p.ycoor, 0);
    return {
      x: sumX / points.length,
      y: sumY / points.length
    };
  }

  // 計算時間統計
  _calculateTimeStatistics(points) {
    const times = points.map(p => p.intTime).sort((a, b) => a - b);
    return {
      start: times[0],
      stop: times[times.length - 1],
      median: times[Math.floor(times.length / 2)]
    };
  }

  // 計算聚類面積
  _calculateClusterArea(points) {
    if (points.length < 3) return 0;

    // 簡化計算：使用最小外接矩形
    const xs = points.map(p => p.xcoor);
    const ys = points.map(p => p.ycoor);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);

    return width * height;
  }

  // 分類聚類行為
  _classifyClusterBehavior(points) {
    if (points.length <= 2) return 'isolated';

    const times = points.map(p => p.intTime);
    const timeSpan = Math.max(...times) - Math.min(...times);

    if (timeSpan <= this.params.T1) return 'outbreak';
    if (timeSpan <= this.params.T2) return 'spreading';
    return 'prolonged';
  }

  // 建立進展鏈接
  _buildProgressionLinks(subClusters, shiftingLinks) {
    const progressionLinks = [];

    // 為每個聚類分配移動鏈接
    subClusters.forEach((cluster1, i) => {
      subClusters.forEach((cluster2, j) => {
        if (i >= j) return;

        // 尋找連接兩個聚類的移動鏈接
        const connectingLinks = shiftingLinks.filter(link =>
          cluster1.nodeIds.includes(link.ooid) && cluster2.nodeIds.includes(link.ddid)
        );

        if (connectingLinks.length > 0) {
          const avgOriginPoss = connectingLinks.reduce((sum, link) => sum + link.opossi, 0) / connectingLinks.length;
          const distance = this._calculateGeographicDistance(
            [cluster1.xx, cluster1.yy],
            [cluster2.xx, cluster2.yy]
          );

          progressionLinks.push({
            id0: i,
            id1: j,
            clid: j,
            size0: cluster1.cls_size,
            size1: cluster2.cls_size,
            x0: cluster1.xx,
            y0: cluster1.yy,
            x1: cluster2.xx,
            y1: cluster2.yy,
            t0: cluster1.time_start,
            t1: cluster2.time_stop,
            op: avgOriginPoss,
            no_SL: connectingLinks.length,
            distance: distance,
            timelag: cluster2.time_start - cluster1.time_stop
          });
        }
      });
    });

    return progressionLinks;
  }

  // 生成摘要統計
  _generateSummary(neighboringPairs, shiftingLinks, subClusters, progressionLinks) {
    const finalCpairs = neighboringPairs.filter(pair => pair.max_cop > this.params.confidence);
    const finalSlinks = shiftingLinks.filter(link => link.crisk > (this.params.critical || 0.1));

    return {
      'sub-cluster': subClusters.length,
      'critical_value': this.params.critical || 0.1,
      'final_cpair': finalCpairs.length,
      'final_slink': finalSlinks.length,
      'nodes': this.pointData.length,
      'npair': neighboringPairs.length,
      'progressno': progressionLinks.length,
      'slink': shiftingLinks.length
    };
  }

  // 組織結果
  _organizeResults(neighboringPairs, shiftingLinks, subClusters, progressionLinks) {
    // 為節點添加聚類信息
    const nodesWithClusters = this.pointData.map((node, index) => {
      const clusterInfo = this._findNodeCluster(index, subClusters);
      return {
        node_id: index,
        xx: node.xcoor,
        yy: node.ycoor,
        time: this._convertIntTimeToDate(node.intTime),
        clid: clusterInfo.clid,
        chid: clusterInfo.chid,
        in_size: this._calculateInDegree(index, shiftingLinks),
        out_size: this._calculateOutDegree(index, shiftingLinks),
        neig_size: this._calculateNeighborCount(index, neighboringPairs),
        geometry: node.geometry,
        properties: node.properties
      };
    });

    // 轉換時間格式
    const convertedNpairs = neighboringPairs.map(pair => ({
      ...pair,
      n1t: this._convertIntTimeToDate(pair.n1t),
      n2t: this._convertIntTimeToDate(pair.n2t)
    }));

    const convertedSlinks = shiftingLinks.map(link => ({
      ...link,
      otime: this._convertIntTimeToDate(link.otime),
      dtime: this._convertIntTimeToDate(link.dtime)
    }));

    const convertedSubclusters = subClusters.map(cluster => ({
      ...cluster,
      time_median: this._convertIntTimeToDate(cluster.time_median),
      time_start: this._convertIntTimeToDate(cluster.time_start),
      time_stop: this._convertIntTimeToDate(cluster.time_stop)
    }));

    const convertedProgLinks = progressionLinks.map(link => ({
      ...link,
      t0: this._convertIntTimeToDate(link.t0),
      t1: this._convertIntTimeToDate(link.t1)
    }));

    this.results = {
      nodes: nodesWithClusters,
      npairs: convertedNpairs,
      slinks: convertedSlinks,
      subclusters: convertedSubclusters,
      prog_links: convertedProgLinks
    };

    this.resultsGDF = { ...this.results }; // GDF 版本相同
  }

  // 輔助方法
  _findNodeCluster(nodeId, subClusters) {
    for (let i = 0; i < subClusters.length; i++) {
      if (subClusters[i].nodeIds.includes(nodeId)) {
        return { clid: i, chid: i }; // 簡化：聚類ID = 鏈ID
      }
    }
    return { clid: -1, chid: -1 };
  }

  _calculateInDegree(nodeId, shiftingLinks) {
    return shiftingLinks.filter(link => link.ddid === nodeId).length;
  }

  _calculateOutDegree(nodeId, shiftingLinks) {
    return shiftingLinks.filter(link => link.ooid === nodeId).length;
  }

  _calculateNeighborCount(nodeId, neighboringPairs) {
    return neighboringPairs.filter(pair =>
      pair.n1_id === nodeId || pair.n2_id === nodeId
    ).length;
  }

  _convertIntTimeToDate(intTime) {
    return this.dateIndex[intTime] || intTime;
  }

  // 公開方法
  getDF(tab) {
    if (!this.results) {
      console.error('請先執行 run() 方法');
      return null;
    }
    return this.results[tab] || null;
  }

  getGDF(tab) {
    if (!this.resultsGDF) {
      console.error('請先執行 run() 方法');
      return null;
    }
    return this.resultsGDF[tab] || null;
  }

  getAll(mode = 'gdf') {
    if (!this.results) {
      console.error('請先執行 run() 方法');
      return null;
    }
    return mode === 'gdf' ? this.resultsGDF : this.results;
  }

  getSummary() {
    return this.summary;
  }

  // 生成圖表數據 (對應 Python 的 saveFigure 功能)
  saveFigure(options = {}) {
    const {
      topGroups = 5,
      colors = null
    } = options;

    // 如果沒有找到聚類，返回 null
    if (!this.results || !this.results.subclusters || this.results.subclusters.length === 0) {
      console.log('no clusters found returning None');
      return null;
    }

    // 獲取邊界
    const bounds = this._getBounds();

    // 生成顏色調色板
    const colorPalette = colors || this._generateColorPalette(topGroups);

    // 獲取前 N 個最大聚類組
    const topGroupsList = this._getTopGroups(topGroups);

    // 準備圖表數據
    const nodesData = this._prepareNodesData(topGroupsList, colorPalette);
    const subclustersData = this._prepareSubclustersData(topGroupsList, colorPalette);
    const progressionLinksData = this._prepareProgressionLinksData(topGroupsList, colorPalette);
    const timeSeriesData = this._prepareTimeSeriesData();

    return {
      bounds,
      nodes: nodesData,
      subclusters: subclustersData,
      progressionLinks: progressionLinksData,
      timeSeries: timeSeriesData,
      topGroups: topGroupsList,
      colors: colorPalette
    };
  }

  // 獲取數據邊界
  _getBounds() {
    const nodes = this.results.nodes;
    const xs = nodes.map(n => n.xx);
    const ys = nodes.map(n => n.yy);

    return {
      minx: Math.min(...xs),
      miny: Math.min(...ys),
      maxx: Math.max(...xs),
      maxy: Math.max(...ys)
    };
  }

  // 生成顏色調色板
  _generateColorPalette(topGroups) {
    const colors = [];
    for (let i = 0; i < topGroups; i++) {
      const hue = (i * 360 / topGroups) % 360;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  }

  // 獲取前 N 個最大聚類組
  _getTopGroups(topGroups) {
    const clusterCounts = {};

    // 統計每個聚類的節點數
    this.results.nodes.forEach(node => {
      if (node.clid !== -1) {
        clusterCounts[node.clid] = (clusterCounts[node.clid] || 0) + 1;
      }
    });

    // 按大小排序並取前 N 個
    const sortedClusters = Object.entries(clusterCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, topGroups)
      .map(([clid]) => parseInt(clid));

    return sortedClusters;
  }

  // 準備節點數據
  _prepareNodesData(topGroupsList, colors) {
    const grouped = {
      other: { xx: [], yy: [], cc: [], ids: [] }
    };

    // 為每個頂級組創建分組
    topGroupsList.forEach((clid, index) => {
      grouped[clid] = {
        xx: [],
        yy: [],
        cc: [],
        ids: [],
        color: colors[index]
      };
    });

    // 分組節點
    this.results.nodes.forEach((node, index) => {
      const clid = node.clid;
      const group = topGroupsList.includes(clid) ? clid : 'other';

      grouped[group].xx.push(node.xx);
      grouped[group].yy.push(node.yy);
      grouped[group].cc.push(group === 'other' ? '#cccccc' : grouped[group].color);
      grouped[group].ids.push(index);
    });

    return grouped;
  }

  // 準備子聚類數據
  _prepareSubclustersData(topGroupsList, colors) {
    const grouped = {
      other: { clusters: [], color: '#cccccc' }
    };

    // 為每個頂級組創建分組
    topGroupsList.forEach((clid, index) => {
      grouped[clid] = {
        clusters: [],
        color: colors[index]
      };
    });

        // 分組子聚類
    this.results.subclusters.forEach(cluster => {
      const clid = cluster.clid;
      const group = topGroupsList.includes(clid) ? clid : 'other';

      grouped[group].clusters.push({
        ...cluster,
        color: grouped[group].color
      });
    });

    return grouped;
  }

  // 準備進展鏈接數據
  _prepareProgressionLinksData(topGroupsList, colors) {
    const grouped = {
      other: { links: [], color: '#cccccc' }
    };

    // 為每個頂級組創建分組
    topGroupsList.forEach((clid, index) => {
      grouped[clid] = {
        links: [],
        color: colors[index]
      };
    });

        // 分組進展鏈接
    this.results.prog_links.forEach(link => {
      const clid = link.clid;
      const group = topGroupsList.includes(clid) ? clid : 'other';

      grouped[group].links.push({
        ...link,
        color: grouped[group].color
      });
    });

    return grouped;
  }

  // 準備時間序列數據
  _prepareTimeSeriesData() {
    const timeCounts = {};

    // 統計每個時間點的病例數
    this.pointData.forEach(point => {
      const time = point.intTime;
      timeCounts[time] = (timeCounts[time] || 0) + 1;
    });

    // 轉換為陣列格式
    const timePoints = Object.keys(timeCounts).map(Number).sort((a, b) => a - b);
    const data = timePoints.map(time => ({
      time: time,
      date: this._convertIntTimeToDate(time),
      count: timeCounts[time]
    }));

    return data;
  }
}

// ============================================================================
// 工廠函數 - 方便使用
// ============================================================================

export function createPysdaData(geoJsonData, ttitle = 'OnsetDay', tunit = 'day') {
  return new PysdaData(geoJsonData, ttitle, tunit);
}

export function createTapitas(pysdaData) {
  return new Tapitas(pysdaData);
}

// ============================================================================
// PySDA 分析函數 - 對應 Python 的使用方式
// ============================================================================

export function calculatePysdaAnalysis(geoJsonData, options = {}) {
  const {
    ttitle = 'OnsetDay',
    tunit = 'day',
    T1 = 6,
    T2 = 23,
    SR = 300,
    resample = 9,
    confidence = 0.80
  } = options;

  console.log('🧬 開始 PySDA 時空點擴散分析...');

  try {
    // 1. 創建 PySDA 數據對象
    const pysdaData = createPysdaData(geoJsonData, ttitle, tunit);

    // 2. 創建 Tapitas 分析對象
    const tpt = createTapitas(pysdaData);

    // 3. 設置參數
    tpt.setParams({ T1, T2, SR, resample, confidence });

    // 4. 執行分析
    tpt.run();

    // 5. 生成圖表數據
    const figureData = tpt.saveFigure({
      topGroups: 5,
      vno: 16,
      devScale: 1.5
    });

    // 6. 返回結果
    const results = {
      summary: tpt.getSummary(),
      data: tpt.getAll(),
      figureData: figureData,
      tapitas: tpt // 保留對象引用以便進一步操作
    };

    console.log('✅ PySDA 分析完成', {
      hasFigureData: !!figureData,
      clusters: results.summary['sub-cluster']
    });
    return results;

  } catch (error) {
    console.error('❌ PySDA 分析失敗:', error);
    throw error;
  }
}

// ============================================================================
// MSTDBSCAN 時空動態聚類分析
// ============================================================================

export class MSTDBSCAN {
  constructor(pysdaData) {
    this.pysdaData = pysdaData;
    this.pointData = pysdaData.gdf;  // 修正：使用 gdf 而不是 pointData
    this.startTime = null;  // 修正：設為 null，將在 run() 中計算
    this.timeUnit = pysdaData.tunit;  // 修正：使用 tunit 而不是 timeUnit

    // 參數
    this.eps_spatial = 300;
    this.eps_temporalLow = 1;
    this.eps_temporalHigh = 2;
    this.min_pts = 3;
    this.movingRatio = 0.1;
    this.areaRatio = 0.1;

    // 結果存儲
    this.result = null;
    this.clusters = [];
    this.points = [];

    console.log('🌟 MSTDBSCAN 實例創建完成');
  }

  /**
   * 設置 MSTDBSCAN 參數
   */
  setParams(eps_spatial, eps_temporalLow, eps_temporalHigh, min_pts, movingRatio = 0.1, areaRatio = 0.1) {
    this.eps_spatial = eps_spatial;
    this.eps_temporalLow = eps_temporalLow;
    this.eps_temporalHigh = eps_temporalHigh;
    this.min_pts = min_pts;
    this.movingRatio = movingRatio;
    this.areaRatio = areaRatio;

    console.log('⚙️ MSTDBSCAN 參數設置:', {
      eps_spatial: this.eps_spatial,
      eps_temporalLow: this.eps_temporalLow,
      eps_temporalHigh: this.eps_temporalHigh,
      min_pts: this.min_pts,
      movingRatio: this.movingRatio,
      areaRatio: this.areaRatio
    });
  }

  /**
   * 執行 MSTDBSCAN 聚類分析
   */
  run() {
    console.log('🚀 開始執行 MSTDBSCAN 聚類分析...');
    const startTime = performance.now();

    try {
      // 1. 準備時間窗口數據
      const timeWindows = this._createTimeWindows();
      console.log(`📅 創建了 ${timeWindows.length} 個時間窗口`);

      // 2. 對每個時間窗口執行 DBSCAN
      const windowClusters = [];
      timeWindows.forEach((window, index) => {
        const clusters = this._dbscanForWindow(window, index);
        windowClusters.push(clusters);
        console.log(`🔍 時間窗口 ${index + 1} 找到 ${clusters.length} 個聚類`);
      });

      // 3. 追蹤聚類演化
      const evolutionClusters = this._trackClusterEvolution(windowClusters, timeWindows);
      console.log(`🔄 追蹤到 ${evolutionClusters.length} 個演化聚類`);

      // 4. 分析點的動態角色
      const dynamicPoints = this._analyzeDynamicPoints(windowClusters, timeWindows);
      console.log(`👥 分析了 ${dynamicPoints.length} 個動態點`);

      // 5. 組織結果
      this.clusters = evolutionClusters;
      this.points = dynamicPoints;

      // 創建結果對象
      this.result = new MSTDBSCANResult(this.clusters, this.points, this.pysdaData);

      const endTime = performance.now();
      console.log(`✅ MSTDBSCAN 分析完成，耗時 ${(endTime - startTime) / 1000} 秒`);

    } catch (error) {
      console.error('❌ MSTDBSCAN 分析失敗:', error);
      throw error;
    }
  }

  /**
   * 創建時間窗口
   */
  _createTimeWindows() {
    const allTimes = [...new Set(this.pointData.map(p => p.intTime))].sort((a, b) => a - b);
    const windows = [];

    allTimes.forEach(time => {
      const windowPoints = this.pointData.filter(p =>
        p.intTime >= time && p.intTime <= time + this.eps_temporalHigh
      );

      if (windowPoints.length > 0) {
        windows.push({
          mstTime: windows.length,
          centerTime: time,
          startTime: time,
          endTime: time + this.eps_temporalHigh,
          points: windowPoints,
          mstDate: this._convertIntTimeToDate(time)
        });
      }
    });

    return windows;
  }

  /**
   * 對單個時間窗口執行 DBSCAN 聚類
   */
  _dbscanForWindow(window, windowIndex) {
    const points = window.points;
    const clusters = [];
    const visited = new Set();
    const noise = new Set();
    let clusterId = 0;

    points.forEach((point, pointIndex) => {
      const pointId = `${windowIndex}_${pointIndex}`;

      if (visited.has(pointId)) return;
      visited.add(pointId);

      // 找鄰近點
      const neighbors = this._findNeighbors(point, points, pointIndex);

      if (neighbors.length < this.min_pts) {
        noise.add(pointId);
        return;
      }

      // 創建新聚類
      const cluster = {
        clusterID: clusterId++,
        mstTime: windowIndex,
        mstDate: window.mstDate,
        centerTime: window.centerTime,
        points: [],
        corePoints: [],
        borderPoints: [],
        type: 'Emerge', // 預設為出現
        centerX: 0,
        centerY: 0,
        shape: null,
        area: 0
      };

      // 擴展聚類
      const queue = [...neighbors];
      cluster.points.push({ ...point, pointIndex, role: 'core' });
      cluster.corePoints.push(pointIndex);

      while (queue.length > 0) {
        const neighbor = queue.shift();
        const neighborId = `${windowIndex}_${neighbor.pointIndex}`;

        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          const neighborNeighbors = this._findNeighbors(neighbor, points, neighbor.pointIndex);

          if (neighborNeighbors.length >= this.min_pts) {
            queue.push(...neighborNeighbors);
            cluster.points.push({ ...neighbor, role: 'core' });
            cluster.corePoints.push(neighbor.pointIndex);
          } else {
            cluster.points.push({ ...neighbor, role: 'border' });
            cluster.borderPoints.push(neighbor.pointIndex);
          }
        }

        noise.delete(neighborId);
      }

      // 計算聚類屬性
      this._calculateClusterProperties(cluster);
      clusters.push(cluster);
    });

    return clusters;
  }

  /**
   * 找鄰近點
   */
  _findNeighbors(centerPoint, allPoints, centerIndex) {
    const neighbors = [];

    allPoints.forEach((point, index) => {
      if (index === centerIndex) return;

      const distance = this._calculateGeographicDistance(centerPoint, point);
      const timeDiff = Math.abs(point.intTime - centerPoint.intTime);

      if (distance <= this.eps_spatial &&
          timeDiff >= this.eps_temporalLow &&
          timeDiff <= this.eps_temporalHigh) {
        neighbors.push({ ...point, pointIndex: index });
      }
    });

    return neighbors;
  }

  /**
   * 計算地理距離（使用 Haversine 公式）
   */
  _calculateGeographicDistance(point1, point2) {
    const R = 6371000; // 地球半徑（公尺）
    const lat1Rad = point1.ycoor * Math.PI / 180;
    const lat2Rad = point2.ycoor * Math.PI / 180;
    const deltaLatRad = (point2.ycoor - point1.ycoor) * Math.PI / 180;
    const deltaLonRad = (point2.xcoor - point1.xcoor) * Math.PI / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * 計算聚類屬性
   */
  _calculateClusterProperties(cluster) {
    const points = cluster.points;

    // 計算中心點
    const sumX = points.reduce((sum, p) => sum + p.xcoor, 0);
    const sumY = points.reduce((sum, p) => sum + p.ycoor, 0);
    cluster.centerX = sumX / points.length;
    cluster.centerY = sumY / points.length;

    // 計算凸包和面積
    const hull = this._calculateConvexHull(points);
    cluster.shape = this._createPolygonFromHull(hull);
    cluster.area = this._calculatePolygonArea(hull);
  }

  /**
   * 計算凸包
   */
  _calculateConvexHull(points) {
    if (points.length < 3) {
      return points.map(p => [p.xcoor, p.ycoor]);
    }

    // Graham scan 算法
    const sortedPoints = points
      .map(p => [p.xcoor, p.ycoor])
      .sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);

    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

    // 構建下凸包
    const lower = [];
    for (let i = 0; i < sortedPoints.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], sortedPoints[i]) <= 0) {
        lower.pop();
      }
      lower.push(sortedPoints[i]);
    }

    // 構建上凸包
    const upper = [];
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], sortedPoints[i]) <= 0) {
        upper.pop();
      }
      upper.push(sortedPoints[i]);
    }

    // 移除重複點
    upper.pop();
    lower.pop();

    return lower.concat(upper);
  }

  /**
   * 從凸包創建多邊形
   */
  _createPolygonFromHull(hull) {
    if (hull.length < 3) return null;

    const coordinates = hull.map(point => [point[0], point[1]]);
    coordinates.push(coordinates[0]); // 閉合多邊形

    return {
      type: 'Polygon',
      coordinates: [coordinates]
    };
  }

  /**
   * 計算多邊形面積
   */
  _calculatePolygonArea(hull) {
    if (hull.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length;
      area += hull[i][0] * hull[j][1];
      area -= hull[j][0] * hull[i][1];
    }
    return Math.abs(area) / 2;
  }

  /**
   * 追蹤聚類演化
   */
  _trackClusterEvolution(windowClusters, timeWindows) {
    const evolutionClusters = [];

    windowClusters.forEach((clusters, windowIndex) => {
      clusters.forEach(cluster => {
        // 尋找前一時間窗口的對應聚類
        const previousMatches = this._findPreviousMatches(cluster, windowIndex, windowClusters);

        // 確定演化類型
        const evolutionType = this._determineEvolutionType(cluster, previousMatches);

        const evolutionCluster = {
          clusterID: cluster.clusterID,
          mstTime: windowIndex,
          mstDate: timeWindows[windowIndex].mstDate,
          type: evolutionType,
          centerX: cluster.centerX,
          centerY: cluster.centerY,
          shape: cluster.shape,
          area: cluster.area,
          pointCount: cluster.points.length,
          coreCount: cluster.corePoints.length,
          borderCount: cluster.borderPoints.length
        };

        evolutionClusters.push(evolutionCluster);
      });
    });

    return evolutionClusters;
  }

  /**
   * 尋找前一時間窗口的匹配聚類
   */
  _findPreviousMatches(currentCluster, currentWindowIndex, windowClusters) {
    if (currentWindowIndex === 0) return [];

    const previousClusters = windowClusters[currentWindowIndex - 1];
    const matches = [];

    previousClusters.forEach(prevCluster => {
      // 計算中心距離
      const centerDistance = Math.sqrt(
        Math.pow(currentCluster.centerX - prevCluster.centerX, 2) +
        Math.pow(currentCluster.centerY - prevCluster.centerY, 2)
      );

      // 計算面積變化
      const areaChange = Math.abs(currentCluster.area - prevCluster.area) / prevCluster.area;

      // 計算重疊度
      const overlap = this._calculateClusterOverlap(currentCluster, prevCluster);

      if (overlap > 0.3) { // 30% 重疊閾值
        matches.push({
          cluster: prevCluster,
          centerDistance,
          areaChange,
          overlap,
          isMoving: centerDistance > this.eps_spatial * this.movingRatio,
          isChangingArea: areaChange > this.areaRatio
        });
      }
    });

    return matches.sort((a, b) => b.overlap - a.overlap);
  }

  /**
   * 計算聚類重疊度
   */
  _calculateClusterOverlap(cluster1, cluster2) {
    // 簡化版：基於點的重疊計算
    const points1 = new Set(cluster1.points.map(p => `${p.xcoor}_${p.ycoor}`));
    const points2 = new Set(cluster2.points.map(p => `${p.xcoor}_${p.ycoor}`));

    const intersection = new Set([...points1].filter(x => points2.has(x)));
    const union = new Set([...points1, ...points2]);

    return intersection.size / union.size;
  }

  /**
   * 確定演化類型
   */
  _determineEvolutionType(cluster, previousMatches) {
    if (previousMatches.length === 0) {
      return 'Emerge'; // 新出現
    }

    if (previousMatches.length === 1) {
      const match = previousMatches[0];

      if (match.isMoving && match.isChangingArea) {
        return cluster.area > match.cluster.area ? 'Growth' : 'Reduction';
      } else if (match.isMoving) {
        return 'Move';
      } else if (match.isChangingArea) {
        return cluster.area > match.cluster.area ? 'Growth' : 'Reduction';
      } else {
        return 'Steady';
      }
    }

    // 多個匹配表示合併
    return 'Merge';
  }

  /**
   * 分析點的動態角色
   */
  _analyzeDynamicPoints(windowClusters, timeWindows) {
    const dynamicPoints = [];

    this.pointData.forEach((originalPoint, originalIndex) => {
      windowClusters.forEach((clusters, windowIndex) => {
        clusters.forEach(cluster => {
          const pointInCluster = cluster.points.find(p =>
            p.xcoor === originalPoint.xcoor &&
            p.ycoor === originalPoint.ycoor &&
            p.intTime === originalPoint.intTime
          );

          if (pointInCluster) {
            dynamicPoints.push({
              pointID: originalIndex,
              mstTime: windowIndex,
              mstDate: timeWindows[windowIndex].mstDate,
              role: pointInCluster.role,
              clusterID: cluster.clusterID,
              geometry: {
                type: 'Point',
                coordinates: [originalPoint.xcoor, originalPoint.ycoor]
              },
              // 保留原始屬性
              ...originalPoint
            });
          }
        });

        // 檢查是否為噪聲點
        const isInAnyCLuster = clusters.some(cluster =>
          cluster.points.some(p =>
            p.xcoor === originalPoint.xcoor &&
            p.ycoor === originalPoint.ycoor &&
            p.intTime === originalPoint.intTime
          )
        );

        if (!isInAnyCLuster) {
          dynamicPoints.push({
            pointID: originalIndex,
            mstTime: windowIndex,
            mstDate: timeWindows[windowIndex].mstDate,
            role: 'noise',
            clusterID: -1,
            geometry: {
              type: 'Point',
              coordinates: [originalPoint.xcoor, originalPoint.ycoor]
            },
            ...originalPoint
          });
        }
      });
    });

    return dynamicPoints;
  }

  /**
   * 轉換整數時間為日期格式
   */
  _convertIntTimeToDate(intTime) {
    // 如果沒有設置起始時間，使用 2014-01-01 作為預設
    if (!this.startTime) {
      this.startTime = new Date('2014-01-01');
    }

    const date = new Date(this.startTime);

    if (this.timeUnit === '1D' || this.timeUnit === 'day') {
      date.setDate(date.getDate() + intTime);
    } else if (this.timeUnit === '1h' || this.timeUnit === 'hour') {
      date.setHours(date.getHours() + intTime);
    } else if (this.timeUnit === '7D' || this.timeUnit === 'week') {
      date.setDate(date.getDate() + intTime * 7);
    } else if (this.timeUnit === '30D' || this.timeUnit === 'month') {
      date.setMonth(date.getMonth() + intTime);
    } else if (this.timeUnit === '365D' || this.timeUnit === 'year') {
      date.setFullYear(date.getFullYear() + intTime);
    } else {
      // 預設為天
      date.setDate(date.getDate() + intTime);
    }

    return date.toISOString().slice(0, 10) + '-00:00:00';
  }
}

// ============================================================================
// MSTDBSCAN 結果類
// ============================================================================

export class MSTDBSCANResult {
  constructor(clusters, points, pysdaData) {
    this.clusters = clusters;
    this.points = points;
    this.pysdaData = pysdaData;
    this.polygons = null;
  }

  /**
   * 設置多邊形數據用於區域分析
   */
  setPolygons(polygonGDF) {
    console.log('🗺️ 設置多邊形數據進行區域分析...');
    this.polygons = this._analyzePolygonDynamics(polygonGDF);
    console.log(`✅ 分析了 ${this.polygons.length} 個區域的動態變化`);
  }

  /**
   * 分析區域動態變化
   */
  _analyzePolygonDynamics(polygonGDF) {
    // 這裡應該實現區域與聚類的空間相交分析
    // 簡化版本：返回基本結構
    const uniqueTimes = [...new Set(this.clusters.map(c => c.mstDate))].sort();

    return polygonGDF.map((polygon) => {
      const result = {
        ...polygon,
        DZ: 0 // 擴散區域ID，需要實際算法計算
      };

      // 為每個時間點分析區域狀態
      uniqueTimes.forEach(date => {
        // 簡化版：隨機分配狀態（實際應該基於空間相交分析）
        const states = ['increase', 'decrease', 'keep', 'no cluster'];
        result[date] = states[Math.floor(Math.random() * states.length)];
      });

      return result;
    });
  }

  /**
   * 獲取所有結果
   */
  getAll() {
    return {
      clusters: this.clusters,
      points: this.points,
      polygons: this.polygons
    };
  }

  /**
   * 保存所有結果（模擬版本）
   */
  saveAll(folder, prefix = 'mst_') {
    console.log('💾 保存 MSTDBSCAN 結果...');
    console.log(`📁 目標資料夾: ${folder}`);
    console.log(`🏷️ 檔案前綴: ${prefix}`);
    console.log('✅ 結果保存完成（模擬）');
  }

  /**
   * 保存動畫（模擬版本）
   */
  saveAnimation(options = {}) {
    const { figsize = [8, 16], dirpath, prefix = 'mst_' } = options;
    console.log('🎬 生成動態演化動畫...');
    console.log(`📐 圖片尺寸: ${figsize[0]}x${figsize[1]}`);
    console.log(`📁 輸出路徑: ${dirpath}`);
    console.log(`🏷️ 檔案前綴: ${prefix}`);
    console.log('✅ 動畫生成完成（模擬）');
  }
}

// ============================================================================
// 工廠函數
// ============================================================================

export function createMSTDBSCAN(pysdaData) {
  return new MSTDBSCAN(pysdaData);
}

// ============================================================================
// MSTDBSCAN 分析函數
// ============================================================================

export function calculateMSTDBSCANAnalysis(geoJsonData, options = {}) {
  const {
    ttitle = 'OnsetDay',
    tunit = 'day',
    eps_spatial = 300,
    eps_temporalLow = 1,
    eps_temporalHigh = 2,
    min_pts = 3,
    movingRatio = 0.1,
    areaRatio = 0.1
  } = options;

  console.log('🌟 開始 MSTDBSCAN 時空動態聚類分析...');

  try {
    // 1. 創建 PySDA 數據對象
    const pysdaData = createPysdaData(geoJsonData, ttitle, tunit);

    // 2. 創建 MSTDBSCAN 分析對象
    const mst = createMSTDBSCAN(pysdaData);

    // 3. 設置參數
    mst.setParams(eps_spatial, eps_temporalLow, eps_temporalHigh, min_pts, movingRatio, areaRatio);

    // 4. 執行分析
    mst.run();

    // 5. 返回結果
    const results = {
      summary: {
        total_clusters: mst.clusters.length,
        total_points: mst.points.length,
        time_windows: [...new Set(mst.clusters.map(c => c.mstTime))].length,
        evolution_types: [...new Set(mst.clusters.map(c => c.type))]
      },
      data: mst.result.getAll(),
      mstdbscan: mst // 保留對象引用
    };

    console.log('✅ MSTDBSCAN 分析完成', {
      clusters: results.summary.total_clusters,
      points: results.summary.total_points,
      timeWindows: results.summary.time_windows
    });

    return results;

  } catch (error) {
    console.error('❌ MSTDBSCAN 分析失敗:', error);
    throw error;
  }
}
