"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isAuthPage = 
    pathname?.startsWith("/user/login") || 
    pathname?.startsWith("/user/register") || 
    pathname?.startsWith("/user/forgot-password") || 
    pathname?.startsWith("/user/reset-password");

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    let initialTheme = "light";
    if (stored) {
      initialTheme = stored;
    } else {
      initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthPage) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, isAuthPage, mounted]);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
