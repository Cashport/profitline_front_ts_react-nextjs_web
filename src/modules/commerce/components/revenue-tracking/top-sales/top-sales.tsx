"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type CategoryKey = "producto" | "cliente" | "ciudad" | "vendedor";

const topData = {
  producto: [
    {
      rank: 1,
      name: "Cetaphil Limpiadora P. Grasa 473ml",
      subtitle: "13 unidades vendidas",
      value: "$ 770.406"
    },
    {
      rank: 2,
      name: "Ceta HA Eye Serum 15 gr",
      subtitle: "10 unidades vendidas",
      value: "$ 657.825"
    },
    {
      rank: 3,
      name: "Cetaphil Sun Oil Color 50",
      subtitle: "9 unidades vendidas",
      value: "$ 621.837"
    },
    {
      rank: 4,
      name: "Ceta Vita C Serum 24x1oz",
      subtitle: "8 unidades vendidas",
      value: "$ 680.848"
    },
    {
      rank: 5,
      name: "Cetaphil Toallitas x 25 unid",
      subtitle: "7 unidades vendidas",
      value: "$ 228.900"
    },
    {
      rank: 6,
      name: "Loción Hidratante Cetaphil 473ml",
      subtitle: "6 unidades vendidas",
      value: "$ 410.200"
    },
    {
      rank: 7,
      name: "Cetaphil Dermacontrol Espuma",
      subtitle: "5 unidades vendidas",
      value: "$ 380.000"
    },
    {
      rank: 8,
      name: "Crema Hidratante Piel Seca",
      subtitle: "5 unidades vendidas",
      value: "$ 350.500"
    },
    {
      rank: 9,
      name: "Protector Solar Kids 50+",
      subtitle: "4 unidades vendidas",
      value: "$ 310.000"
    },
    { rank: 10, name: "Gel Limpiador Suave", subtitle: "3 unidades vendidas", value: "$ 180.000" }
  ],
  cliente: [
    {
      rank: 1,
      name: "Sociedad Integral de Especialistas",
      subtitle: "34 órdenes",
      value: "$ 14.496.222"
    },
    { rank: 2, name: "Droguerías Cruz Verde", subtitle: "28 órdenes", value: "$ 3.594.148" },
    { rank: 3, name: "Grupo Afin Farmaceutica", subtitle: "22 órdenes", value: "$ 3.791.562" },
    { rank: 4, name: "Vidamedical Bogota", subtitle: "18 órdenes", value: "$ 2.501.687" },
    { rank: 5, name: "Helpharma S.A.S.", subtitle: "15 órdenes", value: "$ 957.095" },
    { rank: 6, name: "Virrey Solis IPS SA", subtitle: "12 órdenes", value: "$ 840.150" },
    { rank: 7, name: "Piel y Belleza Clínica", subtitle: "10 órdenes", value: "$ 750.000" },
    { rank: 8, name: "Farmacias Pasteur", subtitle: "9 órdenes", value: "$ 620.300" },
    { rank: 9, name: "Locatel Colombia", subtitle: "8 órdenes", value: "$ 540.000" },
    { rank: 10, name: "Copservir Ltda", subtitle: "5 órdenes", value: "$ 350.000" }
  ],
  ciudad: [
    { rank: 1, name: "Bogotá", subtitle: "450 órdenes", value: "$ 85.400.000" },
    { rank: 2, name: "Medellín", subtitle: "210 órdenes", value: "$ 42.100.000" },
    { rank: 3, name: "Cali", subtitle: "180 órdenes", value: "$ 35.600.000" },
    { rank: 4, name: "Barranquilla", subtitle: "120 órdenes", value: "$ 24.800.000" },
    { rank: 5, name: "Bucaramanga", subtitle: "90 órdenes", value: "$ 18.500.000" },
    { rank: 6, name: "Cartagena", subtitle: "65 órdenes", value: "$ 14.200.000" },
    { rank: 7, name: "Pereira", subtitle: "45 órdenes", value: "$ 9.100.000" },
    { rank: 8, name: "Manizales", subtitle: "30 órdenes", value: "$ 6.400.000" },
    { rank: 9, name: "Santa Marta", subtitle: "25 órdenes", value: "$ 4.800.000" },
    { rank: 10, name: "Cúcuta", subtitle: "15 órdenes", value: "$ 2.900.000" }
  ],
  vendedor: [
    {
      rank: 1,
      name: "Cashport AI",
      subtitle: "1,240 órdenes automatizadas",
      value: "$ 245.800.000"
    },
    { rank: 2, name: "Carlos Rojas", subtitle: "145 órdenes", value: "$ 28.500.000" },
    { rank: 3, name: "Maria C. Gomez", subtitle: "120 órdenes", value: "$ 24.100.000" },
    { rank: 4, name: "Diana Martinez", subtitle: "98 órdenes", value: "$ 19.400.000" },
    { rank: 5, name: "Juan P. Silva", subtitle: "85 órdenes", value: "$ 16.800.000" },
    { rank: 6, name: "Andrea Osorio", subtitle: "72 órdenes", value: "$ 14.200.000" },
    { rank: 7, name: "Venta Directa Tienda", subtitle: "65 órdenes", value: "$ 12.500.000" },
    { rank: 8, name: "Luis Morales", subtitle: "54 órdenes", value: "$ 10.100.000" },
    { rank: 9, name: "Sofia Restrepo", subtitle: "48 órdenes", value: "$ 9.300.000" },
    { rank: 10, name: "B2B Portal", subtitle: "42 órdenes automáticas", value: "$ 8.800.000" }
  ]
};

const categoryLabels = {
  producto: { name: "Productos", unit: "Unid.", total: 25, pareto: 4 },
  cliente: { name: "Clientes", unit: "Órdenes", total: 124, pareto: 18 },
  ciudad: { name: "Ciudades", unit: "Órdenes", total: 15, pareto: 3 },
  vendedor: { name: "Vendedores", unit: "Órdenes", total: 12, pareto: 2 }
};

export default function TopSales() {
  const [category, setCategory] = useState<CategoryKey>("producto");

  const currentData = topData[category];
  const labels = categoryLabels[category];

  const totalSales = currentData.reduce((acc, item) => {
    return acc + parseInt(item.value.replace(/\D/g, ""), 10);
  }, 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-5 shrink-0 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1.5">Top de ventas</h3>
          <p className="text-sm font-bold text-muted-foreground">
            {labels.name} {labels.total} -{" "}
            <span className="text-primary">Pareto {labels.pareto}</span>
          </p>
        </div>

        <div className="relative shrink-0">
          <select
            className="appearance-none bg-secondary border border-border text-foreground text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-primary/50 transition-colors w-28 sm:w-32"
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
          >
            <option value="producto">Producto</option>
            <option value="cliente">Cliente</option>
            <option value="ciudad">Ciudad</option>
            <option value="vendedor">Vendedor</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-[28px_1fr_40px_80px_70px] sm:grid-cols-[32px_1fr_60px_100px_90px] gap-2 sm:gap-4 items-center px-1 mb-3 text-[11px] sm:text-xs font-semibold text-muted-foreground">
          <div></div>
          <div className="text-left">{labels.name}</div>
          <div className="text-left">{labels.unit}</div>
          <div className="text-left">Ventas</div>
          <div className="text-left">%</div>
        </div>

        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 sm:pr-3 no-scrollbar sm:scrollbar-thin sm:scrollbar-thumb-white/10 sm:scrollbar-track-transparent">
          {currentData.map((item) => {
            const itemVal = parseInt(item.value.replace(/\D/g, ""), 10);
            const percentage = totalSales > 0 ? (itemVal / totalSales) * 100 : 0;
            const unitValue = item.subtitle ? item.subtitle.split(" ")[0] : "-";

            return (
              <div
                key={item.rank}
                className="grid grid-cols-[28px_1fr_40px_80px_70px] sm:grid-cols-[32px_1fr_60px_100px_90px] gap-2 sm:gap-4 items-center group/item hover:bg-muted p-1 rounded-lg transition-colors"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded sm:rounded-lg bg-secondary border border-border text-primary font-bold text-[10px] sm:text-sm flex items-center justify-center shrink-0">
                  {item.rank}
                </div>
                <div className="min-w-0 pr-1 sm:pr-2 relative group/name text-left">
                  <h4 className="text-[13px] sm:text-sm font-medium text-foreground truncate cursor-default">
                    {item.name}
                  </h4>
                  <div className="absolute left-0 top-full mt-1 hidden group-hover/name:block z-50 pointer-events-none">
                    <div className="bg-popover text-popover-foreground text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-border whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                      {item.name}
                    </div>
                  </div>
                </div>

                <div className="text-left text-[13px] sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {unitValue}
                </div>

                <div className="text-left">
                  <span className="text-[13px] sm:text-sm font-bold text-foreground tabular-nums">
                    {item.value}
                  </span>
                </div>

                <div className="flex items-center justify-start gap-1.5 sm:gap-2">
                  <div className="w-3.5 sm:w-5 h-1 bg-border rounded-full overflow-hidden shrink-0 hidden sm:block">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground text-left w-8 sm:w-10 shrink-0 tabular-nums">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
