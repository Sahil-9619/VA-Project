"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { brandName } from "../contants"

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleClick = () => setOpen(false)
    if (open) document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [open])

  const links = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "Gallery", path: "/gallery" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <header className="fixed top-6  left-1/2 -translate-x-1/2 w-[80%] max-w-6xl z-50">


      {/* Solid Dark Teal Background */}
      <div className="bg-cyan-900 border-b border-[#46B7C3]/30 border-2 rounded-4xl shadow-lg">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className=" h-10 w-10 flex items-center justify-center">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-15 h-7 scale-125"
              />
            </div>

            <Link
              href="/"
              className="text-2xl font-bold text-white tracking-wide"
            >
              {brandName}
            </Link>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-10 text-white font-medium">
            {links.map((item, i) => (
              <Link
                key={i}
                href={item.path}
                className={`relative transition duration-300 ${
                  pathname === item.path
                    ? "text-[#46B7C3]"
                    : "hover:text-[#46B7C3]"
                }`}
              >
                {item.name}

                {pathname === item.path && (
                  <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#46B7C3]"></span>
                )}
              </Link>
            ))}

            <Link href="/user/register ">
              <button className="px-6 py-2 rounded-full font-semibold bg-[#178F9E] hover:bg-[#0F6F7C] transition-all duration-300 text-white">
                Sign Up
              </button>
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-white"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-cyan-800 border-t border-[#46B7C3]/30 px-6 py-6">
            <div className="flex flex-col space-y-6 text-white font-medium">
              {links.map((item, i) => (
                <Link
                  key={i}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className="hover:text-[#46B7C3] transition"
                >
                  {item.name}
                </Link>
              ))}

              <Link href="/user/login">
                <button className="bg-[#178F9E] hover:bg-[#0F6F7C] p-1 rounded-sm text-white font-semibold transition">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar