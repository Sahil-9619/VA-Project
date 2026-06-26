
import { Geist, Geist_Mono, Edu_NSW_ACT_Foundation } from "next/font/google";
import AdminSidebar from "../components/adminSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const eduCursive = Edu_NSW_ACT_Foundation({
  variable: "--font-edu-cursive",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "User Dashboard",
  description: "Dashboard section for users",
};

export default function AdminDashboardLayout({ children }) {
  return (
    <div
      className={`h-screen overflow-hidden ${geistSans.variable} ${geistMono.variable} ${eduCursive.variable}`}
    >
      <main className="flex h-full">
        {/* Sidebar stays fixed height */}
        <AdminSidebar />

        {/* Right content gets its own scroll */}
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
