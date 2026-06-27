"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Calendar, Hash } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactServices } from "@/services/contact.service";

export default function SupportDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket();
  }, []);

  const fetchTicket = async () => {
    try {
      const res = await ContactServices.getContactById(id);
      setTicket(res?.data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-sm text-muted-foreground">
        <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin mr-3"></div>
        Loading ticket details...
      </div>
    );

  if (!ticket)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-sm text-muted-foreground">
        <Hash className="w-10 h-10 mb-4 opacity-50" />
        <p className="text-foreground font-medium mb-1">Ticket not found</p>
        <p className="text-xs">The requested support ticket does not exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent font-sans pb-10 pt-2 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto max-w-4xl px-2 md:px-0 space-y-4"
      >
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between mb-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Support Ticket Details
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of the customer request and message.
            </p>
          </div>

          <Link href="/admin/dashboard/support">
            <Button
              variant="outline"
              className="h-8 px-3 text-xs shadow-sm bg-card dark:bg-slate-800 hover:bg-muted dark:hover:bg-slate-700 text-foreground hover:text-foreground dark:text-slate-200 dark:hover:text-white border-border dark:border-slate-700 transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        </div>

        {/* ===== Premium Card ===== */}
        <Card className="bg-card dark:bg-slate-800 border-border dark:border-slate-700 shadow-sm overflow-hidden rounded-lg">
          
          <CardHeader className="bg-muted/30 dark:bg-slate-900/50 border-b border-border dark:border-slate-700/50 px-6 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground dark:text-slate-200">Ticket ID: {ticket._id}</span>
            </div>
            
            {ticket?.status === "open" && (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-xs rounded-md shadow-none hover:bg-amber-500/20">
                Open
              </Badge>
            )}
            {ticket?.status === "in-progress" && (
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 text-xs rounded-md shadow-none hover:bg-blue-500/20">
                In Progress
              </Badge>
            )}
            {ticket?.status === "closed" && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-xs rounded-md shadow-none hover:bg-emerald-500/20">
                Closed
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-6">

            {/* ===== Info Grid ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-muted/10 dark:bg-slate-900/20 p-4 rounded-lg border border-border/50 dark:border-slate-700/50">
              <InfoBlock icon={User} label="Full Name" value={ticket?.name || "N/A"} />
              <InfoBlock icon={Mail} label="Email Address" value={ticket?.email || "N/A"} />
              <InfoBlock 
                icon={Calendar} 
                label="Submitted On" 
                value={ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-"} 
              />
            </div>

            {/* ===== Subject & Message Section ===== */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                  Subject
                </p>
                <h3 className="text-lg font-medium text-foreground dark:text-slate-100">
                  {ticket?.subject || "No Subject"}
                </h3>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                  Message
                </p>
                <div className="p-5 rounded-lg bg-background dark:bg-slate-900 border border-border dark:border-slate-700 shadow-sm leading-relaxed text-sm text-foreground dark:text-slate-300 whitespace-pre-wrap min-h-[150px]">
                  {ticket?.message || "No message provided."}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ===== Elegant Info Block ===== */
function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="space-y-0.5 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground dark:text-slate-400">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground dark:text-slate-200 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}