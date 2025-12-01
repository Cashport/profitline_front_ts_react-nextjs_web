"use client";

import React from "react";
import { useState } from "react";
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
  TrendingUp,
  ChevronDown,
  ChevronRight
} from "lucide-react";

import { getSalesDashboard } from "@/services/commerce/commerce";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/modules/chat/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";

import "@/modules/cetaphil/styles/cetaphilStyles.css";

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

type SortColumn =
  | "borrador"
  | "cartera"
  | "enProceso"
  | "facturado"
  | "total"
  | "cuota"
  | "faltante"
  | "avance"
  | null;
type SortDirection = "asc" | "desc";

export default function SalesDashboard() {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(
    new Set(["Regional 1", "Regional 2", "Regional 3"])
  );
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data: salesData, isLoading } = useSWR("/sales/dashboard", getSalesDashboard);

  const toggleRegion = (regionName: string) => {
    setExpandedRegions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(regionName)) {
        newSet.delete(regionName);
      } else {
        newSet.add(regionName);
      }
      return newSet;
    });
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <TrendingUp className="ml-1 h-3 w-3 inline opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ChevronDown className="ml-1 h-3 w-3 inline" />
    ) : (
      <ChevronRight className="ml-1 h-3 w-3 inline" />
    );
  };

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

  const getAvanceColor = (avance: number) => {
    if (avance >= 100) return "text-green-600";
    if (avance >= 70) return "text-blue-600";
    if (avance >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getAvanceBgColor = (avance: number) => {
    if (avance >= 100) return "bg-green-50";
    if (avance >= 70) return "bg-blue-50";
    if (avance >= 40) return "bg-yellow-50";
    return "bg-red-50";
  };

  const generateTooltipContent = (nombre: string, data: SalesData) => {
    const topProducts = productSalesArray.slice(0, 5);

    return (
      <div className="space-y-2 min-w-[250px]">
        <div className="font-semibold text-sm border-b border-white/20 pb-1">{nombre}</div>
        <div className="space-y-1">
          {topProducts.map((product, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs">
              <span className="truncate mr-2">{product.producto}</span>
              <span className="font-semibold whitespace-nowrap">
                {formatCurrency(product.ventas)}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-1 border-t border-white/20 flex justify-between text-xs font-semibold">
          <span>Total:</span>
          <span>{formatCurrency(data.total)}</span>
        </div>
      </div>
    );
  };

  const sortedRegionales = [...regionales].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: number;
    let bValue: number;

    switch (sortColumn) {
      case "borrador":
        aValue = a.data.borrador;
        bValue = b.data.borrador;
        break;
      case "cartera":
        aValue = a.data.cartera;
        bValue = b.data.cartera;
        break;
      case "enProceso":
        aValue = a.data.enProceso;
        bValue = b.data.enProceso;
        break;
      case "facturado":
        aValue = a.data.facturado;
        bValue = b.data.facturado;
        break;
      case "total":
        aValue = a.data.total;
        bValue = b.data.total;
        break;
      case "cuota":
        aValue = a.data.cuota;
        bValue = b.data.cuota;
        break;
      case "faltante":
        aValue = a.data.faltante;
        bValue = b.data.faltante;
        break;
      case "avance":
        aValue = a.data.avance;
        bValue = b.data.avance;
        break;
      default:
        return 0;
    }

    if (sortDirection === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  sortedRegionales.forEach((regional) => {
    if (sortColumn) {
      regional.vendedores.sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortColumn) {
          case "borrador":
            aValue = a.data.borrador;
            bValue = b.data.borrador;
            break;
          case "cartera":
            aValue = a.data.cartera;
            bValue = b.data.cartera;
            break;
          case "enProceso":
            aValue = a.data.enProceso;
            bValue = b.data.enProceso;
            break;
          case "facturado":
            aValue = a.data.facturado;
            bValue = b.data.facturado;
            break;
          case "total":
            aValue = a.data.total;
            bValue = b.data.total;
            break;
          case "cuota":
            aValue = a.data.cuota;
            bValue = b.data.cuota;
            break;
          case "faltante":
            aValue = a.data.faltante;
            bValue = b.data.faltante;
            break;
          case "avance":
            aValue = a.data.avance;
            bValue = b.data.avance;
            break;
          default:
            return 0;
        }

        if (sortDirection === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }
  });

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

        <Card className="lg:col-span-1">
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

      <Card className="bg-background border-0 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-semibold">
            Resumen de ventas por regional y vendedor
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ventas agrupadas por región con detalle de vendedores
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <TooltipProvider>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-cashport-black bg-gray-50">
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider">
                      Regional / Vendedor
                    </th>
                    <th
                      className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("borrador")}
                    >
                      Borrador {renderSortIcon("borrador")}
                    </th>
                    <th
                      className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("cartera")}
                    >
                      Cartera {renderSortIcon("cartera")}
                    </th>
                    <th
                      className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("enProceso")}
                    >
                      En proceso {renderSortIcon("enProceso")}
                    </th>
                    <th
                      className="hidden md:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("facturado")}
                    >
                      Facturado {renderSortIcon("facturado")}
                    </th>
                    <th
                      className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("total")}
                    >
                      Total {renderSortIcon("total")}
                    </th>
                    <th
                      className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("cuota")}
                    >
                      Meta {renderSortIcon("cuota")}
                    </th>
                    <th
                      className="hidden lg:table-cell text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-cashport-black tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort("faltante")}
                    >
                      Monto faltante {renderSortIcon("faltante")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegionales.map((regional) => (
                    <React.Fragment key={regional.nombre}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <tr
                              className="bg-blue-50 border-b border-gray-200 cursor-pointer hover:bg-blue-100 transition-colors"
                              onClick={() => toggleRegion(regional.nombre)}
                            >
                              <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm flex items-center">
                                {expandedRegions.has(regional.nombre) ? (
                                  <ChevronDown className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                )}
                                <span className="truncate">{regional.nombre}</span>
                              </td>
                              <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                {formatCurrency(regional.data.borrador)}
                              </td>
                              <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                {formatCurrency(regional.data.cartera)}
                              </td>
                              <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                {formatCurrency(regional.data.enProceso)}
                              </td>
                              <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                {formatCurrency(regional.data.facturado)}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                {formatCurrency(regional.data.total)}
                              </td>
                              <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                <div className="flex items-center justify-end gap-1 sm:gap-2">
                                  <span className="hidden sm:inline">
                                    {formatCurrency(regional.data.cuota)}
                                  </span>
                                  <span className="sm:hidden text-xs">
                                    {formatCurrency(regional.data.cuota).replace(/\s/g, "")}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(regional.data.avance)}`}
                                  >
                                    {regional.data.avance.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                {formatCurrency(regional.data.faltante)}
                              </td>
                            </tr>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            align="start"
                            className="max-w-xs hidden sm:block"
                          >
                            <div className="space-y-2">
                              <p className="font-semibold">Top 5 Productos - {regional.nombre}</p>
                              {regional.data.topProducts.map((product, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{product.name}</span>
                                  <span className="font-medium">
                                    {formatCurrency(product.sales)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {expandedRegions.has(regional.nombre) &&
                        regional.vendedores.map((vendedor) => (
                          <TooltipProvider key={vendedor.nombre}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 pl-6 sm:pl-12 text-xs sm:text-sm text-gray-700 truncate">
                                    {vendedor.nombre}
                                  </td>
                                  <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                    {formatCurrency(vendedor.data.borrador)}
                                  </td>
                                  <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                    {formatCurrency(vendedor.data.cartera)}
                                  </td>
                                  <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                    {formatCurrency(vendedor.data.enProceso)}
                                  </td>
                                  <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                    {formatCurrency(vendedor.data.facturado)}
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                    {formatCurrency(vendedor.data.total)}
                                  </td>
                                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                      <span className="hidden sm:inline">
                                        {formatCurrency(vendedor.data.cuota)}
                                      </span>
                                      <span className="sm:hidden text-xs">
                                        {formatCurrency(vendedor.data.cuota).replace(/\s/g, "")}
                                      </span>
                                      <span
                                        className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(vendedor.data.avance)}`}
                                      >
                                        {vendedor.data.avance.toFixed(0)}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                                    {formatCurrency(vendedor.data.faltante)}
                                  </td>
                                </tr>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                align="start"
                                className="max-w-xs hidden sm:block"
                              >
                                <div className="space-y-2">
                                  <p className="font-semibold">
                                    Top 5 Productos - {vendedor.nombre}
                                  </p>
                                  {vendedor.data.topProducts.map((product, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span>{product.name}</span>
                                      <span className="font-medium">
                                        {formatCurrency(product.sales)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                    </React.Fragment>
                  ))}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <tr className="border-t-2 border-cashport-black bg-gray-100 font-bold cursor-pointer">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Total</td>
                          <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                            {formatCurrency(iaTotal.borrador)}
                          </td>
                          <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                            {formatCurrency(iaTotal.cartera)}
                          </td>
                          <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                            {formatCurrency(iaTotal.enProceso)}
                          </td>
                          <td className="hidden md:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                            {formatCurrency(iaTotal.facturado)}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                            {formatCurrency(iaTotal.total)}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <span className="hidden sm:inline">
                                {formatCurrency(iaTotal.cuota)}
                              </span>
                              <span className="sm:hidden text-xs">
                                {formatCurrency(iaTotal.cuota).replace(/\s/g, "")}
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getAvanceBgColor(iaTotal.avance)}`}
                              >
                                {iaTotal.avance.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="hidden lg:table-cell py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-right">
                            {formatCurrency(iaTotal.faltante)}
                          </td>
                        </tr>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="start"
                        className="max-w-xs hidden sm:block"
                      >
                        <div className="space-y-2">
                          <p className="font-semibold">Top 5 Productos - Total General</p>
                          {iaTotal.topProducts.map((product, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{product.name}</span>
                              <span className="font-medium">{formatCurrency(product.sales)}</span>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </tbody>
              </table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
