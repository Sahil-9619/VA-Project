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
import AddUserModal from "./AddUserModal";

export default function AllUsers() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { users, usersStatus, usersError, pagination, summary, filters } =
    useSelector((s) => s.admin);

  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [deleteId, setDeleteId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      <div className={`min-h-screen bg-transparent font-sans pb-10 transition-all duration-300 ${deleteId ? "blur-sm pointer-events-none" : ""}`}>
        <div className="container mx-auto space-y-6 max-w-7xl pt-2 pb-8 px-2 md:px-0">
          
          {/* ==========================================
              HEADER
              ========================================== */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                User Directory
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and monitor all accounts across your platform.
              </p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#178F9E] hover:bg-[#0F6F7C] text-white border border-[#0F6F7C] text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              + Add New User
            </button>
          </div>

          {/* ==========================================
              UNIQUE FLOATING SEARCH BAR
              ========================================== */}
          <div className="bg-card/60 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-border/50 flex flex-col sm:flex-row items-center gap-2 relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center flex-1 px-3 w-full">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 px-3 py-1.5 outline-none text-foreground placeholder:text-muted-foreground text-sm"
              />
            </div>
            <div className="hidden sm:block w-px h-6 bg-border/50 mx-2"></div>
            <div className="w-full sm:w-auto min-w-[160px]">
              <Select value={filters.role || "all"} onValueChange={handleRoleChange}>
                <SelectTrigger className="border-none shadow-none focus:ring-0 bg-transparent text-foreground text-sm font-medium h-8">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-border shadow-md">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                  <SelectItem value="instructor">Instructors</SelectItem>
                  <SelectItem value="user">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ==========================================
              SUMMARY CARDS
              ========================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative bg-gradient-to-br from-[#178F9E] to-[#0b5e69] rounded-xl p-4 overflow-hidden shadow-md text-white">
              <Users className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10" />
              <div className="relative z-10 flex flex-col">
                <p className="text-teal-100 font-semibold mb-0.5 text-xs tracking-wider uppercase">Total Network</p>
                <p className="text-2xl font-bold">{summary.totalUsers || 0}</p>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 overflow-hidden shadow-md text-white">
              <Shield className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10" />
              <div className="relative z-10 flex flex-col">
                <p className="text-indigo-100 font-semibold mb-0.5 text-xs tracking-wider uppercase">Administrators</p>
                <p className="text-2xl font-bold">{summary.byRole?.admin || 0}</p>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl p-4 overflow-hidden shadow-md text-white">
              <BookOpen className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10" />
              <div className="relative z-10 flex flex-col">
                <p className="text-orange-100 font-semibold mb-0.5 text-xs tracking-wider uppercase">Instructors</p>
                <p className="text-2xl font-bold">{summary.byRole?.instructor || 0}</p>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl p-4 overflow-hidden shadow-md text-white">
              <User className="absolute -right-2 -bottom-2 w-16 h-16 opacity-10" />
              <div className="relative z-10 flex flex-col">
                <p className="text-emerald-100 font-semibold mb-0.5 text-xs tracking-wider uppercase">Active Students</p>
                <p className="text-2xl font-bold">{summary.byRole?.user || 0}</p>
              </div>
            </div>
          </div>

          {/* ==========================================
              CARDLESS FLAT DIRECTORY LIST
              ========================================== */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase">
                {summary.totalUsers || 0} Results Found
              </h2>
            </div>

            {/* Status Handlers */}
            {usersStatus === "loading" && (
              <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Fetching directory...</p>
              </div>
            )}

            {usersStatus === "failed" && (
              <div className="py-8 text-center text-destructive font-medium bg-destructive/10 rounded-lg text-sm border border-destructive/20">
                {usersError || "Failed to load users."}
              </div>
            )}

            {usersStatus === "succeeded" && users.length === 0 && (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center">
                <Users className="w-12 h-12 opacity-30 mb-3" />
                <p className="text-sm font-medium text-foreground">No users match your search.</p>
                <p className="text-xs">Try adjusting your filters.</p>
              </div>
            )}

            {/* Seamless Flat List */}
            {usersStatus === "succeeded" && users.length > 0 && (
              <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-2">
                {users.map((u) => (
                  <motion.div
                    key={u._id}
                    variants={listItem}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-3 md:px-4 md:py-2 bg-card/40 hover:bg-card/80 backdrop-blur-sm rounded-lg transition-all duration-200 border border-border/50 shadow-sm gap-3"
                  >
                    
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground text-sm truncate flex items-center gap-1.5">
                          {u.name}
                          {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-2">
                          <span>{u.email}</span>
                          <span className="w-1 h-1 bg-border rounded-full"></span>
                          <span className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded text-muted-foreground">ID: {u._id.slice(-6)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Role Badge */}
                    <div className="flex items-center md:justify-center w-full md:w-32 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        u.role?.name === "admin" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                        : u.role?.name === "instructor" ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                        : "bg-muted text-muted-foreground border border-border/50"
                      }`}>
                        {u.role?.name || "User"}
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity justify-end w-full md:w-24 flex-shrink-0">
                      <button
                        onClick={() => router.push(`/admin/dashboard/users/view/${u._id}`)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="View User"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(u._id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-border px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Displaying Page {pagination.page} of {totalPages}
                </span>
                <div className="flex items-center gap-1 bg-card/50 backdrop-blur-sm p-1 rounded-md shadow-sm border border-border/50">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-1.5 rounded-sm text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="px-3 text-sm font-semibold text-foreground">
                    {pagination.page}
                  </div>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="p-1.5 rounded-sm text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onUserAdded={() => {
          dispatch(
            fetchAllUsers({
              page: pagination.page,
              limit: pagination.limit,
              search: filters.search,
              role: filters.role,
            })
          );
        }} 
      />

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
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Remove User?
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                You are about to permanently delete this user's account and all associated data. This action cannot be reversed.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-md font-medium text-sm text-foreground bg-muted hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full sm:w-auto px-4 py-2 rounded-md font-medium text-sm text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors shadow-sm"
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