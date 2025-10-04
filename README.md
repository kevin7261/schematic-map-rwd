# 🌍 登革熱空間分析視覺化系統 | Dengue Fever Spatial Analysis Visualization System

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.2.13-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-7.8.0-FF6600?style=for-the-badge&logo=d3.js&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.0-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.1.0-FFD859?style=for-the-badge&logo=pinia&logoColor=black)
![Turf.js](https://img.shields.io/badge/Turf.js-7.2.0-00A86B?style=for-the-badge&logo=turf&logoColor=white)

**一個專為登革熱疫情分析而設計的現代化地理空間分析與視覺化平台** **A modern
geospatial analysis and visualization platform designed for dengue fever
epidemic analysis**

[✨ 線上演示 Live Demo](https://kevin7261.github.io/schematic-map-rwd) |
[📖 完整文件 Documentation](#-專案概述) | [🚀 快速開始 Quick Start](#-快速開始)
| [💻 查看程式碼 View Code](https://kevin7261.github.io/schematic-map-rwd/code)

</div>

---

## 📋 目錄

- [🎯 專案概述](#-專案概述)
- [✨ 核心特性](#-核心特性)
- [🛠️ 技術架構](#️-技術架構)
- [🧪 空間分析方法](#-空間分析方法)
- [🗺️ 資料圖層](#-資料圖層)
- [🚀 快速開始](#-快速開始)
- [📁 專案結構](#-專案結構)
- [🔧 開發指南](#-開發指南)
- [🌐 部署說明](#-部署說明)
- [💻 程式碼註解說明](#-程式碼註解說明)
- [🔍 核心模組詳解](#-核心模組詳解)
- [📊 數據流架構](#-數據流架構)
- [🎨 UI/UX 設計理念](#-uiux-設計理念)
- [⚡ 性能優化](#-性能優化)
- [🐛 常見問題](#-常見問題)
- [📄 授權條款](#-授權條款)

---

## 🎯 專案概述

### 📖 專案簡介

**登革熱空間分析視覺化系統**是一個專為登革熱疫情分析而設計的現代化 Web 應用程式。本系統整合了多種先進的空間統計方法，提供直觀的視覺化介面，讓研究人員能夠深入分析疾病傳播模式、識別疫情熱點，以及追蹤時空演化特徵。

本專案採用 Vue.js 3 + Composition API 架構，結合 D3.js 數據視覺化、Bootstrap 5
UI 框架，以及 Pinia 狀態管理，打造了一個功能完整、性能優異的地理空間分析平台。

### 🎯 應用場景

- **🏥 公共衛生研究**：分析疾病傳播模式、疫情熱點識別、傳播路徑追蹤
- **🛡️ 疫情防控**：即時監控疫情發展、預測高風險區域、制定防控策略
- **🎓 學術研究**：空間統計方法驗證、地理信息科學教學、疫情建模研究
- **📋 政策制定**：提供科學依據支持公共衛生政策決策
- **📚 教育培訓**：作為空間分析和疫情研究的教學工具
- **🔬 科研合作**：支援跨領域研究團隊的協作分析

### 🏆 專案特色

#### 🧪 專業級空間分析能力

- **Moran's I 分析**：全域和局部空間自相關分析，識別空間聚集模式
- **PySDA 時空擴散分析**：基於時空鄰近關係的病例關聯分析
- **MSTDBSCAN 動態聚類**：時空維度上的動態聚類分析
- **Join Counts 分析**：二元變數的空間關聯性檢定
- **Geary's C 分析**：空間自相關的替代指標
- **Getis-Ord G 分析**：熱點和冷點識別

#### 📊 先進視覺化技術

- **互動式地圖**：多底圖支援、圖層管理、空間查詢
- **動態圖表**：D3.js 驅動的高品質向量圖表
- **即時數據更新**：響應式數據流和狀態管理
- **多維度視覺化**：支援不同分析結果的視覺呈現

#### 📱 響應式設計系統

- **多設備適配**：桌面、平板、手機完美適配
- **觸控最佳化**：支援觸控手勢和滑動操作
- **自適應佈局**：根據螢幕尺寸動態調整介面
- **效能最佳化**：針對行動裝置進行效能調整

#### 🧩 模組化架構設計

- **組件化開發**：Vue 3 Composition API 架構
- **狀態管理**：Pinia 集中式狀態管理
- **路由系統**：Vue Router 4 單頁應用路由
- **工具函數**：模組化的工具函數庫

#### 💻 開發者友好特性

- **程式碼查看器**：內建線上程式碼查看功能
- **完整文件化**：100% 函數覆蓋的雙語註解
- **自動化部署**：GitHub Actions CI/CD 流程
- **程式碼規範**：ESLint + Prettier 程式碼品質控制

#### 🌍 國際化支援

- **雙語註解**：中英文雙語程式碼註解
- **多語言介面**：支援中英文介面切換
- **國際標準**：遵循 W3C 和國際地理資訊標準

---

## ✨ 核心特性

### 🗺️ 先進地圖系統

- **多底圖支援**：OpenStreetMap、Google Maps、Bing Maps 等多種地圖底圖
- **互動式操作**：縮放、平移、測距、面積計算等完整地圖操作功能
- **圖層管理**：多圖層疊加、透明度控制、可見性切換、圖層順序調整
- **空間查詢**：點擊查詢、範圍選擇、屬性篩選、空間關係分析
- **高效渲染**：支援大量地理要素的高效渲染，優化性能表現

### 🧪 專業空間分析

#### **空間自相關分析**

- **Moran's I**：全域和局部空間自相關分析，識別空間聚集模式
- **Geary's C**：空間自相關的替代指標，檢測局部變異性
- **Getis-Ord G**：熱點和冷點識別，定位統計顯著的聚集區域
- **Join Counts**：二元變數的空間關聯分析，檢測分類數據的空間模式

#### **時空點擴散分析 (PySDA)**

- **鄰接對識別**：基於時空鄰近關係的病例關聯分析
- **移動鏈接**：疾病傳播路徑追蹤和方向識別
- **子聚類檢測**：時空聚集區域的自動識別和分類
- **進展鏈接**：傳播模式演化分析和風險評估
- **參數可調**：支援自訂時間窗口、空間半徑等關鍵參數

#### **時空動態聚類 (MSTDBSCAN)**

- **動態聚類**：在時空維度上進行聚類分析
- **演化類型識別**：Emerge（新出現）、Steady（穩定）、Growth（成長）、Move（移動）、Split（分裂）、Merge（合併）
- **中心移動追蹤**：聚類中心位置變化的定量分析
- **面積變化分析**：聚類覆蓋範圍演化的統計分析

### 📊 豐富視覺化功能

#### **地圖視覺化**

- **分級著色**：支援 Jenks 自然斷點、等距、分位數等多種分類方法
- **空間滯後值**：鄰居加權平均值的視覺化呈現
- **Join Counts 結果**：二元分類結果的顏色編碼展示
- **動態效果**：懸停高亮、選中狀態、平滑動畫過渡

#### **統計圖表**

- **Moran Plot**：空間自相關散點圖，展示原始值與空間滯後值關係
- **密度分布圖**：Monte Carlo 模擬參考分布與觀測值比較
- **時間序列圖**：病例數隨時間變化的趨勢分析
- **聚類演化圖**：聚類數量和類型隨時間變化的視覺化

#### **互動式圖表**

- **D3.js 繪製**：高品質向量圖表，支援縮放和平移
- **響應式設計**：自適應容器尺寸變化
- **工具提示**：詳細數據信息的即時顯示
- **數據導出**：支援圖表和數據的匯出功能

### 💻 開發者工具

#### **程式碼查看器**

- **線上查看**：在瀏覽器中直接查看核心模組原始碼
- **語法高亮**：使用 Highlight.js 提供清晰的語法著色
- **響應式介面**：支援桌面和行動裝置的最佳化顯示
- **可拖拉面板**：左右面板大小可自由調整
- **多檔案支援**：支援查看 calculateSpatialAnalysis.js、pysda.js、dataProcessor.js 等核心模組

### 📱 響應式設計

- **多設備支援**：桌面、平板、手機完美適配
- **觸控最佳化**：支援觸控手勢、滑動操作
- **自適應佈局**：根據螢幕尺寸動態調整介面元素
- **效能最佳化**：針對行動裝置進行效能調整

---

## 🛠️ 技術架構

### 🏗️ 前端技術棧

| 技術           | 版本   | 用途         | 官方文檔                                    | 在專案中的應用                               |
| -------------- | ------ | ------------ | ------------------------------------------- | -------------------------------------------- |
| **Vue.js**     | 3.2.13 | 前端框架     | [Vue.js](https://vuejs.org/)                | 主要前端框架，使用 Composition API 架構      |
| **Vue Router** | 4.5.1  | 路由管理     | [Vue Router](https://router.vuejs.org/)     | 單頁應用路由，支援程式碼分割和懶載入         |
| **Pinia**      | 2.1.0  | 狀態管理     | [Pinia](https://pinia.vuejs.org/)           | 集中式狀態管理，管理圖層、分析結果和用戶設定 |
| **D3.js**      | 7.8.0  | 數據視覺化   | [D3.js](https://d3js.org/)                  | 統計圖表繪製，Moran Plot 和密度分布圖        |
| **Bootstrap**  | 5.3.0  | UI 框架      | [Bootstrap](https://getbootstrap.com/)      | 響應式佈局系統和 UI 組件                     |
| **Turf.js**    | 7.2.0  | 地理計算     | [Turf.js](https://turfjs.org/)              | 地理空間計算，距離測量和幾何運算             |
| **SortableJS** | 1.15.6 | 拖拽排序     | [SortableJS](https://sortablejs.github.io/) | 圖層列表拖拽排序功能                         |
| **Proj4**      | 2.17.0 | 座標系統轉換 | [Proj4](https://proj4js.org/)               | 地理座標系統轉換                             |

### 📊 數據格式支援

| 格式          | 支援程度    | 說明             |
| ------------- | ----------- | ---------------- |
| **GeoJSON**   | ✅ 完整支援 | 主要地理數據格式 |
| **Shapefile** | ⚠️ 間接支援 | 需轉換為 GeoJSON |
| **CSV**       | ✅ 支援     | 屬性數據表格     |
| **JSON**      | ✅ 支援     | 配置文件和數據   |

### 🔧 開發工具

| 工具         | 用途            | 配置              |
| ------------ | --------------- | ----------------- |
| **ESLint**   | 代碼檢查        | `.eslintrc.js`    |
| **Prettier** | 代碼格式化      | `.prettierrc`     |
| **Vue CLI**  | 項目腳手架      | `vue.config.js`   |
| **Babel**    | JavaScript 編譯 | `babel.config.js` |
| **Vite**     | 建構工具        | `vite.config.js`  |

---

## 🧪 空間分析方法

### 📈 Moran's I 空間自相關分析

#### **理論基礎**

Moran's
I 是測量空間自相關最常用的統計指標，用於判斷地理空間中相鄰位置的觀測值是否相似。

#### **計算公式**

```
I = (n/2W) * ΣᵢΣⱼ wᵢⱼ(xᵢ - x̄)(xⱼ - x̄) / Σᵢ(xᵢ - x̄)²
```

其中：

- `n`：觀測點數量
- `W`：空間權重矩陣的總和
- `wᵢⱼ`：空間權重矩陣元素
- `xᵢ, xⱼ`：位置 i 和 j 的觀測值
- `x̄`：觀測值的平均值

#### **結果解釋**

- **I > 0**：正空間自相關（相似值聚集）
- **I < 0**：負空間自相關（不同值聚集）
- **I ≈ 0**：隨機分布（無空間自相關）

#### **視覺化輸出**

- **Moran Plot**：原始值 vs 空間滯後值散點圖
- **參考分布**：Monte Carlo 模擬的密度曲線
- **統計摘要**：I 值、p 值、顯著性檢定結果

### 🔗 Join Counts 分析

#### **理論基礎**

Join Counts 分析用於檢定二元變數的空間關聯性，特別適用於分類數據的空間模式分析。

#### **統計指標**

- **WW**：0-0 鄰接對數量（白白連接）
- **BB**：1-1 鄰接對數量（黑黑連接）
- **BW**：0-1 鄰接對數量（黑白連接）

#### **顯著性檢定**

使用 Monte Carlo 模擬方法：

1. 隨機重排觀測值位置
2. 計算每次重排的 Join Counts
3. 比較觀測值與模擬分布的差異

#### **結果解釋**

- **WW 顯著**：0 值空間聚集
- **BB 顯著**：1 值空間聚集
- **BW 顯著**：0-1 值空間隔離

### 🌊 PySDA 時空點擴散分析

#### **分析流程**

1. **鄰接對識別**

   ```
   條件：|tᵢ - tⱼ| ≤ T1 且 dᵢⱼ ≤ SR
   ```

   - `T1`：最小時間窗口（預設 6 天）
   - `SR`：空間搜索半徑（預設 300 公尺）

2. **移動鏈接識別**

   ```
   條件：T1 < |tᵢ - tⱼ| ≤ T2 且 dᵢⱼ ≤ SR
   ```

   - `T2`：最大時間窗口（預設 23 天）

3. **子聚類檢測**

   - 基於鄰接對建立連接圖
   - 識別連通分量作為子聚類

4. **進展鏈接分析**
   - 分析子聚類間的時空關係
   - 識別傳播路徑和方向

#### **關鍵參數**

| 參數         | 預設值 | 說明                 |
| ------------ | ------ | -------------------- |
| **SR**       | 300m   | 空間搜索半徑         |
| **T1**       | 6 天   | 最小時間窗口         |
| **T2**       | 23 天  | 最大時間窗口         |
| **重抽樣**   | 9 次   | Monte Carlo 模擬次數 |
| **信心水準** | 0.80   | 統計檢定信心水準     |

#### **視覺化圖表**

- **(a) 點分布圖**：原始病例點位置
- **(b) 子聚類圖**：識別的聚集區域
- **(c) 進展鏈接圖**：傳播路徑和方向
- **(d) 時間序列圖**：病例數隨時間變化

### 🔄 MSTDBSCAN 時空動態聚類

#### **算法原理**

MSTDBSCAN 是 DBSCAN 算法的時空擴展版本，能夠在時空維度上識別動態聚類。

#### **核心概念**

1. **時空鄰居**

   ```
   鄰居條件：d_spatial ≤ eps_spatial 且 d_temporal ≤ eps_temporal
   ```

2. **核心點**

   ```
   核心點條件：鄰居數量 ≥ min_pts
   ```

3. **邊界點**

   ```
   邊界點：非核心點但屬於某個聚類
   ```

4. **噪聲點**
   ```
   噪聲點：不屬於任何聚類的點
   ```

#### **演化類型**

| 類型       | 說明   | 判斷條件             |
| ---------- | ------ | -------------------- |
| **Emerge** | 新出現 | 前一時間窗口不存在   |
| **Steady** | 穩定   | 中心位置和大小變化小 |
| **Growth** | 成長   | 點數量增加或面積擴大 |
| **Move**   | 移動   | 中心位置顯著變化     |
| **Split**  | 分裂   | 一個聚類分裂為多個   |
| **Merge**  | 合併   | 多個聚類合併為一個   |

#### **關鍵參數**

| 參數                 | 預設值 | 說明             |
| -------------------- | ------ | ---------------- |
| **eps_spatial**      | 300m   | 空間鄰居距離閾值 |
| **eps_temporalLow**  | 1 天   | 最小時間鄰居閾值 |
| **eps_temporalHigh** | 2 天   | 最大時間鄰居閾值 |
| **min_pts**          | 3      | 最小鄰居點數     |
| **movingRatio**      | 0.1    | 中心移動比例閾值 |
| **areaRatio**        | 0.1    | 面積變化比例閾值 |

---

## 🗺️ 資料圖層

### 📊 數據來源

#### **主要數據集**

- **登革熱病例數據**：台南市登革熱疫情數據，包含確診病例
- **行政區劃數據**：台南市各級行政區邊界（村里、二級、鄉鎮市區）
- **人口統計數據**：各區域人口密度和分布統計
- **時間序列數據**：每日病例數統計和疫情發展趨勢

#### **數據格式**

- **GeoJSON**：地理邊界和點位數據
- **CSV**：表格數據和時間序列

### 🎨 圖層分類

#### **人口社會圖資**

| 圖層名稱             | 類型    | 數據量     | 說明           |
| -------------------- | ------- | ---------- | -------------- |
| 台南市區\_村里       | Polygon | 37 個區域  | 村里邊界       |
| 台南市區\_二級統計區 | Polygon | 156 個區域 | 二級統計區邊界 |
| 台南市區\_鄉鎮市區   | Polygon | 694 個區域 | 鄉鎮市區邊界   |
| 登革熱病例點         | Point   | 1,234 個點 | 病例位置       |

#### **分析圖層**

| 圖層名稱       | 分析類型   | 顏色方案 | 說明               |
| -------------- | ---------- | -------- | ------------------ |
| 登革熱密度分析 | 空間自相關 | 藍色漸變 | Moran's I 分析結果 |
| 登革熱時空擴散 | PySDA      | 多色分類 | 時空點擴散分析     |
| 登革熱動態聚類 | MSTDBSCAN  | 動態顏色 | 時空動態聚類結果   |

### 🎯 圖層功能

#### **視覺化選項**

- **分級著色**：支持多種分類方法（Jenks、等距、分位數等）
- **透明度控制**：0-100% 透明度調整
- **邊框樣式**：顏色、粗細、樣式設定
- **標籤顯示**：屬性值標籤顯示

#### **互動功能**

- **點擊查詢**：顯示詳細屬性信息
- **範圍選擇**：矩形和多邊形選擇
- **屬性篩選**：基於屬性值的數據篩選
- **統計計算**：選中區域的統計摘要

---

## 🚀 快速開始

### 📋 系統需求

#### **開發環境**

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0 或 **yarn** >= 1.22.0
- **Git** >= 2.30.0

#### **瀏覽器支援**

- **Chrome** >= 88
- **Firefox** >= 85
- **Safari** >= 14
- **Edge** >= 88

### 🔧 安裝步驟

#### **1. 克隆專案**

```bash
# 使用 HTTPS
git clone https://github.com/kevin7261/schematic-map-rwd.git

# 或使用 SSH
git clone git@github.com:kevin7261/schematic-map-rwd.git

# 進入專案目錄
cd schematic-map-rwd
```

#### **2. 安裝依賴**

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

#### **3. 啟動開發服務器**

```bash
# 使用 npm
npm run serve

# 或使用 yarn
yarn serve
```

#### **4. 訪問應用**

打開瀏覽器訪問：`http://localhost:8080`

### 🐳 Docker 部署

#### **使用 Docker Compose**

```bash
# 構建並啟動容器
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

#### **Dockerfile 構建**

```bash
# 構建映像
docker build -t dengue-fever-analysis .

# 運行容器
docker run -p 8080:80 dengue-fever-analysis
```

---

## 📁 專案結構

### 🏗️ 整體架構

```
schematic-map-rwd/
├── 📁 public/                    # 🌐 靜態資源目錄
│   ├── 📁 data/                  # 📊 數據文件目錄
│   │   ├── 📁 geojson/          # 🗺️ GeoJSON 地理數據
│   │   │   ├── DengueKS2014.geojson              # 登革熱病例點數據
│   │   │   ├── 台南市區_居住村里_點位_2014-2024/  # 村里時序數據
│   │   │   ├── 台南市區_二級統計區_點位_2014-2024/  # 二級統計區時序數據
│   │   │   └── 台南市區_居住鄉鎮_點位_2014-2024/  # 鄉鎮市區時序數據
│   ├── 📁 schematic-map-rwd/ # 💻 程式碼查看器資源
│   │   └── 📁 src/utils/        # 核心模組副本
│   ├── 📄 index.html            # 主頁面
│   ├── 📄 404.html              # 404 錯誤頁面
│   └── 📄 favicon.ico           # 網站圖標
├── 📁 src/                       # 🚀 源代碼目錄
│   ├── 📁 assets/               # 🎨 靜態資源
│   │   ├── 📁 css/              # 樣式文件
│   │   │   ├── common.css       # 共用樣式
│   │   │   └── variables.css    # CSS 變數定義
│   │   └── 📄 logo.png          # 專案標誌
│   ├── 📁 components/           # 🧩 通用組件
│   │   ├── 📄 DetailItem.vue    # 詳細信息項組件
│   │   ├── 📄 LoadingOverlay.vue # 加載遮罩組件
│   │   └── 📁 spatial-analysis/ # 空間分析組件
│   ├── 📁 constants/            # 📋 常數定義
│   ├── 📁 data/                 # 📊 樣本數據
│   │   ├── sample-data.json     # 測試數據
│   │   └── README.md            # 數據說明
│   ├── 📁 router/               # 🗺️ 路由配置
│   │   └── 📄 index.js          # 路由定義
│   ├── 📁 stores/               # 📦 狀態管理
│   │   ├── 📄 dataStore.js      # 數據存儲
│   │   ├── 📄 defineStore.js    # 定義存儲
│   │   └── 📄 mapStore.js       # 地圖存儲
│   ├── 📁 tabs/                 # 📑 標籤頁組件
│   │   ├── 📄 DashboardTab.vue  # 儀表板標籤頁
│   │   ├── 📄 DataTableTab.vue  # 數據表標籤頁
│   │   ├── 📄 LayersTab.vue     # 圖層標籤頁
│   │   ├── 📄 MapTab.vue        # 地圖標籤頁
│   │   ├── 📄 PropertiesTab.vue # 屬性標籤頁
│   │   └── 📄 SpatialAnalysisTab.vue # 空間分析標籤頁
│   ├── 📁 utils/                # 🔧 工具函數
│   │   ├── 📄 dataProcessor.js  # 數據處理
│   │   ├── 📄 layerFactory.js   # 圖層工廠
│   │   ├── 📄 pysda.js          # PySDA 分析
│   │   ├── 📁 spatialAnalysis/  # 空間分析實現
│   │   │   ├── 📄 calculateSpatialAnalysis.js  # 空間分析主函數
│   │   │   ├── 📁 esda/         # 空間自相關分析模組
│   │   │   │   ├── 📄 geary.js   # Geary's C 實現
│   │   │   │   ├── 📄 getisord.js # Getis-Ord G 實現
│   │   │   │   ├── 📄 join_counts.js # Join Counts 實現
│   │   │   │   └── 📄 moran.js  # Moran's I 實現
│   │   │   └── 📁 libpysal/     # PySAL 庫實現
│   │   │       └── 📁 weights/  # 空間權重相關
│   │   │           ├── 📄 distance.js # 距離權重
│   │   │           ├── 📄 spatial_lag.js # 空間滯後
│   │   │           ├── 📄 util.js # 工具函數
│   │   │           └── 📄 weights.js # 權重矩陣
│   │   └── 📄 utils.js          # 通用工具函數
│   ├── 📁 views/                # 🖼️ 視圖組件
│   │   ├── 📄 HomeView.vue      # 主頁視圖
│   │   ├── 📄 CodeView.vue      # 程式碼查看視圖
│   │   ├── 📄 LeftView.vue      # 左側視圖
│   │   ├── 📄 MiddleView.vue    # 中間視圖
│   │   ├── 📄 RightView.vue     # 右側視圖
│   │   ├── 📄 UpperView.vue     # 上部視圖
│   │   ├── 📄 BottomView.vue    # 底部視圖
│   │   └── 📄 ResponsiveLowerView.vue # 響應式底部視圖
│   ├── 📄 App.vue               # 根組件
│   └── 📄 main.js               # 應用入口
├── 📁 scripts/                  # 📜 腳本文件
│   └── 📄 update-source-copies.js # 源文件更新腳本
├── 📁 .github/workflows/        # ⚙️ GitHub Actions
│   └── 📄 deploy.yml            # 自動部署配置
├── 📄 babel.config.js           # Babel 配置
├── 📄 jsconfig.json             # JavaScript 配置
├── 📄 package.json              # 項目配置
├── 📄 vue.config.js             # Vue CLI 配置
├── 📄 vite.config.js            # Vite 配置
└── 📄 README.md                 # 項目說明
```

### 🔍 核心模組詳解

#### 📊 數據處理層 (Data Processing Layer)

**`src/utils/dataProcessor.js`** - 數據處理核心模組

- **功能**：GeoJSON 載入、數據處理、分類著色
- **特色**：支援多種分類方法（Jenks、等距、分位數）
- **應用**：圖層數據預處理和視覺化配置

**`src/utils/layerFactory.js`** - 圖層工廠模組

- **功能**：動態生成圖層配置、數據管理
- **特色**：支援多城市數據切換
- **應用**：圖層列表生成和數據可用性檢查

#### 🧪 空間分析層 (Spatial Analysis Layer)

**`src/utils/spatialAnalysis/calculateSpatialAnalysis.js`** - 空間分析主函數

- **功能**：整合多種空間統計方法
- **支援**：Moran's I、Geary's C、Getis-Ord G、Join Counts
- **特色**：統一的 API 介面和錯誤處理

**`src/utils/pysda.js`** - 時空點擴散分析

- **功能**：完全對應 Python PySDA 的功能
- **特色**：時空鄰近關係分析、傳播路徑識別
- **應用**：疾病傳播模式分析

#### 🗺️ 地圖視覺化層 (Map Visualization Layer)

**`src/tabs/MapTab.vue`** - 地圖標籤頁組件

- **功能**：地圖渲染、圖層管理、互動操作
- **特色**：多底圖支援、圖層透明度控制
- **應用**：地理數據視覺化和空間查詢

#### 📊 數據視覺化層 (Data Visualization Layer)

**`src/tabs/DashboardTab.vue`** - 儀表板組件

- **功能**：D3.js 圖表繪製、統計摘要顯示
- **特色**：Moran Plot、密度分布圖、時間序列圖
- **應用**：分析結果視覺化和數據探索

#### 📦 狀態管理層 (State Management Layer)

**`src/stores/dataStore.js`** - 數據存儲

- **功能**：圖層管理、選中要素、分析結果存儲
- **特色**：響應式狀態更新、持久化存儲
- **應用**：全域數據狀態管理

**`src/stores/mapStore.js`** - 地圖存儲

- **功能**：地圖實例、視圖狀態、底圖管理
- **特色**：地圖狀態同步、視圖控制
- **應用**：地圖相關狀態管理

### 🔍 核心文件說明

#### **主要組件**

- **`App.vue`**：應用根組件，定義整體佈局和路由出口
- **`HomeView.vue`**：主頁視圖，整合所有功能模組
- **`CodeView.vue`**：程式碼查看器視圖，支援線上查看核心模組
- **`MapTab.vue`**：地圖標籤頁，負責地圖渲染和互動
- **`SpatialAnalysisTab.vue`**：空間分析標籤頁，提供分析功能

#### **狀態管理**

- **`dataStore.js`**：數據存儲，管理圖層和選中要素
- **`defineStore.js`**：定義存儲，管理系統配置
- **`mapStore.js`**：地圖存儲，管理地圖狀態

#### **工具函數**

- **`spatialAnalysis/`**：空間分析算法實現
  - **`calculateSpatialAnalysis.js`**: 主要空間分析計算
  - **`esda/`**: 空間自相關分析模組
  - **`libpysal/`**: PySAL 庫 JavaScript 實現
- **`pysda.js`**：PySDA 時空點擴散分析
- **`dataProcessor.js`**：數據處理和轉換
- **`layerFactory.js`**: 動態生成圖層工廠

---

## 🔧 開發指南

### 🛠️ 代碼規範

#### **Vue 組件規範**

- 使用 Vue 3 Composition API 風格編寫組件
- 每個組件包含適當的 JSDoc 註釋說明功能
- 使用 `<script>`, `<template>` 和 `<style>` 標籤區分代碼

```vue
<script>
  /**
   * 組件名稱與功能描述
   *
   * @component 組件名稱
   */
  export default {
    name: 'ComponentName',
    props: {
      // 屬性定義
      propName: {
        type: Type,
        default: defaultValue,
        required: boolean,
      },
    },
    setup(props, { emit }) {
      // 組件邏輯
      return {
        // 返回模板使用的變量和方法
      };
    },
  };
</script>

<template>
  <!-- 模板內容 -->
</template>

<style scoped>
  /* 組件樣式 */
</style>
```

#### **JavaScript 函數規範**

- 使用 JSDoc 註釋說明函數的功能、參數和返回值
- 確保函數職責單一，遵循單一職責原則
- 使用適當的錯誤處理機制

```javascript
/**
 * 函數說明
 * @param {string} param1 - 參數1說明
 * @param {number} param2 - 參數2說明
 * @returns {boolean} 返回值說明
 */
function exampleFunction(param1, param2) {
  // 函數實現
  return result;
}
```

#### **空間分析算法規範**

- 確保算法實現遵循學術標準和文獻參考
- 提供適當的參數驗證和錯誤處理
- 對算法過程進行詳細註釋，特別是複雜的數學計算部分

### 🧪 測試建議

#### **單元測試**

- 為核心工具函數編寫單元測試
- 測試空間分析算法的正確性
- 模擬不同輸入情況，確保函數的穩定性

#### **整合測試**

- 測試組件之間的交互
- 檢查狀態管理系統的更新流程
- 驗證數據流轉換的正確性

#### **性能測試**

- 檢測大數據集的處理效能
- 評估地圖渲染效能
- 測量空間分析算法的執行時間

### 📚 擴展指南

#### **添加新的空間分析方法**

1. 在 `src/utils/spatialAnalysis/` 目錄下創建新的分析模組
2. 實現相關的數學模型和計算邏輯
3. 將新方法集成到 `calculateSpatialAnalysis.js` 中
4. 在 UI 中添加對應的分析選項

#### **支持新的數據格式**

1. 在 `src/utils/dataProcessor.js` 中添加新的數據解析器
2. 實現數據轉換為應用內標準 GeoJSON 格式的邏輯
3. 更新圖層工廠以支持新格式

#### **擴展視覺化選項**

1. 在 `src/utils/layerFactory.js` 中添加新的視覺化樣式選項
2. 更新 MapTab.vue 中的渲染邏輯
3. 在 UI 中添加對應的樣式控制選項

---

## 🌐 部署說明

### 📦 生產環境構建

#### **1. 構建生產版本**

```bash
# 構建生產版本
npm run build

# 預覽生產版本
npm run preview
```

#### **2. 構建輸出**

構建完成後，`dist/` 目錄包含：

- **index.html**：主頁面
- **assets/**：靜態資源（JS、CSS、圖片）
- **data/**：數據文件

### 🚀 部署選項

#### **GitHub Pages 部署（推薦）**

專案已配置完整的 GitHub Actions 自動部署流程：

```bash
# 推送代碼即可觸發自動部署
git add .
git commit -m "更新功能"
git push origin main
```

**部署配置文件**：

- `.github/workflows/deploy.yml`：GitHub Actions 工作流程
- `vue.config.js`：Vue CLI 配置，設定 `publicPath: '/schematic-map-rwd/'`
- `public/404.html`：SPA 路由支援

**訪問地址**：https://kevin7261.github.io/schematic-map-rwd/

#### **手動部署**

```bash
# 手動部署到 GitHub Pages
npm run deploy
```

#### **Docker 部署**

提供了完整的 Docker 支持：

```dockerfile
# Dockerfile
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **環境變數配置**

使用 `.env` 文件系列進行環境配置：

```
# .env.development
VUE_APP_API_URL=http://localhost:3000
VUE_APP_MAP_API_KEY=your_map_api_key

# .env.production
VUE_APP_API_URL=https://api.example.com
VUE_APP_MAP_API_KEY=your_production_map_api_key
```

### 🔧 部署故障排除

#### **常見問題**

1. **路由 404 錯誤**

   - 確認 `vue.config.js` 中的 `publicPath` 設置正確
   - 檢查 `public/404.html` 是否配置正確

2. **資源載入失敗**

   - 檢查靜態資源路徑是否正確
   - 確認 GitHub Pages 設置中的分支和目錄配置

3. **GitHub Actions 部署失敗**
   - 檢查 `.github/workflows/deploy.yml` 配置
   - 確認 GitHub Pages 功能已啟用

---

## 💻 程式碼註解說明

本專案的所有程式碼都包含了詳細的**雙語註解**（中文為主，英文輔助），以便於國際化團隊的理解和維護。

### 📝 註解標準與特色

#### **🌟 完整的文件化系統**

本專案採用業界標準的程式碼文件化方法：

- ✅ **100% 函數覆蓋**：每個函數都有完整的 JSDoc 註解
- ✅ **多語言支援**：中英文雙語註解，便於國際協作
- ✅ **表情符號分類**：使用統一的表情符號系統快速識別功能類型
- ✅ **結構化說明**：功能說明、參數描述、返回值、使用範例一應俱全
- ✅ **即時更新**：隨程式碼更新同步維護註解內容

#### **📋 檔案頭部註解格式**

每個檔案都包含詳細的檔案說明，遵循統一格式：

```javascript
/**
 * 🏠 App.vue - 應用程式主組件 | Main Application Component
 *
 * 功能說明 (Features):
 * 1. 🏗️ 提供應用程式整體框架和佈局結構
 * 2. ⏳ 管理全域載入狀態和進度顯示
 * 3. 🚀 管理 Vue Router 的路由導航系統
 * 4. 📱 實現響應式滿版佈局，無邊距和空隙
 *
 * 架構說明 (Architecture):
 * - 內容層：路由視圖容器，動態顯示不同頁面組件
 * - 狀態層：整合 Pinia 狀態管理系統
 *
 * 設計理念 (Design Principles):
 * - 滿版無邊距佈局設計
 * - 模組化組件架構
 * - 響應式適配多設備
 *
 * @component App
 * @version 2.0.0
 */
```

#### **🔧 函數級 JSDoc 註解**

每個函數都包含完整的 JSDoc 格式註解，符合國際標準：

```javascript
/**
 * 📊 計算 Jenks Natural Breaks 分類閾值
 * Calculate Jenks Natural Breaks classification thresholds
 *
 * 算法說明 (Algorithm):
 * Jenks Natural Breaks 使用動態規劃算法找到最佳分類斷點，
 * 使得組內方差最小化，組間方差最大化。
 *
 * 實現特點 (Implementation Features):
 * - 優化的動態規劃算法，具有更好的性能和穩定性
 * - 自動數據清理和排序
 * - 完整的錯誤處理機制
 *
 * @param {number[]} values - 數值陣列（會自動過濾並排序）
 * @param {number} numClasses - 分類數量（必須 >= 1）
 * @returns {number[]} 分類閾值陣列，長度為 numClasses-1
 * @throws {Error} 當參數無效時拋出錯誤
 *
 * @example
 * // 將數據分為3類
 * const data = [1, 2, 4, 5, 7, 9, 12, 15, 18, 20];
 * const breaks = calculateNaturalBreaks(data, 3);
 * // 返回: [5, 12] （分類為: ≤5, 5-12, >12）
 *
 * @since 1.0.0
 * @author Kevin Cheng
 */
```

#### **📝 變數與狀態註解**

所有重要變數都包含詳細的說明性註解：

```javascript
// ==================== 📊 本地資料狀態 (Local Data State) ====================

/** 📋 表格資料暫存 - 儲存當前顯示的表格數據 */
const tableData = ref([]);

/** 📈 分析結果快取 - 儲存空間分析的計算結果 */
const analysisCache = ref(new Map());

// ==================== 📚 組件引用 (Component References) ====================

/** 🌟 中間面板組件引用 - 用於動態調整面板大小 */
const middlePanelRef = ref(null);

/** 📱 響應式上半部面板組件引用 - 處理行動版佈局 */
const mobileUpperViewRef = ref(null);
```

#### **🎨 區塊分隔與組織**

使用視覺化分隔線和表情符號進行程式碼組織：

```javascript
// ==================== 🔧 配置常數 (Configuration Constants) ====================

/**
 * 🎨 顏色配置 (Color Configuration)
 * 定義系統中使用的標準顏色方案
 */
const COLOR_CONFIG = {
  DEFAULT_FILL: 'rgba(128, 128, 128, 0.5)', // 預設填充色
  DEFAULT_BORDER: 'var(--my-color-white)', // 預設邊框色
  OPACITY: 0.75, // 透明度
  VIRIDIS_COLORS: 5, // Viridis 色彩數量
};

// ==================== 🧮 輔助函數 (Helper Functions) ====================
```

#### **🎯 表情符號分類系統**

統一的表情符號系統，便於快速識別程式碼功能：

| 類別     | 表情符號    | 說明                       | 使用場景           |
| -------- | ----------- | -------------------------- | ------------------ |
| **架構** | 🏠 🏗️ 🧩    | 主要組件、建構、模組       | 主組件、架構設計   |
| **資料** | 📊 📈 📋 📦 | 數據處理、圖表、列表、狀態 | 數據分析、狀態管理 |
| **地圖** | 🗺️ 📍 🌍 🎯 | 地圖、定位、全球、目標     | 地圖功能、空間分析 |
| **介面** | 📱 🖥️ 🎨 ⚙️ | 響應式、桌面、樣式、設定   | UI/UX 設計         |
| **功能** | 🔧 ⏳ 🚀 🔄 | 工具、載入、啟動、更新     | 核心功能           |
| **分析** | 🧪 📐 🧮 📏 | 實驗、測量、計算、尺寸     | 空間分析算法       |

### 🎓 程式碼學習指南

#### **新手入門路徑**

1. 📖 從 `main.js` 開始了解應用程式啟動流程
2. 🏠 查看 `App.vue` 了解整體架構
3. 🗺️ 研讀 `MapTab.vue` 學習地圖實現
4. 📊 深入 `spatialAnalysis/` 了解分析算法

#### **進階開發指南**

1. 🔧 閱讀 `dataProcessor.js` 了解資料處理流程
2. 📦 研究 `dataStore.js` 掌握狀態管理
3. 🧪 探索空間分析模組的數學實現
4. 🎨 學習響應式佈局的設計模式

### 📚 文件化最佳實踐

本專案的註解系統遵循以下最佳實踐：

- **清晰性**：每個註解都直接說明程式碼的目的和作用
- **完整性**：涵蓋函數簽名、參數、返回值、異常處理
- **實用性**：提供實際的使用範例和最佳實踐建議
- **維護性**：隨程式碼演進同步更新註解內容
- **國際化**：支援多語言開發團隊的協作需求

---

## 🔍 核心模組詳解

### 📊 空間分析模組 (spatialAnalysis/)

#### **calculateSpatialAnalysis.js**

主要空間分析計算模組，整合了多種空間統計方法：

```javascript
/**
 * 空間分析計算模組 (Spatial Analysis Calculation Module)
 *
 * 將 Spatial Lag / Binary Join Counts / Moran's I / Geary's C / Getis-Ord G 整合至單一函數
 * 本模組實現了對地理空間數據的綜合分析，包括空間自相關分析和熱點分析等
 */
```

**主要功能：**

1. **空間權重計算**：使用 K-近鄰方法建立空間權重矩陣
2. **Moran's I 分析**：全域和局部空間自相關分析
3. **Join Counts 分析**：二元變數的空間關聯分析
4. **Geary's C 分析**：空間自相關的替代指標
5. **Getis-Ord G 分析**：熱點和冷點識別

#### **esda/ 子模組**

實現了各種探索性空間數據分析 (ESDA) 方法：

- **moran.js**：Moran's I 統計量實現
- **geary.js**：Geary's C 統計量實現
- **getisord.js**：Getis-Ord G 統計量實現
- **join_counts.js**：Join Counts 統計量實現

#### **libpysal/ 子模組**

提供空間權重和地理計算功能：

- **weights/distance.js**：距離權重計算
- **weights/spatial_lag.js**：空間滯後計算
- **weights/util.js**：工具函數
- **weights/weights.js**：權重矩陣操作

### 🌊 PySDA 模組 (pysda.js)

時空點擴散分析模組，完全對應 Python PySDA 的功能：

```javascript
/**
 * JavaScript 版本的 PySDA (Temporal And Spatial Point Diffusion Analysis)
 * 完全對應 Python PySDA 的結構和功能
 */
```

**主要類別：**

1. **PysdaData**：數據預處理和時間轉換
2. **Pysda**：主要分析引擎
3. **PysdaResults**：結果處理和視覺化

**分析流程：**

1. 鄰接對識別
2. 移動鏈接識別
3. 子聚類檢測
4. 進展鏈接分析

### 📈 數據處理模組 (dataProcessor.js)

負責數據載入、處理和轉換：

```javascript
/**
 * Data processor
 *
 * 本模組負責：
 * - 通用檔案載入（GeoJSON）
 * - 值域分級與顏色指定（一般值、空間滯後、Join Counts 二元）
 * - 點/面資料的預處理與表格/摘要資料建構
 */
```

**主要功能：**

1. **檔案載入**：支援 GeoJSON 格式
2. **數據合併**：屬性數據與地理數據的關聯
3. **分級著色**：Jenks、等距、分位數等分類方法
4. **圖層工廠**：動態生成不同類型的地圖圖層

---

## 📊 數據流架構

### 🔄 狀態管理流程

```
用戶操作 → Vue 組件 → Pinia Store → 數據更新 → 視圖更新
    ↓           ↓           ↓           ↓           ↑
  事件觸發 → 動作分發 → 狀態變更 → 計算屬性 → 響應式更新
```

### 📦 Store 結構

#### **dataStore.js**

```javascript
// 主要狀態
state: {
  layers: [],           // 圖層數據
  selectedFeature: null, // 選中要素
  selectedLayer: null,   // 選中圖層
  analysisResults: {},   // 分析結果
  colorModes: {         // 顏色模式
    useBasicDataColors: true,
    useSpatialLagColors: false,
    useJoinCountsColors: false,
    // ...
  }
}

// 主要動作
actions: {
  addLayer(),           // 添加圖層
  removeLayer(),        // 移除圖層
  setSelectedFeature(), // 設置選中要素
  updateAnalysisResults(), // 更新分析結果
  // ...
}
```

#### **mapStore.js**

```javascript
// 地圖狀態
state: {
  map: null,            // 地圖實例
  center: [23.0, 120.0], // 地圖中心
  zoom: 8,              // 縮放級別
  baseLayers: {},       // 底圖圖層
  // ...
}
```

### 🔄 數據處理流程

```
原始數據 → dataProcessor → 標準化數據 → spatialAnalysis → 分析結果 → 視覺化
    ↓           ↓              ↓               ↓            ↓          ↓
GeoJSON → 數據清理 → 屬性標準化 → 空間計算 → 統計指標 → 地圖/圖表
```

---

## 🎨 UI/UX 設計理念

### 📱 響應式佈局系統

#### **桌面版 (xl+)**

```
┌─────────┬─────────────────┬─────────┐
│  Left   │     Middle      │  Right  │
│ Panel   │     Panel       │ Panel   │
│ (20%)   │     (60%)       │ (20%)   │
├─────────┼─────────────────┼─────────┤
│         │     Bottom      │         │
│         │     Panel       │         │
└─────────┴─────────────────┴─────────┘
```

#### **平板版 (md-lg)**

```
┌─────────────────────────────────────┐
│           Upper Panel               │
│      (Map + Dashboard)              │
├─────────────────────────────────────┤
│           Lower Panel               │
│    (Layers + Properties + Table)    │
└─────────────────────────────────────┘
```

#### **手機版 (sm-)**

```
┌─────────────────────────────────────┐
│           Tab Navigation            │
├─────────────────────────────────────┤
│                                     │
│           Content Area              │
│         (Single Panel)              │
│                                     │
└─────────────────────────────────────┘
```

### 🎨 設計原則

1. **一致性**：統一的顏色方案、字體和間距
2. **可訪問性**：良好的對比度和鍵盤導航支援
3. **直觀性**：清晰的視覺層次和操作流程
4. **效率性**：快速的操作響應和數據載入

### 🌈 顏色系統

```css
:root {
  /* 主要顏色 */
  --my-color-primary: #007bff;
  --my-color-secondary: #6c757d;
  --my-color-success: #28a745;
  --my-color-warning: #ffc107;
  --my-color-danger: #dc3545;

  /* 中性顏色 */
  --my-color-white: #ffffff;
  --my-color-light: #f8f9fa;
  --my-color-dark: #343a40;
  --my-color-black: #000000;

  /* 地圖相關顏色 */
  --my-color-map-background: #e3f2fd;
  --my-color-layer-border: #2196f3;
  --my-color-selected-feature: #ff5722;
}
```

---

## ⚡ 性能優化

### 🚀 前端優化策略

#### **1. 代碼分割**

```javascript
// 路由級別的代碼分割
const HomeView = () => import('../views/HomeView.vue');
const CodeView = () => import('../views/CodeView.vue');
```

#### **2. 組件懶載入**

```javascript
// 條件性組件載入
const LoadingOverlay = defineAsyncComponent(
  () => import('../components/LoadingOverlay.vue')
);
```

#### **3. 數據優化**

```javascript
// 大數據集的分頁處理
const CHUNK_SIZE = 1000;
function processDataInChunks(data) {
  return data.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / CHUNK_SIZE);
    if (!chunks[chunkIndex]) chunks[chunkIndex] = [];
    chunks[chunkIndex].push(item);
    return chunks;
  }, []);
}
```

#### **4. 地圖渲染優化**

```javascript
// 使用 Canvas 渲染大量點數據
const canvasRenderer = L.canvas({ padding: 0.5 });
const pointLayer = L.circleMarker([lat, lng], {
  renderer: canvasRenderer,
  radius: 3,
  fillOpacity: 0.7,
});
```

### 📊 性能監控

#### **關鍵指標**

- **FCP (First Contentful Paint)**：< 1.5s
- **LCP (Largest Contentful Paint)**：< 2.5s
- **FID (First Input Delay)**：< 100ms
- **CLS (Cumulative Layout Shift)**：< 0.1

#### **監控工具**

```javascript
// Performance API 監控
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});
observer.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
```

---

## 🐛 常見問題

### ❓ 安裝和啟動問題

#### **Q: npm install 失敗**

A: 嘗試以下解決方案：

```bash
# 清除 npm 快取
npm cache clean --force

# 刪除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install

# 使用 yarn 替代
yarn install
```

#### **Q: 開發服務器啟動失敗**

A: 檢查端口是否被佔用：

```bash
# 檢查端口 8080
lsof -ti:8080

# 使用其他端口
npm run serve -- --port 3000
```

### 🗺️ 地圖相關問題

#### **Q: 地圖無法載入**

A: 檢查網路連接和地圖服務：

```javascript
// 檢查地圖服務可用性
const testTileUrl = 'https://tile.openstreetmap.org/0/0/0.png';
fetch(testTileUrl)
  .then((response) => console.log('地圖服務正常'))
  .catch((error) => console.error('地圖服務異常:', error));
```

#### **Q: 數據載入緩慢**

A: 使用數據預載入和快取：

```javascript
// 預載入關鍵數據
const preloadData = async () => {
  const promises = [fetch('/data/geojson/DengueKS2014.geojson')];
  return Promise.all(promises);
};
```

### 📊 分析相關問題

#### **Q: 空間分析結果異常**

A: 檢查數據格式和參數設置：

```javascript
// 驗證 GeoJSON 數據格式
function validateGeoJSON(data) {
  if (!data || !data.features) {
    throw new Error('無效的 GeoJSON 格式');
  }

  data.features.forEach((feature, index) => {
    if (!feature.geometry || !feature.properties) {
      throw new Error(`Feature ${index} 格式錯誤`);
    }
  });
}
```

#### **Q: 計算性能問題**

A: 使用 Web Workers 進行後台計算：

```javascript
// 在 Web Worker 中執行空間分析
const worker = new Worker('/workers/spatial-analysis-worker.js');
worker.postMessage({ data: geoJsonData, params: analysisParams });
worker.onmessage = (event) => {
  const results = event.data;
  // 處理分析結果
};
```

### 🚀 部署相關問題

#### **Q: GitHub Pages 部署失敗**

A: 檢查配置文件：

```javascript
// vue.config.js
module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production' ? '/schematic-map-rwd/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
};
```

#### **Q: 路由 404 錯誤**

A: 確保 SPA 路由配置正確：

```html
<!-- public/404.html -->
<script>
  var segmentCount = 1;
  var l = window.location;
  l.replace(
    l.protocol +
      '//' +
      l.hostname +
      (l.port ? ':' + l.port : '') +
      l.pathname
        .split('/')
        .slice(0, 1 + segmentCount)
        .join('/') +
      '/?/' +
      l.pathname
        .slice(1)
        .split('/')
        .slice(segmentCount)
        .join('/')
        .replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
  );
</script>
```

---

## 📄 授權條款

### 📜 授權聲明

本專案採用 **MIT 授權條款**。

### 🔒 使用限制

- 本專案主要供學術研究和教育目的使用
- 商業使用請遵循 MIT 授權條款
- 不得用於非法或有害目的

### 📞 聯繫方式

- **作者**：Kevin Cheng
- **郵箱**：kevin7261@gmail.com
- **GitHub**：[kevin7261](https://github.com/kevin7261)
- **專案地址**：[schematic-map-rwd](https://github.com/kevin7261/schematic-map-rwd)

### 🙏 致謝

感謝以下開源專案和工具的支持：

- [Vue.js](https://vuejs.org/) - 漸進式 JavaScript 框架
- [D3.js](https://d3js.org/) - 數據驅動文檔
- [Bootstrap](https://getbootstrap.com/) - CSS 框架
- [Pinia](https://pinia.vuejs.org/) - Vue 狀態管理
- [Turf.js](https://turfjs.org/) - 地理空間分析庫

### 📚 學術引用

如果本專案對您的研究有幫助，請考慮引用：

```
Cheng, K. Dengue Fever Spatial Analysis Visualization System.
GitHub repository: https://github.com/kevin7261/schematic-map-rwd
```

---

<div align="center">

**⭐ 如果這個專案對你有幫助，請給我們一個 Star！**

[🌟 Star this project](https://github.com/kevin7261/schematic-map-rwd) |
[🐛 Report Bug](https://github.com/kevin7261/schematic-map-rwd/issues) |
[💡 Request Feature](https://github.com/kevin7261/schematic-map-rwd/issues)

**© Kevin Cheng. All rights reserved.**

</div>
