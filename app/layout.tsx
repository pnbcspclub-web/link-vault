import "antd/dist/reset.css";
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "Link Vault",
  description: "Personal link vault and shortener"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    window.__INITIAL_THEME__ = 'dark';
                    var style = document.createElement('style');
                    style.innerHTML = 'html, body, .lv-shell, .lv-main { background: #020617 !important; color: #f8fafc !important; } .lv-topbar, .lv-sider, .ant-layout-sider { background: #0f172a !important; border-color: #1e293b !important; } .ant-menu { background: transparent !important; color: #cbd5e1 !important; }';
                    style.id = 'theme-force-dark';
                    document.head.appendChild(style);
                  } else {
                    window.__INITIAL_THEME__ = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
