/**
 * 🗺️ defineStore.js - 地圖底圖與視圖狀態管理存儲
 *
 * 功能說明：
 * 1. 🗺️ 管理地圖底圖的選擇和配置
 * 2. 📍 管理地圖視圖的中心點和縮放等級
 * 3. 🌍 提供多種底圖選項（OSM、Esri、Google、國土規劃中心等）
 * 4. 🎨 支援不同風格的底圖（街道、衛星、地形、暗色、亮色等）
 * 5. 🔧 提供底圖切換和視圖更新的操作方法
 *
 * 設計理念：
 * - 使用 Options API 提供清晰的狀態結構
 * - 集中管理所有底圖相關的配置和狀態
 * - 支援多種地圖服務提供商的底圖
 * - 提供靈活的底圖切換功能
 *
 * @store useDefineStore
 * @version 1.0.0
 */

import { defineStore } from 'pinia';

export const useDefineStore = defineStore('define', {
  /**
   * 🏗️ 狀態定義 (State Definition)
   * 定義底圖選擇、地圖視圖和底圖配置的狀態
   */
  state: () => ({
    /** 🗺️ 當前選中的底圖標識符 */
    selectedBasemap: 'carto_light_labels', // 預設使用 Carto Light 底圖

    /** 📍 地圖視圖狀態 */
    mapView: {
      center: [23.0131242, 120.2014438], // 地圖中心點 [緯度, 經度] - 台南市中心
      zoom: 12, // 縮放等級
    },
    /** 🌍 底圖配置陣列 - 支援多種地圖服務提供商 */
    basemaps: [
      // 🌐 OpenStreetMap 系列
      {
        label: 'OpenStreetMap', // 顯示名稱
        value: 'osm', // 內部標識符
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // 圖磚服務 URL
      },

      // 🗺️ Esri 系列底圖
      {
        label: 'Esri Street', // Esri 街道地圖
        value: 'esri_street',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      },
      {
        label: 'Esri Topo', // Esri 地形圖
        value: 'esri_topo',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      },
      {
        label: 'Esri World Imagery', // Esri 世界衛星影像
        value: 'esri_imagery',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      },

      // 🌏 Google Maps 系列
      {
        label: 'Google Maps 街道', // Google Maps 街道地圖
        value: 'google_road',
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      },
      {
        label: 'Google Maps 衛星', // Google Maps 衛星影像
        value: 'google_satellite',
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      },

      // 🇹🇼 台灣國土規劃中心系列
      {
        label: '國土規劃中心電子地圖', // 台灣官方電子地圖
        value: 'nlsc_emap',
        url: 'https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}',
      },
      {
        label: '國土規劃中心正射影像', // 台灣官方正射影像
        value: 'nlsc_photo',
        url: 'https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}',
      },

      // 🏔️ 地形圖系列
      {
        label: '地形圖', // OpenTopoMap 地形圖
        value: 'terrain',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      },

      // 🎨 Carto 設計師底圖系列
      {
        label: 'Carto Light', // Carto 淺色底圖（預設選項）
        value: 'carto_light_labels',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      },
      {
        label: 'Carto Dark', // Carto 深色底圖
        value: 'carto_dark_labels',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      },
      {
        label: 'Carto Voyager', // Carto Voyager 風格底圖
        value: 'carto_voyager',
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      },

      // 🎨 純色底圖系列（用於特殊顯示需求）
      {
        label: '白色地圖', // 純白色背景（無圖磚）
        value: 'blank',
        url: '',
      },
      {
        label: '黑色底圖', // 純黑色背景（無圖磚）
        value: 'black',
        url: '',
      },
    ],
  }),

  /**
   * 🎬 操作方法 (Actions)
   * 定義修改狀態的方法，提供底圖切換和視圖更新功能
   */
  actions: {
    /**
     * 🗺️ 設定選中的底圖
     * 更新當前使用的底圖類型
     * @param {string} value - 底圖的標識符（對應 basemaps 中的 value）
     * @example setSelectedBasemap('carto_dark_labels')
     */
    setSelectedBasemap(value) {
      this.selectedBasemap = value;
    },

    /**
     * 📍 設定地圖視圖
     * 同時更新地圖的中心點和縮放等級
     * @param {Array} center - 地圖中心座標 [緯度, 經度]
     * @param {number} zoom - 縮放等級 (1-20)
     * @example setMapView([23.0131242, 120.2014438], 14)
     */
    setMapView(center, zoom) {
      this.mapView.center = center;
      this.mapView.zoom = zoom;
    },
  },
});
