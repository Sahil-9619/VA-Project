import axiosInstance from "../../app/utils/axiosinterceptor";

export const enrollmentService = {
  // Enroll in a course
  enrollInCourse: async (courseId, paymentData = {}) => {
    const response = await axiosInstance.post(
      `/enrollment/enroll/${courseId}`,
      paymentData
    );
    return response.data;
  },

  createRazorPayOrder: async (orderData) => {
    const response = await axiosInstance.post(
      "/razorpay/create_order",
      orderData
    );
    return response.data;
  },

  // Complete enrollment after payment
  completeEnrollment: async (enrollmentData) => {
    const response = await axiosInstance.post(
      "/enrollment/complete",
      enrollmentData
    );
    return response.data;
  },

  // Get user's enrollments
  getUserEnrollments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/enrollment/my-courses${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Get specific enrollment details
  getEnrollmentDetails: async (enrollmentId) => {
    const response = await axiosInstance.get(`/enrollment/${enrollmentId}`);
    return response.data;
  },

  // Mark lesson as completed
  markLessonCompleted: async (enrollmentId, lessonData) => {
    const response = await axiosInstance.post(
      `/enrollment/${enrollmentId}/complete-lesson`,
      lessonData
    );
    return response.data;
  },

  // Check if user has access to course
  checkCourseAccess: async (courseId) => {
    const response = await axiosInstance.get(`/enrollment/access/${courseId}`);
    return response.data;
  },

  submitQuizAttempt: async (enrollmentId, payload) => {
    const response = await axiosInstance.post(
      `/enrollment/${enrollmentId}/submit-quiz`,
      payload
    );
    return response.data;
  },
  getAllEnrollmentsForPublisher: async (page = 1, limit = 10, search = "") => {
    const response = await axiosInstance.get(
      `/enrollment/myearning?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data;
  },

  // Download course certificate
  downloadCertificate: async (enrollmentId) => {
    const response = await axiosInstance({
      url: `/enrollment/${enrollmentId}/download-certificate`,
      method: "POST",
      responseType: "blob",
    });
    return response.data;
  },
};
