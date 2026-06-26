"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { getUserDetails } from "../lib/store/features/authSlice";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, status } = useSelector((state) => state.auth);

  // Check authentication on app load
  useEffect(() => {
    // Skip auth check for public pages
    const publicPages = ["/user/login", "/user/register", "/user/forgot-password", "/","/courses","/gallery","/blog","/about","/contact"];

    if (publicPages.includes(pathname) || pathname.startsWith("/user/reset-password")) {
      return;
    }

    // If already loading, don't make another request
    if (status === "loading") {
      return;
    }

    // If no auth state and not loading, check authentication
    if (!isAuthenticated && !user && status === "idle") {
      console.log("---> Checking authentication on page load");
      dispatch(getUserDetails());
    }
  }, [dispatch, isAuthenticated, user, status, pathname]);

  // Handle redirects based on authentication state
  useEffect(() => {
    // Skip redirect logic for public pages
    const publicPages = ["/user/login", "/user/register", "/user/forgot-password", "/"];

    if (publicPages.includes(pathname) || pathname.startsWith("/user/reset-password")) {
      return;
    }

    // If authentication check failed, redirect to login
    if (status === "failed" || (!isAuthenticated && status === "succeeded")) {
      console.log("---> Authentication failed, redirecting to signup");
      router.push("/user/register");
      return;
    }

    // If authenticated and have user data, check if user is on wrong role's area
    if (isAuthenticated && user?.role?.name) {
      const rolePath = {
        admin: "/admin",
        instructor: "/instructor",
        user: "/user",
      };

      const dashboardPath = {
        admin: "/admin/dashboard",
        instructor: "/instructor/dashboard",
        user: "/user/dashboard",
      };

      const userRole = user.role.name;
      const allowedBasePath = rolePath[userRole];
      const defaultDashboard = dashboardPath[userRole];

      // Check if user is trying to access wrong role area
      const isAccessingWrongRoleArea = Object.values(rolePath)
        .filter((path) => path !== allowedBasePath)
        .some((path) => pathname.startsWith(path));

      if (isAccessingWrongRoleArea) {
        console.log(
          "---> User accessing wrong role area, redirecting to dashboard:",
          defaultDashboard
        );
        router.push(defaultDashboard);
        return;
      }

      // If user is on root path of their role area (e.g., /user, /admin, /instructor), redirect to dashboard
      if (pathname === allowedBasePath) {
        console.log(
          "---> Redirecting to dashboard from role root:",
          defaultDashboard
        );
        router.push(defaultDashboard);
        return;
      }

      // If user is on a public page but authenticated, and it's not their first visit,
      // redirect to dashboard only if they're on the home page
      if (pathname === "/" && status === "succeeded") {
        console.log(
          "---> Authenticated user on home page, redirecting to dashboard:",
          defaultDashboard
        );
        router.push(defaultDashboard);
      }
    }
  }, [isAuthenticated, user, status, router, pathname]);

  return children;
}
