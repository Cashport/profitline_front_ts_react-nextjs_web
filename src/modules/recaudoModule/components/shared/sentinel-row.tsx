import { forwardRef } from "react";

/** Fila invisible tras las filas pintadas: al acercarse, useProgressiveRows pinta la siguiente tanda. */
const SentinelRow = forwardRef<HTMLTableRowElement, { colSpan: number }>(function SentinelRow(
  { colSpan },
  ref
) {
  return (
    <tr ref={ref} aria-hidden>
      <td colSpan={colSpan} className="h-px p-0" />
    </tr>
  );
});

export default SentinelRow;
