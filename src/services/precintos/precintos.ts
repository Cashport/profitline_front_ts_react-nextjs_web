import { GenericResponse } from "@/types/global/IGlobal";
import { API, getIdToken } from "@/utils/api/api";

export interface IPrecinto {
  Id: string;
  IdProyectoLogistica: string;
  IdPrecinto: string;
  UsuarioAsigno: string;
  UsuarioAsignoNombre?: string;
  UsuarioAsignacion: string;
  UsuarioAsignacionNombre?: string;
  FechaAsigno: string;
  IdEstado: string;
  EstadoNombre?: string;
  FechaRegistro: string;
  UsuarioRegistro: string;
  IdDevolucion?: string;
  ClienteNombre?: string;
  ClienteNit?: string;
  FechaUso?: string;
}

export interface IPrecintosResponse {
  data: IPrecinto[];
  total: number;
}

// 👇 Helper para obtener el projectId dinámico
const getProjectId = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("projectId") || localStorage.getItem("selectedProjectId") || "162";
  }
  return "162";
};

// 👇 Helper para descargar CSV de forma segura
const downloadCsv = async (url: string, filename: string, options?: RequestInit) => {
  const token = await getIdToken();
  if (!token) throw new Error("No hay sesión activa");

  const API_URL = process.env.NEXT_PUBLIC_API_HOST || "";
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options?.headers,
      projectId: getProjectId(),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error(`Error al descargar: ${response.status}`);

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
};

// 1. OBTENER PRECINTOS (GET)
export const getPrecintos = async (
  page = 1,
  limit = 20,
  estado?: string,
  ejecutivos?: string,
  clientes?: string,
  from?: string,
  to?: string,
  search?: string,
  groupBy: number = 1,
  motivos?: string,
  sortField?: string,
  sortOrder?: string
) => {
  try {
    const response = await API.get(
      `/integration/profit360/precintos`,
      {
        params: {
          page, limit, _t: Date.now(), estado, ejecutivos, clientes, from, to, search,
          groupBy: groupBy.toString(),
          motivos,
          sortField,
          sortOrder,
        },
        headers: { projectId: getProjectId() }, // 👈 Dinámico
      }
    );

    const res = response as any;

    if (res && res.data && res.data.data) {
      return { data: res.data.data, total: res.data.total || res.data.data.length };
    }
    if (res && res.data && Array.isArray(res.data)) {
      return { data: res.data, total: res.total || res.data.length };
    }
    if (Array.isArray(res)) {
      return { data: res, total: res.length };
    }
    return { data: [], total: 0 };
  } catch (error) {
    console.error("Error al obtener precintos:", error);
    throw error;
  }
};

// 2. INGRESAR A BODEGA (POST)
export const createPrecintos = async (precintos: string[], fecha?: string, observacion?: string) => {
  try {
    const response = await API.post(
      `/integration/profit360/precintos`,
      { precintos, fecha, observacion },
      { headers: { projectId: getProjectId() } } // 👈 Dinámico
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear precintos:", error);
    throw error;
  }
};

// 3. ASIGNAR A EJECUTIVO (PUT)
export const asignarPrecintos = async (precintos: string[], ejecutivoId: string, fecha?: string, guia?: string) => {
  try {
    const response = await API.put(
      `/integration/profit360/precintos/assign-executive`,
      { precintos, ejecutivoid: ejecutivoId, fecha, guia },
      { headers: { projectId: getProjectId() } } // 👈 Dinámico
    );
    return response.data;
  } catch (error) {
    console.error("Error al asignar precintos:", error);
    throw error;
  }
};

// 4. CAMBIAR EJECUTIVO (PUT)
export const cambiarEjecutivo = async (precintos: string[], nuevoEjecutivoId: string, fecha?: string, guia?: string) => {
  try {
    const response = await API.put(
      `/integration/profit360/precintos/change-executive`,
      { precintos, ejecutivoid: nuevoEjecutivoId, fecha, guia },
      { headers: { projectId: getProjectId() } } // 👈 Dinámico
    );
    return response.data;
  } catch (error) {
    console.error("Error al cambiar ejecutivo:", error);
    throw error;
  }
};

// 5. DEVOLVER A BODEGA (PUT)
export const devolverStock = async (precintos: string[], fecha?: string, guia?: string) => {
  try {
    const response = await API.put(
      `/integration/profit360/precintos/return-stock`,
      { precintos, fecha, guia },
      { headers: { projectId: getProjectId() } } // 👈 Dinámico
    );
    return response.data;
  } catch (error) {
    console.error("Error al devolver a bodega:", error);
    throw error;
  }
};

// 6. DESCARGAR CSV INVENTARIO COMPLETO
export const descargarInventarioCSV = async () => {
  try {
    await downloadCsv("/integration/profit360/precintos/download-csv", "inventario_precintos.csv");
  } catch (error) {
    console.error("Error descargando CSV:", error);
    throw error;
  }
};

// 7. DESCARGAR CSV FILTRADO
export const descargarFiltradosCSV = async (filters: {
  estado?: string;
  ejecutivos?: string;
  clientes?: string;
  from?: string;
  to?: string;
  search?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters.estado) params.append("estado", filters.estado);
    if (filters.ejecutivos) params.append("ejecutivos", filters.ejecutivos);
    if (filters.clientes) params.append("clientes", filters.clientes);
    if (filters.from) params.append("from", filters.from);
    if (filters.to) params.append("to", filters.to);
    if (filters.search) params.append("search", filters.search);

    await downloadCsv(
      `/integration/profit360/precintos/download-filtered-csv?${params.toString()}`,
      "precintos_filtrados.csv"
    );
  } catch (error) {
    console.error("Error descargando CSV filtrado:", error);
    throw error;
  }
};

// 8. DESCARGAR CSV SELECCIÓN
export const descargarSeleccionCSV = async (precintos: string[]) => {
  try {
    await downloadCsv("/integration/profit360/precintos/download-check-csv", "precintos_seleccionados.csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ precintos }),
    });
  } catch (error) {
    console.error("Error descargando CSV de seleccionados:", error);
    throw error;
  }
};

// 9. FILTROS
export const getFilterExecutives = async () => {
  try {
    const response = await API.get("/integration/profit360/precintos/filter-executives", {
      headers: { projectId: getProjectId() }, // 👈 Dinámico
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo ejecutivos:", error);
    throw error;
  }
};

export const getFilterClients = async () => {
  try {
    const response = await API.get("/integration/profit360/precintos/filter-clients", {
      headers: { projectId: getProjectId() }, // 👈 Dinámico
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    throw error;
  }
};

// 10. STATS EJECUTIVOS
export const getEjecutivosStats = async () => {
  try {
    const response = await API.get("/integration/profit360/precintos/executives-stats", {
      headers: { projectId: getProjectId() }, // 👈 Dinámico
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo stats de ejecutivos:", error);
    throw error;
  }
};

export const anularPrecintos = async (precintos: string[], motivo?: string, observacion?: string) => {
  try {
    const response = await API.put(
      `/integration/profit360/precintos/tocancel`,
      { precintos, motivo, observacion },
      { headers: { projectId: getProjectId() } } // 👈 Dinámico
    );
    return response.data;
  } catch (error) {
    console.error("Error al anular precintos:", error);
    throw error;
  }
};