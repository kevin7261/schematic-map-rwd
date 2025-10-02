// 檔案路徑: libpysal/weights/spatial_lag.js

/**
 * ============================================================================
 * libpysal/weights/spatial_lag.py - 空間滯後函數
 * Python 原始碼連結: https://github.com/pysal/libpysal/blob/main/libpysal/weights/spatial_lag.py
 * ============================================================================
 */
export const spatial_lag = {
    // Python 原始碼: def lag_spatial(w: W, y: np.ndarray) -> np.ndarray:
    // 中文詳細說明: 計算空間滯後的核心公開函數。
    lag_spatial: function(w, y) {
      // Python 原始碼: return w.sparse * y
      // 中文詳細說明: 這是計算空間滯後值的唯一一行核心程式碼。它觸發權重物件 `w` 的稀疏矩陣 (`sparse`) 與觀測值向量 (`y`) 的乘法運算。在我們的 JS 實現中，這會呼叫 `w.sparse.dot(y)` 方法。
      return w.sparse.dot(y);
    }
};