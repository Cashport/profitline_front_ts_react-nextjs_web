"use client";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { MessageProvider } from "@/context/MessageContext";
import { Poppins } from "next/font/google";
import { ModalProvider } from "@/context/ModalContext";
import localFont from "next/font/local"; // Import localFont from next/font/local

import Loader from "@/components/atoms/loaders/loader";
import theme from "@/theme/themeConfig";

// Dayjs global configuration
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

import "../styles/globals.scss";

const queryClient = new QueryClient();

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins" // Define a CSS variable for Poppins
});

const aptosNarrow = localFont({
  src: "../../public/fonts/aptos-narrow.woff2", // Adjust the path to your font file
  variable: "--mono-space-font" // Define a CSS variable for aptosNarrow
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <html lang="es" className={`${poppins.variable} ${aptosNarrow.variable}`}>
        <QueryClientProvider client={queryClient}>
          <body className={poppins.className} suppressHydrationWarning>
            <AntdRegistry>
              {loading ? (
                <Loader />
              ) : (
                <MessageProvider>
                  <ModalProvider>{children}</ModalProvider>
                </MessageProvider>
              )}
            </AntdRegistry>
          </body>
        </QueryClientProvider>
      </html>
    </ConfigProvider>
  );
}
