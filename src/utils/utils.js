/**
 * 🛠️ 通用工具函數模組 (Common Utility Module)
 *
 * 功能說明 (Features):
 * 1. 🎨 圖標管理系統：統一管理應用程式中的所有圖標
 * 2. 🌐 多語言支援：提供中文和英文的圖標文字對應
 * 3. 🔧 圖標工具函數：提供便捷的圖標獲取和渲染方法
 * 4. 📱 響應式圖標：支援不同尺寸和樣式的圖標顯示
 * 5. 🎯 類型安全：提供完整的 TypeScript 類型定義
 *
 * 技術特點 (Technical Features):
 * - 集中式圖標管理，便於維護和更新
 * - 支援 Font Awesome 圖標庫
 * - 提供 HTML 和 CSS 類名兩種輸出格式
 * - 支援自定義 CSS 類名擴展
 *
 * 使用場景 (Use Cases):
 * - 表格排序圖標
 * - 載入狀態指示器
 * - 功能按鈕圖標
 * - 狀態指示圖標
 *
 * @file utils.js
 * @version 2.0.0
 * @author Kevin Cheng
 * @since 1.0.0
 */

// ==================== 🛠️ 圖標和介面輔助函數 (Icon and UI Helper Functions) ====================

/**
 * 🎨 圖標映射表 (Icon Mapping Table)
 *
 * 統一管理系統中使用的所有圖標，支援多語言和 FontAwesome 類名
 * 每個圖標包含中文名稱、英文名稱和對應的 FontAwesome 類名
 *
 * 設計原則：
 * - 使用語義化的鍵名，便於理解和維護
 * - 提供完整的中英文對照
 * - 統一使用 FontAwesome 5 圖標庫
 * - 保持圖標風格的一致性
 *
 * @type {Object.<string, {zh: string, en: string, icon: string}>}
 * @description 圖標鍵名對應到包含中英文名稱和 HTML 標籤的物件
 *
 * @example
 * // 圖標結構範例
 * {
 *   chart_line: {
 *     zh: '線圖',
 *     en: 'Line Chart',
 *     icon: '<i class="fas fa-chart-line"></i>'
 *   }
 * }
 */
export const ICONS = {
  // 圖表相關圖標
  chart_line: { zh: '線圖', en: 'Line Chart', icon: '<i class="fas fa-chart-line"></i>' },
  chart_bar: { zh: '長條圖', en: 'Bar Chart', icon: '<i class="fas fa-chart-bar"></i>' },

  // 載入狀態圖標
  spinner: { zh: '載入中', en: 'Loading', icon: '<i class="fas fa-spinner"></i>' },

  // 排序相關圖標
  sort: { zh: '排序', en: 'Sort', icon: '<i class="fas fa-sort"></i>' },
  sort_up: { zh: '升序', en: 'Sort Ascending', icon: '<i class="fas fa-sort-up"></i>' },
  sort_down: { zh: '降序', en: 'Sort Descending', icon: '<i class="fas fa-sort-down"></i>' },

  // 資訊和狀態圖標
  info_circle: { zh: '資訊', en: 'Information', icon: '<i class="fas fa-info-circle"></i>' },
  location_dot: { zh: '位置', en: 'Location', icon: '<i class="fa-solid fa-location-dot"></i>' },

  // 圖層和資料相關圖標
  layer_group: { zh: '圖層', en: 'Layer Group', icon: '<i class="fas fa-layer-group"></i>' },
  table: { zh: '表格', en: 'Table', icon: '<i class="fas fa-table"></i>' },
};

/**
 * 🎯 根據鍵名獲取圖標資訊 (Get Icon Information by Key)
 *
 * 從全域圖標庫中獲取指定鍵名的圖標資訊，包括文字和圖標類名
 * 提供多語言支援和錯誤處理機制
 *
 * 功能說明：
 * - 支援中文和英文兩種語言
 * - 自動提取 FontAwesome 類名
 * - 提供預設的錯誤圖標
 * - 返回標準化的圖標資訊物件
 *
 * @param {string} iconKey - 圖標鍵名，必須在 ICONS 物件中定義
 * @param {string} [lang='zh'] - 語言代碼，支援 'zh'（中文）和 'en'（英文）
 * @returns {Object} 包含文字和圖標類名的物件
 * @returns {string} returns.text - 圖標的文字描述
 * @returns {string} returns.icon - FontAwesome 圖標類名
 *
 * @description 用於在組件中獲取圖標的文字和類名，支援多語言顯示
 *
 * @example
 * // 獲取線圖圖標的中文資訊
 * const chartIcon = getIcon('chart_line');
 * // 返回: { text: '線圖', icon: 'fas fa-chart-line' }
 *
 * // 獲取線圖圖標的英文資訊
 * const chartIconEn = getIcon('chart_line', 'en');
 * // 返回: { text: 'Line Chart', icon: 'fas fa-chart-line' }
 *
 * // 獲取不存在的圖標（會返回預設錯誤圖標）
 * const unknownIcon = getIcon('unknown_icon');
 * // 返回: { text: 'unknown_icon', icon: 'fas fa-question-circle' }
 */
export function getIcon(iconKey, lang = 'zh') {
  const iconInfo = ICONS[iconKey];
  if (!iconInfo) {
    // console.warn(`找不到圖標定義: ${iconKey}`);
    return {
      text: iconKey,
      icon: 'fas fa-question-circle',
    };
  }

  // 從完整的 HTML 標籤中提取 class 名稱
  const classMatch = iconInfo.icon.match(/class="([^"]+)"/);
  const iconClass = classMatch ? classMatch[1] : 'fas fa-question-circle';

  return {
    text: iconInfo[lang] || iconInfo.zh,
    icon: iconClass,
  };
}

/**
 * 🎨 根據鍵名獲取完整的圖標 HTML (Get Complete Icon HTML by Key)
 *
 * 從全域圖標庫中獲取指定鍵名的完整圖標 HTML 標籤
 * 支援自定義 CSS 類名擴展，用於添加動畫效果或樣式修飾
 *
 * 功能說明：
 * - 返回完整的 HTML 標籤，可直接插入 DOM
 * - 支援額外的 CSS 類名添加
 * - 提供錯誤處理和預設圖標
 * - 保持 HTML 標籤的完整性
 *
 * @param {string} iconKey - 圖標鍵名，必須在 ICONS 物件中定義
 * @param {string} [additionalClasses=''] - 額外的 CSS 類名，會添加到現有的 class 屬性中
 * @returns {string} 完整的圖標 HTML 標籤
 *
 * @description 用於在模板中直接渲染圖標 HTML，支援樣式擴展
 *
 * @example
 * // 獲取線圖圖標的完整 HTML
 * const chartIconHtml = getIconHtml('chart_line');
 * // 返回: '<i class="fas fa-chart-line"></i>'
 *
 * // 獲取帶有額外類名的載入圖標 HTML
 * const spinnerHtml = getIconHtml('spinner', 'fa-spin me-2');
 * // 返回: '<i class="fas fa-spinner fa-spin me-2"></i>'
 *
 * // 獲取帶有自定義樣式的圖標 HTML
 * const customIcon = getIconHtml('info_circle', 'text-primary fs-4');
 * // 返回: '<i class="fas fa-info-circle text-primary fs-4"></i>'
 *
 * // 獲取不存在的圖標（會返回預設錯誤圖標）
 * const unknownIcon = getIconHtml('unknown_icon', 'text-danger');
 * // 返回: '<i class="fas fa-question-circle text-danger"></i>'
 */
export function getIconHtml(iconKey, additionalClasses = '') {
  const iconInfo = ICONS[iconKey];
  if (!iconInfo) {
    // console.warn(`找不到圖標定義: ${iconKey}`);
    return `<i class="fas fa-question-circle${additionalClasses ? ' ' + additionalClasses : ''}"></i>`;
  }

  // 如果有額外的類名，則插入到現有的 class 中
  if (additionalClasses) {
    return iconInfo.icon.replace(/class="([^"]+)"/, `class="$1 ${additionalClasses}"`);
  }

  return iconInfo.icon;
}
