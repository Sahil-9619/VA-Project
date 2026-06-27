"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adminServices } from "@/services/admin/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, Shield, CheckCircle2, XCircle, Hash } from "lucide-react";
import Link from "next/link";

export default function ViewUserPage() {
  const router = useRouter();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await adminServices.getUserById(id);
        if (res?.user) {
          setUser(res.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("FETCH ERROR:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-sm text-muted-foreground">
        <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin mr-3"></div>
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-sm text-muted-foreground">
        <User className="w-10 h-10 mb-4 opacity-50" />
        <p className="text-foreground font-medium mb-1">User not found</p>
        <p className="text-xs">The requested user profile does not exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

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
              User Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Detailed information about this user account.
            </p>
          </div>

          <Link href="/admin/dashboard/users">
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground dark:text-slate-100">
                  {user.name || "Unknown"}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-slate-400 mt-0.5">
                  <Hash className="w-3 h-3" />
                  ID: {user._id}
                </div>
              </div>
            </div>
            
            <Badge className="bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 px-3 py-1 text-xs rounded-full shadow-none capitalize">
              {user.role?.name || "User"}
            </Badge>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Info icon={User} label="Full Name" value={user.name} />
              <Info icon={Mail} label="Email Address" value={user.email} />
              <Info icon={Phone} label="Phone Number" value={user.phone} />
              <Info icon={Shield} label="System Role" value={user.role?.name} capitalize />
              
              <div className="flex gap-3 bg-muted/10 dark:bg-slate-900/20 p-4 rounded-lg border border-border/50 dark:border-slate-700/50 items-center">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${user.isVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                    {user.isVerified ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                 </div>
                 <div className="space-y-0.5 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground dark:text-slate-400">
                      Verification Status
                    </p>
                    <p className={`text-sm font-medium truncate ${user.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                      {user.isVerified ? "Verified User" : "Unverified"}
                    </p>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function Info({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex gap-3 bg-muted/10 dark:bg-slate-900/20 p-4 rounded-lg border border-border/50 dark:border-slate-700/50">
      <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground dark:text-slate-400">
          {label}
        </p>
        <p className={`text-sm font-medium text-foreground dark:text-slate-200 truncate ${capitalize ? 'capitalize' : ''}`}>
          {value || "-"}
        </p>
      </div>
    </div>
  );
}