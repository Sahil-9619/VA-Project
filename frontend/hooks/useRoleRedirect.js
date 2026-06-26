import { getUserDetails } from "@/lib/store/features/authSlice";

export const handleRoleRedirect = (dispatch, router, isAuthenticated, user) => {
  // Check if user is authenticated but user data is missing (page refresh scenario)
  if (isAuthenticated && !user) {
    console.log("---> Fetching user details after authentication");
    dispatch(getUserDetails());
    return;
  }

  // Redirect based on role
  if (isAuthenticated && user?.role?.name) {
    const rolePath = {
      admin: "/admin/dashboard",
      instructor: "/instructor/dashboard",
      user: "/user/dashboard",
    };

    const redirectPath = rolePath[user.role.name] || "/login";
    console.log("---> Redirecting to:", redirectPath);
    router.push(redirectPath);
  }
};

// For httpOnly cookies, we need to check auth via API call
export const checkAuthOnPageLoad = (dispatch, router, pathname) => {
  // Skip auth check for public pages
  const publicPages = ["/login", "/register", "/"];

  if (!publicPages.includes(pathname)) {
    console.log("---> Checking authentication on page load");
    dispatch(getUserDetails());
  }
};
