"use client";
import React, { useState } from "react";
import {
  Home,
  ShoppingBag,
  Package,
  Users,
  Banknote,
  Section,
  SeparatorVertical,
  Menu,
  X,
  LogOut,
  PackagePlusIcon,
  Video,
  PaintBucket,
  Pen,
  Camera,
  Star,
  ChartNoAxesGanttIcon,
  ChevronDown,
  Coins,
  PersonStanding,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { brandName } from "@/app/contants";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/store/features/authSlice";
// import { logout } from "@/app/lib/store/features/authSlice"; // make sure path is correct

// menuItems can contain children for collapsible menus
const menuItems = [
  { name: "Dashboard", icon: Home, href: "/instructor/dashboard" },
  {
    name: "Courses",
    icon: Package,
    children: [
      { name: "My Courses", href: "/instructor/dashboard/courses/my-courses" },
      {
        name: "Create Course",
        href: "/instructor/dashboard/courses/add-course",
      },
    ],
  },
  { name: "My Earning", icon: Coins, href: "/instructor/dashboard/earning" },
  {
    name: "Profile",
    icon: User,
    href: "/instructor/dashboard/profile",
  },

  // {
  //   name: "Orders",
  //   icon: ShoppingBag,
  //   children: [
  //     { name: "All Orders", href: "/instructor/orders" },
  //     { name: "Refunds", href: "/instructor/orders/refunds" },
  //   ],
  // },
  { name: "Users", icon: Users, href: "/instructor/users" },
  {
    name: "Logout",
    icon: LogOut,
    href: "/authentication/login",
    isLogout: true,
  },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState([]); // track collapsible menus
  const router = useRouter();
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.appSettings);

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      await dispatch(logout());
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleMenu = (name) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  return (
    <aside className="flex h-full bg-gray-900 text-gray-100">
      <div
        className={`${
          open ? "w-64" : "w-20"
        } bg-gray-900 p-4 pt-6 relative duration-300`}
      >
        {/* Toggle Sidebar */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-8 w-7 h-7 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Logo */}
        <h1
          className={`text-xl font-bold mb-8 text-center transition-all ${
            !open && "scale-0"
          }`}
        >
          {settings?.platformName}.
        </h1>

        {/* Menu Items */}
        <ul className="space-y-2">
          {menuItems.map((item, idx) => (
            <li key={idx}>
              {item.isLogout ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 p-2 rounded-md hover:bg-gray-800 transition text-left"
                >
                  <item.icon size={20} />
                  <span
                    className={`${!open && "hidden"} origin-left duration-200`}
                  >
                    {item.name}
                  </span>
                </button>
              ) : item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className="flex w-full items-center justify-between p-2 rounded-md hover:bg-gray-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span
                        className={`${
                          !open && "hidden"
                        } origin-left duration-200`}
                      >
                        {item.name}
                      </span>
                    </div>
                    {open && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          openMenus.includes(item.name) ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  {openMenus.includes(item.name) && open && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children.map((sub, subIdx) => (
                        <li key={subIdx}>
                          <Link
                            href={sub.href}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 transition text-sm"
                          >
                            <span>{sub.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 transition"
                >
                  <item.icon size={20} />
                  <span
                    className={`${!open && "hidden"} origin-left duration-200`}
                  >
                    {item.name}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
