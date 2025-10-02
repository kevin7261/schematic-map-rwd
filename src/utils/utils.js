/**
 * 通用工具函數模組 (Common Utility Module)
 *
 * 提供整個應用程式共用的工具函數，包括：
 * - 圖標管理
 * - 日期格式化
 * - 數值處理
 * - 陣列操作
 * - 深度複製/合併
 * - 資料格式轉換
 */
// 通用工具函數庫

/**
 * 圖標映射表 - 支援中文/英文/FontAwesome 類名
 * 用於統一管理系統中使用的所有圖標
 *
 * @type {Object.<string, {zh: string, en: string, icon: string}>}
 */
export const ICONS = {
  // 基本操作圖標
  add: { zh: '新增', en: 'Add', icon: 'fas fa-plus' },
  edit: { zh: '編輯', en: 'Edit', icon: 'fas fa-edit' },
  delete: { zh: '刪除', en: 'Delete', icon: 'fas fa-trash' },
  save: { zh: '儲存', en: 'Save', icon: 'fas fa-save' },
  cancel: { zh: '取消', en: 'Cancel', icon: 'fas fa-times' },
  confirm: { zh: '確認', en: 'Confirm', icon: 'fas fa-check' },
  search: { zh: '搜尋', en: 'Search', icon: 'fas fa-search' },
  filter: { zh: '篩選', en: 'Filter', icon: 'fas fa-filter' },
  sort: { zh: '排序', en: 'Sort', icon: 'fas fa-sort' },
  refresh: { zh: '重新整理', en: 'Refresh', icon: 'fas fa-sync-alt' },

  // 檔案操作圖標
  upload: { zh: '上傳', en: 'Upload', icon: 'fas fa-upload' },
  download: { zh: '下載', en: 'Download', icon: 'fas fa-download' },
  import: { zh: '匯入', en: 'Import', icon: 'fas fa-file-import' },
  export: { zh: '匯出', en: 'Export', icon: 'fas fa-file-export' },

  // 導航圖標
  home: { zh: '首頁', en: 'Home', icon: 'fas fa-home' },
  back: { zh: '返回', en: 'Back', icon: 'fas fa-arrow-left' },
  forward: { zh: '前進', en: 'Forward', icon: 'fas fa-arrow-right' },
  up: { zh: '向上', en: 'Up', icon: 'fas fa-arrow-up' },
  down: { zh: '向下', en: 'Down', icon: 'fas fa-arrow-down' },

  // 狀態圖標
  success: { zh: '成功', en: 'Success', icon: 'fas fa-check-circle' },
  error: { zh: '錯誤', en: 'Error', icon: 'fas fa-exclamation-circle' },
  warning: { zh: '警告', en: 'Warning', icon: 'fas fa-exclamation-triangle' },
  info: { zh: '資訊', en: 'Info', icon: 'fas fa-info-circle' },
  loading: { zh: '載入中', en: 'Loading', icon: 'fas fa-spinner' },

  // 視圖控制圖標
  view: { zh: '檢視', en: 'View', icon: 'fas fa-eye' },
  hide: { zh: '隱藏', en: 'Hide', icon: 'fas fa-eye-slash' },
  expand: { zh: '展開', en: 'Expand', icon: 'fas fa-expand' },
  collapse: { zh: '收縮', en: 'Collapse', icon: 'fas fa-compress' },

  // 📂 圖層和資料相關 (Layer & Data Icons)
  layer: { zh: '圖層', en: 'Layer', icon: 'fas fa-layer-group' },
  visible: { zh: '可見', en: 'Visible', icon: 'fas fa-eye' },
  hidden: { zh: '隱藏', en: 'Hidden', icon: 'fas fa-eye-slash' },
  data: { zh: '資料', en: 'Data', icon: 'fas fa-database' },
  table: { zh: '表格', en: 'Table', icon: 'fas fa-table' },

  // 🗺️ 地圖相關 (Map Icons)
  map: { zh: '地圖', en: 'Map', icon: 'fas fa-map' },
  location: { zh: '位置', en: 'Location', icon: 'fas fa-map-marker-alt' },
  zoom_in: { zh: '放大', en: 'Zoom In', icon: 'fas fa-search-plus' },
  zoom_out: { zh: '縮小', en: 'Zoom Out', icon: 'fas fa-search-minus' },
  center: { zh: '居中', en: 'Center', icon: 'fas fa-crosshairs' },

  // 📊 分析和統計 (Analysis & Statistics Icons)
  chart: { zh: '圖表', en: 'Chart', icon: 'fas fa-chart-bar' },
  statistics: { zh: '統計', en: 'Statistics', icon: 'fas fa-chart-line' },
  dashboard: { zh: '儀表板', en: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  analysis: { zh: '分析', en: 'Analysis', icon: 'fas fa-analytics' },

  // 🏥 醫療相關 (Medical Icons)
  hospital: { zh: '醫院', en: 'Hospital', icon: 'fas fa-hospital' },
  clinic: { zh: '診所', en: 'Clinic', icon: 'fas fa-clinic-medical' },
  pharmacy: { zh: '藥局', en: 'Pharmacy', icon: 'fas fa-pills' },
  elderly_care: { zh: '照護', en: 'Elderly Care', icon: 'fas fa-hands-helping' },
  medical: { zh: '醫療', en: 'Medical', icon: 'fas fa-user-md' },

  // 👥 人口和社會 (Population & Social Icons)
  population: { zh: '人口', en: 'Population', icon: 'fas fa-users' },
  demographics: { zh: '人口統計', en: 'Demographics', icon: 'fas fa-user-friends' },
  community: { zh: '社區', en: 'Community', icon: 'fas fa-home' },

  // 💰 經濟相關 (Economic Icons)
  income: { zh: '收入', en: 'Income', icon: 'fas fa-dollar-sign' },
  tax: { zh: '稅收', en: 'Tax', icon: 'fas fa-file-invoice-dollar' },

  // 🎛️ 操作和控制 (Control & Action Icons)
  drag: { zh: '拖拉', en: 'Drag', icon: 'fa-solid fa-grip-lines-vertical' },
  move_up: { zh: '上移', en: 'Move Up', icon: 'fas fa-arrow-up' },
  move_down: { zh: '下移', en: 'Move Down', icon: 'fas fa-arrow-down' },

  // ⚙️ 設定和配置 (Settings & Configuration Icons)
  settings: { zh: '設定', en: 'Settings', icon: 'fas fa-cog' },
  sort_up: { zh: '升序', en: 'Sort Ascending', icon: 'fas fa-sort-up' },
  sort_down: { zh: '降序', en: 'Sort Descending', icon: 'fas fa-sort-down' },

  // 📁 檔案和資料夾 (File & Folder Icons)
  folder: { zh: '資料夾', en: 'Folder', icon: 'fas fa-folder' },
  folder_open: { zh: '開啟資料夾', en: 'Open Folder', icon: 'fas fa-folder-open' },
  file: { zh: '檔案', en: 'File', icon: 'fas fa-file' },

  // ℹ️ 資訊和狀態 (Information & Status Icons)
  information: { zh: '資訊', en: 'Information', icon: 'fas fa-info-circle' },
  alert: { zh: '警告', en: 'Warning', icon: 'fas fa-exclamation-triangle' },
  failure: { zh: '錯誤', en: 'Error', icon: 'fas fa-times-circle' },
  complete: { zh: '成功', en: 'Success', icon: 'fas fa-check-circle' },

  // 🔄 狀態轉換 (State Transition Icons)
  reset: { zh: '重設', en: 'Reset', icon: 'fas fa-undo' },

  // 📱 介面元素 (UI Element Icons)
  menu: { zh: '選單', en: 'Menu', icon: 'fas fa-bars' },
  close: { zh: '關閉', en: 'Close', icon: 'fas fa-times' },
};

// =================================================================================
// 🛠️ 圖標和介面輔助函數 (Icon and UI Helper Functions)
// =================================================================================

/**
 * 根據鍵名獲取圖標資訊
 *
 * 從全局圖標庫中獲取指定鍵名的圖標信息，包括文字和圖標類
 *
 * @param {string} iconKey - 圖標鍵名
 * @param {string} lang - 語言 ('zh' | 'en')，默認為中文
 * @returns {object} 包含文字和圖標類名的物件
 * @example
 * // 獲取'save'圖標的中文信息
 * const saveIcon = getIcon('save');
 * // { text: '儲存', icon: 'fas fa-save' }
 */
export function getIcon(iconKey, lang = 'zh') {
  const iconInfo = ICONS[iconKey];
  if (!iconInfo) {
    console.warn(`找不到圖標定義: ${iconKey}`);
    return {
      text: iconKey,
      icon: 'fas fa-question-circle',
    };
  }

  return {
    text: iconInfo[lang] || iconInfo.zh,
    icon: iconInfo.icon,
  };
}

// =================================================================================
// 🧮 數值處理函數 (Numeric Helper Functions)
// =================================================================================

/**
 * 格式化數值為指定小數位數的字串
 *
 * @param {number} value - 要格式化的數值
 * @param {number} [decimals=2] - 小數位數
 * @param {boolean} [addCommas=true] - 是否添加千位分隔符
 * @returns {string} 格式化後的數值字串
 * @example
 * // 格式化數值為兩位小數，並加上千位分隔符
 * formatNumber(12345.6789); // "12,345.68"
 *
 * // 格式化數值為一位小數，不加千位分隔符
 * formatNumber(12345.6789, 1, false); // "12345.7"
 */
export function formatNumber(value, decimals = 2, addCommas = true) {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  // 四捨五入到指定小數位數
  const rounded = Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);

  // 轉換為字串並確保包含指定的小數位數
  let result = rounded.toFixed(decimals);

  // 如果需要添加千位分隔符
  if (addCommas) {
    const parts = result.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    result = parts.join('.');
  }

  return result;
}

/**
 * 將數值限制在指定範圍內
 *
 * @param {number} value - 要限制的數值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制後的數值
 * @example
 * // 限制數值在 0 到 100 之間
 * clamp(150, 0, 100); // 100
 * clamp(-10, 0, 100); // 0
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * 計算數組的基本統計信息
 *
 * @param {number[]} values - 數值陣列
 * @returns {object} 包含統計信息的物件
 * @example
 * // 計算一組數據的統計信息
 * const stats = calculateStats([1, 2, 3, 4, 5]);
 * // { count: 5, sum: 15, min: 1, max: 5, mean: 3, ... }
 */
export function calculateStats(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      count: 0,
      sum: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      variance: null,
      stdDev: null,
    };
  }

  // 過濾出有效的數值
  const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v));

  if (validValues.length === 0) {
    return {
      count: 0,
      sum: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      variance: null,
      stdDev: null,
    };
  }

  // 計算基本統計量
  const count = validValues.length;
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const mean = sum / count;

  // 計算中位數
  const sortedValues = [...validValues].sort((a, b) => a - b);
  const median =
    count % 2 === 0
      ? (sortedValues[count / 2 - 1] + sortedValues[count / 2]) / 2
      : sortedValues[Math.floor(count / 2)];

  // 計算方差和標準差
  const sumSquaredDiff = validValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = sumSquaredDiff / count;
  const stdDev = Math.sqrt(variance);

  return {
    count,
    sum,
    min,
    max,
    mean,
    median,
    variance,
    stdDev,
  };
}

// =================================================================================
// 📅 日期和時間處理函數 (Date and Time Helper Functions)
// =================================================================================

/**
 * 格式化日期為指定格式的字串
 *
 * @param {Date|string|number} date - 日期物件、時間戳或日期字串
 * @param {string} [format='YYYY-MM-DD'] - 日期格式
 * @returns {string} 格式化後的日期字串
 * @example
 * // 格式化當前日期為 YYYY-MM-DD
 * formatDate(new Date()); // "2025-09-16"
 *
 * // 使用自定義格式
 * formatDate(new Date(), 'YYYY/MM/DD HH:mm'); // "2025/09/16 15:30"
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  // 確保 date 是 Date 類型
  const d = date instanceof Date ? date : new Date(date);

  // 檢查日期是否有效
  if (isNaN(d.getTime())) {
    console.warn(`無效的日期值: ${date}`);
    return '';
  }

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  // 將單個數字補零
  const pad = (num) => (num < 10 ? '0' + num : num);

  // 替換格式中的占位符
  return format
    .replace('YYYY', year)
    .replace('YY', String(year).slice(-2))
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hours))
    .replace('mm', pad(minutes))
    .replace('ss', pad(seconds));
}

/**
 * 計算兩個日期之間的天數差
 *
 * @param {Date|string|number} dateA - 第一個日期
 * @param {Date|string|number} dateB - 第二個日期
 * @returns {number} 天數差（絕對值）
 * @example
 * // 計算兩個日期之間的天數差
 * const days = daysBetween('2025-01-01', '2025-01-15'); // 14
 */
export function daysBetween(dateA, dateB) {
  // 轉換為 Date 物件並截取日期部分（去除時間）
  const a = new Date(dateA);
  const b = new Date(dateB);

  // 檢查日期是否有效
  if (isNaN(a.getTime()) || isNaN(b.getTime())) {
    console.warn('無效的日期參數', { dateA, dateB });
    return NaN;
  }

  // 設置為當天 00:00:00 以便正確計算天數差
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);

  // 計算差值，轉換為天數
  const diffMs = Math.abs(a - b);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// =================================================================================
// 🧩 深度操作和物件處理函數 (Deep Operations and Object Handling Functions)
// =================================================================================

/**
 * 深度複製物件或陣列
 *
 * @param {*} obj - 要複製的物件或陣列
 * @returns {*} 複製的新物件或陣列
 * @example
 * // 深度複製一個複雜物件
 * const original = { a: 1, b: { c: 2 } };
 * const copy = deepClone(original);
 */
export function deepClone(obj) {
  // 處理 null 或非物件類型
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 處理 Date 物件
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 處理 Array
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  // 處理 Object
  const clone = {};
  Object.keys(obj).forEach((key) => {
    clone[key] = deepClone(obj[key]);
  });

  return clone;
}

/**
 * 安全地取得物件的深層屬性值，避免因中間屬性不存在而出錯
 *
 * @param {object} obj - 目標物件
 * @param {string} path - 屬性路徑（如 'a.b.c'）
 * @param {*} [defaultValue=undefined] - 當屬性不存在時返回的默認值
 * @returns {*} 屬性值或默認值
 * @example
 * // 安全地獲取深層屬性
 * const obj = { a: { b: { c: 42 } } };
 * getNestedValue(obj, 'a.b.c'); // 42
 * getNestedValue(obj, 'a.x.y', 'not found'); // "not found"
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  if (!obj || !path) return defaultValue;

  // 分割路徑為各個部分
  const keys = path.split('.');
  let value = obj;

  // 沿著路徑遍歷物件
  for (const key of keys) {
    // 如果當前層級不存在或不是物件，則返回默認值
    if (value === null || typeof value !== 'object' || !(key in value)) {
      return defaultValue;
    }
    value = value[key];
  }

  return value;
}

/**
 * 深度合併兩個物件，不影響原始物件
 *
 * @param {object} target - 目標物件
 * @param {object} source - 源物件
 * @returns {object} 合併後的新物件
 * @example
 * // 深度合併兩個物件
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 }, e: 4 };
 * const merged = deepMerge(obj1, obj2);
 * // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
export function deepMerge(target, source) {
  // 建立目標物件的副本
  const result = deepClone(target);

  // 如果源物件為空，直接返回目標副本
  if (!source) return result;

  // 遍歷源物件的所有屬性
  Object.keys(source).forEach((key) => {
    const targetValue = result[key];
    const sourceValue = source[key];

    // 如果兩者都是物件且不是陣列，進行深度合併
    if (isObject(targetValue) && isObject(sourceValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    }
    // 如果兩者都是陣列，合併陣列
    else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      result[key] = [...targetValue, ...sourceValue];
    }
    // 否則直接覆蓋
    else {
      result[key] = deepClone(sourceValue);
    }
  });

  return result;
}

/**
 * 判斷參數是否為普通物件（非 null、非數組、非 Date 等）
 *
 * @param {*} value - 要檢查的值
 * @returns {boolean} 是否為普通物件
 * @private
 */
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// =================================================================================
// 🧵 字串處理函數 (String Helper Functions)
// =================================================================================

/**
 * 截斷過長的字串，並添加省略號
 *
 * @param {string} str - 要處理的字串
 * @param {number} maxLength - 最大長度
 * @param {string} [ellipsis='...'] - 省略號字符
 * @returns {string} 處理後的字串
 * @example
 * // 截斷過長的字串
 * truncateString('這是一段很長的文字內容', 5); // "這是一..."
 */
export function truncateString(str, maxLength, ellipsis = '...') {
  if (!str || str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + ellipsis;
}

/**
 * 從一個字串中提取年份
 *
 * @param {string} str - 要搜索的字串
 * @returns {number|null} 提取的年份，如果未找到則返回 null
 * @example
 * // 從字串中提取年份
 * extractYear('2025年台南市資料'); // 2025
 */
export function extractYear(str) {
  const match = String(str).match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1]) : null;
}
