/**
 * 通用工具函數模組 (Common Utility Module)
 *
 * 提供整個應用程式共用的工具函數，包括：
 * - 圖標管理
 */

// =================================================================================
// 🛠️ 圖標和介面輔助函數 (Icon and UI Helper Functions)
// =================================================================================

/**
 * 圖標映射表 - 支援中文/英文/FontAwesome 類名
 * 用於統一管理系統中使用的所有圖標
 *
 * @type {Object.<string, {zh: string, en: string, icon: string}>}
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
 * 根據鍵名獲取圖標資訊
 *
 * 從全局圖標庫中獲取指定鍵名的圖標信息，包括文字和圖標類名
 *
 * @param {string} iconKey - 圖標鍵名
 * @param {string} lang - 語言 ('zh' | 'en')，默認為中文
 * @returns {object} 包含文字和圖標類名的物件
 * @example
 * // 獲取'chart_line'圖標的中文信息
 * const chartIcon = getIcon('chart_line');
 * // { text: '線圖', icon: 'fas fa-chart-line' }
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
 * 根據鍵名獲取完整的圖標 HTML
 *
 * 從全局圖標庫中獲取指定鍵名的完整圖標 HTML 標籤
 *
 * @param {string} iconKey - 圖標鍵名
 * @param {string} additionalClasses - 額外的 CSS 類名
 * @returns {string} 完整的圖標 HTML 標籤
 * @example
 * // 獲取'chart_line'圖標的完整 HTML
 * const chartIconHtml = getIconHtml('chart_line');
 * // '<i class="fas fa-chart-line"></i>'
 *
 * // 獲取帶有額外類名的圖標 HTML
 * const spinnerHtml = getIconHtml('spinner', 'fa-spin me-2');
 * // '<i class="fas fa-spinner fa-spin me-2"></i>'
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
