"use client";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { PhoneCall, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  emailLogin,
  sendOtpToPhone,
  verifyPhoneOtp,
  resendOtp,
  setLoginMethod,
  setPhoneNumber,
  clearError,
  resetAuthState,
  getUserDetails,
} from "../lib/store/features/authSlice";
import { toast } from "sonner";
import useRoleRedirect, { handleRoleRedirect } from "../hooks/useRoleRedirect";

export function LoginForm({ className, ...props }) {
  // Email Login Form
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    status,
    error,
    loginMethod,
    phoneNumber,
    otpSent,
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState("");
  const isLoading = status === "loading";
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated)
      handleRoleRedirect(dispatch, router, isAuthenticated, user);
  }, [isAuthenticated, user, dispatch, router]);

  // Clear error when component unmounts or login method changes
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, loginMethod]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    dispatch(emailLogin(credentials));
    if (status === "succeeded") {
      router.push("/dashboard");
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      dispatch(sendOtpToPhone(phoneNumber));
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      dispatch(verifyPhoneOtp({ phoneNumber, otp }));
    }
  };

  const handleResendOtp = () => {
    dispatch(resendOtp(phoneNumber));
  };

  const handlePhoneNumberChange = (e) => {
    dispatch(setPhoneNumber(e.target.value));
  };

  const switchToPhone = () => {
    dispatch(setLoginMethod("phone"));
    dispatch(resetAuthState());
  };

  const switchToEmail = () => {
    dispatch(setLoginMethod("email"));
    dispatch(resetAuthState());
  };

  const goBackToPhone = () => {
    dispatch(setLoginMethod("phone"));
    setOtp("");
    dispatch(clearError());
  };

  // Error display component
  const ErrorMessage = () => {
    if (!error) return null;
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  };
  if (loginMethod === "email") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleEmailSubmit}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="false"
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/user/forgot-password"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>
          <Button
            variant="outline"
            type="submit"
            className="w-full"
            onClick={() => switchToPhone()}
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            Login with Phone Number
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/user/register" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    );
  }

  // Phone Number Input Form
  if (loginMethod === "phone") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handlePhoneSubmit}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login with Phone</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your phone number to receive an OTP
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phoneNumber}
              onChange={(e) => dispatch(setPhoneNumber(e.target.value))} // ✅ dispatch action
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </Button>
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => switchToEmail()}
          >
            <Mail className="mr-2 h-4 w-4" />
            Back to Email Login
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/user/register" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    );
  }

  // OTP Verification Form
  if (loginMethod === "otp") {
    return (
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={handleOtpSubmit}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Verify OTP</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter the 6-digit code sent to {phoneNumber}
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="otp">OTP Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center text-lg tracking-widest"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify & Login"}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={() => setLoginMethod("phone")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              type="button"
              className="flex-1"
              onClick={handlePhoneSubmit}
              disabled={isLoading}
            >
              Resend OTP
            </Button>
          </div>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="#" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
      </form>
    );
  }
}
