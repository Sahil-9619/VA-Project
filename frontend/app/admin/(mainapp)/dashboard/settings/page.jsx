"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import axiosInstance from "@/app/utils/axiosinterceptor";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put("/user/change-password", {
        currentPassword,
        newPassword
      });
      
      toast.success(res.data?.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans pb-10 pt-2 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto max-w-2xl px-2 md:px-0 space-y-4"
      >
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between mb-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Account Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your security and authentication preferences.
            </p>
          </div>
        </div>

        {/* ===== Password Change Card ===== */}
        <Card className="bg-card dark:bg-slate-800 border-border dark:border-slate-700 shadow-sm overflow-hidden rounded-lg">
          <CardHeader className="bg-muted/30 dark:bg-slate-900/50 border-b border-border dark:border-slate-700/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-semibold text-foreground dark:text-slate-100">
                Change Password
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1 dark:text-slate-400">
              Ensure your account is using a long, random password to stay secure.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="w-full bg-background dark:bg-slate-900 border border-border dark:border-slate-700 focus:ring-1 focus:ring-primary rounded-md px-3 py-2 text-sm outline-none transition-all text-foreground dark:text-slate-200 placeholder:text-muted-foreground/50 shadow-sm pr-10"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    className="w-full bg-background dark:bg-slate-900 border border-border dark:border-slate-700 focus:ring-1 focus:ring-primary rounded-md px-3 py-2 text-sm outline-none transition-all text-foreground dark:text-slate-200 placeholder:text-muted-foreground/50 shadow-sm pr-10"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 pb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-400">
                  Confirm New Password
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  className="w-full bg-background dark:bg-slate-900 border border-border dark:border-slate-700 focus:ring-1 focus:ring-primary rounded-md px-3 py-2 text-sm outline-none transition-all text-foreground dark:text-slate-200 placeholder:text-muted-foreground/50 shadow-sm"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end pt-2 border-t border-border/50 dark:border-slate-700/50">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="shadow-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
};

export default Settings;