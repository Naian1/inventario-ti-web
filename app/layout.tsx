import './globals.css';
import Script from 'next/script';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Inventário TI',
  description: 'Sistema de inventário de TI',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('inventoryTheme');
  const theme = themeCookie?.value ?? 'light';

  return (
    <html lang="pt-BR" className={theme}>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              const stored = localStorage.getItem('inventoryTheme');
              const theme = stored || 'light';
              document.documentElement.className = theme;
            })();
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
