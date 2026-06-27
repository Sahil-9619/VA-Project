"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/user/auth.service";
import { brandName } from "@/app/contants";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Reset link generated! Check console 📩");
      setSent(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Something went wrong. Please try again.";
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
            {sent ? (
              /* Success state */
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-muted-foreground text-sm">
                  We sent a password reset link to{" "}
                  <span className="font-semibold text-foreground">{email}</span>.
                  The link is valid for <strong>5 minutes</strong>.
                </p>
                <p className="text-muted-foreground text-xs">
                  Didn&apos;t get the email? Check your spam folder or{" "}
                  <button
                    className="underline underline-offset-4 text-primary"
                    onClick={() => setSent(false)}
                  >
                    try again
                  </button>
                  .
                </p>
                <Link
                  href="/user/login"
                  className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            ) : (
              /* Form state */
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-1">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">Forgot password?</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Enter your registered email and we&apos;ll send you a reset link
                    valid for 5 minutes.
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending link..." : "Send reset link"}
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
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
