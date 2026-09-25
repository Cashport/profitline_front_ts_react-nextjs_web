"use client";

import { TRAMOS } from "../../constants";
import type { TramoIndex } from "../../types";

/** Fondo + texto de cada tramo, ligados a los tokens .wallet-scope. */
const TRAMO_CHIP = [
  "bg-wallet-t0 text-wallet-t0-ink",
  "bg-wallet-t1 text-wallet-t1-ink",
  "bg-wallet-t2 text-wallet-t2-ink",
  "bg-wallet-t3 text-wallet-t3-ink",
  "bg-wallet-t4 text-wallet-t4-ink",
  "bg-wallet-t5 text-wallet-t5-ink"
];

export default function TramoChip({ tramo }: { tramo: TramoIndex }) {
  return (
    <span
      className={`inline-block rounded-[5px] px-[7px] py-px text-[10.5px] font-bold tabular-nums ${TRAMO_CHIP[tramo]}`}
    >
      {TRAMOS[tramo].short}
    </span>
  );
}
