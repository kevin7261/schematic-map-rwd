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

import { loadDataLayerGeoJson, loadPolygonGeoJson } from './dataProcessor.js';

// ==================== 配置常數 ====================

/**
 * 圖層類型配置
 *
 * 統一定義不同「語意層級」的顯示名稱與預設屬性。
 * 顏色規則：
 * - 人口分佈：統一使用 orange 顏色
 */
const LAYER_TYPES = {
  // 人口分佈圖層 - 統一使用 orange 顏色
  GEO_LAYER: {
    code2: {
      layerName: '二級統計區',
      colorName: 'orange',
      type: 'polygon',
    },
    village: {
      layerName: '村里',
      colorName: 'orange',
      type: 'polygon',
    },
    township: {
      layerName: '鄉鎮市區',
      colorName: 'orange',
      type: 'polygon',
    },
  },
};

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
 * 創建人口分佈圖層配置（僅載入 GeoJSON，不做分析）
 * @param {string} layerId
 * @param {{layerName:string,type:string}} layerConfig
 * @param {string} geojsonFileName
 * @param {string} colorName
 */
function createPopulationLayer(layerId, layerConfig, geojsonFileName, colorName) {
  const baseLayer = createBaseLayer(layerId, layerConfig.layerName, layerConfig.type, colorName);

  return {
    ...baseLayer,
    geojsonLoader: loadPolygonGeoJson,
    geojsonFileName,
    // 標記為人口分佈圖層，供樣式與圖例選擇使用
    isPopulationLayer: true,
  };
}

/**
 * 創建數據圖層配置（不顯示在 MapTab 中）
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
    // 標記為數據圖層，不在 MapTab 中顯示
    isDataLayer: true,
    // 標記為不可在地圖上顯示
    hideFromMap: true,
  };
}

// ==================== 主要函數 ====================

/**
 * 創建城市人口分佈圖層配置
 * 注意：人口分佈圖層一律應置底顯示，請在 generateDynamicLayers 的最後 push。
 * @param {string} city - '台南市區' | '高雄市區'
 * @returns {{groupName:string, groupLayers:Array<object>}}
 */
export function createCityPopulationLayers(city) {
  const levels = [
    {
      level: 'code2',
      fileName: `113年12月行政區人口統計_二級統計區_${city}.geojson`,
    },
    {
      level: 'village',
      fileName: `113年12月行政區人口統計_村里_${city}.geojson`,
    },
    {
      level: 'township',
      fileName: `113年12月行政區人口統計_鄉鎮市區_${city}.geojson`,
    },
  ];

  const groupLayers = levels.map(({ level, fileName }) =>
    createPopulationLayer(
      `${city}人口分佈 - ${LAYER_TYPES.GEO_LAYER[level].layerName}`,
      LAYER_TYPES.GEO_LAYER[level],
      fileName,
      LAYER_TYPES.GEO_LAYER[level].colorName // 使用配置中的顏色
    )
  );

  // 添加數據圖層到人口社會圖資群組中
  const dataLayer = createDataLayer('data_layer', '數據圖層', 'purple', 'data.json');
  groupLayers.push(dataLayer);

  return {
    groupName: '人口社會圖資',
    groupLayers,
  };
}

// ==================== 動態圖層生成 ====================

/**
 * 根據年份和城市動態生成所有圖層配置（只保留地理資料）
 * 規則：
 * 1. 地理資料主群組：包含人口社會圖資子群組（包含數據圖層）
 * @param {number} year
 * @param {string} city - '台南市區' | '高雄市區'
 * @returns {Array<{groupName:string, subGroups:Array<object>}>}
 */
export function generateDynamicLayers(year, city = '台南市區') {
  const layers = [];

  // 地理資料主群組（包含人口社會圖資和數據圖層）
  const geoGroup = {
    groupName: '地理資料',
    subGroups: [createCityPopulationLayers(city)],
  };
  layers.push(geoGroup);

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
