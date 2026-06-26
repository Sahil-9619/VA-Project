"use client";

import React, { useState, useEffect } from "react";
import { CalendarDays, User, Maximize, Minimize, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useTheme } from "@/components/theme-provider";

export default function AdminTopbar() {
  const pathname = usePathname();
  const user = useSelector((state) => state.auth?.user);
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Format the pathname into a readable title
  const getPageTitle = () => {
    if (!pathname) return "Dashboard";
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 2) return "Dashboard";
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header className="h-14 px-6 border-b border-gray-200 dark:border-admin-border/50 bg-admin-bg/60 backdrop-blur-md flex items-center justify-between z-10 sticky top-0 flex-shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile space offset since the menu button is fixed top-4 left-4 */}
        <div className="md:hidden w-8"></div>
        <div className="flex items-center gap-3 bg-admin-card px-4 py-2 rounded-xl border border-admin-border shadow-sm">
          <div className="w-[5px] h-[20px] bg-admin-primary rounded-full"></div>
          <h2 className="text-sm font-bold text-admin-text tracking-wider uppercase">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date & Time */}
        {mounted && (
          <div className="hidden md:flex items-center gap-3 bg-admin-card/50 border border-admin-border px-4 py-2 rounded-full text-sm text-admin-text/80">
            <CalendarDays className="w-4 h-4 text-admin-primary" />
            <div className="flex items-center gap-2">
              <span className="font-medium text-admin-text">{currentDate}</span>
              <span className="w-1 h-1 bg-admin-border rounded-full"></span>
              <span className="text-admin-text/60">{currentTime}</span>
            </div>
          </div>
        )}

        {/* Theme Toggle with Shine and Click Animations */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative p-2 text-admin-text/60 hover:text-admin-primary transition-colors rounded-full hover:bg-admin-border/50 group overflow-hidden"
            title="Toggle Theme"
          >
            {/* Shine hover effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shine_1s_infinite] pointer-events-none" />

            <div className="active:scale-75 active:rotate-12 transition-all duration-200">
              {theme === "dark" ? (
                <Moon className="w-5 h-5 animate-pulse text-indigo-300" />
              ) : (
                <Sun className="w-5 h-5 animate-[spin_4s_linear_infinite] text-amber-500" />
              )}
            </div>
          </button>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="relative p-2 text-admin-text/60 hover:text-admin-primary transition-colors rounded-full hover:bg-admin-border/50"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-admin-border">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-admin-primary to-[#147a87] flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-admin-text">{user?.name || user?.fullName || "Admin"}</p>
            <p className="text-xs text-admin-text/60">{user?.email || "admin@vigyan.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
