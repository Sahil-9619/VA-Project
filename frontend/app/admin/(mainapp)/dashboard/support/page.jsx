"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Trash2, MailOpen, Inbox, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { ContactServices } from "@/services/contact.service";
import { toast } from "sonner";

// Helper for sleek avatars
const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
};

export default function SupportRequestsPage() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await ContactServices.getContact();
      const result = res?.data || [];
      setTickets(Array.isArray(result) ? result : result.data || []);
    } catch (error) {
      console.error(error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = tickets.filter((req) => {
    const name = req?.name || "";
    const email = req?.email || "";
    const subject = req?.subject || "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      subject.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleDelete = async (id) => {
    try {
      await ContactServices.deleteContact(id);
      fetchTickets();
      setDeleteId(null);
      toast.success("Support ticket deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
  };

  // Ultra-smooth stagger animation
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, y: -5 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <>
      <div className={`min-h-screen bg-transparent font-sans pb-10 pt-2 transition-all duration-300 ${deleteId ? "blur-md scale-[0.99] pointer-events-none" : ""}`}>
        <div className="container mx-auto space-y-6 max-w-7xl px-2 md:px-0">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary" /> Support Inbox
              </h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading requests..." : `Manage and respond to ${filteredData.length} open requests.`}
              </p>
            </div>
          </div>

          {/* SEARCH BAR (Compact & Glassmorphic) */}
          <div className="bg-card/60 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-border/50 dark:border-slate-700/50 flex flex-col md:flex-row items-center gap-2 relative z-10 max-w-2xl">
            <div className="flex items-center flex-1 px-3 w-full">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/70 h-9"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="text-muted-foreground hover:text-foreground transition p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* FLUID LIST AREA */}
          <div className="bg-card dark:bg-slate-800 border border-border dark:border-slate-700 shadow-sm rounded-lg overflow-hidden flex flex-col min-h-[50vh]">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10">
                <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-sm text-muted-foreground">Fetching support requests...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 dark:bg-slate-700/50 flex items-center justify-center mb-4">
                  <MailOpen className="w-6 h-6 text-muted-foreground/50 dark:text-slate-500" />
                </div>
                <h3 className="text-base font-medium text-foreground dark:text-slate-100 mb-1">Inbox Zero</h3>
                <p className="text-muted-foreground dark:text-slate-400 text-xs max-w-[220px]">
                  There are no support requests matching your criteria.
                </p>
              </motion.div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col divide-y divide-border dark:divide-slate-700/50">
                {/* List Header */}
                <div className="flex items-center justify-between px-6 py-2.5 bg-primary/5 dark:bg-slate-900 text-xs font-semibold text-muted-foreground dark:text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-10 flex-1">
                    <span className="w-10">User</span>
                    <span>Subject</span>
                  </div>
                  <span className="w-24 text-right">Date</span>
                </div>

                {filteredData.map((req) => (
                  <motion.div
                    key={req._id}
                    variants={item}
                    layout
                    className="group relative flex flex-col sm:flex-row sm:items-center gap-4 py-3 px-6 hover:bg-muted/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    
                    {/* AVATAR & INFO */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {getInitials(req?.name)}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span className="font-medium text-foreground dark:text-slate-100 text-sm truncate sm:w-[150px]">
                          {req?.name || "Unknown"}
                        </span>
                        <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-border"></span>
                        <span className="text-muted-foreground dark:text-slate-300 truncate text-sm flex-1">
                          {req?.subject || "No Subject"}
                        </span>
                      </div>
                    </div>

                    {/* DATE (Fades out on hover on Desktop) */}
                    <div className="text-xs text-muted-foreground dark:text-slate-400 whitespace-nowrap sm:group-hover:opacity-0 transition-opacity duration-200 pl-12 sm:pl-0 w-24 text-right">
                      {req?.createdAt 
                        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(req.createdAt)) 
                        : ""}
                    </div>

                    {/* FLOATING ACTION PILL (Slides in on hover) */}
                    <div className="hidden sm:flex absolute right-6 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 items-center gap-1 bg-background dark:bg-slate-900 border border-border dark:border-slate-700 shadow-sm rounded-md p-1 z-10">
                      <Link href={`/admin/dashboard/support/view/${req._id}`}>
                        <button className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors text-muted-foreground dark:text-slate-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </Link>
                      <div className="w-px h-3 bg-border dark:bg-slate-700 mx-1"></div>
                      <button 
                        onClick={() => setDeleteId(req._id)}
                        className="p-1 rounded text-muted-foreground dark:text-slate-400 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* MOBILE ACTIONS */}
                    <div className="flex sm:hidden items-center gap-4 pl-12 pt-1 border-t border-border/50 dark:border-slate-700/50 mt-2 pb-1">
                      <Link href={`/admin/dashboard/support/view/${req._id}`} className="text-primary text-xs font-medium flex items-center gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button onClick={() => setDeleteId(req._id)} className="text-destructive text-xs font-medium">
                        Delete
                      </button>
                    </div>

                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* COMMAND-MENU STYLE DELETE MODAL */}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-[400px] bg-background dark:bg-slate-800 border border-border dark:border-slate-700 rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground dark:text-slate-100 mb-2">Delete Request?</h2>
                <p className="text-muted-foreground dark:text-slate-400 text-sm leading-relaxed">
                  This request will be permanently removed. This action cannot be undone.
                </p>
              </div>
              <div className="p-4 bg-muted/30 dark:bg-slate-900/50 border-t border-border dark:border-slate-700 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-accent dark:hover:bg-slate-700 hover:text-accent-foreground dark:hover:text-slate-100 transition-colors border border-transparent hover:border-border dark:hover:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}