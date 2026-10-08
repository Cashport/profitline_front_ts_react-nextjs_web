import axios from "axios";

import { default as instance } from "@/utils/api/api";

import {
  ICollectionTowerQuery,
  ITowerExportState,
  TowerExportTable
} from "@/types/collectionTower/ICollectionTower";

/* Torre de control de recaudo. Las rutas son la propuesta de contrato (ver
   ICollectionTower): confirmarlas con backend antes de apagar USE_TOWER_MOCK. */

export const towerPath = (projectId: number) => `/collection/tower/project/${projectId}`;

/**
 * Serializa los filtros del tablero. Sólo va lo que tiene valor, así un campo
 * vacío no cambia la llave de SWR. Los segmentos van como "fecha:estado" y
 * "fecha:*" para el día entero.
 */
export const buildTowerQuery = (query: ICollectionTowerQuery): string => {
  const params = new URLSearchParams();
  if (query.period) params.set("period", query.period);
  if (query.management) params.set("management", query.management);
  if (query.coordinator) params.set("coordinator", query.coordinator);
  if (query.executive) params.set("executive", query.executive);
  if (query.channel) params.set("channel", query.channel);
  const search = query.search.trim();
  if (search) params.set("search", search);
  if (query.aging) params.set("aging", query.aging);
  if (query.segments.length) {
    params.set(
      "segments",
      query.segments.map((s) => `${s.date}:${s.status ?? "*"}`).join(",")
    );
  }
  return params.toString();
};

/**
 * Descarga en .xlsx una tabla de la torre: los filtros del tablero más el
 * estado de la tabla (agrupación, vista, orden), para que el archivo traiga lo
 * que se ve. `fallbackName` se usa si el backend no manda content-disposition.
 */
export const downloadCollectionTowerExcel = async (
  projectId: number,
  table: TowerExportTable,
  query: ICollectionTowerQuery,
  state: ITowerExportState,
  fallbackName: string
): Promise<void> => {
  const params = new URLSearchParams(buildTowerQuery(query));
  params.set("table", table);
  if (state.groupBy) params.set("group_by", state.groupBy);
  if (state.sortBy) {
    params.set("sort_by", state.sortBy);
    params.set("sort_dir", state.sortDir ?? "desc");
  }
  if (state.view) params.set("view", state.view);
  if (state.pnaAge) params.set("pna_age", state.pnaAge);
  if (state.coordinators?.length) params.set("coordinators", state.coordinators.join(","));

  try {
    // `instance` y no `API`: el interceptor de `API` devuelve sólo el cuerpo y
    // aquí hacen falta los headers para leer el nombre del archivo.
    const response = await instance.get(`${towerPath(projectId)}/export?${params.toString()}`, {
      responseType: "blob",
      timeout: 60000
    });

    const disposition = (response.headers["content-disposition"] as string) || "";
    const filename = disposition.match(/filename="?([^";]+)"?/)?.[1] || fallbackName;

    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    // Con responseType "blob" el error del backend también llega como Blob.
    let message: string | undefined;
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        message = JSON.parse(await error.response.data.text())?.message;
      } catch {
        // Cuerpo que no es JSON (p. ej. un 502 del gateway): queda el texto por defecto.
      }
    }
    throw new Error(message || "No se pudo descargar el Excel.");
  }
};
