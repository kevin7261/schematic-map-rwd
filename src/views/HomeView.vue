<script>
  /**
   * 🏠 HomeView.vue - 登革熱分析系統主頁面
   *
   * 功能說明：
   * 1. 🗺️ 提供地圖視覺化和資料分析的主要介面
   * 2. 📊 管理多面板響應式佈局系統
   * 3. 🔄 協調各子組件間的資料流和狀態同步
   * 4. 📱 實現桌面版和行動版的適應性佈局
   * 5. ⏳ 統一管理載入狀態和進度顯示
   * 6. 🎛️ 提供面板拖拉調整大小功能
   *
   * 架構說明：
   * - 左側面板 (LeftView)：圖層管理和控制項
   * - 中間面板 (MiddleView/UpperView)：地圖顯示和儀表板
   * - 右側面板 (RightView)：屬性資訊和圖層資訊
   * - 下方面板 (ResponsiveLowerView)：資料表格和樣式設定
   *
   * 響應式設計：
   * - 桌面版 (xl+)：四面板佈局，可拖拉調整大小
   * - 平板版 (md-lg)：上下兩層佈局，分頁式導航
   * - 手機版 (sm-)：單欄佈局，分頁式導航
   *
   * @component HomeView
   * @version 2.0.0
   */

  // 🔧 Vue Composition API 核心功能引入
  import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';

  // 📦 Pinia 狀態管理引入
  import { useDataStore } from '@/stores/dataStore';

  // 🧩 子組件引入 (Subcomponent Imports)
  import LoadingOverlay from '../components/LoadingOverlay.vue'; // ⏳ 載入覆蓋層組件
  import LeftView from './LeftView.vue'; // 📋 左側控制面板組件
  import RightView from './RightView.vue'; // 📊 右側分析面板組件
  import MiddleView from './MiddleView.vue'; // 🗺️ 中間主要內容面板組件
  import UpperView from './UpperView.vue'; // 🌟 上半部區域組件
  import ResponsiveLowerView from './ResponsiveLowerView.vue'; // 📱 響應式下半部區域組件

  export default {
    name: 'HomeView',

    /**
     * 🧩 組件註冊 (Component Registration)
     * 註冊首頁使用的所有子組件
     */
    components: {
      LoadingOverlay, // 載入覆蓋層組件
      LeftView, // 左側控制面板組件
      RightView, // 右側面板組件
      MiddleView, // 中間主要內容面板組件
      UpperView, // 上半部區域組件
      ResponsiveLowerView, // 下半部區域組件
    },

    /**
     * 🔧 組件設定函數 (Component Setup)
     * 使用 Composition API 設定組件邏輯和狀態管理
     */
    setup() {
      // 📦 取得 Pinia 數據存儲實例
      const dataStore = useDataStore();

      // 📊 本地資料狀態 (Local Data State)
      /** 📋 表格資料暫存 */
      const tableData = ref([]);

      // 📚 組件引用 (Component References)
      /** 🌟 中間面板組件引用 */
      const middlePanelRef = ref(null);
      /** 📱 響應式上半部面板組件引用 */
      const mobileUpperViewRef = ref(null);
      /** 🦶 頁腳元素引用 */
      const appFooterRef = ref(null);

      // 📑 分頁狀態 (Tab States)
      /** 🗺️ 主要分頁狀態（地圖/儀表板） */
      const activeUpperTab = ref('d3js');
      /** 📋 底部分頁狀態（表格/樣式） */
      const activeBottomTab = ref('table');
      /** 📊 右側分頁狀態（屬性/分析） */
      const activeRightTab = ref('layer-info');
      /** 📱 響應式下半部分頁狀態（行動版/平板版） */
      const activeLowerTab = ref('layers');

      // 📏 面板大小狀態 (Panel Size States)
      // 使用百分比系統實現響應式佈局
      const MIN_LEFT_PANEL_WIDTH_PERCENT = 5; // 左側面板最小寬度百分比
      /** 📏 左側面板寬度百分比 (0-100%) */
      const leftViewWidth = ref(20);
      /** 📏 右側面板寬度百分比 (0-100%) */
      const rightViewWidth = ref(20);
      /** 📏 瀏覽器視窗寬度 */
      const windowWidth = ref(window.innerWidth);
      /** 📏 瀏覽器視窗高度 */
      const windowHeight = ref(window.innerHeight);
      /** 📏 頁腳高度 */
      const footerHeight = ref(0);

      // 🧮 計算屬性 - 面板尺寸 (Computed Properties - Panel Dimensions)
      /** 📏 左側面板像素寬度 */
      const leftViewWidthPx = computed(() => `${leftViewWidth.value}%`);
      /** 📏 右側面板像素寬度 */
      const rightViewWidthPx = computed(() => `${rightViewWidth.value}%`);
      /** 📏 中間面板寬度百分比 */
      const mainPanelWidth = computed(() => 100 - leftViewWidth.value - rightViewWidth.value);
      /** 📏 中間面板像素寬度 */
      const mainPanelWidthPx = computed(() => `${mainPanelWidth.value}%`);

      /** 📏 中間面板計算高度 */
      const calculatedMiddleViewHeight = computed(() => {
        return windowHeight.value - footerHeight.value;
      });

      // ⏳ 載入狀態 (Loading States)
      // 由 Pinia store 驅動的載入狀態管理
      /** 📝 載入文字提示 */
      const loadingText = ref('載入中...');
      /** 📊 載入進度百分比 */
      const loadingProgress = ref(0);
      /** 📊 是否顯示進度條 */
      const showLoadingProgress = ref(false);
      /** 📝 載入子文字說明 */
      const loadingSubText = ref('');

      /** ⏳ 是否有任何圖層正在載入 */
      const isAnyLayerLoading = computed(() =>
        dataStore.getAllLayers().some((layer) => layer.isLoading)
      );

      /**
       * 👀 監聽載入狀態變化 (Watch Loading State Changes)
       * 根據 Pinia store 中的圖層載入狀態更新 UI 提示
       */
      watch(
        isAnyLayerLoading,
        (loading) => {
          if (loading) {
            const loadingLayer = dataStore.getAllLayers().find((l) => l.isLoading);
            loadingText.value = `載入 ${loadingLayer.layerName} 數據中...`;
            loadingSubText.value = '正在處理地理資訊...';
          } else {
            loadingText.value = '載入完成';
            loadingSubText.value = `數據已更新`;
          }
        },
        { deep: true }
      );

      // 🗺️ 地圖和圖層狀態 (Map and Layer States)
      // 大部分狀態由 Pinia store 管理，此處保留 UI 控制相關狀態
      /** 🗺️ 台南圖層顯示狀態（從 store 計算） */
      const showTainanLayer = computed(() => dataStore.findLayerById('tainan')?.visible || false);
      /** 🔍 選定的資料篩選器 */
      const selectedFilter = ref(null);
      /** 🔍 地圖縮放等級 */
      const zoomLevel = ref(11);
      /** 📍 當前地圖座標 */
      const currentCoords = ref({ lat: 25.033, lng: 121.5654 });
      /** 📍 作用中的地圖標記數量 */
      const activeMarkers = ref(0);

      // 🔧 拖曳狀態 (Dragging States)
      /** 🖱️ 側邊面板拖曳進行中狀態 */
      const isSidePanelDragging = ref(false);

      // 🗺️ 地圖互動函數 (Map Interaction Functions)

      /**
       * 🔄 重設地圖視圖 (Reset Map View)
       * 將地圖恢復到初始狀態
       */
      const resetView = () => {
        // MapTab已移除，此功能不再需要
        console.log('MapTab已移除，resetView功能已停用');
      };

      // 🔧 拖拽調整功能 (Drag Resize Functions)

      /**
       * 🔧 開始調整面板大小 (Start Panel Resize)
       * 改進版本的拖曳系統，提供更流暢的體驗
       *
       * @param {string} direction - 拖曳方向（'left' 或 'right'）
       * @param {MouseEvent} event - 滑鼠事件對象
       */
      const startResize = (direction, event) => {
        event.preventDefault();
        event.stopPropagation();

        // 設定拖曳狀態和防止文字選取
        isSidePanelDragging.value = true;
        document.body.classList.add('my-no-select');

        // 記錄初始位置和面板尺寸
        const startX = event.clientX;
        const startLeftWidth = leftViewWidth.value;
        const startRightWidth = rightViewWidth.value;

        // 獲取窗口尺寸以計算百分比
        const currentWindowWidth = windowWidth.value;

        console.log(`🔧 開始調整 ${direction} 方向，初始值:`, {
          leftWidth: startLeftWidth,
          rightWidth: startRightWidth,
        });

        /**
         * 🖱️ 處理滑鼠移動事件 (Handle Mouse Move)
         */
        const handleMouseMove = (moveEvent) => {
          moveEvent.preventDefault();

          const deltaX = moveEvent.clientX - startX;
          const deltaXPercent = (deltaX / currentWindowWidth) * 100;

          if (direction === 'left') {
            // 調整左側面板寬度
            let newWidth = startLeftWidth + deltaXPercent;
            // 限制寬度：最小值為 MIN_LEFT_PANEL_WIDTH_PERCENT，最大值確保主面板不為負
            newWidth = Math.max(
              MIN_LEFT_PANEL_WIDTH_PERCENT,
              Math.min(100 - rightViewWidth.value, newWidth)
            );
            leftViewWidth.value = newWidth;
          } else if (direction === 'right') {
            // 調整右側面板寬度
            let newWidth = startRightWidth - deltaXPercent;
            // 限制寬度：最小值為 0，最大值確保主面板不為負
            newWidth = Math.max(0, Math.min(100 - leftViewWidth.value, newWidth));
            rightViewWidth.value = newWidth;
          }
        };

        /**
         * 🖱️ 處理滑鼠放開事件 (Handle Mouse Up)
         */
        const handleMouseUp = () => {
          // 清除拖曳狀態
          isSidePanelDragging.value = false;
          document.body.classList.remove('my-no-select');
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);

          // 驗證最終尺寸
          validatePanelSizes();

          console.log('✅ 拖曳調整完成，最終值:', {
            leftWidth: leftViewWidth.value,
            rightWidth: rightViewWidth.value,
            mainWidth: mainPanelWidth.value,
          });
        };

        // 註冊事件監聽器
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };

      /**
       * ✅ 驗證面板尺寸 (Validate Panel Sizes)
       * 確保面板尺寸在合理範圍內 (0-100%)
       */
      const validatePanelSizes = () => {
        // 確保各面板在合理範圍內
        leftViewWidth.value = Math.max(
          MIN_LEFT_PANEL_WIDTH_PERCENT,
          Math.min(100, leftViewWidth.value)
        );
        rightViewWidth.value = Math.max(0, Math.min(100, rightViewWidth.value));

        // 四捨五入到一位小數
        leftViewWidth.value = Math.round(leftViewWidth.value * 10) / 10;
        rightViewWidth.value = Math.round(rightViewWidth.value * 10) / 10;
      };

      // 📏 視窗大小變化處理 (Window Resize Handler)
      /**
       * 📏 處理瀏覽器視窗大小變化 (Handle Browser Window Resize)
       */
      const handleResize = () => {
        const prevWidth = windowWidth.value;
        const prevIsDesktop = prevWidth >= 1200;

        windowWidth.value = window.innerWidth;
        windowHeight.value = window.innerHeight;

        const currentIsDesktop = window.innerWidth >= 1200;

        // 檢查是否跨越了響應式斷點
        if (prevIsDesktop !== currentIsDesktop) {
          console.log(
            `🔄 HomeView: 響應式斷點切換 ${prevIsDesktop ? '桌面版→響應式' : '響應式→桌面版'}`
          );
          handleScreenSizeChange();
        } else {
          // 同樣佈局模式下的大小變化，通知地圖重新計算尺寸
          nextTick(() => {
            setTimeout(() => {
              if (currentIsDesktop && middlePanelRef.value) {
                // 桌面版地圖尺寸調整
                if (middlePanelRef.value.invalidateMapSize) {
                  middlePanelRef.value.invalidateMapSize();
                }
              } else if (!currentIsDesktop && mobileUpperViewRef.value) {
                // 響應式版本地圖尺寸調整
                if (mobileUpperViewRef.value.invalidateMapSize) {
                  mobileUpperViewRef.value.invalidateMapSize();
                }
              }
            }, 100);
          });
        }

        nextTick(() => {
          // 只在 xl breakpoint 以上才計算 footer 高度
          if (appFooterRef.value && window.innerWidth >= 1200) {
            footerHeight.value = appFooterRef.value.offsetHeight;
          } else {
            footerHeight.value = 0;
          }

          // 檢查響應式底部面板高度是否仍然符合最小要求
          if (!currentIsDesktop) {
            const minHeight = calculateMinBottomHeight();
            if (mobileBottomViewHeight.value < minHeight) {
              mobileBottomViewHeight.value = Math.round(minHeight);
              console.log(
                `🔧 HomeView: 視窗大小變化，調整底部面板最小高度至 ${mobileBottomViewHeight.value}vh`
              );
            }
          }
        });
      };

      /**
       * 🚀 組件掛載事件 (Component Mounted Event)
       * 初始化組件和事件監聽器
       */
      onMounted(() => {
        console.log('🚀 登革熱分析平台已初始化');

        // 添加視窗調整事件監聽
        window.addEventListener('resize', handleResize);

        // 初始化計算頁腳高度
        nextTick(() => {
          // 只在 xl breakpoint 以上才計算 footer 高度
          if (appFooterRef.value && window.innerWidth >= 1200) {
            footerHeight.value = appFooterRef.value.offsetHeight;
          } else {
            footerHeight.value = 0;
          }
        });

        // 設置螢幕尺寸觀察器
        if (window.ResizeObserver) {
          screenSizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
              const { width } = entry.contentRect;
              // 檢測是否跨越 xl breakpoint (1200px)
              const isXlAndAbove = width >= 1200;
              const wasXlAndAbove = entry.target.classList.contains('xl-and-above');

              if (isXlAndAbove !== wasXlAndAbove) {
                // 螢幕尺寸跨越了 xl breakpoint
                entry.target.classList.toggle('xl-and-above', isXlAndAbove);
                handleScreenSizeChange();
              }
            }
          });

          screenSizeObserver.observe(document.body);
        }
      });

      // 📍 座標和標記更新函數 (Coordinate and Marker Update Functions)

      /**
       * 📍 更新作用中標記數量 (Update Active Markers Count)
       * @param {number} count - 標記數量
       */
      const updateActiveMarkers = (count) => {
        activeMarkers.value = count;
      };

      /**
       * 🎯 處理特徵選中事件 (Handle Feature Selected Event)
       * 當用戶在地圖上選中某個特徵時觸發
       * @param {Object} feature - 選中的地理特徵對象
       */
      const handleFeatureSelected = (feature) => {
        console.log('HomeView - handleFeatureSelected called with:', {
          feature: feature,
          properties: feature.properties,
          store: dataStore,
        });
        // 將選中的特徵設定到 Pinia store
        dataStore.setSelectedFeature(feature);
        console.log('HomeView - After setting selectedFeature:', {
          storeSelectedFeature: dataStore.selectedFeature,
        });

        // 檢查當前是桌面版還是響應式版本
        const isDesktop = window.innerWidth >= 1200; // xl breakpoint

        if (isDesktop) {
          // 桌面版：切換到右側屬性分頁
          activeRightTab.value = 'properties';
        } else {
          // 響應式版本：切換到底部屬性分頁
          activeLowerTab.value = 'properties';

          // 如果底部面板高度太小，自動調整到合適的高度
          if (mobileBottomViewHeight.value < 30) {
            mobileBottomViewHeight.value = 40; // 設定為 40vh，提供足夠空間顯示屬性
          }
        }
      };

      /**
       * 🎯 處理高亮顯示事件 (Handle Highlight Event)
       * 在地圖上高亮顯示指定的特徵
       * @param {Object} highlightData - 包含 layerId 和 id 的物件
       */
      const handleHighlight = (highlightData) => {
        console.log('🎯 HomeView 處理高亮顯示:', highlightData);

        // 如果當前不在地圖視圖，先切換到地圖
        if (activeUpperTab.value !== 'map') {
          activeUpperTab.value = 'map';
        }

        // 使用 nextTick 確保地圖組件已渲染完成
        nextTick(() => {
          // 檢查當前是桌面版還是響應式版本
          const isDesktop = window.innerWidth >= 1200; // xl breakpoint

          if (isDesktop) {
            // 桌面版：使用 MiddleView
            if (middlePanelRef.value) {
              middlePanelRef.value.highlightFeature(highlightData);
            } else {
              console.error('❌ 無法高亮顯示: middlePanelRef 不可用');
            }
          } else {
            // 響應式版本：使用 UpperView
            if (mobileUpperViewRef.value) {
              mobileUpperViewRef.value.highlightFeature(highlightData);
            } else {
              console.error('❌ 無法高亮顯示: mobileUpperViewRef 不可用');
            }
          }
        });
      };

      // 📏 響應式垂直調整狀態
      /**
       * 📏 計算底部面板最小高度百分比 (Calculate Minimum Bottom Panel Height Percentage)
       * 確保底部導航按鈕始終可見
       */
      const calculateMinBottomHeight = () => {
        const minNavigationHeight = 100; // px (基本高度 80px + 安全區域 20px)
        const currentWindowHeight = window.innerHeight;
        return Math.max(10, (minNavigationHeight / currentWindowHeight) * 100); // 最小 10vh，確保基本可用性
      };

      const mobileBottomViewHeight = ref(Math.max(40, calculateMinBottomHeight())); // vh 單位，確保不小於最小高度
      const isVerticalDragging = ref(false);
      const mobileMapKey = ref(0); // 強制重新渲染地圖的 key

      /**
       * 🔧 開始垂直調整大小 (Start Vertical Resize)
       * 響應式布局中的垂直拖曳調整功能，支援滑鼠和觸控操作
       * @param {MouseEvent|TouchEvent} event - 滑鼠或觸控事件對象
       */
      const startVerticalResize = (event) => {
        event.preventDefault();
        event.stopPropagation();

        // 設定拖曳狀態
        isVerticalDragging.value = true;
        document.body.classList.add('my-no-select');

        // 判斷是觸控還是滑鼠事件
        const isTouch = event.type.startsWith('touch');
        const clientY = isTouch ? event.touches[0].clientY : event.clientY;

        // 記錄初始位置和狀態
        const startY = clientY;
        const startBottomHeight = mobileBottomViewHeight.value;
        const windowHeight = window.innerHeight;

        console.log('🔧 HomeView - 開始垂直調整', {
          startY,
          startBottomHeight,
          windowHeight,
          isTouch,
        });

        /**
         * 🖱️ 處理移動事件（滑鼠或觸控）
         */
        const handleMove = (moveEvent) => {
          moveEvent.preventDefault();

          const currentY = moveEvent.type.startsWith('touch')
            ? moveEvent.touches[0].clientY
            : moveEvent.clientY;

          const deltaY = currentY - startY;

          // 計算新的底部高度百分比
          const deltaPercent = (deltaY / windowHeight) * 100;
          let newHeight = startBottomHeight - deltaPercent;

          // 使用動態計算的最小高度，確保底部按鈕始終可見
          const minHeightPercent = calculateMinBottomHeight();

          // 限制在最小高度到100vh範圍內，確保底部按鈕始終可見
          newHeight = Math.max(minHeightPercent, Math.min(100, newHeight));

          mobileBottomViewHeight.value = Math.round(newHeight);
        };

        /**
         * 🖱️ 處理結束事件（滑鼠放開或觸控結束）
         */
        const handleEnd = () => {
          isVerticalDragging.value = false;
          document.body.classList.remove('my-no-select');

          // 移除滑鼠事件監聽器
          document.removeEventListener('mousemove', handleMove);
          document.removeEventListener('mouseup', handleEnd);

          // 移除觸控事件監聽器
          document.removeEventListener('touchmove', handleMove);
          document.removeEventListener('touchend', handleEnd);
          document.removeEventListener('touchcancel', handleEnd);

          console.log('🔧 HomeView - 垂直調整結束', {
            finalHeight: mobileBottomViewHeight.value,
          });
        };

        // 註冊事件監聽器（同時支援滑鼠和觸控）
        if (isTouch) {
          document.addEventListener('touchmove', handleMove, { passive: false });
          document.addEventListener('touchend', handleEnd);
          document.addEventListener('touchcancel', handleEnd);
        } else {
          document.addEventListener('mousemove', handleMove);
          document.addEventListener('mouseup', handleEnd);
        }
      };

      // 🔄 監聽窗口大小變化並強制重新渲染響應式地圖
      watch(windowHeight, () => {
        // 延遲一點更新 key 來強制重新渲染地圖
        setTimeout(() => {
          mobileMapKey.value += 1;
        }, 100);
      });

      // 🔄 監聽螢幕大小變化，在桌面版和響應式版本切換時重新渲染地圖
      const handleScreenSizeChange = () => {
        console.log('🔄 HomeView: 螢幕尺寸跨越斷點，重新初始化地圖');

        // 強制重新渲染響應式地圖
        mobileMapKey.value += 1;

        // 延遲處理地圖尺寸重新計算，確保DOM完全更新
        nextTick(() => {
          setTimeout(() => {
            const isDesktop = window.innerWidth >= 1200;

            if (isDesktop) {
              // 桌面版：處理 MiddleView 中的地圖
              if (middlePanelRef.value) {
                console.log('🖥️ HomeView: 切換到桌面版，處理 MiddleView 地圖');
                // 通過 MiddleView 調用 UpperView 的地圖尺寸重新計算
                if (middlePanelRef.value.invalidateMapSize) {
                  middlePanelRef.value.invalidateMapSize();
                }
                // 觸發全域 resize 事件作為備用方案
                setTimeout(() => {
                  const event = new Event('resize');
                  window.dispatchEvent(event);
                }, 100);
              }
            } else {
              // 響應式版本：處理 mobileUpperViewRef 中的地圖
              if (mobileUpperViewRef.value) {
                console.log('📱 HomeView: 切換到響應式版本，處理 UpperView 地圖');
                // 直接調用 UpperView 的地圖尺寸重新計算
                if (mobileUpperViewRef.value.invalidateMapSize) {
                  mobileUpperViewRef.value.invalidateMapSize();
                }
              }
            }
          }, 300); // 增加延遲時間，確保佈局切換完成
        });
      };

      // 🔄 使用 ResizeObserver 監聽螢幕尺寸變化
      let screenSizeObserver = null;

      onUnmounted(() => {
        // 清理事件監聽器
        window.removeEventListener('resize', handleResize);

        // 清理螢幕尺寸觀察器
        if (screenSizeObserver) {
          screenSizeObserver.disconnect();
        }
      });

      // 📤 返回響應式數據和函數給模板使用 (Return Reactive Data and Functions)
      return {
        // 📚 組件引用
        middlePanelRef, // 中間面板引用

        // 📑 分頁狀態
        activeUpperTab, // 主要分頁狀態
        activeBottomTab, // 底部分頁狀態
        activeRightTab, // 右側分頁狀態
        activeLowerTab, // 響應式下半部分頁狀態

        // ⏳ 載入狀態
        isAnyLayerLoading, // 是否有圖層正在載入
        loadingText, // 載入文字
        loadingProgress, // 載入進度
        showLoadingProgress, // 是否顯示進度條
        loadingSubText, // 載入子文字

        // 🗺️ 圖層狀態
        showTainanLayer, // 台南圖層顯示狀態
        selectedFilter, // 選定篩選器

        // 🗺️ 地圖狀態
        zoomLevel, // 地圖縮放等級
        currentCoords, // 當前地圖座標

        // 📊 統計數據
        activeMarkers, // 作用中標記數量

        // 📏 面板尺寸（百分比系統）
        leftViewWidth, // 左側面板寬度百分比
        rightViewWidth, // 右側面板寬度百分比
        leftViewWidthPx, // 左側面板像素寬度
        rightViewWidthPx, // 右側面板像素寬度
        mainPanelWidth, // 中間面板寬度百分比
        mainPanelWidthPx, // 中間面板像素寬度

        tableData, // 表格資料

        // 📥 數據管理功能
        resetView, // 重設視圖

        // 🔧 拖拽調整功能
        startResize, // 開始調整大小
        startVerticalResize, // 開始垂直調整大小
        isSidePanelDragging, // 側邊面板拖曳狀態
        isVerticalDragging, // 垂直拖曳狀態
        mobileBottomViewHeight, // 響應式底部面板高度
        mobileMapKey, // 響應式地圖重新渲染 key
        validatePanelSizes, // 驗證面板尺寸

        // 🛠️ 工具函數
        appFooterRef, // 頁腳引用
        mobileUpperViewRef, // 響應式上半部面板引用
        calculatedMiddleViewHeight, // 計算的中間面板高度
        handleHighlight, // 處理高亮顯示

        // 🎯 互動函數
        updateActiveMarkers, // 更新作用中標記
        handleFeatureSelected, // 處理特徵選中
      };
    },
  };
</script>

<template>
  <!-- 🏠 HomeView.vue - 首頁視圖組件 (Home View Component) -->
  <!-- 提供長照資訊系統的主要用戶界面，包含響應式三面板佈局系統 -->
  <div id="app" class="d-flex flex-column vh-100">
    <!-- 📥 載入覆蓋層 (Loading Overlay) -->
    <!-- 在資料載入時顯示，提供視覺化的載入進度回饋 -->
    <LoadingOverlay
      :isVisible="isAnyLayerLoading"
      :loadingText="loadingText"
      :progress="loadingProgress"
      :showProgress="showLoadingProgress"
      :subText="loadingSubText"
    />

    <!-- 📱 主要內容區域 (Main Content Area) -->
    <!-- 使用計算高度為 footer 留出空間，避免擋住滾動條 -->
    <div class="d-flex flex-column overflow-hidden">
      <!-- 🚀 路由視圖區域 (Router View Area) -->
      <!-- 顯示非首頁的路由組件內容 -->
      <div v-if="$route.path !== '/'" class="h-100">
        <router-view />
      </div>

      <!-- 🏠 首頁內容區域 (Home Page Content Area) -->
      <!-- 登革熱分析系統的主要功能界面，使用響應式三面板佈局 -->
      <div v-if="$route.path === '/'" class="h-100 d-flex flex-column overflow-hidden">
        <!-- 🖥️ 桌面版佈局 (Desktop Layout - xl and above) -->
        <div class="d-none d-xl-flex flex-row overflow-hidden h-100">
          <!-- 🎛️ 左側控制面板容器 (Left Control Panel Container) -->
          <!-- 包含圖層控制、資料載入等功能，支援動態寬度調整 -->
          <div
            class="h-100 overflow-y-auto overflow-x-hidden my-left-panel"
            :style="{ width: leftViewWidthPx }"
            v-if="leftViewWidth > 0"
          >
            <LeftView />
          </div>

          <!-- 🔧 左側拖曳調整器 (Left Panel Resizer) -->
          <!-- 提供滑鼠拖曳功能，動態調整左側面板寬度 -->
          <div
            class="my-resizer my-resizer-vertical my-resizer-left"
            :class="{ 'my-dragging': isSidePanelDragging }"
            @mousedown="startResize('left', $event)"
            title="拖曳調整左側面板寬度"
          ></div>

          <!-- 🌟 中間主要顯示區域 (Main Display Area) -->
          <!-- 包含地圖、儀表板、資料表格等核心功能組件 -->
          <MiddleView
            ref="middlePanelRef"
            class="d-flex flex-column overflow-hidden h-100 my-middle-panel"
            style="z-index: 1"
            :style="{ width: mainPanelWidthPx, 'min-width': '0px' }"
            :dynamicMainAreaHeight="calculatedMiddleViewHeight"
            :activeUpperTab="activeUpperTab"
            :activeBottomTab="activeBottomTab"
            :mainPanelWidth="mainPanelWidth"
            :showTainanLayer="showTainanLayer"
            :selectedFilter="selectedFilter"
            :zoomLevel="zoomLevel"
            :currentCoords="currentCoords"
            :activeMarkers="activeMarkers"
            :isLoadingData="isAnyLayerLoading"
            :isSidePanelDragging="isSidePanelDragging"
            @update:activeUpperTab="activeUpperTab = $event"
            @update:activeBottomTab="activeBottomTab = $event"
            @update:zoomLevel="zoomLevel = $event"
            @update:currentCoords="currentCoords = $event"
            @update:activeMarkers="activeMarkers = $event"
            @reset-view="resetView"
            @highlight-on-map="handleHighlight"
            @highlight-feature="handleHighlight"
            @feature-selected="handleFeatureSelected"
          />

          <!-- 🔧 右側拖曳調整器 (Right Panel Resizer) -->
          <!-- 提供滑鼠拖曳功能，動態調整右側面板寬度 -->
          <div
            class="my-resizer my-resizer-vertical my-resizer-right"
            :class="{ 'my-dragging': isSidePanelDragging }"
            @mousedown="startResize('right', $event)"
            title="拖曳調整右側面板寬度"
          ></div>

          <!-- 📈 右側控制面板容器 (Right Control Panel Container) -->
          <!-- 包含物件屬性、分析清單等輔助功能，支援動態寬度調整 -->
          <div
            class="h-100 overflow-auto"
            :style="{ width: rightViewWidthPx }"
            v-if="rightViewWidth > 0"
          >
            <RightView
              :activeRightTab="activeRightTab"
              :activeMarkers="activeMarkers"
              :rightViewWidth="rightViewWidth"
              @update:activeRightTab="activeRightTab = $event"
              @highlight-feature="handleHighlight"
              :current-coords="currentCoords"
            />
          </div>
        </div>

        <!-- 📱 行動版/平板版佈局 (Mobile/Tablet Layout - below xl) -->
        <div class="d-flex d-xl-none flex-column overflow-hidden h-100">
          <!-- 🌟 上半部區域 (Upper Area) - 只包含地圖和儀表板 -->
          <div
            class="flex-shrink-0 overflow-hidden d-flex flex-column"
            :style="{ height: 100 - mobileBottomViewHeight + 'vh' }"
            v-if="mobileBottomViewHeight < 100"
          >
            <UpperView
              ref="mobileUpperViewRef"
              :key="mobileMapKey"
              :activeUpperTab="activeUpperTab"
              :mainPanelWidth="100"
              :contentHeight="(100 - mobileBottomViewHeight) * windowHeight * 0.01"
              :showTainanLayer="showTainanLayer"
              :selectedFilter="selectedFilter"
              :zoomLevel="zoomLevel"
              :isPanelDragging="isVerticalDragging"
              :activeMarkers="activeMarkers"
              @update:activeUpperTab="activeUpperTab = $event"
              @update:zoomLevel="zoomLevel = $event"
              @update:currentCoords="currentCoords = $event"
              @update:activeMarkers="activeMarkers = $event"
              @feature-selected="handleFeatureSelected"
            />
          </div>

          <!-- 🔧 水平拖曳調整器 (Horizontal Resizer) -->
          <div
            class="my-resizer my-resizer-horizontal my-resizer-middle"
            :class="{ 'my-dragging': isVerticalDragging }"
            @mousedown="startVerticalResize"
            @touchstart="startVerticalResize"
            title="拖曳調整底部面板高度"
            v-if="mobileBottomViewHeight > 0 && mobileBottomViewHeight < 100"
          ></div>

          <!-- 📋 下半部區域 (Lower Area) - 包含所有其他 tabs -->
          <div
            class="flex-shrink-0 overflow-hidden"
            :style="{ height: mobileBottomViewHeight + 'vh' }"
            v-if="mobileBottomViewHeight > 0"
          >
            <ResponsiveLowerView
              :activeTab="activeLowerTab"
              :activeRightTab="activeRightTab"
              :activeBottomTab="activeBottomTab"
              @update:activeTab="activeLowerTab = $event"
              @update:activeRightTab="activeRightTab = $event"
              @update:activeBottomTab="activeBottomTab = $event"
              @highlight-on-map="handleHighlight"
              @highlight-feature="handleHighlight"
              @feature-selected="handleFeatureSelected"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 🦶 頁腳區域 (Footer Area) -->
    <!-- 固定高度 footer，提供版權資訊和技術鳴謝 -->
    <!-- 只在 xl breakpoint 以上顯示 -->
    <footer
      class="d-none d-xl-flex justify-content-between my-app-footer my-title-sm-white my-bgcolor-gray-800 p-2"
      ref="appFooterRef"
    >
      <small>臺灣大學地理環境資源學系</small>
      <small>2025</small>
    </footer>
  </div>
</template>

<style>
  /**
 * 🎨 應用程式全域樣式 (Application Global Styles)
 *
 * 引入共用 CSS 並定義全域樣式，主要使用 Bootstrap 佈局系統
 */
  @import '../assets/css/common.css';

  /* 📱 HomeView 專用樣式 (HomeView Specific Styles) */
  /* 其他通用樣式已移至 common.css 中統一管理 */
</style>
