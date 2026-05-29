"use client";

import { useState, useMemo, useRef } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import { Maximize2, Minimize2, ChevronDown } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

import { useDashboardSalesTreemap } from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesTreemap";

type DimensionKey = "linea" | "producto" | "cliente" | "ciudad" | "vendedor" | "canal";

const dimensionOptions: { value: DimensionKey; label: string }[] = [
  { value: "linea", label: "Línea de Negocio" },
  { value: "producto", label: "Producto" },
  { value: "vendedor", label: "Vendedor" },
  { value: "ciudad", label: "Ciudad" },
  { value: "cliente", label: "Cliente" },
  { value: "canal", label: "Canal de Venta" }
];

const COLORS = [
  "#00E5FF",
  "#2979FF",
  "#C6F135",
  "#a855f7",
  "#10b981",
  "#f43f5e",
  "#f59e0b",
  "#3b82f6",
  "#ec4899"
];

function formatCurrency(val: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(val);
}

const isLightColor = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
};

// Measure label widths accurately so SVG labels can be truncated to fit their
// cell instead of relying on a per-character heuristic (which over/underestimates
// proportional fonts and lets long names overflow into neighboring cells).
let measureCtx: CanvasRenderingContext2D | null = null;
let measureFontFamily: string | null = null;

function measureTextWidth(text: string, fontWeight: number) {
  if (typeof document === "undefined") return text.length * 6.5;
  if (!measureCtx) {
    measureCtx = document.createElement("canvas").getContext("2d");
    measureFontFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
  }
  if (!measureCtx) return text.length * 6.5;
  measureCtx.font = `${fontWeight} 12px ${measureFontFamily}`;
  return measureCtx.measureText(text).width;
}

// Returns the longest prefix of `text` that fits within `maxWidth` (appending an
// ellipsis when truncated), or "" when not even one character fits.
function truncateToWidth(text: string, maxWidth: number, fontWeight: number) {
  if (maxWidth <= 0) return "";
  if (measureTextWidth(text, fontWeight) <= maxWidth) return text;
  const ellipsis = "…";
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measureTextWidth(text.slice(0, mid) + ellipsis, fontWeight) <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo > 0 ? text.slice(0, lo) + ellipsis : "";
}

const HEADER_H = 22;

type ParentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  name: string;
};

interface CustomizedContentProps {
  root?: any;
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  group?: string;
  colorMapping: Record<string, string>;
  parentRectsRef: React.MutableRefObject<ParentRect[]>;
}

const CustomizedContent = (props: CustomizedContentProps) => {
  const {
    depth = 0,
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    index = 0,
    name = "",
    group = "",
    colorMapping,
    parentRectsRef
  } = props;

  if (depth === 1) {
    const baseColor = colorMapping[name] ?? COLORS[index % COLORS.length];
    const existing = parentRectsRef.current.find((p) => p.name === name);
    const rect: ParentRect = { x, y, width, height, color: baseColor, name };
    if (existing) {
      Object.assign(existing, rect);
    } else {
      parentRectsRef.current.push(rect);
    }
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{ fill: baseColor, stroke: "#ffffffe3", strokeWidth: 0.5 }}
        />
      </g>
    );
  }

  if (depth === 2) {
    const parent = parentRectsRef.current.find(
      (p) =>
        x >= p.x - 1 &&
        y >= p.y - 1 &&
        x + width <= p.x + p.width + 1 &&
        y + height <= p.y + p.height + 1
    );

    const inHeaderStrip = parent ? y < parent.y + HEADER_H - 1 : false;
    const labelY = inHeaderStrip ? Math.max(y + HEADER_H + 12, y + 12) : y + 12;
    const labelVisible = width > 30 && height > 16 && (!inHeaderStrip || height > HEADER_H + 14);
    // x + 4 left inset plus a small right margin.
    const labelText = labelVisible ? truncateToWidth(name, width - 8, 400) : "";

    // Derive the cell's background color from its own data (recharts passes the
    // leaf's `group` through), independent of the geometric parent lookup which
    // can return undefined and force every label to white.
    const groupColor = (group && colorMapping[group]) || parent?.color || "#8884d8";
    const textFill = isLightColor(groupColor) ? "#0a0a0a" : "#fff";
    // The header bar is filled with `parent.color`, so its label must contrast with that
    // color — not with the leaf's `groupColor`, which can diverge when a neighboring
    // group's leaf is geometrically matched onto this parent and repaints the header.
    const headerTextFill = isLightColor(parent?.color ?? groupColor) ? "#0a0a0a" : "#fff";
    const itemTextFill = textFill;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{ fill: "transparent", stroke: "#ffffffe3", strokeWidth: 0.5 }}
        />
        {labelText ? (
          <text
            x={x + 4}
            y={labelY}
            fontSize={12}
            fontWeight={400}
            style={{
              fill: itemTextFill,
              ...(itemTextFill === "#fff" ? { textShadow: "0px 1px 1px rgba(0,0,0,0.25)" } : {})
            }}
          >
            {labelText}
          </text>
        ) : null}
        {parent ? (
          <g pointerEvents="none">
            <rect
              x={parent.x}
              y={parent.y}
              width={parent.width}
              height={HEADER_H}
              style={{ fill: parent.color, stroke: "#ffffffe3", strokeWidth: 0.5 }}
            />
            <text
              x={parent.x + 8}
              y={parent.y + 15}
              fontSize={12}
              fontWeight={500}
              style={{ fill: headerTextFill }}
            >
              {truncateToWidth(parent.name, parent.width - 16, 500)}
            </text>
          </g>
        ) : null}
      </g>
    );
  }

  return null;
};

function TreemapRender({
  data,
  colorMapping
}: {
  data: { name: string; children: any[] };
  colorMapping: Record<string, string>;
}) {
  const parentRectsRef = useRef<ParentRect[]>([]);
  parentRectsRef.current = [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data.children}
        dataKey="value"
        aspectRatio={4 / 3}
        fill="#8884d8"
        isAnimationActive={false}
        content={<CustomizedContent colorMapping={colorMapping} parentRectsRef={parentRectsRef} />}
      >
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const node: any = payload[0].payload;
            return (
              <div className="bg-popover/95 text-popover-foreground border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
                {node.group ? (
                  <div className="text-xs text-muted-foreground mb-0.5">{node.group}</div>
                ) : null}
                <div className="font-bold text-base">{node.name}</div>
                <div className="text-primary">{formatCurrency(node.value)}</div>
                {typeof node.percentage === "number" ? (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {node.percentage.toFixed(1)}% del total
                  </div>
                ) : null}
              </div>
            );
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}

export default function ProductTreemap() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDim1, setActiveDim1] = useState<DimensionKey>("linea");
  const [activeDim2, setActiveDim2] = useState<DimensionKey>("producto");

  const { data, isLoading } = useDashboardSalesTreemap(activeDim1, activeDim2);

  const chartData = useMemo(
    () => ({
      name: "root",
      children: (data?.groups ?? []).map((g) => ({
        name: g.key,
        percentage: g.percentage,
        children: g.children.map((c) => ({
          name: c.key,
          value: c.value,
          percentage: c.percentage,
          group: g.key
        }))
      }))
    }),
    [data]
  );

  const colorMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    chartData.children.forEach((c, i) => {
      mapping[c.name] = COLORS[i % COLORS.length];
    });
    return mapping;
  }, [chartData]);

  const renderChart = () => {
    if (isLoading && !data) {
      return (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Cargando…
        </div>
      );
    }
    if (chartData.children.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Sin datos
        </div>
      );
    }
    return <TreemapRender data={chartData} colorMapping={colorMapping} />;
  };

  return (
    <Dialog.Root open={isFullscreen} onOpenChange={setIsFullscreen}>
      <div className="bg-card border-none rounded-2xl flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 shrink-0 bg-card z-10 border-t border-l border-r border-border rounded-t-2xl">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Análisis cruzado (Treemap 2D)</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Explora dos dimensiones combinadas en simultáneo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative bg-card border border-border rounded-lg">
                <select
                  className="appearance-none bg-transparent text-foreground text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none w-32 sm:w-36 cursor-pointer"
                  value={activeDim1}
                  onChange={(e) => setActiveDim1(e.target.value as DimensionKey)}
                >
                  {dimensionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === activeDim2}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              <span className="text-muted-foreground text-xs font-bold opacity-30">x</span>

              <div className="relative bg-card border border-border rounded-lg">
                <select
                  className="appearance-none bg-transparent text-foreground text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none w-32 sm:w-36 cursor-pointer"
                  value={activeDim2}
                  onChange={(e) => setActiveDim2(e.target.value as DimensionKey)}
                >
                  {dimensionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === activeDim1}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <Dialog.Trigger asChild>
              <button
                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                title="Pantalla completa"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </Dialog.Trigger>
          </div>
        </div>

        <div className="w-full h-[420px] bg-background relative">{renderChart()}</div>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed inset-4 sm:inset-10 z-[120] bg-card border border-border rounded-2xl p-6 sm:p-10 flex flex-col focus:outline-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-8">
            <div>
              <Dialog.Title className="text-2xl font-bold text-foreground">
                Análisis cruzado detallado
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-2">
                Agrupado por{" "}
                <span className="font-semibold text-foreground">
                  {dimensionOptions.find((d) => d.value === activeDim1)?.label}
                </span>{" "}
                cruzado con{" "}
                <span className="font-semibold text-foreground">
                  {dimensionOptions.find((d) => d.value === activeDim2)?.label}
                </span>
                . Pasa el cursor sobre los recuadros para revisar la estadística.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-3 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                <Minimize2 className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 w-full min-h-0 relative">{renderChart()}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
