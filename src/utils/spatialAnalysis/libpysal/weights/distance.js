// 檔案路徑: utils/libpysal/weights/distance.js

import { W } from './weights.js';
import { getSimplifiedCentroid } from './util.js';

/**
 * ============================================================================
 * libpysal/weights/distance.py - K-最近鄰權重
 * Python 原始碼連結: https://github.com/pysal/libpysal/blob/main/libpysal/weights/distance.py
 * ============================================================================
 */
// Python 原始碼: class KNN(W):
// 中文詳細說明: 導出一個名為 KNN 的類別，它繼承自基礎的 W 類別。
export class KNN extends W {
    // Python 原始碼: @classmethod def from_dataframe(cls, df, k=2, ...):
    // 中文詳細說明: 定義一個靜態工廠方法，方便地從 GeoJSON (對應 DataFrame) 建立 KNN 權重物件。
    static from_dataframe(df, k = 2) {
        // Python 原始碼: pts = get_points_array(df[geom_col])
        // 中文詳細說明: 從 GeoJSON 的 features 陣列中提取每個 feature 的幾何中心點座標。
        const coordinates = df.features.map(feature => getSimplifiedCentroid(feature));
        // Python 原始碼: ids = df.index.tolist()
        // 中文詳細說明: 從 GeoJSON 的 features 陣列中提取每個 feature 的 ID。
        const ids = df.features.map((f, i) => String(f.properties?.id ?? i));

        // 中文詳細說明: 過濾掉任何無效的幾何資料，並確保座標和 ID 列表保持對齊。
        const validData = coordinates
            .map((coord, index) => ({ coord, id: ids[index] }))
            .filter(item => item.coord !== null);

        // 中文詳細說明: 分離出有效的座標和 ID。
        const validCoords = validData.map(item => item.coord);
        const validIds = validData.map(item => item.id);

        // Python 原始碼: return cls(pts, k=k, ids=ids)
        // 中文詳細說明: 呼叫 KNN 的主建構函數 `new KNN(...)`，傳入處理好的座標和 ID。
        return new KNN(validCoords, k, validIds);
    }

    // Python 原始碼: def __init__(self, data, k=2, ...):
    // 中文詳細說明: KNN 的主建構函數，接收點座標、k值和 ID 列表。
    constructor(points, k = 2, ids = null) {
        // 中文詳細說明: 如果未提供 ids，則生成字串形式的索引
        const stringIds = ids || Array.from({length: points.length}, (_, i) => String(i));
        // 中文詳細說明: 呼叫一個靜態輔助方法來計算鄰居和權重。
        const { neighbors, weights } = KNN._build_knn(points, k, stringIds);
        // Python 原始碼: W.__init__(self, neighbors, weights, ids, **kwargs)
        // 中文詳細說明: 呼叫父類別 `W` 的建構函數，完成物件的初始化。
        super(neighbors, weights, stringIds);
        // Python 原始碼: self.k = k
        // 中文詳細說明: 將 K 值儲存為物件的屬性。
        this.k = k;
        this.points = points;
    }

    // Python 原始碼 (概念): distances, to_weight = self.kdtree.query(self.data, k=k + 1)
    // 中文詳細說明: 定義一個靜態私有方法，模擬 KDTree 查詢邏輯，計算每對點之間的距離來找到最近的 K 個鄰居。
    static _build_knn(points, k, ids) {
        // 中文詳細說明: 初始化用於儲存鄰居和權重的 Map 物件。
        const neighbors = {};
        const weights = {};

        // Python 原始碼 (概念): for i, p_i in enumerate(points):
        // 中文詳細說明: 對每一個點進行迴圈。
        for (let i = 0; i < points.length; i++) {
            const currentPoint = points[i];
            const currentId = ids[i];
            const distances = [];

            // Python 原始碼 (概念): for j, p_j in enumerate(points):
            // 中文詳細說明: 對每一個其他點進行迴圈以計算距離。
            for (let j = 0; j < points.length; j++) {
                // Python 原始碼 (概念): if i == j: continue
                // 中文詳細說明: 跳過點自身。
                if (i === j) continue;
                const otherPoint = points[j];
                const otherId = ids[j];
                // 中文詳細說明: 計算兩點間的歐幾里得距離。
                const distance = Math.sqrt(Math.pow(otherPoint[0] - currentPoint[0], 2) + Math.pow(otherPoint[1] - currentPoint[1], 2));
                distances.push({ id: otherId, distance: distance });
            }

            // Python 原始碼 (概念): sorted_distances = sorted(distances, key=lambda x: x[1])
            // 中文詳細說明: 對距離進行排序。
            distances.sort((a, b) => a.distance - b.distance);
            // Python 原始碼 (概念): neighbor_ids = [d[0] for d in sorted_distances[:k]]
            // 中文詳細說明: 選取前 k 個最近的鄰居的 ID。
            const neighborIds = distances.slice(0, Math.min(k, distances.length)).map(d => d.id);
            // Python 原始碼 (概念): neighbor_weights = [1.0] * k
            // 中文詳細說明: 對於 KNN，權重通常是二元的（即都是 1.0）。
            const neighborWeights = new Array(neighborIds.length).fill(1);

            // 中文詳細說明: 將結果存入 Map。
            neighbors[currentId] = neighborIds;
            weights[currentId] = neighborWeights;
        }

        // 中文詳細說明: 回傳包含鄰居和權重的物件。
        return { neighbors, weights };
    }
}
