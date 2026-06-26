
import axiosInstance from "../../app/utils/axiosinterceptor";

export const adminServices = {
  // Get all courses
  //   instructorProfile: async (params) => {
  //     const response = await axiosInstance.get(
  //       `/admin/get-instructor-profile/${params}`
  //     );
  //     return response.data;
  //   },

  getDashborddata: async () => {
    const response = await axiosInstance.get(`/admin/dashboard`);
    return response.data;
  },
  getAllUsers: async (params = {}) => {
    const response = await axiosInstance.get(`/admin/users`, { params });
    return response.data;
  },
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (data) => {
    const response = await axiosInstance.post(`/admin/users`, data);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },
  createStudent: async (data) => {
    const response = await axiosInstance.post(`/students`, data);
    return response.data;
  },
  updateStudent: async (id, data) => {
    const response = await axiosInstance.put(`/students/update/${id}`, data, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
    return response.data;
  },
  deleteStudent: async (id) => {
    const response = await axiosInstance.delete(`/students/delete/${id}`);
    return response.data;
  },
  getAllClasses: async () => {
    const response = await axiosInstance.get(`/class`);
    return response.data;
  },
  createClass: async (data) => {
    const response = await axiosInstance.post(`/class`, data);
    return response.data;
  },
  getClassById: async (id) => {
    const response = await axiosInstance.get(`/class/${id}`);
    return response.data;
  },
  updateClass: async (id, data) => {
    const response = await axiosInstance.put(`/class/${id}`, data);
    return response.data;
  },
  deleteClass: async (id) => {
    const response = await axiosInstance.delete(`/class/${id}`);
    return response.data;
  },

  getstudentsByClass: async (classId) => {
    const response = await axiosInstance.get(`/students/class/${classId}`);
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },

  getStudentByEmail: async (email) => {
    const res = await axiosInstance.get(`/students/email/${email}`);
    return res.data;
  },

  getUserWithStudentCheck: async (id) => {
    const response = await axiosInstance.get(`/admin/user-with-student/${id}`);
    return response.data;
  },

  // ================= FEE MODULE =================

  // Get class fee by class name
 getClassFeeByClass: async (classId) => {
  const response = await axiosInstance.get(`/feestructure/class/${classId}`);
  return response.data;
},

  // Update class fee
  updateClassFee: async (classId, data) => {
    const response = await axiosInstance.put(`/feestructure/${classId}`, data);
    return response.data;
  },

  createFeeStructure: async (data) => {
    const response = await axiosInstance.post(`/feestructure`, data);
    return response.data;
  },
  //---------------------------//
  // Get student fee by admission number
  getStudentFeeByAdmission: async (admissionNumber) => {
    const response = await axiosInstance.get(`/studentfee/admission/${admissionNumber}`);
    return response.data;
  },

  // Update student fee payment
  updateStudentFee: async (data) => {
    const response = await axiosInstance.put(`/studentfee/payment`, data);
    return response.data;
  },

  //update particular fee component for student
  updateStudentFeeStructure: async (admissionNumber, data) => {
    const response = await axiosInstance.put(`/studentfee/${admissionNumber}`, data);
    return response.data;
  },

  // Assign fee to student
  assignStudentFee: async (data) => {
    const response = await axiosInstance.post(`/studentfee/assign`, data);
    return response.data;
  },
  generateInvoicePDF: async (invoiceId) => {
    const response = await axiosInstance.get(
      `/invoice/${invoiceId}/pdf`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

};

