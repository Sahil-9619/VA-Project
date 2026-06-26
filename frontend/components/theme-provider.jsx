"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, []);

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
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
