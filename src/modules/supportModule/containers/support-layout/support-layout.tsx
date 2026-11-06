"use client";

import { useEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";

import { MessageProvider } from "@/context/MessageContext";
import { getMessageComponentTheme } from "@/theme/themeConfig";
import {
  WalletThemeProvider,
  useWalletTheme
} from "@/modules/walletModule/contexts/wallet-theme-context";

function SupportChrome({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useWalletTheme();
  const isDark = resolvedTheme === "dark";

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
        },
        components: { Message: getMessageComponentTheme(isDark) }
      }}
    >
      <MessageProvider>{children}</MessageProvider>
    </ConfigProvider>
  );
}

/** Marco de /support y /support-desk: mismo tema claro/oscuro que Tareas (menú del avatar). */
export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletThemeProvider>
      <SupportChrome>{children}</SupportChrome>
    </WalletThemeProvider>
  );
}

export const useSupportDark = () => useWalletTheme().resolvedTheme === "dark";
