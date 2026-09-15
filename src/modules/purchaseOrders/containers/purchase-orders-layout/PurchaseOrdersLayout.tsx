"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConfigProvider, theme as antdTheme } from "antd";

import ViewWrapper from "@/components/organisms/ViewWrapper/ViewWrapper";
import { MessageProvider } from "@/context/MessageContext";
import { ThemeProvider, useTheme } from "@/modules/commerce/contexts/theme-context";
import { getMessageComponentTheme } from "@/theme/themeConfig";

interface PurchaseOrdersLayoutProps {
  children: React.ReactNode;
}

function PurchaseOrdersChrome({ children }: PurchaseOrdersLayoutProps) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isDashboard = pathname.startsWith("/purchase-orders/dashboard");
  // Dark mode is scoped to the dashboard only; every other purchase-orders route stays light.
  const isDark = isDashboard && resolvedTheme === "dark";

  // CSS can't style an ancestor, so mirror the dark state onto <body> to theme the page
  // background (and overscroll). Scoped to the dashboard and cleaned up on leave/unmount.
  useEffect(() => {
    const cls = "dashboard-dark";
    document.body.classList.toggle(cls, isDark);
    return () => document.body.classList.remove(cls);
  }, [isDark]);

  const content = (
    <ViewWrapper headerTitle="Ordenes de compra" className={isDark ? "dark" : ""}>
      {children}
    </ViewWrapper>
  );

  // Only the dashboard adopts the comercio-style AntD theme (dark algorithm + brand primary).
  // Other purchase-orders routes keep the global theme from the root ConfigProvider untouched.
  if (!isDashboard) return content;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: "#CBE71E", fontFamily: "inherit" },
        components: {
          Message: getMessageComponentTheme(isDark)
        }
      }}
    >
      {/* Own message holder so toasts render under this theme, not the root (light) one. */}
      <MessageProvider>{content}</MessageProvider>
    </ConfigProvider>
  );
}

export default function PurchaseOrdersLayout({ children }: PurchaseOrdersLayoutProps) {
  return (
    <ThemeProvider>
      <PurchaseOrdersChrome>{children}</PurchaseOrdersChrome>
    </ThemeProvider>
  );
}
