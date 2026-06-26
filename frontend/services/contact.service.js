import axiosInstance from "@/app/utils/axiosinterceptor";

export const ContactServices = {

getContactById: async (id) => {
    const response = await axiosInstance.get(`/contact/${id}`);
    return response.data;
  },

getContact: async () => {
    const response = await axiosInstance.get("/contact/all");
    return response.data;
  },

deleteContact: async (id) => {
    const response = await axiosInstance.delete(`/contact/${id}`);
    return response.data;
  },

createContact: async (contactData) => {
    const response = await axiosInstance.post("/contact/create", contactData);
    return response.data;
  }
};
