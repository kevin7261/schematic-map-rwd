// 檔案路徑: utils/esda/moran.js

import { shuffleArray, SeededRandom, normSdist } from '../libpysal/weights/util.js';
import { spatial_lag } from '../libpysal/weights/spatial_lag.js';

/**
 * ============================================================================
 * esda.moran.py - Moran's I Autocorrelation Statistic
 * Python 原始碼連結: https://github.com/pysal/esda/blob/master/esda/moran.py
 * ============================================================================
 */
// Python 原始碼: class Moran:
// 中文詳細說明: 導出一個名為 Moran 的類別。
export class Moran {
    // Python 原始碼: def __init__(self, y, w, transformation="r", permutations=PERMUTATIONS, two_tailed=True):
    // 中文詳細說明: Moran's I 的建構函數。
    constructor(y, w, { transformation = "R", permutations = 999, two_tailed = true, seed = null } = {}) {
        // Python 原始碼: y = np.asarray(y).flatten()
        // 中文詳細說明: 確保 y 是一個純數值的一維陣列並儲存。
        this.y = y.map(Number);

        // Python 原始碼: w = _transform(w, transformation)
        // 中文詳細說明: 設定權重轉換方式。
        w.transform = transformation;
        // Python 原始碼: self.w = w
        // 中文詳細說明: 儲存權重物件。
        this.w = w;

        // Python 原始碼: self.permutations = permutations
        // 中文詳細說明: 儲存模擬次數。
        this.permutations = permutations;

        // Python 原始碼: self.__moments()
        // 中文詳細說明: 呼叫內部方法計算期望值、變異數等理論值。
        this.__moments();

        // Python 原始碼: self.I = self.__calc(self.z)
        // 中文詳細說明: 呼叫內部計算函數，傳入標準化後的 z 變數，計算觀測到的 Moran's I 值。
        this.I = this.__calc(this.z);

        // Python 原始碼: self.z_norm = (self.I - self.EI) / self.seI_norm
        // 中文詳細說明: 計算常態假設下的 Z 分數。
        this.z_norm = (this.I - this.EI) / this.seI_norm;
        // Python 原始碼: self.z_rand = (self.I - self.EI) / self.seI_rand
        // 中文詳細說明: 計算隨機假設下的 Z 分數。
        this.z_rand = (this.I - this.EI) / this.seI_rand;

        // Python 原始碼: self.p_norm = stats.norm.sf(self.z_norm) or stats.norm.cdf(self.z_norm)
        // 中文詳細說明: 計算常態假設下的 p-value。
        let p_norm = (this.z_norm > 0) ? (1.0 - normSdist(this.z_norm)) : normSdist(this.z_norm);
        // Python 原始碼: self.p_rand = stats.norm.sf(self.z_rand) or stats.norm.cdf(self.z_rand)
        // 中文詳細說明: 計算隨機假設下的 p-value。
        let p_rand = (this.z_rand > 0) ? (1.0 - normSdist(this.z_rand)) : normSdist(this.z_rand);

        // Python 原始碼: if two_tailed: self.p_norm *= 2.0
        // 中文詳細說明: 如果要求雙尾檢定，則將 p-value 乘以 2。
        if (two_tailed) {
            p_norm *= 2.0;
            p_rand *= 2.0;
        }
        this.p_norm = p_norm;
        this.p_rand = p_rand;

        // Python 原始碼: if permutations:
        // 中文詳細說明: 如果設定的模擬次數大於 0，則執行 p-value 計算流程。
        if (permutations) {
            // Python 原始碼: sim = [self.__calc(np.random.permutation(self.z)) for i in range(permutations)]
            // 中文詳細說明: 執行N次模擬。在每次迴圈中，隨機打亂 z 陣列，然後重新計算 I 值。
            const sim = [];
            const rng = seed !== null ? new SeededRandom(seed) : null;
            for (let i = 0; i < permutations; i++) {
                sim.push(this.__calc(shuffleArray(this.z, rng)));
            }
            // Python 原始碼: self.sim = sim = np.array(sim)
            // 中文詳細說明: 儲存所有模擬的 I 值。
            this.sim = sim;

            // Python 原始碼: above = sim >= self.I
            // 中文詳細說明: 計算模擬值中，有多少個大於或等於觀測值。
            const above = sim.filter(val => val >= this.I).length;
            // Python 原始碼: larger = above.sum()
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

            // Python 原始碼: self.EI_sim = sim.sum() / permutations
            // 中文詳細說明: 計算模擬 I 值的平均值。
            this.EI_sim = sim.reduce((a, b) => a + b, 0) / permutations;
            // Python 原始碼: self.seI_sim = np.array(sim).std()
            // 中文詳細說明: 計算模擬 I 值的標準差。
            const sim_mean = this.EI_sim;
            const sim_var = sim.reduce((a, b) => a + (b - sim_mean)**2, 0) / permutations;
            this.seI_sim = Math.sqrt(sim_var);
            // Python 原始碼: self.VI_sim = self.seI_sim**2
            // 中文詳細說明: 計算模擬 I 值的變異數。
            this.VI_sim = this.seI_sim**2;
            // Python 原始碼: self.z_sim = (self.I - self.EI_sim) / self.seI_sim
            // 中文詳細說明: 計算基於模擬結果的 Z 分數。
            this.z_sim = (this.I - this.EI_sim) / this.seI_sim;

            // Python 原始碼: self.p_z_sim = ...
            // 中文詳細說明: 計算基於模擬 Z 分數的 p-value。
            let p_z_sim = (this.z_sim > 0) ? (1.0 - normSdist(this.z_sim)) : normSdist(this.z_sim);
            if (two_tailed) {
                p_z_sim *= 2.0;
            }
            this.p_z_sim = p_z_sim;
        }
    }

    // Python 原始碼: def __moments(self):
    // 中文詳細說明: 定義一個私有方法，用於計算 Moran's I 的期望值與變異數。
    __moments() {
        // Python 原始碼: self.n = len(self.y)
        // 中文詳細說明: 獲取觀測單元總數。
        this.n = this.y.length;
        const n = this.n;
        // Python 原始碼: z = y - y.mean()
        // 中文詳細說明: 計算離差 z。
        const y_mean = this.y.reduce((a, b) => a + b, 0) / n;
        const z = this.y.map(val => val - y_mean);
        // Python 原始碼: self.z = z
        // 中文詳細說明: 儲存離差 z。
        this.z = z;
        // Python 原始碼: self.z2ss = (z * z).sum()
        // 中文詳細說明: 計算離差平方和。
        this.z2ss = z.reduce((a, b) => a + b * b, 0);
        // Python 原始碼: self.EI = -1.0 / (self.n - 1)
        // 中文詳細說明: 計算 Moran's I 的期望值。
        this.EI = -1.0 / (n - 1);

        // Python 原始碼: s1 = self.w.s1; s0 = self.w.s0; s2 = self.w.s2
        // 中文詳細說明: 獲取權重矩陣的高階屬性。
        const s1 = this.w.s1;
        const s0 = this.w.s0;
        const s2 = this.w.s2;
        const s02 = s0 * s0;

        // Python 原始碼: v_num = n2 * s1 - n * s2 + 3 * s02
        // 中文詳細說明: 計算常態假設下變異數的分子。
        const v_num = n*n * s1 - n * s2 + 3 * s02;
        // Python 原始碼: v_den = (n - 1) * (n + 1) * s02
        // 中文詳細說明: 計算常態假設下變異數的分母。
        const v_den = (n - 1) * (n + 1) * s02;
        // Python 原始碼: self.VI_norm = v_num / v_den - (1.0 / (n - 1)) ** 2
        // 中文詳細說明: 計算並儲存常態假設下的變異數。
        this.VI_norm = v_num / v_den - (1.0 / (n - 1)) ** 2;
        // Python 原始碼: self.seI_norm = self.VI_norm ** (1 / 2.0)
        // 中文詳細說明: 計算並儲存常態假設下的標準誤。
        this.seI_norm = this.VI_norm ** 0.5;

        // Python 原始碼: # variance under randomization
        // 中文詳細說明: 計算隨機假設下的變異數。
        const k = (z.map(zi => zi**4).reduce((a, b) => a + b, 0) / n) / ((this.z2ss / n) ** 2);
        const A = n * ((n*n - 3 * n + 3) * s1 - n * s2 + 3 * s02);
        const B = k * ((n*n - n) * s1 - 2 * n * s2 + 6 * s02);
        const VIR = (A - B) / ((n - 1) * (n - 2) * (n - 3) * s02) - this.EI * this.EI;
        // Python 原始碼: self.VI_rand = VIR
        // 中文詳細說明: 儲存隨機假設下的變異數。
        this.VI_rand = VIR;
        // Python 原始碼: self.seI_rand = VIR ** (1 / 2.0)
        // 中文詳細說明: 儲存隨機假設下的標準誤。
        this.seI_rand = VIR ** 0.5;
    }

    // Python 原始碼: def __calc(self, z):
    // 中文詳細說明: 定義一個私有方法，用於計算 Moran's I 統計量的核心公式。
    __calc(z) {
        // Python 原始碼: zl = _slag(self.w, z)
        // 中文詳細說明: 計算 z 變數的空間滯後。
        const zl = spatial_lag.lag_spatial(this.w, z);
        // Python 原始碼: inum = (z * zl).sum()
        // 中文詳細說明: 計算分子 (z 和其空間滯後的點積)。
        const inum = z.reduce((sum, val, i) => sum + val * zl[i], 0);
        // Python 原始碼: s0 = self.w.s0
        // 中文詳細說明: 獲取權重總和。
        const s0 = this.w.s0;

        // 錯誤檢查，防止 NaN
        if (this.z2ss === 0) {
            console.warn('Moran.__calc: z2ss 為 0，可能所有數值都相同');
            return 0;
        }
        if (s0 === 0) {
            console.warn('Moran.__calc: s0 為 0，權重總和為 0');
            return 0;
        }
        if (this.n === 0) {
            console.warn('Moran.__calc: n 為 0，沒有觀測值');
            return 0;
        }

        // Python 原始碼: return self.n / s0 * inum / self.z2ss
        // 中文詳細說明: 回傳最終的 I 值。
        return (this.n / s0) * (inum / this.z2ss);
    }
}
