import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { NotificationsProvider } from "./components/NotificationsProvider";
import BottomNav from "./components/ui/BottomNav";

export const metadata: Metadata = {
  title: "AppEmprendedores",
  description: "Marketplace de emprendimientos de Rafaela.",
};

const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col pb-16">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        <ThemeProvider>
          <NotificationsProvider>
            {children}
            <BottomNav />
          </NotificationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

