"use client";

import { useTranslations } from "use-intl";

import { cn } from "@/utils/utils";

import { RESULT_ORDER } from "../../constants";
import type { IVisitsLayers, IVisitsPalette } from "../../types";

interface MapOverlaysProps {
  layers: IVisitsLayers;
  onToggleLayer: (key: keyof IVisitsLayers) => void;
  /** Hay un asesor enfocado: sin interruptores y con la leyenda de su ruta. */
  focused: boolean;
  palette: IVisitsPalette;
}

/** Vidrio de las píldoras sobre el mapa (también lo usa el reloj de la esquina). */
export const GLASS = "border border-border bg-card/95 backdrop-blur-sm";

interface LayerChip {
  key: keyof IVisitsLayers;
  label: string;
  /** Etiqueta completa en pantallas anchas; en las angostas se ve sólo `label`. */
  fullLabel?: string;
  swatch: React.ReactNode;
}

/** Interruptores de capas (arriba a la izquierda) y leyenda (abajo a la izquierda). */
export default function MapOverlays({ layers, onToggleLayer, focused, palette }: MapOverlaysProps) {
  const tv = useTranslations("visits");
  const chips: LayerChip[] = [
    {
      key: "track",
      label: tv("layers.track"),
      fullLabel: tv("layers.trackFull"),
      swatch: <span className="w-3 border-t-2" style={{ borderColor: palette.bone }} />
    },
    {
      key: "plan",
      label: tv("layers.plan"),
      fullLabel: tv("layers.planFull"),
      swatch: (
        <span className="w-3 border-t-2 border-dashed" style={{ borderColor: palette.ink2 }} />
      )
    },
    {
      key: "clients",
      label: tv("layers.clients"),
      swatch: (
        <span className="h-2 w-2 rounded-full" style={{ background: palette.status.IN_VISIT }} />
      )
    }
  ];

  const dot = (color: string) => (
    <span className="h-[9px] w-[9px] rounded-full" style={{ background: color }} />
  );
  const results = RESULT_ORDER.map((r) => ({
    label: tv(`result.${r}`),
    mark: dot(palette.result[r])
  }));
  const legend = focused
    ? [
        {
          label: tv("legend.actualRoute"),
          mark: <span className="w-3.5 border-t-[3px]" style={{ borderColor: palette.accent }} />
        },
        {
          label: tv("legend.toVisit"),
          mark: (
            <span
              className="w-3.5 border-t-2 border-dashed"
              style={{ borderColor: palette.bone }}
            />
          )
        },
        ...results
      ]
    : [
        ...results,
        { label: tv("legend.inVisit"), mark: dot(palette.accent) },
        {
          label: tv("legend.pending"),
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
                "flex items-center gap-1.5 whitespace-nowrap rounded-full border border-transparent px-2 py-[3px] text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
                layers[c.key] && "border-wallet-accent bg-wallet-accent-soft text-foreground"
              )}
            >
              {c.swatch}
              {c.fullLabel ? (
                <>
                  <span className="max-[1200px]:hidden">{c.fullLabel}</span>
                  <span className="min-[1201px]:hidden">{c.label}</span>
                </>
              ) : (
                c.label
              )}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "absolute bottom-10 left-3 z-[2] flex max-w-[calc(100%-90px)] flex-wrap gap-x-3 gap-y-1 rounded-lg px-2.5 py-[7px] text-[13px] text-foreground/80 max-[1200px]:hidden",
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
