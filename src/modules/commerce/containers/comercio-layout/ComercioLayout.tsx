"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConfigProvider, theme as antdTheme } from "antd";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { MessageProvider } from "@/context/MessageContext";
import { ThemeProvider, useTheme } from "@/modules/commerce/contexts/theme-context";
import { getMessageComponentTheme } from "@/theme/themeConfig";

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

  // Pantallas de segundo nivel: llevan "‹" volver a Mis pedidos (DESIGN.md §4).
  let headerTitle = "Mis pedidos";
  let headerBack: string | undefined;
  if (pathname.startsWith("/comercio/pedidoConfirmado")) {
    headerTitle = "Pedido confirmado";
    headerBack = "/comercio";
  } else if (pathname.startsWith("/comercio/pedido")) {
    headerTitle = "Crear orden";
    headerBack = "/comercio";
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#CBE71E",
          fontFamily: "inherit",
          ...(isDark && {
            colorText: "rgba(255, 255, 255, 0.85)",
            colorTextSecondary: "rgba(255, 255, 255, 0.65)",
            colorTextPlaceholder: "rgba(255, 255, 255, 0.25)",
            colorSplit: "rgba(253, 253, 253, 0.12)",
            colorBgElevated: "#1f1f1f"
          })
        },
        components: {
          Message: getMessageComponentTheme(isDark)
        }
      }}
    >
      {/* Own message holder so toasts render under this theme, not the root (light) one. */}
      <MessageProvider>
        <ViewWrapper
          headerTitle={headerTitle}
          headerBack={headerBack}
          // El dashboard pinta su propio Header: sus filtros viven en su estado.
          hideHeader={isDashboard}
          className={isDark ? "dark" : ""}
        >
          {children}
        </ViewWrapper>
      </MessageProvider>
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
