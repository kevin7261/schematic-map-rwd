// 檔案路徑: utils/libpysal/weights/util.js

/**
 * ============================================================================
 * 通用輔助函數 (對應 Python libpysal.weights.util)
 * ============================================================================
 */

// --- 幾何計算 ---

// Python 原始碼 (概念): # Custom simplified centroid logic
// 中文詳細說明: 定義一個名為 getSimplifiedCentroid 的函數，用於從 GeoJSON 的 feature 物件中計算簡易的幾何中心點。
export function getSimplifiedCentroid(feature) {
    // Python 原始碼 (概念): if feature is None or feature.geometry is None: return None
    // 中文詳細說明: 檢查傳入的 feature 或其 geometry 屬性是否為空，如果是則返回 null。
    if (!feature || !feature.geometry) return null;
    // Python 原始碼 (概念): geom = feature.geometry
    // 中文詳細說明: 獲取 feature 物件中的 geometry 部分。
    const geom = feature.geometry;
    // Python 原始碼 (概念): if geom.type == 'Point': return geom.coordinates
    // 中文詳細說明: 如果幾何類型是 'Point'，直接返回其座標。
    if (geom.type === 'Point') return geom.coordinates;
    // Python 原始碼 (概念): if geom.type == 'Polygon': coords = geom.coordinates[0]
    // 中文詳細說明: 如果是 'Polygon'，則只取其第一個環（外環）的座標點陣列。
    if (geom.type === 'Polygon' && geom.coordinates && geom.coordinates[0] && geom.coordinates[0].length > 0) {
        const coords = geom.coordinates[0];
        // Python 原始碼 (概念): sum_x = np.sum(coords[:, 0]); sum_y = np.sum(coords[:, 1])
        // 中文詳細說明: 使用 reduce 方法計算所有頂點的 x 和 y 座標總和。
        const sum = coords.reduce((acc, p) => {
            acc[0] += p[0];
            acc[1] += p[1];
            return acc;
        }, [0, 0]);
        // Python 原始碼 (概念): return (sum_x / len(coords), sum_y / len(coords))
        // 中文詳細說明: 回傳 x 和 y 座標的算術平均值作為質心。
        return [sum[0] / coords.length, sum[1] / coords.length];
    }
    // 支援 MultiPoint
    if (geom.type === 'MultiPoint' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
        const sum = geom.coordinates.reduce((acc, p) => {
            acc[0] += p[0];
            acc[1] += p[1];
            return acc;
        }, [0, 0]);
        return [sum[0] / geom.coordinates.length, sum[1] / geom.coordinates.length];
    }
    // 支援 MultiPolygon（取所有外環頂點）
    if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
        const allCoords = geom.coordinates.flatMap(poly => (poly[0] || []));
        if (allCoords.length > 0) {
            const sum = allCoords.reduce((acc, p) => {
                acc[0] += p[0];
                acc[1] += p[1];
                return acc;
            }, [0, 0]);
            return [sum[0] / allCoords.length, sum[1] / allCoords.length];
        }
    }
    // 中文詳細說明: 對於不支援的幾何類型，返回 null。
    return null;
}

// --- 隨機數功能 (對應 numpy.random) ---

// Python 原始碼 (概念): # Class to implement numpy.random.seed() functionality
// 中文詳細說明: 定義一個名為 SeededRandom 的類別，用於根據給定的種子生成一個可預測的隨機數序列。
export class SeededRandom {
    // Python 原始碼 (概念): def __init__(self, seed=None):
    // 中文詳細說明: SeededRandom 的建構函數，如果未提供種子，則使用目前時間戳。
    constructor(seed = null) {
        this.seed = seed !== null ? seed : Date.now();
        this.current = this.seed;
    }
    // Python 原始碼 (概念): def random(self):
    // 中文詳細說明: 實作一個簡單的線性同餘隨機數生成器 (LCG) 來生成下一個偽隨機數。
    random() {
        const a = 1103515245, c = 12345, m = Math.pow(2, 31);
        this.current = (a * this.current + c) % m;
        return this.current / m;
    }
    // 中文詳細說明: 生成一個在 [0, max) 區間的隨機整數。
    randomInt(max) {
        return Math.floor(this.random() * max);
    }
}

// Python 原始碼 (概念): numpy.random.permutation(array)
// 中文詳細說明: 定義一個名為 shuffleArray 的函數，用於對陣列進行隨機排序 (洗牌)。
export function shuffleArray(array, rng = null) {
    // Python 原始碼 (概念): shuffled = array.copy()
    // 中文詳細說明: 建立原陣列的一個副本，以避免修改原始陣列。
    const shuffled = [...array];
    // 中文詳細說明: 如果未提供隨機數生成器，則建立一個新的。
    const randomGenerator = rng || new SeededRandom();
    // Python 原始碼 (概念): for i in reversed(range(1, len(shuffled))):
    // 中文詳細說明: 執行 Fisher-Yates (或 Knuth) 演算法來進行原地洗牌。
    for (let i = shuffled.length - 1; i > 0; i--) {
        // Python 原始碼 (概念): j = rng.randint(0, i + 1)
        // 中文詳細說明: 生成一個隨機索引 j。
        const j = randomGenerator.randomInt(i + 1);
        // Python 原始碼 (概念): shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
        // 中文詳細說明: 交換索引 i 和 j 的元素。
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // 中文詳細說明: 回傳洗牌後的陣列。
    return shuffled;
}

// --- 新增: 誤差函數 (erf) 及標準常態 CDF (normSdist) ---
function _erf(x) {
    // Abramowitz & Stegun 7.1.26 近似
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

// Python 原始碼: scipy.stats.norm.cdf 的簡化版本
export function normSdist(z) {
    return 0.5 * (1 + _erf(z / Math.SQRT2));
}

// --- 新增: 地理距離計算 (Haversine) 及最小距離門檻 ---
export function calculateGeographicDistance(point1, point2) {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;
    const R = 6371000; // 地球半徑 (公尺)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function min_threshold_distance(points) {
    if (!points || points.length < 2) return 0;
    let maxNearest = 0;
    for (let i = 0; i < points.length; i++) {
        let nearest = Infinity;
        for (let j = 0; j < points.length; j++) {
            if (i === j) continue;
            const dist = calculateGeographicDistance(points[i], points[j]);
            if (dist < nearest) nearest = dist;
        }
        if (nearest > maxNearest) maxNearest = nearest;
    }
    return maxNearest;
}
