"use client";

import React from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Treemap
} from "recharts";
import {
  DollarSign,
  Package,
  Users,
  Clock,
  TrendingUp
} from "lucide-react";

import { getSalesDashboard } from "@/services/commerce/commerce";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/modules/chat/ui/chart";

import SalesTable from "@/modules/commerce/components/sales-dashboard/salesTable/salesTable";
import "@/modules/cetaphil/styles/cetaphilStyles.css";

type SalesData = {
  total: number;
  facturado: number;
  enProceso: number;
  cartera: number;
  borrador: number;
  cuota: number;
  avance: number;
  faltante: number;
  topProducts: { name: string; sales: number }[];
};

type Vendedor = {
  nombre: string;
  data: SalesData;
};

type Regional = {
  nombre: string;
  data: SalesData;
  vendedores: Vendedor[];
};

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySales = mockData.invoices
    .filter((invoice) => {
      const invoiceDate = new Date(invoice.fechaFactura);
      return (
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear &&
        invoice.estado === "Facturado"
      );
    })
    .reduce((sum, invoice) => sum + invoice.monto, 0);

  const totalProducts = mockData.invoices
    .filter((invoice) => {
      const invoiceDate = new Date(invoice.fechaFactura);
      return (
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear &&
        invoice.estado === "Facturado"
      );
    })
    .reduce((sum, invoice) => sum + invoice.cantidad, 0);

  const uniqueClients = new Set(mockData.invoices.map((invoice) => invoice.comprador)).size;

  const pendingOrders = mockData.invoices.filter((invoice) => invoice.estado === "Novedad").length;

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthName = date.toLocaleDateString("es-ES", { month: "short" });

    const sales = mockData.invoices
      .filter((invoice) => {
        const invoiceDate = new Date(invoice.fechaFactura);
        return (
          invoiceDate.getMonth() === month &&
          invoiceDate.getFullYear() === year &&
          invoice.estado === "Facturado"
        );
      })
      .reduce((sum, invoice) => sum + invoice.monto, 0);

    monthlyData.push({
      month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      ventas: sales
    });
  }

  const generateHierarchicalData = (): { iaTotal: SalesData; regionales: Regional[] } => {
    const regionales: Regional[] = [
      {
        nombre: "regional 1",
        data: {
          total: 0,
          facturado: 0,
          enProceso: 0,
          cartera: 0,
          borrador: 0,
          cuota: 150000000,
          avance: 0,
          faltante: 0,
          topProducts: []
        },
        vendedores: []
      },
      {
        nombre: "regional 2",
        data: {
          total: 0,
          facturado: 0,
          enProceso: 0,
          cartera: 0,
          borrador: 0,
          cuota: 200000000,
          avance: 0,
          faltante: 0,
          topProducts: []
        },
        vendedores: []
      },
      {
        nombre: "regional 3",
        data: {
          total: 0,
          facturado: 0,
          enProceso: 0,
          cartera: 0,
          borrador: 0,
          cuota: 180000000,
          avance: 0,
          faltante: 0,
          topProducts: []
        },
        vendedores: []
      }
    ];

    regionales.forEach((regional, idx) => {
      const vendedoresCount = 5;
      for (let i = 0; i < vendedoresCount; i++) {
        const facturado = Math.random() * 15000000;
        const enProceso = Math.random() * 8000000;
        const cartera = Math.random() * 5000000;
        const borrador = Math.random() * 3000000;
        const total = facturado + enProceso + cartera + borrador;
        const cuota = regional.data.cuota / vendedoresCount;
        const avance = (total / cuota) * 100;
        const faltante = Math.max(0, cuota - total);

        regional.vendedores.push({
          nombre: `Vendedor ${idx + 1}.${i + 1}`,
          data: {
            total,
            facturado,
            enProceso,
            cartera,
            borrador,
            cuota,
            avance,
            faltante,
            topProducts: []
          }
        });

        regional.data.facturado += facturado;
        regional.data.enProceso += enProceso;
        regional.data.cartera += cartera;
        regional.data.borrador += borrador;
      }

      regional.data.total =
        regional.data.facturado +
        regional.data.enProceso +
        regional.data.cartera +
        regional.data.borrador;
      regional.data.avance = (regional.data.total / regional.data.cuota) * 100;
      regional.data.faltante = Math.max(0, regional.data.cuota - regional.data.total);
    });

    const iaTotal: SalesData = {
      total: 0,
      facturado: 0,
      enProceso: 0,
      cartera: 0,
      borrador: 0,
      cuota: 0,
      avance: 0,
      faltante: 0,
      topProducts: []
    };

    regionales.forEach((regional) => {
      iaTotal.facturado += regional.data.facturado;
      iaTotal.enProceso += regional.data.enProceso;
      iaTotal.cartera += regional.data.cartera;
      iaTotal.borrador += regional.data.borrador;
    });

    iaTotal.total = iaTotal.facturado + iaTotal.enProceso + iaTotal.cartera + iaTotal.borrador;
    iaTotal.avance = (iaTotal.total / iaTotal.cuota) * 100;
    iaTotal.faltante = Math.max(0, iaTotal.cuota - iaTotal.total);

    return { iaTotal, regionales };
  };

  const { iaTotal, regionales } = generateHierarchicalData();

  const productSales = mockData.invoices.reduce(
    (acc, invoice) => {
      if (invoice.estado === "Facturado") {
        invoice.productos.forEach((product) => {
          if (!acc[product.nombreProducto]) {
            acc[product.nombreProducto] = {
              producto: product.nombreProducto,
              cantidad: 0,
              ventas: 0
            };
          }
          acc[product.nombreProducto].cantidad += product.cantidad;
          acc[product.nombreProducto].ventas += product.precioTotal;
        });
      }
      return acc;
    },
    {} as Record<string, { producto: string; cantidad: number; ventas: number }>
  );

  const productSalesArray = Object.values(productSales).sort((a, b) => b.ventas - a.ventas);

  const productDistribution = [
    {
      name: "Protección solar",
      children: [
        { name: "CETAPHIL SUN OIL COLOR 50 ML", value: 651837 },
        { name: "CETAPHIL SUN OIL MATE 60 ML", value: 271836 },
        { name: "CETAPHIL SUN KDS ISO 40x170", value: 357234 }
      ]
    },
    {
      name: "Limpieza facial",
      children: [
        { name: "CETAPHIL LIMPIADORA 473ML", value: 770405 },
        { name: "CETAPHIL LIMPLOC 473", value: 237048 }
      ]
    },
    {
      name: "Hidratación",
      children: [
        { name: "CETAPHIL CREMA HIDRAT 453GR", value: 383480 },
        { name: "CETAPHIL HIDRAT LOC 200ML", value: 228320 },
        { name: "CET TOALLITAS X 25 UNID", value: 228900 }
      ]
    },
    {
      name: "Tratamiento especializado",
      children: [
        { name: "CETA Vita C Serum 24x10 30ML", value: 680848 },
        { name: "CETA HA Eye Serum 15 gr", value: 657825 },
        { name: "CET OC IlumFac Mat 50ml", value: 268860 },
        { name: "CET OC IlumFac Mat 100ml", value: 369180 },
        { name: "CETA BHR Perfecta24 Crema Día 50G", value: 902744 }
      ]
    }
  ];

  const categoryColors = {
    "Protección solar": "#0EA5E9",
    "Limpieza facial": "#F97316",
    Hidratación: "#10B981",
    "Tratamiento especializado": "#14B8A6"
  };

  const adjustColorBrightness = (color: string, amount: number) => {
    const num = Number.parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, root, depth, children } = props;
    const isCategory = depth === 1;
    const categoryName = isCategory ? name : root?.name;
    const baseColor = categoryColors[categoryName as keyof typeof categoryColors] || "#6366F1";

    const fill = isCategory ? baseColor : adjustColorBrightness(baseColor, depth === 2 ? -15 : 0);

    const minWidthForText = isCategory ? 70 : 50;
    const minHeightForText = isCategory ? 30 : 35;
    const showText = width > minWidthForText && height > minHeightForText;

    const truncateName = (text?: string, maxLength: number = 20) => {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      const parts = text.split(" ");
      if (parts.length > 2) {
        return parts.slice(0, 2).join(" ") + "...";
      }
      return text.substring(0, maxLength) + "...";
    };

    const displayName = isCategory ? name : truncateName(name, 20);
    const fontSize = isCategory
      ? Math.max(Math.min(width / 12, 14), 11)
      : Math.max(Math.min(width / 12, 11), 9);

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          className="cursor-pointer transition-opacity hover:opacity-90"
        />
        {showText && (
          <>
            {isCategory ? (
              <text
                x={x + 6}
                y={y + 18}
                fill="#ffffff"
                fontSize={fontSize}
                fontWeight="600"
                style={{
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  paintOrder: "stroke fill"
                }}
              >
                {displayName}
              </text>
            ) : (
              <>
                <text
                  x={x + width / 2}
                  y={y + height / 2 - 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={fontSize}
                  fontWeight="500"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.25)"
                  }}
                >
                  {displayName}
                </text>
                <text
                  x={x + width / 2}
                  y={y + height / 2 + fontSize + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={fontSize * 0.9}
                  fontWeight="400"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.25)"
                  }}
                >
                  {new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    notation: "compact",
                    compactDisplay: "short"
                  }).format(children?.[0]?.value || 0)}
                </text>
              </>
            )}
          </>
        )}
      </g>
    );
  };

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
                  {formatCurrency(monthlySales)}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-cashport-green rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-cashport-black" />
              </div>
            </div>
            <div className="flex items-center mt-1.5 sm:mt-3 text-[10px] sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
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
                  {totalProducts.toLocaleString()}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Package className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-1.5 sm:mt-3 text-[10px] sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+8.2%</span>
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
                  {uniqueClients}
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
                  {pendingOrders}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
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
      </div>

      <SalesTable regionales={regionales} iaTotal={iaTotal} formatCurrency={formatCurrency} />
    </main>
  );
}
