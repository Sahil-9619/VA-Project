import axiosInstance from "../../app/utils/axiosinterceptor";

export const authService = {
  // Email login
  emailLogin: async (credentials) => {
    const response = await axiosInstance.post(
      "/user/loginwithemail",
      credentials
    );
    return response.data;
  },

  // Send OTP to phone
  sendOtpToPhone: async (phoneNumber) => {
    const response = await axiosInstance.post("/user/send-otp", {
      phone: phoneNumber,
    });
    return response.data;
  },

  // Verify phone OTP
  verifyPhoneOtp: async (phoneNumber, otp) => {
    const response = await axiosInstance.post("/user/verify-otp", {
      phone: phoneNumber,
      otp,
    });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (phoneNumber) => {
    const response = await axiosInstance.post("/user/resend-otp", {
      phone: phoneNumber,
    });
    return response.data;
  },

  // Get user details
  getUserDetails: async () => {
    const response = await axiosInstance.get("/user/userdetails");
    return response.data;
  },
  updateUserProfile: async (profileData) => {
    const formData = new FormData();

    // Append normal fields
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== undefined && profileData[key] !== null) {
        if (
          typeof profileData[key] === "object" &&
          !(profileData[key] instanceof File)
        ) {
          // stringify nested objects like location, social, skills
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      }
    });

    const response = await axiosInstance.put("/user/updateprofile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.user;
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post("/user/logout");
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await axiosInstance.post("/user/refreshtoken");
    return response.data;
  },

  registerUser: async (userData) => {
    const response = await axiosInstance.post(
      "/user/registerwithemail",
      userData
    );
    return response.data;
  },
  verifyEmail: async (email, otp) => {
    const response = await axiosInstance.post("/user/verifyEmail", {
      email,
      otp,
    });
    return response.data;
  },
  resendEmailVerification: async (email) => {
    const response = await axiosInstance.post("/user/sendEmailForVerification", {
      email,
    });
    return response.data;
  },

  // Forgot password - sends reset link to email
  forgotPassword: async (email) => {
    const response = await axiosInstance.post("/user/forgot-password", { email });
    return response.data;
  },

  // Reset password with token from email link
  resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post("/user/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },
};

