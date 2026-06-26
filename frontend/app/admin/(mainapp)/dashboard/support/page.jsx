"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Trash2, MailOpen, Inbox, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ContactServices } from "@/services/contact.service";

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
    } catch (error) {
      alert("Failed to delete ticket");
    }
  };

  // Ultra-smooth stagger animation
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
  };

  return (
    <>
      <div className={`min-h-screen bg-background text-foreground transition-all duration-500 ${deleteId ? "blur-md scale-[0.99] pointer-events-none" : ""}`}>
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-12">
          
          {/* MINIMALIST HEADER */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Inbox className="w-5 h-5" />
              <span className="text-sm font-medium tracking-widest uppercase">Inbox</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-foreground">
              {loading ? "Loading..." : `${filteredData.length} Open Requests`}
            </h1>
          </motion.div>

          {/* BORDERLESS SEARCH */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative group mb-8"
          >
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xl md:text-2xl placeholder:text-muted-foreground/30 border-b border-border/40 pb-4 pl-12 focus:outline-none focus:border-primary transition-all text-foreground"
            />
          </motion.div>

          {/* FLUID LIST AREA */}
          <div className="relative">
            {loading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-2 py-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-48"></div>
                      <div className="h-3 bg-muted rounded w-96 max-w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredData.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-32 text-center flex flex-col items-center justify-center space-y-4"
              >
                <MailOpen className="w-12 h-12 text-muted-foreground/30 mb-2" />
                <h3 className="text-xl font-medium text-foreground">Inbox Zero</h3>
                <p className="text-muted-foreground">There are no support requests matching your criteria.</p>
              </motion.div>
            ) : (
              <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
                {filteredData.map((req) => (
                  <motion.div
                    key={req._id}
                    variants={item}
                    layout
                    className="group relative flex flex-col sm:flex-row sm:items-center gap-4 py-4 px-3 rounded-2xl hover:bg-accent/50 transition-colors duration-200 cursor-default"
                  >
                    
                    {/* AVATAR & INFO */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {getInitials(req?.name)}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="font-semibold text-foreground truncate max-w-[200px]">
                          {req?.name || "Unknown"}
                        </span>
                        <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-border"></span>
                        <span className="text-muted-foreground truncate font-medium text-sm sm:text-base">
                          {req?.subject || "No Subject"}
                        </span>
                      </div>
                    </div>

                    {/* DATE (Fades out on hover) */}
                    <div className="text-sm text-muted-foreground whitespace-nowrap sm:group-hover:opacity-0 transition-opacity duration-200 pl-14 sm:pl-0">
                      {req?.createdAt 
                        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(req.createdAt)) 
                        : ""}
                    </div>

                    {/* FLOATING ACTION PILL (Slides in on hover) */}
                    <div className="hidden sm:flex absolute right-4 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 items-center gap-1 bg-background border border-border shadow-sm rounded-full p-1 z-10">
                      <Link href={`/admin/dashboard/support/view/${req._id}`}>
                        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-accent hover:text-foreground transition-colors text-muted-foreground">
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </Link>
                      <div className="w-px h-4 bg-border mx-1"></div>
                      <button 
                        onClick={() => setDeleteId(req._id)}
                        className="p-1.5 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* MOBILE ACTIONS */}
                    <div className="flex sm:hidden items-center gap-4 pl-14 pt-2">
                      <Link href={`/admin/dashboard/support/view/${req._id}`} className="text-primary text-sm font-medium flex items-center gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button onClick={() => setDeleteId(req._id)} className="text-destructive text-sm font-medium">
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
              initial={{ scale: 0.95, opacity: 0, filter: "blur(4px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 0.95, opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">Delete Request</h2>
                <p className="text-muted-foreground text-sm">
                  This request will be permanently removed. This action cannot be undone.
                </p>
              </div>
              <div className="p-2 bg-muted/30 border-t border-border flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}