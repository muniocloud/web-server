export const avgRatingCalculator = (
  array: { [key: string]: any; rating: number | string }[],
) => {
  return array.reduce((total, now) => +now.rating + total, 0) / array.length;
};
