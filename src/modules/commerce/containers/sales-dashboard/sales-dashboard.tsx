"use client";

import React from "react";
import useSWR from "swr";
import { DollarSign, Package, Users, Clock, TrendingUp } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { getSalesDashboard } from "@/services/commerce/commerce";

import { Card, CardContent } from "@/modules/chat/ui/card";
import SalesTable from "@/modules/commerce/components/sales-dashboard/salesTable/salesTable";


export default function SalesDashboard() {
  const { data: salesData, isLoading } = useSWR("/sales/dashboard", getSalesDashboard);
  const formatMoney = useAppStore((state) => state.formatMoney);

  // Handle loading state
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando datos...</p>
      </main>
    );
  }

  // Handle error or no data state
  if (!salesData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>No hay datos disponibles</p>
      </main>
    );
  }

  const { total: iaTotal, seller_leaders } = salesData;

  return (
    <main className="min-h-screen">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="bg-background border-0 shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
                  Ventas del mes
                </p>
                <p className="text-lg sm:text-2xl font-bold text-cashport-black mt-0.5 sm:mt-1">
                  {formatMoney(iaTotal.total_sales_month, { hideDecimals: true })}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-cashport-green rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-cashport-black" />
              </div>
            </div>
            <div className="flex items-center mt-1.5 sm:mt-3 text-[10px] sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                {iaTotal.percentage_sales_comparison}%
              </span>
              <span className="text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-0 shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
                  Productos vendidos
                </p>
                <p className="text-lg sm:text-2xl font-bold text-cashport-black mt-0.5 sm:mt-1">
                  {iaTotal.total_products_month}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Package className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-1.5 sm:mt-3 text-[10px] sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                {iaTotal.percentage_products_comparison}%
              </span>
              <span className="text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-0 shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
                  Clientes activos
                </p>
                <p className="text-lg sm:text-2xl font-bold text-cashport-black mt-0.5 sm:mt-1">
                  {iaTotal.unique_clients_month}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-1.5 sm:mt-3 text-[10px] sm:text-sm">
              <span className="text-muted-foreground">Total de clientes únicos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background border-0 shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
                  Órdenes pendientes
                </p>
                <p className="text-lg sm:text-2xl font-bold text-cashport-black mt-0.5 sm:mt-1">
                  {iaTotal.orders_pending_month}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
            <div className="flex items-center mt-1.5 sm:mt-3 text-[10px] sm:text-sm">
              <span className="text-muted-foreground">Requieren atención</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <Card className="bg-background border-0 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold">
              Histórico de ventas
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <ChartContainer
              config={{
                ventas: {
                  label: "Ventas",
                  color: "hsl(var(--chart-1))"
                }
              }}
              className="w-full aspect-[4/2] sm:aspect-[16/5] lg:aspect-[4/2]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} tickMargin={8} />
                  <YAxis
                    stroke="#6b7280"
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
                    tick={{ fontSize: 11 }}
                    width={50}
                    tickMargin={8}
                  />
                  <RechartsTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="var(--color-cashport-green)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-cashport-green)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-0">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold">
              Distribución por producto
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Ventas por categoría de producto
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer
              config={{
                value: {
                  label: "Ventas",
                  color: "hsl(var(--chart-1))"
                }
              }}
              className="h-[125px] sm:h-[200px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={productDistribution}
                  dataKey="value"
                  stroke="#fff"
                  content={<CustomTreemapContent />}
                />
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div> */}

      <SalesTable seller_leaders={seller_leaders} iaTotal={iaTotal} />
    </main>
  );
}
