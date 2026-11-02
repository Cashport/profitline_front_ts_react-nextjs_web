"use client";
import { LoginView } from "@/components/organisms/auth/login/Login";
import { useSearchParams } from "next/navigation";

function LoginPage() {
  return <LoginView token={useSearchParams().get("token") || null} />;
}

export default LoginPage;
