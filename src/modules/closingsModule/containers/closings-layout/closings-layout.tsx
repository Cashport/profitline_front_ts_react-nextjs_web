"use client";

import { useEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { MessageProvider } from "@/context/MessageContext";
import {
  WalletThemeProvider,
  useWalletTheme
} from "@/modules/walletModule/contexts/wallet-theme-context";
import { DARK_ELEVATED_BG, getMessageComponentTheme } from "@/theme/themeConfig";

import "../../closings.scss";

function ClosingsChrome({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useWalletTheme();
  const isDark = resolvedTheme === "dark";

  // El fondo de la página está en <body>, fuera de <main class="dark">: se refleja ahí.
  useEffect(() => {
    const cls = "wallet-dark";
    document.body.classList.toggle(cls, isDark);
    return () => document.body.classList.remove(cls);
  }, [isDark]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#CBE71E",
          fontFamily: "inherit",
          ...(isDark
            ? {
                colorText: "rgba(255, 255, 255, 0.85)",
                colorTextSecondary: "rgba(255, 255, 255, 0.65)",
                colorTextPlaceholder: "rgba(255, 255, 255, 0.25)",
                colorSplit: "rgba(253, 253, 253, 0.12)",
                colorBgElevated: DARK_ELEVATED_BG
              }
            : { colorTextSecondary: "rgba(0, 0, 0, 0.65)" })
        },
        components: {
          ...(isDark && { Popover: { colorBgElevated: DARK_ELEVATED_BG } }),
          Message: getMessageComponentTheme(isDark)
        }
      }}
    >
      <MessageProvider>
        <ViewWrapper
          headerTitle="Cierres de cartera"
          hideHeader
          className={isDark ? "dark closings-scope" : "closings-scope"}
        >
          {children}
        </ViewWrapper>
      </MessageProvider>
    </ConfigProvider>
  );
}

/** Marco de /cierres: tema claro/oscuro (el mismo de Cartera, elegido en el menú del avatar). */
export default function ClosingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletThemeProvider>
      <ClosingsChrome>{children}</ClosingsChrome>
    </WalletThemeProvider>
  );
}

/** true si el tablero está en modo oscuro (para portales: drawer, modales). */
export const useClosingsDark = () => useWalletTheme().resolvedTheme === "dark";
