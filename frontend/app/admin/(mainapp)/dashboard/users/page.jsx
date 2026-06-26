"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAllUsers,
  setUserFilters,
  setUserPagination,
} from "@/lib/store/features/adminSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, Users, Shield, BookOpen, User, 
  Trash2, Eye, ChevronLeft, ChevronRight, CheckCircle2, Clock
} from "lucide-react";
import { adminServices } from "@/services/admin/admin.service";
import { toast } from "sonner";

export default function AllUsers() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { users, usersStatus, usersError, pagination, summary, filters } =
    useSelector((s) => s.admin);

  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [deleteId, setDeleteId] = useState(null);

  // 🔥 AUTO SEARCH WITH DEBOUNCE
  useEffect(() => {
    const delay = setTimeout(() => {
      dispatch(setUserFilters({ search: localSearch }));
      dispatch(setUserPagination({ page: 1 }));
    }, 300); // 300ms debounce is better for API calls

    return () => clearTimeout(delay);
  }, [localSearch, dispatch]);

  // Fetch whenever filters/pagination change
  useEffect(() => {
    dispatch(
      fetchAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters.search, filters.role]);

  const totalPages = useMemo(() => pagination.totalPages || 0, [pagination.totalPages]);

  const handleRoleChange = (value) => {
    dispatch(setUserFilters({ role: value === "all" ? "" : value }));
    dispatch(setUserPagination({ page: 1 }));
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    dispatch(setUserPagination({ page }));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminServices.deleteUser(deleteId);
      dispatch(
        fetchAllUsers({
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search,
          role: filters.role,
        })
      );
      toast.success("User deleted successfully");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteId(null);
    }
  };

  // Helper for Initials Avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  // Stagger Animations
  const listContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const listItem = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  // FIX: Wrapped the return in a fragment <> </> and moved the Modal completely outside the blurred div
  return (
    <>
      <div className={`min-h-screen bg-slate-50 font-sans pb-20 transition-all duration-300 ${deleteId ? "blur-sm pointer-events-none" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          
          {/* ==========================================
              HEADER
              ========================================== */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                User Directory
              </h1>
              <p className="text-lg text-slate-500">
                Manage and monitor all accounts across your platform.
              </p>
            </div>
            <button 
              onClick={() => router.push("/admin/dashboard/users/add-user")}
              className="bg-[#178F9E] hover:bg-[#0F6F7C] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#178F9E]/30 transition-all hover:-translate-y-0.5"
            >
              + Add New User
            </button>
          </div>

          {/* ==========================================
              UNIQUE FLOATING SEARCH BAR
              ========================================== */}
          <div className="bg-white p-2.5 rounded-full shadow-md shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row items-center gap-2 relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center flex-1 px-4 w-full">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-2 outline-none text-slate-700 placeholder:text-slate-400 text-lg"
              />
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200 mx-2"></div>
            <div className="w-full sm:w-auto min-w-[180px]">
              <Select value={filters.role || "all"} onValueChange={handleRoleChange}>
                <SelectTrigger className="border-none shadow-none focus:ring-0 bg-transparent text-slate-600 font-medium h-12">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="instructor">Instructors</SelectItem>
                  <SelectItem value="user">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ==========================================
              COLORFUL SUMMARY CARDS (MIDDLE)
              ========================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="relative bg-gradient-to-br from-[#178F9E] to-[#0b5e69] rounded-3xl p-6 overflow-hidden shadow-lg shadow-[#178F9E]/20 text-white">
              <Users className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <div className="relative z-10">
                <p className="text-teal-100 font-semibold mb-1 text-sm tracking-wider uppercase">Total Network</p>
                <p className="text-4xl font-extrabold">{summary.totalUsers || 0}</p>
              </div>
            </div>

            {/* Admins */}
            <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-6 overflow-hidden shadow-lg shadow-indigo-500/20 text-white">
              <Shield className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <div className="relative z-10">
                <p className="text-indigo-100 font-semibold mb-1 text-sm tracking-wider uppercase">Administrators</p>
                <p className="text-4xl font-extrabold">{summary.byRole?.admin || 0}</p>
              </div>
            </div>

            {/* Instructors */}
            <div className="relative bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl p-6 overflow-hidden shadow-lg shadow-orange-500/20 text-white">
              <BookOpen className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <div className="relative z-10">
                <p className="text-orange-100 font-semibold mb-1 text-sm tracking-wider uppercase">Instructors</p>
                <p className="text-4xl font-extrabold">{summary.byRole?.instructor || 0}</p>
              </div>
            </div>

            {/* Users/Students */}
            <div className="relative bg-gradient-to-br from-emerald-400 to-green-600 rounded-3xl p-6 overflow-hidden shadow-lg shadow-emerald-500/20 text-white">
              <User className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
              <div className="relative z-10">
                <p className="text-emerald-100 font-semibold mb-1 text-sm tracking-wider uppercase">Active Students</p>
                <p className="text-4xl font-extrabold">{summary.byRole?.user || 0}</p>
              </div>
            </div>
          </div>

          {/* ==========================================
              CARDLESS FLAT DIRECTORY LIST
              ========================================== */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase">
                {summary.totalUsers || 0} Results Found
              </h2>
            </div>

            {/* Status Handlers */}
            {usersStatus === "loading" && (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#178F9E] rounded-full animate-spin"></div>
                <p className="font-medium">Fetching directory...</p>
              </div>
            )}

            {usersStatus === "failed" && (
              <div className="py-20 text-center text-red-500 font-medium bg-red-50 rounded-3xl">
                {usersError || "Failed to load users."}
              </div>
            )}

            {usersStatus === "succeeded" && users.length === 0 && (
              <div className="py-24 text-center text-slate-400 flex flex-col items-center">
                <Users className="w-16 h-16 opacity-20 mb-4" />
                <p className="text-lg font-medium text-slate-600">No users match your search.</p>
                <p className="text-sm">Try adjusting your filters.</p>
              </div>
            )}

            {/* Seamless Flat List */}
            {usersStatus === "succeeded" && users.length > 0 && (
              <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-1">
                {users.map((u) => (
                  <motion.div
                    key={u._id}
                    variants={listItem}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 md:px-6 md:py-5 hover:bg-white rounded-2xl transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 gap-4"
                  >
                    
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-[#178F9E]/10 text-[#178F9E] flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-lg truncate flex items-center gap-2">
                          {u.name}
                          {u.isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <div className="text-sm text-slate-500 truncate flex items-center gap-2">
                          <span>{u.email}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">ID: {u._id.slice(-6)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Role Badge */}
                    <div className="flex items-center md:justify-center w-full md:w-48 flex-shrink-0">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        u.role?.name === "admin" ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : u.role?.name === "instructor" ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {u.role?.name || "User"}
                      </span>
                    </div>

                    {/* Right: Actions (Visible on mobile, Hover on desktop) */}
                    <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity justify-end w-full md:w-32 flex-shrink-0">
                      <button
                        onClick={() => router.push(`/admin/dashboard/users/view/${u._id}`)}
                        className="p-2.5 text-slate-400 hover:text-[#178F9E] hover:bg-[#178F9E]/10 rounded-xl transition-colors"
                        title="View User"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(u._id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ==========================================
                FLAT PAGINATION
                ========================================== */}
            {usersStatus === "succeeded" && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 px-2">
                <span className="text-sm font-medium text-slate-500">
                  Displaying Page {pagination.page} of {totalPages}
                </span>
                <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-slate-200">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="px-4 text-sm font-bold text-slate-700">
                    {pagination.page}
                  </div>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          BEAUTIFUL DELETE MODAL (Framer Motion)
          ========================================== */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Remove User?
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                You are about to permanently delete this user's account and all associated data. This action cannot be reversed.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                >
                  Yes, Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}