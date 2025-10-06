# 🗺️ Schematic Map RWD - 示意圖響應式網站

[![Vue.js](https://img.shields.io/badge/Vue.js-3.2.13-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![D3.js](https://img.shields.io/badge/D3.js-7.8.0-F9A03C?style=flat-square&logo=d3.js)](https://d3js.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![Pinia](https://img.shields.io/badge/Pinia-2.1.0-FFD859?style=flat-square&logo=pinia)](https://pinia.vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> 一個基於 Vue
> 3 和 D3.js 的現代化示意圖響應式網站，專為地理空間數據視覺化和互動式地圖展示而設計。該平台結合了最新的前端技術和強大的視覺化能力，提供了一個完整的地理資訊系統解決方案。所有程式碼均包含詳細的中文註解，便於學習和維護。

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

Schematic Map
RWD 是一個現代化的響應式示意圖展示平台，專為地理空間數據的視覺化和互動分析而設計。該平台結合了 Vue
3 的現代化前端技術和 D3.js 的強大視覺化能力，提供了一個完整的地理資訊系統解決方案。

### 🌟 核心特色

- **🎨 現代化設計**：採用 Bootstrap 5 響應式框架，提供美觀且一致的用戶體驗
- **⚡ 高性能**：使用 Vue 3 Composition
  API 和 Pinia 狀態管理，確保流暢的互動體驗
- **📱 完全響應式**：支援桌面、平板、手機等各種設備，提供最佳的跨平台體驗
- **🗺️ 強大的視覺化**：整合 D3.js 提供豐富的數據視覺化和互動功能
- **🔧 模組化架構**：採用組件化設計，易於維護和擴展
- **📊 多圖層支援**：支援多種圖層類型的載入、管理和視覺化
- **🎯 互動式分析**：提供豐富的互動功能，支援數據探索和分析
- **♿ 無障礙設計**：符合 WCAG 標準，支援螢幕閱讀器和鍵盤導航
- **📝 詳細註解**：所有程式碼均包含完整的中文 JSDoc 註解，包括函數說明、參數描述、使用範例等
- **🎓 易於學習**：每個檔案都有詳細的功能說明和技術特點描述，適合學習和教學
- **🔍 完整文檔**：提供完整的 API 文檔和開發指南，降低上手難度
- **⚙️ 配置詳解**：所有配置文件都有詳細註解，說明每個選項的作用和影響

### 🎯 應用場景

- **地理資訊系統 (GIS)**：展示和管理地理空間數據
- **城市規劃**：視覺化城市基礎設施和規劃方案
- **交通分析**：分析交通流量和路線規劃
- **環境監測**：展示環境數據和污染分佈
- **學術研究**：支援地理學、城市規劃等領域的研究
- **商業智能**：數據視覺化和商業分析
- **教育培訓**：地理資訊系統教學和培訓

## ✨ 主要功能

### 🗺️ 圖層管理系統

#### 多圖層支援

- **分組管理**：將圖層組織成邏輯群組，便於管理
- **動態載入**：按需載入圖層數據，提高性能
- **狀態追蹤**：完整的圖層狀態管理，包括可見性、載入狀態等
- **批量操作**：支援批量開啟/關閉圖層
- **智能篩選**：按城市、類型、狀態等條件篩選圖層

#### 圖層類型支援

- **網格示意圖**：支援可配置的網格節點數據
- **行政區示意圖**：複雜的行政區網絡視覺化
- **點數據圖層**：地理標記點的展示
- **線數據圖層**：路徑和連線的視覺化
- **面數據圖層**：區域和多邊形的展示
- **自定義圖層**：支援擴展的圖層類型

#### 圖層操作功能

- **一鍵切換**：快速開啟/關閉圖層顯示
- **載入狀態監控**：實時顯示載入進度和狀態
- **錯誤處理**：完整的錯誤提示和恢復機制
- **性能優化**：智能的數據快取和載入策略

### 📊 數據視覺化功能

#### D3.js 整合

- **互動式圖表**：支援縮放、平移、選擇等互動操作
- **動畫效果**：平滑的過渡動畫和狀態切換
- **自定義渲染**：靈活的數據綁定和視覺化配置
- **響應式圖表**：自動適應容器尺寸變化
- **多種圖表類型**：支援散點圖、線圖、柱狀圖等

#### 視覺化類型

- **網絡圖**：節點和連線的關係視覺化
- **散點圖**：地理標記的分佈展示
- **熱力圖**：數據密度的視覺化表示
- **統計圖表**：數據摘要和統計分析
- **地理圖**：基於地理座標的空間視覺化

#### 互動功能

- **要素選擇**：點擊選擇和查看詳細資訊
- **懸停提示**：滑鼠懸停顯示要素資訊
- **縮放平移**：支援地圖的縮放和平移操作
- **圖層切換**：動態切換不同圖層的顯示
- **數據篩選**：根據條件篩選和顯示數據

### 📱 響應式設計

#### 多設備適配

- **桌面版 (≥1200px)**：四面板佈局，完整功能展示
- **平板版 (768-1199px)**：上下兩層佈局，分頁式導航
- **手機版 (<768px)**：單欄佈局，簡化操作流程

#### 互動優化

- **觸控支援**：針對觸控設備優化的手勢操作
- **鍵盤導航**：完整的鍵盤快捷鍵支援
- **無障礙設計**：符合 WCAG 標準的無障礙功能
- **手勢識別**：支援縮放、平移等手勢操作

### 🔧 開發者功能

#### 狀態管理

- **Pinia 整合**：現代化的狀態管理解決方案
- **響應式更新**：自動的狀態同步和 UI 更新
- **持久化支援**：狀態的本地存儲和恢復
- **模組化設計**：清晰的狀態組織和分離

#### 開發工具

- **熱重載**：開發過程中的實時更新
- **調試工具**：豐富的調試和日誌功能
- **TypeScript 支援**：完整的類型定義和智能提示
- **代碼品質**：ESLint 和 Prettier 整合

### 📊 數據分析功能

#### 統計摘要

- **實時統計**：根據當前可見圖層計算統計數據
- **數據摘要**：提供圖層數據的摘要信息
- **性能指標**：載入時間、渲染性能等指標
- **數據品質**：數據完整性和準確性評估

#### 表格功能

- **多圖層表格**：支援多個圖層的數據表格顯示
- **動態欄位**：自動偵測和顯示數據欄位
- **排序篩選**：支援按不同欄位排序和篩選
- **分頁顯示**：處理大量數據的分頁顯示

## 🛠️ 技術棧

### 前端框架

- **Vue.js 3.2.13** - 現代化前端框架，使用 Composition API
- **Vue Router 4.5.1** - 單頁應用路由管理
- **Pinia 2.1.0** - Vue 3 官方推薦的狀態管理庫

### 視覺化庫

- **D3.js 7.8.0** - 數據驅動文檔視覺化庫
- **Bootstrap 5.3.0** - 響應式 UI 框架
- **Font Awesome 6.7.2** - 圖示字體庫

### 開發工具

- **Vue CLI 5.0.8** - 專案腳手架和構建工具
- **Babel 7.12.16** - JavaScript 編譯器
- **ESLint 8.57.0** - 代碼品質檢查工具
- **Prettier 3.5.3** - 代碼格式化工具
- **Vite** - 快速的前端構建工具

### 部署平台

- **GitHub Pages** - 靜態網站託管
- **GitHub Actions** - 自動化部署流程

### 瀏覽器支援

- **Chrome** 88+ - 完整功能支援
- **Firefox** 85+ - 完整功能支援
- **Safari** 14+ - 完整功能支援
- **Edge** 88+ - 完整功能支援

## 🏗️ 專案架構

### 整體架構設計

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (用戶界面)                        │
├─────────────────────────────────────────────────────────────┤
│  Vue 3 Application (前端應用程式)                           │
│  ├── App.vue (根組件)                                      │
│  ├── Router (路由管理)                                     │
│  └── Pinia Store (狀態管理)                               │
├─────────────────────────────────────────────────────────────┤
│  Component Layer (組件層)                                  │
│  ├── Views (頁面組件)                                      │
│  ├── Components (通用組件)                                 │
│  ├── Tabs (分頁組件)                                       │
│  └── Utils (工具函數)                                      │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (數據層)                                       │
│  ├── JSON Data Files (靜態數據)                           │
│  ├── Data Processor (數據處理)                             │
│  └── D3.js Visualization (視覺化引擎)                     │
└─────────────────────────────────────────────────────────────┘
```

### 組件架構

```
App.vue (根組件)
├── HomeView.vue (主頁面)
│   ├── LeftView.vue (左側控制面板)
│   │   └── LayersTab.vue (圖層管理)
│   ├── MiddleView.vue (中間主要內容)
│   │   ├── UpperView.vue (上半部區域)
│   │   │   ├── D3jsTab.vue (D3.js 視覺化)
│   │   │   └── DashboardTab.vue (儀表板)
│   │   └── BottomView.vue (下半部區域)
│   │       └── DataTableTab.vue (數據表格)
│   └── RightView.vue (右側分析面板)
│       ├── PropertiesTab.vue (屬性資訊)
│       └── LayerInfoTab.vue (圖層資訊)
└── LoadingOverlay.vue (載入覆蓋層)
```

### 數據流程

```
用戶操作 → 組件事件 → Pinia Store → 狀態更新 → UI 重新渲染
    ↓
數據載入 → Data Processor → 數據轉換 → Store 更新 → 視覺化更新
```

### 狀態管理架構

```
Pinia Store (dataStore)
├── 圖層狀態管理
│   ├── layers (圖層配置陣列)
│   ├── layerStates (圖層狀態對象)
│   └── 圖層操作方法
├── 用戶互動管理
│   ├── selectedFeature (選中要素)
│   └── 互動操作方法
├── 視覺化設定
│   ├── d3jsDimensions (D3.js 尺寸)
│   └── 視覺化配置方法
└── 統計數據管理
    ├── 實時統計計算
    └── 數據摘要生成
```

## 🚀 快速開始

### 環境要求

- **Node.js** >= 14.0.0 (推薦 16.0.0+)
- **npm** >= 6.0.0 或 **yarn** >= 1.22.0
- **現代瀏覽器**：Chrome 88+, Firefox 85+, Safari 14+, Edge 88+

### 安裝步驟

1. **克隆專案**

   ```bash
   git clone https://github.com/kevin7261/schematic-map-rwd.git
   cd schematic-map-rwd
   ```

2. **安裝依賴**

   ```bash
   # 使用 npm
   npm install

   # 或使用 yarn
   yarn install
   ```

3. **啟動開發服務器**

   ```bash
   # 使用 npm
   npm run serve

   # 或使用 yarn
   yarn serve
   ```

4. **訪問應用程式**

   開發服務器將在 `http://localhost:8080` 啟動。

### 建置生產版本

```bash
# 建置生產版本
npm run build

# 建置完成後，dist 目錄將包含所有生產文件
```

### 部署到 GitHub Pages

```bash
# 部署到 GitHub Pages
npm run deploy

# 或使用 yarn
yarn deploy
```

部署完成後，應用程式將在 `https://kevin7261.github.io/schematic-map-rwd`
上可用。

### 開發環境設定

#### 1. 代碼品質工具

```bash
# 檢查代碼風格
npm run lint

# 自動修復代碼風格問題
npm run lint:fix

# 格式化代碼
npm run prettier

# 檢查格式化
npm run prettier:check

# 完整格式化（格式化 + 修復）
npm run format
```

#### 2. 開發工具推薦

- **VS Code** - 推薦的編輯器
- **Vue DevTools** - 瀏覽器擴展
- **Vue Language Features (Volar)** - Vue 3 語法支援

## 📁 專案結構

```
schematic-map-rwd/
├── 📁 public/                 # 靜態資源
│   ├── 📁 data/              # 數據文件
│   │   ├── 📁 taipei/        # 台北數據
│   │   │   ├── taipei_schematic.json
│   │   │   └── taipei_schematic_2.json
│   │   └── 📁 test/          # 測試數據
│   │       └── test.json
│   ├── 📄 index.html         # 入口 HTML
│   └── 📄 favicon.ico        # 網站圖示
├── 📁 src/                   # 源代碼
│   ├── 📁 assets/            # 靜態資源
│   │   ├── 📁 css/           # 樣式文件
│   │   │   ├── common.css    # 共用樣式
│   │   │   └── variables.css # CSS 變數
│   │   └── 📄 logo.png       # 應用程式圖示
│   ├── 📁 components/        # 可重用組件
│   │   ├── LoadingOverlay.vue # 載入覆蓋層
│   │   └── DetailItem.vue    # 詳細資訊項目
│   ├── 📁 stores/            # 狀態管理
│   │   └── dataStore.js      # 主要數據存儲
│   ├── 📁 tabs/              # 分頁組件
│   │   ├── D3jsTab.vue       # D3.js 視覺化
│   │   ├── DashboardTab.vue  # 儀表板
│   │   ├── DataTableTab.vue  # 數據表格
│   │   ├── LayersTab.vue     # 圖層管理
│   │   ├── PropertiesTab.vue # 屬性資訊
│   │   └── layerInfoTab.vue  # 圖層資訊
│   ├── 📁 utils/             # 工具函數
│   │   ├── dataProcessor.js  # 數據處理核心
│   │   └── utils.js          # 通用工具函數
│   ├── 📁 views/             # 頁面組件
│   │   ├── HomeView.vue      # 主頁面
│   │   ├── LeftView.vue      # 左側面板
│   │   ├── MiddleView.vue    # 中間面板
│   │   ├── RightView.vue     # 右側面板
│   │   ├── UpperView.vue     # 上半部區域
│   │   ├── BottomView.vue    # 下半部區域
│   │   └── ResponsiveLowerView.vue # 響應式下半部
│   ├── 📁 router/            # 路由配置
│   │   └── index.js          # 路由定義
│   ├── 📄 App.vue            # 根組件
│   └── 📄 main.js            # 入口文件
├── 📁 docs/                  # 文檔
│   └── PACKAGE_JSON_DOCUMENTATION.md
├── 📄 package.json           # 專案配置
├── 📄 vue.config.js          # Vue 配置
├── 📄 vite.config.js         # Vite 配置
├── 📄 babel.config.js        # Babel 配置
├── 📄 jsconfig.json          # JavaScript 配置
└── 📄 README.md              # 專案說明
```

## 📝 代碼品質與註解 (Code Quality & Documentation)

本專案的一大特色是**所有程式碼均包含詳細的中文註解**，這使得本專案不僅是一個功能完整的應用程式，也是一個優秀的學習資源。

### 🎯 註解特點

#### 1. 📚 完整的 JSDoc 註解

所有函數、組件、配置文件都包含完整的 JSDoc 註解，包括：

- **功能說明**：詳細描述函數或組件的用途和設計理念
- **參數描述**：每個參數的類型、預設值、是否必填等
- **返回值說明**：返回值的類型和結構說明
- **使用範例**：實際的代碼範例，展示如何使用
- **注意事項**：重要的警告、限制和最佳實踐

#### 2. 🏗️ 架構說明

每個主要模組都包含架構說明：

- **設計理念**：說明為什麼要這樣設計
- **技術特點**：使用了哪些技術和為什麼使用
- **工作流程**：詳細的流程圖和步驟說明
- **依賴關係**：與其他模組的關係說明

#### 3. 💡 實用範例

註解中包含大量實際可用的代碼範例：

```javascript
/**
 * 🔄 切換圖層可見性 (Toggle Layer Visibility)
 *
 * @example
 * // 開啟圖層
 * await toggleLayerVisibility('taipei_metro');
 *
 * // 在組件中使用
 * const handleLayerToggle = async (layerId) => {
 *   try {
 *     await toggleLayerVisibility(layerId);
 *     console.log('圖層切換成功');
 *   } catch (error) {
 *     console.error('圖層切換失敗:', error);
 *   }
 * };
 */
```

#### 4. 🎨 視覺化說明

使用 emoji 和符號增強可讀性：

- 🎯 主要功能
- 🔧 技術實現
- 📊 數據結構
- ⚠️ 注意事項
- 🚀 使用範例
- 📱 響應式支援

#### 5. 📖 多層次註解

- **檔案層級**：每個檔案開頭的完整模組說明
- **區塊層級**：每個主要代碼區塊的功能說明
- **函數層級**：每個函數的詳細文檔
- **行內註解**：關鍵邏輯的解釋說明

### 🎓 學習友好

本專案特別適合：

- **Vue 3 學習者**：完整展示 Composition API 的使用
- **D3.js 初學者**：詳細的視覺化實現說明
- **前端開發者**：現代化前端架構的最佳實踐
- **學生專案**：適合作為畢業專題或課程作業的參考
- **技術文檔撰寫**：優秀的代碼註解範例

### 🔍 註解覆蓋率

| 模組類型                    | 註解覆蓋率 | 說明                       |
| --------------------------- | ---------- | -------------------------- |
| 核心模組 (main.js, App.vue) | 100%       | 完整的模組說明和註解       |
| 狀態管理 (stores)           | 100%       | 每個狀態、方法都有詳細說明 |
| 路由系統 (router)           | 100%       | 路由配置和守衛的詳細說明   |
| 工具函數 (utils)            | 100%       | 完整的函數文檔和使用範例   |
| 數據處理 (dataProcessor)    | 100%       | 詳細的流程說明和錯誤處理   |
| 視圖組件 (views)            | 100%       | 組件設計理念和使用說明     |
| 功能組件 (tabs)             | 100%       | 詳細的功能說明和 API 文檔  |
| 通用組件 (components)       | 100%       | 完整的組件文檔和屬性說明   |
| 配置文件 (config)           | 100%       | 每個配置選項的詳細說明     |

### 核心目錄說明

#### `/src/components/`

可重用的 Vue 組件，提供通用的 UI 功能：

- `LoadingOverlay.vue` - 全螢幕載入覆蓋層組件（包含完整的 JSDoc 註解和使用範例）
- `DetailItem.vue` - 詳細資訊項目顯示組件（包含屬性說明和視覺化設計說明）

#### `/src/stores/`

Pinia 狀態管理，集中管理應用程式狀態：

- `dataStore.js` - 主要數據存儲和圖層管理
  - ✅ 完整的 JSDoc 註解，包含所有狀態和方法的詳細說明
  - ✅ 詳細的架構設計說明和數據流程圖
  - ✅ 豐富的使用範例和最佳實踐
  - ✅ 完整的錯誤處理說明和調試技巧

#### `/src/tabs/`

分頁組件，提供不同功能模組的界面（所有組件均包含詳細註解）：

- `D3jsTab.vue` - D3.js 視覺化分頁（包含完整的 D3.js 使用說明和視覺化邏輯）
- `DashboardTab.vue` - 儀表板數據摘要分頁（詳細的統計計算說明）
- `DataTableTab.vue` - 多圖層數據表格分頁（表格功能和數據處理說明）
- `LayersTab.vue` - 圖層管理控制分頁（圖層管理邏輯說明）
- `PropertiesTab.vue` - 屬性資訊顯示分頁（屬性展示邏輯說明）
- `layerInfoTab.vue` - 圖層資訊統計分頁（統計計算說明）
- `jsonDataTab.vue` - JSON 數據顯示分頁（數據格式化說明）
- `processedJsonDataTab.vue` - 處理後數據顯示分頁（數據處理流程說明）
- `drawJsonDataTab.vue` - 繪製數據顯示分頁（繪製邏輯說明）

#### `/src/utils/`

工具函數，提供通用的功能和數據處理（包含最詳細的函數文檔）：

- `dataProcessor.js` - 數據處理核心模組
  - ✅ 每個函數都有完整的 JSDoc 註解
  - ✅ 詳細的數據格式說明和範例
  - ✅ 完整的錯誤處理和調試說明
  - ✅ 豐富的使用場景和最佳實踐
- `utils.js` - 通用工具函數
  - ✅ 圖標管理系統的完整說明
  - ✅ 剪貼簿操作的詳細文檔
  - ✅ 每個函數都有使用範例

#### `/src/views/`

頁面組件，定義主要的應用程式界面（所有組件均包含詳細的組件說明）：

- `HomeView.vue` - 主頁面（包含完整的佈局說明和響應式設計邏輯）
- `LeftView.vue` - 左側控制面板（面板功能和互動邏輯說明）
- `MiddleView.vue` - 中間主要內容面板（內容管理和視圖切換邏輯）
- `RightView.vue` - 右側分析面板（分析功能和數據展示邏輯）
- `UpperView.vue` - 上半部區域（地圖/儀表板切換邏輯）
- `BottomView.vue` - 下半部區域（表格/樣式展示邏輯）
- `ResponsiveLowerView.vue` - 響應式下半部區域（響應式設計實現說明）

## 🔧 開發指南

### 📖 如何閱讀代碼註解

本專案的代碼註解採用結構化的格式，便於快速理解和學習：

#### 1. 檔案層級註解

每個檔案開頭都有完整的模組說明：

```javascript
/**
 * 📦 模組名稱 (Module Name)
 *
 * 功能說明 (Features):
 * 1. 主要功能一
 * 2. 主要功能二
 *
 * 技術特點 (Technical Features):
 * - 使用的技術和原因
 *
 * @file 檔案名稱
 * @version 版本號
 * @author 作者
 * @since 起始版本
 */
```

#### 2. 函數/方法註解

每個函數都有詳細的文檔：

```javascript
/**
 * 🔄 函數名稱 (Function Name)
 *
 * 詳細功能說明...
 *
 * @param {Type} paramName - 參數說明
 * @returns {Type} - 返回值說明
 * @throws {Error} - 可能的錯誤
 *
 * @example
 * // 使用範例
 * const result = functionName(param);
 */
```

#### 3. 組件註解

Vue 組件包含完整的組件說明：

```javascript
/**
 * 🧩 組件名稱 (Component Name)
 *
 * 🎯 主要功能 (Core Features):
 * 1. 功能一
 * 2. 功能二
 *
 * 🏗️ 技術特點 (Technical Features):
 * - 技術特點說明
 *
 * @component ComponentName
 * @version 版本號
 */
```

#### 4. 使用 VS Code 增強體驗

建議安裝以下 VS Code 擴展以獲得最佳體驗：

- **Volar** - Vue 3 語法支援和智能提示
- **ESLint** - 代碼品質檢查
- **Prettier** - 代碼格式化
- **GitLens** - Git 歷史查看
- **Path Intellisense** - 路徑自動完成
- **Document This** - 快速生成 JSDoc 註解

#### 5. 快速導航技巧

- 使用 `Ctrl/Cmd + P` 快速打開文件
- 使用 `Ctrl/Cmd + Shift + O` 查看文件大綱
- 使用 `Ctrl/Cmd + Click` 跳轉到定義
- 使用 `Alt + ←/→` 在導航歷史中前後移動
- 懸停在函數名上查看完整的 JSDoc 文檔

### 代碼風格

專案使用 ESLint 和 Prettier 確保代碼品質和一致性：

```bash
# 檢查代碼風格
npm run lint

# 自動修復代碼風格問題
npm run lint:fix

# 格式化代碼
npm run prettier

# 檢查格式化
npm run prettier:check

# 完整格式化（格式化 + 修復）
npm run format
```

### 組件開發規範

#### 創建新組件

1. **選擇適當的目錄**

   - 通用組件 → `/src/components/`
   - 分頁組件 → `/src/tabs/`
   - 頁面組件 → `/src/views/`

2. **使用 Vue 3 Composition API**

   ```vue
   <script>
     /**
      * 組件描述和功能說明
      * @component ComponentName
      * @version 1.0.0
      * @author Your Name
      */
     export default {
       name: 'ComponentName',
       // 組件邏輯
     };
   </script>
   ```

3. **添加完整的 JSDoc 註解**

   ```javascript
   /**
    * 函數描述
    * @param {string} param1 - 參數描述
    * @returns {Object} 返回值描述
    */
   function exampleFunction(param1) {
     // 函數實現
   }
   ```

4. **遵循命名規範**
   - 組件名稱：PascalCase（如：`DataTableTab`）
   - 文件名稱：PascalCase.vue（如：`DataTableTab.vue`）
   - 變數名稱：camelCase（如：`activeLayerTab`）
   - 常數名稱：UPPER_SNAKE_CASE（如：`MAX_WIDTH`）

#### 組件結構模板

```vue
<template>
  <!-- 組件模板 -->
</template>

<script>
  /**
   * 組件詳細描述
   * @component ComponentName
   * @version 1.0.0
   * @author Your Name
   */
  export default {
    name: 'ComponentName',

    props: {
      // 組件屬性定義
    },

    emits: [
      // 組件事件定義
    ],

    setup(props, { emit }) {
      // Composition API 邏輯

      return {
        // 返回給模板的響應式數據和方法
      };
    },
  };
</script>

<style scoped>
  /* 組件專屬樣式 */
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
    const layers = computed(() => dataStore.layers);
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

### 路由配置

在 `/src/router/index.js` 中添加新路由：

```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: '示意圖響應式網站',
      description: 'Schematic Map系統的示意圖展示平台',
      requiresAuth: false,
    },
  },
  // 添加新路由
  {
    path: '/new-page',
    name: 'NewPage',
    component: () => import('../views/NewPageView.vue'),
    meta: {
      title: '新頁面',
      description: '新頁面描述',
      requiresAuth: false,
    },
  },
];
```

### 樣式開發

#### CSS 變數使用

```css
/* 使用預定義的 CSS 變數 */
.my-component {
  font-family: var(--my-font-family-primary);
  font-size: var(--my-font-size-md);
  color: var(--my-color-gray-900);
  background-color: var(--my-color-white);
}
```

#### 響應式設計

```css
/* 使用 Bootstrap 斷點 */
@media (min-width: 768px) {
  .desktop-only {
    display: block;
  }
}

@media (max-width: 767px) {
  .mobile-only {
    display: block;
  }
}
```

## 📊 數據格式

### 網格示意圖數據格式

```json
{
  "x": 10,
  "y": 10
}
```

**說明：**

- `x`: 網格的水平節點數量
- `y`: 網格的垂直節點數量

### 行政區示意圖數據格式

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

**說明：**

- `name`: 路線或區域的名稱
- `color`: 顯示顏色（支援預定義顏色名稱）
- `nodes`: 節點陣列
  - `coord`: 節點座標 `{x, y}`
  - `value`: 節點數值
  - `type`: 節點類型

### 標準地理數據格式

```json
[
  {
    "name": "要素名稱",
    "id": "要素ID",
    "type": "要素類型",
    "properties": {
      "屬性名": "屬性值"
    },
    "geometry": {
      "type": "Point|LineString|Polygon",
      "coordinates": [經度, 緯度]
    }
  }
]
```

**說明：**

- `name`: 地理要素的名稱
- `id`: 唯一識別碼
- `type`: 要素類型
- `properties`: 要素屬性對象
- `geometry`: 幾何信息（可選）

### 顏色配置

支援的預定義顏色：

```javascript
const colorMap = {
  red: '#f44336',
  blue: '#2196f3',
  green: '#4caf50',
  orange: '#ff9800',
  purple: '#9c27b0',
  yellow: '#ffeb3b',
  pink: '#e91e63',
  cyan: '#00bcd4',
  // ... 更多顏色
};
```

## 🎨 視覺化功能

### D3.js 整合

專案使用 D3.js 提供豐富的數據視覺化功能：

#### 網格示意圖

- **動態生成**：根據配置參數動態生成網格節點
- **互動操作**：支援節點選擇、拖拽、縮放等操作
- **視覺化增強**：顏色編碼、大小調整、標籤顯示

#### 行政區示意圖

- **複雜網絡**：支援多層次的節點和連線關係
- **路徑視覺化**：清晰的線條和節點表示
- **互動探索**：點擊、懸停、選擇等互動功能

#### 統計圖表

- **數據摘要**：自動生成統計圖表和摘要信息
- **即時更新**：數據變化時自動更新視覺化
- **多種圖表類型**：支援柱狀圖、折線圖、散點圖等

### 視覺化常數

```javascript
const VISUALIZATION_CONFIG = {
  // 顏色配置
  colors: {
    background: '#212121',
    gridLine: '#666666',
    nodeFill: '#4CAF50',
    nodeStroke: '#2E7D32',
    textFill: '#FFFFFF',
  },

  // 尺寸配置
  dimensions: {
    nodeRadius: 6,
    strokeWidth: 2,
    fontSize: 12,
  },

  // 動畫配置
  animation: {
    duration: 750,
    ease: 'ease-in-out',
  },
};
```

### 響應式視覺化

視覺化組件會自動適應容器尺寸變化：

```javascript
// 監聽容器尺寸變化
const updateDimensions = () => {
  const container = d3.select('#visualization-container');
  const rect = container.node().getBoundingClientRect();

  // 更新 D3.js 圖表尺寸
  svg.attr('width', rect.width).attr('height', rect.height);
};
```

## 📱 響應式設計

### 斷點配置

```scss
// Bootstrap 5 斷點
$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
);
```

### 佈局適配

#### 桌面版 (xl+): ≥1200px

- **四面板佈局**：左側控制、中間主要內容、右側分析、底部表格
- **可拖拽調整**：支援面板大小動態調整
- **完整功能**：所有功能完整展示

#### 平板版 (md-lg): 768px - 1199px

- **上下兩層佈局**：上半部地圖、下半部分頁導航
- **分頁式功能**：功能以分頁形式組織
- **觸控優化**：針對觸控設備優化

#### 手機版 (sm-): <768px

- **單欄佈局**：垂直排列的所有內容
- **分頁式導航**：使用分頁切換不同功能
- **簡化界面**：保留核心功能，簡化操作

### 觸控支援

- **手勢識別**：支援縮放、平移等手勢操作
- **觸控反饋**：提供視覺和觸覺反饋
- **無障礙支援**：符合 WCAG 2.1 AA 標準

## 🔍 API 文檔

### 數據存儲 API

#### `useDataStore()`

Pinia store 實例，提供圖層管理和狀態控制功能。

##### 狀態屬性

| 屬性              | 類型           | 描述             |
| ----------------- | -------------- | ---------------- |
| `layers`          | `Array`        | 圖層配置陣列     |
| `layerStates`     | `Object`       | 圖層狀態對象     |
| `selectedFeature` | `Object\|null` | 當前選中的要素   |
| `d3jsDimensions`  | `Object`       | D3.js 視覺化尺寸 |

##### 主要方法

| 方法                    | 參數              | 返回值          | 描述             |
| ----------------------- | ----------------- | --------------- | ---------------- |
| `toggleLayerVisibility` | `layerId: string` | `Promise<void>` | 切換圖層可見性   |
| `findLayerById`         | `layerId: string` | `Object\|null`  | 根據 ID 搜尋圖層 |
| `getAllLayers`          | -                 | `Array`         | 獲取所有圖層     |
| `setSelectedFeature`    | `feature: Object` | `void`          | 設定選中要素     |
| `clearSelectedFeature`  | -                 | `void`          | 清除選中要素     |

##### 使用範例

```javascript
import { useDataStore } from '@/stores/dataStore';

const dataStore = useDataStore();

// 切換圖層可見性
await dataStore.toggleLayerVisibility('taipei_metro');

// 獲取可見圖層
const visibleLayers = computed(() =>
  dataStore.layers.filter((layer) => layer.visible)
);

// 設定選中的要素
dataStore.setSelectedFeature({
  id: 'feature-1',
  name: '台北車站',
  properties: { type: 'station' },
});
```

### 數據處理 API

#### `loadDataLayerJson(layer)`

載入數據圖層 JSON 數據。

**參數：**

- `layer` - 圖層配置對象，包含 `jsonFileName` 屬性

**返回：**

- `Promise<Object>` - 包含處理後數據的對象

**使用範例：**

```javascript
import { loadDataLayerJson } from '@/utils/dataProcessor';

const layerData = await loadDataLayerJson({
  jsonFileName: 'taipei/metro.json',
});
```

#### `loadGridSchematicJson(layer)`

載入網格示意圖 JSON 數據。

**參數：**

- `layer` - 圖層配置對象，包含 `jsonFileName` 屬性

**返回：**

- `Promise<Object>` - 包含網格數據的對象

**使用範例：**

```javascript
import { loadGridSchematicJson } from '@/utils/dataProcessor';

const gridData = await loadGridSchematicJson({
  jsonFileName: 'test/grid.json',
});
```

### 組件 API

#### `D3jsTab`

D3.js 視覺化分頁組件。

**Props：**

- `containerHeight` - 容器高度
- `isPanelDragging` - 面板拖拽狀態
- `activeMarkers` - 活動標記陣列

**Events：**

- `feature-selected` - 要素選中事件
- `highlight-on-map` - 地圖高亮事件

#### `LayersTab`

圖層管理分頁組件。

**功能：**

- 圖層列表顯示
- 圖層開關控制
- 圖層狀態管理

**Events：**

- `layer-toggle` - 圖層切換事件
- `layer-load` - 圖層載入事件

#### `DataTableTab`

數據表格分頁組件。

**Props：**

- `visibleLayers` - 可見圖層陣列
- `activeLayerTab` - 當前活動圖層

**功能：**

- 多圖層數據表格顯示
- 動態欄位偵測
- 排序和篩選功能

## 🐛 故障排除

### 常見問題

#### 1. 數據載入失敗

**問題：** 圖層數據無法載入或顯示錯誤

**可能原因：**

- 數據文件路徑不正確
- JSON 文件格式錯誤
- 網路連接問題

**解決方案：**

1. 檢查數據文件路徑是否正確
2. 確認數據文件格式是否符合要求
3. 查看瀏覽器控制台的錯誤信息
4. 檢查網路連接和防火牆設定

```javascript
// 調試數據載入
console.log('嘗試載入數據:', fileName);
try {
  const data = await loadDataLayerJson({ jsonFileName: fileName });
  console.log('數據載入成功:', data);
} catch (error) {
  console.error('數據載入失敗:', error);
}
```

#### 2. 響應式佈局問題

**問題：** 在不同設備上佈局顯示異常

**可能原因：**

- CSS 媒體查詢設定錯誤
- Bootstrap 斷點配置問題
- 組件尺寸計算錯誤

**解決方案：**

1. 檢查 CSS 媒體查詢設定
2. 確認 Bootstrap 斷點配置
3. 測試不同螢幕尺寸
4. 檢查組件的響應式邏輯

```scss
// 檢查響應式樣式
@media (max-width: 768px) {
  .mobile-layout {
    display: block;
  }
}
```

#### 3. D3.js 視覺化問題

**問題：** 圖表無法正常顯示或互動異常

**可能原因：**

- 容器尺寸設定錯誤
- 數據格式不正確
- D3.js 版本兼容性問題

**解決方案：**

1. 檢查容器尺寸設定
2. 確認數據格式正確
3. 查看 D3.js 版本兼容性
4. 檢查瀏覽器控制台的錯誤信息

```javascript
// 調試 D3.js 視覺化
const container = d3.select('#visualization-container');
const rect = container.node().getBoundingClientRect();
console.log('容器尺寸:', rect.width, rect.height);
```

#### 4. 狀態管理問題

**問題：** 組件狀態不同步或更新異常

**可能原因：**

- Pinia store 配置錯誤
- 響應式數據綁定問題
- 組件生命週期問題

**解決方案：**

1. 檢查 Pinia store 配置
2. 確認響應式數據綁定
3. 檢查組件生命週期
4. 使用 Vue DevTools 調試

```javascript
// 調試狀態管理
import { useDataStore } from '@/stores/dataStore';

const dataStore = useDataStore();
console.log('當前狀態:', dataStore.$state);
```

### 調試工具

#### 瀏覽器開發者工具

- **Console**：查看日誌信息和錯誤
- **Network**：檢查數據載入和網路請求
- **Elements**：檢查 DOM 結構和樣式
- **Sources**：設置斷點和調試代碼

#### Vue DevTools

1. 安裝 Vue DevTools 瀏覽器擴展
2. 查看組件狀態和 props
3. 監控狀態變化
4. 檢查事件發射

#### 日誌系統

專案提供詳細的日誌記錄：

```javascript
// 在組件中使用
console.log('🔧 調試信息:', data);
console.warn('⚠️ 警告信息:', warning);
console.error('❌ 錯誤信息:', error);

// 在 store 中使用
console.log('📦 Store 狀態更新:', newState);
```

### 性能優化

#### 載入性能

- 使用懶載入減少初始載入時間
- 優化圖片和資源大小
- 使用 CDN 加速資源載入

#### 運行性能

- 使用 `computed` 屬性避免重複計算
- 使用 `v-memo` 優化列表渲染
- 適當使用 `nextTick` 處理 DOM 更新

```javascript
// 性能優化範例
const expensiveComputation = computed(() => {
  // 複雜計算邏輯
  return processData(rawData.value);
});
```

## 🤝 貢獻指南

### 如何貢獻

1. **Fork 本專案**

   ```bash
   # 在 GitHub 上 Fork 專案
   ```

2. **創建功能分支**

   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **提交變更**

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **推送到分支**

   ```bash
   git push origin feature/AmazingFeature
   ```

5. **開啟 Pull Request**

### 代碼規範

- **遵循現有的代碼風格**
- **添加適當的註解和文檔**（必須包含完整的 JSDoc 註解）
- **確保代碼通過 ESLint 檢查**
- **編寫測試用例（如果適用）**
- **更新相關文檔**

### 📝 代碼註解規範

本專案特別重視代碼註解品質，所有貢獻都必須遵循以下註解規範：

#### 必須包含的註解元素

1. **檔案層級註解**

   - 模組功能說明
   - 主要特點列表
   - 技術棧說明
   - 版本和作者資訊

2. **函數/方法註解**

   - 功能描述（中英文對照）
   - 參數說明（包含類型、預設值、是否必填）
   - 返回值說明
   - 拋出的錯誤
   - 使用範例（至少一個）
   - 注意事項（如有）

3. **組件註解**

   - 組件用途和特點
   - Props 說明
   - Events 說明
   - Slots 說明（如有）
   - 使用範例

4. **複雜邏輯註解**
   - 演算法說明
   - 為什麼這樣實現
   - 可能的替代方案
   - 效能考量

#### 註解品質標準

✅ **良好的註解範例**：

```javascript
/**
 * 📊 計算圖層統計數據 (Calculate Layer Statistics)
 *
 * 根據圖層的節點數據計算各種統計信息，包括最小值、最大值、
 * 平均值等。該函數支援多種數據類型，並提供詳細的統計結果。
 *
 * 🎯 主要功能：
 * - 計算基本統計量（最小值、最大值、平均值）
 * - 處理異常數據和空值
 * - 提供百分位數計算
 *
 * @param {Array<Object>} nodes - 節點數據陣列
 * @param {string} [field='value'] - 要統計的欄位名稱
 * @returns {Object} 統計結果對象
 * @returns {number} returns.min - 最小值
 * @returns {number} returns.max - 最大值
 * @returns {number} returns.avg - 平均值
 * @returns {number} returns.count - 數據點數量
 *
 * @throws {Error} 當 nodes 不是陣列時拋出錯誤
 *
 * @example
 * // 基本使用
 * const stats = calculateLayerStatistics(layerNodes);
 * console.log(`平均值: ${stats.avg}`);
 *
 * // 指定欄位
 * const priceStats = calculateLayerStatistics(items, 'price');
 *
 * @since 1.0.0
 * @see {@link processLayerData} 相關的數據處理函數
 */
function calculateLayerStatistics(nodes, field = 'value') {
  // 實現...
}
```

❌ **不良的註解範例**：

```javascript
// 計算統計
function calc(data) {
  // 實現...
}
```

#### 註解維護指南

1. **新增代碼時**

   - 必須同時編寫完整的註解
   - 註解應該在代碼編寫過程中完成，而非事後補充

2. **修改代碼時**

   - 必須同步更新相關註解
   - 檢查註解是否還準確描述當前邏輯

3. **重構代碼時**

   - 重新檢視所有相關註解
   - 更新過時的使用範例
   - 確保架構說明仍然正確

4. **審查代碼時**
   - 註解品質是審查的重要標準
   - 不完整的註解應該要求補充
   - 錯誤的註解比沒有註解更糟糕

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

**範例：**

```
feat: 添加圖層篩選功能
fix: 修復響應式佈局問題
docs: 更新 API 文檔
style: 調整按鈕樣式
refactor: 重構數據處理邏輯
```

### 測試指南

#### 手動測試

1. **功能測試**：確保所有功能正常工作
2. **響應式測試**：在不同設備上測試佈局
3. **瀏覽器兼容性**：在主要瀏覽器中測試
4. **性能測試**：檢查載入和運行性能

#### 自動化測試

```bash
# 運行測試（如果有配置）
npm run test

# 運行代碼檢查
npm run lint

# 運行格式化檢查
npm run prettier:check
```

### 文檔更新

貢獻時請確保更新相關文檔：

- **README.md**：更新功能說明和安裝指南
- **API 文檔**：更新 API 接口說明
- **代碼註解**：添加或更新 JSDoc 註解
- **變更日誌**：記錄重要變更

## 📄 授權條款

本專案採用 MIT 授權條款。詳見 [LICENSE](LICENSE) 文件。

### MIT 授權條款摘要

- ✅ **商業使用**：允許商業用途
- ✅ **修改**：允許修改和分發
- ✅ **分發**：允許分發
- ✅ **私人使用**：允許私人使用
- ❌ **責任**：不提供任何責任擔保
- ❌ **保證**：不提供任何保證

## 📞 聯絡資訊

- **作者：** Kevin Cheng
- **電子郵件：** kevin7261@gmail.com
- **GitHub：** [@kevin7261](https://github.com/kevin7261)
- **專案網址：**
  [https://kevin7261.github.io/schematic-map-rwd](https://kevin7261.github.io/schematic-map-rwd)

## 🙏 致謝

感謝以下開源專案和工具的支持：

- [Vue.js](https://vuejs.org/) - 優秀的前端框架
- [D3.js](https://d3js.org/) - 強大的數據視覺化庫
- [Bootstrap](https://getbootstrap.com/) - 響應式 UI 框架
- [Pinia](https://pinia.vuejs.org/) - 現代化狀態管理
- [Font Awesome](https://fontawesome.com/) - 豐富的圖示庫
- [GitHub Pages](https://pages.github.com/) - 免費的靜態網站託管

## 📈 專案統計

- **⭐ Stars:**
  [![GitHub stars](https://img.shields.io/github/stars/kevin7261/schematic-map-rwd?style=social)](https://github.com/kevin7261/schematic-map-rwd/stargazers)
- **🍴 Forks:**
  [![GitHub forks](https://img.shields.io/github/forks/kevin7261/schematic-map-rwd?style=social)](https://github.com/kevin7261/schematic-map-rwd/network)
- **🐛 Issues:**
  [![GitHub issues](https://img.shields.io/github/issues/kevin7261/schematic-map-rwd)](https://github.com/kevin7261/schematic-map-rwd/issues)
- **📝 License:**
  [![GitHub license](https://img.shields.io/github/license/kevin7261/schematic-map-rwd)](https://github.com/kevin7261/schematic-map-rwd/blob/main/LICENSE)

---

**⭐ 如果這個專案對您有幫助，請給它一個星標！**

**📧 如有任何問題或建議，歡迎透過 GitHub Issues 或電子郵件聯繫我們。**
