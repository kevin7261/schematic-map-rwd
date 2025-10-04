# 🗺️ Schematic Map RWD - 示意圖響應式網站

[![Vue.js](https://img.shields.io/badge/Vue.js-3.2.13-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.8.0-F9A03C?style=flat-square&logo=d3.js)](https://d3js.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![Pinia](https://img.shields.io/badge/Pinia-2.1.0-FFD859?style=flat-square&logo=pinia)](https://pinia.vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

示意圖

## 📋 目錄

- [🎯 專案概述](#-專案概述)
- [✨ 主要功能](#-主要功能)
- [🛠️ 技術棧](#️-技術棧)
- [🏗️ 專案架構](#️-專案架構)
- [🚀 快速開始](#-快速開始)
- [📁 專案結構](#-專案結構)
- [🔧 開發指南](#-開發指南)
- [📊 數據格式](#-數據格式)
- [🎨 視覺化功能](#-視覺化功能)
- [📱 響應式設計](#-響應式設計)
- [🔍 API 文檔](#-api-文檔)
- [🐛 故障排除](#-故障排除)
- [🤝 貢獻指南](#-貢獻指南)
- [📄 授權條款](#-授權條款)

## 🎯 專案概述

Schematic Map RWD 平台提供：

- **互動式示意圖**：支援網格示意圖和行政區示意圖的動態生成
- **響應式設計**：適配桌面、平板和手機等不同設備
- **實時數據載入**：支援多種數據格式的異步載入和處理
- **視覺化分析**：使用 D3.js 提供豐富的數據視覺化功能
- **模組化架構**：易於擴展和維護的組件化設計

## ✨ 主要功能

### 🗺️ 圖層管理

- **多圖層支援**：同時管理多個地理圖層
- **動態載入**：按需載入圖層數據，提高性能
- **狀態管理**：完整的圖層狀態追蹤和管理
- **分組管理**：將圖層組織成邏輯群組

### 📊 數據視覺化

- **網格示意圖**：動態生成可配置的網格示意圖
- **行政區示意圖**：支援複雜的行政區網絡視覺化
- **互動式圖表**：使用 D3.js 提供豐富的互動功能
- **實時更新**：支援數據的實時更新和重新渲染

### 📱 響應式設計

- **多設備支援**：適配桌面、平板、手機等不同螢幕尺寸
- **自適應佈局**：根據設備特性自動調整界面佈局
- **觸控優化**：針對觸控設備優化的互動體驗
- **性能優化**：針對不同設備的性能優化

### 🔧 開發者功能

- **模組化設計**：易於擴展的組件化架構
- **TypeScript 支援**：完整的類型定義和智能提示
- **熱重載**：支援開發過程中的實時更新
- **調試工具**：豐富的調試和日誌功能

## 🛠️ 技術棧

### 前端框架

- **Vue.js 3.2.13** - 現代化前端框架
- **Vue Router 4.5.1** - 單頁應用路由管理
- **Pinia 2.1.0** - 狀態管理庫

### 視覺化庫

- **D3.js 7.8.0** - 數據驅動文檔視覺化
- **Bootstrap 5.3.0** - 響應式 UI 框架
- **Font Awesome 6.7.2** - 圖示字體庫

### 開發工具

- **Vue CLI 5.0.8** - 專案腳手架
- **Babel 7.12.16** - JavaScript 編譯器
- **ESLint 8.57.0** - 代碼品質檢查
- **Prettier 3.5.3** - 代碼格式化

### 部署平台

- **GitHub Pages** - 靜態網站託管
- **GitHub Actions** - 自動化部署

## 🏗️ 專案架構

```
schematic-map-rwd/
├── 📁 public/                 # 靜態資源
│   ├── 📁 data/              # 數據文件
│   │   ├── 📁 taipei/        # 台北數據
│   │   └── 📁 test/          # 測試數據
│   └── 📄 index.html         # 入口 HTML
├── 📁 src/                   # 源代碼
│   ├── 📁 assets/            # 靜態資源
│   │   └── 📁 css/           # 樣式文件
│   ├── 📁 components/        # 可重用組件
│   ├── 📁 stores/            # 狀態管理
│   ├── 📁 tabs/              # 分頁組件
│   ├── 📁 utils/             # 工具函數
│   ├── 📁 views/             # 頁面組件
│   ├── 📄 App.vue            # 根組件
│   └── 📄 main.js            # 入口文件
├── 📁 docs/                  # 文檔
├── 📄 package.json           # 專案配置
├── 📄 vue.config.js          # Vue 配置
└── 📄 README.md              # 專案說明
```

### 組件架構

```
App.vue
├── HomeView.vue
│   ├── LeftView.vue          # 左側控制面板
│   ├── MiddleView.vue        # 中間主要內容
│   │   ├── UpperView.vue     # 上半部區域
│   │   └── BottomView.vue    # 下半部區域
│   ├── RightView.vue         # 右側分析面板
│   └── ResponsiveLowerView.vue # 響應式下半部
└── LoadingOverlay.vue        # 載入覆蓋層
```

## 🚀 快速開始

### 環境要求

- Node.js >= 14.0.0
- npm >= 6.0.0 或 yarn >= 1.22.0

### 安裝依賴

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 開發模式

```bash
# 啟動開發服務器
npm run serve

# 或使用 yarn
yarn serve
```

開發服務器將在 `http://localhost:8080` 啟動。

### 建置生產版本

```bash
# 建置生產版本
npm run build

# 或使用 yarn
yarn build
```

### 部署到 GitHub Pages

```bash
# 部署到 GitHub Pages
npm run deploy

# 或使用 yarn
yarn deploy
```

## 📁 專案結構

### 核心目錄說明

#### `/src/components/`

可重用的 Vue 組件，包括：

- `LoadingOverlay.vue` - 載入覆蓋層組件
- `DetailItem.vue` - 詳細信息項目組件

#### `/src/stores/`

Pinia 狀態管理，包括：

- `dataStore.js` - 主要數據存儲和圖層管理

#### `/src/tabs/`

分頁組件，包括：

- `D3jsTab.vue` - D3.js 視覺化分頁
- `DashboardTab.vue` - 儀表板分頁
- `DataTableTab.vue` - 數據表格分頁
- `LayersTab.vue` - 圖層管理分頁
- `PropertiesTab.vue` - 屬性分頁

#### `/src/utils/`

工具函數，包括：

- `dataProcessor.js` - 數據處理核心模組
- `utils.js` - 通用工具函數

#### `/src/views/`

頁面組件，包括：

- `HomeView.vue` - 主頁面
- `LeftView.vue` - 左側面板
- `MiddleView.vue` - 中間面板
- `RightView.vue` - 右側面板
- `UpperView.vue` - 上半部區域
- `ResponsiveLowerView.vue` - 響應式下半部

## 🔧 開發指南

### 代碼風格

專案使用 ESLint 和 Prettier 確保代碼品質：

```bash
# 檢查代碼風格
npm run lint

# 自動修復代碼風格問題
npm run lint:fix

# 格式化代碼
npm run prettier

# 檢查格式化
npm run prettier:check

# 完整格式化
npm run format
```

### 組件開發

#### 創建新組件

1. 在適當的目錄下創建 `.vue` 文件
2. 使用 Vue 3 Composition API
3. 添加完整的 JSDoc 註解
4. 遵循現有的命名規範

#### 組件結構

```vue
<template>
  <!-- 模板內容 -->
</template>

<script>
  /**
   * 組件描述
   * @component ComponentName
   * @version 1.0.0
   * @author Your Name
   */
  export default {
    name: 'ComponentName',
    // 組件邏輯
  };
</script>

<style scoped>
  /* 組件樣式 */
</style>
```

### 狀態管理

使用 Pinia 進行狀態管理：

```javascript
// 在組件中使用 store
import { useDataStore } from '@/stores/dataStore';

export default {
  setup() {
    const dataStore = useDataStore();

    // 使用 store 的狀態和方法
    const layers = dataStore.layers;
    const toggleLayer = dataStore.toggleLayerVisibility;

    return {
      layers,
      toggleLayer,
    };
  },
};
```

### 數據載入

使用 `dataProcessor.js` 載入和處理數據：

```javascript
import {
  loadDataLayerJson,
  loadGridSchematicJson,
} from '@/utils/dataProcessor';

// 載入數據圖層
const layerData = await loadDataLayerJson({
  jsonFileName: 'taipei/metro.json',
});

// 載入網格示意圖
const gridData = await loadGridSchematicJson({
  jsonFileName: 'test/grid.json',
});
```

## 📊 數據格式

### 網格示意圖數據

```json
{
  "x": 10,
  "y": 10
}
```

### 行政區示意圖數據

```json
[
  {
    "name": "路線名稱",
    "color": "red",
    "nodes": [
      {
        "coord": { "x": 0, "y": 0 },
        "value": 1,
        "type": 1
      }
    ]
  }
]
```

### 標準地理數據

```json
[
  {
    "name": "要素名稱",
    "id": "要素ID",
    "type": "要素類型",
    "properties": {
      "屬性名": "屬性值"
    }
  }
]
```

## 🎨 視覺化功能

### D3.js 視覺化

專案使用 D3.js 提供豐富的數據視覺化功能：

- **網格示意圖**：動態生成可配置的網格節點
- **行政區示意圖**：複雜的網絡圖視覺化
- **互動式圖表**：支援縮放、平移等互動操作
- **動畫效果**：平滑的過渡動畫

### 顏色配置

```javascript
const colorMap = {
  red: '#ff0000',
  blue: '#0066cc',
  green: '#00aa44',
  orange: '#ff8800',
  // ... 更多顏色
};
```

### 視覺化常數

```javascript
const COLOR_CONFIG = {
  BACKGROUND: '#212121',
  GRID_LINE: '#666666',
  NODE_FILL: '#4CAF50',
  NODE_STROKE: '#2E7D32',
  TEXT_FILL: '#FFFFFF',
};
```

## 📱 響應式設計

### 斷點配置

- **桌面版** (xl+): >= 1200px
- **平板版** (md-lg): 768px - 1199px
- **手機版** (sm-): < 768px

### 佈局適配

#### 桌面版

- 四面板佈局：左側控制、中間主要內容、右側分析、底部表格
- 可拖拽調整面板大小
- 完整功能展示

#### 平板版

- 上下兩層佈局：上半部地圖、下半部分頁導航
- 分頁式功能切換
- 觸控優化

#### 手機版

- 單欄佈局
- 分頁式導航
- 簡化界面

### 觸控支援

- 支援滑鼠和觸控操作
- 手勢識別和響應
- 觸控友好的界面設計

## 🔍 API 文檔

### 數據存儲 API

#### `useDataStore()`

Pinia store 實例，提供圖層管理和狀態控制功能。

##### 狀態屬性

- `layers` - 圖層配置陣列
- `layerStates` - 圖層狀態對象
- `selectedFeature` - 當前選中的要素
- `d3jsDimensions` - D3.js 視覺化尺寸

##### 方法

- `toggleLayerVisibility(layerId)` - 切換圖層可見性
- `findLayerById(layerId)` - 根據 ID 搜尋圖層
- `getAllLayers()` - 獲取所有圖層
- `setSelectedFeature(feature)` - 設定選中要素
- `clearSelectedFeature()` - 清除選中要素

### 數據處理 API

#### `loadDataLayerJson(layer)`

載入數據圖層 JSON 數據。

**參數：**

- `layer` - 圖層配置對象

**返回：**

- `Promise<Object>` - 包含處理後數據的對象

#### `loadGridSchematicJson(layer)`

載入網格示意圖 JSON 數據。

**參數：**

- `layer` - 圖層配置對象

**返回：**

- `Promise<Object>` - 包含網格數據的對象

### 組件 API

#### `D3jsTab`

D3.js 視覺化分頁組件。

**Props：**

- `containerHeight` - 容器高度
- `isPanelDragging` - 面板拖拽狀態
- `activeMarkers` - 活動標記陣列

#### `LayersTab`

圖層管理分頁組件。

**功能：**

- 圖層列表顯示
- 圖層開關控制
- 圖層狀態管理

## 🐛 故障排除

### 常見問題

#### 1. 數據載入失敗

**問題：** 圖層數據無法載入

**解決方案：**

- 檢查數據文件路徑是否正確
- 確認數據文件格式是否符合要求
- 查看瀏覽器控制台的錯誤信息

#### 2. 響應式佈局問題

**問題：** 在不同設備上佈局顯示異常

**解決方案：**

- 檢查 CSS 媒體查詢設定
- 確認 Bootstrap 斷點配置
- 測試不同螢幕尺寸

#### 3. D3.js 視覺化問題

**問題：** 圖表無法正常顯示

**解決方案：**

- 檢查容器尺寸設定
- 確認數據格式正確
- 查看 D3.js 版本兼容性

### 調試工具

#### 瀏覽器開發者工具

- 使用 Console 查看日誌信息
- 使用 Network 檢查數據載入
- 使用 Elements 檢查 DOM 結構

#### Vue DevTools

- 安裝 Vue DevTools 瀏覽器擴展
- 查看組件狀態和 props
- 監控狀態變化

#### 日誌系統

專案提供詳細的日誌記錄：

```javascript
// 在組件中使用
console.log('🔧 調試信息:', data);
console.warn('⚠️ 警告信息:', warning);
console.error('❌ 錯誤信息:', error);
```

## 🤝 貢獻指南

### 如何貢獻

1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 代碼規範

- 遵循現有的代碼風格
- 添加適當的註解和文檔
- 確保代碼通過 ESLint 檢查
- 編寫測試用例（如果適用）

### 提交規範

使用語義化提交信息：

```
feat: 添加新功能
fix: 修復問題
docs: 更新文檔
style: 代碼格式調整
refactor: 代碼重構
test: 添加測試
chore: 構建過程或輔助工具的變動
```

## 📄 授權條款

本專案採用 MIT 授權條款。詳見 [LICENSE](LICENSE) 文件。

## 📞 聯絡資訊

- **作者：** Kevin Cheng
- **電子郵件：** kevin7261@gmail.com
- **GitHub：** [@kevin7261](https://github.com/kevin7261)

## 🙏 致謝

- [Vue.js](https://vuejs.org/) - 優秀的前端框架
- [D3.js](https://d3js.org/) - 強大的數據視覺化庫
- [Bootstrap](https://getbootstrap.com/) - 響應式 UI 框架
- [Pinia](https://pinia.vuejs.org/) - 現代化狀態管理
- [Font Awesome](https://fontawesome.com/) - 豐富的圖示庫

---

**⭐ 如果這個專案對您有幫助，請給它一個星標！**
