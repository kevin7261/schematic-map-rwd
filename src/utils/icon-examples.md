# 圖標使用範例

## 基本使用方式

### 1. 使用 getIcon() 函數（適用於 Vue 組件中的 :class 綁定）

```javascript
import { getIcon } from '../utils/utils.js';

// 在 Vue 組件中使用
<i :class="getIcon('chart_line').icon"></i>
```

### 2. 使用 getIconHtml() 函數（適用於需要完整 HTML 標籤的情況）

```javascript
import { getIconHtml } from '../utils/utils.js';

// 在 Vue 組件中使用
<span v-html="getIconHtml('spinner', 'fa-spin me-2')"></span>;
```

### 3. 直接複製貼上（最簡單的方式）

```html
<!-- 直接從 ICONS 常數複製完整的 HTML -->
<i class="fas fa-chart-line"></i>
<i class="fas fa-chart-bar"></i>
<i class="fas fa-spinner"></i>
<i class="fas fa-sort"></i>
<i class="fas fa-sort-up"></i>
<i class="fas fa-sort-down"></i>
<i class="fas fa-info-circle"></i>
<i class="fa-solid fa-location-dot"></i>
<i class="fas fa-layer-group"></i>
<i class="fas fa-table"></i>
```

## 可用的圖標列表

- `chart_line` - 線圖
- `chart_bar` - 長條圖
- `spinner` - 載入動畫
- `sort` - 排序
- `sort_up` - 升序
- `sort_down` - 降序
- `info_circle` - 資訊
- `location_dot` - 位置
- `layer_group` - 圖層
- `table` - 表格

## 添加新圖標

在 `src/utils/utils.js` 中的 `ICONS` 常數中添加：

```javascript
export const ICONS = {
  // ... 現有圖標 ...
  new_icon: {
    zh: '新圖標',
    en: 'New Icon',
    icon: '<i class="fas fa-new-icon"></i>',
  },
};
```

然後就可以使用：

```html
<i class="fas fa-new-icon"></i>
```

或者

```javascript
getIcon('new_icon').icon;
getIconHtml('new_icon');
```
