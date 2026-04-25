"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    __INITIAL_THEME__?: string;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <AntdThemeWrapper>{children}</AntdThemeWrapper>
    </NextThemesProvider>
  );
}

function AntdThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Remove the blocking style tag once hydrated
    const forceStyle = document.getElementById('theme-force-dark');
    if (forceStyle) forceStyle.remove();
  }, []);

  // Use the pre-hydration theme to avoid the 1-second "light mode" flash
  // By checking the window object which was set by our blocking script in layout.tsx
  const isDark = mounted 
    ? resolvedTheme === "dark" 
    : (typeof window !== "undefined" && window.__INITIAL_THEME__ === "dark");

  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            borderRadius: 12,
            colorPrimary: isDark ? "#3b82f6" : "#2563eb",
            fontFamily: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            colorBgBase: isDark ? "#020617" : "#f8fafc",
            colorTextBase: isDark ? "#f8fafc" : "#0f172a",
            colorBorder: isDark ? "#1e293b" : "#e2e8f0",
          },
          components: {
            Card: {
              borderRadiusLG: 18,
              colorBgContainer: isDark ? "#0f172a" : "#ffffff",
            },
            Button: {
              borderRadius: 10,
              borderRadiusLG: 12,
            },
            Input: {
              borderRadius: 10,
              borderRadiusLG: 12,
              colorBgContainer: isDark ? "#1e293b" : "#ffffff",
            },
            Select: {
              colorBgContainer: isDark ? "#1e293b" : "#ffffff",
            },
            Layout: {
              headerBg: isDark ? "#0f172a" : "#ffffff",
              bodyBg: isDark ? "#020617" : "#f8fafc",
              siderBg: isDark ? "#0f172a" : "#ffffff",
            },
            Menu: {
              itemBg: "transparent",
              subMenuItemBg: "transparent",
              itemSelectedBg: isDark ? "#3b82f6" : "#2563eb",
              itemSelectedColor: "#ffffff",
            },
            Modal: {
              colorBgElevated: isDark ? "#0f172a" : "#ffffff",
            }
          }
        }}
      >
        {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
