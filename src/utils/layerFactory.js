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

import {
  loadDistrictGeoJson,
  loadPointGeoJson,
  loadDataLayerGeoJson,
  loadExcelSheet,
  mergeGeoJSONWithExcel,
  calculateClassification,
  loadPolygonGeoJson,
} from './dataProcessor.js';

import { calculatePysdaAnalysis, calculateMSTDBSCANAnalysis } from './pysda.js';

// ==================== 配置常數 ====================

/**
 * 城市配置映射
 *
 * 說明：
 * - geojsonFiles：該城市不同層級的 GeoJSON 檔名（相對於 public/data/geojson）。
 * - excelSheetPatterns：用於產生 Excel 工作表名稱的規則（輸入 yearShort，例如 '24'）。
 * - mergeFields：GeoJSON 與 Excel 合併時使用的鍵值欄位。
 * - thresholds：空間分析 Join Counts 所需的二元分類閾值。
 */
const CITY_CONFIGS = {
  台南市區: {
    geojsonFiles: {
      village: '113年12月行政區人口統計_村里_台南市區.geojson',
      code2: '113年12月行政區人口統計_二級統計區_台南市區.geojson',
      township: '113年12月行政區人口統計_鄉鎮市區_台南市區.geojson',
    },
    excelSheetPatterns: {
      village: (yearShort) => `${yearShort}_台南市區_合併位置_村里`,
      code2: (yearShort) => `${yearShort}_台南市區_合併位置_二級統計區`,
      township: (yearShort) => `${yearShort}_台南市區_合併位置_鄉鎮市區`,
    },
    mergeFields: {
      village: 'VILLAGE',
      code2: 'CODE2',
      township: 'TOWN',
    },
    thresholds: {
      village: null, // 自動計算為 (min + max) / 2
      code2: null, // 自動計算為 (min + max) / 2
      township: null, // 自動計算為 (min + max) / 2
    },
  },
  高雄市區: {
    geojsonFiles: {
      village: '113年12月行政區人口統計_村里_高雄市區.geojson',
      code2: '113年12月行政區人口統計_二級統計區_高雄市區.geojson',
      township: '113年12月行政區人口統計_鄉鎮市區_高雄市區.geojson',
    },
    excelSheetPatterns: {
      village: () => '14_高雄市區_合併位置_村里', // 高雄市區的 _1 版本只到 2014 年
      code2: () => '14_高雄市區_合併位置_二級統計區', // 高雄市區的 _2 版本只到 2014 年
      township: () => '16_高雄市區_合併位置_鄉鎮市區', // 高雄市區的合併位置只到 2016 年
    },
    mergeFields: {
      village: 'VILLAGE',
      code2: 'CODE2',
      township: 'TOWN',
    },
    thresholds: {
      village: null, // 自動計算為 (min + max) / 2
      code2: null, // 自動計算為 (min + max) / 2
      township: null, // 自動計算為 (min + max) / 2
    },
  },
};

/**
 * 圖層類型配置
 *
 * 統一定義不同「語意層級」的顯示名稱與預設屬性。
 * 顏色規則：
 * - 面域：統一使用 lime 顏色
 * - 點位：統一使用 green 顏色
 * - 人口分佈：統一使用 orange 顏色
 */
const LAYER_TYPES = {
  // 面域圖層 - 統一使用 lime 顏色
  POLYGON_LAYER: {
    code2: {
      layerName: '二級統計區',
      colorName: 'lime',
      type: 'polygon',
    },
    village: {
      layerName: '村里',
      colorName: 'lime',
      type: 'polygon',
    },
    township: {
      layerName: '鄉鎮市區',
      colorName: 'lime',
      type: 'polygon',
    },
  },
  // 點位圖層 - 統一使用 green 顏色
  POINT_LAYER: {
    code2: {
      layerName: '二級統計區',
      colorName: 'green',
      type: 'point',
    },
    village: {
      layerName: '村里',
      colorName: 'green',
      type: 'point',
    },
    township: {
      layerName: '鄉鎮市區',
      colorName: 'green',
      type: 'point',
    },
  },
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
 * 創建分析圖層配置
 * @param {string} layerId
 * @param {{layerName:string,type:string,colorName:string}} layerConfig
 * @param {{geojsonFiles:Object,excelSheetPatterns:Object,mergeFields:Object,thresholds:Object}} cityConfig
 * @param {'village'|'code2'|'township'} level
 * @param {string} yearShort - 年份後兩碼，如 '98','15','24'
 */
function createAnalysisLayer(layerId, layerConfig, cityConfig, level, yearShort) {
  const baseLayer = createBaseLayer(
    layerId,
    layerConfig.layerName,
    layerConfig.type,
    layerConfig.colorName
  );

  return {
    ...baseLayer,
    legendData_SpatialLag: null,
    legendData_JoinCounts: null,
    geojsonLoader: loadDistrictGeoJson,
    excelSheetLoader: loadExcelSheet,
    mergeFunction: mergeGeoJSONWithExcel,
    classificationFunction: calculateClassification,
    geojsonFileName: cityConfig.geojsonFiles[level],
    excelFileName: 'Dengue Daily_台南市區_高雄市區.xlsx',
    excelSheetName: cityConfig.excelSheetPatterns[level](yearShort),
    geojsonMergeField: cityConfig.mergeFields[level],
    excelMergeField: 'name',
    binaryThreshold: cityConfig.thresholds[level],
    valueField: 'count',
    isAnalysisLayer: true,
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
 * 創建特殊分析圖層配置（點位）
 * @param {{layerId:string,layerName:string,type:string,colorName:string}} layerConfig
 * @param {'POINTS'} analysisType
 */
function createSpecialLayer(layerConfig, analysisType) {
  const baseLayer = createBaseLayer(
    layerConfig.layerId,
    layerConfig.layerName,
    layerConfig.type,
    layerConfig.colorName
  );

  if (analysisType === 'POINTS') {
    // 純點位圖層（不進行分析）
    return {
      ...baseLayer,
      geojsonLoader: loadPointGeoJson,
      geojsonFileName: '', // 將由調用者設置
      // 啟用點位的雙分析模式（PySDA + MSTDBSCAN）
      isPointCombinedLayer: true,
      pysdaAnalysisFunction: calculatePysdaAnalysis,
      mstdbscanAnalysisFunction: calculateMSTDBSCANAnalysis,
      // 結果容器
      pysdaResults: null,
      pysdaSummary: null,
      pysdaFigureData: null,
      mstdbscanResults: null,
      mstdbscanSummary: null,
    };
  }

  return baseLayer;
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
 * 根據統計區級別創建包含面域和點位的圖層群組
 * @param {number} year - 例如 1998、2015、2024
 * @param {string} city - '台南市區' | '高雄市區'
 * @param {string} districtLevel - '二級統計區' | '村里' | '鄉鎮市區'
 * @returns {{groupName:string, groupLayers:Array<object>}}
 */
export function createDistrictLevelGroup(year, city = '台南市區', districtLevel) {
  const yearShort = String(year).slice(-2);
  const cityConfig = CITY_CONFIGS[city] || CITY_CONFIGS['台南市區'];
  const cityFolder = city === '台南市區' ? '台南市區' : '高雄市區';

  let districtType, pointFileName;

  switch (districtLevel) {
    case '二級統計區':
      districtType = 'code2';
      pointFileName = `${cityFolder}_二級統計區_點位_2014-2024/${cityFolder}_二級統計區_點位_${yearShort}.geojson`;
      break;
    case '村里':
      districtType = 'village';
      pointFileName = `${cityFolder}_居住村里_點位_2014-2024/${cityFolder}_居住村里_點位_${yearShort}.geojson`;
      break;
    case '鄉鎮市區':
      districtType = 'township';
      pointFileName = `${cityFolder}_居住鄉鎮_點位_2014-2024/${cityFolder}_居住鄉鎮_點位_${yearShort}.geojson`;
      break;
    default:
      throw new Error(`未知的統計區級別: ${districtLevel}`);
  }

  // 創建面域圖層
  const polygonLayer = createAnalysisLayer(
    `${yearShort}_${city}_${districtLevel}_面域`,
    LAYER_TYPES.POLYGON_LAYER[districtType],
    cityConfig,
    districtType,
    yearShort
  );
  polygonLayer.layerName = '面域';

  // 創建點位圖層
  const pointLayerConfig = {
    ...LAYER_TYPES.POINT_LAYER[districtType],
    layerId: `POINTS_${districtLevel}_${city}_${year}`,
  };
  const pointLayer = createSpecialLayer(pointLayerConfig, 'POINTS');
  pointLayer.geojsonFileName = pointFileName;
  pointLayer.layerName = '點位';

  const groupLayers = [polygonLayer, pointLayer];

  return {
    groupName: districtLevel,
    groupLayers,
  };
}

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

/**
 * 向後兼容函數：創建點位圖層配置（已棄用，請使用 createDistrictLevelGroup）
 * @deprecated 請使用 createDistrictLevelGroup 替代
 * @returns {{groupName:string, groupLayers:Array<object>}}
 */
export function createPointAnalysisLayers() {
  // 向後兼容：返回空群組
  // eslint-disable-next-line no-console
  console.warn('createPointAnalysisLayers 已棄用，請使用新的按統計區分組的結構');
  return {
    groupName: '點位分析 (已棄用)',
    groupLayers: [],
  };
}

/**
 * 向後兼容函數：創建面域圖層配置（已棄用，請使用 createDistrictLevelGroup）
 * @deprecated 請使用 createDistrictLevelGroup 替代
 * @returns {{groupName:string, groupLayers:Array<object>}}
 */
export function createCityYearBasedLayers() {
  // 向後兼容：返回空群組
  // eslint-disable-next-line no-console
  console.warn('createCityYearBasedLayers 已棄用，請使用新的按統計區分組的結構');
  return {
    groupName: '面域分析 (已棄用)',
    groupLayers: [],
  };
}

/**
 * 向後兼容：高雄市區點位分析圖層
 * @param {number} year - 年份
 * @returns {{groupName:string, groupLayers:Array<object>}}
 */
export function createKaohsiungStaticLayers(year) {
  return createPointAnalysisLayers(year, '高雄市區');
}

// ==================== 向後兼容函數 ====================

/**
 * 向後兼容：台南年份群組
 */
export function createTainanYearBasedLayers(year) {
  return createCityYearBasedLayers(year, '台南市區');
}

/**
 * 向後兼容：台南人口分佈群組
 */
export function createTainanPopulationLayers() {
  return createCityPopulationLayers('台南市區');
}

/**
 * 向後兼容：高雄人口分佈群組
 */
export function createKaohsiungPopulationLayers() {
  return createCityPopulationLayers('高雄市區');
}

// ==================== 動態圖層生成 ====================

/**
 * 根據年份和城市動態生成所有圖層配置（新結構）
 * 規則：
 * 1. 分析資料主群組：包含二級統計區、村里、鄉鎮市區子群組
 * 2. 地理資料主群組：包含人口社會圖資子群組（包含數據圖層）
 * 3. 每個統計區子群組包含：面域 + 點位
 * @param {number} year
 * @param {string} city - '台南市區' | '高雄市區'
 * @returns {Array<{groupName:string, subGroups:Array<object>}>}
 */
export function generateDynamicLayers(year, city = '台南市區') {
  const layers = [];

  // 1. 分析資料主群組
  const analysisGroup = {
    groupName: '分析資料',
    subGroups: [
      createDistrictLevelGroup(year, city, '二級統計區'),
      createDistrictLevelGroup(year, city, '村里'),
      createDistrictLevelGroup(year, city, '鄉鎮市區'),
    ],
  };
  layers.push(analysisGroup);

  // 2. 地理資料主群組（包含人口社會圖資和數據圖層）
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
