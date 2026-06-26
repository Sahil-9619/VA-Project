
import { Geist, Geist_Mono, Edu_NSW_ACT_Foundation } from "next/font/google";
import AdminSidebar from "../components/adminSidebar";
import AdminTopbar from "../components/adminTopbar";
import CustomScrollbar from "@/components/ui/CustomScrollbar";

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
  title: "Admin Dashboard",
  description: "Dashboard section for admins",
};

export default function AdminDashboardLayout({ children }) {
  return (
    <div
      className={`h-screen overflow-hidden admin-pattern-bg ${geistSans.variable} ${geistMono.variable} ${eduCursive.variable}`}
    >
      <main className="flex h-full">
        {/* Sidebar stays fixed height */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <AdminTopbar />
          <CustomScrollbar className="flex-1 px-4 py-2">{children}</CustomScrollbar>
        </div>
      </main>
    </div>
  );
}
