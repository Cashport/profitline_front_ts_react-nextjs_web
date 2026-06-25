import { IMedicalAccount } from "../types/IMedicalAccount";

// Temporary mock data until the backend service is wired up.
export const medicalAccountsMock: IMedicalAccount[] = [
  {
    id: "CM-001",
    idAutorizacion: "AUT-998877",
    nombrePaciente: "María Fernanda Gómez",
    documentoPaciente: "CC 1.032.456.789",
    fechaCarga: "2026-06-20T09:15:00",
    fechaServicio: "2026-06-18",
    regimen: "Contributivo",
    tipoServicio: "SYS",
    estado: "Radicado",
    tipoDocumento: "CC",
    nombreArchivo: "cuenta_CM-001.pdf",
    numeroPaginas: 24,
    novedades: [],
    documents: [
      { id: "d1", type: "invoice", name: "Factura 001", startPage: 1, endPage: 4 },
      { id: "d2", type: "invoice", name: "Factura 002", startPage: 5, endPage: 8 },
      { id: "d3", type: "receipt", name: "Correo Confirmación", startPage: 9, endPage: 10 },
      { id: "d4", type: "receipt", name: "Acta de Recibido", startPage: 11, endPage: 12, novedadesCount: 2 },
      { id: "d5", type: "authorization", name: "Autorización EPS", startPage: 13, endPage: 15 },
      { id: "d6", type: "authorization", name: "Preautorización", startPage: 16, endPage: 18 },
      { id: "d7", type: "medical", name: "Historia Clínica", startPage: 19, endPage: 24 },
      { id: "d8", type: "medical", name: "Fórmula Médica", startPage: 25, endPage: 26 },
      { id: "d9", type: "medical", name: "Resultados de Exámenes", startPage: 27, endPage: 38 }
    ]
  },
  {
    id: "CM-002",
    idAutorizacion: "AUT-998878",
    nombrePaciente: "Carlos Andrés Ramírez",
    documentoPaciente: "CC 79.456.123",
    fechaCarga: "2026-06-22T14:42:00",
    fechaServicio: "2026-06-21",
    regimen: "Subsidiado",
    tipoServicio: "RH",
    estado: "Pre Radicado",
    tipoDocumento: "CC",
    nombreArchivo: "cuenta_CM-002.pdf",
    numeroPaginas: 12,
    novedades: [],
    documents: [
      { id: "d1", type: "invoice", name: "Factura 045", startPage: 1, endPage: 2 },
      { id: "d2", type: "authorization", name: "Autorización 11290034", startPage: 3, endPage: 5 },
      { id: "d3", type: "medical", name: "Soporte de terapias", startPage: 6, endPage: 12 }
    ]
  },
  {
    id: "CM-003",
    idAutorizacion: null,
    nombrePaciente: "Luisa Valentina Torres",
    documentoPaciente: "TI 1.098.765.432",
    fechaCarga: "2026-06-24T08:05:00",
    fechaServicio: null,
    regimen: "Contributivo",
    tipoServicio: "ACC",
    estado: "Novedad",
    tipoDocumento: "TI",
    nombreArchivo: "cuenta_CM-003.pdf",
    numeroPaginas: 8,
    novedades: [
      {
        id: "n1",
        tipo: "tipo_documento",
        descripcion: "La cédula en la factura no coincide con la registrada en la autorización.",
        resuelta: false
      },
      {
        id: "n2",
        tipo: "no_coinciden_fechas",
        descripcion:
          "La fecha de entrega del acta (16/06/2026) difiere de la fecha en la factura (14/06/2026).",
        resuelta: false
      },
      {
        id: "n3",
        tipo: "falta_autorizacion",
        descripcion: "No se encontró el documento de autorización en el archivo cargado.",
        resuelta: true
      }
    ],
    documents: [
      { id: "d1", type: "invoice", name: "Factura 102", startPage: 1, endPage: 2, novedadesCount: 1 },
      { id: "d2", type: "medical", name: "Soporte médico", startPage: 3, endPage: 8 }
    ]
  }
];
