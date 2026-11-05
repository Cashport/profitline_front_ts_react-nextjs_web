import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../../../firebase";

export const MCP_PORT_RE = /^\d{4,5}$/;
export const MCP_STATE_RE = /^[A-Za-z0-9_-]{32,128}$/;

export const parseMcpConnectParams = (port: string | null, state: string | null) => {
  if (!port || !state || !MCP_PORT_RE.test(port) || !MCP_STATE_RE.test(state)) return null;
  const portNumber = Number(port);
  if (portNumber < 1024 || portNumber > 65535) return null;
  return { port: portNumber, state };
};

export type McpConnectResult = { ok: true } | { ok: false; code: string; message: string };

const MESSAGES: Record<string, string> = {
  OTP_REQUIRED: "Debes validar el código de verificación para continuar.",
  PASSWORD_EXPIRED: "Tu contraseña venció. Cámbiala en Cashport y vuelve a conectar.",
  EXTERNAL_USER: "Este tipo de usuario no puede conectar el MCP.",
  SESSION_INVALID: "No se pudo validar tu sesión. Intenta de nuevo."
};

export const completeMcpConnect = async (params: {
  port: number;
  state: string;
}): Promise<McpConnectResult> => {
  try {
    const user = auth.currentUser;
    if (!user) return { ok: false, code: "SESSION_INVALID", message: MESSAGES.SESSION_INVALID };

    const response = await fetch("/api/auth/connect", {
      method: "POST",
      headers: { Authorization: `Bearer ${await user.getIdToken()}` }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.data?.token) {
      const code = typeof body?.code === "string" ? body.code : "CONNECT_FAILED";
      return { ok: false, code, message: MESSAGES[code] ?? body?.message ?? "No se pudo conectar." };
    }

    const credential = await signInWithCustomToken(auth, body.data.token);
    const tokenResult = await credential.user.getIdTokenResult(true);

    const callback = await fetch(`http://127.0.0.1:${params.port}/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: params.state,
        idToken: tokenResult.token,
        expiresAt: tokenResult.expirationTime
      })
    });
    if (!callback.ok) {
      return {
        ok: false,
        code: "CALLBACK_REJECTED",
        message: "El MCP rechazó la conexión. Vuelve a pedir la conexión desde Claude."
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      code: "CALLBACK_UNREACHABLE",
      message:
        "No se pudo contactar el MCP en este equipo. Verifica que Claude Desktop esté abierto en este mismo equipo y vuelve a intentar."
    };
  }
};
