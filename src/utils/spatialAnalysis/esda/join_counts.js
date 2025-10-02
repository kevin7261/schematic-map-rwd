// 檔案路徑: utils/esda/join_counts.js

import { shuffleArray, SeededRandom } from '../libpysal/weights/util.js';

/**
 * ============================================================================
 * esda.join_counts.py - Binary Join Counts
 * Python 原始碼連結: https://github.com/pysal/esda/blob/master/esda/join_counts.py
 * ============================================================================
 */
// Python 原始碼: class Join_Counts:
// 中文詳細說明: 導出一個名為 Join_Counts 的類別。
export class Join_Counts {
    // Python 原始碼: def __init__(self, y, w, permutations=PERMUTATIONS, drop_islands=True):
    // 中文詳細說明: Join_Counts 的建構函數。
    constructor(y, w, { permutations = 999, seed = null } = {}) {
        // Python 原始碼: self.y = np.asarray(y).flatten()
        // 中文詳細說明: 將傳入的 y 轉換為純數值陣列並儲存。
        this.y = y.map(Number);

        // Python 原始碼: w.transform = "b"
        // 中文詳細說明: 這一步非常關鍵！Join Counts 分析強制使用二元權重 ('B')，覆蓋任何外部設定。
        w.transform = 'B';
        // Python 原始碼: self.w = w
        // 中文詳細說明: 儲存權重物件。
        this.w = w;

        // Python 原始碼: self.adj_list = self.w.to_adjlist(...)
        // 中文詳細說明: 呼叫 W 類別的方法，獲取計算所需的鄰接列表。
        this.adj_list = this.w.to_adjlist(false, true);
        // Python 原始碼: self.permutations = permutations
        // 中文詳細說明: 儲存模擬次數。
        this.permutations = permutations;

        // Python 原始碼: results = self.__calc(self.y)
        // 中文詳細說明: 呼叫內部計算函數，計算觀測到的鄰接數量。
        const observed = this.__calc(this.y);
        // Python 原始碼: self.bb = results[0]
        // 中文詳細說明: 儲存觀測到的 BB (1-1) 鄰接數量。
        this.bb = observed.bb;
        // Python 原始碼: self.ww = results[1]
        // 中文詳細說明: 儲存觀測到的 WW (0-0) 鄰接數量。
        this.ww = observed.ww;
        // Python 原始碼: self.bw = results[2]
        // 中文詳細說明: 儲存觀測到的 BW (0-1 或 1-0) 鄰接數量。
        this.bw = observed.bw;

        // Python 原始碼: if permutations:
        // 中文詳細說明: 如果設定的模擬次數大於 0，則執行 p-value 計算流程。
        if (this.permutations > 0) {
            // Python 原始碼 (概念): seed(self.seed)
            // 中文詳細說明: 如果提供了種子，則建立一個可重現的隨機數生成器。
            const rng = seed !== null ? new SeededRandom(seed) : null;

            // Python 原始碼: sim = []
            // 中文詳細說明: 初始化一個空陣列來儲存每次模擬的結果。
            const sim = [];
            // Python 原始碼: while i < permutations:
            // 中文詳細說明: 執行 N 次模擬迴圈。
            for (let i = 0; i < this.permutations; i++) {
                // Python 原始碼: np.random.permutation(self.y)
                // 中文詳細說明: 使用帶有種子功能的 shuffleArray 函數來隨機打亂二元陣列。
                const shuffled_y = shuffleArray(this.y, rng);
                // Python 原始碼: sim.append(self.__calc(shuffled_y))
                // 中文詳細說明: 用打亂後的陣列計算 Join Counts，並將結果存入 sim 陣列。
                sim.push(this.__calc(shuffled_y));
            }

            // Python 原始碼: self.sim_bb = sim_jc[:, 0]
            // 中文詳細說明: 從模擬結果中提取所有 BB 值的陣列。
            this.sim_bb = sim.map(s => s.bb);
            // Python 原始碼: self.mean_bb = np.mean(self.sim_bb)
            // 中文詳細說明: 計算 BB 模擬值的平均值。
            this.mean_bb = this.sim_bb.reduce((sum, val) => sum + val, 0) / this.sim_bb.length;

            // Python 原始碼: self.sim_bw = sim_jc[:, 2]
            // 中文詳細說明: 從模擬結果中提取所有 BW 值的陣列。
            this.sim_bw = sim.map(s => s.bw);
            // Python 原始碼: self.mean_bw = np.mean(self.sim_bw)
            // 中文詳細說明: 計算 BW 模擬值的平均值。
            this.mean_bw = this.sim_bw.reduce((sum, val) => sum + val, 0) / this.sim_bw.length;

            // Python 原始碼: self.p_sim_bb = self.__pseudop(self.sim_bb, self.bb)
            // 中文詳細說明: 呼叫 `__pseudop` 方法計算 BB 值的模擬 p-value。
            this.p_sim_bb = this.__pseudop(this.sim_bb, this.bb);

            // Python 原始碼: self.p_sim_bw = self.__pseudop(self.sim_bw, self.bw)
            // 中文詳細說明: 呼叫 `__pseudop` 方法計算 BW 值的模擬 p-value。
            this.p_sim_bw = this.__pseudop(this.sim_bw, this.bw);
        }
    }

    // Python 原始碼: def __calc(self, z):
    // 中文詳細說明: 定義核心計算函數，根據給定的二元陣列 z 和鄰接列表來計算 BB, WW, BW。
    __calc(z) {
        // Python 原始碼: zseries = pd.Series(z, index=self.w.id_order)
        // 中文詳細說明: 建立一個從 ID 到其二元值的快速查找表 (Map)。
        const zseries = new Map(this.w.id_order.map((id, index) => [id, z[index]]));

        // Python 原始碼: focal = zseries.loc[adj_list.focal].values
        // 中文詳細說明: 根據鄰接列表中的 focal ID 順序，獲取對應的二元值陣列。
        const focal_values = this.adj_list.focal.map(id => zseries.get(id));

        // Python 原始碼: neighbor = zseries.loc[adj_list.neighbor].values
        // 中文詳細說明: 根據鄰接列表中的 neighbor ID 順序，獲取對應的二元值陣列。
        const neighbor_values = this.adj_list.neighbor.map(id => zseries.get(id));

        // 中文詳細說明: 初始化計數器。
        let bb_sum = 0, ww_sum = 0, bw_sum = 0;

        // 中文詳細說明: 遍歷所有鄰接對。
        for (let i = 0; i < focal_values.length; i++) {
            const f = focal_values[i];
            const n = neighbor_values[i];
            // Python 原始碼: sim = focal == neighbor
            // 中文詳細說明: 判斷起始點和鄰居點的值是否相同。
            const is_same = (f === n);

            // Python 原始碼: bb = (focal * sim).sum()
            // 中文詳細說明: 如果值相同且為1，則為 BB 鄰接。
            if (is_same && f === 1) bb_sum++;
            // Python 原始碼: ww = ((1 - focal) * sim).sum()
            // 中文詳細說明: 如果值相同且為0，則為 WW 鄰接。
            if (is_same && f === 0) ww_sum++;
            // Python 原始碼: bw = (focal * dif).sum() + ((1 - focal) * dif).sum()
            // 中文詳細說明: 如果值不同，則為 BW 鄰接。
            if (!is_same) bw_sum++;
        }

        // Python 原始碼: return bb / 2, ww / 2, (bw + wb) / 2
        // 中文詳細說明: 鄰接列表將每個鄰接計算了兩次（A-B 和 B-A），因此需要除以2得到實際的鄰接數量。
        return {
            bb: bb_sum / 2,
            ww: ww_sum / 2,
            bw: bw_sum / 2,
        };
    }

    // Python 原始碼: def __pseudop(self, sim, jc):
    // 中文詳細說明: 定義計算模擬 p-value 的標準方法。
    __pseudop(sim, observed_jc) {
        // Python 原始碼: above = sim >= jc
        // 中文詳細說明: 計算模擬值中，有多少個大於或等於觀測值。
        const larger = sim.filter(val => val >= observed_jc).length;

        // Python 原始碼: psim = (larger + 1.0) / (self.permutations + 1.0)
        // 中文詳細說明: 根據公式計算 p-value。+1 是為了避免 p-value 為0的情況。
        return (larger + 1) / (this.permutations + 1);
    }
}
