/**
 * 🧪 空間分析計算模組 (Spatial Analysis Calculation Module)
 *
 * 功能說明 (Features):
 * 1. 🔗 空間滯後計算 (Spatial Lag Calculation)
 * 2. 📊 二元 Join Counts 分析 (Binary Join Counts Analysis)
 * 3. 📈 Moran's I 空間自相關分析 (Moran's I Spatial Autocorrelation)
 * 4. 📉 Geary's C 空間自相關分析 (Geary's C Spatial Autocorrelation)
 * 5. 🔥 Getis-Ord G 熱點分析 (Getis-Ord G Hotspot Analysis)
 * 6. 🎯 統一的空間分析 API 介面
 *
 * 技術特點 (Technical Features):
 * - 整合多種空間統計方法至單一函數
 * - 支援 K-近鄰空間權重矩陣
 * - 提供完整的統計檢定和顯著性分析
 * - 支援 Monte Carlo 模擬和隨機化檢定
 * - 優化的計算性能和記憶體使用
 *
 * 支援的分析方法 (Supported Analysis Methods):
 * - 空間自相關分析：Moran's I, Geary's C
 * - 熱點分析：Getis-Ord G 統計量
 * - 二元關聯分析：Join Counts 統計量
 * - 空間滯後分析：鄰居加權平均值
 *
 * 數學基礎 (Mathematical Foundation):
 * - 基於 PySAL 空間分析庫的 JavaScript 實現
 * - 遵循學術標準的統計計算方法
 * - 支援多種空間權重矩陣類型
 * - 提供完整的假設檢定框架
 *
 * @file calculateSpatialAnalysis.js
 * @version 2.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 */

// ==================== 📦 空間分析庫引入 (Spatial Analysis Library Imports) ====================

/**
 * K-近鄰空間權重矩陣
 * 用於建立基於距離的空間鄰近關係
 *
 * @see ./libpysal/weights/distance.js
 */
import { KNN } from './libpysal/weights/distance.js';

/**
 * 空間滯後計算
 * 計算鄰居加權平均值，用於空間自相關分析
 *
 * @see ./libpysal/weights/spatial_lag.js
 */
import { spatial_lag } from './libpysal/weights/spatial_lag.js';

/**
 * 空間權重工具函數
 * - min_threshold_distance: 計算最小閾值距離
 * - getSimplifiedCentroid: 獲取簡化的幾何中心點
 *
 * @see ./libpysal/weights/util.js
 */
import { min_threshold_distance, getSimplifiedCentroid } from './libpysal/weights/util.js';

/**
 * 探索性空間數據分析 (ESDA) 統計量
 * 提供各種空間統計方法的實現
 */
import { Moran } from './esda/moran.js'; // Moran's I 空間自相關
import { Geary } from './esda/geary.js'; // Geary's C 空間自相關
import { G as GetisOrdG } from './esda/getisord.js'; // Getis-Ord G 熱點分析
import { Join_Counts } from './esda/join_counts.js'; // Join Counts 二元關聯

// ==================== 🔧 輔助函數 (Helper Functions) ====================

/**
 * 📊 提取 y 值數組並映射 ID 到原始索引 (Extract Y Values and Map IDs to Original Indices)
 *
 * 功能說明：
 * - 從 GeoJSON 數據中提取指定欄位的數值
 * - 建立 ID 到原始索引的映射關係
 * - 處理缺失值和無效數據
 * - 確保數據與空間權重矩陣的順序一致
 *
 * 數據處理流程：
 * 1. 建立 ID 到原始索引的映射表
 * 2. 根據空間權重矩陣的 ID 順序提取數值
 * 3. 處理缺失值和無效數據（設為 0）
 * 4. 返回數值陣列和映射關係
 *
 * @param {Object} geoJsonData - GeoJSON 數據對象
 * @param {Array} w_id_order - 空間權重矩陣中的 ID 順序
 * @param {string} valueField - 要提取的屬性欄位名
 *
 * @returns {Object} 包含以下屬性的對象：
 * - y: {Array<number>} 提取的數值陣列
 * - idToOriginal: {Map} ID 到原始索引的映射
 *
 * @example
 * const geoJsonData = {
 *   features: [
 *     { properties: { id: 1, population: 1000 } },
 *     { properties: { id: 2, population: 2000 } }
 *   ]
 * };
 * const w_id_order = [1, 2];
 * const result = extractYValues(geoJsonData, w_id_order, 'population');
 * // 結果: { y: [1000, 2000], idToOriginal: Map { '1' => 0, '2' => 1 } }
 *
 * @since 1.0.0
 * @author Kevin Cheng
 */
function extractYValues(geoJsonData, w_id_order, valueField) {
  // ==================== 🗺️ 建立 ID 到原始索引的映射表 (Create ID to Original Index Mapping) ====================

  // 創建 Map 對象用於存儲 ID 到原始索引的映射關係
  // Map 提供 O(1) 的查找性能，適合大量數據的快速檢索
  const idToOriginal = new Map();

  // 遍歷 GeoJSON 中的所有 features，建立 ID 映射表
  // forEach 方法會對每個 feature 執行回調函數
  geoJsonData.features.forEach((f, idx) => {
    // 獲取 feature 的 ID，優先使用 properties.id，如果不存在則使用索引
    // String() 轉換確保 ID 為字符串類型，便於後續比較
    const fid =
      f.properties && f.properties.id !== undefined ? String(f.properties.id) : String(idx);

    // 將 ID 和對應的原始索引存入 Map 中
    // 原始索引用於後續從 GeoJSON 中提取對應的 feature
    idToOriginal.set(fid, idx);
  });

  // ==================== 📊 提取數值陣列 (Extract Value Array) ====================

  // 根據空間權重矩陣的 ID 順序提取對應的數值
  // map 方法會返回一個新陣列，保持與 w_id_order 相同的順序
  const y = w_id_order.map((id) => {
    // 將 ID 轉換為字符串，確保類型一致性
    const stringId = String(id);

    // 從映射表中查找對應的原始索引
    const originIdx = idToOriginal.get(stringId);

    // 檢查原始索引是否有效且對應的 feature 是否存在
    if (originIdx === undefined || !geoJsonData.features[originIdx]) {
      // 如果找不到對應的 feature，輸出警告並返回 0
      console.warn(`找不到 id ${stringId} 對應的 feature，originIdx:`, originIdx);
      return 0; // 返回 0 作為預設值，避免分析中斷
    }

    // 獲取對應的 feature 對象
    const f = geoJsonData.features[originIdx];

    // 從 feature 的 properties 中提取指定欄位的數值
    // 使用可選鏈操作符 (?.) 和空值合併操作符 (??) 確保安全訪問
    // 如果欄位不存在或為 null/undefined，則使用 0 作為預設值
    const value = Number(f?.properties?.[valueField] ?? 0);

    // 檢查提取的數值是否為有效的數字
    if (isNaN(value)) {
      // 如果數值無效，輸出警告並返回 0
      console.warn(`id ${stringId} 的 ${valueField} 值無效:`, f?.properties?.[valueField]);
      return 0; // 返回 0 作為預設值
    }

    // 返回有效的數值
    return value;
  });

  // 返回提取的數值陣列和 ID 映射表
  // 數值陣列用於後續的空間分析計算
  // ID 映射表用於結果的逆向映射和驗證
  return { y, idToOriginal };
}

// 移除未使用的函數

/**
 * 執行 Moran's I 空間自相關分析
 *
 * @param {Array} y - 原始值陣列
 * @param {Object} w - 空間權重矩陣
 * @param {string} transformation - 權重轉換方式
 * @param {number} permutations - 模擬次數
 * @param {number} seed - 隨機種子
 * @returns {Object} - Moran's I 分析結果
 */
function calculateMoransI(y, w, transformation, permutations, seed) {
  // ==================== 📊 計算平均值和標準化數值 (Calculate Mean and Standardized Values) ====================

  // 計算數值陣列的平均值
  // reduce 方法累加所有數值，然後除以陣列長度得到平均值
  // 這對應 Python 中的 db[ANALYSIS_FIELD_NAME].mean()
  const mean = y.reduce((sum, val) => sum + val, 0) / y.length;

  // 計算每個數值與平均值的差異（標準化）
  // map 方法對每個數值減去平均值，得到中心化的數值
  // 這對應 Python: db[ANALYSIS_FIELD_NAME_STD] = db[ANALYSIS_FIELD_NAME] - db[ANALYSIS_FIELD_NAME].mean()
  const y_std = y.map((val) => val - mean);

  // ==================== 🔗 計算空間滯後值 (Calculate Spatial Lag Values) ====================

  // 計算空間滯後值（鄰居加權平均值）
  // spatial_lag.lag_spatial 函數使用空間權重矩陣計算每個位置的鄰居加權平均值
  // 這對應 Python: db[ANALYSIS_FIELD_NAME_LAG_STD] = spatial_lag(db[ANALYSIS_FIELD_NAME_STD], w)
  const y_lag_std = spatial_lag.lag_spatial(w, y_std);

  // ==================== 🧪 初始化 Moran 分析對象 (Initialize Moran Analysis Object) ====================

  // 創建 Moran 分析對象並執行計算
  // 傳入原始數值陣列、空間權重矩陣和分析參數
  const moranTemp = new Moran(y, w, {
    transformation, // 空間權重矩陣轉換方式（如行標準化）
    permutations, // Monte Carlo 模擬次數
    two_tailed: false, // 單尾檢定（預設為 false）
    seed, // 隨機數種子，確保結果可重現
  });

  // ==================== 🔢 手動計算 Moran's I 作為備份驗證 (Manual Moran's I Calculation for Verification) ====================

  // 手動計算 Moran's I 統計量作為備份驗證
  // 這確保計算結果的正確性和一致性
  let manualI = 0;

  // 計算標準化數值的空間滯後值
  // moranTemp.z 是標準化後的數值陣列
  const zl = spatial_lag.lag_spatial(moranTemp.w, moranTemp.z);

  // 計算 Moran's I 的分子部分
  // 對每個位置計算其標準化值與鄰居標準化滯後值的乘積
  const inum = moranTemp.z.reduce((sum, val, i) => sum + val * zl[i], 0);

  // 獲取空間權重矩陣的總和
  // s0 是權重矩陣中所有權重的總和
  const s0 = moranTemp.w.s0;

  // 獲取標準化數值的平方和
  // z2ss 用於計算 Moran's I 的分母
  const z2ss = moranTemp.z2ss;

  // 處理可能的錯誤情況
  if (z2ss === 0) {
    console.warn("z2ss 為 0，可能所有數值都相同，Moran's I 無法計算");
  } else if (s0 === 0) {
    console.warn("s0 為 0，權重總和為 0，Moran's I 無法計算");
  } else {
    manualI = (moranTemp.n / s0) * (inum / z2ss);
  }

  // 返回結果
  return {
    I: manualI, // 使用手動計算的值，通常更可靠
    p_sim: moranTemp.p_sim,
    significant: moranTemp.p_sim < 0.05,
    originalValues: y,
    lagValues: spatial_lag.lag_spatial(w, y), // 使用原始的值計算滯後值
    standardizedValues: y_std,
    standardizedLagValues: y_lag_std,
    sim: moranTemp.sim,
  };
}

/**
 * 執行 Geary's C 空間自相關分析
 *
 * @param {Array} y - 原始值陣列
 * @param {Object} w - 空間權重矩陣
 * @param {string} transformation - 權重轉換方式
 * @param {number} permutations - 模擬次數
 * @param {number} seed - 隨機種子
 * @returns {Object} - Geary's C 分析結果與解釋
 */
function calculateGearyC(y, w, transformation, permutations, seed) {
  const geary = new Geary(y, w, { transformation, permutations, seed });

  // 解釋 Geary's C 結果
  let interpretation = '';
  if (geary.C < 1 && geary.p_sim < 0.05) {
    interpretation =
      '存在正向空間自相關（鄰近值傾向相似）。高值區域周圍傾向於有高值，低值區域周圍傾向於有低值。';
  } else if (geary.C > 1 && geary.p_sim < 0.05) {
    interpretation =
      '存在負向空間自相關（鄰近值傾向不同）。高值區域周圍傾向於有低值，低值區域周圍傾向於有高值。';
  } else {
    interpretation =
      "無明顯空間關聯性，可能是隨機分布。Geary's C 值接近 1 或 p 值不顯著，表示數據在空間上可能是隨機分佈的。";
  }

  return {
    C: geary.C,
    p_sim: geary.p_sim,
    significant: geary.p_sim < 0.05,
    interpretation,
  };
}

/**
 * 執行 Getis-Ord G 熱點分析
 *
 * @param {Array} y - 原始值陣列
 * @param {Object} w - 空間權重矩陣
 * @param {number} permutations - 模擬次數
 * @param {number} seed - 隨機種子
 * @param {number} minThr - 最小距離門檻
 * @returns {Object} - Getis-Ord G 分析結果與解釋
 */
function calculateGetisOrdG(y, w, permutations, seed) {
  const getis = new GetisOrdG(y, w, { permutations, seed });

  // 解釋 Getis-Ord G 結果
  let interpretation = '';
  if (getis.p_sim < 0.05) {
    if (getis.z_sim > 0) {
      interpretation = '存在高值空間集群（熱點）。在空間上，數據的高值傾向於聚集在一起。';
    } else {
      interpretation = '存在低值空間集群（冷點）。在空間上，數據的低值傾向於聚集在一起。';
    }
  } else {
    interpretation =
      '無明顯高值或低值集群，可能是隨機分佈。Getis-Ord G 值不顯著，表示高值或低值的聚集可能是隨機發生的。';
  }

  return {
    G: getis.G,
    p_sim: getis.p_sim,
    z_sim: getis.z_sim,
    significant: getis.p_sim < 0.05,
    interpretation,
  };
}

/**
 * 執行 Join Counts 分析 (二元變量的空間自相關)
 *
 * @param {Array} y - 原始值陣列
 * @param {Object} w - 空間權重矩陣
 * @param {number} binaryThreshold - 二元分類閾值，如果為null則自動計算為(min+max)/2
 * @param {number} permutations - 模擬次數
 * @param {number} seed - 隨機種子
 * @returns {Object} - Join Counts 分析結果或 null (如果數據無效)
 */
function calculateJoinCounts(y, w, binaryThreshold, permutations, seed) {
  // 計算原始數據的描述性統計信息
  const validY = y.filter((v) => !isNaN(v) && v !== null);
  if (validY.length === 0) return null;

  const min = Math.min(...validY);
  const max = Math.max(...validY);
  const mean = validY.reduce((sum, v) => sum + v, 0) / validY.length;
  const std = Math.sqrt(validY.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / validY.length);

  // 如果沒有提供阈值，則自動計算為 (min + max) / 2
  let actualThreshold = binaryThreshold;
  if (actualThreshold === null || actualThreshold === undefined) {
    actualThreshold = Math.round((min + max) / 2);
  }

  // 進行二元分類
  const binaryValues = y.map((v) => (v > actualThreshold ? 1 : 0));
  const totalOnes = binaryValues.filter((v) => v === 1).length;
  const totalZeros = binaryValues.filter((v) => v === 0).length;

  // 計算 Join Counts
  const jc = new Join_Counts(binaryValues, w, { permutations, seed });

  // 構建結果對象
  const result = {
    bb: jc.bb, // 0-0 鄰接數量
    ww: jc.ww, // 1-1 鄰接數量
    bw: jc.bw, // 0-1 鄰接數量
    total: jc.bb + jc.ww + jc.bw,
    mean_bb: jc.mean_bb ?? null,
    mean_bw: jc.mean_bw ?? null,
    p_sim_bb: jc.p_sim_bb ?? null,
    p_sim_bw: jc.p_sim_bw ?? null,
    totalOnes,
    totalZeros,
    threshold: actualThreshold, // 使用實際計算的阈值
    significant_bb: jc.p_sim_bb < 0.05,
    significant_bw: jc.p_sim_bw < 0.05,
    // 添加描述性統計信息（與 spatial lag 保持一致的格式）
    min,
    max,
    mean,
    std,
  };

  // 添加空間模式解釋
  result.pattern =
    result.p_sim_bb < 0.05 ? (result.bb > result.mean_bb ? '顯著聚集' : '顯著分散') : '無顯著模式';

  return result;
}

/**
 * 計算空間滯後值的基本統計信息
 *
 * @param {Array} y - 原始值陣列
 * @param {Array} lagValues - 空間滯後值陣列
 * @returns {Object} - 空間滯後值統計信息
 */
function calculateSpatialLagStats(y, lagValues) {
  const lagMean = lagValues.reduce((a, b) => a + b, 0) / lagValues.length;
  const lagStd = Math.sqrt(
    lagValues.reduce((a, b) => a + Math.pow(b - lagMean, 2), 0) / lagValues.length
  );
  const originalMean = y.reduce((a, b) => a + b, 0) / y.length;

  let correlation = null;
  if (lagValues.length === y.length && lagValues.length > 1) {
    const meanY = originalMean;
    const meanLag = lagMean;
    const numerator = y.reduce((sum, v, i) => sum + (v - meanY) * (lagValues[i] - meanLag), 0);
    const denominator = Math.sqrt(
      y.reduce((sum, v) => sum + Math.pow(v - meanY, 2), 0) *
        lagValues.reduce((sum, v) => sum + Math.pow(v - meanLag, 2), 0)
    );
    correlation = denominator !== 0 ? numerator / denominator : null;
  }

  return { lagMean, lagStd, originalMean, correlation };
}

/**
 * 更新 GeoJSON 數據，添加空間滯後值
 *
 * @param {Object} geoJsonData - 原始 GeoJSON 數據對象
 * @param {Array} lagValues - 空間滯後值陣列
 * @param {Object} w - 空間權重矩陣
 * @param {Map} idToOriginal - ID 到原始索引的映射
 * @returns {Object} - 更新後的 GeoJSON 數據
 */
function updateGeoJSONWithSpatialLag(geoJsonData, lagValues, w, idToOriginal) {
  const lagFullArray = new Array(geoJsonData.features.length).fill(0);

  w.id_order.forEach((id, idx) => {
    const originIdx = idToOriginal.get(String(id));
    if (originIdx !== undefined) {
      lagFullArray[originIdx] = lagValues[idx];
    }
  });

  return {
    ...geoJsonData,
    features: geoJsonData.features.map((f, idx) => ({
      ...f,
      properties: {
        ...f.properties,
        spatial_lag: lagFullArray[idx],
      },
    })),
  };
}

/**
 * 🧪 主空間分析函數 - 整合多種空間分析方法 (Main Spatial Analysis Function)
 *
 * 功能說明：
 * 這是空間分析模組的核心函數，整合了多種空間統計方法：
 * - 空間滯後計算 (Spatial Lag)
 * - Moran's I 空間自相關分析
 * - Geary's C 空間自相關分析
 * - Getis-Ord G 熱點分析
 * - Join Counts 二元關聯分析
 *
 * 分析流程：
 * 1. 建立 K-近鄰空間權重矩陣
 * 2. 提取和驗證數據
 * 3. 計算空間滯後值
 * 4. 執行各種空間統計分析
 * 5. 進行顯著性檢定
 * 6. 返回完整的分析結果
 *
 * 技術特點：
 * - 支援多種空間權重矩陣轉換
 * - 提供完整的統計檢定和顯著性分析
 * - 支援 Monte Carlo 模擬和隨機化檢定
 * - 優化的計算性能和記憶體使用
 * - 完整的錯誤處理和數據驗證
 *
 * @param {Object} geoJsonData - GeoJSON 數據對象，包含地理要素和屬性
 * @param {Object} [options={}] - 分析選項配置
 * @param {number} [options.k=8] - K-近鄰數量，用於建立空間權重矩陣
 * @param {string} [options.valueField='count'] - 要分析的數值屬性欄位名
 * @param {string} [options.transformation='R'] - 空間權重矩陣轉換方式
 *   - 'R': 行標準化 (Row Standardization)
 *   - 'B': 雙標準化 (Binary)
 *   - 'V': 變異數標準化 (Variance)
 * @param {number|null} [options.binaryThreshold=null] - 二元分類閾值，用於 Join Counts 分析
 * @param {number} [options.permutations=999] - Monte Carlo 模擬次數
 * @param {number} [options.seed=1234] - 隨機數種子，確保結果可重現
 *
 * @returns {Object} 包含以下屬性的分析結果對象：
 * - spatialLag: {Array<number>} 空間滯後值陣列
 * - moran: {Object} Moran's I 分析結果
 * - geary: {Object} Geary's C 分析結果
 * - getisOrd: {Object} Getis-Ord G 分析結果
 * - joinCounts: {Object|null} Join Counts 分析結果（如果提供二元閾值）
 * - weights: {Object} 空間權重矩陣信息
 * - data: {Object} 原始數據和處理後數據
 *
 * @example
 * // 基本使用
 * const result = calculateSpatialAnalysis(geoJsonData);
 *
 * // 自定義參數
 * const result = calculateSpatialAnalysis(geoJsonData, {
 *   k: 6,
 *   valueField: 'population',
 *   transformation: 'R',
 *   binaryThreshold: 1000,
 *   permutations: 999
 * });
 *
 * // 使用結果
 * console.log('Moran\'s I:', result.moran.I);
 * console.log('空間滯後值:', result.spatialLag);
 *
 * @throws {Error} 當數據無效或分析失敗時拋出錯誤
 *
 * @since 1.0.0
 * @author Kevin Cheng
 */
export function calculateSpatialAnalysis(geoJsonData, options = {}) {
  // ==================== ⚙️ 參數配置和預設值 (Parameter Configuration) ====================

  const {
    k = 8, // 最近鄰居數 (selected_k) - 用於建立空間權重矩陣
    valueField = 'count', // 目標屬性欄位 (ANALYSIS_FIELD_NAME) - 要分析的數值欄位
    transformation = 'R', // 權重轉換方式 (selected_transform) - 行標準化
    binaryThreshold = null, // 分隔值 (binary_value) - 二元分類閾值
    permutations = 999, // 模擬次數 - Monte Carlo 隨機化檢定
    seed = 1234, // 隨機種子 - 確保結果可重現
  } = options;

  try {
    // 1. 建立空間權重矩陣
    const w = KNN.from_dataframe(geoJsonData, k);
    w.transform = transformation;

    // 2. 提取 y 值陣列及 ID 映射
    const { y, idToOriginal } = extractYValues(geoJsonData, w.id_order, valueField);

    // 3. 檢查數據有效性
    const hasNonZeroValue = y.some((val) => val !== 0);
    if (!hasNonZeroValue) {
      console.warn(
        `所有 y 值都是 0。請檢查 valueField "${valueField}" 是否正確，以及數據是否存在。`
      );
    }

    // 計算空間滯後值
    const lagValues = spatial_lag.lag_spatial(w, y);

    // 6. 計算滯後值相關統計
    const spatialLagStats = calculateSpatialLagStats(y, lagValues);

    // 7. 計算鄰居最小距離門檻 (用於 Getis-Ord G)
    const coords = geoJsonData.features
      .map((f) => getSimplifiedCentroid(f))
      .filter((c) => c !== null);
    const minThr = min_threshold_distance(coords);

    // 8. 執行各種空間分析
    const moranResult = calculateMoransI(y, w, transformation, permutations, seed);
    const gearyResult = calculateGearyC(y, w, transformation, permutations, seed);
    const getisResult = calculateGetisOrdG(y, w, permutations, seed);
    const joinCountsResult = calculateJoinCounts(y, w, binaryThreshold, permutations, seed);

    // 9. 更新 GeoJSON，添加空間滯後值
    const updatedGeoJSON = updateGeoJSONWithSpatialLag(geoJsonData, lagValues, w, idToOriginal);

    // 10. 組合並返回完整結果
    return {
      geoJsonData: updatedGeoJSON,
      spatialAnalysisData: {
        kNeighbors: k,
        transform: transformation,
        minThresholdDistance: minThr,
        spatialLagField: 'spatial_lag',
        moran: moranResult,
        geary: gearyResult,
        getisord: getisResult,
        ...spatialLagStats, // 展開 lagMean, lagStd, originalMean, correlation
        joinCounts: joinCountsResult,
      },
    };
  } catch (error) {
    console.error('空間分析計算過程中發生錯誤', error);
    throw new Error(`空間分析計算失敗: ${error.message}`);
  }
}
