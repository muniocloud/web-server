export const avgCalculator = (array: any[]) => {
  return array.reduce((total, now) => now.rating + total, 0) / array.length;
};
