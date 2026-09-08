"use client";

import { useEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import {
  WalletThemeProvider,
  useWalletTheme
} from "@/modules/walletModule/contexts/wallet-theme-context";

function TicketsChrome({ children }: { children: React.ReactNode }) {
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
            colorBgElevated: "#1f1f1f"
          })
        }
      }}
    >
      <ViewWrapper headerTitle="Tickets" hideHeader className={isDark ? "dark" : ""}>
        {children}
      </ViewWrapper>
    </ConfigProvider>
  );
}

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletThemeProvider>
      <TicketsChrome>{children}</TicketsChrome>
    </WalletThemeProvider>
  );
}
