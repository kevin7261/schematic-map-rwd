// 檔案路徑: utils/esda/geary.js

import { shuffleArray, SeededRandom, normSdist } from '../libpysal/weights/util.js';

/**
 * ============================================================================
 * esda.geary.py - Geary's C Autocorrelation Statistic
 * Python 原始碼連結: https://github.com/pysal/esda/blob/master/esda/geary.py
 * ============================================================================
 */
// Python 原始碼: class Geary:
// 中文詳細說明: 導出一個名為 Geary 的類別。
export class Geary {
    // Python 原始碼: def __init__(self, y, w, transformation="r", permutations=999):
    // 中文詳細說明: Geary 的建構函數。
    constructor(y, w, { transformation = "R", permutations = 999, seed = null } = {}) {
        // Python 原始碼: y = np.asarray(y).flatten()
        // 中文詳細說明: 確保 y 是一個純數值的一維陣列。
        y = y.map(Number);
        // Python 原始碼: self.n = len(y)
        // 中文詳細說明: 儲存觀測單元的總數。
        this.n = y.length;
        // Python 原始碼: self.y = y
        // 中文詳細說明: 儲存原始變數。
        this.y = y;

        // Python 原始碼: w.transform = transformation
        // 中文詳細說明: 設定權重轉換方式。
        w.transform = transformation;
        // Python 原始碼: self.w = w
        // 中文詳細說明: 儲存權重物件。
        this.w = w;

        // Python 原始碼: self._focal_ix, self._neighbor_ix = w.sparse.nonzero()
        // 中文詳細說明: 獲取所有非零權重的索引，這是高效計算的核心。
        const sparse_ix = w.get_sparse_ix();
        // Python 原始碼: self._focal_ix = ...
        // 中文詳細說明: 儲存起始點的索引陣列。
        this._focal_ix = sparse_ix.focal_ix;
        // Python 原始碼: self._neighbor_ix = ...
        // 中文詳細說明: 儲存鄰居點的索引陣列。
        this._neighbor_ix = sparse_ix.neighbor_ix;
        // Python 原始碼: self._weights = w.sparse.data
        // 中文詳細說明: 儲存對應的權重值陣列。
        this._weights = sparse_ix.weights;

        // Python 原始碼: self.permutations = permutations
        // 中文詳細說明: 儲存模擬次數。
        this.permutations = permutations;

        // Python 原始碼: self.__moments()
        // 中文詳細說明: 呼叫內部方法計算常態和隨機假設下的期望值與變異數。
        this.__moments();
        
        // Python 原始碼: yd = y - y.mean()
        // 中文詳細說明: 計算離差（每個值減去平均值）。
        const y_mean = y.reduce((a, b) => a + b, 0) / this.n;
        const yd = y.map(val => val - y_mean);
        // Python 原始碼: yss = sum(yd * yd)
        // 中文詳細說明: 計算離差平方和 (Sum of Squared Deviations)。
        const yss = yd.reduce((a, b) => a + b * b, 0);
        // Python 原始碼: s0 = self.w.s0
        // 中文詳細說明: 獲取權重總和。
        const s0 = this.w.s0;

        // Python 原始碼: self.den = yss * s0 * 2.0
        // 中文詳細說明: 計算 Geary's C 公式的分母。
        this.den = yss * s0 * 2.0;

        // Python 原始碼: self.C = self.__calc(y)
        // 中文詳細說明: 呼叫內部方法計算觀測到的 Geary's C 值。
        this.C = this.__calc(y);

        // Python 原始碼: self.EC = 1.0
        // 中文詳細說明: Geary's C 的期望值恆為 1.0。
        this.EC = 1.0;
        // Python 原始碼: de = self.C - 1.0
        // 中文詳細說明: 計算觀測值與期望值的差距。
        const de = this.C - 1.0;

        // Python 原始碼: self.z_norm = de / self.seC_norm
        // 中文詳細說明: 計算常態假設下的 Z 分數。
        this.z_norm = de / this.seC_norm;
        // Python 原始碼: self.z_rand = de / self.seC_rand
        // 中文詳細說明: 計算隨機假設下的 Z 分數。
        this.z_rand = de / this.seC_rand;
        
        // Python 原始碼: self.p_norm = stats.norm.sf(self.z_norm) or stats.norm.cdf(self.z_norm)
        // 中文詳細說明: 計算常態假設下的 p-value (單尾檢定)。
        this.p_norm = de > 0 ? 1.0 - normSdist(this.z_norm) : normSdist(this.z_norm);
        // Python 原始碼: self.p_rand = stats.norm.sf(self.z_rand) or stats.norm.cdf(self.z_rand)
        // 中文詳細說明: 計算隨機假設下的 p-value (單尾檢定)。
        this.p_rand = de > 0 ? 1.0 - normSdist(this.z_rand) : normSdist(this.z_rand);

        // Python 原始碼: if permutations:
        // 中文詳細說明: 如果設定的模擬次數大於 0，則執行 p-value 計算流程。
        if (permutations) {
            // Python 原始碼: sim = [self.__calc(np.random.permutation(self.y)) for i in range(permutations)]
            // 中文詳細說明: 執行N次模擬。在每次迴圈中，隨機打亂 y 陣列，然後重新計算 C 值。
            const sim = [];
            const rng = seed !== null ? new SeededRandom(seed) : null;
            for (let i = 0; i < permutations; i++) {
                sim.push(this.__calc(shuffleArray(this.y, rng)));
            }
            // Python 原始碼: self.sim = sim = np.array(sim)
            // 中文詳細說明: 儲存所有模擬的 C 值。
            this.sim = sim;
            
            // Python 原始碼: above = sim >= self.C
            // 中文詳細說明: 計算模擬值中，有多少個大於或等於觀測值。
            const above = sim.filter(val => val >= this.C).length;
            // Python 原始碼: larger = sum(above)
            // 中文詳細說明: 儲存大於等於觀測值的數量。
            let larger = above;
            // Python 原始碼: if (self.permutations - larger) < larger: larger = self.permutations - larger
            // 中文詳細說明: 進行雙尾檢定的調整，取更極端的一側。
            if ((permutations - larger) < larger) {
                larger = permutations - larger;
            }
            // Python 原始碼: self.p_sim = (larger + 1.0) / (permutations + 1.0)
            // 中文詳細說明: 計算模擬 p-value。
            this.p_sim = (larger + 1.0) / (permutations + 1.0);
            
            // Python 原始碼: self.EC_sim = sum(sim) / permutations
            // 中文詳細說明: 計算模擬 C 值的平均值。
            this.EC_sim = sim.reduce((a, b) => a + b, 0) / permutations;
            // Python 原始碼: self.seC_sim = np.array(sim).std()
            // 中文詳細說明: 計算模擬 C 值的標準差。
            const sim_mean = this.EC_sim;
            const sim_var = sim.reduce((a, b) => a + (b - sim_mean)**2, 0) / permutations;
            this.seC_sim = Math.sqrt(sim_var);
            // Python 原始碼: self.VC_sim = self.seC_sim**2
            // 中文詳細說明: 計算模擬 C 值的變異數。
            this.VC_sim = this.seC_sim**2;
            // Python 原始碼: self.z_sim = (self.C - self.EC_sim) / self.seC_sim
            // 中文詳細說明: 計算基於模擬結果的 Z 分數。
            this.z_sim = (this.C - this.EC_sim) / this.seC_sim;
            // Python 原始碼: self.p_z_sim = stats.norm.sf(np.abs(self.z_sim))
            // 中文詳細說明: 計算基於模擬 Z 分數的 p-value。
            this.p_z_sim = 1.0 - normSdist(Math.abs(this.z_sim));
        }
    }

    // Python 原始碼: def __moments(self):
    // 中文詳細說明: 定義一個私有方法，用於計算 Geary's C 的期望值與變異數。
    __moments() {
        // Python 原始碼: y = self.y; n = self.n; s0 = self.w.s0; s1 = self.w.s1; s2 = self.w.s2
        // 中文詳細說明: 獲取計算所需的變數：觀測值、數量、權重動差。
        const y = this.y;
        const n = this.n;
        const s0 = this.w.s0;
        const s1 = this.w.s1;
        const s2 = this.w.s2;
        // Python 原始碼: s02 = s0 * s0
        // 中文詳細說明: 計算 s0 的平方。
        const s02 = s0 * s0;
        // Python 原始碼: yd = y - y.mean()
        // 中文詳細說明: 計算離差。
        const yd = y.map(val => val - (y.reduce((a, b) => a + b, 0) / n));
        // Python 原始碼: yd2 = yd**2; yd4 = yd**4
        // 中文詳細說明: 計算離差的平方和四次方。
        const yd2 = yd.map(val => val**2);
        const yd4 = yd.map(val => val**4);
        // Python 原始碼: k = (yd4.sum() / n) / ((yd2.sum() / n) ** 2)
        // 中文詳細說明: 計算峰度 (kurtosis)。
        const k = (yd4.reduce((a, b) => a + b, 0) / n) / ((yd2.reduce((a, b) => a + b, 0) / n) ** 2);
        
        // Python 原始碼: A = (n - 1) * s1 * (n*n - 3 * n + 3 - (n - 1) * k)
        // 中文詳細說明: 計算隨機假設下變異數公式的第一部分 A。
        const A = (n - 1) * s1 * (n*n - 3 * n + 3 - (n - 1) * k);
        // Python 原始碼: B = (1.0 / 4) * ((n - 1) * s2 * (n*n + 3 * n - 6 - (n*n - n + 2) * k))
        // 中文詳細說明: 計算隨機假設下變異數公式的第二部分 B。
        const B = (1.0 / 4) * ((n - 1) * s2 * (n*n + 3 * n - 6 - (n*n - n + 2) * k));
        // Python 原始碼: C = s02 * (n*n - 3 - (n - 1) ** 2 * k)
        // 中文詳細說明: 計算隨機假設下變異數公式的第三部分 C。
        const C_ = s02 * (n*n - 3 - (n - 1)**2 * k); // 避免與類別名衝突
        
        // Python 原始碼: vc_rand = (A - B + C) / (n * (n - 2) * (n - 3) * s02)
        // 中文詳細說明: 計算隨機假設下的變異數。
        const vc_rand = (A - B + C_) / (n * (n - 2) * (n - 3) * s02);
        // Python 原始碼: vc_norm = (1 / (2 * (n + 1) * s02)) * ((2 * s1 + s2) * (n - 1) - 4 * s02)
        // 中文詳細說明: 計算常態假設下的變異數。
        const vc_norm = (1 / (2 * (n + 1) * s02)) * ((2 * s1 + s2) * (n - 1) - 4 * s02);

        // Python 原始碼: self.VC_rand = vc_rand
        // 中文詳細說明: 儲存隨機假設下的變異數。
        this.VC_rand = vc_rand;
        // Python 原始碼: self.VC_norm = vc_norm
        // 中文詳細說明: 儲存常態假設下的變異數。
        this.VC_norm = vc_norm;
        // Python 原始碼: self.seC_rand = vc_rand ** (0.5)
        // 中文詳細說明: 儲存隨機假設下的標準誤。
        this.seC_rand = vc_rand ** 0.5;
        // Python 原始碼: self.seC_norm = vc_norm ** (0.5)
        // 中文詳細說明: 儲存常態假設下的標準誤。
        this.seC_norm = vc_norm ** 0.5;
    }

    // Python 原始碼: def __calc(self, y):
    // 中文詳細說明: 定義一個私有方法，用於計算 Geary's C 統計量的核心公式。
    __calc(y) {
        // Python 原始碼: num = (self._weights * ((y[self._focal_ix] - y[self._neighbor_ix]) ** 2)).sum()
        // 中文詳細說明: 計算公式的分子：所有鄰居對的差值平方的加權總和。
        let num = 0;
        for (let i = 0; i < this._weights.length; i++) {
            num += this._weights[i] * ((y[this._focal_ix[i]] - y[this._neighbor_ix[i]]) ** 2);
        }
        // Python 原始碼: a = (self.n - 1) * num
        // 中文詳細說明: 分子乘以 (n-1)。
        const a = (this.n - 1) * num;
        // Python 原始碼: return a / self.den
        // 中文詳細說明: 回傳最終的 C 值。
        return a / this.den;
    }
}
