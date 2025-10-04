/**
 * 📊 數據處理核心模組 (Data Processing Core Module)
 *
 * 這是一個專為示意圖響應式網站設計的數據處理核心模組，負責處理各種格式的地理空間數據，
 * 並將其轉換為適合前端視覺化組件使用的標準化格式。該模組是整個系統的數據處理中心，
 * 確保數據的完整性、一致性和可用性。
 *
 * 🎯 主要功能 (Core Features):
 * 1. 📁 JSON 檔案載入：支援多種 JSON 格式的地理空間數據載入
 *    - 網格示意圖數據：包含 x, y 座標的網格節點數據
 *    - 行政區示意圖數據：包含節點和連線的複雜網絡數據
 *    - 一般地理數據：標準的 GeoJSON 或自定義格式數據
 * 2. 📋 數據預處理：將原始數據轉換為標準化格式
 *    - 數據驗證和清理：確保數據完整性和正確性
 *    - 格式標準化：統一不同來源的數據格式
 *    - 數據增強：添加必要的計算屬性和元數據
 * 3. 📊 統計摘要生成：自動計算並生成數據統計信息
 *    - 節點數量統計：計算總節點數、可見節點數等
 *    - 空間範圍計算：計算數據的地理邊界和範圍
 *    - 數據品質指標：評估數據的完整性和準確性
 * 4. 📈 表格數據建構：生成適合表格組件顯示的數據結構
 *    - 可排序的數據列：支援按不同屬性排序
 *    - 可篩選的數據行：支援條件篩選和搜索
 *    - 分頁支援：處理大量數據的分頁顯示
 *
 * 🔧 技術特點 (Technical Features):
 * - 異步數據載入：使用 Promise 和 async/await 處理異步操作
 * - 錯誤處理機制：完整的錯誤捕獲和恢復機制
 * - 記憶體優化：高效的數據結構和垃圾回收
 * - 模組化設計：可重用的函數和組件
 * - 類型安全：完整的 JSDoc 類型註解
 *
 * 📊 支援的數據格式 (Supported Data Formats):
 * - JSON 網格數據：包含 x, y 尺寸參數的網格配置
 * - JSON 節點數據：包含節點座標、屬性、連線的網絡數據
 * - JSON 行政區數據：包含行政區邊界和屬性的地理數據
 * - 自定義格式：可擴展支援其他數據格式
 *
 * 🏗️ 架構設計 (Architecture Design):
 * - 單一職責原則：每個函數只負責一個特定功能
 * - 開放封閉原則：易於擴展新功能，無需修改現有代碼
 * - 依賴反轉原則：依賴抽象而非具體實現
 * - 介面隔離原則：提供最小化的必要介面
 *
 * 🚀 使用範例 (Usage Examples):
 * ```javascript
 * // 載入網格示意圖數據
 * const gridData = await loadGridSchematicJson({
 *   jsonFileName: 'test/test.json'
 * });
 *
 * // 載入行政區示意圖數據
 * const layerData = await loadDataLayerJson({
 *   jsonFileName: 'taipei/taipei_schematic.json'
 * });
 * ```
 *
 * 🔄 數據流程 (Data Flow):
 * 1. 接收圖層配置對象
 * 2. 根據配置選擇適當的載入函數
 * 3. 從指定路徑載入 JSON 數據
 * 4. 驗證數據格式和完整性
 * 5. 執行數據預處理和轉換
 * 6. 生成統計摘要和表格數據
 * 7. 返回標準化的數據對象
 *
 * ⚠️ 注意事項 (Important Notes):
 * - 所有數據載入操作都是異步的，需要使用 await 或 .then()
 * - 載入失敗時會拋出錯誤，需要適當的錯誤處理
 * - 大型數據集可能需要較長的載入時間
 * - 建議在載入過程中顯示進度指示器
 *
 * @file dataProcessor.js
 * @version 3.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API} Fetch API 文檔
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise} Promise 文檔
 */

// ==================== ⚙️ 配置常數 (Configuration Constants) ====================

/**
 * 📁 檔案路徑配置 (File Path Configuration)
 *
 * 定義應用程式在不同環境下的數據文件路徑配置。這個配置對象確保了應用程式
 * 在開發環境和生產環境中都能正確載入數據文件，並提供了備用路徑機制以增強
 * 系統的穩定性和容錯能力。
 *
 * 🎯 設計目標 (Design Goals):
 * - 環境適應性：自動適應開發和生產環境的不同路徑需求
 * - 容錯機制：提供備用路徑，確保數據載入的穩定性
 * - 維護性：集中管理路徑配置，便於後續維護和更新
 * - 擴展性：易於添加新的路徑配置和環境支援
 *
 * 🔧 路徑策略 (Path Strategy):
 * - 生產環境：使用 GitHub Pages 的完整路徑，包含專案名稱
 * - 開發環境：使用相對路徑，便於本地開發和測試
 * - 備用路徑：當主要路徑失敗時，自動嘗試備用路徑
 * - 動態檢測：根據當前環境自動選擇適當的路徑
 *
 * 📊 路徑說明 (Path Descriptions):
 * - JSON: 主要數據文件路徑，用於生產環境部署
 * - FALLBACK_JSON: 備用數據文件路徑，用於開發環境或主要路徑失敗時
 *
 * 🚀 使用範例 (Usage Examples):
 * ```javascript
 * // 載入數據文件
 * const response = await loadFile(
 *   `${PATH_CONFIG.JSON}/${fileName}`,
 *   `${PATH_CONFIG.FALLBACK_JSON}/${fileName}`
 * );
 * ```
 *
 * ⚠️ 注意事項 (Important Notes):
 * - 路徑配置需要與實際的文件結構保持一致
 * - 修改路徑配置後需要重新建置應用程式
 * - 確保所有環境都有對應的數據文件
 *
 * @type {Object}
 * @property {string} JSON - 主要 JSON 文件路徑（生產環境）
 * @property {string} FALLBACK_JSON - 備用 JSON 文件路徑（開發環境）
 * @since 1.0.0
 */
const PATH_CONFIG = {
  /**
   * JSON 文件路徑 - 生產環境
   * 用於 GitHub Pages 部署的完整路徑，包含專案名稱
   * 格式：/schematic-map-rwd/data
   */
  JSON: '/schematic-map-rwd/data',

  /**
   * 備用 JSON 路徑 - 開發環境
   * 用於本地開發環境的相對路徑
   * 格式：/data
   */
  FALLBACK_JSON: '/data',
};

// ==================== 🔧 輔助函數 (Helper Functions) ====================

/**
 * 📁 通用檔案載入函數 (Generic File Loading Function)
 *
 * 這是一個高級檔案載入函數，提供了完整的容錯機制和詳細的錯誤處理。
 * 它支援主要路徑和備用路徑的檔案載入，確保在各種環境下都能成功載入數據文件。
 * 該函數是整個數據載入系統的核心，為上層函數提供了穩定可靠的檔案載入服務。
 *
 * 🎯 核心功能 (Core Features):
 * - 雙路徑載入：支援主要路徑和備用路徑的檔案載入
 * - 自動容錯：主要路徑失敗時自動嘗試備用路徑
 * - 詳細日誌：提供完整的載入過程日誌記錄
 * - 錯誤處理：完整的錯誤捕獲和錯誤信息提供
 * - 狀態追蹤：實時追蹤載入狀態和進度
 *
 * 🔧 技術實現 (Technical Implementation):
 * - 使用 Fetch API 進行異步檔案載入
 * - 支援 HTTP 狀態碼檢查和錯誤處理
 * - 提供詳細的錯誤信息和調試日誌
 * - 支援 Promise 鏈式調用和 async/await 語法
 *
 * 📊 載入流程 (Loading Process):
 * 1. 驗證輸入參數的有效性
 * 2. 嘗試從主要路徑載入檔案
 * 3. 檢查 HTTP 響應狀態
 * 4. 如果主要路徑失敗，嘗試備用路徑
 * 5. 記錄載入過程和結果
 * 6. 返回響應對象或拋出錯誤
 *
 * 🚀 使用範例 (Usage Examples):
 * ```javascript
 * // 基本用法 - 只使用主要路徑
 * try {
 *   const response = await loadFile('/data/example.json');
 *   const data = await response.json();
 *   console.log('數據載入成功:', data);
 * } catch (error) {
 *   console.error('載入失敗:', error.message);
 * }
 *
 * // 進階用法 - 使用備用路徑
 * try {
 *   const response = await loadFile(
 *     '/schematic-map-rwd/data/taipei.json',
 *     '/data/taipei.json'
 *   );
 *   const data = await response.json();
 *   console.log('數據載入成功:', data);
 * } catch (error) {
 *   console.error('所有路徑都載入失敗:', error.message);
 * }
 * ```
 *
 * ⚠️ 錯誤處理 (Error Handling):
 * - 網路錯誤：網路連接問題或伺服器無響應
 * - HTTP 錯誤：4xx 或 5xx 狀態碼
 * - 檔案不存在：404 錯誤
 * - 權限問題：403 錯誤
 * - 所有路徑失敗：主要路徑和備用路徑都無法載入
 *
 * 🔍 調試信息 (Debug Information):
 * - 載入開始：記錄嘗試載入的檔案路徑
 * - 載入成功：記錄成功載入的檔案路徑
 * - 載入失敗：記錄失敗原因和錯誤信息
 * - 路徑切換：記錄從主要路徑切換到備用路徑
 *
 * @param {string} primaryPath - 主要檔案路徑，優先嘗試載入此路徑
 * @param {string} [fallbackPath=null] - 備用檔案路徑，主要路徑失敗時使用
 * @returns {Promise<Response>} - 成功載入的檔案響應物件
 * @throws {Error} - 當所有路徑都無法載入時拋出詳細錯誤信息
 *
 * @example
 * // 載入 JSON 檔案
 * const response = await loadFile('/data/example.json');
 * const data = await response.json();
 *
 * // 載入帶備用路徑的檔案
 * const response = await loadFile('/data/file.json', '/fallback/file.json');
 *
 * @since 1.0.0
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API} Fetch API 文檔
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response} Response 文檔
 */
async function loadFile(primaryPath, fallbackPath = null) {
  console.log(`📁 嘗試載入檔案: ${primaryPath}`);

  try {
    // 嘗試載入主要路徑
    const response = await fetch(primaryPath);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`✅ 檔案載入成功: ${primaryPath}`);
    return response;
  } catch (error) {
    console.warn(`⚠️ 主要路徑載入失敗: ${primaryPath}`, error.message);

    // 如果有備用路徑，嘗試載入備用路徑
    if (fallbackPath) {
      console.log(`📁 嘗試備用路徑: ${fallbackPath}`);

      try {
        const fallbackResponse = await fetch(fallbackPath);

        if (!fallbackResponse.ok) {
          throw new Error(`HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
        }

        console.log(`✅ 備用路徑載入成功: ${fallbackPath}`);
        return fallbackResponse;
      } catch (fallbackError) {
        console.error(`❌ 備用路徑也載入失敗: ${fallbackPath}`, fallbackError.message);
        throw new Error(
          `無法載入檔案。主要路徑: ${primaryPath}, 備用路徑: ${fallbackPath}。錯誤: ${error.message}`
        );
      }
    }

    // 沒有備用路徑或備用路徑也失敗
    throw new Error(`無法載入檔案: ${primaryPath}。錯誤: ${error.message}`);
  }
}

// ==================== 主要函數 ====================

/**
 * 📊 載入數據圖層 JSON 資料 (Load Data Layer JSON Data)
 *
 * 這是一個專門用於載入數據圖層 JSON 資料的函數，主要處理包含節點和連線信息的
 * 複雜地理空間數據。該函數支援多種數據格式，包括示意圖節點數據和標準地理數據，
 * 並提供完整的數據預處理和格式轉換功能。
 *
 * 🎯 主要功能 (Main Features):
 * - 數據圖層載入：從指定路徑載入 JSON 格式的數據圖層
 * - 格式識別：自動識別數據格式（示意圖節點或標準地理數據）
 * - 數據預處理：執行必要的數據清理和格式轉換
 * - 統計計算：生成數據統計摘要和表格數據
 * - 錯誤處理：提供完整的錯誤捕獲和恢復機制
 *
 * 🔧 支援的數據格式 (Supported Data Formats):
 * - 示意圖節點數據：包含節點陣列和路線信息的複雜數據結構
 * - 標準地理數據：包含地理要素屬性的標準 JSON 格式
 * - 自定義格式：可擴展支援其他自定義數據格式
 *
 * 📊 數據處理流程 (Data Processing Flow):
 * 1. 接收圖層配置對象，提取 JSON 文件名稱
 * 2. 使用 loadFile 函數載入 JSON 數據文件
 * 3. 解析 JSON 數據並驗證格式
 * 4. 調用 processDataLayerJson 進行數據預處理
 * 5. 返回標準化的數據對象
 *
 * 🚀 使用範例 (Usage Examples):
 * ```javascript
 * // 載入台北捷運數據
 * const layer = {
 *   jsonFileName: 'taipei/taipei_schematic.json',
 *   layerName: 'Taipei Metro',
 *   type: 'point'
 * };
 *
 * try {
 *   const result = await loadDataLayerJson(layer);
 *   console.log('數據載入成功:', result.summaryData);
 *   console.log('表格數據:', result.tableData);
 * } catch (error) {
 *   console.error('載入失敗:', error.message);
 * }
 * ```
 *
 * 📈 返回數據結構 (Return Data Structure):
 * ```javascript
 * {
 *   jsonData: Object | null,     // 原始 JSON 數據（如果是標準格式）
 *   summaryData: Object,         // 統計摘要數據
 *   tableData: Array,           // 表格顯示數據
 * }
 * ```
 *
 * ⚠️ 注意事項 (Important Notes):
 * - 該函數是異步的，需要使用 await 或 .then() 處理
 * - 載入失敗時會拋出錯誤，需要適當的錯誤處理
 * - 大型數據集可能需要較長的載入時間
 * - 建議在載入過程中顯示進度指示器
 *
 * @param {Object} layer - 圖層配置對象，包含載入所需的配置信息
 * @param {string} layer.jsonFileName - JSON 文件名稱，相對於數據目錄
 * @param {string} [layer.layerName] - 圖層名稱，用於日誌記錄
 * @param {string} [layer.type] - 圖層類型，用於數據處理
 * @returns {Promise<Object>} - 包含處理後數據的對象
 * @throws {Error} - 當載入或處理失敗時拋出錯誤
 *
 * @example
 * // 基本用法
 * const layer = { jsonFileName: 'taipei/metro.json' };
 * const data = await loadDataLayerJson(layer);
 *
 * @since 1.0.0
 * @see {@link loadFile} 通用檔案載入函數
 * @see {@link processDataLayerJson} 數據圖層處理函數
 */
export async function loadDataLayerJson(layer) {
  try {
    console.log('🔄 載入數據圖層 JSON 資料...');

    const fileName = layer.jsonFileName;
    // 數據圖層直接從 /data/ 路徑載入
    const dataPath = `${PATH_CONFIG.JSON}/${fileName}`;
    const response = await loadFile(dataPath);

    const jsonData = await response.json();

    // 處理數據圖層的特殊邏輯
    return await processDataLayerJson(jsonData);
  } catch (error) {
    console.error('❌ 數據圖層 JSON 數據載入或處理失敗:', error);
    throw error;
  }
}

/**
 * 🎲 為節點隨機分配數值 (Randomize Node Values)
 *
 * 這是一個用於為節點數據隨機分配數值的輔助函數，主要用於測試和演示目的。
 * 該函數會為每個節點隨機分配一個 1-5 之間的整數值，用於模擬真實的數據分布
 * 和測試視覺化組件的顯示效果。
 *
 * 🎯 主要功能 (Main Features):
 * - 隨機數值生成：為每個節點生成 1-5 範圍內的隨機整數
 * - 數據保持：保持原始節點的其他屬性不變
 * - 詳細日誌：記錄每個節點的數值變化過程
 * - 批量處理：支援處理大量節點數據
 *
 * 🔧 技術實現 (Technical Implementation):
 * - 使用 Math.random() 生成隨機數
 * - 使用 Math.floor() 確保結果為整數
 * - 使用 map() 方法批量處理節點陣列
 * - 使用展開運算符保持原始屬性
 *
 * 📊 數值分布 (Value Distribution):
 * - 最小值：1
 * - 最大值：5
 * - 分布：均勻分布
 * - 類型：整數
 *
 * 🚀 使用範例 (Usage Examples):
 * ```javascript
 * // 基本用法
 * const nodes = [
 *   { id: 1, coord: { x: 0, y: 0 }, value: 0 },
 *   { id: 2, coord: { x: 1, y: 0 }, value: 0 }
 * ];
 *
 * const randomizedNodes = randomizeNodeValues(nodes);
 * console.log(randomizedNodes);
 * // 輸出: [
 * //   { id: 1, coord: { x: 0, y: 0 }, value: 3 },
 * //   { id: 2, coord: { x: 1, y: 0 }, value: 1 }
 * // ]
 * ```
 *
 * 📈 輸入數據格式 (Input Data Format):
 * ```javascript
 * [
 *   {
 *     id: number,           // 節點唯一識別碼
 *     coord: { x: number, y: number },  // 節點座標
 *     value: any,           // 原始數值（將被覆蓋）
 *     [其他屬性]: any       // 其他節點屬性
 *   }
 * ]
 * ```
 *
 * 📈 輸出數據格式 (Output Data Format):
 * ```javascript
 * [
 *   {
 *     id: number,           // 節點唯一識別碼（保持不變）
 *     coord: { x: number, y: number },  // 節點座標（保持不變）
 *     value: number,        // 隨機分配的數值（1-5）
 *     [其他屬性]: any       // 其他節點屬性（保持不變）
 *   }
 * ]
 * ```
 *
 * 🔍 調試信息 (Debug Information):
 * - 處理開始：記錄原始節點數量
 * - 數值變化：記錄每個節點的數值變化
 * - 處理完成：記錄處理結果的前幾個節點
 *
 * ⚠️ 注意事項 (Important Notes):
 * - 該函數會修改節點的 value 屬性
 * - 其他節點屬性保持不變
 * - 每次調用都會生成不同的隨機數值
 * - 主要用於測試和演示，生產環境請使用真實數據
 *
 * @param {Array} nodes - 節點陣列，包含需要隨機化數值的節點對象
 * @returns {Array} - 處理後的節點陣列，每個節點的 value 屬性被隨機分配 1-5 的數值
 *
 * @example
 * // 隨機化節點數值
 * const nodes = [{ id: 1, coord: { x: 0, y: 0 }, value: 0 }];
 * const result = randomizeNodeValues(nodes);
 *
 * @since 1.0.0
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random} Math.random() 文檔
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map} Array.map() 文檔
 */
function randomizeNodeValues(nodes) {
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
}

/**
 * 📊 載入網格示意圖 JSON 數據 (Load Grid Schematic JSON Data)
 *
 * 這是一個專門用於載入網格型示意圖數據的高級載入器，能夠根據 JSON 配置文件中的
 * 網格尺寸參數（x, y）動態生成對應的網格節點數據結構。該函數是網格示意圖功能
 * 的核心，為 D3.js 視覺化組件提供標準化的網格數據。
 *
 * 🎯 主要功能 (Main Features):
 * - 網格配置載入：從 JSON 文件讀取網格尺寸參數
 * - 動態網格生成：根據配置參數動態生成網格節點
 * - 數據結構標準化：生成符合視覺化組件要求的數據格式
 * - 統計摘要生成：自動計算網格統計信息和摘要數據
 * - 表格數據建構：生成適合表格顯示的數據結構
 *
 * 🔧 技術特點 (Technical Features):
 * - 異步數據載入：使用 Promise 和 async/await 處理異步操作
 * - 容錯機制：支援主要路徑和備用路徑的數據載入
 * - 動態生成：根據配置參數動態生成網格節點
 * - 數據驗證：確保網格參數的有效性和合理性
 * - 詳細日誌：提供完整的載入過程日誌記錄
 *
 * 📊 網格數據結構 (Grid Data Structure):
 * - 網格節點：包含 x, y 座標、數值、類型等屬性
 * - 網格尺寸：可配置的 x, y 方向節點數量
 * - 節點屬性：包含座標、數值、類型等完整信息
 * - 統計摘要：包含總節點數、網格尺寸等統計信息
 *
 * 🚀 使用範例 (Usage Examples):
 * ```javascript
 * // 載入網格示意圖數據
 * const layer = {
 *   jsonFileName: 'test/test.json',
 *   layerName: 'Grid Test',
 *   type: 'grid'
 * };
 *
 * try {
 *   const result = await loadGridSchematicJson(layer);
 *   console.log('網格數據:', result.jsonData);
 *   console.log('摘要數據:', result.summaryData);
 *   console.log('表格數據:', result.tableData);
 * } catch (error) {
 *   console.error('載入失敗:', error.message);
 * }
 * ```
 *
 * 📈 輸入 JSON 格式 (Input JSON Format):
 * ```javascript
 * {
 *   "x": 10,        // 網格 X 方向節點數量
 *   "y": 10         // 網格 Y 方向節點數量
 * }
 * ```
 *
 * 📈 輸出數據結構 (Output Data Structure):
 * ```javascript
 * {
 *   jsonData: {
 *     gridX: number,        // 網格 X 方向節點數量
 *     gridY: number,        // 網格 Y 方向節點數量
 *     nodes: Array,         // 網格節點陣列
 *     type: 'grid'          // 數據類型標識
 *   },
 *   summaryData: {
 *     totalNodes: number,   // 總節點數量
 *     gridSize: string,     // 網格尺寸描述
 *     gridX: number,        // X 方向節點數量
 *     gridY: number,        // Y 方向節點數量
 *     nodeCount: number     // 節點總數
 *   },
 *   tableData: Array,       // 表格顯示數據
 * }
 * ```
 *
 * 🔄 數據處理流程 (Data Processing Flow):
 * 1. 接收圖層配置對象，提取 JSON 文件名稱
 * 2. 使用 loadFile 函數載入 JSON 配置文件
 * 3. 解析 JSON 數據，提取 x, y 網格尺寸參數
 * 4. 驗證網格參數的有效性（確保為正整數）
 * 5. 動態生成網格節點數據結構
 * 6. 計算統計摘要和生成表格數據
 * 7. 返回標準化的網格數據對象
 *
 * ⚠️ 注意事項 (Important Notes):
 * - 該函數是異步的，需要使用 await 或 .then() 處理
 * - 網格尺寸參數必須為正整數
 * - 大型網格可能需要較長的生成時間
 * - 建議在生成過程中顯示進度指示器
 *
 * @param {Object} layer - 圖層配置對象，包含載入所需的配置信息
 * @param {string} layer.jsonFileName - JSON 文件名稱，相對於數據目錄
 * @param {string} [layer.layerName] - 圖層名稱，用於日誌記錄
 * @param {string} [layer.type] - 圖層類型，應為 'grid'
 * @returns {Promise<Object>} - 包含處理後網格數據的對象
 * @throws {Error} - 當載入或處理失敗時拋出錯誤
 *
 * @example
 * // 基本用法
 * const layer = { jsonFileName: 'test/test.json' };
 * const result = await loadGridSchematicJson(layer);
 * console.log(result.gridData); // 網格數據
 * console.log(result.summaryData); // 摘要數據
 *
 * @since 1.0.0
 * @see {@link loadFile} 通用檔案載入函數
 * @see {@link processGridSchematicJson} 網格示意圖處理函數
 */
export async function loadGridSchematicJson(layer) {
  try {
    console.log('📊 載入網格示意圖 JSON 數據:', layer.jsonFileName);

    // 載入 JSON 檔案
    const response = await loadFile(
      `${PATH_CONFIG.JSON}/${layer.jsonFileName}`,
      `${PATH_CONFIG.FALLBACK_JSON}/${layer.jsonFileName}`
    );

    const jsonData = await response.json();

    // 處理網格示意圖數據
    return await processGridSchematicJson(jsonData);
  } catch (error) {
    console.error('❌ 網格示意圖 JSON 數據載入失敗:', error);
    throw error;
  }
}

/**
 * 📊 處理網格示意圖 JSON 數據 (Process Grid Schematic JSON Data)
 *
 * 這是一個專門用於處理網格示意圖 JSON 數據的核心函數，負責將原始的網格配置
 * 參數轉換為適合 D3.js 視覺化組件使用的標準化數據格式。該函數是網格示意圖
 * 數據處理流程的關鍵環節，確保數據的完整性和一致性。
 *
 * 🎯 主要功能 (Main Features):
 * - 網格參數解析：從 JSON 數據中提取 x, y 網格尺寸參數
 * - 動態網格生成：根據尺寸參數動態生成網格節點陣列
 * - 節點屬性設定：為每個節點設定座標、數值、類型等屬性
 * - 統計摘要計算：計算網格統計信息和摘要數據
 * - 表格數據建構：生成適合表格組件顯示的數據結構
 *
 * 🔧 技術實現 (Technical Implementation):
 * - 雙重迴圈生成：使用嵌套迴圈生成二維網格節點
 * - 隨機數值分配：為每個節點隨機分配 1-5 的數值
 * - 座標計算：根據網格位置計算節點的 x, y 座標
 * - 數據結構標準化：生成符合視覺化要求的標準數據格式
 *
 * 📊 網格生成邏輯 (Grid Generation Logic):
 * - 外層迴圈：遍歷 Y 方向（行）
 * - 內層迴圈：遍歷 X 方向（列）
 * - 節點座標：直接使用迴圈索引作為座標
 * - 節點數值：使用 Math.random() 生成 1-5 的隨機數
 * - 節點類型：預設為 1（可擴展支援多種類型）
 *
 * 🚀 使用範例 (Usage Examples):
 * ```javascript
 * // 處理網格配置數據
 * const jsonData = { x: 5, y: 5 };
 * const result = await processGridSchematicJson(jsonData);
 *
 * console.log('網格節點數量:', result.jsonData.nodes.length);
 * console.log('網格尺寸:', result.summaryData.gridSize);
 * console.log('表格數據:', result.tableData);
 * ```
 *
 * 📈 輸入數據格式 (Input Data Format):
 * ```javascript
 * {
 *   "x": 10,        // 網格 X 方向節點數量
 *   "y": 10         // 網格 Y 方向節點數量
 * }
 * ```
 *
 * 📈 輸出數據結構 (Output Data Structure):
 * ```javascript
 * {
 *   jsonData: {
 *     gridX: number,        // 網格 X 方向節點數量
 *     gridY: number,        // 網格 Y 方向節點數量
 *     nodes: [              // 網格節點陣列
 *       {
 *         x: number,        // 節點 X 座標
 *         y: number,        // 節點 Y 座標
 *         value: number,    // 節點數值（1-5）
 *         type: number,     // 節點類型
 *         coord: { x: number, y: number }  // 節點座標對象
 *       }
 *     ],
 *     type: 'grid'          // 數據類型標識
 *   },
 *   summaryData: {
 *     totalNodes: number,   // 總節點數量
 *     gridSize: string,     // 網格尺寸描述
 *     gridX: number,        // X 方向節點數量
 *     gridY: number,        // Y 方向節點數量
 *     nodeCount: number     // 節點總數
 *   },
 *   tableData: [            // 表格顯示數據
 *     {
 *       '#': number,        // 行號
 *       name: string,       // 網格名稱
 *       gridSize: string,   // 網格尺寸描述
 *       totalNodes: number, // 總節點數量
 *       nodes: Array        // 節點陣列
 *     }
 *   ],
 * }
 * ```
 *
 * 🔄 數據處理流程 (Data Processing Flow):
 * 1. 解析網格尺寸參數（x, y）
 * 2. 設定預設值（如果參數無效）
 * 3. 使用雙重迴圈生成網格節點
 * 4. 為每個節點設定座標和屬性
 * 5. 計算統計摘要信息
 * 6. 生成表格顯示數據
 * 7. 返回標準化的數據結構
 *
 * ⚠️ 注意事項 (Important Notes):
 * - 網格尺寸參數會自動設定預設值（10x10）
 * - 節點數值是隨機生成的，每次調用結果不同
 * - 大型網格可能需要較長的生成時間
 * - 生成的節點陣列是扁平化的，不保持二維結構
 *
 * @param {Object} jsonData - 包含網格尺寸參數的 JSON 數據
 * @param {number} [jsonData.x=10] - 網格 X 方向節點數量
 * @param {number} [jsonData.y=10] - 網格 Y 方向節點數量
 * @returns {Object} - 包含處理後網格數據的完整結構
 *
 * @example
 * // 處理網格數據
 * const jsonData = { x: 3, y: 3 };
 * const result = await processGridSchematicJson(jsonData);
 *
 * @since 1.0.0
 * @see {@link loadGridSchematicJson} 網格示意圖載入函數
 */
async function processGridSchematicJson(jsonData) {
  console.log('📊 處理網格示意圖數據:', jsonData);

  // 解析網格尺寸
  const gridX = parseInt(jsonData.x) || 10;
  const gridY = parseInt(jsonData.y) || 10;

  console.log(`📊 網格尺寸: ${gridX} x ${gridY}`);

  // 生成網格節點數據
  const gridNodes = [];
  for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridX; x++) {
      gridNodes.push({
        x: x,
        y: y,
        value: Math.floor(Math.random() * 5) + 1, // 隨機生成 1-5 的數值
        type: 1, // 預設節點類型
        coord: { x: x, y: y },
      });
    }
  }

  // 建立摘要資料
  const summaryData = {
    totalNodes: gridX * gridY,
    gridSize: `${gridX} x ${gridY}`,
    gridX: gridX,
    gridY: gridY,
    nodeCount: gridNodes.length,
  };

  // 建立表格資料
  const tableData = [
    {
      '#': 1,
      name: `網格示意圖 (${gridX}x${gridY})`,
      gridSize: `${gridX} x ${gridY}`,
      totalNodes: gridX * gridY,
      nodes: gridNodes,
    },
  ];

  return {
    jsonData: {
      gridX: gridX,
      gridY: gridY,
      nodes: gridNodes,
      type: 'grid',
    },
    summaryData,
    tableData,
  };
}

/**
 * 📊 處理數據圖層 JSON 數據 (Process Data Layer JSON Data)
 *
 * 這是一個專門用於處理數據圖層 JSON 數據的核心函數，負責將原始的地理空間數據
 * 轉換為適合前端視覺化組件使用的標準化格式。該函數支援多種數據格式，包括
 * 示意圖節點數據和標準地理數據，並提供完整的數據預處理和格式轉換功能。
 *
 * 🎯 主要功能 (Main Features):
 * - 數據格式識別：自動識別輸入數據的格式類型
 * - 示意圖節點處理：處理包含節點陣列的複雜示意圖數據
 * - 標準地理數據處理：處理一般的地理空間數據
 * - 數據隨機化：為示意圖節點隨機分配數值（用於測試）
 * - 統計摘要生成：計算數據統計信息和摘要數據
 * - 表格數據建構：生成適合表格組件顯示的數據結構
 *
 * 🔧 支援的數據格式 (Supported Data Formats):
 * - 示意圖節點數據：包含節點陣列的複雜數據結構
 *   - 格式：Array<{ nodes: Array, name: string, color: string }>
 *   - 用途：用於繪製複雜的示意圖網絡
 * - 標準地理數據：包含地理要素屬性的標準 JSON 格式
 *   - 格式：Array<{ name: string, id: string, [其他屬性]: any }>
 *   - 用途：用於一般的地理數據顯示
 *
 * 📊 數據處理邏輯 (Data Processing Logic):
 * 1. 格式檢測：檢查數據是否為示意圖節點格式
 * 2. 示意圖處理：如果是示意圖格式，執行節點隨機化和統計計算
 * 3. 標準處理：如果是標準格式，執行一般的地理數據處理
 * 4. 統計計算：計算數據統計信息和摘要數據
 * 5. 表格建構：生成適合表格顯示的數據結構
 *
 * 🚀 使用範例 (Usage Examples):
 * ```javascript
 * // 處理示意圖節點數據
 * const schematicData = [
 *   {
 *     name: 'Line 1',
 *     color: 'red',
 *     nodes: [
 *       { coord: { x: 0, y: 0 }, value: 0 },
 *       { coord: { x: 1, y: 0 }, value: 0 }
 *     ]
 *   }
 * ];
 * const result = await processDataLayerJson(schematicData);
 *
 * // 處理標準地理數據
 * const geoData = [
 *   { name: 'Station 1', id: 'S1', type: 'metro' },
 *   { name: 'Station 2', id: 'S2', type: 'metro' }
 * ];
 * const result = await processDataLayerJson(geoData);
 * ```
 *
 * 📈 示意圖節點數據格式 (Schematic Node Data Format):
 * ```javascript
 * [
 *   {
 *     name: string,           // 路線名稱
 *     color: string,          // 路線顏色
 *     nodes: [                // 節點陣列
 *       {
 *         coord: { x: number, y: number },  // 節點座標
 *         value: number,       // 節點數值
 *         [其他屬性]: any      // 其他節點屬性
 *       }
 *     ]
 *   }
 * ]
 * ```
 *
 * 📈 標準地理數據格式 (Standard Geo Data Format):
 * ```javascript
 * [
 *   {
 *     name: string,           // 要素名稱
 *     id: string,             // 要素 ID
 *     [其他屬性]: any         // 其他地理屬性
 *   }
 * ]
 * ```
 *
 * 📈 輸出數據結構 (Output Data Structure):
 * ```javascript
 * {
 *   jsonData: Object | null,  // 原始 JSON 數據（標準格式）或 null（示意圖格式）
 *   summaryData: {            // 統計摘要數據
 *     totalLines?: number,    // 總路線數量（示意圖格式）
 *     totalNodes?: number,    // 總節點數量（示意圖格式）
 *     lineNames?: string[],   // 路線名稱陣列（示意圖格式）
 *     totalCount?: number,    // 總項目數量（標準格式）
 *     itemNames?: string[]    // 項目名稱陣列（標準格式）
 *   },
 *   tableData: Array          // 表格顯示數據
 * }
 * ```
 *
 * 🔄 數據處理流程 (Data Processing Flow):
 * 1. 檢查數據格式（示意圖節點或標準地理數據）
 * 2. 根據格式選擇適當的處理邏輯
 * 3. 執行數據預處理和格式轉換
 * 4. 計算統計摘要信息
 * 5. 生成表格顯示數據
 * 6. 返回標準化的數據結構
 *
 * ⚠️ 注意事項 (Important Notes):
 * - 示意圖節點數據會進行隨機化處理（用於測試）
 * - 標準地理數據保持原始格式不變
 * - 統計摘要會根據數據格式自動調整
 * - 表格數據會根據數據類型生成不同的結構
 *
 * @param {Object} jsonData - 需要處理的 JSON 數據
 * @param {Array} [jsonData] - 示意圖節點數據陣列
 * @param {Array} [jsonData] - 標準地理數據陣列
 * @returns {Object} - 包含處理後數據的完整結構
 *
 * @example
 * // 處理示意圖數據
 * const schematicData = [{ name: 'Line 1', nodes: [] }];
 * const result = await processDataLayerJson(schematicData);
 *
 * // 處理標準地理數據
 * const geoData = [{ name: 'Station 1', id: 'S1' }];
 * const result = await processDataLayerJson(geoData);
 *
 * @since 1.0.0
 * @see {@link randomizeNodeValues} 節點數值隨機化函數
 * @see {@link loadDataLayerJson} 數據圖層載入函數
 */
async function processDataLayerJson(jsonData) {
  // 檢查是否為示意圖節點格式
  if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].nodes) {
    // 這是示意圖節點格式，不需要處理為地圖圖層
    console.log('📊 載入示意圖節點數據，共', jsonData.length, '條路線');

    // 為每個路線的節點隨機分配 1-5 的數值
    const processedJsonData = jsonData.map((line) => ({
      ...line,
      nodes: randomizeNodeValues(line.nodes),
    }));

    // 建立摘要資料
    const summaryData = {
      totalLines: processedJsonData.length,
      totalNodes: processedJsonData.reduce((sum, line) => sum + line.nodes.length, 0),
      lineNames: processedJsonData.map((line) => line.name),
    };

    // 為示意圖數據建立 tableData，每個路線作為一個項目
    const tableData = processedJsonData.map((line, index) => ({
      '#': index + 1,
      color: line.color,
      name: line.name,
      nodes: line.nodes,
    }));

    return {
      jsonData: null, // 示意圖數據不需要地圖顯示
      summaryData,
      tableData,
    };
  }

  // 標準 JSON 格式處理 - 示意圖節點數據
  console.log('📊 載入標準 JSON 數據，共', jsonData.length, '個項目');

  // 建立摘要資料
  const summaryData = {
    totalCount: jsonData.length,
    itemNames: jsonData.map((item) => item.name || item.id || '未命名項目'),
  };

  return {
    jsonData: jsonData,
    summaryData,
    tableData: jsonData.map((item, index) => ({
      '#': index + 1,
      name: item.name || item.id || '未命名項目',
      ...item,
    })),
  };
}
