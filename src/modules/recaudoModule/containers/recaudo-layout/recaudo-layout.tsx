"use client";

import { useEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { MessageProvider } from "@/context/MessageContext";
import { DARK_ELEVATED_BG, getMessageComponentTheme } from "@/theme/themeConfig";
import {
  WalletThemeProvider,
  useWalletTheme
} from "@/modules/walletModule/contexts/wallet-theme-context";

function RecaudoChrome({ children }: { children: React.ReactNode }) {
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
          ...(isDark && {
            colorText: "rgba(255, 255, 255, 0.85)",
            colorTextSecondary: "rgba(255, 255, 255, 0.65)",
            colorTextPlaceholder: "rgba(255, 255, 255, 0.25)",
            colorSplit: "rgba(253, 253, 253, 0.12)",
            colorBgElevated: DARK_ELEVATED_BG
          })
        },
        components: {
          // The root theme pins Popover's colorBgElevated (#F7F7F7) at component level, which
          // beats the global token above; re-declare it so the filters panel follows the dark theme.
          ...(isDark && { Popover: { colorBgElevated: DARK_ELEVATED_BG } }),
          Message: getMessageComponentTheme(isDark)
        }
      }}
    >
      {/* Own message holder so toasts render under this theme, not the root (light) one. */}
      <MessageProvider>
        <ViewWrapper
          headerTitle="Torre de control de recaudo"
          hideHeader
          className={isDark ? "dark" : ""}
        >
          {children}
        </ViewWrapper>
      </MessageProvider>
    </ConfigProvider>
  );
}

/** Marco de /dashboard: tema claro/oscuro (compartido con la cartera) sobre la vista sin el encabezado general. */
export default function RecaudoLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletThemeProvider>
      <RecaudoChrome>{children}</RecaudoChrome>
    </WalletThemeProvider>
  );
}
