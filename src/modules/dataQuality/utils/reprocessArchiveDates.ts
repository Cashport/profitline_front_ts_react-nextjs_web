import dayjs, { Dayjs } from "dayjs";

import {
  IReprocessArchiveDatesRequest,
  TReprocessStartFrom
} from "@/types/dataQuality/IDataQuality";

/** Formato exacto que valida el backend con un regex anclado (10 caracteres). */
export const REPROCESS_DATE_FORMAT = "YYYY-MM-DD";

/** Formato de las fechas que se le muestran al usuario (resumen y notificación). */
export const REPROCESS_DISPLAY_FORMAT = "DD/MM/YYYY";

/** Primer día del mes actual. Es el mínimo que acepta el backend (antes responde 400). */
export const getCurrentMonthStart = (today: Dayjs = dayjs()): Dayjs => today.startOf("month");

/**
 * Último día del mes actual, inclusivo. No confundir con el `toDate` de la respuesta,
 * que es un límite superior exclusivo (el día 1 del mes siguiente).
 */
export const getCurrentMonthEnd = (today: Dayjs = dayjs()): Dayjs =>
  today.endOf("month").startOf("day");

/**
 * Formatea en zona horaria local. Nunca usar toISOString(): convierte a UTC y una fecha
 * elegida en Colombia se corre al día anterior.
 */
export const formatReprocessDate = (date: Dayjs): string => date.format(REPROCESS_DATE_FORMAT);

export const formatReprocessDisplayDate = (date: Dayjs): string =>
  date.format(REPROCESS_DISPLAY_FORMAT);

type BuildReprocessPayloadArgs =
  | {
      startFrom: Extract<TReprocessStartFrom, "month_start">;
      idClientData: number;
      date?: undefined;
    }
  | {
      startFrom: Extract<TReprocessStartFrom, "specific_date">;
      idClientData: number;
      date: Dayjs;
    };

/**
 * Con "month_start" la llave `from_date` no debe existir en el JSON: el backend solo salta
 * la validación cuando el campo es `undefined`, así que un `null` entra a validarse y
 * devuelve 400. De ahí el spread condicional en lugar de un objeto con la llave siempre.
 */
export const buildReprocessPayload = ({
  startFrom,
  idClientData,
  date
}: BuildReprocessPayloadArgs): IReprocessArchiveDatesRequest => {
  // Sin id_client_data el backend reprocesa todos los clientes del sistema.
  if (!Number.isFinite(idClientData) || idClientData <= 0) {
    throw new Error("No se pudo identificar el cliente a reprocesar");
  }
  if (startFrom === "specific_date" && !date) {
    throw new Error("Selecciona la fecha desde la que se reprocesará");
  }

  return {
    start_from: startFrom,
    id_client_data: idClientData,
    ...(startFrom === "specific_date" && { from_date: formatReprocessDate(date) })
  };
};

/** Fecha desde la que se reprocesa según la opción elegida. */
export const getReprocessFromDate = (
  startFrom: TReprocessStartFrom,
  date: Dayjs | undefined,
  today: Dayjs = dayjs()
): Dayjs | undefined => (startFrom === "month_start" ? getCurrentMonthStart(today) : date);

/**
 * El 400 llega en dos formas: la validación de la ruta manda el detalle en `data`
 * (`[{ msg, path }]`) y deja `message` en "Invalid params", mientras el controlador manda
 * el detalle en `message` y `data` en null. Leyendo solo `message` el usuario vería
 * "Invalid params" sin ningún detalle.
 */
export const getReprocessErrorDetail = (message: string, data: unknown): string => {
  if (Array.isArray(data)) {
    const details = data
      .map((item) => (item as { msg?: unknown })?.msg)
      .filter((msg): msg is string => typeof msg === "string" && msg.length > 0);
    if (details.length > 0) return details.join(", ");
  }
  return message;
};
