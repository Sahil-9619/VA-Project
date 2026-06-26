"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  CreditCard,
  User,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  BookOpenText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminServices } from "@/services/admin/admin.service";
import { brandName } from "@/app/contants";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/store/features/authSlice";


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [student, setStudent] = useState(null);
  const isAdmitted = !!student?._id;


  const profileRef = useRef(null);

  // ✅ Fetch menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await adminServices.getDashborddata();
        const backendMenu = res?.menu || [];

        const mapped = backendMenu.map((item) => {
          if (item === "Dashboard")
            return { name: "Dashboard", path: "user/dashboard", icon: <LayoutDashboard size={18} /> };
          if (item === "Fee Payment")
            return { name: "Fee Payment", path: "user/fee_payment", icon: <CreditCard size={18} /> };

          return {
            name: item,
            path: `/${item.toLowerCase().replace(/\s+/g, "-")}`,
            icon: <LayoutDashboard size={18} />,
          };
        });

        setLinks([
          ...mapped,
          { name: "Dashboard", path: "/user/dashboard", icon: <LayoutDashboard size={18} /> },
          { name: "My Courses", path: "/user/mycourses", icon: <BookOpenText size={18} /> },
          { name: "Fee Payment", path: "/user/fee_payment", icon: <CreditCard size={18} /> },
          { name: "My Profile", path: "/user/myprofile", icon: <User size={18} /> },
        ]);
      } catch (err) {
        console.error(err);

        setLinks([
          { name: "Dashboard", path: "/user/dashboard", icon: <LayoutDashboard size={18} /> },
          { name: "My Courses", path: "/user/mycourses", icon: <User size={18} /> },
          { name: "Fee Payment", path: "/user/fee_payment", icon: <CreditCard size={18} /> },
          { name: "My Profile", path: "/user/myprofile", icon: <User size={18} /> },
        ]);
      }
    };

    fetchMenu();
  }, []);


  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!user?.email) return;

        const res = await adminServices.getStudentByEmail(user.email);
        setStudent(res?.data || res);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudent();
  }, [user]);


  const getInitials = (name) => {
    if (!name) return "...";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // close dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const profileItems = [
    { name: "Settings", icon: <Settings size={16} /> },
    { name: "Help Support", icon: <HelpCircle size={16} /> },
    { name: "Sign Out", icon: <LogOut size={16} />, color: "text-red-500" },
  ];

  //handle logout
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="fixed top-0 w-full z-50 
bg-gradient-to-r from-[#063F46] via-[#0A6B78] to-[#063F46]
backdrop-blur-lg shadow-md">

      <div className="w-full px-6 py-1 flex justify-between items-center border-b border-white/10">

        {/* LEFT - Logo */}
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" className="h-8" />
          <span className="text-white font-bold text-xl">{brandName}</span>
        </div>

        {/* CENTER - Menu */}
        <div className="hidden lg:flex items-center gap-2 
bg-white/10 backdrop-blur-md border border-white/10 
p-1.5 rounded-2xl">
          {links.map((item) => {
            const isDashboard = item.name === "Dashboard";
            const locked = !isAdmitted && !isDashboard;

            return (
              <div key={item.name} className="relative group">
                <Link
                  href={locked ? "#" : item.path}
                  onClick={(e) => locked && e.preventDefault()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition ${pathname === item.path
                      ? "bg-white text-[#0E94A5] shadow-sm"
                      : "text-white hover:bg-white/10"
                    } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {item.icon}
                  {item.name}

                  {/* 🔒 Lock icon */}
                  {locked && <span className="ml-1">🔒</span>}
                </Link>

                {/* Tooltip */}
                {locked && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 
        hidden group-hover:block bg-black text-white text-xs px-3 py-1.5 
        rounded-md whitespace-nowrap z-50">
                    Get admission to access
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT - Actions */}
        <div className="flex items-center gap-3">

          {/* Bell */}
          <button className="relative p-2 text-white hover:bg-white/10 rounded-full">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pr-2 hover:bg-white/10 rounded-full"
            >
              <div className="w-8 h-8 
bg-gradient-to-br from-white to-cyan-100 
text-[#0E94A5] font-bold 
flex items-center justify-center 
rounded-full shadow-sm">
                {getInitials(user?.name)}
              </div>

              <span className="text-white text-sm hidden sm:block">
                {user?.name || "Loading..."}
              </span>

              <ChevronDown size={14} className="text-white" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-2">
                {profileItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.name === "Sign Out") {
                        handleLogout();
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 ${item.color || ""}`}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-white"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden 
bg-gradient-to-b from-[#0E94A5] to-[#063F46] 
px-6 py-4 space-y-2">
          {links.map((item) => {
            const isDashboard = item.name === "Dashboard";
            const locked = !isAdmitted && !isDashboard;

            return (
              <Link
                key={item.name}
                href={locked ? "#" : item.path}
                onClick={(e) => {
                  if (locked) e.preventDefault();
                  else setOpen(false);
                }}
                className={`block py-2 ${locked ? "text-white/40 cursor-not-allowed" : "text-white"
                  }`}
              >
                {item.name} {locked && "🔒"}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};

export default Navbar;