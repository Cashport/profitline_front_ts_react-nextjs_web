/**
 * Formats a unit count for compact display in narrow table cells.
 * Numbers up to 9999 are returned unchanged (e.g. 9000 -> "9000").
 * Above 9999 they are abbreviated in thousands with one decimal and a "K"
 * suffix, dropping a trailing ".0" (10000 -> "10K", 10600 -> "10.6K",
 * 339717 -> "339.7K").
 */
export function formatThousandNum(num: number): string {
  if (num <= 9999) return String(num);
  const str = (num / 1000).toFixed(1).replace(/\.0$/, "");
  return `${str}K`;
}
