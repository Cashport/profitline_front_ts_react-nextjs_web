"use client";

import { LogoCashport } from "@/components/atoms/logoCashport/LogoCashport";

export default function LandPage() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        minHeight: 0
      }}
    >
      <LogoCashport width={670} height={172} />
    </div>
  );
}
