/**
 * Layer factory
 *
 * 本模組負責根據「年份」與「城市」產生地圖圖層的群組配置。
 *
 * 設計重點：
 * - 可配置化：不同城市的檔名、合併欄位、Excel 工作表命名規則集中於 CITY_CONFIGS。
 * - 可維護性：以 LAYER_TYPES 定義統一的層級語意；以小型建構器建立不同型別圖層。
 * - 易閱讀：每個輸出函數在頂部以 JSDoc 清楚說明用途與回傳型態。
 * - 使用規則：人口分佈圖層一律置底（最後 push），確保列表排序穩定。
 */

import { loadDataLayerGeoJson } from './dataProcessor.js';

// ==================== 配置常數 ====================

// 圖層類型配置已移除，只保留數據圖層

// ==================== 輔助函數 ====================

/**
 * 創建人口社會圖資配置
 * @param {string} layerId - 圖層唯一 ID
 * @param {string} layerName - 顯示名稱
 * @param {'point'|'polygon'} type - 幾何型別
 * @param {string} colorName - 主色名稱（供前端 UI 使用）
 * @returns {object}
 */
function createBaseLayer(layerId, layerName, type, colorName) {
  return {
    layerId,
    layerName,
    visible: false,
    isLoading: false,
    isLoaded: false,
    type,
    shape: null,
    colorName,
    geoJsonData: null,
    summaryData: null,
    tableData: null,
    legendData: null,
  };
}

/**
 * 創建數據圖層配置（數據圖層）
 * @param {string} layerId
 * @param {string} layerName
 * @param {string} colorName
 * @param {string} dataFileName - JSON 數據文件名
 */
function createDataLayer(layerId, layerName, colorName, dataFileName) {
  const baseLayer = createBaseLayer(layerId, layerName, 'point', colorName);

  return {
    ...baseLayer,
    geojsonLoader: loadDataLayerGeoJson, // 使用特殊的載入函數
    geojsonFileName: dataFileName,
    // 標記為數據圖層
    isDataLayer: true,
    // 標記為不可在地圖上顯示
    hideFromMap: true,
  };
}

// ==================== 主要函數 ====================

/**
 * 創建數據圖層配置（只保留數據圖層）
 * @returns {{groupName:string, groupLayers:Array<object>}}
 */
export function createCityPopulationLayers() {
  // 只保留數據圖層
  const dataLayer = createDataLayer('data_layer', '數據圖層', 'purple', 'data.json');

  return {
    groupName: '數據圖層',
    groupLayers: [dataLayer],
  };
}

// ==================== 動態圖層生成 ====================

/**
 * 根據年份和城市動態生成所有圖層配置（只保留數據圖層）
 * 規則：
 * 1. 數據圖層群組：包含示意圖數據圖層
 * @param {number} year - 年份（已移除，保留參數以維持兼容性）
 * @param {string} city - 城市（已移除，保留參數以維持兼容性）
 * @returns {Array<{groupName:string, subGroups:Array<object>}>}
 */
export function generateDynamicLayers(year, city = '台南市區') {
  // eslint-disable-next-line no-unused-vars
  const unusedYear = year;
  // eslint-disable-next-line no-unused-vars
  const unusedCity = city;
  const layers = [];

  // 數據圖層群組
  const dataGroup = {
    groupName: '數據圖層',
    subGroups: [createCityPopulationLayers()],
  };
  layers.push(dataGroup);

  return layers;
}

// ==================== 輔助函數 ====================

/**
 * 檢查指定年份是否有對應的資料可用
 */
export function isYearDataAvailable(year) {
  return year >= 2014 && year <= 2024;
}

/**
 * 取得所有可用的年份列表
 */
export function getAvailableYears() {
  const years = [];
  for (let year = 2014; year <= 2024; year++) {
    years.push(year);
  }
  return years;
}
