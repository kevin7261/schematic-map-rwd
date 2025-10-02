// 檔案路徑: utils/libpysal/weights/weights.js

/**
 * ============================================================================
 * libpysal/weights/weights.py - 權重基礎類別 W
 * Python 原始碼連結: https://github.com/pysal/libpysal/blob/main/libpysal/weights/weights.py
 * ============================================================================
 */
// Python 原始碼: class W:
// 中文詳細說明: 導出一個名為 W 的類別，這是所有空間權重物件的基礎類別。
export class W {
    // Python 原始碼: def __init__(self, neighbors, weights=None, id_order=None, **kwargs):
    // 中文詳細說明: W 類別的建構函數，用於初始化一個空間權重物件。
    constructor(neighbors, weights, ids = null) {
      // 確保所有 ID 都是字串
      this.neighbors = Object.fromEntries(
        Object.entries(neighbors).map(([k, v]) => [String(k), v.map(String)])
      );

      if (!weights) {
          weights = {};
          for (const key in this.neighbors) {
              weights[key] = new Array(this.neighbors[key].length).fill(1.0);
          }
      } else {
        // 確保權重的 key 也是字串
        weights = Object.fromEntries(
          Object.entries(weights).map(([k, v]) => [String(k), v])
        );
      }
      this.weights = weights;

      this.transformations = {};
      this.transformations["O"] = JSON.parse(JSON.stringify(this.weights));

      this._transform = 'O';

      // 確保 id_order 中的 ID 也是字串
      this._id_order = (ids || Object.keys(this.neighbors)).map(String).sort();

      this.n = this._id_order.length;

      this._reset();
    }

    // Python 原始碼: @property def id_order(self): return self._id_order
    // 中文詳細說明: id_order 的 getter 方法，返回當前的 ID 順序列表。
    get id_order() {
        return this._id_order;
    }

    // Python 原始碼: def set_transform(self, value="B"):
    // 中文詳細說明: 定義一個名為 `transform` 的 setter，當執行 `w.transform = 'R'` 這樣的賦值操作時，此方法會被呼叫。
    set transform(value) {
      // Python 原始碼: value = value.upper()
      // 中文詳細說明: 將傳入的轉換模式字串轉為大寫，以進行不區分大小寫的比較。
      const upperVal = value.toUpperCase();

      // Python 原始碼: self._transform = value
      // 中文詳細說明: 更新內部的 `_transform` 狀態，記錄當前的轉換模式。
      this._transform = upperVal;

      // Python 原始碼: if value in self.transformations: self.weights = self.transformations[value]
      // 中文詳細說明: 如果這個轉換已經計算過並被快取，直接從快取中讀取，並重設其他計算屬性。
      if (upperVal in this.transformations) {
          this.weights = this.transformations[upperVal];
          this._reset();
          return;
      }

      // Python 原始碼: # (transformation logic for 'R', 'B', etc.)
      // 中文詳細說明: 如果是新的轉換請求，則根據類型進行計算。
      const newWeights = {};
      const originalWeights = this.transformations["O"];

      switch (upperVal) {
          // Python 原始碼: elif value == "B":
          // 中文詳細說明: 'B' (Binary) 模式，將所有權重設為 1.0。
          case 'B':
              for (const i in originalWeights) {
                  newWeights[i] = new Array(originalWeights[i].length).fill(1.0);
              }
              break;
          // Python 原始碼: elif value == "R":
          // 中文詳細說明: 'R' (Row-Standardized) 模式，使每一行的權重總和為 1。
          case 'R':
              for (const i in originalWeights) {
                  const row = originalWeights[i];
                  const rowSum = row.reduce((sum, val) => sum + val, 0);
                  if (rowSum === 0) {
                      newWeights[i] = row.slice(); // 島嶼（沒有鄰居）保持不變
                  } else {
                      newWeights[i] = row.map(val => val / rowSum);
                  }
              }
              break;
          // 中文詳細說明: 其他轉換類型可以加在這裡...
          default:
              // Python 原始碼: raise Exception("unsupported weights transformation")
              // 中文詳細說明: 如果是不支援的模式，則拋出錯誤。
              throw new Error(`不支援的轉換模式: ${upperVal}`);
      }
      // Python 原始碼: self.transformations[value] = weights
      // 中文詳細說明: 將新計算出的權重物件存入快取。
      this.transformations[upperVal] = newWeights;
      // Python 原始碼: self.weights = weights
      // 中文詳細說明: 更新當前使用的權重。
      this.weights = newWeights;
      // Python 原始碼: self._reset()
      // 中文詳細說明: 清除所有舊的計算屬性快取，因為權重已改變。
      this._reset();
    }

    // Python 原始碼: def _reset(self): self._cache = {}
    // 中文詳細說明: 重設快取物件，清除所有已計算的屬性。
    _reset() {
      this._cache = {};
    }

    // Python 原始碼: @property def id2i(self):
    // 中文詳細說明: 獲取一個從 ID 到其在 `id_order` 中索引位置的對應表。
    get id2i() {
        // Python 原始碼: if "id2i" not in self._cache:
        // 中文詳細說明: 使用快取機制，如果尚未計算則進行計算並儲存。
        if (!this._cache.id2i) {
            // Python 原始碼: self._id2i = {id_i: i for i, id_i in enumerate(self._id_order)}
            // 中文詳細說明: 遍歷 id_order 列表，建立一個 Map 物件用於快速查找。
            this._cache.id2i = new Map(this._id_order.map((id, i) => [id, i]));
        }
        return this._cache.id2i;
    }

    // Python 原始碼: @property def sparse(self):
    // 中文詳細說明: 獲取稀疏矩陣的模擬物件。
    get sparse() {
      if (!this._cache.sparse) {
        this._cache.sparse = this._build_sparse();
      }
      return this._cache.sparse;
    }

    // Python 原始碼: @property def s0(self):
    // 中文詳細說明: s0 是所有權重值的總和。
    get s0() {
        if (this._cache.s0 === undefined) {
            let s0_val = 0;
            for (const w_list of Object.values(this.weights)) {
                for (const w of w_list) {
                    s0_val += w;
                }
            }
            this._cache.s0 = s0_val;
        }
        return this._cache.s0;
    }

    // Python 原始碼: @property def s1(self):
    // 中文詳細說明: s1 是權重矩陣二階動差的一半。
    get s1() {
        if (this._cache.s1 === undefined) {
            let s1_val = 0;
            const W_matrix = new Array(this.n).fill(0).map(() => new Array(this.n).fill(0));
            for (const [i_id, neighbors] of Object.entries(this.neighbors)) {
                const i = this.id2i.get(i_id);
                for (let k = 0; k < neighbors.length; k++) {
                    const j_id = neighbors[k];
                    const j = this.id2i.get(j_id);
                    if (i !== undefined && j !== undefined) {
                      W_matrix[i][j] = this.weights[i_id][k];
                    }
                }
            }
            for (let i = 0; i < this.n; i++) {
                for (let j = 0; j < this.n; j++) {
                    s1_val += (W_matrix[i][j] + W_matrix[j][i]) ** 2;
                }
            }
            this._cache.s1 = s1_val / 2.0;
        }
        return this._cache.s1;
    }

    // Python 原始碼: @property def s2(self):
    // 中文詳細說明: s2 是權重矩陣的另一個二階動差。
    get s2() {
        if (this._cache.s2 === undefined) {
            let s2_val = 0;
            const row_sums = new Array(this.n).fill(0);
            const col_sums = new Array(this.n).fill(0);

            for (const [i_id, neighbors] of Object.entries(this.neighbors)) {
                const i = this.id2i.get(i_id);
                for (let k = 0; k < neighbors.length; k++) {
                    const j_id = neighbors[k];
                    const j = this.id2i.get(j_id);
                    if (i !== undefined && j !== undefined) {
                      const w_ij = this.weights[i_id][k];
                      row_sums[i] += w_ij;
                      col_sums[j] += w_ij;
                    }
                }
            }
            for (let i = 0; i < this.n; i++) {
                s2_val += (row_sums[i] + col_sums[i]) ** 2;
            }
            this._cache.s2 = s2_val;
        }
        return this._cache.s2;
    }

    // Python 原始碼: @property def cardinalities(self):
    // 中文詳細說明: 計算並回傳每個觀測單元的鄰居數量。
    get cardinalities() {
        if (!this._cache.cardinalities) {
            const c = {};
            for (const id of this._id_order) {
                c[id] = this.neighbors[id] ? this.neighbors[id].length : 0;
            }
            this._cache.cardinalities = c;
        }
        return this._cache.cardinalities;
    }

    // Python 原始碼: @property def islands(self):
    // 中文詳細說明: 回傳一個列表，包含所有沒有鄰居的觀測單元（島嶼）的 ID。
    get islands() {
        if (!this._cache.islands) {
            const islands = [];
            const cards = this.cardinalities;
            for (const id in cards) {
                if (cards[id] === 0) {
                    islands.push(id);
                }
            }
            this._cache.islands = islands;
        }
        return this._cache.islands;
    }

    // Python 原始碼 (概念): # Helper for w.sparse.nonzero() and w.sparse.data
    // 中文詳細說明: 模擬 Python `scipy.sparse.nonzero()` 和 `data` 屬性的行為，返回所有非零權重的索引和值。
    get_sparse_ix() {
        if (!this._cache.sparse_ix) {
            const focal_ix = [];
            const neighbor_ix = [];
            const weights = [];

            for (const [i_id, neighbors] of Object.entries(this.neighbors)) {
                const i = this.id2i.get(i_id);
                for (let k = 0; k < neighbors.length; k++) {
                    const j_id = neighbors[k];
                    const j = this.id2i.get(j_id);
                    if (i !== undefined && j !== undefined) {
                      focal_ix.push(i);
                      neighbor_ix.push(j);
                      weights.push(this.weights[i_id][k]);
                    }
                }
            }
            this._cache.sparse_ix = { focal_ix, neighbor_ix, weights };
        }
        return this._cache.sparse_ix;
    }

    // Python 原始碼: def _build_sparse(self):
    // 中文詳細說明: 定義一個私有方法，用於建立一個模擬 Python `scipy.sparse` 稀疏矩陣的物件。
    _build_sparse() {
      // Python 原始碼: self.id_to_index = {i: index for index, i in enumerate(self.id_order)}
      // 中文詳細說明: 建立一個從 ID 到其在 `w.ids` 陣列中索引位置的快速查找表 (Map)，這對應 Python 中的字典，是提升效能的關鍵。
      const idToIndex = this.id2i;
      // Python 原始碼: self.n
      // 中文詳細說明: 獲取觀測單元的總數。
      const n = this.n;

      // Python 原始碼 (概念): # returns a scipy.sparse.csr_matrix object
      // 中文詳細說明: 回傳一個物件，其 `dot` 方法模擬了 Python 稀疏矩陣與向量的乘法運算，這是計算空間滯後的核心。
      return {
        // Python 原始碼 (概念): def dot(self, y):
        // 中文詳細說明: 定義 `dot` 方法，接收一個數值陣列 `y` 作為參數。
        dot: (y) => {
          // Python 原始碼 (概念): wy = np.zeros(self.n)
          // 中文詳細說明: 初始化結果陣列 `result`，長度與觀測單元數量相同，所有值預設為 0。
          const result = new Array(n).fill(0);

          // Python 原始碼: for i, neighs in self.neighbors.items():
          // 中文詳細說明: 遍歷每一個觀測單元 (id) 和它的鄰居們 (neighborIds)。
          for (const [id, neighborIds] of Object.entries(this.neighbors)) {
            // Python 原始碼: i_idx = self.id_to_index[i]
            // 中文詳細說明: 使用查找表快速找到目前觀測單元 ID 的索引位置 `i`。
            const i = idToIndex.get(id);

            // 中文詳細說明: 如果找不到索引（理論上不應發生），則跳過此次迴圈。
            if (i === undefined) continue;

            // 中文詳細說明: 初始化用於累加鄰居值的變數。
            let sum = 0;

            // Python 原始碼: for j in neighs:
            // 中文詳細說明: 遍歷目前觀測單元的所有鄰居 (neighborId)。
            for (let k = 0; k < neighborIds.length; k++) {
                const neighborId = neighborIds[k];
              // Python 原始碼: j_idx = self.id_to_index[j]
              // 中文詳細說明: 找到鄰居 ID 的索引位置 `j`。
              const j = idToIndex.get(neighborId);

              // 中文詳細說明: 確保鄰居索引有效且對應的 `y` 值是有效的數字。
              if (j !== undefined && y[j] !== undefined && y[j] !== null && !isNaN(y[j])) {
                // Python 原始碼 (概念): # sum y[j_idx] for all j in neighs
                // 中文詳細說明: 將鄰居的值乘以對應的權重後累加到 `sum`。
                sum += y[j] * this.weights[id][k];
              }
            }

            // 中文詳細說明: 直接回傳加權總和，因為轉換已在 `set transform` 中處理。
            result[i] = sum;
          }
          // Python 原始碼: return wy
          // 中文詳細說明: 回傳計算完成的空間滯後向量。
          return result;
        }
      };
    }

    // Python 原始碼: def to_adjlist(self, remove_symmetric=False, drop_islands=True):
    // 中文詳細說明: 定義一個方法，將權重物件轉換為「鄰接列表」格式，這種格式被 `Join_Counts` 等分析方法使用。
    to_adjlist(remove_symmetric = false, drop_islands = true) {
        // 中文詳細說明: 初始化三個陣列，分別用於存放起始點、鄰居點和對應的權重。
        const focals = [];
        const neighbors = [];
        const weights = [];

        // Python 原始碼 (概念): for focal, neighbors in self.neighbors.items():
        // 中文詳細說明: 遍歷 W 物件中的每一個觀測單元 (focal) 及其鄰居列表 (neighbor_list)。
        for (const [focal, neighbor_list] of Object.entries(this.neighbors)) {
            // Python 原始碼 (概念): for i, neighbor in enumerate(neighbor_list):
            // 中文詳細說明: 遍歷該單元的所有鄰居。
            for (let i = 0; i < neighbor_list.length; i++) {
                // 中文詳細說明: 獲取鄰居的 ID。
                const neighbor = neighbor_list[i];
                // 中文詳細說明: 獲取對應這個鄰居的權重值。
                const weight = this.weights[focal][i];

                // Python 原始碼 (概念): if remove_symmetric and focal > neighbor: continue
                // 中文詳細說明: Python 版本中有移除對稱鄰居的選項，這裡為了完整對應，保留邏輯。
                if (remove_symmetric && focal > neighbor) {
                    continue;
                }

                // 中文詳細說明: 將這對鄰接關係的起始點、鄰居點和權重分別推入對應的陣列中。
                focals.push(focal);
                neighbors.push(neighbor);
                weights.push(weight);
            }
        }

        // Python 原始碼: if not drop_islands: ...
        // 中文詳細說明: 如果不丟棄島嶼，則將它們作為自環（權重為0）加入到列表中。
        if (!drop_islands) {
            // 中文詳細說明: 獲取所有島嶼節點的 ID。
            const island_nodes = this.islands;
            // 中文詳細說明: 遍歷島嶼節點。
            for (const island of island_nodes) {
                // 中文詳細說明: 將島嶼的自環加入列表。
                focals.push(island);
                neighbors.push(island);
                weights.push(0);
            }
        }

        // Python 原始碼 (概念): return pd.DataFrame({'focal':..., 'neighbor':..., 'weight':...})
        // 中文詳細說明: 回傳一個包含三個陣列的物件，這在 JS 中等同於一個簡易版的 DataFrame 或一個結構化的資料物件。
        return {
            focal: focals,
            neighbor: neighbors,
            weight: weights,
        };
    }
  }
