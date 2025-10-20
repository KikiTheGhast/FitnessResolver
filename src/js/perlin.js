class PerlinNoise1D {
  constructor(seed = Math.random()) {
    this.seed = seed;
    this.permutation = this.generatePermutation();
  }

  // 生成置换表，用于哈希计算
  generatePermutation() {
    // 使用种子确保结果可复现
    const seed = this.seed;
    let perm = new Array(256);

    // 初始化数组
    for (let i = 0; i < 256; i++) {
      perm[i] = i;
    }

    // Fisher-Yates 洗牌算法，使用种子进行随机化
    for (let i = 255; i > 0; i--) {
      // 基于种子的伪随机数生成
      const rand = Math.floor(((Math.sin(seed * i) * 10000) % 1) * i);
      [perm[i], perm[rand]] = [perm[rand], perm[i]];
    }

    // 复制一份以避免取模操作
    return perm.concat(perm);
  }

  // 平滑函数，用于插值 (6t^5 - 15t^4 + 10t^3)
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  // 线性插值
  lerp(t, a, b) {
    return a + t * (b - a);
  }

  // 梯度函数，返回指定点的梯度值
  grad(hash, x) {
    // 根据哈希值选择梯度方向
    const h = hash & 1;
    return h === 0 ? x : -x;
  }

  // 计算指定位置的噪声值
  noise(x) {
    // 计算整数部分和小数部分
    const xInt = Math.floor(x);
    const xFrac = x - xInt;

    // 获取哈希值
    const xi = xInt & 255;
    const x1 = xi + 1;

    // 计算梯度值
    const g0 = this.grad(this.permutation[xi], xFrac);
    const g1 = this.grad(this.permutation[x1], xFrac - 1);

    // 应用平滑函数
    const t = this.fade(xFrac);

    // 插值并返回结果（范围在[-1, 1]之间）
    return this.lerp(t, g0, g1);
  }

  // 生成多个八度的噪声，使效果更自然
  octaveNoise(x, octaves = 4, persistence = 0.5, min = -1, max = 1) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0; // 用于归一化

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    // 归一化到[-1, 1]
    const normalized = total / maxValue;

    // 线性映射到[min, max]范围
    return min + (normalized + 1) * (max - min) / 2;
  }
}
