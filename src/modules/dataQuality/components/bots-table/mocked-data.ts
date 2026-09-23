import { IBotHealth } from "../../types/automations";

// Datos de ejemplo mientras no exista el endpoint de salud de automatizaciones.
export const MOCKED_BOTS: IBotHealth[] = [
  {
    id: "exito-co",
    name: "RPA Ingesta Éxito CO",
    client: "Éxito Colombia",
    country: "Colombia",
    countryId: "colombia",
    clientId: "exito-colombia",
    fileType: "sellout",
    status: "error",
    lastRun: { date: "29/04/2024", time: "05:10" },
    nextRun: { date: "30/04/2024", time: "05:00" },
    frequency: "Diaria · 05:00",
    errorMessage: "Timeout de conexión SFTP",
    last60Days: { total: 58, success: 52, error: 6 },
    history: [
      {
        date: "29/04/2024",
        time: "05:10",
        status: "error",
        duration: "2m 40s",
        message: "Timeout de conexión SFTP"
      },
      { date: "28/04/2024", time: "05:02", status: "success", duration: "1m 15s" },
      { date: "27/04/2024", time: "05:03", status: "success", duration: "1m 10s" },
      { date: "26/04/2024", time: "05:01", status: "success", duration: "1m 18s" }
    ]
  },
  {
    id: "falabella-co",
    name: "Bot Reconciliación Falabella",
    client: "Falabella CO",
    country: "Colombia",
    countryId: "colombia",
    clientId: "falabella-co",
    fileType: "stock",
    status: "error",
    lastRun: { date: "28/04/2024", time: "06:40" },
    nextRun: { date: "29/04/2024", time: "06:30" },
    frequency: "Diaria · 06:30",
    errorMessage: "Cambio de formato en archivo fuente",
    last60Days: { total: 59, success: 54, error: 5 },
    history: [
      {
        date: "28/04/2024",
        time: "06:40",
        status: "error",
        duration: "3m 05s",
        message: "Cambio de formato en archivo fuente"
      },
      { date: "27/04/2024", time: "06:31", status: "success", duration: "2m 20s" },
      { date: "26/04/2024", time: "06:29", status: "success", duration: "2m 15s" }
    ]
  },
  {
    id: "tottus-pe",
    name: "RPA Ingesta Tottus",
    client: "Tottus Perú",
    country: "Perú",
    countryId: "peru",
    clientId: "tottus-peru",
    fileType: "sellout",
    status: "error",
    lastRun: { date: "28/04/2024", time: "04:55" },
    nextRun: { date: "29/04/2024", time: "04:30" },
    frequency: "Diaria · 04:30",
    errorMessage: "Credenciales expiradas",
    last60Days: { total: 60, success: 48, error: 12 },
    history: [
      {
        date: "28/04/2024",
        time: "04:55",
        status: "error",
        duration: "0m 45s",
        message: "Credenciales expiradas"
      },
      {
        date: "27/04/2024",
        time: "04:31",
        status: "error",
        duration: "0m 40s",
        message: "Credenciales expiradas"
      },
      { date: "26/04/2024", time: "04:29", status: "success", duration: "2m 05s" }
    ]
  },
  {
    id: "plaza-vea",
    name: "Bot Normalización Plaza Vea",
    client: "Plaza Vea",
    country: "Perú",
    countryId: "peru",
    clientId: "plaza-vea",
    fileType: "stock",
    status: "error",
    lastRun: { date: "27/04/2024", time: "07:15" },
    nextRun: { date: "28/04/2024", time: "07:00" },
    frequency: "Diaria · 07:00",
    errorMessage: "Cambio de layout en portal B2B",
    last60Days: { total: 58, success: 51, error: 7 },
    history: [
      {
        date: "27/04/2024",
        time: "07:15",
        status: "error",
        duration: "1m 50s",
        message: "Cambio de layout en portal B2B"
      },
      { date: "26/04/2024", time: "07:02", status: "success", duration: "1m 40s" },
      { date: "25/04/2024", time: "07:01", status: "success", duration: "1m 38s" }
    ]
  },
  {
    id: "wong",
    name: "RPA Descarga Wong",
    client: "Wong",
    country: "Perú",
    countryId: "peru",
    clientId: "wong",
    fileType: "sellout",
    status: "error",
    lastRun: { date: "27/04/2024", time: "03:20" },
    nextRun: { date: "28/04/2024", time: "03:00" },
    frequency: "Diaria · 03:00",
    errorMessage: "Captcha no resuelto",
    last60Days: { total: 60, success: 45, error: 15 },
    history: [
      {
        date: "27/04/2024",
        time: "03:20",
        status: "error",
        duration: "1m 05s",
        message: "Captcha no resuelto"
      },
      {
        date: "26/04/2024",
        time: "03:01",
        status: "error",
        duration: "0m 58s",
        message: "Captcha no resuelto"
      },
      { date: "25/04/2024", time: "03:02", status: "success", duration: "1m 30s" },
      { date: "24/04/2024", time: "03:01", status: "success", duration: "1m 28s" }
    ]
  },
  {
    id: "coto",
    name: "RPA Ingesta Coto",
    client: "Coto",
    country: "Argentina",
    countryId: "argentina",
    clientId: "coto",
    fileType: "stock",
    status: "error",
    lastRun: { date: "26/04/2024", time: "05:30" },
    nextRun: { date: "27/04/2024", time: "05:00" },
    frequency: "Diaria · 05:00",
    errorMessage: "Sitio fuera de servicio",
    last60Days: { total: 57, success: 53, error: 4 },
    history: [
      {
        date: "26/04/2024",
        time: "05:30",
        status: "error",
        duration: "0m 30s",
        message: "Sitio fuera de servicio"
      },
      { date: "25/04/2024", time: "05:01", status: "success", duration: "1m 45s" },
      { date: "24/04/2024", time: "05:02", status: "success", duration: "1m 50s" }
    ]
  },
  {
    id: "cruz-verde",
    name: "Bot Sync Stock Cruz Verde",
    client: "Farmacia Cruz Verde",
    country: "Colombia",
    countryId: "colombia",
    clientId: "farmacia-cruz-verde",
    fileType: "stock",
    status: "success",
    lastRun: { date: "29/04/2024", time: "09:12" },
    nextRun: { date: "30/04/2024", time: "09:00" },
    frequency: "Diaria · 09:00",
    last60Days: { total: 59, success: 59, error: 0 },
    history: [
      { date: "29/04/2024", time: "09:12", status: "success", duration: "1m 22s" },
      { date: "28/04/2024", time: "09:05", status: "success", duration: "1m 19s" },
      { date: "27/04/2024", time: "09:03", status: "success", duration: "1m 20s" }
    ]
  },
  {
    id: "colsubsidio",
    name: "Bot Ingesta Colsubsidio",
    client: "Droguería Colsubsidio",
    country: "Colombia",
    countryId: "colombia",
    clientId: "drogueria-colsubsidio",
    fileType: "sellout",
    status: "running",
    lastRun: { date: "29/04/2024", time: "10:20" },
    nextRun: { date: "30/04/2024", time: "10:00" },
    frequency: "Diaria · 10:00",
    last60Days: { total: 58, success: 57, error: 1 },
    history: [
      { date: "28/04/2024", time: "10:18", status: "success", duration: "2m 02s" },
      { date: "27/04/2024", time: "10:15", status: "success", duration: "1m 58s" }
    ]
  },
  {
    id: "guadalajara",
    name: "Bot Catálogo Guadalajara",
    client: "Farmacias Guadalajara",
    country: "México",
    countryId: "mexico",
    clientId: "farmacias-guadalajara",
    fileType: "stock",
    status: "success",
    lastRun: { date: "26/04/2024", time: "15:20" },
    nextRun: { date: "27/04/2024", time: "15:00" },
    frequency: "Semanal · Lun 15:00",
    last60Days: { total: 8, success: 8, error: 0 },
    history: [
      { date: "22/04/2024", time: "15:18", status: "success", duration: "3m 10s" },
      { date: "15/04/2024", time: "15:12", status: "success", duration: "3m 05s" }
    ]
  },
  {
    id: "farmatodo",
    name: "Bot Reconciliación Farmatodo",
    client: "Farmatodo Colombia",
    country: "Colombia",
    countryId: "colombia",
    clientId: "farmatodo-colombia",
    fileType: "sellout",
    status: "success",
    lastRun: { date: "28/04/2024", time: "16:45" },
    nextRun: { date: "29/04/2024", time: "16:30" },
    frequency: "Diaria · 16:30",
    last60Days: { total: 59, success: 58, error: 1 },
    history: [
      { date: "28/04/2024", time: "16:45", status: "success", duration: "1m 40s" },
      { date: "27/04/2024", time: "16:32", status: "success", duration: "1m 35s" }
    ]
  }
];
