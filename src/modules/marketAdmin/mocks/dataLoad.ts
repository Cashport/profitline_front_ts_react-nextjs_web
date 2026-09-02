// Mock de los ETLs manuales del Market Admin (pantalla "Cargue de información").
// Reemplazar por el hook/servicio real cuando exista el endpoint.

import { IMarketAdminEtl } from "@/types/marketAdmin/IMarketAdmin";

export const ETL_MOCK: IMarketAdminEtl[] = [
  {
    id: "etl1",
    nombre: "Inventario actualizado",
    observacion: "Actualiza el stock disponible por SKU y bodega.",
    detalle:
      "Sobrescribe las cantidades disponibles por SKU y bodega en el catálogo del Marketplace. Úsalo cuando el inventario mostrado en la app no coincida con SAP o se detecten quiebres de stock mal reportados. El archivo debe mantener las columnas SKU, Bodega y Cantidad disponible.",
    ultimoArchivo: "inventario_2025-06-18.xlsx",
    ultimoCargue: "2025-06-18",
    historial: [
      {
        archivo: "inventario_2025-06-18.xlsx",
        fecha: "2025-06-18",
        usuario: "andrea.gomez@galderma.com",
        estado: "Exitoso"
      },
      {
        archivo: "inventario_2025-06-11.xlsx",
        fecha: "2025-06-11",
        usuario: "andrea.gomez@galderma.com",
        estado: "Exitoso"
      },
      {
        archivo: "inventario_2025-06-04.xlsx",
        fecha: "2025-06-04",
        usuario: "juan.perez@galderma.com",
        estado: "Con errores"
      }
    ]
  },
  {
    id: "etl2",
    nombre: "Maestro de clientes",
    observacion: "Carga o actualiza clientes, NITs y ciudades.",
    detalle:
      "Crea nuevos clientes o actualiza NIT, ciudad, canal y estado de clientes existentes. Úsalo cuando se dan de alta clientes nuevos o cambian datos fiscales. Los registros se cruzan por NIT; si el NIT ya existe se actualiza, si no existe se crea.",
    ultimoArchivo: "clientes_2025-06-10.xlsx",
    ultimoCargue: "2025-06-10",
    historial: [
      {
        archivo: "clientes_2025-06-10.xlsx",
        fecha: "2025-06-10",
        usuario: "juan.perez@galderma.com",
        estado: "Exitoso"
      },
      {
        archivo: "clientes_2025-05-22.xlsx",
        fecha: "2025-05-22",
        usuario: "juan.perez@galderma.com",
        estado: "Exitoso"
      }
    ]
  },
  {
    id: "etl3",
    nombre: "Precios y SKUs",
    observacion: "Actualiza precios base y SKUs por línea y canal.",
    detalle:
      "Actualiza el precio base de cada SKU y permite dar de alta nuevos SKUs por línea de negocio y canal (Institucional / Retail). Úsalo tras un ajuste de lista de precios o el lanzamiento de un nuevo producto.",
    ultimoArchivo: "precios_2025-06-15.xlsx",
    ultimoCargue: "2025-06-15",
    historial: [
      {
        archivo: "precios_2025-06-15.xlsx",
        fecha: "2025-06-15",
        usuario: "andrea.gomez@galderma.com",
        estado: "Exitoso"
      }
    ]
  },
  {
    id: "etl4",
    nombre: "Descuentos y bonificados",
    observacion: "Carga masiva de reglas de descuento y bonificados por producto.",
    detalle:
      "Permite crear en bloque reglas de descuento o bonificado por producto, incluyendo fechas de vigencia y categoría. Úsalo cuando una campaña incluye muchas reglas y capturarlas una por una en el módulo de Bonificados es demasiado lento.",
    ultimoArchivo: null,
    ultimoCargue: null,
    historial: []
  }
];
