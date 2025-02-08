/* 根据知识使用次数计算半径 */
export const radiusScale = (usage: any) => {
  const minRadius = 5;
  const factor = 0.5;
  return minRadius + factor * Math.pow(usage - 1, 0.3);
};
