import dayjs from "dayjs";

/** Fecha y hora locales de una carga (el backend las manda en UTC). */
export const formatDateTime = (value: string | null | undefined) =>
  value ? dayjs(value).format("DD/MM/YYYY h:mm a") : "—";

export const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
};
