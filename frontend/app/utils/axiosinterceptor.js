import axios from "axios";
import { serverurl } from "../contants";

const instance = axios.create({
  withCredentials: true, // This is crucial for sending cookies
  baseURL: `${serverurl}`,
});

instance.interceptors.request.use(
  (config) => {
    console.log("Request Interceptor");
    // Remove localStorage token logic since backend uses httpOnly cookies
    // The cookies will be automatically sent with withCredentials: true
    return config;
  },
  (error) => {
    console.log("Request Interceptor Error", error);
    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  try {
    // No need to send refreshToken in body since it's in httpOnly cookie
    const response = await axios.post(
      `${serverurl}/user/refreshtoken`,
      {}, // Empty body
      {
        withCredentials: true, // Send cookies with this request
      }
    );

    // Backend sets new accessToken cookie automatically
    return response.data.accessToken; // This might not be needed since token is in cookie
  } catch (error) {
    throw new Error("Failed to refresh token");
  }
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh on /auth routes
    const authEndpoints = ["/user/login", "/user/register"];
    const isAuthRequest = authEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        return instance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
