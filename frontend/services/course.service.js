import axiosInstance from "../app/utils/axiosinterceptor";

export const courseService = {
  // Get all courses
  getAllCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/course${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },
  getEnrolledCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/course/my-enrolled-courses${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  getAllCategories: async () => {
    const response = await axiosInstance.get(`/course/all-categories`);
    return response.data;
  },
  // Create a new category
  createCategory: async ({ name, slug, description = "", icon }) => {
    const payload = { name, slug };
    if (description !== undefined) payload.description = description;
    if (icon !== undefined) payload.icon = icon;
    const response = await axiosInstance.post(`/course/category`, payload);
    return response.data;
  },
  // Update an existing category
  updateCategory: async (id, { name, slug, description, icon, isActive }) => {
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (slug !== undefined) payload.slug = slug;
    if (description !== undefined) payload.description = description;
    if (icon !== undefined) payload.icon = icon;
    if (isActive !== undefined) payload.isActive = isActive;
    const response = await axiosInstance.put(`/course/category/${id}`, payload);
    return response.data;
  },
  // Delete a category
  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/course/category/${id}`);
    return response.data;
  },
  // Get published courses only
  getPublishedCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/courses/published${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },

  // Create course (requires authentication and permission)
  createCourse: async (courseData) => {
    const response = await axiosInstance.post(
      "/course/add-course",
      courseData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get published courses
  getPublishedCourses: async () => {
    const response = await axiosInstance.get("/course/published");
    return response.data;
  },

  // Get course by slug
  getCourseBySlug: async (slug) => {
    const response = await axiosInstance.get(`/course/slug/${slug}`);
    return response.data;
  },

  // Get course by ID
  getCourseById: async (id) => {
    const response = await axiosInstance.get(`/course/${id}`);
    return response.data;
  },

  // Update course (supports JSON or FormData)
  updateCourse: async (id, courseData) => {
    const isFormData = typeof FormData !== "undefined" && courseData instanceof FormData;
    const response = await axiosInstance.put(
      `/course/${id}`,
      courseData,
      isFormData
        ? {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        : undefined
    );
    return response.data;
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await axiosInstance.delete(`/course/${id}`);
    return response.data;
  },

  // Toggle publish status
  togglePublishCourse: async (id) => {
    const response = await axiosInstance.patch(`/course/toggle-publish/${id}`);
    return response.data;
  },
  getAllCoursesForPublisher: async (page = 1, limit = 10, search = "") => {
    const response = await axiosInstance.get(
      `/course/get-all-courses-for-publisher?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data;
  },

  // Reviews
  getCourseReviews: async (courseId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/course/${courseId}/reviews${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  },
  getMyReviewForCourse: async (courseId) => {
    const response = await axiosInstance.get(`/course/${courseId}/my-review`);
    return response.data;
  },
  addOrUpdateReview: async (courseId, { rating, comment }) => {
    const response = await axiosInstance.post(`/course/${courseId}/reviews`, {
      rating,
      comment,
    });
    return response.data;
  },
  deleteMyReview: async (courseId) => {
    const response = await axiosInstance.delete(`/course/${courseId}/reviews`);
    return response.data;
  },
  // Meetings
  addCourseMeeting: async (courseId, { title, url, description, scheduledAt }) => {
    const response = await axiosInstance.post(`/course/${courseId}/meetings`, {
      title,
      url,
      description,
      scheduledAt,
    });
    return response.data;
  },


  // Delete a meeting
  deleteMeeting: async (courseId, meetingId) => {
    const response = await axiosInstance.delete(`/course/${courseId}/meetings/${meetingId}`);
    return response.data;
  },

  // Upload meeting recording
  uploadMeetingRecording: async (meetingId, formData) => {
    const response = await axiosInstance.post(
      `/course/meetings/${meetingId}/recording`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
