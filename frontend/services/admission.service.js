import axiosInstance from "../app/utils/axiosinterceptor";

export const admissionService = {

  // 🔹 Check Admission Status
  checkAdmission: async () => {
    try {
      const response = await axiosInstance.get("/admission/check");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  downloadInvoice: async (studentId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`/invoice/download/student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Download failed");
  return response.blob();
},


};