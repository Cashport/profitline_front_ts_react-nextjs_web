"use client";

import { cn } from "@/utils/utils";

import { RESULT_LABELS, RESULT_ORDER } from "../../constants";
import type { IVisitsLayers, IVisitsPalette } from "../../types";

interface MapOverlaysProps {
  layers: IVisitsLayers;
  onToggleLayer: (key: keyof IVisitsLayers) => void;
  /** Hay un asesor enfocado: sin interruptores y con la leyenda de su ruta. */
  focused: boolean;
  palette: IVisitsPalette;
}

const GLASS = "border border-border bg-card/95 backdrop-blur-sm";

interface LayerChip {
  key: keyof IVisitsLayers;
  label: string;
  /** Se oculta en pantallas angostas. */
  suffix?: string;
  swatch: React.ReactNode;
}

/** Interruptores de capas (arriba a la izquierda) y leyenda (abajo a la izquierda). */
export default function MapOverlays({ layers, onToggleLayer, focused, palette }: MapOverlaysProps) {
  const chips: LayerChip[] = [
    {
      key: "track",
      label: "Recorrido",
      suffix: " hecho",
      swatch: <span className="w-3 border-t-2" style={{ borderColor: palette.bone }} />
    },
    {
      key: "plan",
      label: "Plan",
      suffix: " pendiente",
      swatch: (
        <span className="w-3 border-t-2 border-dashed" style={{ borderColor: palette.ink2 }} />
      )
    },
    {
      key: "clients",
      label: "Clientes",
      swatch: (
        <span className="h-2 w-2 rounded-full" style={{ background: palette.status.IN_VISIT }} />
      )
    }
  ];

  const dot = (color: string) => (
    <span className="h-[9px] w-[9px] rounded-full" style={{ background: color }} />
  );
  const results = RESULT_ORDER.map((r) => ({
    label: RESULT_LABELS[r],
    mark: dot(palette.result[r])
  }));
  const legend = focused
    ? [
        {
          label: "Recorrido real",
          mark: <span className="w-3.5 border-t-[3px]" style={{ borderColor: palette.accent }} />
        },
        {
          label: "Por visitar",
          mark: (
            <span className="w-3.5 border-t-2 border-dashed" style={{ borderColor: palette.bone }} />
          )
        },
        ...results
      ]
    : [
        ...results,
        { label: "En visita", mark: dot(palette.accent) },
        {
          label: "Pendiente",
          mark: (
            <span
              className="h-[9px] w-[9px] rounded-full border-[1.5px]"
              style={{ borderColor: palette.bone }}
            />
          )
        }
      ];

  return (
    <>
      {!focused && (
        <div
          className={cn(
            "absolute left-3 top-3 z-[2] flex max-w-[calc(100%-24px)] flex-nowrap gap-[5px] rounded-full p-1",
            GLASS
          )}
        >
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={layers[c.key]}
              onClick={() => onToggleLayer(c.key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-transparent px-2 py-[3px] text-[11.5px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                layers[c.key] && "border-wallet-accent bg-wallet-accent-soft text-foreground"
              )}
            >
              {c.swatch}
              {c.label}
              {c.suffix && <span className="max-[1200px]:hidden">{c.suffix}</span>}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "absolute bottom-10 left-3 z-[2] flex max-w-[calc(100%-90px)] flex-wrap gap-x-3 gap-y-1 rounded-lg px-2.5 py-[7px] text-[11px] text-foreground/80 max-[1200px]:hidden",
          GLASS
        )}
      >
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
            {item.mark}
            {item.label}
          </div>
        ))}
      </div>
    </>
  );
}
