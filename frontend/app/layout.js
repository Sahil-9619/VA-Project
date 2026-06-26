import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/provider/StoreProvider";
import { Toaster } from "sonner";
import AuthProvider from "../hooks/authProvider";
import { AppInitializer } from "../hooks/app-setting";
import { TranslationProvider } from "../contexts/TranslationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LMS",
  description: "LMS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <AppInitializer>
            <AuthProvider><TranslationProvider>{children}</TranslationProvider></AuthProvider>
          </AppInitializer>
          <Toaster />
          <Toaster richColors />
        </StoreProvider>
      </body>
    </html>
  );
}
