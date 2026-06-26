"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Package, Menu, X, LogOut, ChevronDown, Coins,
  HeartHandshake, User, Settings, Wallet, Layout
} from "lucide-react";
import { logout } from "@/lib/store/features/authSlice";
import { brandName } from "../../../contants";

const menuItems = [
  { name: "Dashboard", icon: Home, href: "/admin/dashboard" },
  {
    name: "Users",
    icon: Package,
    children: [
      { name: "All Users", href: "/admin/dashboard/users" },
      { name: "Create Users", href: "/admin/dashboard/users/add-user" },
    ],
  },
  { name: "Student Details", icon: User, href: "/admin/dashboard/students_details" },
  { name: "Class & Section", icon: Layout, href: "/admin/dashboard/class_section_management" },
  {
    name: "Fee Management",
    icon: Wallet,
    children: [
      { name: "Fee Structure", href: "/admin/dashboard/fee_structure" },
      { name: "Student Fee", href: "/admin/dashboard/student_fee" },      
    ],
  },
  { name: "Support", icon: HeartHandshake, href: "/admin/dashboard/support" },
  { name: "Categories", icon: Coins, href: "/admin/dashboard/categories" },
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
      if (mobile) setOpen(false); // Default close on mobile
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
        const isChildActive = item.children.some((child) => pathname?.startsWith(child.href));
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
    } catch (error) {
    }
  };

  const toggleMenu = (name) => {
    if (!open) setOpen(true); 
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
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
          className="fixed inset-0 bg-black/60 z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Floating Menu Button (When Sidebar is closed) */}
      {isMobile && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 bg-slate-950 hover:bg-[#178F9E] text-white rounded-lg shadow-lg transition-colors"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
      )}

      <aside 
        className={`fixed md:relative z-50 flex flex-col h-screen bg-slate-950 text-slate-300 transition-transform duration-300 ease-in-out border-r border-slate-800 shadow-2xl flex-shrink-0 
${open ? "translate-x-0 w-[240px]" : "-translate-x-full md:translate-x-0 md:w-[70px]"}        `}
      >
        {/* Desktop Collapse Toggle Button (Hidden on Mobile) */}
        {!isMobile && (
          <button
            onClick={() => setOpen(!open)}
            className="absolute -right-3.5 top-8 w-7 h-7 bg-slate-800 hover:bg-[#178F9E] text-white border-2 border-slate-950 rounded-full flex items-center justify-center transition-colors z-50 shadow-sm"
          >
            {open ? <X size={14} strokeWidth={3} /> : <Menu size={14} strokeWidth={3} />}
          </button>
        )}

        {/* Mobile Close Button (Inside Sidebar) */}
        {isMobile && open && (
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-6 p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        )}

        {/* App Logo Area */}
        <div className="h-24 flex items-center justify-center border-b border-slate-800/50 px-6 flex-shrink-0">
          <h1 className={`font-black text-white tracking-tight transition-all duration-300 whitespace-nowrap ${open ? "text-smsideebar" : "text-sm"}`}>
  {open ? `${brandName?.toUpperCase() || "APP"} ADMIN` : (brandName?.substring(0, 2).toUpperCase() || "AD")}
</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 hide-scrollbar space-y-1.5">
          {menuItems.map((item, idx) => {
            const isItemActive = item.href 
              ? isActive(item.href) 
              : item.children?.some(child => isActive(child.href));

            const isMenuOpen = openMenus.includes(item.name) && open;

            return (
              <div key={idx} className="flex flex-col">
                {/* Parent Item */}
                {item.children ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isItemActive || isMenuOpen
                        ? "bg-[#178F9E]/10 text-[#178F9E] font-semibold"
                        : "hover:bg-slate-800/50 hover:text-white text-slate-400 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${isItemActive || isMenuOpen ? "text-[#178F9E]" : "text-slate-500 group-hover:text-slate-300"}`} />
                      <span className={`truncate transition-opacity duration-200 ${!open && "opacity-0 w-0 hidden"}`}>
                        {item.name}
                      </span>
                    </div>
                    {open && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${isMenuOpen ? "rotate-180 text-[#178F9E]" : "text-slate-500 group-hover:text-slate-300"}`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setOpen(false)} // Close on mobile after clicking
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isItemActive
                        ? "bg-[#178F9E] text-white shadow-md shadow-[#178F9E]/20 font-semibold"
                        : "hover:bg-slate-800/50 hover:text-white text-slate-400 font-medium"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isItemActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                    <span className={`truncate transition-opacity duration-200 ${!open && "opacity-0 w-0 hidden"}`}>
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
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-1 mb-2 ml-5 pl-4 border-l-2 border-slate-800/80 space-y-1">
                        {item.children.map((sub, subIdx) => {
                          const isChildActive = isActive(sub.href);
                          return (
                            <li key={subIdx}>
                              <Link
                                href={sub.href}
                                onClick={() => isMobile && setOpen(false)} // Close on mobile after clicking
                                className={`flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 text-sm ${
                                  isChildActive
                                    ? "text-[#178F9E] font-bold bg-[#178F9E]/5"
                                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/30 font-medium"
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
        <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 font-medium ${
              !open && "justify-center"
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-rose-500 transition-colors" />
            <span className={`truncate transition-opacity duration-200 ${!open && "opacity-0 w-0 hidden"}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}