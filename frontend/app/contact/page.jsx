"use client";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Nav from "../sections/Nav";
import Footer from "../sections/Footer";
import Link from "next/link";
import { useState } from "react";
import { ContactServices } from "@/services/contact.service";
export default function ContactPage() {

  const [formData, setFormData] = useState({
  name: "",
  email: "",
  subject: "",
  message: ""
});

const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState("");
const [error, setError] = useState("");

const handleChange=(e)=>{
  setFormData({...formData,
    [e.target.name]:e.target.value
});
}

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setSuccess("");
  setError("");

  try {
    const res = await ContactServices.createContact(formData);
    if (res.success) {  
      setSuccess("Your message has been sent successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } else {
      setError("Failed to send message. Please try again.");
    }
  } catch (err) {
    setError("Something went wrong.");
  } finally {
    setLoading(false);
  }
};



  return (
    <main className="bg-[#F4FDFE] text-[#0F6F7C]">

      <Nav />

      {/* ================= HERO ================= */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
            We’d love to hear from you
          </h1>
          <p className="max-w-2xl mx-auto text-gray-900 text-lg leading-relaxed">
            Whether you have a question about courses, subscriptions,
            partnerships, or technical support — our team is ready to help.
          </p>
        </motion.div>
      </section>

      {/* ================= MAIN CONTACT ================= */}
      <section className="pb-28 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">

          {/* LEFT SIDE INFO */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <h2 className="text-2xl text-black font-bold mb-4">Get in touch</h2>

            <div className="space-y-6">

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-[#178F9E] mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-900 text-sm">support@educationjal.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-[#178F9E]  mt-1" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-900 text-sm">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-[#178F9E]  mt-1" />
                <div>
                  <h3 className="font-semibold">Office</h3>
                  <p className="text-gray-900 text-sm">
                    SK Palace, Patna, Bihar, India
                  </p>
                </div>
              </div>

            </div>

            {/* Divider */}
            <div className="h-px bg-white/20"></div>

            <p className="text-gray-900 text-sm leading-relaxed">
              Our support team typically responds within 24 hours during
              business days.
            </p>
          </motion.div>

          {/* RIGHT SIDE FORM */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-2xl border border-[#46B7C3]/30 p-12 text-[#0F6F7C]"          >
            <h2 className="text-2xl font-bold mb-8 text-gray-900">
              Send us a message
            </h2>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  name = "name"
                  value = {formData.name}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Enter name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#178F9E] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone no.
                </label>
                <input
                  name = "phone"
                  value = {formData.phone}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#178F9E] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#178F9E] outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  name="subject"
                  value = {formData.subject}
                  onChange={handleChange}
                  type="text"
                  required
                  placeholder="Write your query here"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#178F9E] outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#178F9E] outline-none transition"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled = {loading}
                  className="w-full bg-[#178F9E] hover:bg-[#0F6F7C] text-white py-3 rounded-full font-medium transition flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : "Send Message"}
                  <Send className="h-5 w-5" />
                </button>
                {success && <p className="text-green-600 mt-4">{success}</p>}
                {error && <p className="text-red-600 mt-4">{error}</p>}
              </div>

            </form>
          </motion.div>

        </div>
      </section>

      {/* ================= MAP ================= */}
      <section className="pb-28 px-6">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/20">
          <iframe
            src="https://maps.google.com/maps?q=New%20Delhi&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="450"
            loading="lazy"
            className="border-0"
          ></iframe>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="pb-28 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Ready to level up your skills?
          </h2>
          <p className="text-gray-900 mb-8">
            Get admission today!
          </p>
          <Link
           href="/admission"
           className="bg-[#178F9E] text-white px-8 py-3 rounded-full font-semibold 
           transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] 
           hover:scale-105 hover:bg-[#0F6F7C] hover:shadow-xl hover:shadow-[#178F9E]/40"
           >Apply for Admission
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}