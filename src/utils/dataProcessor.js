/**
 * 📊 數據處理核心模組 (Data Processing Core Module)
 *
 * 功能說明 (Features):
 * 1. 📁 JSON 檔案載入：支援 JSON 格式數據載入
 * 2. 📋 數據預處理：JSON 數據的標準化處理
 * 3. 📊 表格/摘要資料建構：生成統計摘要和數據表格
 *
 * 支援的數據格式 (Supported Data Formats):
 * - JSON：示意圖數據格式
 *
 * 技術特點 (Technical Features):
 * - 異步數據載入，支援大型數據集
 * - 完整的錯誤處理和驗證機制
 * - 記憶體優化的數據處理流程
 *
 * @file dataProcessor.js
 * @version 3.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 */

// ==================== ⚙️ 配置常數 (Configuration Constants) ====================

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
  /** JSON 文件路徑 - 生產環境 */
  JSON: '/schematic-map-rwd/data',
  /** 備用 JSON 路徑 - 開發環境 */
  FALLBACK_JSON: '/data',
};

// ==================== 🔧 輔助函數 (Helper Functions) ====================

/**
 * 📁 通用檔案載入函數 (Generic File Loading Function)
 * 支援主要路徑和備用路徑的檔案載入
 *
 * 功能說明：
 * - 嘗試從主要路徑載入檔案
 * - 失敗時自動切換到備用路徑
 * - 提供詳細的錯誤資訊和載入狀態
 * - 支援 JSON 檔案格式
 *
 * @param {string} primaryPath - 主要檔案路徑
 * @param {string} [fallbackPath] - 備用檔案路徑（可選）
 * @returns {Promise<Response>} - 檔案響應物件
 * @throws {Error} - 當所有路徑都無法載入時拋出錯誤
 *
 * @example
 * // 載入 JSON 檔案
 * const response = await loadFile('/data/example.json');
 * const data = await response.json();
 *
 * // 載入帶備用路徑的檔案
 * const response = await loadFile('/data/file.json', '/fallback/file.json');
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
 * 載入數據圖層 JSON 資料
 *
 * @param {Object} layer - 圖層配置對象
 * @returns {Promise<Object>} - 處理後的數據
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
 * 為節點隨機分配 1-5 的數值
 *
 * @param {Array} nodes - 節點陣列
 * @returns {Array} - 處理後的節點陣列
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
 * 專門用於載入網格型示意圖數據的載入器
 * 根據 JSON 中的 x 和 y 值生成對應的網格示意圖
 *
 * 功能說明：
 * - 讀取網格尺寸參數 (x, y)
 * - 生成網格節點數據結構
 * - 提供網格示意圖專用的數據格式
 *
 * @param {Object} layer - 圖層配置對象
 * @param {string} layer.jsonFileName - JSON 文件名稱
 * @returns {Promise<Object>} - 處理後的網格數據對象
 * @throws {Error} - 當載入失敗時拋出錯誤
 *
 * @example
 * const layer = { jsonFileName: 'test/test.json' };
 * const result = await loadGridSchematicJson(layer);
 * console.log(result.gridData); // 網格數據
 * console.log(result.summaryData); // 摘要數據
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
 * 將網格尺寸參數轉換為示意圖組件所需的數據格式
 *
 * @param {Object} jsonData - 包含 x, y 尺寸的 JSON 數據
 * @returns {Object} - 處理後的網格數據結構
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
    legendData: null,
  };
}

/**
 * 處理數據圖層 JSON 數據
 *
 * @param {Object} jsonData - JSON 數據
 * @returns {Object} - 處理後的數據
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
