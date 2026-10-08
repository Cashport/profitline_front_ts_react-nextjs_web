"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

// ssr:false evita que el SDK de Firebase Auth (no compatible con Node/SSR) se
// ejecute en el servidor, que es la causa de "Component auth has not been
// registered yet" en App Router. Mismo patrón ya usado en GeneralDashboard.tsx.
const LoginView = dynamic(
  () => import("@/components/organisms/auth/login/Login").then((mod) => mod.LoginView),
  { ssr: false }
);

function LoginPage() {
  return <LoginView token={useSearchParams().get("token") || null} />;
}

export default LoginPage;
