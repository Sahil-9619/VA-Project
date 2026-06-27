"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Package,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Coins,
  HeartHandshake,
  User,
  Settings,
  Wallet,
  Layout,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { logout } from "@/lib/store/features/authSlice";
import { brandName } from "../../../contants";
import CustomScrollbar from "@/components/ui/CustomScrollbar";

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/admin/dashboard" },
  { name: "All Users", icon: Package, href: "/admin/dashboard/users" },
  {
    name: "Student Details",
    icon: User,
    href: "/admin/dashboard/students_details",
  },
  {
    name: "Class & Section",
    icon: Layout,
    href: "/admin/dashboard/class_section_management",
  },
  {
    name: "Fee Management",
    icon: Wallet,
    children: [
      { name: "Fee Structure", href: "/admin/dashboard/fee_structure" },
      { name: "Student Fee", href: "/admin/dashboard/student_fee" },
    ],
  },
  { name: "Support", icon: HeartHandshake, href: "/admin/dashboard/support" },
  // { name: "Categories", icon: Coins, href: "/admin/dashboard/categories" },
  { name: "Settings", icon: Settings, href: "/admin/dashboard/settings" },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openMenus, setOpenMenus] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  // Detect Mobile Screen & Auto-adjust Sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile)
        setOpen(false); // Default close on mobile
      else setOpen(true); // Default open on desktop
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-expand menus if a child route is active on load
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          pathname?.startsWith(child.href),
        );
        if (isChildActive && !openMenus.includes(item.name)) {
          setOpenMenus((prev) => [...prev, item.name]);
        }
      }
    });
  }, [pathname, openMenus]);

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      // router.push("/authentication/login")
    } catch (error) {}
  };

  const toggleMenu = (name) => {
    if (!open) setOpen(true);
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  };

  // STRICT active check so parent paths don't accidentally highlight
  const isActive = (href) => {
    if (!href) return false;
    // Exact match required for the base dashboard to prevent it from always being active
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile Overlay Background - Dimming effect */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-admin-bg/80 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Floating Menu Button (When Sidebar is closed) */}
      {isMobile && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-admin-card/90 backdrop-blur-md hover:bg-admin-primary text-admin-text rounded-lg shadow-lg border border-admin-border transition-all duration-300"
        >
          <Menu size={18} strokeWidth={2.5} />
        </button>
      )}

      <aside
        className={`fixed md:relative z-50 flex flex-col h-screen bg-admin-bg/60 backdrop-blur-md text-admin-text transition-all duration-300 ease-out border-r border-admin-border/50 shadow-[2px_0_8px_rgba(0,0,0,0.1)] flex-shrink-0 
${open ? "translate-x-0 w-[220px]" : "-translate-x-full md:translate-x-0 md:w-[68px]"}        `}
      >
        {/* Desktop Collapse Toggle Button (Hidden on Mobile) */}
        {!isMobile && (
          <button
            onClick={() => setOpen(!open)}
            className="absolute -right-3 top-5 w-6 h-6 bg-admin-card hover:bg-admin-primary hover:scale-110 text-admin-text border border-admin-border rounded-full flex items-center justify-center transition-all duration-300 z-50 shadow-md"
          >
            {open ? (
              <ChevronLeft size={14} strokeWidth={3} />
            ) : (
              <ChevronRight size={14} strokeWidth={3} />
            )}
          </button>
        )}

        {/* Mobile Close Button (At Boundary) */}
        {isMobile && open && (
          <button
            onClick={() => setOpen(false)}
            className="absolute -right-4 top-5 w-8 h-8 bg-admin-card hover:bg-rose-500 text-admin-text border border-admin-border rounded-full flex items-center justify-center transition-all duration-300 z-50 shadow-lg"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}

        {/* App Logo Area */}
        <div className="h-20 flex flex-col items-center justify-center border-b border-admin-border px-4 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-admin-primary/5 blur-2xl rounded-full scale-150 pointer-events-none"></div>
          {open ? (
            <>
              <h1 className="font-black text-admin-text tracking-tight transition-all duration-300 whitespace-nowrap drop-shadow-sm text-[16px] leading-tight">
                VIGYAN ACADEMY
              </h1>
              <span className="text-[10px] tracking-[0.2em] text-admin-primary font-bold uppercase mt-1">
                Admin Panel
              </span>
            </>
          ) : (
            <h1 className="font-black text-admin-text tracking-tight transition-all duration-300 whitespace-nowrap drop-shadow-sm text-sm">
              VA
            </h1>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 relative hide-scrollbar">
          {menuItems.map((item, idx) => {
            const isItemActive = item.href
              ? isActive(item.href)
              : item.children?.some((child) => isActive(child.href));

            const isMenuOpen = openMenus.includes(item.name) && open;

            return (
              <div key={idx} className="flex flex-col relative">
                {/* Parent Item */}
                {item.children ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between py-2.5 pl-4 pr-3 transition-all duration-200 group relative overflow-hidden ${
                      isItemActive
                        ? "bg-gradient-to-r from-admin-primary/20 to-transparent text-admin-text font-semibold border-l-[4px] border-admin-primary rounded-r-xl rounded-l-full shadow-sm"
                        : isMenuOpen
                          ? "bg-admin-card/40 text-admin-text font-medium rounded-xl border-l-[4px] border-transparent"
                          : "hover:bg-admin-card/40 text-admin-text/60 font-medium rounded-xl border-l-[4px] border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 relative z-10">
                      <item.icon
                        className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-300 ${isItemActive ? "text-admin-primary drop-shadow-[0_0_8px_rgba(23,143,158,0.5)]" : isMenuOpen ? "text-admin-text" : "text-admin-text/40 group-hover:text-admin-text/80 group-hover:scale-110"}`}
                      />
                      <span
                        className={`truncate text-[13px] transition-opacity duration-300 ${!open && "opacity-0 w-0 hidden"}`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {open && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 relative z-10 ${isMenuOpen ? "rotate-180 text-admin-text" : "text-admin-text/40 group-hover:text-admin-text/80"}`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setOpen(false)} // Close on mobile after clicking
                    className={`flex items-center gap-2.5 py-2.5 pl-4 pr-3 transition-all duration-300 group relative overflow-hidden ${
                      isItemActive
                        ? "bg-gradient-to-r from-admin-primary/20 to-transparent text-admin-text font-semibold border-l-[4px] border-admin-primary rounded-r-xl rounded-l-full shadow-sm"
                        : "hover:bg-admin-card/40 text-admin-text/60 font-medium hover:translate-x-1 rounded-xl border-l-[4px] border-transparent"
                    }`}
                  >
                    <item.icon
                      className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-300 ${isItemActive ? "text-admin-primary drop-shadow-[0_0_8px_rgba(23,143,158,0.5)]" : "text-admin-text/40 group-hover:text-admin-text/80 group-hover:scale-110"}`}
                    />
                    <span
                      className={`truncate text-[13px] transition-opacity duration-300 ${!open && "opacity-0 w-0 hidden"}`}
                    >
                      {item.name}
                    </span>
                  </Link>
                )}

                {/* Collapsible Child Menu */}
                <AnimatePresence>
                  {item.children && isMenuOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-1 mb-1.5 ml-5 pl-3 border-l border-admin-border space-y-0.5">
                        {item.children.map((sub, subIdx) => {
                          const isChildActive = isActive(sub.href);
                          return (
                            <li key={subIdx} className="relative">
                              {/* Small dot indicator for active child */}
                              {isChildActive && (
                                <span className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-admin-primary shadow-[0_0_8px_var(--admin-primary)]" />
                              )}
                              <Link
                                href={sub.href}
                                onClick={() => isMobile && setOpen(false)} // Close on mobile after clicking
                                className={`flex items-center py-2 px-2.5 rounded-md transition-all duration-200 text-xs ${
                                  isChildActive
                                    ? "text-admin-primary font-semibold bg-admin-primary/5"
                                    : "text-admin-text/60 hover:text-admin-text hover:bg-admin-card/30 hover:translate-x-1 font-medium"
                                }`}
                              >
                                <span className="truncate">{sub.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Pinned Logout Button */}
        <div className="p-4 border-t border-admin-border flex-shrink-0 bg-admin-bg/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg transition-all duration-300 group overflow-hidden relative ${
              !open ? "justify-center" : ""
            } bg-admin-card/50 hover:bg-rose-500/10 border border-admin-border hover:border-rose-500/30 text-admin-text/60 hover:text-rose-400 font-medium`}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0 text-admin-text/40 group-hover:text-rose-400 transition-colors duration-300" />
            <span
              className={`truncate text-[13px] transition-opacity duration-300 ${!open && "opacity-0 w-0 hidden"}`}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
