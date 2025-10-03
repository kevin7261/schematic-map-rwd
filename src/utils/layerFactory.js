/**
 * 🏭 圖層工廠模組 (Layer Factory Module)
 *
 * 功能說明 (Features):
 * 1. 🏗️ 動態圖層生成：動態生成圖層群組配置
 * 2. 📊 數據圖層支援：專門處理示意圖數據圖層的配置和載入
 * 3. 🎨 視覺化配置：為不同圖層類型提供適當的視覺化設定
 * 4. 🔧 模組化設計：使用小型建構器函數建立不同類型的圖層
 * 5. 📱 響應式支援：確保圖層配置適配不同的顯示需求
 *
 * 技術特點 (Technical Features):
 * - 採用工廠模式設計，提供統一的圖層創建介面
 * - 支援動態配置生成，適應不同的數據源和需求
 * - 整合數據處理模組，提供完整的圖層載入流程
 * - 提供清晰的 API 介面，簡化圖層管理
 *
 * 支援的圖層類型 (Supported Layer Types):
 * - 數據圖層：示意圖節點數據、統計數據等
 * - 地理圖層：GeoJSON 格式的地理空間數據
 * - 分析圖層：包含空間分析結果的圖層
 *
 * 設計原則 (Design Principles):
 * - 可配置化：將配置參數集中管理，便於維護和修改
 * - 可維護性：使用小型建構器函數，降低複雜度
 * - 易閱讀：提供詳細的 JSDoc 註解和清晰的函數命名
 * - 穩定性：確保圖層列表的排序和結構穩定
 *
 * @file layerFactory.js
 * @version 2.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 */

// ==================== 📦 第三方庫引入 (Third-Party Library Imports) ====================

/**
 * 數據處理模組引入
 * 提供圖層數據載入和處理的核心功能
 *
 * @see ../dataProcessor.js
 */
import { loadDataLayerJson } from './dataProcessor.js';

// ==================== ⚙️ 配置常數 (Configuration Constants) ====================

/**
 * 圖層類型配置已移除，只保留數據圖層
 * 簡化架構，專注於示意圖數據的處理和顯示
 */

// ==================== 🔧 輔助函數 (Helper Functions) ====================

/**
 * 🏗️ 創建基礎圖層配置 (Create Base Layer Configuration)
 * 建立圖層的基礎配置物件，包含所有圖層共有的屬性和預設值
 *
 * 功能說明：
 * - 提供統一的圖層配置結構
 * - 設定合理的預設值，確保圖層初始狀態正確
 * - 支援不同幾何類型的圖層（點、面等）
 * - 提供視覺化相關的配置選項
 *
 * @param {string} layerId - 圖層唯一識別碼，用於區分不同圖層
 * @param {string} layerName - 圖層顯示名稱，用於 UI 顯示
 * @param {'point'|'polygon'} type - 幾何類型，定義圖層的空間特徵
 * @param {string} colorName - 主色名稱，用於前端 UI 的顏色主題
 * @returns {Object} 基礎圖層配置物件
 * @description 返回包含所有必要屬性的圖層配置物件，用於後續的圖層創建
 * @example createBaseLayer('data_layer', '數據圖層', 'point', 'purple')
 */
function createBaseLayer(layerId, layerName, type, colorName) {
  return {
    // 圖層基本識別資訊
    layerId, // 圖層唯一識別碼
    layerName, // 圖層顯示名稱

    // 圖層狀態管理
    visible: false, // 圖層是否可見，預設為隱藏
    isLoading: false, // 圖層是否正在載入中
    isLoaded: false, // 圖層是否已載入完成

    // 圖層幾何和視覺化配置
    type, // 幾何類型（point/polygon）
    shape: null, // 圖層形狀，用於特殊顯示需求
    colorName, // 主色名稱，用於 UI 主題

    // 圖層數據存儲
    geoJsonData: null, // GeoJSON 地理數據
    summaryData: null, // 圖層摘要統計數據
    tableData: null, // 表格顯示用的數據
    legendData: null, // 圖例數據
  };
}

/**
 * 📊 創建數據圖層配置 (Create Data Layer Configuration)
 * 專門用於創建示意圖數據圖層的配置，包含特殊的載入和顯示設定
 *
 * 功能說明：
 * - 基於基礎圖層配置，添加數據圖層特有的屬性
 * - 設定特殊的數據載入函數，處理示意圖節點數據
 * - 配置為不可在地圖上顯示，專用於表格和圖表展示
 * - 支援 JSON 格式的數據文件載入
 *
 * @param {string} layerId - 圖層唯一識別碼
 * @param {string} layerName - 圖層顯示名稱
 * @param {string} colorName - 主色名稱，用於 UI 主題
 * @param {string} dataFileName - JSON 數據文件名，相對於 /data/ 目錄
 * @returns {Object} 數據圖層配置物件
 * @description 返回專門用於示意圖數據的圖層配置，包含載入函數和顯示設定
 * @example createDataLayer('data_layer', '數據圖層', 'purple', 'data.json')
 */
function createDataLayer(layerId, layerName, colorName, dataFileName) {
  // 創建基礎圖層配置，使用 'point' 類型（雖然不在地圖上顯示）
  const baseLayer = createBaseLayer(layerId, layerName, 'point', colorName);

  return {
    // 展開基礎圖層配置，繼承所有基本屬性
    ...baseLayer,

    // 數據載入配置
    geojsonLoader: loadDataLayerJson, // 使用專門的數據載入函數
    geojsonFileName: dataFileName, // 數據文件名稱

    // 圖層類型標記
    isDataLayer: true, // 標記為數據圖層，用於特殊處理邏輯
    hideFromMap: true, // 標記為不可在地圖上顯示，專用於表格展示
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
 * 動態生成所有圖層配置（只保留數據圖層）
 * 規則：
 * 1. 數據圖層群組：包含示意圖數據圖層
 * @returns {Array<{groupName:string, subGroups:Array<object>}>}
 */
export function generateDynamicLayers() {
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
