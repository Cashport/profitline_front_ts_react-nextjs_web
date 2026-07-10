"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { Maximize2, Minimize2, TrendingUp } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import dayjs from "dayjs";

import {
  useRevenueTracking,
  type FilterOption
} from "@/modules/commerce/contexts/revenue-tracking-context";
import { useDashboardSalesEvolucion } from "@/modules/commerce/hooks/revenue-tracking/useDashboardSalesEvolucion";

type ChartDatum = { label: string; revenue: number; cumulative: number };

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic"
];

// The evolución endpoint encodes `date` differently per frequency, so a single dayjs parse fails
// for the non-daily forms (semanal "2026-W19", mensual "2026-05", trimestral "2026-Q2", anual "2026").
const formatSeriesLabel = (raw: string): string => {
  const week = raw.match(/^\d{4}-W(\d{1,2})$/);
  if (week) return `S${Number(week[1])}`;

  const quarter = raw.match(/^\d{4}-Q(\d)$/);
  if (quarter) return `Q${quarter[1]}`;

  const month = raw.match(/^\d{4}-(\d{2})$/);
  if (month) return MONTHS_ES[Number(month[1]) - 1] ?? raw;

  if (/^\d{4}$/.test(raw)) return raw;

  const day = dayjs(raw);
  return day.isValid() ? day.format("DD/MM") : raw;
};

const ChartContent = ({ data, targetGoal }: { data: ChartDatum[]; targetGoal?: number }) => (
  <div className="h-full w-full min-h-[440px]">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF5500" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#FF5500" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis dataKey="label" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#a1a1aa"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${value / 1000}k`
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgb(9, 9, 11)",
            borderColor: "rgb(39, 39, 42)",
            borderRadius: "12px",
            border: "1px solid rgb(39, 39, 42)",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)"
          }}
          itemStyle={{ fontSize: "12px", fontWeight: "600" }}
          labelStyle={{
            color: "#a1a1aa",
            marginBottom: "8px",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}
          formatter={(value: any, name: string) => {
            if (name === "cumulative") return [`$ ${value.toLocaleString()}`, "Acumulado"];
            if (name === "revenue") return [`$ ${value.toLocaleString()}`, "Venta Periodo"];
            return [`$ ${value.toLocaleString()}`, name];
          }}
        />

        {targetGoal != null && (
          <ReferenceLine
            y={targetGoal}
            stroke="#22c55e"
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{
              position: "top",
              value: `META: $${(targetGoal / 1000000).toFixed(1)}M`,
              fill: "#22c55e",
              fontSize: 10,
              fontWeight: "bold",
              className: "tracking-wider"
            }}
          />
        )}

        <Bar
          dataKey="revenue"
          name="revenue"
          fill="#3b82f6"
          barSize={20}
          radius={[4, 4, 0, 0]}
          animationDuration={1000}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.revenue > 1000000 ? "#3b82f6" : "#6366f1"}
              fillOpacity={0.4}
            />
          ))}
        </Bar>

        <Area
          type="monotone"
          dataKey="cumulative"
          name="cumulative"
          stroke="none"
          fill="url(#colorCumulative)"
          tooltipType="none"
          animationDuration={1500}
        />

        <Line
          type="monotone"
          dataKey="cumulative"
          name="cumulative"
          stroke="#FF5500"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: "#FF5500", stroke: "#fff", strokeWidth: 2 }}
          animationDuration={1500}
        />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

const FREQUENCY_OPTIONS: { short: string; option: FilterOption }[] = [
  { short: "D", option: { id: "diaria", name: "Diaria" } },
  { short: "S", option: { id: "semanal", name: "Semanal" } },
  { short: "M", option: { id: "mensual", name: "Mensual" } }
];

const SUBTEXT_BY_FREQUENCY: Record<string, string> = {
  diaria: "Ventas diarias y avance acumulado",
  semanal: "Ventas semanales acumuladas",
  mensual: "Evolución mensual acumulada",
  trimestral: "Evolución trimestral acumulada",
  anual: "Evolución anual acumulada"
};

export default function RevenueChart() {
  const { filters, setFilters } = useRevenueTracking();
  const { data, isLoading } = useDashboardSalesEvolucion(filters);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const frequency = filters?.frecuencia?.[0]?.id || "diaria";
  const frequencyLabel = filters?.frecuencia?.[0]?.name || "Diaria";
  const dateRange = filters?.fecha?.[0]?.name || "Mes actual";

  const handleFrequencyChange = (option: FilterOption) => {
    setFilters({
      ...filters,
      frecuencia: [option]
    });
  };

  const chartData = useMemo<ChartDatum[]>(() => {
    const series = data?.series ?? [];
    const isCumulative = data?.cumulative ?? false;

    return series.reduce<ChartDatum[]>((acc, point, i) => {
      const prevValue = i > 0 ? series[i - 1].value : 0;
      const prevCumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      const revenue = isCumulative ? point.value - prevValue : point.value;
      const cumulative = isCumulative ? point.value : prevCumulative + point.value;
      acc.push({ label: formatSeriesLabel(point.date), revenue, cumulative });
      return acc;
    }, []);
  }, [data]);

  const subtext = SUBTEXT_BY_FREQUENCY[frequency] ?? "Evolución de ingresos";
  const hasData = chartData.length > 0;

  const renderBody = () => {
    if (isLoading && !data) {
      return (
        <div className="h-full w-full min-h-[440px] flex items-center justify-center text-sm text-muted-foreground">
          Cargando…
        </div>
      );
    }
    if (!hasData) {
      return (
        <div className="h-full w-full min-h-[440px] flex items-center justify-center text-sm text-muted-foreground">
          Sin datos
        </div>
      );
    }
    return <ChartContent data={chartData} />;
  };

  return (
    <Dialog.Root open={isFullscreen} onOpenChange={setIsFullscreen}>
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full text-foreground shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-orange-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Evolución de ingresos</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {subtext} • <span className="text-foreground font-medium">{dateRange}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <div className="flex items-center gap-1 bg-secondary/50 rounded-xl border border-border p-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {FREQUENCY_OPTIONS.map(({ short, option }) => (
                <button
                  key={option.id}
                  onClick={() => handleFrequencyChange(option)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                    frequency === option.id
                      ? "bg-background text-primary shadow-sm border border-border font-black"
                      : "hover:text-foreground opacity-60"
                  }`}
                >
                  {short}
                </button>
              ))}
            </div>

            <Dialog.Trigger asChild>
              <button className="p-2.5 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-all shadow-sm border border-transparent hover:border-border">
                <Maximize2 className="w-4 h-4" />
              </button>
            </Dialog.Trigger>
          </div>
        </div>

        <div className="flex-1 w-full relative">{renderBody()}</div>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed inset-4 sm:inset-10 z-[120] bg-card border border-border rounded-2xl p-6 sm:p-10 flex flex-col focus:outline-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-start mb-10">
            <div>
              <Dialog.Title className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-500" />
                Evolución de ingresos
              </Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-2 text-base">
                {subtext} en <span className="text-foreground font-bold">{dateRange}</span> (
                {frequencyLabel.toLowerCase()}).
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-3 hover:bg-secondary rounded-2xl text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border">
                <Minimize2 className="w-6 h-6" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 w-full min-h-0">{renderBody()}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
