"use client";

import { useState, useMemo, useRef } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import { Maximize2, Minimize2, ChevronDown } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

const dimensionOptions = [
  { value: "linea", label: "Línea de Negocio" },
  { value: "producto", label: "Producto" },
  { value: "vendedor", label: "Vendedor" },
  { value: "ciudad", label: "Ciudad" },
  { value: "cliente", label: "Cliente" },
  { value: "canal", label: "Canal de Venta" }
];

const DIMENSIONS = {
  linea: ["Dermatología", "Pediatría", "Cuidado Facial", "Solar", "Corporal"],
  producto: [
    "Cetaphil Limp.",
    "Ceta HA Serum",
    "Sun Oil Color",
    "Crema bebé",
    "Shampoo suave",
    "Loción Hid.",
    "Toallitas Ds",
    "Eucerin ph5"
  ],
  vendedor: [
    "Carlos Rojas",
    "Maria Gomez",
    "Cashport AI",
    "Diana Martinez",
    "Juan Silva",
    "Venta Directa"
  ],
  ciudad: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Cartagena"],
  cliente: ["Cruz Verde", "Farmatodo", "Pasteur", "Locatel", "La Rebaja", "Kopservir"],
  canal: ["Retail", "Mayorista", "E-commerce", "Institucional", "Portales B2B"]
};

const rawData = Array.from({ length: 300 }).map((_, i) => ({
  linea: DIMENSIONS.linea[i % DIMENSIONS.linea.length],
  producto: DIMENSIONS.producto[i % DIMENSIONS.producto.length],
  vendedor: DIMENSIONS.vendedor[i % DIMENSIONS.vendedor.length],
  ciudad: DIMENSIONS.ciudad[i % DIMENSIONS.ciudad.length],
  cliente: DIMENSIONS.cliente[i % DIMENSIONS.cliente.length],
  canal: DIMENSIONS.canal[i % DIMENSIONS.canal.length],
  value: ((i * 13) % 50000) + 5000
}));

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

function groupData(
  data: typeof rawData,
  dim1: keyof typeof DIMENSIONS,
  dim2: keyof typeof DIMENSIONS
) {
  const grouped: Record<string, Record<string, number>> = {};

  data.forEach((item) => {
    const k1 = item[dim1];
    const k2 = item[dim2];
    if (!grouped[k1]) grouped[k1] = {};
    if (!grouped[k1][k2]) grouped[k1][k2] = 0;
    grouped[k1][k2] += item.value;
  });

  const children = Object.keys(grouped).map((k1) => ({
    name: k1,
    children: Object.keys(grouped[k1]).map((k2) => ({
      name: k2,
      value: grouped[k1][k2]
    }))
  }));

  return { name: "root", children };
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(val);
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
          style={{ fill: baseColor, stroke: "#fff", strokeWidth: 2 }}
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

    const headerTextFill = parent && parent.color === "#C6F135" ? "#000" : "#fff";

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{ fill: "transparent", stroke: "#fff", strokeWidth: 1 }}
        />
        {labelVisible ? (
          <text
            x={x + 4}
            y={labelY}
            fill="#fff"
            fontSize={9}
            fontWeight={300}
            style={{ textShadow: "0px 1px 1px rgba(0,0,0,0.25)" }}
          >
            {name.length * 5.5 > width
              ? `${name.substring(0, Math.max(1, Math.floor(width / 5.5)))}…`
              : name}
          </text>
        ) : null}
        {parent ? (
          <g pointerEvents="none">
            <rect
              x={parent.x}
              y={parent.y}
              width={parent.width}
              height={HEADER_H}
              style={{ fill: parent.color, stroke: "#fff", strokeWidth: 1 }}
            />
            <text
              x={parent.x + 8}
              y={parent.y + 15}
              fill={headerTextFill}
              fontSize={11}
              fontWeight={500}
            >
              {parent.name}
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
        stroke="#fff"
        fill="#8884d8"
        isAnimationActive={false}
        content={
          <CustomizedContent
            colorMapping={colorMapping}
            parentRectsRef={parentRectsRef}
          />
        }
      >
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const node: any = payload[0].payload;
            return (
              <div className="bg-popover/95 text-popover-foreground border border-border p-3 rounded-lg shadow-xl backdrop-blur-md">
                <div className="font-bold text-base">{node.name}</div>
                <div className="text-primary">{formatCurrency(node.value)}</div>
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
  const [activeDim1, setActiveDim1] = useState<keyof typeof DIMENSIONS>("linea");
  const [activeDim2, setActiveDim2] = useState<keyof typeof DIMENSIONS>("producto");

  const chartData = useMemo(() => groupData(rawData, activeDim1, activeDim2), [
    activeDim1,
    activeDim2
  ]);

  const colorMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    chartData.children.forEach((c, i) => {
      mapping[c.name] = COLORS[i % COLORS.length];
    });
    return mapping;
  }, [chartData]);

  return (
    <Dialog.Root open={isFullscreen} onOpenChange={setIsFullscreen}>
      <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 shrink-0 bg-card z-10">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Análisis cruzado (Treemap 2D)
            </h3>
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
                  onChange={(e) =>
                    setActiveDim1(e.target.value as keyof typeof DIMENSIONS)
                  }
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
                  onChange={(e) =>
                    setActiveDim2(e.target.value as keyof typeof DIMENSIONS)
                  }
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

        <div className="w-full h-[420px] bg-background relative">
          <TreemapRender data={chartData} colorMapping={colorMapping} />
        </div>
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
          <div className="flex-1 w-full min-h-0 relative">
            <TreemapRender data={chartData} colorMapping={colorMapping} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
