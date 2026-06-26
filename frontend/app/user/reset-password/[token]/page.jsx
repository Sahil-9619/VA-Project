"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/user/auth.service";
import { brandName } from "@/app/contants";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      toast.success("Password updated successfully 🎉");
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/user/login"), 3000);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Link is invalid or has expired. Please request a new one.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Panel */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="bg-primary h-11 w-14 text-primary-foreground flex items-center justify-center rounded-md overflow-hidden">
            <img src="/images/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
          </div>
          <Link href="/" className="text-primary font-bold text-2xl">
            {brandName}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {success ? (
              /* Success state */
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold">Password updated!</h1>
                <p className="text-muted-foreground text-sm">
                  Your password has been reset successfully. You will be
                  redirected to the login page in a moment.
                </p>
                <Link
                  href="/user/login"
                  className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go to login
                </Link>
              </div>
            ) : (
              /* Form state */
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-1">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">Create new password</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Set a strong new password for your account.
                  </p>
                </div>

                {/* New Password */}
                <div className="grid gap-3">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowNew((v) => !v)}
                      tabIndex={-1}
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password match indicator */}
                {confirmPassword && (
                  <p
                    className={`text-xs -mt-3 ${newPassword === confirmPassword
                      ? "text-green-600"
                      : "text-red-500"
                      }`}
                  >
                    {newPassword === confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Updating password..." : "Set new password"}
                </Button>

                <Link
                  href="/user/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg"
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
