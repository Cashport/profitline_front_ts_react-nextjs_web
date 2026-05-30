"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConfigProvider, theme as antdTheme } from "antd";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { ThemeProvider, useTheme } from "@/modules/commerce/contexts/theme-context";

interface ComercioLayoutClientProps {
  children: React.ReactNode;
}

function ComercioChrome({ children }: ComercioLayoutClientProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isDashboard = pathname.startsWith("/comercio/dashboard");
  // Dark mode is scoped to the dashboard only; every other comercio route stays light.
  const isDark = isDashboard && resolvedTheme === "dark";

  // CSS can't style an ancestor, so mirror the dark state onto <body> to theme the page
  // background (and overscroll). Scoped to the dashboard and cleaned up on leave/unmount.
  useEffect(() => {
    const cls = "comercio-dark";
    document.body.classList.toggle(cls, isDark);
    return () => document.body.classList.remove(cls);
  }, [isDark]);

  let headerTitle = "Mis pedidos";
  if (pathname.startsWith("/comercio/pedido")) {
    headerTitle = "Crear orden";
  } else if (isDashboard) {
    headerTitle = "Dashboard";
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: "#CBE71E", fontFamily: "inherit" }
      }}
    >
      <ViewWrapper
        headerTitle={headerTitle}
        hideHeader={pathname.startsWith("/comercio/pedido")}
        className={isDark ? "dark" : ""}
      >
        {children}
      </ViewWrapper>
    </ConfigProvider>
  );
}

export default function ComercioLayout({ children }: ComercioLayoutClientProps) {
  return (
    <ThemeProvider>
      <ComercioChrome>{children}</ComercioChrome>
    </ThemeProvider>
  );
}
