<script>
  // 🔧 Vue Composition API 引入 (Vue Composition API Imports)
  import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'; // 引入 Vue 3 響應式 API
  import L from 'leaflet'; // 引入 Leaflet 地圖庫
  import 'leaflet/dist/leaflet.css'; // 引入 Leaflet 預設樣式
  import { useDataStore } from '@/stores/dataStore.js'; // 引入資料存儲
  import { useDefineStore } from '@/stores/defineStore.js'; // 引入定義存儲

  // 🔧 修復 Leaflet 預設圖標問題 (Fix Leaflet Default Icon Issues)
  import icon from 'leaflet/dist/images/marker-icon.png'; // 引入標準標記圖標
  import iconShadow from 'leaflet/dist/images/marker-shadow.png'; // 引入標記陰影圖標
  import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'; // 引入高解析度標記圖標

  // 刪除預設圖標 URL 獲取方法，避免 webpack 打包問題
  delete L.Icon.Default.prototype._getIconUrl;
  // 重新設定 Leaflet 預設圖標配置
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina, // 高解析度圖標 URL
    iconUrl: icon, // 標準圖標 URL
    shadowUrl: iconShadow, // 陰影圖標 URL
  });

  export default {
    name: 'MapTab', // 組件名稱

    // 🔧 組件屬性定義 (Component Props Definition)
    props: {
      zoomLevel: { type: Number, default: 11 }, // 地圖縮放等級，預設為 11
      isPanelDragging: { type: Boolean, default: false }, // 面板是否正在拖曳，預設為 false
    },

    // 📡 組件事件定義 (Component Events Definition)
    emits: ['update:zoomLevel', 'update:currentCoords', 'update:activeMarkers', 'feature-selected'],

    // 🔧 組件設定函數 (Component Setup Function)
    setup(props, { emit }) {
      // 📦 資料存儲實例 (Data Store Instance)
      const dataStore = useDataStore(); // 獲取 Pinia 資料存儲實例
      const defineStore = useDefineStore(); // 獲取定義存儲實例

      // 🗺️ 地圖相關變數 (Map Related Variables)
      const mapContainer = ref(null); // 地圖容器 DOM 元素引用
      let mapInstance = null; // 地圖實例，使用普通變數而非 ref 避免響應式開銷
      let currentTileLayer = null; // 當前底圖圖層實例
      let layerGroups = {}; // 存放所有圖層群組的物件
      // 圖層同步防抖計時器
      let syncTimeout = null;
      // 圖層可見性快取
      let layerVisibilityCache = new Map();

      // 🎛️ 地圖控制狀態 (Map Control States)
      const isMapReady = ref(false); // 地圖是否已準備就緒的狀態標記
      /** 🗺️ 動態地圖容器 ID（避免多實例衝突） */
      const mapContainerId = ref(`leaflet-map-${Math.random().toString(36).substr(2, 9)}`);

      // 📊 計算屬性：檢查是否有任何圖層可見 (Computed Property: Check if Any Layer is Visible)
      const isAnyLayerVisible = computed(
        () => dataStore.getMapLayers().some((l) => l.visible && l.geoJsonData) // 檢查地圖圖層中是否有可見且有資料的圖層
      );

      // 🏗️ 創建地圖實例函數 (Create Map Instance Function)
      const createMap = () => {
        // 檢查地圖實例是否已存在
        if (mapInstance && isMapReady.value) {
          return true; // 地圖已經創建並準備就緒
        }

        // 檢查地圖容器是否存在
        if (!mapContainer.value) return false;

        // 檢查容器是否已被 Leaflet 初始化
        if (mapContainer.value._leaflet_id) {
          // 容器已被初始化，先清理
          if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
          }
          // 清除 Leaflet 的內部標記
          delete mapContainer.value._leaflet_id;
          mapContainer.value.innerHTML = '';
        }

        // 檢查容器尺寸是否有效
        const rect = mapContainer.value.getBoundingClientRect(); // 獲取容器的邊界矩形
        if (rect.width === 0 || rect.height === 0) {
          // 如果寬度或高度為零，這是正常的初始化過程，不需要警告
          return false; // 返回失敗狀態
        }

        try {
          // 創建 Leaflet 地圖實例，使用 defineStore 中保存的視圖狀態
          mapInstance = L.map(mapContainer.value, {
            center: defineStore.mapView.center, // 使用保存的地圖中心點
            zoom: defineStore.mapView.zoom, // 使用保存的縮放等級
            zoomControl: false, // 禁用預設縮放控制項
            attributionControl: false, // 禁用預設版權資訊控制項
          });

          // 綁定地圖事件處理器
          mapInstance.on('zoomend', handleZoomEnd); // 縮放結束事件
          mapInstance.on('moveend', handleMoveEnd); // 移動結束事件

          // 綁定地圖點擊事件 - 點擊空白處清除選取
          mapInstance.on('click', function (e) {
            if (!e.originalEvent.target.closest('.leaflet-interactive')) {
              // 清除選取和所有highlight
              console.log('🗺️ 點擊空白處，清除所有選取和highlight');
              dataStore.setSelectedFeature(null);
              resetAllLayerStyles();
            }
          });

          // 移除分析圖層專用面板，讓圖層按加入順序自然顯示

          // 設定 popup 面板的 z-index
          mapInstance.getPane('popupPane').style.zIndex = 2200;

          // 設定地圖準備就緒狀態
          isMapReady.value = true; // 標記地圖已準備就緒

          // 地圖創建成功，僅在開發模式下記錄
          if (process.env.NODE_ENV === 'development') {
            console.log('[MapTab] 地圖創建成功');
          }
          return true; // 返回成功狀態
        } catch (error) {
          // 僅在開發模式下顯示詳細錯誤，避免用戶看到不必要的錯誤訊息
          if (process.env.NODE_ENV === 'development') {
            console.error('[MapTab] 地圖創建失敗:', error);
          }
          return false; // 返回失敗狀態
        }
      };

      // 📡 地圖事件處理函數 (Map Event Handler Functions)

      // 處理縮放結束事件
      const handleZoomEnd = () => {
        if (mapInstance) {
          // 確保地圖實例存在
          const zoom = mapInstance.getZoom();
          const center = mapInstance.getCenter();
          // 保存地圖視圖狀態到 defineStore
          defineStore.setMapView([center.lat, center.lng], zoom);
          emit('update:zoomLevel', zoom); // 發送縮放等級更新事件
        }
      };

      // 處理移動結束事件
      const handleMoveEnd = () => {
        if (mapInstance) {
          // 確保地圖實例存在
          const center = mapInstance.getCenter();
          const zoom = mapInstance.getZoom();
          // 保存地圖視圖狀態到 defineStore
          defineStore.setMapView([center.lat, center.lng], zoom);
          emit('update:currentCoords', center); // 發送座標更新事件
        }
      };

      // 🗺️ 設定底圖函數 (Set Basemap Function)
      const setBasemap = () => {
        // 檢查地圖實例和準備狀態
        if (!mapInstance || !isMapReady.value) return;

        // 步驟一：無論如何，都先移除舊的底圖圖層
        // 這樣可以確保在切換到「無底圖」時，舊的地圖會被正確清除。
        if (currentTileLayer) {
          mapInstance.removeLayer(currentTileLayer);
          currentTileLayer = null;
        }

        // 步驟二：查找新的底圖設定
        const config = defineStore.basemaps.find((b) => b.value === defineStore.selectedBasemap);

        // 步驟三：只有在找到設定檔(config)且 URL 不是空值(falsy)時，才加入新的圖層
        // 由於空字串 '' 是 falsy 值，這個判斷式會自動過濾掉 url 為 '' 的情況。
        if (config && config.url) {
          currentTileLayer = L.tileLayer(config.url, { attribution: '' });
          currentTileLayer.addTo(mapInstance);
        }

        // 動態設定地圖容器背景色
        const mapContainerElement = mapContainer.value;
        if (mapContainerElement) {
          if (defineStore.selectedBasemap === 'blank') {
            // 空白地圖時設為白色背景
            mapContainerElement.style.backgroundColor = 'var(--my-color-white)';
          } else if (defineStore.selectedBasemap === 'black') {
            // 全黑底圖時設為黑色背景
            mapContainerElement.style.backgroundColor = 'var(--my-color-gray-800)';
          } else {
            // 其他底圖時設為透明，讓底圖顯示
            mapContainerElement.style.backgroundColor = 'transparent';
          }
        }
      };

      // 🎨 創建要素圖層函數 (Create Feature Layer Function)
      const createFeatureLayer = (layer) => {
        // 檢查圖層是否有資料
        if (!layer.geoJsonData) return null;

        // 解構圖層屬性
        const { layerName, colorName, type } = layer; // 獲取圖層名稱、顏色和類型

        // 創建 GeoJSON 圖層
        const geoJsonLayer = L.geoJSON(layer.geoJsonData, {
          // 點要素轉換函數
          pointToLayer: (feature, latlng) => {
            if (type === 'point') {
              // 一般點類型
              const icon = L.divIcon({
                html: `<div
                class="rounded-circle"
                style="
                   background-color: var(--my-color-${colorName});
                   width: 8px;
                   height: 8px;
                   box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                 ">
                 </div>`, // HTML 內容：圓形標記
                className: '', // 移除不必要的 CSS 類名
                iconSize: [8, 8], // 圖標尺寸
                iconAnchor: [4, 4], // 圖標錨點
                popupAnchor: [0, -4], // 彈窗錨點
              });
              return L.marker(latlng, { icon }); // 返回標記實例
            }
            return null; // 非點類型返回 null
          },
          // 樣式設定函數
          style: (feature) => {
            // 只有polygon返回預設樣式物件
            if (layer.type == 'polygon') {
              //if (feature.properties.fillColor) {
              // 根據 dataStore 的狀態選擇使用哪種顏色
              let fillColor;
              if (dataStore.useJoinCountsColors && feature.properties.fillColor_joinCounts) {
                fillColor = feature.properties.fillColor_joinCounts;
              } else if (dataStore.useSpatialLagColors && feature.properties.fillColor_spatialLag) {
                fillColor = feature.properties.fillColor_spatialLag;
              } else if (
                dataStore.useInfectionRateColors &&
                feature.properties.fillColor_infectionRate
              ) {
                // 感染率使用專門的 fillColor_infectionRate
                fillColor = feature.properties.fillColor_infectionRate;
              } else if (dataStore.usePopulationColors && dataStore.selectedPopulationAttribute) {
                // 根據選中的人口屬性使用對應的顏色
                const attributeColorKey = `fillColor_${dataStore.selectedPopulationAttribute}`;
                fillColor = feature.properties[attributeColorKey] || feature.properties.fillColor;
              } else if (dataStore.useBasicDataColors && feature.properties.fillColor) {
                fillColor = feature.properties.fillColor;
              } else {
                fillColor = feature.properties.fillColor;
              }

              return {
                fillColor: fillColor, // 填充顏色
                weight: 0.5, // 邊框粗細
                opacity: 1, // 邊框透明度
                color: feature.properties.color || '#000000', // 邊框顏色
                fillOpacity: fillColor ? 0.6 : 0, // 填充透明度
              };
            }
          },
          // 每個要素的處理函數
          onEachFeature: (feature, layer) => {
            // 創建彈窗內容 HTML
            // const properties = Object.entries(feature.properties.popupData) // 獲取彈窗資料項目
            //   .map(
            //     ([key, value]) =>
            //       `<div class="pb-2">
            //          <div class="my-title-xs-gray pb-1">${key}</div>
            //          <div class="my-content-sm-black pb-1">${value}</div>
            //        </div>` // 格式化每個資料項目
            //   )
            //   .join(''); // 合併所有項目

            // 綁定彈窗到圖層
            // layer.bindPopup(`
            //   <div class="p-2">
            //     <div class="my-title-sm-gray pb-2">${layerName}</div>
            //     ${properties}
            //   </div>
            // `);

            // 檢查是否為人口分佈圖層，如果是則顯示 P_CNT
            const hasPopulation = feature.properties.popupData?.P_CNT !== undefined;
            const popupContent = hasPopulation
              ? `
                <div class="">
                  <div class="my-title-xs-gray pb-2">${layerName}</div>
                  <div class="my-content-sm-black pb-1">${feature.properties.name}</div>
                  <div class="my-title-xs-gray pb-2 pt-2">人口數</div>
                  <div class="my-content-sm-black pb-1">${feature.properties.popupData.P_CNT.toLocaleString()}</div>
                </div>
              `
              : `
                <div class="">
                  <div class="my-title-xs-gray pb-2">${layerName}</div>
                  <div class="my-content-sm-black">${feature.properties.name}</div>
                </div>
              `;

            layer.bindPopup(popupContent);

            // 綁定滑鼠事件
            layer.on({
              // 滑鼠懸停事件
              mouseover: function () {
                // 檢查是否已被選中
                const isSelected =
                  dataStore.selectedFeature &&
                  dataStore.selectedFeature.properties.id === feature.properties.id;

                console.log(`🖱️ mouseover: 要素${feature.properties.id}, 是否被選中:${isSelected}`);

                // 不管是否被選中，都應用highlight效果（選中的物件維持highlight，未選中的顯示hover效果）
                if (type === 'point') {
                  // 一般點類型處理
                  const element = this.getElement();
                  if (element) {
                    const innerIconDiv = element.querySelector('div');
                    if (innerIconDiv) {
                      innerIconDiv.style.transition = 'transform 0.04s ease-in-out';
                      innerIconDiv.style.transform = 'scale(1.6)';
                    }
                    if (isSelected) {
                      element.style.zIndex = 1000;
                    }
                  }
                } else if (type === 'polygon' && feature.properties.fillColor !== null) {
                  // 多邊形類型處理
                  if (!this._originalStyle) {
                    this._originalStyle = {
                      weight: this.options.weight,
                      color: this.options.color,
                      fillOpacity: this.options.fillOpacity,
                    };
                  }
                  // 獲取原始邊框顏色，使用更粗的同色邊框進行高亮
                  const originalColor = this.options.color || feature.properties.color || '#000000';
                  this.setStyle({
                    weight: 4,
                    color: originalColor,
                    fillOpacity: 0.8,
                  });
                  this.bringToFront();
                }
              },
              // 滑鼠離開事件
              mouseout: function () {
                // 只有在沒有被選中的情況下才恢復原始樣式
                const isSelected =
                  dataStore.selectedFeature &&
                  dataStore.selectedFeature.properties.id === feature.properties.id;

                console.log(`🖱️ mouseout: 要素${feature.properties.id}, 是否被選中:${isSelected}`);

                if (!isSelected) {
                  if (type === 'point') {
                    // 一般點類型處理
                    const element = this.getElement();
                    if (element) {
                      const innerIconDiv = element.querySelector('div');
                      if (innerIconDiv) {
                        innerIconDiv.style.transform = '';
                        innerIconDiv.style.transition = '';
                      }
                      // 重置z-index
                      element.style.zIndex = '';
                    }
                  } else if (type === 'polygon') {
                    // 多邊形類型處理
                    if (this._originalStyle) {
                      this.setStyle(this._originalStyle);
                    } else {
                      geoJsonLayer.resetStyle(this);
                    }
                  }
                } else {
                  // 如果物件被選中，確保保持highlight狀態
                  console.log(`🎯 保持選中物件${feature.properties.id}的highlight狀態`);
                  if (type === 'point') {
                    const element = this.getElement();
                    if (element) {
                      const innerIconDiv = element.querySelector('div');
                      if (innerIconDiv) {
                        innerIconDiv.style.transition = 'transform 0.04s ease-in-out';
                        innerIconDiv.style.transform = 'scale(1.6)';
                      }
                      element.style.zIndex = 1000;
                    }
                  } else if (type === 'polygon') {
                    if (!this._originalStyle) {
                      this._originalStyle = {
                        weight: this.options.weight,
                        color: this.options.color,
                        fillOpacity: this.options.fillOpacity,
                      };
                    }
                    // 獲取原始邊框顏色，使用更粗的同色邊框進行高亮
                    const originalColor =
                      this.options.color || feature.properties.color || '#000000';
                    this.setStyle({
                      weight: 4,
                      color: originalColor,
                      fillOpacity: 0.8,
                    });
                    this.bringToFront();
                  }
                }
              },
              // 點擊事件
              click: function () {
                console.log('🎯 點擊要素:', feature.properties.id);
                // 先清除所有現有的highlight
                resetAllLayerStyles();
                // 設定選中的要素到資料存儲
                dataStore.setSelectedFeature(feature);

                // 立即為選中的物件應用highlight效果
                if (type === 'point') {
                  // 點要素處理
                  const element = this.getElement();
                  if (element) {
                    const innerIconDiv = element.querySelector('div');
                    if (innerIconDiv) {
                      innerIconDiv.style.transition = 'transform 0.04s ease-in-out';
                      innerIconDiv.style.transform = 'scale(1.6)';
                    }
                    element.style.zIndex = 1000;
                  }
                } else if (type === 'polygon') {
                  // 面要素處理
                  if (!this._originalStyle) {
                    this._originalStyle = {
                      weight: this.options.weight,
                      color: this.options.color,
                      fillOpacity: this.options.fillOpacity,
                    };
                  }
                  // 獲取原始邊框顏色，使用更粗的同色邊框進行高亮
                  const originalColor = this.options.color || feature.properties.color || '#000000';
                  this.setStyle({
                    weight: 4,
                    color: originalColor,
                    fillOpacity: 0.8,
                  });
                  this.bringToFront();
                }

                emit('feature-selected', feature); // 發送要素選中事件
              },
            });
          },
        });

        return geoJsonLayer; // 返回創建的 GeoJSON 圖層
      };

      // 🔄 重設所有圖層樣式函數 (Reset All Layer Styles Function)
      const resetAllLayerStyles = () => {
        console.log('🔄 重設所有圖層樣式');
        Object.values(layerGroups).forEach((layerGroup) => {
          if (layerGroup) {
            layerGroup.eachLayer((layer) => {
              const feature = layer.feature;
              if (feature) {
                const layerData = dataStore.findLayerById(feature.properties.layerId);
                const type = layerData?.type;

                if (type === 'point') {
                  // 一般點類型處理
                  const element = layer.getElement();
                  if (element) {
                    const innerIconDiv = element.querySelector('div');
                    if (innerIconDiv) {
                      innerIconDiv.style.transform = '';
                      innerIconDiv.style.transition = '';
                    }
                    // 重置z-index
                    element.style.zIndex = '';
                  }
                } else if (type === 'polygon') {
                  // 多邊形類型處理
                  if (layer._originalStyle) {
                    layer.setStyle(layer._originalStyle);
                  } else if (layerGroup.resetStyle) {
                    layerGroup.resetStyle(layer);
                  }
                }
              }
            });
          }
        });
      };

      // 🔄 防抖同步圖層函數 (Debounced Sync Layers Function)
      const debouncedSyncLayers = () => {
        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }
        syncTimeout = setTimeout(() => {
          syncLayers();
          syncTimeout = null;
        }, 100); // 100ms 防抖延遲
      };

      // 🔄 同步圖層函數 (Sync Layers Function)
      const syncLayers = () => {
        // 檢查地圖實例和準備狀態
        if (!mapInstance || !isMapReady.value) return;

        // 獲取資料存儲中的所有圖層
        const storeLayers = dataStore.getMapLayers();
        // 獲取當前地圖上的圖層 ID 列表
        const currentLayerIds = Object.keys(layerGroups);
        // 篩選出可見且有資料的圖層
        // 對於面域分析圖層，需要額外檢查是否有任何顏色模式啟用
        const visibleLayers = storeLayers.filter((l) => {
          // 基本條件：圖層有資料
          if (!l.geoJsonData) return false;

          // 如果是面域分析圖層（非人口圖層），需要檢查是否有任何顏色模式啟用
          if (l.isAnalysisLayer && !l.isPopulationLayer) {
            // 面域分析圖層需要左側面板可見且右側面板有任一顏色模式啟用時才顯示
            const hasActiveColorMode =
              dataStore.useBasicDataColors ||
              dataStore.useSpatialLagColors ||
              dataStore.useJoinCountsColors ||
              dataStore.useInfectionRateColors;
            return l.visible && hasActiveColorMode;
          }

          // 如果是點位分析圖層，需要檢查基本數據模式是否啟用
          if (l.isPointCombinedLayer) {
            // 點位分析圖層需要左側面板可見且右側面板基本數據啟用時才顯示
            return l.visible && dataStore.useBasicDataColors;
          }

          // 如果是人口分佈圖層，需要檢查是否有任何顏色模式啟用
          if (l.isPopulationLayer || (l.layerName && l.layerName.includes('人口分佈'))) {
            // 人口分佈圖層需要左側面板可見且右側面板有任一顏色模式啟用時才顯示
            const hasActiveColorMode =
              dataStore.useBasicDataColors || dataStore.usePopulationColors;
            return l.visible && hasActiveColorMode;
          }

          // 其他圖層只需要左側面板可見
          return l.visible;
        });
        const visibleLayerIds = visibleLayers.map((l) => l.layerId);

        // 檢查是否有實際變化，避免不必要的同步
        const currentVisibleIds = Array.from(layerVisibilityCache.keys());
        const hasChanges =
          visibleLayerIds.length !== currentVisibleIds.length ||
          visibleLayerIds.some((id) => !currentVisibleIds.includes(id)) ||
          currentVisibleIds.some((id) => !visibleLayerIds.includes(id));

        if (!hasChanges) {
          return; // 沒有變化，跳過同步
        }

        // 更新快取
        layerVisibilityCache.clear();
        visibleLayerIds.forEach((id) => layerVisibilityCache.set(id, true));

        // 找出新增的圖層（不在當前地圖上但在可見列表中的圖層）
        const newLayerIds = visibleLayerIds.filter((id) => !currentLayerIds.includes(id));
        // 找出需要移除的圖層（在當前地圖上但不在可見列表中的圖層）
        const layersToRemove = currentLayerIds.filter((id) => !visibleLayerIds.includes(id));

        // 只在有實際變化時才輸出日誌
        if (newLayerIds.length > 0 || layersToRemove.length > 0) {
          console.log(
            `🔄 圖層同步: 新增 ${newLayerIds.length} 個, 移除 ${layersToRemove.length} 個`
          );
        }

        // 批量移除圖層，提高性能
        if (layersToRemove.length > 0) {
          layersToRemove.forEach((layerId) => {
            if (layerGroups[layerId]) {
              mapInstance.removeLayer(layerGroups[layerId]);
              delete layerGroups[layerId];
            }
          });
          console.log(`🗺️ 批量移除 ${layersToRemove.length} 個圖層`);
        }

        // 用於收集新添加的圖層，以便後續自動縮放
        const newAddedLayers = [];

        // 按照 layers 的反轉順序處理所有可見圖層（這樣第一個圖層會在最底層）
        visibleLayers
          .slice()
          .reverse()
          .forEach((layer) => {
            const { layerId } = layer;

            // 只有不存在的圖層才創建
            if (layerGroups[layerId]) return;

            try {
              const newLayer = createFeatureLayer(layer);
              if (newLayer) {
                newLayer.addTo(mapInstance);
                layerGroups[layerId] = newLayer;

                // 如果是新添加的圖層，收集起來用於自動縮放
                if (newLayerIds.includes(layerId)) {
                  newAddedLayers.push(newLayer);
                }

                console.log(`🗺️ 圖層 "${layer.layerName}" 已添加到地圖`);
              }
            } catch (error) {
              console.error(`添加圖層 "${layer.layerName}" 時發生錯誤:`, error);
            }
          });

        // 移除自動縮放功能 - 圖層打開時不自動縮放地圖
        // if (newAddedLayers.length > 0) {
        //   const bounds = new L.LatLngBounds();
        //   let hasValidBounds = false;

        //   newAddedLayers.forEach((layer) => {
        //     if (layer && layer.getBounds) {
        //       const layerBounds = layer.getBounds();
        //       if (layerBounds.isValid()) {
        //         bounds.extend(layerBounds);
        //         hasValidBounds = true;
        //       }
        //     }
        //   });

        //   if (hasValidBounds) {
        //     setTimeout(() => {
        //       mapInstance.fitBounds(bounds, { padding: [50, 50] });
        //       console.log(`🎯 自動縮放到新添加的 ${newAddedLayers.length} 個圖層範圍`);
        //     }, 200); // 稍微延遲確保圖層完全載入
        //   }
        // }

        // 計算並更新標記總數
        const totalMarkers = Object.values(layerGroups).reduce(
          (acc, layer) => acc + (layer.getLayers ? layer.getLayers().length : 0), // 累加每個圖層的要素數量
          0 // 初始值為 0
        );
        emit('update:activeMarkers', totalMarkers); // 發送標記數量更新事件

        console.log(`🗺️ 圖層同步完成，共 ${visibleLayers.length} 個可見圖層`); // 輸出同步完成訊息
      };

      // 🔍 顯示全部要素函數 (Show All Features Function) - 顯示圖面所有資料
      const showAllFeatures = () => {
        // 檢查地圖實例、準備狀態和圖層可見性
        if (!mapInstance || !isMapReady.value || !isAnyLayerVisible.value) return;

        // 創建邊界框物件用於計算所有要素的範圍
        const bounds = new L.LatLngBounds(); // 初始化 Leaflet 邊界框
        let hasValidBounds = false; // 標記是否有有效的邊界

        // 遍歷所有圖層群組計算邊界
        Object.values(layerGroups).forEach((layer) => {
          if (layer && layer.getBounds) {
            // 檢查圖層是否有 getBounds 方法
            const layerBounds = layer.getBounds(); // 獲取圖層邊界
            if (layerBounds.isValid()) {
              // 檢查邊界是否有效
              bounds.extend(layerBounds); // 擴展總邊界框
              hasValidBounds = true; // 標記有有效邊界
            }
          }
        });

        // 如果有有效邊界，調整地圖視圖以包含所有要素
        if (hasValidBounds) {
          mapInstance.fitBounds(bounds, { padding: [50, 50] }); // 設定地圖視圖並添加內邊距
        }
      };

      // 🌍 顯示全市函數 (Show Full City Function) - 回到預設地圖範圍
      const showFullCity = () => {
        // 檢查地圖實例和準備狀態
        if (!mapInstance || !isMapReady.value) return;

        // 使用固定的台北市預設範圍，不依賴當前存儲的值
        const defaultCenter = [23.0131242, 120.2014438]; // 台南市中心
        const defaultZoom = 12; // 適合台北市的縮放等級

        console.log(`🌍 顯示全市: 中心點 ${defaultCenter}, 縮放等級 ${defaultZoom}`);

        // 回到預設的地圖中心和縮放等級
        mapInstance.setView(defaultCenter, defaultZoom);

        // 同時更新 defineStore 中的值，保持一致性
        defineStore.setMapView(defaultCenter, defaultZoom);
      };

      // 🎯 高亮顯示特定要素函數 (Highlight Specific Feature Function)
      const highlightFeature = (highlightData) => {
        console.log('🎯 開始高亮顯示要素:', highlightData); // 輸出開始高亮的訊息

        // 檢查地圖是否準備就緒
        if (!mapInstance || !isMapReady.value) {
          console.warn('⚠️ 地圖尚未準備就緒，延遲執行高亮顯示'); // 輸出警告訊息
          setTimeout(() => highlightFeature(highlightData), 200); // 延遲 200ms 後重試
          return;
        }

        // 檢查是否有圖層群組
        if (!layerGroups || Object.keys(layerGroups).length === 0) {
          console.warn('⚠️ 圖層群組尚未載入，延遲執行高亮顯示'); // 輸出警告訊息
          setTimeout(() => highlightFeature(highlightData), 200); // 延遲 200ms 後重試
          return;
        }

        // 解析高亮資料
        let targetLayerId, targetFeatureId; // 宣告目標圖層 ID 和要素 ID

        // 檢查高亮資料是否為物件格式
        if (typeof highlightData === 'object' && highlightData !== null) {
          targetLayerId = highlightData.layerId; // 從物件中獲取圖層 ID
          targetFeatureId = highlightData.id; // 從物件中獲取要素 ID
        } else {
          targetFeatureId = highlightData; // 直接使用作為要素 ID
        }

        console.log(`🔍 尋找要素: layerId="${targetLayerId}", featureId="${targetFeatureId}"`); // 輸出搜尋資訊
        console.log('🔍 可用的圖層群組:', Object.keys(layerGroups)); // 輸出可用圖層列表

        // 執行高亮顯示的核心邏輯函數
        const performHighlight = () => {
          // 重置所有圖層樣式，確保只有一個物件被highlight
          resetAllLayerStyles();

          // 初始化目標要素搜尋變數
          let targetLayer = null; // 目標圖層實例
          let targetFeature = null; // 目標要素物件

          // 如果指定了圖層 ID，在特定圖層中搜尋
          if (targetLayerId && layerGroups[targetLayerId]) {
            console.log(`🔍 在指定圖層 "${targetLayerId}" 中尋找要素`); // 輸出搜尋訊息
            const specificLayerGroup = layerGroups[targetLayerId]; // 獲取指定圖層群組

            // 遍歷圖層中的每個要素
            specificLayerGroup.eachLayer((layer) => {
              const feature = layer.feature; // 獲取要素物件
              if (feature && feature.properties) {
                // 檢查要素是否有屬性
                // 獲取要素 ID
                const featureId = feature.properties.id;

                console.log(`🔍 檢查要素 ID: ${featureId} (目標: ${targetFeatureId})`); // 輸出檢查訊息

                // 比較要素 ID（轉換為字串進行比較）
                if (String(featureId) === String(targetFeatureId)) {
                  targetLayer = layer; // 設定目標圖層
                  targetFeature = feature; // 設定目標要素
                  console.log(`✅ 在圖層 "${targetLayerId}" 中找到要素 "${targetFeatureId}"`); // 輸出找到訊息
                  return;
                }
              }
            });
          } else {
            console.log('🔍 在所有圖層中尋找要素'); // 輸出搜尋訊息
            // 在所有圖層中尋找要素
            for (const [layerId, layerGroup] of Object.entries(layerGroups)) {
              console.log(`🔍 檢查圖層: ${layerId}`); // 輸出當前檢查的圖層
              // 遍歷圖層中的每個要素
              layerGroup.eachLayer((layer) => {
                const feature = layer.feature; // 獲取要素物件
                if (feature && feature.properties) {
                  // 檢查要素是否有屬性
                  const featureId = feature.properties.id; // 獲取要素 ID

                  console.log(`🔍 檢查要素 ID: ${featureId} (目標: ${targetFeatureId})`); // 輸出檢查訊息

                  // 比較要素 ID（轉換為字串進行比較）
                  if (String(featureId) === String(targetFeatureId)) {
                    targetLayer = layer; // 設定目標圖層
                    targetFeature = feature; // 設定目標要素
                    targetLayerId = layerId; // 設定目標圖層 ID
                    console.log(`✅ 在圖層 "${layerId}" 中找到要素 "${targetFeatureId}"`); // 輸出找到訊息
                    return;
                  }
                }
              });
              if (targetLayer) break; // 如果找到目標圖層，跳出迴圈
            }
          }

          // 如果找到目標圖層和要素，執行高亮顯示
          if (targetLayer && targetFeature) {
            // 設置選中的特徵到資料存儲
            dataStore.setSelectedFeature(targetFeature); // 更新選中要素狀態
            console.log('🎯 設置選中特徵到 store'); // 輸出設置訊息

            // 根據要素類型執行不同的高亮效果
            if (targetLayer.feature?.geometry?.type === 'Point') {
              // 點要素處理
              const element = targetLayer.getElement(); // 獲取 DOM 元素
              if (element) {
                // 找到圖標內部的樣式 div
                const innerIconDiv = element.querySelector('div');
                if (innerIconDiv) {
                  innerIconDiv.style.transition = 'transform 0.04s ease-in-out'; // 設定過渡動畫
                  innerIconDiv.style.transform = 'scale(1.6)'; // 放大效果
                }
                // 設定最高層級確保圖標在最上方
                element.style.zIndex = 1000;
              }
            } else {
              // 面要素處理
              // 面要素高亮 - 只對有 setStyle 方法的圖層調用
              if (targetLayer.setStyle) {
                if (targetLayer.feature?.properties?.fillColor) {
                  // 獲取原始邊框顏色，使用更粗的同色邊框進行高亮
                  const originalColor =
                    targetLayer.options?.color ||
                    targetLayer.feature?.properties?.color ||
                    '#000000';
                  targetLayer.setStyle({
                    weight: 4, // 增加邊框粗細
                    color: originalColor, // 使用原始顏色
                    fillOpacity: 0.8, // 增加填充透明度
                  });
                } else {
                  targetLayer.setStyle({
                    weight: 4, // 增加邊框粗細
                  });
                }
              }
            }

            // 將圖層置於最前方
            if (targetLayer.bringToFront) {
              // 檢查圖層是否有置前方法
              targetLayer.bringToFront(); // 將圖層移到最前方
            }

            // 定位到要素位置
            let bounds; // 宣告邊界變數
            if (targetLayer.getBounds) {
              // 如果圖層有 getBounds 方法（面要素）
              bounds = targetLayer.getBounds(); // 獲取圖層邊界
            } else if (targetLayer.getLatLng) {
              // 如果圖層有 getLatLng 方法（點要素）
              const latlng = targetLayer.getLatLng(); // 獲取點座標
              bounds = L.latLngBounds([latlng, latlng]); // 創建點的邊界框
            }

            // 如果有有效邊界，調整地圖視圖
            if (bounds && bounds.isValid()) {
              mapInstance.fitBounds(bounds, {
                maxZoom: 16, // 最大縮放等級限制
                padding: [50, 50], // 邊界內邊距
              });

              // 延遲打開彈窗以確保地圖移動完成
              setTimeout(() => {
                if (targetLayer.openPopup) {
                  // 檢查圖層是否有打開彈窗方法
                  targetLayer.openPopup(); // 打開彈窗
                }
              }, 500); // 延遲 500ms
            }

            console.log('✅ 顯示位置功能完成'); // 輸出完成訊息
            return true; // 返回成功狀態
          } else {
            // 如果未找到目標要素，輸出警告訊息
            console.warn(
              `❌ 找不到要素 "${targetFeatureId}"${targetLayerId ? ` 在圖層 "${targetLayerId}" 中` : ''}`
            );
            return false; // 返回失敗狀態
          }
        };

        // 嘗試執行高亮顯示，如果失敗則重試
        const success = performHighlight(); // 執行高亮顯示
        if (!success) {
          // 如果第一次失敗
          console.log('🔄 第一次高亮顯示失敗，1秒後重試...'); // 輸出重試訊息
          setTimeout(() => {
            const retrySuccess = performHighlight(); // 重試執行高亮顯示
            if (!retrySuccess) {
              // 如果重試仍失敗
              console.error('❌ 重試後仍無法高亮顯示要素'); // 輸出錯誤訊息
            }
          }, 1000); // 延遲 1 秒重試
        }
      };

      // 🔄 刷新地圖尺寸函數 (Invalidate Map Size Function)
      const invalidateSize = () => {
        // 檢查地圖實例和準備狀態
        if (mapInstance && isMapReady.value) {
          nextTick(() => {
            // 等待 DOM 更新完成
            try {
              // 檢查容器是否有效
              if (mapContainer.value) {
                const rect = mapContainer.value.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                  // 容器尺寸為零是正常的暫時狀態，不需要警告
                  // 如果容器尺寸為零，嘗試重新初始化
                  setTimeout(() => {
                    if (mapContainer.value) {
                      const newRect = mapContainer.value.getBoundingClientRect();
                      if (newRect.width > 0 || newRect.height > 0) {
                        mapInstance.invalidateSize();
                        console.log('🗺️ 地圖尺寸已重新初始化');
                      }
                    }
                  }, 100);
                  return;
                }
              }

              mapInstance.invalidateSize(); // 刷新地圖尺寸
              // 地圖尺寸刷新成功，僅在開發模式下記錄
              if (process.env.NODE_ENV === 'development') {
                console.log('🗺️ 地圖尺寸已刷新');
              }
            } catch (error) {
              console.error('❌ 刷新地圖尺寸時發生錯誤:', error); // 輸出錯誤訊息
            }
          });
        } else if (!mapInstance) {
          // 地圖實例不存在，嘗試重新初始化（正常的初始化流程）
          setTimeout(() => {
            initMap();
          }, 200);
        }
      };

      // 📏 設置 ResizeObserver 監聽容器大小變化 (Setup ResizeObserver)
      let resizeObserver = null; // 宣告 ResizeObserver 實例變數
      let resizeTimeout = null; // 防抖計時器

      const setupResizeObserver = () => {
        // 檢查容器存在且瀏覽器支援 ResizeObserver
        if (mapContainer.value && window.ResizeObserver) {
          // 創建 ResizeObserver 實例
          resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
              // 遍歷所有變化的元素
              // 容器大小變化是正常事件，僅在開發模式下記錄
              if (process.env.NODE_ENV === 'development') {
                console.log('🔄 地圖容器大小變化:', entry.contentRect);
              }

              // 使用防抖機制，避免短時間內多次觸發
              if (resizeTimeout) {
                clearTimeout(resizeTimeout);
              }

              resizeTimeout = setTimeout(() => {
                if (mapInstance && isMapReady.value) {
                  invalidateSize(); // 刷新地圖尺寸
                }
                resizeTimeout = null;
              }, 150); // 延遲 150ms，與 UpperView 的延遲保持一致
            }
          });
          resizeObserver.observe(mapContainer.value); // 開始觀察地圖容器
          console.log('✅ ResizeObserver 已設置'); // 輸出設置成功訊息
        }
      };

      // 🔄 切換底圖函數 (Change Basemap Function)
      const changeBasemap = (basemapType) => {
        defineStore.setSelectedBasemap(basemapType); // 使用 store action 更新底圖狀態
        setBasemap(); // 應用底圖變更
      };

      // 🏷️ 獲取底圖標籤函數 (Get Basemap Label Function)
      const getBasemapLabel = (value) => {
        // 從 defineStore 中獲取底圖標籤
        const basemap = defineStore.basemaps.find((b) => b.value === value);
        return basemap ? basemap.label : value;
      };

      // 🚀 初始化地圖函數 (Initialize Map Function)
      const initMap = () => {
        // 如果地圖已經初始化並準備就緒，直接返回
        if (mapInstance && isMapReady.value) {
          return;
        }

        let attempts = 0; // 初始化嘗試次數計數器
        const maxAttempts = 20; // 最大嘗試次數

        // 嘗試初始化函數
        const tryInit = () => {
          // 再次檢查是否已經初始化
          if (mapInstance && isMapReady.value) {
            return;
          }

          if (attempts >= maxAttempts) {
            // 如果超過最大嘗試次數，僅在開發模式下顯示錯誤
            if (process.env.NODE_ENV === 'development') {
              console.error('[MapTab] 地圖初始化超時');
            }
            return;
          }

          attempts++; // 增加嘗試次數

          if (createMap()) {
            // 嘗試創建地圖
            setBasemap(); // 設定底圖
            syncLayers(); // 同步圖層
          } else {
            setTimeout(tryInit, 100); // 延遲 100ms 後重試
          }
        };

        tryInit(); // 開始嘗試初始化
      };

      // 🔄 生命週期：組件掛載 (Lifecycle: Component Mounted)
      onMounted(() => {
        nextTick(() => {
          // 等待 DOM 更新完成
          setTimeout(() => {
            // 延遲執行確保容器準備就緒
            initMap(); // 初始化地圖
            // 地圖初始化完成後設置 ResizeObserver
            setTimeout(setupResizeObserver, 500); // 延遲 500ms 設置尺寸觀察器
          }, 100); // 延遲 100ms
        });
      });

      // 🧹 生命週期：組件卸載 (Lifecycle: Component Unmounted)
      onUnmounted(() => {
        // 清理 ResizeObserver 和相關計時器
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
          resizeTimeout = null;
        }

        // 清理圖層同步防抖計時器
        if (syncTimeout) {
          clearTimeout(syncTimeout);
          syncTimeout = null;
        }

        if (resizeObserver) {
          // 如果 ResizeObserver 存在
          resizeObserver.disconnect(); // 停止觀察
          resizeObserver = null; // 清空引用
          if (process.env.NODE_ENV === 'development') {
            console.log('🧹 ResizeObserver 已清理');
          }
        }

        // 清理地圖事件和實例
        if (mapInstance) {
          // 如果地圖實例存在
          mapInstance.off('zoomend', handleZoomEnd); // 移除縮放結束事件監聽器
          mapInstance.off('moveend', handleMoveEnd); // 移除移動結束事件監聽器
          mapInstance.remove(); // 移除地圖實例
          mapInstance = null; // 清空引用
        }

        // 清理容器的 Leaflet 標記
        if (mapContainer.value && mapContainer.value._leaflet_id) {
          delete mapContainer.value._leaflet_id;
          mapContainer.value.innerHTML = '';
        }

        // 清理圖層相關變數
        layerGroups = {}; // 清空圖層群組物件
        currentTileLayer = null; // 清空當前底圖圖層引用
        isMapReady.value = false; // 重設地圖準備狀態
      });

      // 👀 監聽器：監聽資料存儲中的圖層變化 (Watcher: Watch Data Store Layers)
      // 使用淺層監聽並手動觸發同步，避免深度監聽的性能問題
      watch(() => dataStore.layers, debouncedSyncLayers, { flush: 'post' }); // 使用防抖同步

      // 👀 監聽器：監聽底圖變化 (Watcher: Watch Basemap Changes)
      watch(
        () => defineStore.selectedBasemap,
        () => {
          if (isMapReady.value) {
            setBasemap(); // 當底圖變化時重新設定
          }
        }
      );

      // 👀 監聽器：監聽基本數據顏色模式變化 (Watcher: Watch Basic Data Color Mode Changes)
      watch(
        () => dataStore.useBasicDataColors,
        () => {
          if (isMapReady.value) {
            // 重新載入所有現有圖層以應用新的顏色模式
            const currentLayers = Object.keys(layerGroups);
            currentLayers.forEach((layerId) => {
              if (layerGroups[layerId]) {
                mapInstance.removeLayer(layerGroups[layerId]);
                delete layerGroups[layerId];
              }
            });
            syncLayers(); // 重新同步圖層
          }
        }
      );

      // 👀 監聽器：監聽空間滯後值顏色模式變化 (Watcher: Watch Spatial Lag Color Mode Changes)
      watch(
        () => dataStore.useSpatialLagColors,
        () => {
          if (isMapReady.value) {
            // 重新載入所有現有圖層以應用新的顏色模式
            const currentLayers = Object.keys(layerGroups);
            currentLayers.forEach((layerId) => {
              if (layerGroups[layerId]) {
                mapInstance.removeLayer(layerGroups[layerId]);
                delete layerGroups[layerId];
              }
            });
            syncLayers(); // 重新同步圖層
          }
        }
      );

      // 👀 監聽器：監聽 Join Counts 顏色模式變化 (Watcher: Watch Join Counts Color Mode Changes)
      watch(
        () => dataStore.useJoinCountsColors,
        () => {
          if (isMapReady.value) {
            // 重新載入所有現有圖層以應用新的顏色模式
            const currentLayers = Object.keys(layerGroups);
            currentLayers.forEach((layerId) => {
              if (layerGroups[layerId]) {
                mapInstance.removeLayer(layerGroups[layerId]);
                delete layerGroups[layerId];
              }
            });
            syncLayers(); // 重新同步圖層
          }
        }
      );

      // 👀 監聽器：監聽人口分析顏色模式變化 (Watcher: Watch Population Color Mode Changes)
      watch(
        [() => dataStore.usePopulationColors, () => dataStore.selectedPopulationAttribute],
        () => {
          if (isMapReady.value) {
            // 重新載入所有現有圖層以應用新的顏色模式
            const currentLayers = Object.keys(layerGroups);
            currentLayers.forEach((layerId) => {
              if (layerGroups[layerId]) {
                mapInstance.removeLayer(layerGroups[layerId]);
                delete layerGroups[layerId];
              }
            });
            syncLayers(); // 重新同步圖層
          }
        }
      );

      // 👀 監聽器：監聽感染率顏色模式變化 (Watcher: Watch Infection Rate Color Mode Changes)
      watch(
        () => dataStore.useInfectionRateColors,
        () => {
          if (isMapReady.value) {
            // 重新載入所有現有圖層以應用新的顏色模式
            const currentLayers = Object.keys(layerGroups);
            currentLayers.forEach((layerId) => {
              if (layerGroups[layerId]) {
                mapInstance.removeLayer(layerGroups[layerId]);
                delete layerGroups[layerId];
              }
            });
            syncLayers(); // 重新同步圖層
          }
        }
      );

      // 📤 返回組件公開的屬性和方法 (Return Component Public Properties and Methods)
      return {
        mapContainer, // 地圖容器 DOM 元素引用
        mapContainerId, // 動態地圖容器 ID
        selectedBasemap: computed(() => defineStore.selectedBasemap), // 選定的底圖類型響應式變數
        changeBasemap, // 切換底圖函數
        getBasemapLabel, // 獲取底圖標籤函數
        showAllFeatures, // 顯示全部要素函數
        showFullCity, // 顯示全市函數
        isAnyLayerVisible, // 檢查是否有可見圖層的計算屬性
        highlightFeature, // 高亮顯示特定要素函數
        invalidateSize, // 刷新地圖尺寸函數
        defineStore, // 定義存儲實例
      };
    },
  };
</script>

<template>
  <!-- 🗺️ 地圖主容器 (Main Map Container) -->
  <div id="map-container" class="h-100 w-100 position-relative">
    <!-- 🗺️ Leaflet 地圖容器 (Leaflet Map Container) -->
    <!-- 這是 Leaflet 地圖實際渲染的 DOM 元素 -->
    <div :id="mapContainerId" ref="mapContainer" class="h-100 w-100"></div>

    <!-- 地圖底部控制項區域 -->
    <div
      class="position-absolute map-bottom-controls d-flex align-items-center rounded-pill shadow my-blur gap-2 p-2 mb-3"
    >
      <div class="d-flex align-items-center">
        <div class="dropdown dropup">
          <button
            class="btn rounded-pill border-0 my-btn-transparent my-font-size-xs text-nowrap"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{ getBasemapLabel(selectedBasemap) }}
          </button>
          <ul class="dropdown-menu">
            <li v-for="basemap in defineStore.basemaps" :key="basemap.value">
              <a
                class="dropdown-item my-content-xs-black py-1"
                href="#"
                @click.prevent="changeBasemap(basemap.value)"
              >
                {{ basemap.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 顯示全部 -->
      <button
        class="btn rounded-pill border-0 my-btn-transparent my-font-size-xs text-nowrap my-cursor-pointer"
        @click="showAllFeatures"
        :disabled="!isAnyLayerVisible"
        title="顯示圖面所有資料範圍"
      >
        顯示全部
      </button>
    </div>
  </div>
</template>

<style scoped>
  /* 🗺️ 地圖容器樣式 (Map Container Styles) */
  #map-container {
    background-color: transparent; /* 預設透明，讓底圖顯示，空白地圖時由 JS 動態設定為白色 */
    z-index: 0; /* 確保地圖在左側面板陰影下方 */
  }

  /* 🗺️ Leaflet 地圖容器樣式 (Leaflet Map Container Styles) */
  [id^='leaflet-map'] {
    width: 100% !important;
    height: 100% !important;
  }

  /* ✨ 地圖底部控制項樣式 (Map Bottom Controls Styles) */
  .map-bottom-controls {
    bottom: 0px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
  }
</style>
