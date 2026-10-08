"use client";

import { Tooltip } from "antd";
import type { TooltipProps } from "antd";

import { cn } from "@/utils/utils";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { TONE_TEXT } from "../../constants";

export type TipRow =
  | { key: string; separator: true }
  | {
      key: string;
      separator?: false;
      /** Color del cuadrito (del API o un color CSS); sin él va vacío. */
      color?: string;
      label: string;
      /** Ya formateado. */
      value: string;
      /** Cuarta columna (p. ej. "% de la meta"). */
      tag?: string;
      strong?: boolean;
      tone?: "pos" | "neg";
    };

export interface TipContentProps {
  /** Corto y general (regla de diseño del prototipo). */
  title: string;
  rows: TipRow[];
  total?: { label: string; value: string };
}

/** Cuerpo de los tooltips de la torre: título, una fila por serie y un total opcional. */
export function TipContent({ title, rows, total }: TipContentProps) {
  const withTag = rows.some((r) => !r.separator && r.tag !== undefined);

  return (
    <div className="wallet-scope whitespace-nowrap text-[11.5px] leading-normal text-popover-foreground">
      <div className="mb-1.5 border-b border-border pb-[5px] font-bold">{title}</div>

      {rows.map((r) =>
        r.separator ? (
          <div key={r.key} className="my-[5px] border-t border-border" />
        ) : (
          <div
            key={r.key}
            className={cn(
              "grid items-center gap-2 py-0.5",
              withTag ? "grid-cols-[9px_1fr_auto_46px]" : "grid-cols-[9px_1fr_auto]"
            )}
          >
            <i className="block h-[9px] w-[9px] rounded-[2px]" style={{ background: r.color }} />
            <span className={r.strong ? "font-bold" : "opacity-85"}>{r.label}</span>
            <b
              className={cn(
                "pl-3.5 font-bold tabular-nums",
                r.tone === "pos" && TONE_TEXT.ok,
                r.tone === "neg" && TONE_TEXT.crit
              )}
            >
              {r.value}
            </b>
            {withTag && (
              <span
                className={cn(
                  "justify-self-end rounded px-[5px] text-[10px] font-bold tabular-nums",
                  r.tag && (r.strong ? "bg-wallet-accent-soft" : "bg-muted")
                )}
              >
                {r.tag}
              </span>
            )}
          </div>
        )
      )}

      {total && (
        <div className="mt-[5px] flex justify-between gap-4 border-t border-border pt-[5px] font-bold">
          <span>{total.label}</span>
          <b className="tabular-nums">{total.value}</b>
        </div>
      )}
    </div>
  );
}

/** Superficie de los tooltips: la de DetailTooltip (cartera), con los tokens del tema. */
const SURFACE: React.CSSProperties = {
  background: "rgb(var(--popover))",
  border: "1px solid rgb(var(--border))",
  borderRadius: 8,
  padding: "8px 10px",
  minWidth: 170,
  boxShadow: "0 8px 24px rgb(0 0 0 / 0.18)"
};

interface TowerTooltipProps extends TipContentProps {
  /** Un único hijo del DOM (también un <g> de SVG): AntD le cuelga el ref y los handlers. */
  children: React.ReactElement;
  placement?: TooltipProps["placement"];
  /** Segundos antes de abrir; los gráficos usan 0 para seguir el mouse día a día. */
  delay?: number;
}

/**
 * Tooltip de la torre. El contenido vive en un portal fuera de `.dark` y de
 * `.wallet-scope`, así que el tema se re-declara aquí, igual que en DetailTooltip.
 */
export default function TowerTooltip({
  children,
  placement = "top",
  delay = 0.15,
  ...content
}: TowerTooltipProps) {
  const { resolvedTheme } = useWalletTheme();

  return (
    <Tooltip
      title={<TipContent {...content} />}
      placement={placement}
      // Sin flecha: se quedaría con el color por defecto de AntD, no con SURFACE.
      arrow={false}
      mouseEnterDelay={delay}
      mouseLeaveDelay={0}
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      overlayInnerStyle={SURFACE}
    >
      {children}
    </Tooltip>
  );
}
