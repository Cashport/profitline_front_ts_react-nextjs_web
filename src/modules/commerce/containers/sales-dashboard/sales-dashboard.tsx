"use client";

import React from "react";
import useSWR from "swr";
import { DollarSign, Package, Users, Clock, TrendingUp } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { getSalesDashboard } from "@/services/commerce/commerce";

import { Card, CardContent } from "@/modules/chat/ui/card";
import SalesTable from "@/modules/commerce/components/sales-dashboard/salesTable/salesTable";

const mockData = {
  invoices: [
    {
      fechaFactura: "2025-11-15",
      estado: "Facturado",
      monto: 2450000,
      cantidad: 45,
      comprador: "Droguería San José",
      productos: [
        { nombreProducto: "CETAPHIL SUN OIL COLOR 50 ML", cantidad: 20, precioTotal: 1200000 },
        { nombreProducto: "CETAPHIL LIMPIADORA 473ML", cantidad: 15, precioTotal: 850000 },
        { nombreProducto: "CETAPHIL CREMA HIDRAT 453GR", cantidad: 10, precioTotal: 400000 }
      ]
    },
    {
      fechaFactura: "2025-11-20",
      estado: "Facturado",
      monto: 3800000,
      cantidad: 60,
      comprador: "Farmacia La Salud",
      productos: [
        { nombreProducto: "CETA Vita C Serum 24x10 30ML", cantidad: 25, precioTotal: 1700000 },
        { nombreProducto: "CETAPHIL SUN KDS ISO 40x170", cantidad: 20, precioTotal: 1200000 },
        { nombreProducto: "CETAPHIL HIDRAT LOC 200ML", cantidad: 15, precioTotal: 900000 }
      ]
    },
    {
      fechaFactura: "2025-11-25",
      estado: "Facturado",
      monto: 1950000,
      cantidad: 35,
      comprador: "Distribuidora Médica Central",
      productos: [
        { nombreProducto: "CETAPHIL SUN OIL MATE 60 ML", cantidad: 18, precioTotal: 1080000 },
        { nombreProducto: "CET TOALLITAS X 25 UNID", cantidad: 17, precioTotal: 870000 }
      ]
    },
    {
      fechaFactura: "2025-11-10",
      estado: "En proceso",
      monto: 2200000,
      cantidad: 40,
      comprador: "Farmacia Esperanza",
      productos: [
        { nombreProducto: "CETAPHIL LIMPLOC 473", cantidad: 22, precioTotal: 1320000 },
        { nombreProducto: "CETA HA Eye Serum 15 gr", cantidad: 18, precioTotal: 880000 }
      ]
    },
    {
      fechaFactura: "2025-11-28",
      estado: "Facturado",
      monto: 5200000,
      cantidad: 85,
      comprador: "Droguería San José",
      productos: [
        { nombreProducto: "CETA BHR Perfecta24 Crema Día 50G", cantidad: 30, precioTotal: 2700000 },
        { nombreProducto: "CETAPHIL SUN OIL COLOR 50 ML", cantidad: 25, precioTotal: 1500000 },
        { nombreProducto: "CET OC IlumFac Mat 50ml", cantidad: 30, precioTotal: 1000000 }
      ]
    },
    {
      fechaFactura: "2025-10-15",
      estado: "Facturado",
      monto: 1800000,
      cantidad: 32,
      comprador: "Clínica del Norte",
      productos: [
        { nombreProducto: "CETAPHIL CREMA HIDRAT 453GR", cantidad: 20, precioTotal: 800000 },
        { nombreProducto: "CETAPHIL SUN KDS ISO 40x170", cantidad: 12, precioTotal: 1000000 }
      ]
    },
    {
      fechaFactura: "2025-10-22",
      estado: "Facturado",
      monto: 3200000,
      cantidad: 55,
      comprador: "Farmacia Universal",
      productos: [
        { nombreProducto: "CET OC IlumFac Mat 100ml", cantidad: 25, precioTotal: 2000000 },
        { nombreProducto: "CETAPHIL LIMPIADORA 473ML", cantidad: 30, precioTotal: 1200000 }
      ]
    },
    {
      fechaFactura: "2025-10-05",
      estado: "Cartera",
      monto: 2700000,
      cantidad: 48,
      comprador: "Distribuidora Médica Central",
      productos: [
        { nombreProducto: "CETAPHIL SUN OIL MATE 60 ML", cantidad: 28, precioTotal: 1680000 },
        { nombreProducto: "CETAPHIL HIDRAT LOC 200ML", cantidad: 20, precioTotal: 1020000 }
      ]
    },
    {
      fechaFactura: "2025-09-18",
      estado: "Facturado",
      monto: 4100000,
      cantidad: 70,
      comprador: "Farmacia La Salud",
      productos: [
        { nombreProducto: "CETA Vita C Serum 24x10 30ML", cantidad: 35, precioTotal: 2380000 },
        { nombreProducto: "CETA HA Eye Serum 15 gr", cantidad: 25, precioTotal: 1220000 },
        { nombreProducto: "CET TOALLITAS X 25 UNID", cantidad: 10, precioTotal: 500000 }
      ]
    },
    {
      fechaFactura: "2025-09-25",
      estado: "Facturado",
      monto: 1600000,
      cantidad: 28,
      comprador: "Droguería El Carmen",
      productos: [
        { nombreProducto: "CETAPHIL LIMPLOC 473", cantidad: 18, precioTotal: 1080000 },
        { nombreProducto: "CET TOALLITAS X 25 UNID", cantidad: 10, precioTotal: 520000 }
      ]
    },
    {
      fechaFactura: "2025-08-12",
      estado: "Facturado",
      monto: 2900000,
      cantidad: 50,
      comprador: "Clínica del Norte",
      productos: [
        { nombreProducto: "CETAPHIL SUN OIL COLOR 50 ML", cantidad: 30, precioTotal: 1800000 },
        { nombreProducto: "CETAPHIL CREMA HIDRAT 453GR", cantidad: 20, precioTotal: 1100000 }
      ]
    },
    {
      fechaFactura: "2025-08-20",
      estado: "Facturado",
      monto: 3500000,
      cantidad: 58,
      comprador: "Farmacia Universal",
      productos: [
        { nombreProducto: "CETA BHR Perfecta24 Crema Día 50G", cantidad: 28, precioTotal: 2520000 },
        { nombreProducto: "CET OC IlumFac Mat 50ml", cantidad: 30, precioTotal: 980000 }
      ]
    },
    {
      fechaFactura: "2025-07-15",
      estado: "Facturado",
      monto: 2100000,
      cantidad: 38,
      comprador: "Droguería San José",
      productos: [
        { nombreProducto: "CETAPHIL SUN OIL MATE 60 ML", cantidad: 22, precioTotal: 1320000 },
        { nombreProducto: "CETAPHIL HIDRAT LOC 200ML", cantidad: 16, precioTotal: 780000 }
      ]
    },
    {
      fechaFactura: "2025-07-28",
      estado: "Facturado",
      monto: 1850000,
      cantidad: 32,
      comprador: "Farmacia Esperanza",
      productos: [
        { nombreProducto: "CETAPHIL SUN KDS ISO 40x170", cantidad: 15, precioTotal: 1050000 },
        { nombreProducto: "CETAPHIL LIMPIADORA 473ML", cantidad: 17, precioTotal: 800000 }
      ]
    },
    {
      fechaFactura: "2025-06-10",
      estado: "Facturado",
      monto: 4200000,
      cantidad: 72,
      comprador: "Distribuidora Médica Central",
      productos: [
        { nombreProducto: "CETA Vita C Serum 24x10 30ML", cantidad: 38, precioTotal: 2584000 },
        { nombreProducto: "CET OC IlumFac Mat 100ml", cantidad: 20, precioTotal: 1616000 }
      ]
    },
    {
      fechaFactura: "2025-11-18",
      estado: "Novedad",
      monto: 1950000,
      cantidad: 35,
      comprador: "Farmacia La Salud",
      productos: [
        { nombreProducto: "CETAPHIL CREMA HIDRAT 453GR", cantidad: 25, precioTotal: 1000000 },
        { nombreProducto: "CET TOALLITAS X 25 UNID", cantidad: 10, precioTotal: 950000 }
      ]
    },
    {
      fechaFactura: "2025-11-22",
      estado: "Borrador",
      monto: 2600000,
      cantidad: 45,
      comprador: "Droguería El Carmen",
      productos: [
        { nombreProducto: "CETA HA Eye Serum 15 gr", cantidad: 30, precioTotal: 1460000 },
        { nombreProducto: "CETAPHIL LIMPLOC 473", cantidad: 15, precioTotal: 1140000 }
      ]
    },
    {
      fechaFactura: "2025-11-12",
      estado: "En proceso",
      monto: 3100000,
      cantidad: 52,
      comprador: "Clínica del Norte",
      productos: [
        { nombreProducto: "CETA BHR Perfecta24 Crema Día 50G", cantidad: 25, precioTotal: 2250000 },
        { nombreProducto: "CETAPHIL SUN OIL COLOR 50 ML", cantidad: 27, precioTotal: 850000 }
      ]
    }
  ]
};

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
