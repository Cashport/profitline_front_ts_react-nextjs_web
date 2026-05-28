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

import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";

const dailyData = [
  { label: "01", revenue: 450000 },
  { label: "02", revenue: 520000 },
  { label: "03", revenue: 600000 },
  { label: "04", revenue: 750000 },
  { label: "05", revenue: 850000 },
  { label: "06", revenue: 420000 },
  { label: "07", revenue: 500000 },
  { label: "08", revenue: 680000 },
  { label: "09", revenue: 700000 },
  { label: "10", revenue: 820000 },
  { label: "11", revenue: 950000 },
  { label: "12", revenue: 580000 },
  { label: "13", revenue: 650000 },
  { label: "14", revenue: 720000 },
  { label: "15", revenue: 800000 },
  { label: "16", revenue: 980000 },
  { label: "17", revenue: 1100000 },
  { label: "18", revenue: 850000 },
  { label: "19", revenue: 900000 },
  { label: "20", revenue: 1150000 },
  { label: "21", revenue: 1200000 },
  { label: "22", revenue: 950000 },
  { label: "23", revenue: 1050000 },
  { label: "24", revenue: 1250000 },
  { label: "25", revenue: 1300000 },
  { label: "26", revenue: 880000 },
  { label: "27", revenue: 950000 },
  { label: "28", revenue: 1100000 },
  { label: "29", revenue: 1150000 },
  { label: "30", revenue: 1250000 },
  { label: "31", revenue: 1400000 }
];

const weeklyData = [
  { label: "Sem 1", revenue: 2500000 },
  { label: "Sem 2", revenue: 3200000 },
  { label: "Sem 3", revenue: 4100000 },
  { label: "Sem 4", revenue: 3800000 }
];

const monthlyData = [
  { label: "Ene", revenue: 12000000 },
  { label: "Feb", revenue: 13500000 },
  { label: "Mar", revenue: 15000000 },
  { label: "Abr", revenue: 14200000 },
  { label: "May", revenue: 16800000 },
  { label: "Jun", revenue: 15500000 },
  { label: "Jul", revenue: 17200000 },
  { label: "Ago", revenue: 18000000 },
  { label: "Sep", revenue: 16500000 },
  { label: "Oct", revenue: 19000000 },
  { label: "Nov", revenue: 21000000 },
  { label: "Dic", revenue: 24500000 }
];

const ChartContent = ({
  data,
  xLabel,
  targetGoal
}: {
  data: any[];
  xLabel: string;
  targetGoal: number;
}) => (
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
        <XAxis
          dataKey="label"
          stroke="#a1a1aa"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `${xLabel} ${val}`.trim()}
        />
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
            color: "var(--muted-foreground)",
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
          labelFormatter={(label) => `${xLabel} ${label}`.trim()}
        />

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

        <Bar
          dataKey="revenue"
          name="revenue"
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

export default function RevenueChart() {
  const { filters, setFilters } = useRevenueTracking();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const frequency = filters?.frecuencia?.[0]?.name || "Diario";
  const dateRange = filters?.fecha?.[0]?.name || "Mes actual";

  const handleFrequencyChange = (newFreq: string) => {
    setFilters({
      ...filters,
      frecuencia: [{ id: newFreq, name: newFreq }]
    });
  };

  const { chartData, xLabel, subtext, targetGoal } = useMemo(() => {
    let rawData;
    let label;
    let text;
    let target;

    switch (frequency) {
      case "Semanal":
        rawData = weeklyData;
        label = "";
        text = "Ventas semanales acumuladas";
        target = 15000000;
        break;
      case "Mensual":
        rawData = monthlyData;
        label = "";
        text = "Evolución mensual histórica vs Meta";
        target = 180000000;
        break;
      case "Diario":
      default:
        rawData = dailyData;
        label = "Día";
        text = "Ventas diarias y avance mensual";
        target = 25000000;
        break;
    }

    const enrichedData = rawData.reduce((acc: any[], item) => {
      const prevTotal = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      acc.push({
        ...item,
        cumulative: prevTotal + item.revenue
      });
      return acc;
    }, []);

    return { chartData: enrichedData, xLabel: label, subtext: text, targetGoal: target };
  }, [frequency]);

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
              <button
                onClick={() => handleFrequencyChange("Diario")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                  frequency === "Diario"
                    ? "bg-background text-primary shadow-sm border border-border font-black"
                    : "hover:text-foreground opacity-60"
                }`}
              >
                D
              </button>
              <button
                onClick={() => handleFrequencyChange("Semanal")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                  frequency === "Semanal"
                    ? "bg-background text-primary shadow-sm border border-border font-black"
                    : "hover:text-foreground opacity-60"
                }`}
              >
                S
              </button>
              <button
                onClick={() => handleFrequencyChange("Mensual")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                  frequency === "Mensual"
                    ? "bg-background text-primary shadow-sm border border-border font-black"
                    : "hover:text-foreground opacity-60"
                }`}
              >
                M
              </button>
            </div>

            <Dialog.Trigger asChild>
              <button className="p-2.5 hover:bg-secondary rounded-xl text-muted-foreground hover:text-foreground transition-all shadow-sm border border-transparent hover:border-border">
                <Maximize2 className="w-4 h-4" />
              </button>
            </Dialog.Trigger>
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <ChartContent data={chartData} xLabel={xLabel} targetGoal={targetGoal} />
        </div>
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
                {frequency.toLowerCase()}).
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="p-3 hover:bg-secondary rounded-2xl text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border">
                <Minimize2 className="w-6 h-6" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ChartContent data={chartData} xLabel={xLabel} targetGoal={targetGoal} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
