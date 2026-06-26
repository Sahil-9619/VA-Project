"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Nav from "../../sections/Nav";
import Footer from "../../sections/Footer";
import Link from "next/link";
import { admissionService } from "@/services/admission.service";
import { useSelector } from "react-redux";



export default function AdmissionSuccess() {
const { user } = useSelector((state) => state.auth);
  const handleDownloadInvoice = async () => {
    try {
        const blob = await admissionService.downloadInvoice(user._id);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoice.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error("Error:", err);
    alert("Download failed");
  }
  };
  return (
    <main className="bg-[#0F6F7C] text-white min-h-screen overflow-hidden">

      <Nav />
      {/* ================= HERO SUCCESS ================= */}

      <section className="relative min-h-[90vh] flex items-center justify-center pt-30 pb-10 px-6">

        {/* Animated Gradient Glow Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-gradient-to-br from-[#178F9E]/30 via-[#0F6F7C] to-[#46B7C3]/20 blur-3xl"
        />

        <div className="relative z-10 text-center max-w-4xl">

          {/* Animated Check Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex justify-center mb-10"
          >
            <CheckCircle className="w-28 h-28 text-[#46B7C3]" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl font-extrabold leading-tight mb-6"
          >
            Admission Successful
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-white/80 leading-relaxed mb-10"
          >
            Your registration has been successfully submitted.  
            Our academic team will contact you shortly with further details.
          </motion.p>

          {/* Animated Divider Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="h-[3px] bg-[#178F9E] mx-auto mb-10"
          />

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleDownloadInvoice}
  className="px-10 py-4 bg-[#178F9E] text-white font-semibold rounded-full shadow-lg hover:bg-[#0F6F7C] transition-all duration-300"
>
  Download Invoice
</motion.button>
            <Link
              href="/user/myprofile"
              className="px-10 py-4 border-2 border-[#46B7C3] text-white font-semibold rounded-full hover:bg-[#46B7C3]  transition-all duration-300"
            >
              Go to My Profile
            </Link>
          </motion.div>

        </div>
      </section>
      

      {/* ================= SECOND SECTION (Floating Text Reveal) ================= */}
      <section className="py-28 px-6 text-center bg-[#F4FDFE] text-slate-700">
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-6 text-[#0F6F7C]"
        >
          What Happens Next?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-lg leading-relaxed"
        >
          You will receive a confirmation email along with your class schedule,
          orientation details, and academic guidelines. Please keep your
          registration receipt for future reference.
        </motion.p>
      </section>

      <Footer />
    </main>
  );
}