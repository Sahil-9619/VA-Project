import React from "react"
import { GraduationCap } from "lucide-react"
import { brandName } from "../contants"

const Footer = () => {
  return (
    <div className="bg-cyan-900 pt-1">

      <div className="border-t border-[#46B7C3]/40 mt-12 pt-8 text-center"></div>

      <footer className="text-[#E6F7F9]  py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">

            {/* Logo Section */}
            <div>
              <div className="flex items-center mb-6">
                <img src="/images/logo.png" alt="Logo"
                  className="w-12 h-8 scale-[1.5] " />
                <span className="ml-2 text-2xl font-bold text-white">
                  {brandName}
                </span>
              </div>
              <p className="mb-6 text-[#CFF3F6]">
                Empowering learners worldwide with accessible, high-quality
                education.
              </p>

              {/* Social Icons */}
              <div className="flex space-x-4">
                <a href="#" className="text-[#CFF3F6] hover:text-white transition">
                  {/* SVG remains same */}
                </a>
                <a href="#" className="text-[#CFF3F6] hover:text-white transition">
                </a>
                <a href="#" className="text-[#CFF3F6] hover:text-white transition">
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Company</h3>
              <ul className="space-y-3 text-[#CFF3F6]">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Resources</h3>
              <ul className="space-y-3 text-[#CFF3F6]">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
                <li><a href="#" className="hover:text-white transition">Webinars</a></li>
                <li><a href="#" className="hover:text-white transition">Feedback</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6">Legal</h3>
              <ul className="space-y-3 text-[#CFF3F6]">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">GDPR</a></li>
                <li><a href="#" className="hover:text-white transition">Accessibility</a></li>
              </ul>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-[#46B7C3]/30 text-center text-[#CFF3F6]">
            <p>
              &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
            </p> <span className="font-bold"> Design by Startup Web Support</span>
          </div>

        </div>
      </footer>
    </div>
  )
}

export default Footer