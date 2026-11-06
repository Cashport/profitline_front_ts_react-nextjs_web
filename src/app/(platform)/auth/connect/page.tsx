"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoginView } from "@/components/organisms/auth/login/Login";
import { setLoginCompletionOverride } from "../../../../../firebase-utils";
import { completeMcpConnect, parseMcpConnectParams } from "@/utils/auth/mcpConnect";

type Status = "login" | "sending" | "done" | "error";

const cardStyle: React.CSSProperties = {
  maxWidth: 520,
  margin: "15vh auto 0",
  padding: 32,
  borderRadius: 12,
  border: "1px solid #ddd",
  fontFamily: "sans-serif",
  textAlign: "center"
};

function ConnectContent() {
  const searchParams = useSearchParams();
  const paramsRef = useRef(
    parseMcpConnectParams(searchParams.get("port"), searchParams.get("state"))
  );
  const [status, setStatus] = useState<Status>("login");
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname);
    const params = paramsRef.current;
    if (!params) return;
    setLoginCompletionOverride(async () => {
      setStatus("sending");
      const result = await completeMcpConnect(params);
      if (result.ok) {
        setStatus("done");
      } else {
        setMessage(result.message);
        setStatus("error");
      }
    });
    return () => setLoginCompletionOverride(null);
  }, []);

  if (!paramsRef.current) {
    return (
      <div style={cardStyle}>
        <h2>Enlace de conexión no válido</h2>
        <p>Vuelve a pedirle a Claude que se conecte a Cashport.</p>
      </div>
    );
  }
  if (status === "done") {
    return (
      <div style={cardStyle}>
        <h2>Listo, conexión completada</h2>
        <p>Ya puedes volver a Claude y cerrar esta pestaña.</p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div style={cardStyle}>
        <h2>No se pudo conectar</h2>
        <p>{message}</p>
        <p>Vuelve a pedirle a Claude que se conecte a Cashport.</p>
      </div>
    );
  }
  if (status === "sending") {
    return (
      <div style={cardStyle}>
        <h2>Conectando…</h2>
      </div>
    );
  }
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "10px 16px",
          background: "#fff8e1",
          borderBottom: "1px solid #f0d98c",
          textAlign: "center",
          fontFamily: "sans-serif",
          fontSize: 14
        }}
      >
        Estás conectando Claude (MCP) en este equipo. Al iniciar sesión se enviará tu sesión de
        Cashport a esa aplicación local. Si no lo pediste tú, cierra esta página.
      </div>
      <LoginView token={null} />
    </>
  );
}

export default function ConnectPage() {
  return (
    <Suspense fallback={null}>
      <ConnectContent />
    </Suspense>
  );
}
