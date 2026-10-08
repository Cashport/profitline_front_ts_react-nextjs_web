"use client";

// Vista previa temporal SIN autenticación (el middleware exime /auth/*), solo
// para validar el maquetado mientras no hay credenciales disponibles. Como no
// hay sesión, la tabla no traerá datos reales del backend. Borrar esta carpeta
// una vez validado el diseño.
import { BotHealthView } from "@/components/organisms/BotHealth/BotHealthView/BotHealthView";

export default function PreviewBotsPage() {
  return <BotHealthView />;
}
