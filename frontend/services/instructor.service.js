import axiosInstance from "@/app/utils/axiosinterceptor";

export const instructorServices = {
  // Get all courses
  instructorProfile: async (params) => {
    const response = await axiosInstance.get(
      `/instructor/get-instructor-profile/${params}`
    );
    return response.data;
  },

  getDashborddata: async () => {
    const response = await axiosInstance.get(`/instructor/dashboard`);
    return response.data;
  },
};
