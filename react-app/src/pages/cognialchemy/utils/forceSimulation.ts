/* 根据知识使用次数计算半径 */
export const radiusScale = (usage: any) => {
  const minRadius = 12;
  const factor = 1;
  return minRadius + factor * Math.pow(usage - 1, 0.3);
};

/* 根据知识使用次数计算fontsize大小 */
export const fontSizeScale = (usage: number) => {
  const minFontSize = 10; // 最小字体大小
  const factor = 0.5; // 调整因子，根据需要调整
  return minFontSize + factor * Math.pow(usage - 1, 0.2);
};
  