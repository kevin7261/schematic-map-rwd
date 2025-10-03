/**
 * 📊 數據處理核心模組 (Data Processing Core Module)
 *
 * 功能說明 (Features):
 * 1. 📁 通用檔案載入：支援 GeoJSON、Excel 等多種格式
 * 2. 🔗 數據合併：GeoJSON 與 Excel 的智能合併（基於鍵值對應）
 * 3. 🎨 值域分級與顏色指定：支援多種分類方法和顏色方案
 * 4. 📋 數據預處理：點/面資料的標準化處理
 * 5. 📊 表格/摘要資料建構：生成統計摘要和數據表格
 * 6. 🧮 空間分析數據準備：為空間統計分析準備數據
 *
 * 支援的數據格式 (Supported Data Formats):
 * - GeoJSON：地理空間數據標準格式
 * - Excel (.xlsx)：統計數據和屬性信息
 * - CSV：表格數據（通過 Excel 載入）
 * - JSON：配置文件和元數據
 *
 * 分類方法 (Classification Methods):
 * - Jenks Natural Breaks：自然斷點分類
 * - Equal Interval：等距分類
 * - Quantile：分位數分類
 * - Custom：自定義分類
 *
 * 顏色方案 (Color Schemes):
 * - Viridis：科學視覺化標準色彩
 * - Spectral：光譜色彩方案
 * - RdYlBu：紅黃藍色彩方案
 * - 自定義：支援用戶定義顏色
 *
 * 技術特點 (Technical Features):
 * - 異步數據載入，支援大型數據集
 * - 智能數據類型檢測和轉換
 * - 完整的錯誤處理和驗證機制
 * - 記憶體優化的數據處理流程
 * - 支援增量數據更新
 *
 * @file dataProcessor.js
 * @version 2.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 */
// ==================== 📦 第三方庫引入 (Third-Party Library Imports) ====================

/**
 * XLSX 庫引入
 * 用於處理 Excel 文件（.xlsx, .xls）的讀寫操作
 * 支援多工作表、數據類型檢測和格式轉換
 *
 * @see https://sheetjs.com/
 */
import * as XLSX from 'xlsx';

/**
 * D3.js 庫引入
 * 用於數據視覺化、統計計算和數據處理
 * 提供強大的數據操作和圖表繪製功能
 *
 * @see https://d3js.org/
 */
import * as d3 from 'd3';

// ==================== ⚙️ 配置常數 (Configuration Constants) ====================

/**
 * 🎨 顏色配置 (Color Configuration)
 * 定義系統中使用的標準顏色方案和視覺參數
 *
 * 設計原則：
 * - 提供一致的視覺體驗
 * - 支援無障礙設計（對比度）
 * - 適配不同主題和用途
 * - 易於維護和擴展
 */
const COLOR_CONFIG = {
  /** 預設填充顏色 - 半透明灰色 */
  DEFAULT_FILL: 'rgba(128, 128, 128, 0.5)',
  /** 預設邊框顏色 - 使用 CSS 變數 */
  DEFAULT_BORDER: 'var(--my-color-white)',
  /** 預設透明度 - 用於圖層疊加 */
  OPACITY: 0.75,
  /** Viridis 色彩數量 - 科學視覺化標準 */
  VIRIDIS_COLORS: 5,
  /** 分位數分類點 - 用於等分位數分類 */
  QUANTILES: [0.2, 0.4, 0.6, 0.8],
};

/**
 * 📁 檔案路徑配置 (File Path Configuration)
 * 定義不同環境下的數據文件路徑
 *
 * 路徑策略：
 * - 生產環境：使用 GitHub Pages 路徑
 * - 開發環境：使用相對路徑
 * - 備用路徑：提供降級方案
 */
const PATH_CONFIG = {
  /** GeoJSON 文件路徑 - 生產環境 */
  GEOJSON: '/schematic-map-rwd/data/geojson',
  /** Excel 文件路徑 - 生產環境 */
  EXCEL: '/schematic-map-rwd/data/xlsx',
  /** 備用 GeoJSON 路徑 - 開發環境 */
  FALLBACK_GEOJSON: '/data/geojson',
};

// ==================== 🔧 輔助函數 (Helper Functions) ====================

/**
 * 📋 建立通用的特徵屬性結構 (Build Generic Feature Properties Structure)
 *
 * 功能說明：
 * - 為 GeoJSON Feature 建立標準化的屬性結構
 * - 統一不同數據源的屬性命名和格式
 * - 提供一致的數據訪問介面
 * - 支援圖層管理和數據追蹤
 *
 * 屬性結構：
 * - id: 唯一識別碼（1-based）
 * - layerId: 所屬圖層 ID
 * - layerName: 圖層顯示名稱
 * - name: 特徵顯示名稱
 * - count: 數值計數（用於統計分析）
 * - 原始屬性：保留所有原始 properties
 *
 * @param {Object} feature - GeoJSON Feature 對象
 * @param {number} index - 0-based 索引（將轉為 1-based id）
 * @param {string} layerId - 圖層唯一識別碼
 * @param {string} layerName - 圖層顯示名稱
 * @param {string} nameField - properties 中用於顯示名稱的欄位名
 * @param {number} [count=0] - 初始計數值，用於統計分析
 *
 * @returns {Object} 更新後的 feature 對象
 *
 * @example
 * const feature = {
 *   type: 'Feature',
 *   properties: { name: '台北市', population: 2500000 },
 *   geometry: { type: 'Polygon', coordinates: [...] }
 * };
 * const updatedFeature = buildFeatureProperties(feature, 0, 'taipei', '台北市', 'name', 2500000);
 * // 結果：feature.properties 包含 id, layerId, layerName, name, count 等標準屬性
 *
 * @since 1.0.0
 * @author Kevin Cheng
 */
function buildFeatureProperties(feature, index, layerId, layerName, nameField, count = 0) {
  // ==================== 📝 步驟 1: 獲取特徵名稱 (Step 1: Get Feature Name) ====================

  // 從 feature 的 properties 中獲取指定欄位的名稱
  // 如果指定欄位不存在或為空，則使用預設名稱格式
  // 使用邏輯或運算符 (||) 提供預設值，確保總是有可用的名稱
  const name = feature.properties[nameField] || `項目 ${index + 1}`;

  // ==================== 🏗️ 步驟 2: 建立標準化屬性結構 (Step 2: Build Standardized Property Structure) ====================

  // 為 feature 添加標準化的屬性，確保所有 feature 都有統一的屬性結構
  // 這些屬性用於圖層管理、視覺化和數據追蹤

  // 設定唯一識別碼（1-based，從 1 開始）
  feature.properties.id = index + 1;

  // 設定所屬圖層的唯一識別碼
  feature.properties.layerId = layerId;

  // 設定圖層的顯示名稱
  feature.properties.layerName = layerName;

  // 設定特徵的顯示名稱
  feature.properties.name = name;

  // 設定數值計數（用於統計分析）
  feature.properties.count = count;

  // 設定預設邊框顏色（從配置常數中獲取）
  feature.properties.color = COLOR_CONFIG.DEFAULT_BORDER;

  // 設定預設填充顏色（從配置常數中獲取）
  feature.properties.fillColor = COLOR_CONFIG.DEFAULT_FILL;

  // ==================== 📊 步驟 3: 建立統一資料結構 (Step 3: Create Unified Data Structure) ====================

  // 建立包含基本信息的通用資料對象
  // 使用展開運算符 (...) 將所有原始 properties 合併到 commonData 中
  // 這樣可以保留所有原始數據，同時添加標準化的屬性
  const commonData = { name, count, ...feature.properties };

  // ==================== 👥 步驟 4: 處理人口數據 (Step 4: Handle Population Data) ====================

  // 檢查是否存在人口統計數據（P_CNT 欄位）
  // parseFloat 將字符串轉換為浮點數，如果轉換失敗則返回 NaN
  const population = parseFloat(feature.properties.P_CNT || 0);

  // 驗證人口數據的有效性
  // 檢查是否為有效數字且大於等於 0
  const hasPopulation = !isNaN(population) && population >= 0;

  // ==================== 🎯 步驟 5: 建立專用資料結構 (Step 5: Create Specialized Data Structures) ====================

  // 為不同用途建立專門的資料結構
  // 這樣可以優化不同場景下的數據訪問和顯示

  // 屬性面板資料：包含所有相關信息
  feature.properties.propertyData = commonData;

  // 彈出視窗資料：只包含基本顯示信息
  feature.properties.popupData = { name, count };

  // 表格資料：用於數據表格顯示
  feature.properties.tableData = {
    '#': feature.properties.id, // 序號
    color: COLOR_CONFIG.DEFAULT_FILL, // 顏色
    name, // 名稱
    count, // 計數
    // 只有在有有效人口數據時才添加 P_CNT 欄位
    // 使用條件展開運算符確保數據完整性
    ...(hasPopulation && { P_CNT: population }),
  };
}

/**
 * 計算 Jenks Natural Breaks 分類閾值 (完全重寫版本)
 *
 * Jenks Natural Breaks (Fisher-Jenks) 是一種統計分類方法，通過動態規劃算法找到最佳分類斷點，
 * 使得組內方差最小化，組間方差最大化。該實現使用優化的動態規劃算法，具有更好的性能和穩定性。
 *
 * 算法原理：
 * 1. 使用動態規劃表 dp[i][j] 記錄將前 i 個數據分為 j 類的最小方差
 * 2. 使用累積統計量優化方差計算，避免重複計算
 * 3. 回溯找出最佳分割點序列
 *
 * @param {number[]} values - 數值陣列（會自動過濾並排序）
 * @param {number} numClasses - 分類數量（必須 >= 1）
 * @returns {number[]} 分類閾值陣列，長度為 numClasses-1
 * @throws {Error} 當參數無效時拋出錯誤
 *
 * @example
 * // 將數據分為3類
 * const data = [1, 2, 4, 5, 7, 9, 12, 15, 18, 20];
 * const breaks = calculateNaturalBreaks(data, 3);
 * // 返回: [5, 12] （表示分類為: <=5, 5-12, >12）
 */
function calculateNaturalBreaks(values, numClasses) {
  // === 輸入驗證 ===
  if (!Array.isArray(values)) {
    throw new Error('values 必須是數組');
  }

  if (!Number.isInteger(numClasses) || numClasses < 1) {
    throw new Error('numClasses 必須是正整數');
  }

  if (values.length === 0) {
    return [];
  }

  // === 數據預處理 ===
  // 過濾無效值，去重並排序
  const validValues = [
    ...new Set(values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v))),
  ].sort((a, b) => a - b);

  if (validValues.length === 0) {
    return [];
  }

  const n = validValues.length;

  // === 邊界情況處理 ===
  if (numClasses === 1) {
    return [];
  }

  if (numClasses >= n) {
    // 如果分類數大於等於數據點數，每個數據點為一類
    return validValues.slice(0, -1);
  }

  // === 預計算累積統計量 ===
  const cumulativeSum = new Float64Array(n + 1);
  const cumulativeSumSquares = new Float64Array(n + 1);

  cumulativeSum[0] = 0;
  cumulativeSumSquares[0] = 0;

  for (let i = 0; i < n; i++) {
    const value = validValues[i];
    cumulativeSum[i + 1] = cumulativeSum[i] + value;
    cumulativeSumSquares[i + 1] = cumulativeSumSquares[i] + value * value;
  }

  // === 優化的方差計算函數 ===
  const calculateSegmentVariance = (start, end) => {
    if (start >= end) return 0;

    const count = end - start;
    if (count <= 1) return 0;

    const sum = cumulativeSum[end] - cumulativeSum[start];
    const sumSquares = cumulativeSumSquares[end] - cumulativeSumSquares[start];
    const mean = sum / count;

    // 方差 = E[X²] - E[X]²
    const variance = sumSquares / count - mean * mean;

    // 總方差 = 方差 * 樣本數
    return variance * count;
  };

  // === 動態規劃表初始化 ===
  // dp[i][j] = 將前 i 個數據點分為 j 類的最小總方差
  const dp = Array(n + 1)
    .fill(null)
    .map(() => Array(numClasses + 1).fill(Infinity));
  // backtrack[i][j] = 在狀態 dp[i][j] 時的最佳分割點
  const backtrack = Array(n + 1)
    .fill(null)
    .map(() => Array(numClasses + 1).fill(0));

  // === 初始化邊界條件 ===
  // 將前 i 個數據點分為 1 類
  for (let i = 1; i <= n; i++) {
    dp[i][1] = calculateSegmentVariance(0, i);
    backtrack[i][1] = 0;
  }

  // === 動態規劃主循環 ===
  for (let numData = 2; numData <= n; numData++) {
    for (let numClass = 2; numClass <= Math.min(numData, numClasses); numClass++) {
      // 嘗試所有可能的分割點
      for (let splitPoint = numClass - 1; splitPoint < numData; splitPoint++) {
        // 當前分割的方差 = 前面部分的最優方差 + 當前段的方差
        const currentVariance =
          dp[splitPoint][numClass - 1] + calculateSegmentVariance(splitPoint, numData);

        // 如果找到更優解，更新
        if (currentVariance < dp[numData][numClass]) {
          dp[numData][numClass] = currentVariance;
          backtrack[numData][numClass] = splitPoint;
        }
      }
    }
  }

  // === 回溯找出最佳分割點 ===
  const breakIndices = [];
  let currentData = n;
  let currentClass = numClasses;

  while (currentClass > 1) {
    const splitPoint = backtrack[currentData][currentClass];
    if (splitPoint > 0) {
      breakIndices.push(splitPoint);
    }
    currentData = splitPoint;
    currentClass--;
  }

  // === 轉換索引為實際值 ===
  const breaks = breakIndices
    .reverse() // 反轉得到正確順序
    .map((index) => validValues[index - 1]) // 轉換為實際值（斷點是前一個值）
    .filter((value, index, arr) => index === 0 || value !== arr[index - 1]); // 去重

  return breaks;
}

/**
 * 快速計算Natural Breaks的優化版本 (完全重寫)
 *
 * 這是一個高性能版本，專為大型數據集優化。使用了以下優化技術：
 * 1. 預計算累積統計量，避免重複計算
 * 2. 使用 Float64Array 提升數值計算精度和性能
 * 3. 數值穩定的方差計算公式
 * 4. 內存優化的動態規劃實現
 * 5. 早期終止條件檢查
 *
 * @param {number[]} values - 數值陣列
 * @param {number} numClasses - 分類數量
 * @returns {number[]} 閾值陣列
 */
function calculateNaturalBreaksFast(values, numClasses) {
  // === 快速路徑：直接調用主算法 ===
  // 主算法已經包含了所有優化，對於大多數情況已經足夠快
  if (values.length < 10000) {
    return calculateNaturalBreaks(values, numClasses);
  }

  // === 超大數據集的額外優化 ===

  // 輸入驗證
  if (!Array.isArray(values)) {
    throw new Error('values 必須是數組');
  }

  if (!Number.isInteger(numClasses) || numClasses < 1) {
    throw new Error('numClasses 必須是正整數');
  }

  if (values.length === 0) {
    return [];
  }

  // 數據預處理 - 對超大數據集進行採樣優化
  let processedValues;

  if (values.length > 50000) {
    // 對於超大數據集，先進行智能採樣
    const sampleSize = Math.min(10000, Math.floor(values.length * 0.1));
    const step = Math.floor(values.length / sampleSize);

    const validValues = values
      .filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v))
      .sort((a, b) => a - b);

    // 分層採樣：確保覆蓋整個數據範圍
    const sampledValues = [];
    for (let i = 0; i < validValues.length; i += step) {
      sampledValues.push(validValues[i]);
    }

    // 確保包含邊界值
    if (sampledValues[sampledValues.length - 1] !== validValues[validValues.length - 1]) {
      sampledValues.push(validValues[validValues.length - 1]);
    }

    processedValues = [...new Set(sampledValues)].sort((a, b) => a - b);
  } else {
    // 標準處理
    processedValues = [
      ...new Set(values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v))),
    ].sort((a, b) => a - b);
  }

  if (processedValues.length === 0) {
    return [];
  }

  const n = processedValues.length;

  // 邊界情況
  if (numClasses === 1) return [];
  if (numClasses >= n) return processedValues.slice(0, -1);

  // === 高性能動態規劃實現 ===

  // 使用 Float64Array 提升性能和精度
  const cumulativeSum = new Float64Array(n + 1);
  const cumulativeSumSquares = new Float64Array(n + 1);

  // 預計算累積統計量
  for (let i = 0; i < n; i++) {
    const value = processedValues[i];
    cumulativeSum[i + 1] = cumulativeSum[i] + value;
    cumulativeSumSquares[i + 1] = cumulativeSumSquares[i] + value * value;
  }

  // 高效的方差計算函數
  const fastVariance = (start, end) => {
    const count = end - start;
    if (count <= 1) return 0;

    const sum = cumulativeSum[end] - cumulativeSum[start];
    const sumSquares = cumulativeSumSquares[end] - cumulativeSumSquares[start];
    const mean = sum / count;

    // 數值穩定的方差公式
    const variance = (sumSquares - sum * mean) / count;
    return Math.max(0, variance * count);
  };

  // 緊湊的動態規劃表
  const dp = new Array(n + 1);
  const backtrack = new Array(n + 1);

  for (let i = 0; i <= n; i++) {
    dp[i] = new Float64Array(numClasses + 1);
    backtrack[i] = new Uint16Array(numClasses + 1);
    dp[i].fill(Infinity);
  }

  // 初始化
  for (let i = 1; i <= n; i++) {
    dp[i][1] = fastVariance(0, i);
  }

  // 動態規劃主循環 - 使用緊湊的循環順序
  for (let k = 2; k <= numClasses; k++) {
    for (let i = k; i <= n; i++) {
      for (let j = k - 1; j < i; j++) {
        const cost = dp[j][k - 1] + fastVariance(j, i);
        if (cost < dp[i][k]) {
          dp[i][k] = cost;
          backtrack[i][k] = j;
        }
      }
    }
  }

  // 回溯
  const breaks = [];
  let pos = n;
  let classes = numClasses;

  while (classes > 1) {
    const splitPoint = backtrack[pos][classes];
    if (splitPoint > 0) {
      breaks.push(processedValues[splitPoint - 1]);
    }
    pos = splitPoint;
    classes--;
  }

  return breaks.reverse().filter((v, i, arr) => i === 0 || v !== arr[i - 1]);
}

/**
 * 獲取Natural Breaks分類的詳細統計資訊 (完全重寫版本)
 *
 * 提供完整的分類品質評估指標，包括方差分解、分類效果評估等。
 * 使用數值穩定的統計計算方法，提供更準確的結果。
 *
 * @param {number[]} values - 數值陣列
 * @param {number[]} breaks - 斷點陣列
 * @returns {Object} 包含各類別統計資訊的物件
 * @throws {Error} 當參數無效時拋出錯誤
 *
 * @example
 * const values = [1, 2, 4, 5, 7, 9, 12, 15, 18, 20];
 * const breaks = [5, 12];
 * const stats = getNaturalBreaksStats(values, breaks);
 * console.log(stats.goodnessOfVarianceFit); // 分類品質指標 (0-1)
 */
function getNaturalBreaksStats(values, breaks) {
  // === 輸入驗證 ===
  if (!Array.isArray(values)) {
    throw new Error('values 必須是數組');
  }

  if (!Array.isArray(breaks)) {
    throw new Error('breaks 必須是數組');
  }

  // === 數據預處理 ===
  const validValues = values
    .filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v))
    .sort((a, b) => a - b);

  if (validValues.length === 0) {
    return {
      classes: [],
      totalVariance: 0,
      withinClassVariance: 0,
      betweenClassVariance: 0,
      goodnessOfVarianceFit: 0,
      averageSilhouetteScore: 0,
      classificationEfficiency: 0,
    };
  }

  const n = validValues.length;
  const sortedBreaks = [...breaks].sort((a, b) => a - b);

  // === 分類數據到各個類別 ===
  const classes = [];
  let currentStart = 0;

  for (let i = 0; i <= sortedBreaks.length; i++) {
    let currentEnd;

    if (i === sortedBreaks.length) {
      // 最後一個類別
      currentEnd = n;
    } else {
      // 找到第一個大於當前斷點的值的位置
      currentEnd = validValues.findIndex((v) => v > sortedBreaks[i]);
      if (currentEnd === -1) currentEnd = n;
    }

    if (currentStart < currentEnd) {
      const classValues = validValues.slice(currentStart, currentEnd);

      if (classValues.length > 0) {
        // === 計算類別統計 ===
        const count = classValues.length;
        const sum = classValues.reduce((acc, val) => acc + val, 0);
        const mean = sum / count;

        // 使用數值穩定的方差計算
        let variance = 0;

        for (const value of classValues) {
          variance += (value - mean) ** 2;
        }

        const standardDeviation = Math.sqrt(variance / count);

        // === 構建範圍標籤 ===
        let rangeLabel;
        if (i === 0) {
          rangeLabel =
            sortedBreaks.length > 0
              ? `≤ ${sortedBreaks[0]}`
              : `${Math.min(...classValues)} - ${Math.max(...classValues)}`;
        } else if (i === sortedBreaks.length) {
          rangeLabel = `> ${sortedBreaks[i - 1]}`;
        } else {
          rangeLabel = `${sortedBreaks[i - 1]} < x ≤ ${sortedBreaks[i]}`;
        }

        classes.push({
          index: i,
          range: rangeLabel,
          count,
          min: Math.min(...classValues),
          max: Math.max(...classValues),
          mean,
          median:
            count % 2 === 0
              ? (classValues[Math.floor(count / 2) - 1] + classValues[Math.floor(count / 2)]) / 2
              : classValues[Math.floor(count / 2)],
          standardDeviation,
          variance,
          totalVariance: variance, // 總方差 (用於優化計算)
          values: classValues,
          percentage: (count / n) * 100,
        });
      }
    }

    currentStart = currentEnd;
  }

  // === 計算全域統計 ===
  const overallSum = validValues.reduce((acc, val) => acc + val, 0);
  const overallMean = overallSum / n;

  // 總方差計算
  let totalVariance = 0;

  for (const value of validValues) {
    totalVariance += (value - overallMean) ** 2;
  }

  // === 方差分解 ===
  const withinClassVariance = classes.reduce((acc, cls) => acc + cls.variance, 0);
  const betweenClassVariance = totalVariance - withinClassVariance;

  // 分類品質指標 (Goodness of Variance Fit)
  const goodnessOfVarianceFit = totalVariance > 0 ? betweenClassVariance / totalVariance : 0;

  // === 額外的分類評估指標 ===

  // 計算平均輪廓係數 (Silhouette Score)
  let averageSilhouetteScore = 0;
  if (classes.length > 1) {
    let totalSilhouette = 0;
    let validSilhouetteCount = 0;

    for (let i = 0; i < classes.length; i++) {
      const currentClass = classes[i];

      if (currentClass.count > 1) {
        // 計算類內平均距離
        let intraClassDistance = 0;
        const values = currentClass.values;

        for (let j = 0; j < values.length; j++) {
          for (let k = j + 1; k < values.length; k++) {
            intraClassDistance += Math.abs(values[j] - values[k]);
          }
        }

        const avgIntraDistance = intraClassDistance / ((values.length * (values.length - 1)) / 2);

        // 找到最近的其他類別的平均距離
        let minInterClassDistance = Infinity;

        for (let j = 0; j < classes.length; j++) {
          if (i !== j) {
            const otherClass = classes[j];
            let interClassDistance = 0;
            let pairCount = 0;

            for (const val1 of currentClass.values) {
              for (const val2 of otherClass.values) {
                interClassDistance += Math.abs(val1 - val2);
                pairCount++;
              }
            }

            const avgInterDistance = interClassDistance / pairCount;
            minInterClassDistance = Math.min(minInterClassDistance, avgInterDistance);
          }
        }

        // 計算輪廓係數
        if (minInterClassDistance !== Infinity && avgIntraDistance > 0) {
          const silhouette =
            (minInterClassDistance - avgIntraDistance) /
            Math.max(minInterClassDistance, avgIntraDistance);
          totalSilhouette += silhouette * currentClass.count;
          validSilhouetteCount += currentClass.count;
        }
      }
    }

    averageSilhouetteScore = validSilhouetteCount > 0 ? totalSilhouette / validSilhouetteCount : 0;
  }

  // 分類效率 (Classification Efficiency)
  const expectedVarianceReduction = 1 - 1 / classes.length;
  const actualVarianceReduction = goodnessOfVarianceFit;
  const classificationEfficiency =
    expectedVarianceReduction > 0 ? actualVarianceReduction / expectedVarianceReduction : 0;

  return {
    classes,
    totalVariance,
    withinClassVariance,
    betweenClassVariance,
    goodnessOfVarianceFit,
    averageSilhouetteScore,
    classificationEfficiency,
    // 額外的統計資訊
    overallMean,
    overallStandardDeviation: Math.sqrt(totalVariance / n),
    numClasses: classes.length,
    totalCount: n,
    // 分類平衡性
    classBalance: {
      minClassSize: Math.min(...classes.map((c) => c.count)),
      maxClassSize: Math.max(...classes.map((c) => c.count)),
      averageClassSize: n / classes.length,
      classVariance:
        classes.length > 1
          ? classes.reduce((acc, cls) => acc + (cls.count - n / classes.length) ** 2, 0) /
            classes.length
          : 0,
    },
  };
}

/**
 * 建立顏色比例尺和閾值
 * @param {number[]} values
 * @param {boolean} includeZero - 是否包含 0 值於分位數計算
 * @param {string} colorScheme - 顏色方案 ('viridis', 'greens', 'blues', 'reds', 'purples')
 * @returns {{colorScale:Function, thresholds:number[], colors:string[], minValue:number, maxValue:number}}
 */
function createColorScale(values, includeZero = false, colorScheme = 'viridis') {
  const filteredValues = includeZero
    ? values.filter((v) => !isNaN(v))
    : values.filter((v) => !isNaN(v) && v > 0);

  if (filteredValues.length === 0) {
    const defaultColor =
      colorScheme === 'greens' ? d3.interpolateGreens(0) : d3.interpolateViridis(0);
    return { colorScale: () => defaultColor, thresholds: [], colors: [] };
  }

  // 選擇顏色插值器
  let colorInterpolator;
  switch (colorScheme) {
    case 'greens':
      colorInterpolator = d3.interpolateGreens;
      break;
    case 'blues':
      colorInterpolator = d3.interpolateBlues;
      break;
    case 'reds':
      colorInterpolator = d3.interpolateReds;
      break;
    case 'purples':
      colorInterpolator = d3.interpolatePurples;
      break;
    default:
      colorInterpolator = d3.interpolateViridis;
  }

  const colors = d3
    .range(COLOR_CONFIG.VIRIDIS_COLORS)
    .map((i) => colorInterpolator(i / (COLOR_CONFIG.VIRIDIS_COLORS - 1)));

  // 使用 natural breaks 分類
  const sortedValues = filteredValues.sort((a, b) => a - b);
  const thresholds = calculateNaturalBreaks(sortedValues, COLOR_CONFIG.VIRIDIS_COLORS);

  const colorScale = d3.scaleThreshold().domain(thresholds).range(colors);

  return {
    colorScale,
    thresholds,
    colors,
    minValue: d3.min(filteredValues),
    maxValue: d3.max(filteredValues),
  };
}

/**
 * 通用的檔案載入函數
 * @param {string} primaryPath
 * @param {string|null} fallbackPath
 * @returns {Promise<Response>}
 */
async function loadFile(primaryPath, fallbackPath = null) {
  let response = await fetch(primaryPath);

  if (!response.ok && fallbackPath) {
    console.warn('⚠️ 主路徑載入失敗，嘗試後備路徑', {
      status: response.status,
      url: response.url,
    });
    response = await fetch(fallbackPath);
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} - ${response.url}`);
  }

  return response;
}

// ==================== 主要載入函數 ====================

/**
 * 載入原始 GeoJSON 資料（不包含 Excel 合併）
 * @param {{layerId:string,layerName:string,geojsonFileName:string,geojsonMergeField:string}} layer
 */
export async function loadDistrictGeoJson(layer) {
  try {
    console.log('🔄 載入原始 GeoJSON 資料...');

    const filePath = `${PATH_CONFIG.GEOJSON}/${layer.geojsonFileName}`;
    const response = await loadFile(filePath);
    const geoJsonData = await response.json();

    // 處理 features
    geoJsonData.features.forEach((feature, index) => {
      buildFeatureProperties(
        feature,
        index,
        layer.layerId,
        layer.layerName,
        layer.geojsonMergeField
      );
    });

    console.log('✅ 原始 GeoJSON 載入完成:', geoJsonData.features.length, '筆資料');

    return {
      geoJsonData,
      tableData: geoJsonData.features.map((f) => ({ ...f.properties.tableData })),
      summaryData: { totalCount: geoJsonData.features.length },
      legendData: null,
      spatialAnalysisData: null,
    };
  } catch (error) {
    console.error('❌ GeoJSON 數據載入或處理失敗:', error);
    throw error;
  }
}

/**
 * 讀取 Excel 檔案的特定工作表
 * @param {{excelFileName:string,excelSheetName:string}} layer
 */
export async function loadExcelSheet(layer) {
  try {
    console.log('🔄 載入 Excel 資料...');

    const filePath = `${PATH_CONFIG.EXCEL}/${layer.excelFileName}`;
    const response = await loadFile(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (!workbook.SheetNames.includes(layer.excelSheetName)) {
      throw new Error(`Sheet "${layer.excelSheetName}" not found in workbook`);
    }

    const worksheet = workbook.Sheets[layer.excelSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log('✅ Excel 載入完成:', jsonData.length, '筆資料');
    return jsonData;
  } catch (error) {
    console.error('❌ Excel 載入失敗:', error);
    throw error;
  }
}

/**
 * 合併 GeoJSON 與 Excel 數據（僅同步 count 欄位）
 * @param {Object} geojsonData
 * @param {Array<Object>} excelData
 * @param {string} geojsonKey
 * @param {string} excelKey
 */
export function mergeGeoJSONWithExcel(
  geojsonData,
  excelData,
  geojsonKey = 'TOWN',
  excelKey = 'name'
) {
  try {
    console.log('🔄 開始合併資料，只賦值 count...');

    // 創建Excel數據的查找表
    const excelLookup = {};
    excelData.forEach((row) => {
      if (row[excelKey]) {
        excelLookup[row[excelKey].toUpperCase()] = row;
      }
    });

    // 合併資料
    const mergedGeoJSON = {
      ...geojsonData,
      features: geojsonData.features.map((feature) => {
        const props = feature.properties;
        const excelRow = excelLookup[props[geojsonKey]?.toUpperCase()];

        return {
          ...feature,
          properties: {
            ...props,
            count: excelRow ? excelRow.count || 0 : 0,
          },
        };
      }),
    };

    const mergedCount = geojsonData.features.filter((feature) => {
      const props = feature.properties;
      return !!excelLookup[props[geojsonKey]?.toUpperCase()];
    }).length;

    console.log('✅ 合併完成:', mergedCount, '/', geojsonData.features.length, '筆資料');

    return {
      mergedGeoJSON,
      summary: {
        totalFeatures: geojsonData.features.length,
        mergedCount,
        excelRows: excelData.length,
        mergeRate: (mergedCount / geojsonData.features.length) * 100,
      },
    };
  } catch (error) {
    console.error('❌ 合併失敗:', error);
    throw error;
  }
}

// ==================== 分類和顏色處理函數 ====================

/**
 * 計算圖例資料並分配顏色給 features
 */
export function calculateClassification(geoJsonData) {
  try {
    console.log('🎨 計算圖例並分配顏色...');

    const values = geoJsonData.features
      .map((f) => parseFloat(f.properties.count || 0))
      .filter((v) => !isNaN(v) && v > 0);

    const { colorScale, thresholds, colors, minValue, maxValue } = createColorScale(
      values,
      false,
      'reds'
    );

    // 分配顏色給 features
    geoJsonData.features.forEach((feature) => {
      const count = parseInt(feature.properties.count || 0);
      let fillColor, tableColor;

      if (count === 0) {
        fillColor = COLOR_CONFIG.DEFAULT_FILL;
        tableColor = COLOR_CONFIG.DEFAULT_FILL;
      } else {
        const baseColor = colorScale(count);
        fillColor = d3.color(baseColor).copy({ opacity: COLOR_CONFIG.OPACITY }).toString();
        tableColor = fillColor;
      }

      feature.properties.fillColor = fillColor;

      // 保留現有的 tableData 並更新必要欄位
      const existingTableData = feature.properties.tableData || {};

      // 計算感染率 (count/P_CNT)
      const population = parseFloat(existingTableData.P_CNT || 0);
      const infectionRate = population > 0 ? ((count / population) * 100).toFixed(2) : 0;

      feature.properties.tableData = {
        '#': feature.properties.id,
        color: tableColor,
        name: feature.properties.name,
        count: count,
        // 保留原有的其他欄位，如 P_CNT
        ...Object.fromEntries(
          Object.entries(existingTableData).filter(
            ([key]) => !['#', 'color', 'name', 'count'].includes(key)
          )
        ),
        // 添加感染率欄位 (只有當有 P_CNT 資料時才加入)
        ...(population > 0 && { '感染率(%)': infectionRate }),
      };
    });

    // 計算每個分類的數量
    const validFeatures = geoJsonData.features.filter((f) => {
      const value = parseFloat(f.properties.count || 0);
      return !isNaN(value) && value > 0;
    });

    // 計算缺值統計
    const totalFeatureCount = geoJsonData.features.length;
    const zeroOrMissingCount = geoJsonData.features.filter((f) => {
      const value = parseFloat(f.properties.count || 0);
      return isNaN(value) || value <= 0;
    }).length;

    const preClassifiedData = [];
    for (let i = 0; i < colors.length; i++) {
      preClassifiedData.push([]);
    }

    // 將每個有效數據點分配到正確的區間
    validFeatures.forEach((feature) => {
      const value = parseFloat(feature.properties.count || 0);
      let classIndex = 0;

      for (let i = 0; i < thresholds.length; i++) {
        if (value <= thresholds[i]) {
          classIndex = i;
          break;
        }
        if (i === thresholds.length - 1) {
          classIndex = colors.length - 1;
        }
      }

      preClassifiedData[classIndex].push(feature);
    });

    // 生成圖例資料
    const format = (d) => Math.round(d).toLocaleString();
    const legendData = colors.map((color, index) => {
      let label = '';
      let extent = [];
      let count = preClassifiedData[index].length;

      if (index === 0) {
        const upperBound = thresholds[0];
        extent = [minValue, upperBound];
        label = `${format(minValue)} - ${format(upperBound)} (${count})`;
      } else if (index === colors.length - 1) {
        const lowerBound = thresholds[thresholds.length - 1];
        extent = [lowerBound, maxValue];
        label = `${format(lowerBound)} - ${format(maxValue)} (${count})`;
      } else {
        const lowerBound = thresholds[index - 1];
        const upperBound = thresholds[index];
        extent = [lowerBound, upperBound];
        label = `${format(lowerBound)} - ${format(upperBound)} (${count})`;
      }

      return {
        color: d3.color(color).copy({ opacity: COLOR_CONFIG.OPACITY }).toString(),
        label,
        extent,
        count,
        summary: {
          zeroOrMissingCount,
          totalFeatureCount,
        },
      };
    });

    // 生成感染率專用圖例
    const infectionRateValues = geoJsonData.features
      .map((f) => {
        // 直接從 properties 取得 P_CNT，因為 tableData 可能還沒有完全建立
        const population = parseFloat(f.properties.P_CNT || 0);
        const count = parseFloat(f.properties.count || 0);
        return population > 0 ? (count / population) * 100 : 0;
      })
      .filter((v) => !isNaN(v) && v > 0);

    console.log(
      '🦠 感染率值數量:',
      infectionRateValues.length,
      '範例值:',
      infectionRateValues.slice(0, 5)
    );

    let legendData_InfectionRate = null;
    if (infectionRateValues.length > 0) {
      const {
        thresholds: infectionThresholds,
        colors: infectionColors,
        minValue: infectionMinValue,
        maxValue: infectionMaxValue,
      } = createColorScale(infectionRateValues, false, 'blues');

      // 計算感染率圖例的分類數量
      const infectionPreClassifiedData = [];
      for (let i = 0; i < infectionColors.length; i++) {
        infectionPreClassifiedData.push([]);
      }

      // 創建感染率的顏色比例尺
      const infectionColorScale = d3
        .scaleThreshold()
        .domain(infectionThresholds)
        .range(infectionColors);

      // 將每個有效數據點分配到正確的區間，並為每個 feature 分配感染率顏色
      geoJsonData.features.forEach((feature) => {
        // 直接從 properties 取得 P_CNT
        const population = parseFloat(feature.properties.P_CNT || 0);
        const count = parseFloat(feature.properties.count || 0);
        const infectionRate = population > 0 ? (count / population) * 100 : 0;

        // 分配感染率專用顏色
        let fillColor_infectionRate;
        if (infectionRate === 0) {
          fillColor_infectionRate = COLOR_CONFIG.DEFAULT_FILL;
        } else {
          const baseColor = infectionColorScale(infectionRate);
          fillColor_infectionRate = d3
            .color(baseColor)
            .copy({ opacity: COLOR_CONFIG.OPACITY })
            .toString();
        }
        feature.properties.fillColor_infectionRate = fillColor_infectionRate;

        // 更新 tableData 中的感染率顏色
        if (feature.properties.tableData && feature.properties.tableData['感染率(%)']) {
          feature.properties.tableData.infection_rate_color = fillColor_infectionRate;
        }

        if (infectionRate > 0) {
          let classIndex = 0;
          for (let i = 0; i < infectionThresholds.length; i++) {
            if (infectionRate <= infectionThresholds[i]) {
              classIndex = i;
              break;
            }
            if (i === infectionThresholds.length - 1) {
              classIndex = infectionColors.length - 1;
            }
          }
          infectionPreClassifiedData[classIndex].push(feature);
        }
      });

      // 生成感染率圖例
      const infectionFormat = (d) => d.toFixed(2);
      legendData_InfectionRate = infectionColors.map((color, index) => {
        let label = '';
        let extent = [];
        let count = infectionPreClassifiedData[index].length;

        if (index === 0) {
          const upperBound = infectionThresholds[0];
          extent = [infectionMinValue, upperBound];
          label = `${infectionFormat(infectionMinValue)}% - ${infectionFormat(upperBound)}% (${count})`;
        } else if (index === infectionColors.length - 1) {
          const lowerBound = infectionThresholds[infectionThresholds.length - 1];
          extent = [lowerBound, infectionMaxValue];
          label = `${infectionFormat(lowerBound)}% - ${infectionFormat(infectionMaxValue)}% (${count})`;
        } else {
          const lowerBound = infectionThresholds[index - 1];
          const upperBound = infectionThresholds[index];
          extent = [lowerBound, upperBound];
          label = `${infectionFormat(lowerBound)}% - ${infectionFormat(upperBound)}% (${count})`;
        }

        return {
          color: d3.color(color).copy({ opacity: COLOR_CONFIG.OPACITY }).toString(),
          label,
          extent,
          count,
        };
      });
    }

    const tableData = geoJsonData.features.map((f) => ({ ...f.properties.tableData }));

    console.log('✅ 圖例和顏色分配完成');
    return { geoJsonData, tableData, legendData, legendData_InfectionRate };
  } catch (error) {
    console.error('❌ 圖例計算失敗:', error);
    throw error;
  }
}

// ==================== 特殊類型載入函數 ====================

/**
 * 載入點 GeoJSON 資料（直接使用 geojson 中的數據，不需要合併 Excel）
 */
export async function loadDataLayerGeoJson(layer) {
  try {
    console.log('🔄 載入數據圖層 GeoJSON 資料...');

    const fileName = layer.geojsonFileName;
    // 數據圖層直接從 /data/ 路徑載入，不使用 geojson 子目錄
    const dataPath = `/schematic-map-rwd/data/${fileName}`;
    const response = await fetch(dataPath);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${dataPath}`);
    }

    const geoJsonData = await response.json();

    // 處理數據圖層的特殊邏輯
    return await processDataLayerGeoJson(geoJsonData, layer);
  } catch (error) {
    console.error('❌ 數據圖層 GeoJSON 數據載入或處理失敗:', error);
    throw error;
  }
}

/**
 * 處理數據圖層 GeoJSON 數據
 */
async function processDataLayerGeoJson(geoJsonData, layer) {
  // 檢查是否為示意圖節點格式
  if (Array.isArray(geoJsonData) && geoJsonData.length > 0 && geoJsonData[0].nodes) {
    // 這是示意圖節點格式，不需要處理為地圖圖層
    console.log('📊 載入示意圖節點數據，共', geoJsonData.length, '條路線');

    // 建立摘要資料
    const summaryData = {
      totalLines: geoJsonData.length,
      totalNodes: geoJsonData.reduce((sum, line) => sum + line.nodes.length, 0),
      lineNames: geoJsonData.map((line) => line.name),
    };

    return {
      geoJsonData: null, // 示意圖數據不需要地圖顯示
      summaryData,
      tableData: null,
    };
  }

  // 標準 GeoJSON 格式處理
  if (!geoJsonData.features) {
    throw new Error('無效的 GeoJSON 格式：缺少 features 屬性');
  }

  // 為每個特徵建立標準化的屬性結構
  geoJsonData.features.forEach((feature, index) => {
    // 使用 stationCount 作為 count 值，如果沒有則使用預設值 1
    const count = feature.properties.stationCount || 1;
    buildFeatureProperties(feature, index, layer.layerId, layer.layerName, 'name', count);
  });

  // 建立摘要資料
  const summaryData = {
    totalCount: geoJsonData.features.length,
    districtCount: geoJsonData.features.map((feature) => ({
      name: feature.properties.name,
      count: Math.max(0, feature.properties.stationCount || 1), // 確保 count 不為負值
    })),
  };

  return {
    geoJsonData,
    summaryData,
  };
}

export async function loadPointGeoJson(layer) {
  try {
    console.log('🔄 載入點 GeoJSON 資料...');

    const fileName = layer.geojsonFileName;
    const primaryPath = `${PATH_CONFIG.GEOJSON}/${fileName}`;
    const fallbackPath = `${PATH_CONFIG.FALLBACK_GEOJSON}/${fileName}`;
    const response = await loadFile(primaryPath, fallbackPath);
    const geoJsonData = await response.json();

    // 過濾只保留5月到8月的資料 (OnsetDay 月份過濾)
    const originalCount = geoJsonData.features.length;
    geoJsonData.features = geoJsonData.features.filter((feature) => {
      const onsetDay = feature.properties['發病日'];
      if (!onsetDay) return false;

      // 解析發病日期格式 "YYYY/MM/DD"
      const dateParts = onsetDay.split('/');
      if (dateParts.length !== 3) return false;

      const month = parseInt(dateParts[1], 10);
      // 只保留5月到8月的資料
      return month >= 5 && month <= 8;
    });

    const filteredCount = geoJsonData.features.length;
    console.log(`📅 月份過濾: 原始資料 ${originalCount} 筆 → 5-8月資料 ${filteredCount} 筆`);

    // 處理點數據的特殊屬性
    geoJsonData.features.forEach((feature, index) => {
      const count = parseInt(feature.properties['確定病例數'] || 0);

      buildFeatureProperties(feature, index, layer.layerId, layer.layerName, 'name', count);

      // 點數據的特殊表格欄位
      Object.assign(feature.properties.tableData, {
        居住鄉鎮: feature.properties['居住鄉鎮'],
        居住村里: feature.properties['居住村里'],
        發病日: feature.properties['發病日'],
        年齡層: feature.properties['年齡層'],
        性別: feature.properties['性別'],
      });

      // 點位資料不需要 P_CNT 欄位，移除它
      if ('P_CNT' in feature.properties.tableData) {
        delete feature.properties.tableData.P_CNT;
      }

      // 點數據的特殊彈窗資料
      Object.assign(feature.properties.popupData, {
        居住鄉鎮: feature.properties['居住鄉鎮'],
        居住村里: feature.properties['居住村里'],
        發病日: feature.properties['發病日'],
        年齡層: feature.properties['年齡層'],
        性別: feature.properties['性別'],
      });
    });

    const summaryData = {
      totalCount: geoJsonData.features.length,
      totalCases: geoJsonData.features.reduce((sum, feature) => sum + feature.properties.count, 0),
    };

    console.log('✅ 點 GeoJSON 載入完成:', geoJsonData.features.length, '筆資料');
    console.log('📊 總案例數:', summaryData.totalCases);

    return {
      geoJsonData,
      tableData: geoJsonData.features.map((f) => ({ ...f.properties.tableData })),
      summaryData,
      legendData: null,
      spatialAnalysisData: null,
    };
  } catch (error) {
    console.error('❌ 點 GeoJSON 數據載入或處理失敗:', error);
    throw error;
  }
}

/**
 * 載入多邊形 GeoJSON 資料 (僅載入，不分析)
 */
export async function loadPolygonGeoJson(layer) {
  try {
    console.log('🔄 載入多邊形 GeoJSON 資料 (僅載入，不分析)...');

    const fileName = layer.geojsonFileName;
    const primaryPath = `${PATH_CONFIG.GEOJSON}/${fileName}`;
    const fallbackPath = `${PATH_CONFIG.FALLBACK_GEOJSON}/${fileName}`;

    const response = await loadFile(primaryPath, fallbackPath);
    const geoJsonData = await response.json();

    // 以 P_CNT (人口數) 為值來源進行分級
    const rawValues = geoJsonData.features
      .map((f) => parseFloat(f.properties?.P_CNT || 0))
      .filter((v) => !isNaN(v) && v > 0);

    const { colorScale, thresholds, colors } = createColorScale(rawValues, false, 'viridis');

    // 推斷名稱欄位的輔助函數
    const inferName = (props) => {
      const candidates = [
        layer.geojsonMergeField,
        'TOWNNAME',
        'VILLNAME',
        'VILLAGE',
        'TOWN',
        'name',
        'NAME',
        '行政區',
        '區名',
        '村里',
        'stat_area',
        'STAT_AREA',
        'CODE2',
        'TOWN',
        'CODE',
        'ID',
      ].filter(Boolean);

      for (const key of candidates) {
        if (props && Object.prototype.hasOwnProperty.call(props, key) && props[key]) {
          return props[key];
        }
      }

      // 找第一個非空字串欄位
      for (const v of Object.values(props || {})) {
        if (typeof v === 'string' && v.trim().length > 0) return v;
      }

      return '區域';
    };

    // 處理人口分佈資料
    geoJsonData.features.forEach((feature, index) => {
      const props = feature.properties || {};
      feature.properties = props;
      feature.properties.id = index + 1;
      feature.properties.layerId = layer.layerId;
      feature.properties.layerName = layer.layerName;
      feature.properties.name = inferName(props);

      // 設置人口分佈圖層的預設樣式
      if (layer.isPopulationLayer) {
        // 人口分佈圖層：橙色邊框，無填充顏色（透明）
        feature.properties.fillColor = 'rgba(0, 0, 0, 0)'; // 完全透明
        feature.properties.color = 'orange'; // 橙色邊框
      } else {
        // 其他圖層：以人口數決定顏色
        const population = parseFloat(props.P_CNT || 0);
        if (!isNaN(population) && population > 0) {
          const baseColor = colorScale(population);
          feature.properties.fillColor = d3
            .color(baseColor)
            .copy({ opacity: COLOR_CONFIG.OPACITY })
            .toString();
          // 邊框顏色與填充顏色一致，但不透明
          feature.properties.color = d3.color(baseColor).toString();
        } else {
          feature.properties.fillColor = COLOR_CONFIG.DEFAULT_FILL;
          feature.properties.color = COLOR_CONFIG.DEFAULT_FILL;
        }
      }

      // 建立表格資料
      const population = parseFloat(props.P_CNT || 0);
      feature.properties.tableData = {
        '#': feature.properties.id,
        color: feature.properties.fillColor,
        name: feature.properties.name,
        P_CNT: isNaN(population) ? 0 : population,
      };

      feature.properties.propertyData = {
        name: feature.properties.name,
        P_CNT: isNaN(population) ? 0 : population,
        ...props,
      };

      feature.properties.popupData = {
        name: feature.properties.name,
        P_CNT: isNaN(population) ? 0 : population,
      };
    });

    const summaryData = {
      totalCount: geoJsonData.features.length,
      totalPopulation: geoJsonData.features.reduce(
        (sum, f) => sum + (parseFloat(f.properties?.P_CNT || 0) || 0),
        0
      ),
    };

    // 生成人口密度圖例
    const format = (d) => Math.round(d).toLocaleString();
    const legendData = colors.map((color, index) => {
      let label = '';
      let extent = [];

      if (index === 0) {
        const upperBound = thresholds[0];
        label = `< ${format(upperBound)}`;
        extent = [null, upperBound];
      } else if (index === colors.length - 1) {
        const lowerBound = thresholds[thresholds.length - 1];
        label = `> ${format(lowerBound)}`;
        extent = [lowerBound, null];
      } else {
        const lowerBound = thresholds[index - 1];
        const upperBound = thresholds[index];
        label = `${format(lowerBound)} - ${format(upperBound)}`;
        extent = [lowerBound, upperBound];
      }

      return {
        color: d3.color(color).copy({ opacity: COLOR_CONFIG.OPACITY }).toString(),
        label,
        extent,
      };
    });

    // 生成人口分析屬性的圖例
    const populationAttributes = ['P_CNT', 'M_CNT', 'F_CNT'];
    const populationLegends = {};

    populationAttributes.forEach((attribute) => {
      // 獲取該屬性的所有數值
      const attributeValues = geoJsonData.features
        .map((f) => parseFloat(f.properties?.[attribute] || 0))
        .filter((v) => !isNaN(v) && v > 0);

      if (attributeValues.length > 0) {
        // 根據屬性選擇不同的顏色方案，使用 natural breaks
        let colorScheme;
        if (attribute === 'P_CNT') {
          colorScheme = 'blues';
        } else if (attribute === 'M_CNT') {
          colorScheme = 'purples';
        } else if (attribute === 'F_CNT') {
          colorScheme = 'reds';
        } else {
          colorScheme = 'viridis';
        }

        // 使用 natural breaks 創建該屬性專用的顏色比例尺
        const {
          colorScale: attrColorScale,
          thresholds: attrThresholds,
          colors: attrColors,
          minValue,
          maxValue,
        } = createColorScale(attributeValues, false, colorScheme);

        // 生成該屬性的圖例
        const format = (d) => Math.round(d).toLocaleString();

        // 先計算所有有效的數據點
        // 將所有屬性值大於 0 的特徵視為有效數據
        const validFeatures = geoJsonData.features.filter((f) => {
          const value = parseFloat(f.properties?.[attribute] || 0);
          return !isNaN(value) && value > 0;
        });

        // 計算總數
        const totalValidCount = validFeatures.length;
        const totalFeatureCount = geoJsonData.features.length;
        const zeroOrMissingCount = totalFeatureCount - totalValidCount;
        console.log(`${attribute} 總有效數據數：${totalValidCount}`);

        // 將所有有效的數據點進行預分類
        const preClassifiedData = [];
        for (let i = 0; i <= COLOR_CONFIG.VIRIDIS_COLORS; i++) {
          preClassifiedData.push([]);
        }

        // 將每個有效數據點分配到正確的區間
        validFeatures.forEach((feature) => {
          const value = parseFloat(feature.properties?.[attribute] || 0);
          if (value <= minValue) {
            // 小於或等於最小值的數據點分配到第一個區間
            preClassifiedData[0].push(feature);
          } else if (value >= maxValue) {
            // 大於或等於最大值的數據點分配到最後一個區間
            preClassifiedData[COLOR_CONFIG.VIRIDIS_COLORS - 1].push(feature);
          } else {
            // 將中間值分配到適當的區間
            for (let i = 0; i < attrThresholds.length; i++) {
              const lowerBound = i === 0 ? minValue : attrThresholds[i - 1];
              const upperBound = attrThresholds[i];
              if (value > lowerBound && value <= upperBound) {
                preClassifiedData[i].push(feature);
                break;
              }
            }
          }
        });

        // 檢查總數是否正確
        const totalClassified = preClassifiedData.reduce((sum, arr) => sum + arr.length, 0);
        if (totalClassified !== totalValidCount) {
          console.warn(
            `警告: ${attribute} 預分類總數 (${totalClassified}) 與有效數據數 (${totalValidCount}) 不一致`
          );
        }

        const attributeLegend = attrColors.map((color, index) => {
          let label = '';
          let extent = [];
          let count = preClassifiedData[index].length;

          if (index === 0) {
            const upperBound = attrThresholds[0];
            extent = [minValue, upperBound];
            label = `${format(minValue)} - ${format(upperBound)} (${count})`;
          } else if (index === attrColors.length - 1) {
            const lowerBound = attrThresholds[attrThresholds.length - 1];
            extent = [lowerBound, maxValue];
            label = `${format(lowerBound)} - ${format(maxValue)} (${count})`;
          } else {
            const lowerBound = attrThresholds[index - 1];
            const upperBound = attrThresholds[index];
            extent = [lowerBound, upperBound];
            label = `${format(lowerBound)} - ${format(upperBound)} (${count})`;
          }

          return {
            color: d3.color(color).copy({ opacity: COLOR_CONFIG.OPACITY }).toString(),
            label,
            extent,
            count,
          };
        });

        // 在圖例項目中加入缺值統計信息
        attributeLegend.forEach((item) => {
          if (!item.summary) item.summary = {};
          item.summary.zeroOrMissingCount = zeroOrMissingCount;
          item.summary.totalFeatureCount = totalFeatureCount;
        });

        // 驗證圖例總數
        const totalLegendCount = attributeLegend.reduce((sum, item) => sum + (item.count || 0), 0);
        console.log(
          `${attribute} 圖例總數：${totalLegendCount}，缺值：${zeroOrMissingCount}，總數：${totalFeatureCount}`
        );

        populationLegends[`legendData_${attribute}`] = attributeLegend;

        // 為每個特徵添加該屬性的顏色信息
        geoJsonData.features.forEach((feature) => {
          const value = parseFloat(feature.properties?.[attribute] || 0);
          if (!isNaN(value) && value > 0) {
            const color = attrColorScale(value);
            feature.properties[`fillColor_${attribute}`] = d3
              .color(color)
              .copy({ opacity: COLOR_CONFIG.OPACITY })
              .toString();
          } else {
            feature.properties[`fillColor_${attribute}`] = COLOR_CONFIG.DEFAULT_FILL;
          }
        });
      }
    });

    // 處理 POPULATION_DENSITY 屬性（人口密度 = P_CNT / AREA）
    const populationDensityValues = geoJsonData.features
      .map((f) => {
        const population = parseFloat(f.properties?.P_CNT || 0);
        const area = parseFloat(f.properties?.AREA || 1); // 避免除以0
        return area > 0 ? population / area : 0;
      })
      .filter((v) => !isNaN(v) && v > 0);

    if (populationDensityValues.length > 0) {
      // 為每個特徵計算並存儲人口密度
      geoJsonData.features.forEach((feature) => {
        const population = parseFloat(feature.properties?.P_CNT || 0);
        const area = parseFloat(feature.properties?.AREA || 1);
        feature.properties.POPULATION_DENSITY = area > 0 ? population / area : 0;
      });

      // 使用 natural breaks 計算人口密度閾值並創建綠色系顏色比例尺
      const {
        colorScale: densityColorScale,
        thresholds: densityThresholds,
        colors: densityColors,
        minValue: minDensity,
        maxValue: maxDensity,
      } = createColorScale(populationDensityValues, false, 'greens');

      // 生成人口密度的圖例
      const densityFormat = (d) => Math.round(d * 1000) / 1000; // 保留三位小數

      // 先計算所有有效的人口密度數據點
      const validDensityFeatures = geoJsonData.features.filter((f) => {
        const value = f.properties.POPULATION_DENSITY;
        return !isNaN(value) && value > 0;
      });

      // 計算總數
      const totalValidDensityCount = validDensityFeatures.length;
      console.log(`POPULATION_DENSITY 總有效數據數：${totalValidDensityCount}`);

      // 將所有有效的人口密度數據點進行預分類
      const preClassifiedDensityData = [];
      for (let i = 0; i <= COLOR_CONFIG.VIRIDIS_COLORS; i++) {
        preClassifiedDensityData.push([]);
      }

      // 將每個有效數據點分配到正確的區間
      validDensityFeatures.forEach((feature) => {
        const value = feature.properties.POPULATION_DENSITY;
        if (value <= minDensity) {
          // 小於或等於最小值的數據點分配到第一個區間
          preClassifiedDensityData[0].push(feature);
        } else if (value >= maxDensity) {
          // 大於或等於最大值的數據點分配到最後一個區間
          preClassifiedDensityData[COLOR_CONFIG.VIRIDIS_COLORS - 1].push(feature);
        } else {
          // 將中間值分配到適當的區間
          for (let i = 0; i < densityThresholds.length; i++) {
            const lowerBound = i === 0 ? minDensity : densityThresholds[i - 1];
            const upperBound = densityThresholds[i];
            if (value > lowerBound && value <= upperBound) {
              preClassifiedDensityData[i].push(feature);
              break;
            }
          }
        }
      });

      // 檢查總數是否正確
      const totalClassifiedDensity = preClassifiedDensityData.reduce(
        (sum, arr) => sum + arr.length,
        0
      );
      if (totalClassifiedDensity !== totalValidDensityCount) {
        console.warn(
          `警告: POPULATION_DENSITY 預分類總數 (${totalClassifiedDensity}) 與有效數據數 (${totalValidDensityCount}) 不一致`
        );
      }

      const populationDensityLegend = densityColors.map((color, index) => {
        let label = '';
        let extent = [];
        let count = preClassifiedDensityData[index].length;

        if (index === 0) {
          const upperBound = densityThresholds[0];
          extent = [minDensity, upperBound];
          label = `${densityFormat(minDensity)} - ${densityFormat(upperBound)} (${count})`;
        } else if (index === densityColors.length - 1) {
          const lowerBound = densityThresholds[densityThresholds.length - 1];
          extent = [lowerBound, maxDensity];
          label = `${densityFormat(lowerBound)} - ${densityFormat(maxDensity)} (${count})`;
        } else {
          const lowerBound = densityThresholds[index - 1];
          const upperBound = densityThresholds[index];
          extent = [lowerBound, upperBound];
          // 確保區間不重疊
          if (Math.abs(lowerBound - upperBound) < 0.0001) {
            // 如果區間太小，顯示單一值
            label = `${densityFormat(lowerBound)} (${count})`;
          } else {
            label = `${densityFormat(lowerBound)} - ${densityFormat(upperBound)} (${count})`;
          }
          extent = [lowerBound, upperBound];
        }

        return {
          color: d3.color(color).copy({ opacity: COLOR_CONFIG.OPACITY }).toString(),
          label,
          extent,
          count,
        };
      });

      // 在圖例項目中加入缺值統計信息
      const totalFeatureCount = geoJsonData.features.length;
      const zeroOrMissingDensityCount = totalFeatureCount - totalValidDensityCount;

      populationDensityLegend.forEach((item) => {
        if (!item.summary) item.summary = {};
        item.summary.zeroOrMissingCount = zeroOrMissingDensityCount;
        item.summary.totalFeatureCount = totalFeatureCount;
      });

      // 驗證人口密度圖例總數
      const totalDensityLegendCount = populationDensityLegend.reduce(
        (sum, item) => sum + (item.count || 0),
        0
      );
      console.log(
        `POPULATION_DENSITY 圖例總數：${totalDensityLegendCount}，缺值：${zeroOrMissingDensityCount}，總數：${totalFeatureCount}`
      );

      populationLegends['legendData_POPULATION_DENSITY'] = populationDensityLegend;

      // 為每個特徵添加人口密度的顏色信息
      geoJsonData.features.forEach((feature) => {
        const densityValue = feature.properties.POPULATION_DENSITY;
        if (!isNaN(densityValue) && densityValue > 0) {
          const color = densityColorScale(densityValue);
          feature.properties.fillColor_POPULATION_DENSITY = d3
            .color(color)
            .copy({ opacity: COLOR_CONFIG.OPACITY })
            .toString();
        } else {
          feature.properties.fillColor_POPULATION_DENSITY = COLOR_CONFIG.DEFAULT_FILL;
        }
      });
    }

    // 處理 INFO_TIME 屬性（統計時間）
    const infoTimeValues = [
      ...new Set(geoJsonData.features.map((f) => f.properties?.INFO_TIME)),
    ].filter(Boolean);
    if (infoTimeValues.length > 1) {
      // 為不同的時間創建不同的顏色
      const timeColorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(infoTimeValues);

      // 計算總有效時間數據數
      const validTimeFeatures = geoJsonData.features.filter((f) => f.properties?.INFO_TIME);
      const totalValidTimeCount = validTimeFeatures.length;
      console.log(`INFO_TIME 總有效數據數：${totalValidTimeCount}`);

      const infoTimeLegend = infoTimeValues.map((timeValue) => {
        // 計算該時間的數據筆數
        const count = validTimeFeatures.filter((f) => f.properties?.INFO_TIME === timeValue).length;
        return {
          color: d3
            .color(timeColorScale(timeValue))
            .copy({ opacity: COLOR_CONFIG.OPACITY })
            .toString(),
          label: `${timeValue} (${count})`,
          extent: [timeValue, timeValue],
          count,
        };
      });

      // 在圖例項目中加入缺值統計信息
      const totalFeatureCount = geoJsonData.features.length;
      const missingTimeCount = totalFeatureCount - totalValidTimeCount;

      infoTimeLegend.forEach((item) => {
        if (!item.summary) item.summary = {};
        item.summary.missingCount = missingTimeCount;
        item.summary.totalFeatureCount = totalFeatureCount;
      });

      // 驗證時間圖例的總數
      const totalTimeCount = infoTimeLegend.reduce((sum, item) => sum + (item.count || 0), 0);
      console.log(
        `INFO_TIME 圖例總數：${totalTimeCount}，缺值：${missingTimeCount}，總數：${totalFeatureCount}`
      );

      populationLegends['legendData_INFO_TIME'] = infoTimeLegend;

      // 為每個特徵添加時間屬性的顏色信息
      geoJsonData.features.forEach((feature) => {
        const timeValue = feature.properties?.INFO_TIME;
        if (timeValue) {
          feature.properties['fillColor_INFO_TIME'] = d3
            .color(timeColorScale(timeValue))
            .copy({ opacity: COLOR_CONFIG.OPACITY })
            .toString();
        } else {
          feature.properties['fillColor_INFO_TIME'] = COLOR_CONFIG.DEFAULT_FILL;
        }
      });
    }

    console.log('✅ 多邊形 GeoJSON 載入完成:', geoJsonData.features.length, '筆資料');
    console.log('📊 人口屬性圖例生成完成:', Object.keys(populationLegends));

    return {
      geoJsonData,
      tableData: geoJsonData.features.map((f) => ({ ...f.properties.tableData })),
      summaryData,
      legendData,
      ...populationLegends, // 展開所有人口屬性圖例
      spatialAnalysisData: null,
    };
  } catch (error) {
    console.error('❌ 多邊形 GeoJSON 載入或處理失敗:', error);
    throw error;
  }
}

// ==================== 額外的 Natural Breaks 工具函數 ====================

/**
 * 驗證 Natural Breaks 結果的正確性
 *
 * @param {number[]} values - 原始數值陣列
 * @param {number[]} breaks - 計算得到的斷點
 * @param {number} numClasses - 預期的分類數量
 * @returns {Object} 驗證結果
 */
function validateNaturalBreaks(values, breaks, numClasses) {
  const validValues = values
    .filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v))
    .sort((a, b) => a - b);

  const validation = {
    isValid: true,
    warnings: [],
    errors: [],
    statistics: {},
  };

  // 檢查斷點數量
  if (breaks.length !== numClasses - 1) {
    validation.errors.push(`斷點數量錯誤: 期望 ${numClasses - 1}, 實際 ${breaks.length}`);
    validation.isValid = false;
  }

  // 檢查斷點是否排序
  for (let i = 1; i < breaks.length; i++) {
    if (breaks[i] <= breaks[i - 1]) {
      validation.errors.push(`斷點未正確排序: ${breaks[i - 1]} >= ${breaks[i]}`);
      validation.isValid = false;
    }
  }

  // 檢查斷點是否在數據範圍內
  if (validValues.length > 0) {
    const min = validValues[0];
    const max = validValues[validValues.length - 1];

    for (const breakPoint of breaks) {
      if (breakPoint < min || breakPoint > max) {
        validation.warnings.push(`斷點 ${breakPoint} 超出數據範圍 [${min}, ${max}]`);
      }
    }
  }

  // 檢查類別平衡性
  if (validation.isValid && validValues.length > 0) {
    const stats = getNaturalBreaksStats(validValues, breaks);
    validation.statistics = {
      goodnessOfFit: stats.goodnessOfVarianceFit,
      classBalance: stats.classBalance,
      efficiency: stats.classificationEfficiency,
    };

    if (stats.goodnessOfVarianceFit < 0.5) {
      validation.warnings.push(`分類品質較低 (GVF=${stats.goodnessOfVarianceFit.toFixed(3)})`);
    }

    if (stats.classBalance.classVariance > stats.classBalance.averageClassSize) {
      validation.warnings.push('類別大小不平衡');
    }
  }

  return validation;
}

/**
 * 比較不同分類數量的 Natural Breaks 結果，找出最佳分類數
 *
 * @param {number[]} values - 數值陣列
 * @param {number} maxClasses - 最大分類數（默認 10）
 * @param {number} minClasses - 最小分類數（默認 2）
 * @returns {Object} 各分類數的評估結果
 */
function findOptimalClassCount(values, maxClasses = 10, minClasses = 2) {
  const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v));

  if (validValues.length === 0) {
    throw new Error('沒有有效的數值');
  }

  const results = [];
  const maxPossibleClasses = Math.min(maxClasses, validValues.length);

  for (let numClasses = minClasses; numClasses <= maxPossibleClasses; numClasses++) {
    try {
      const breaks = calculateNaturalBreaks(validValues, numClasses);
      const stats = getNaturalBreaksStats(validValues, breaks);
      const validation = validateNaturalBreaks(validValues, breaks, numClasses);

      results.push({
        numClasses,
        breaks,
        goodnessOfVarianceFit: stats.goodnessOfVarianceFit,
        classificationEfficiency: stats.classificationEfficiency,
        averageSilhouetteScore: stats.averageSilhouetteScore,
        classBalance: stats.classBalance,
        isValid: validation.isValid,
        warnings: validation.warnings,
        // 綜合評分 (0-1)
        overallScore:
          stats.goodnessOfVarianceFit * 0.4 +
          stats.classificationEfficiency * 0.3 +
          Math.max(0, stats.averageSilhouetteScore) * 0.2 +
          (1 -
            Math.min(1, stats.classBalance.classVariance / stats.classBalance.averageClassSize)) *
            0.1,
      });
    } catch (error) {
      results.push({
        numClasses,
        breaks: [],
        error: error.message,
        isValid: false,
        overallScore: 0,
      });
    }
  }

  // 找出最佳分類數
  const validResults = results.filter((r) => r.isValid);
  const optimalResult =
    validResults.length > 0
      ? validResults.reduce((best, current) =>
          current.overallScore > best.overallScore ? current : best
        )
      : null;

  return {
    results,
    optimal: optimalResult,
    recommendation: optimalResult
      ? `建議使用 ${optimalResult.numClasses} 個分類 (評分: ${optimalResult.overallScore.toFixed(3)})`
      : '無法找到合適的分類數量',
  };
}

/**
 * 創建自定義的 Natural Breaks 變體
 * 支持不同的優化目標和約束條件
 *
 * @param {number[]} values - 數值陣列
 * @param {number} numClasses - 分類數量
 * @param {Object} options - 自定義選項
 * @returns {number[]} 斷點陣列
 */
function calculateCustomNaturalBreaks(values, numClasses, options = {}) {
  const {
    // 優化目標: 'variance' | 'balance' | 'hybrid'
    objective = 'variance',
    // 最小類別大小約束
    minClassSize = 1,
    // 是否強制包含特定值作為斷點
    forceBreaks = [],
    // 權重函數 (可選)
    weightFunction = null,
  } = options;

  const validValues = [
    ...new Set(values.filter((v) => typeof v === 'number' && !isNaN(v) && isFinite(v))),
  ].sort((a, b) => a - b);

  if (validValues.length === 0) return [];
  if (numClasses === 1) return [];
  if (numClasses >= validValues.length) return validValues.slice(0, -1);

  const n = validValues.length;

  // 應用權重（如果提供）
  const weights = weightFunction ? validValues.map((v) => weightFunction(v)) : new Array(n).fill(1);

  // 預計算累積統計
  const cumulativeSum = new Float64Array(n + 1);
  const cumulativeWeightedSum = new Float64Array(n + 1);
  const cumulativeSumSquares = new Float64Array(n + 1);
  const cumulativeWeights = new Float64Array(n + 1);

  for (let i = 0; i < n; i++) {
    const value = validValues[i];
    const weight = weights[i];

    cumulativeSum[i + 1] = cumulativeSum[i] + value;
    cumulativeWeightedSum[i + 1] = cumulativeWeightedSum[i] + value * weight;
    cumulativeSumSquares[i + 1] = cumulativeSumSquares[i] + value * value * weight;
    cumulativeWeights[i + 1] = cumulativeWeights[i] + weight;
  }

  // 自定義成本函數
  const calculateCost = (start, end) => {
    const count = end - start;
    if (count < minClassSize) return Infinity;
    if (count <= 1) return 0;

    const totalWeight = cumulativeWeights[end] - cumulativeWeights[start];
    if (totalWeight <= 0) return 0;

    const weightedSum = cumulativeWeightedSum[end] - cumulativeWeightedSum[start];
    const weightedSumSquares = cumulativeSumSquares[end] - cumulativeSumSquares[start];
    const mean = weightedSum / totalWeight;

    let cost;
    switch (objective) {
      case 'balance': {
        // 優化類別大小平衡
        const expectedSize = n / numClasses;
        cost = Math.abs(count - expectedSize) * 10 + (weightedSumSquares - weightedSum * mean);
        break;
      }
      case 'hybrid': {
        // 方差和平衡的混合
        const variance = weightedSumSquares - weightedSum * mean;
        const balancePenalty = Math.abs(count - n / numClasses) * 5;
        cost = variance + balancePenalty;
        break;
      }
      default:
        // 標準方差優化
        cost = weightedSumSquares - weightedSum * mean;
    }

    return Math.max(0, cost);
  };

  // 動態規劃
  const dp = Array(n + 1)
    .fill(null)
    .map(() => Array(numClasses + 1).fill(Infinity));
  const backtrack = Array(n + 1)
    .fill(null)
    .map(() => Array(numClasses + 1).fill(0));

  // 初始化
  for (let i = minClassSize; i <= n; i++) {
    dp[i][1] = calculateCost(0, i);
  }

  // 主循環
  for (let k = 2; k <= numClasses; k++) {
    for (let i = k * minClassSize; i <= n; i++) {
      for (let j = (k - 1) * minClassSize; j < i - minClassSize + 1; j++) {
        const cost = dp[j][k - 1] + calculateCost(j, i);
        if (cost < dp[i][k]) {
          dp[i][k] = cost;
          backtrack[i][k] = j;
        }
      }
    }
  }

  // 回溯
  const breaks = [];
  let pos = n;
  let classes = numClasses;

  while (classes > 1) {
    const splitPoint = backtrack[pos][classes];
    if (splitPoint > 0) {
      breaks.push(validValues[splitPoint - 1]);
    }
    pos = splitPoint;
    classes--;
  }

  let finalBreaks = breaks.reverse();

  // 強制包含指定斷點
  if (forceBreaks.length > 0) {
    const forcedBreaks = forceBreaks
      .filter((b) => b >= validValues[0] && b <= validValues[validValues.length - 1])
      .sort((a, b) => a - b);

    finalBreaks = [...new Set([...finalBreaks, ...forcedBreaks])].sort((a, b) => a - b);

    // 如果強制斷點導致分類數超過預期，移除一些原始斷點
    if (finalBreaks.length > numClasses - 1) {
      finalBreaks = finalBreaks.slice(0, numClasses - 1);
    }
  }

  return finalBreaks.filter((v, i, arr) => i === 0 || v !== arr[i - 1]);
}

/**
 * 批量處理多個數據集的 Natural Breaks 分類
 *
 * @param {Object[]} datasets - 數據集陣列，每個包含 {name, values}
 * @param {number} numClasses - 分類數量
 * @param {Object} options - 處理選項
 * @returns {Object[]} 處理結果陣列
 */
function batchProcessNaturalBreaks(datasets, numClasses, options = {}) {
  const {
    useCommonBreaks = false, // 是否使用統一的斷點
    validateResults = true,
    includeStats = true,
  } = options;

  if (!Array.isArray(datasets) || datasets.length === 0) {
    throw new Error('datasets 必須是非空數組');
  }

  let commonBreaks = null;

  if (useCommonBreaks) {
    // 合併所有數據計算統一斷點
    const allValues = datasets.flatMap((dataset) => dataset.values || []);
    commonBreaks = calculateNaturalBreaks(allValues, numClasses);
  }

  return datasets.map((dataset) => {
    const { name, values } = dataset;

    try {
      const breaks = commonBreaks || calculateNaturalBreaks(values, numClasses);

      const result = {
        name,
        breaks,
        success: true,
      };

      if (includeStats) {
        result.stats = getNaturalBreaksStats(values, breaks);
      }

      if (validateResults) {
        result.validation = validateNaturalBreaks(values, breaks, numClasses);
      }

      return result;
    } catch (error) {
      return {
        name,
        breaks: [],
        success: false,
        error: error.message,
      };
    }
  });
}

/**
 * 導出額外的 Natural Breaks 相關函數供其他模組使用
 */
export {
  calculateNaturalBreaks,
  calculateNaturalBreaksFast,
  getNaturalBreaksStats,
  validateNaturalBreaks,
  findOptimalClassCount,
  calculateCustomNaturalBreaks,
  batchProcessNaturalBreaks,
};
