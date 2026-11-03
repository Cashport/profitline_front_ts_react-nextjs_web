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

import ComingSoon from "../../components/coming-soon/coming-soon";

/* Las vistas aún leen mocked-data.ts: hasta conectar el API se muestra "Próximamente"
   en todas las rutas del módulo. Al conectarlo, pasar a false (o quitarlo). */
const SHOW_COMING_SOON = true;

function BlockingAlertsChrome({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useWalletTheme();
  const isDark = resolvedTheme === "dark";

  // CSS can't style an ancestor, so mirror the dark state onto <body> to theme the page
  // background (and overscroll). Cleaned up on leave/unmount.
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
            : {
                // The root theme pins it to white, which hides the unselected Segmented options.
                colorTextSecondary: "rgba(0, 0, 0, 0.65)"
              })
        },
        components: {
          ...(isDark && { Popover: { colorBgElevated: DARK_ELEVATED_BG } }),
          Message: getMessageComponentTheme(isDark)
        }
      }}
    >
      {/* Own message holder so toasts render under this theme, not the root (light) one. */}
      <MessageProvider>
        <ViewWrapper headerTitle="Alertas de bloqueo" hideHeader className={isDark ? "dark" : ""}>
          {SHOW_COMING_SOON ? <ComingSoon /> : children}
        </ViewWrapper>
      </MessageProvider>
    </ConfigProvider>
  );
}

/** Marco de /blockingAlerts: tema claro/oscuro (compartido con la cartera) sobre la vista sin el encabezado general. */
export default function BlockingAlertsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletThemeProvider>
      <BlockingAlertsChrome>{children}</BlockingAlertsChrome>
    </WalletThemeProvider>
  );
}
