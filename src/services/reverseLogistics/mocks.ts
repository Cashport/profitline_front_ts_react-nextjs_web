import { IApproval, IApprovalProduct, IReturn } from "@/types/reverseLogistics/IReverseLogistics";

// Trimmed mock data (~3 rows each). The returns set intentionally has two rows for
// "DISFARMA GC SAS" so the client-grouping (expandable "N devs." row) is visible.

export const mockReturns: IReturn[] = [
  {
    id: 1,
    idBoleto: "202500011",
    fecha: "2025-12-15 08:21",
    cliente: "DISFARMA GC SAS",
    direccionCliente: "TENJO – PARQ IND LOGIKA SIBERIA – VDA LA PUNTRA",
    canal: "Institucional",
    lineaNegocio: "",
    unidades: 2958,
    causal: "Vencimiento",
    embalaje: "143 caja",
    precintos: 507,
    monto: 48750000,
    usuario: "anrodriguez@profitline.com.co",
    estado: "Contabilización de NC",
    pdfUrl: "#"
  },
  {
    id: 7,
    idBoleto: "202600032",
    fecha: "2026-02-20 09:15",
    cliente: "DISFARMA GC SAS",
    direccionCliente: "TENJO – PARQ IND LOGIKA SIBERIA – VDA LA PUNTRA",
    canal: "Institucional",
    lineaNegocio: "",
    unidades: 4064,
    causal: "Vencimiento",
    embalaje: "171 caja",
    precintos: 514,
    monto: 92400000,
    usuario: "anrodriguez@profitline.com.co",
    estado: "Demora de aprobación",
    pdfUrl: "#"
  },
  {
    id: 13,
    idBoleto: "202600048",
    fecha: "2026-03-05 11:30",
    cliente: "COOPIDROGAS",
    direccionCliente: "BELLO – CALLE 30 # 40-20 BODEGA 12",
    canal: "Retail",
    lineaNegocio: "FARMA",
    unidades: 320,
    causal: "Vencimiento",
    embalaje: "10 caja",
    precintos: 525,
    monto: 8900000,
    usuario: "jgomez@profitline.com.co",
    estado: "Visita programada",
    pdfUrl: "#"
  }
];

export const mockApprovals: IApproval[] = [
  {
    id: 1,
    cliente: "COOPIDROGAS",
    codigoCliente: "466734/466905-RET",
    canal: "RET",
    linea: "FARMA",
    ciudad: "BELLO",
    fecha: "22/01/2025 08:22",
    tiposAprobacion: ["Fuera de politicas por fecha (01-vencimiento)"],
    lotesParaAprobar: 1,
    unidades: 48,
    monto: 1240000
  },
  {
    id: 7,
    cliente: "UNIDROGAS",
    codigoCliente: "466751/466935-RET",
    canal: "RET",
    linea: "FARMA",
    ciudad: "GALAPA",
    fecha: "27/02/2025 10:59",
    tiposAprobacion: [
      "Fuera de politicas por fecha (01-vencimiento)",
      "Supera el monto máximo"
    ],
    lotesParaAprobar: 2,
    unidades: 144,
    monto: 4820000
  },
  {
    id: 3,
    cliente: "COMFANDI",
    codigoCliente: "466738/1749131-INS",
    canal: "INS",
    linea: "FARMA",
    ciudad: "CALI",
    fecha: "30/07/2024 10:15",
    tiposAprobacion: ["Causal con aprobación (04-Calidad)"],
    lotesParaAprobar: 1,
    unidades: 36,
    monto: 970000
  }
];

export const mockApprovalProducts: IApprovalProduct[] = [
  {
    id: 1,
    nombre: "CETAPHIL ESPUMA LIM 236ml",
    ean: "3499320009775",
    sku: "yyyyy",
    politica: "Fuera de politicas por fecha",
    politicaColor: "green",
    lote: "yyy3",
    fechaVencimiento: "30/04/2024",
    unidades: 25,
    valor: 60000,
    documento: "544s",
    estado: "Pendiente aprobación"
  },
  {
    id: 2,
    nombre: "BIODERMA SENSIBIO H2O 500ml",
    ean: "3401396999842",
    sku: "bio500",
    politica: "Causal con aprobación",
    politicaColor: "orange",
    lote: "BIO24",
    fechaVencimiento: "15/06/2025",
    unidades: 12,
    valor: 38000,
    documento: "612a",
    estado: "Pendiente aprobación"
  },
  {
    id: 3,
    nombre: "LA ROCHE-POSAY ANTHELIOS 50ml",
    ean: "3337875545836",
    sku: "lrp50",
    politica: "Supera el monto máximo",
    politicaColor: "red",
    lote: "LRP25",
    fechaVencimiento: "10/01/2026",
    unidades: 8,
    valor: 92000,
    documento: "701c",
    estado: "Pendiente aprobación"
  }
];
