'use client';

import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import TopBar from '@/components/TopBar';
import ProtectedRoute from '@/contexts/ProtectedRoute';
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from '@/contexts/ThemeContext';

const geist = Geist({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-app text-app`} suppressHydrationWarning={true}>
        <Analytics mode="auto" />
        <ThemeProvider>
          <AuthProvider>   
            <ProtectedRoute>
              <TopBar />    
              <main>{children}</main>
            </ProtectedRoute>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}