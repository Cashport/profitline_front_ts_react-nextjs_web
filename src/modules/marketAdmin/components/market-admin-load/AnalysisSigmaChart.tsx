"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";
import { ILoadAnalysisMeasure } from "@/types/marketAdmin/IMarketAdmin";
import {
  COLORS,
  formatDayLong,
  formatDayShort,
  formatMonthStartShort,
  formatMeasure,
  formatSigma,
  isMonthStart,
  todayString
} from "./analysisUtils";

const HEIGHT = 170;

type Props = {
  measure: ILoadAnalysisMeasure;
  historyDays: number;
};

export default function AnalysisSigmaChart({ measure, historyDays }: Props) {
  const t = useTranslations("marketAdmin.load.validation.chart");
  const [hover, setHover] = useState<number | null>(null);

  const dates = [...measure.history.map((p) => p.date), todayString()];
  const vals = [...measure.history.map((p) => p.value), measure.value];
  const n = vals.length;
  const hasBands = measure.mean !== null && !!measure.std_dev && measure.std_dev > 0;
  const mu = measure.mean ?? 0;
  const sd = measure.std_dev ?? 0;

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = Math.max(Math.abs(max - min) * 0.1, Math.abs(max) * 0.05, 1);
  const lo = hasBands ? Math.min(mu - 3.4 * sd, min - 0.3 * sd) : min - pad;
  const hi = hasBands ? Math.max(mu + 3.4 * sd, max + 0.3 * sd) : max + pad;
  const y = (v: number) => Math.round(10 + ((hi - v) / (hi - lo)) * 150);
  const step = n > 1 ? 96 / (n - 1) : 0;
  const x = (i: number) => (n > 1 ? 1 + i * step : 50);
  const points = vals.map((v, i) => `${x(i).toFixed(2)},${y(v)}`).join(" ");
  const area = `${points} ${x(n - 1).toFixed(2)},${HEIGHT} ${x(0).toFixed(2)},${HEIGHT}`;
  const offset = (k: number) =>
    hasBands ? String(Math.max(0, Math.min(1, y(mu + k * sd) / HEIGHT))) : "0";

  const isWarn = measure.level === "WARNING";
  const todayColor = isWarn ? COLORS.orange : COLORS.lime;
  const todaySoft = isWarn ? COLORS.orangeSoft : COLORS.limeSoft;
  const todayInk = isWarn ? COLORS.orangeInk : COLORS.ink;

  const ticks = dates
    .map((d, i) => ({ d, i }))
    .filter(({ d, i }) => i === 0 || (i > 2 && isMonthStart(d, dates[i - 1])))
    .map(({ d, i }) => ({
      left: i === 0 ? "0%" : `${x(i)}%`,
      label: i === 0 ? formatDayShort(d) : formatMonthStartShort(d)
    }));

  const gid = `g-${measure.key}`;
  const lid = `l-${measure.key}`;
  const hx = hover !== null ? x(hover) : 0;
  const tipShift =
    hx > 75
      ? "translate(calc(-100% - 12px), -50%)"
      : hx < 20
        ? "translate(12px, -50%)"
        : "translate(-50%, calc(-100% - 14px))";

  const bandLines = hasBands
    ? [
        { k: 3, color: COLORS.red },
        { k: -3, color: COLORS.red },
        { k: 2, color: COLORS.orange },
        { k: -2, color: COLORS.orange }
      ]
    : [];
  const axisLabels = hasBands
    ? [
        { k: 3, label: "+3σ", color: COLORS.red },
        { k: 2, label: "+2σ", color: "#E04A00" },
        { k: 1, label: "+1σ", color: COLORS.ink },
        { k: 0, label: "μ", color: COLORS.faint },
        { k: -1, label: "−1σ", color: COLORS.ink },
        { k: -2, label: "−2σ", color: "#E04A00" },
        { k: -3, label: "−3σ", color: COLORS.red }
      ]
    : [];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid gap-2 pt-1.5" style={{ gridTemplateColumns: "minmax(0, 1fr) 40px" }}>
        <div className="relative" style={{ height: HEIGHT }} onMouseLeave={() => setHover(null)}>
          {hasBands && (
            <>
              <div
                className="absolute left-0 right-0"
                style={{
                  top: y(mu + sd),
                  height: y(mu - sd) - y(mu + sd),
                  background: COLORS.soft,
                  borderTop: `1.5px dashed ${COLORS.ink}`,
                  borderBottom: `1.5px dashed ${COLORS.ink}`
                }}
              />
              {bandLines.map((b) => (
                <div
                  key={b.k}
                  className="absolute left-0 right-0"
                  style={{ top: y(mu + b.k * sd), borderTop: `1.5px dashed ${b.color}` }}
                />
              ))}
              <div
                className="absolute left-0 right-0"
                style={{ top: y(mu), borderTop: "1px solid #B1BBC1" }}
              />
            </>
          )}
          <svg
            viewBox={`0 0 100 ${HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={COLORS.ink2} stopOpacity=".16" />
                <stop offset="1" stopColor={COLORS.ink2} stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id={lid}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2={HEIGHT}
              >
                <stop offset={offset(3)} stopColor={COLORS.red} />
                <stop offset={offset(2)} stopColor={COLORS.orange} />
                <stop offset={offset(1)} stopColor={COLORS.ink} />
                <stop offset={offset(0.5)} stopColor={COLORS.ink2} />
                <stop offset={offset(-0.5)} stopColor={COLORS.ink2} />
                <stop offset={offset(-1)} stopColor={COLORS.ink} />
                <stop offset={offset(-2)} stopColor={COLORS.orange} />
                <stop offset={offset(-3)} stopColor={COLORS.red} />
              </linearGradient>
            </defs>
            {n > 1 && <polygon points={area} fill={`url(#${gid})`} />}
            <polyline
              points={points}
              fill="none"
              stroke={hasBands ? `url(#${lid})` : COLORS.ink2}
              strokeWidth="1.75"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div
            className="absolute rounded-full"
            style={{
              left: `${x(n - 1)}%`,
              top: y(measure.value),
              width: 12,
              height: 12,
              background: todayColor,
              boxShadow: `0 0 0 2.5px ${COLORS.ink}, 0 0 0 6.5px ${todaySoft}`,
              transform: "translate(-50%, -50%)"
            }}
          />
          {hover === null && (
            <div
              className="absolute whitespace-nowrap rounded-full text-[11px] font-bold"
              style={{
                left: `${x(n - 1)}%`,
                top: y(measure.value),
                transform: "translate(calc(-100% - 16px), -50%)",
                color: todayInk,
                background: todaySoft,
                padding: "2px 8px"
              }}
            >
              {t("todayValue", { value: formatMeasure(measure.unit, measure.value) })}
            </div>
          )}
          {hover !== null && (
            <>
              <div
                className="absolute top-0 bottom-0"
                style={{ left: `${hx}%`, borderLeft: `1px solid ${COLORS.ink2}`, opacity: 0.35 }}
              />
              <div
                className="absolute rounded-full bg-white box-border"
                style={{
                  left: `${hx}%`,
                  top: y(vals[hover]),
                  width: 9,
                  height: 9,
                  border: `2.5px solid ${COLORS.ink}`,
                  transform: "translate(-50%, -50%)"
                }}
              />
              <div
                className="absolute flex flex-col gap-0.5 whitespace-nowrap pointer-events-none z-[5] rounded-lg text-white"
                style={{
                  left: `${hx}%`,
                  top: y(vals[hover]),
                  transform: tipShift,
                  background: COLORS.ink,
                  padding: "8px 11px",
                  boxShadow: "0 8px 24px rgba(1,24,34,.28)"
                }}
              >
                <span className="text-[10.5px] font-semibold tracking-[.04em] text-[#B1BBC1]">
                  {hover === n - 1
                    ? t("todayDate", { date: formatDayLong(dates[hover]) })
                    : formatDayLong(dates[hover])}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatMeasure(measure.unit, vals[hover])}
                </span>
                {hasBands && (
                  <span className="text-[11px] text-[#B1BBC1] tabular-nums">
                    {t("sigmaVsMean", { sigma: formatSigma((vals[hover] - mu) / sd) })}
                  </span>
                )}
              </div>
            </>
          )}
          {vals.map((_, i) => (
            <div
              key={i}
              onMouseEnter={() => setHover(i)}
              className="absolute top-0 bottom-0 cursor-crosshair z-[4]"
              style={{
                left: `${n > 1 ? Math.max(0, x(i) - step / 2) : 0}%`,
                width: `${n > 1 ? step : 100}%`
              }}
            />
          ))}
        </div>
        <div className="relative text-[10.5px] font-bold tabular-nums" style={{ height: HEIGHT }}>
          {axisLabels.map((a) => (
            <span
              key={a.label}
              className="absolute left-0"
              style={{ top: y(mu + a.k * sd) - 8, color: a.color }}
            >
              {a.label}
            </span>
          ))}
        </div>
      </div>
      <div className="relative h-4 mr-12" style={{ borderTop: `1px solid ${COLORS.line}` }}>
        {ticks.map((t) => (
          <span
            key={t.left}
            className="absolute top-[3px] text-[10.5px] whitespace-nowrap"
            style={{ left: t.left, color: COLORS.faint }}
          >
            {t.label}
          </span>
        ))}
      </div>
      <div className="text-[11.5px]" style={{ color: COLORS.muted }}>
        {hasBands
          ? t("summary", {
              mean: formatMeasure(measure.unit, mu),
              sd: formatMeasure(measure.unit, sd),
              count: measure.history.length,
              days: historyDays
            })
          : t("notEnoughData", { days: historyDays })}
      </div>
    </div>
  );
}
