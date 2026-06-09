/** Returns a bar max-width (px) that scales inversely with the number of bars. */
export function dynBarWidth(count: number): number {
  return Math.max(10, Math.min(48, Math.floor(200 / Math.max(1, count))));
}
