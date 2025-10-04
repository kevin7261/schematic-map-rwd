# 📦 Package.json 詳細文檔

## 📋 概述

本文檔詳細說明了 `package.json` 文件中的各個配置項和依賴項的目的和用途。

## 🚀 腳本命令 (Scripts)

### 開發相關

- **`serve`**: 啟動開發伺服器，在 8080 端口運行
- **`build`**: 建置生產版本，生成 dist 目錄

### 代碼品質

- **`lint`**: 檢查程式碼品質，使用 ESLint 規則
- **`lint:fix`**: 自動修復 ESLint 可修復的問題
- **`prettier`**: 使用 Prettier 格式化所有程式碼檔案
- **`prettier:check`**: 檢查程式碼格式是否符合 Prettier 規範
- **`format`**: 組合命令：先格式化再修復程式碼品質問題

### 部署相關

- **`predeploy`**: 部署前準備：建置生產版本
- **`deploy`**: 部署到 GitHub Pages，使用 gh-pages 工具

## 📦 生產依賴 (Dependencies)

### 核心框架

- **`vue`**: Vue 3 前端框架，提供響應式數據綁定和組件化開發
- **`vue-router`**: Vue Router 4 路由管理庫，提供單頁應用路由功能
- **`pinia`**: Pinia 狀態管理庫，Vue 3 官方推薦的狀態管理解決方案

### UI 和樣式

- **`bootstrap`**: Bootstrap 5 UI 框架，提供響應式佈局和組件
- **`@fortawesome/fontawesome-free`**: Font Awesome 圖標庫，提供豐富的圖標字體

### 數據視覺化

- **`d3`**: D3.js 數據視覺化庫，用於繪製示意圖和圖表

### 兼容性

- **`core-js`**: JavaScript 標準庫 polyfill，確保舊瀏覽器兼容性

## 🛠️ 開發依賴 (DevDependencies)

### 編譯和轉譯

- **`@babel/core`**: Babel 核心編譯器，用於 JavaScript 轉譯
- **`@babel/eslint-parser`**: Babel ESLint 解析器，支援現代 JavaScript 語法
- **`@vue/cli-plugin-babel`**: Vue CLI Babel 插件，整合 Babel 轉譯功能

### Vue 開發工具

- **`@vue/cli-service`**: Vue CLI 服務，提供開發和建置功能
- **`@vue/cli-plugin-eslint`**: Vue CLI ESLint 插件，整合程式碼品質檢查

### 代碼品質工具

- **`eslint`**: ESLint 程式碼品質檢查工具
- **`eslint-plugin-vue`**: ESLint Vue 插件，支援 Vue 單文件組件檢查
- **`eslint-config-prettier`**: ESLint Prettier 配置，避免與 Prettier 衝突
- **`eslint-plugin-prettier`**: ESLint Prettier 插件，整合程式碼格式化
- **`prettier`**: Prettier 程式碼格式化工具

### 部署工具

- **`gh-pages`**: GitHub Pages 部署工具
- **`html-webpack-plugin`**: HTML Webpack 插件，生成 HTML 檔案

## 🔍 ESLint 配置詳解

### 環境設定

- **`root: true`**: 設定為根配置，停止向上查找其他 ESLint 配置
- **`env`**: 指定程式碼運行環境，支援 Node.js 和 ES2022 語法

### 規則繼承

- **`extends`**: 繼承的 ESLint 規則集，包含 Vue 3 和推薦規則

### 解析器選項

- **`parser`**: 使用 Babel 解析器支援現代語法
- **`ecmaVersion`**: 支援 ES2022 語法
- **`sourceType`**: 模組類型

### 自定義規則

- **`prettier/prettier: "off"`**: 關閉 Prettier 規則，避免與 ESLint 衝突
- **`no-console: "warn"`**: console 語句警告而非錯誤，允許開發時使用
- **`no-debugger: "warn"`**: debugger 語句警告而非錯誤，允許調試時使用
- **`vue/multi-word-component-names: "off"`**: 關閉 Vue 組件名稱必須多詞的規則

## 🌐 瀏覽器支援

**`browserslist`**: 定義目標瀏覽器範圍

- `> 1%`: 市場佔有率大於 1% 的瀏覽器
- `last 2 versions`: 每個瀏覽器的最後兩個版本
- `not dead`: 排除不再維護的瀏覽器
- `not ie 11`: 排除 Internet Explorer 11

## 📝 注意事項

1. **JSON 格式限制**: `package.json` 是標準 JSON 格式，不支援註釋
2. **版本管理**: 使用語義化版本控制，確保依賴項的穩定性
3. **安全性**: 定期更新依賴項以修復安全漏洞
4. **性能**: 避免安裝不必要的依賴項以減少包大小

## 🔄 更新策略

### 定期更新

- 每月檢查依賴項更新
- 使用 `npm outdated` 檢查過期依賴
- 使用 `npm audit` 檢查安全漏洞

### 版本控制

- 生產依賴使用 `^` 前綴允許小版本更新
- 開發依賴可以更頻繁地更新
- 重大版本更新需要充分測試

## 📚 相關資源

- [npm Documentation](https://docs.npmjs.com/)
- [Vue CLI Documentation](https://cli.vuejs.org/)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
