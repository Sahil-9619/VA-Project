"use client";

import { motion } from "framer-motion";
import Nav from "../sections/Nav";
import Footer from "../sections/Footer";
import Link from "next/link";
import { brandName } from "../contants";

export default function AboutPage() {
  return (
    <main className="bg-[#F4FDFE] text-slate-700 overflow-hidden">

      <Nav />

      {/* ================= HERO ================= */}
<section className="relative min-h-[95vh] flex items-center px-6 bg-[#0F6F7C] text-[#F4FDFE] overflow-hidden">

  {/* Soft Moving Glow */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.25 }}
    transition={{ duration: 2 }}
    className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#178F9E] blur-[150px] rounded-full"
  />

  <div className="max-w-6xl mx-auto relative z-10">

    {/* Main Title */}
    <motion.h1
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="text-6xl text-cyan-400 font-extrabold tracking-tight mb-6"
    >
      <span className="text-white">About</span> {brandName}
    </motion.h1>

    {/* Subtitle stagger */}
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.2 }
        }
      }}
    >
      {["Shaping Careers.", "Building Confidence."].map((text, i) => (
        <motion.h2
          key={i}
          variants={{
            hidden: { opacity: 0, y: 60 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-bold mb-4"
        >
          {text}
        </motion.h2>
      ))}
    </motion.div>

    {/* Description */}
    <motion.p
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, delay: 0.4 }}
      className="max-w-2xl text-lg text-white/80 mt-6"
    >
      {brandName} is a disciplined, classroom-driven learning
      institution committed to academic excellence, practical training,
      and real career outcomes.
    </motion.p>

  </div>
</section>

{/* ================= HISTORY ================= */}
<section className="py-32 px-6 bg-[#F4FDFE] overflow-hidden">
  <div className="max-w-6xl mx-auto">

    {/* Header Animation */}
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="mb-24"
    >
      <h2 className="text-5xl font-bold text-[#178F9E] mb-6">
        Our Journey
      </h2>
      <p className="text-[#178F9E] text-lg max-w-2xl">
        A disciplined path of growth, consistency, and academic excellence.
      </p>
    </motion.div>

    {/* Timeline Line Grow */}
    <div className="relative pl-10">

      <motion.div
        initial={{ height: 0 }}
        whileInView={{ height: "100%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        viewport={{ once: true }}
        className="absolute left-4 top-0 w-1 bg-[#46B7C3]"
      />

      <div className="space-y-20">

        {[
          {
            title: "Foundation Phase",
            desc: "Established with a mission to provide structured and disciplined classroom learning."
          },
          {
            title: "Academic Expansion",
            desc: "Introduced practical labs, real-time assessments, and industry-aligned modules."
          },
          {
            title: "Recognition & Growth",
            desc: "Earned trust through consistent student success and performance excellence."
          },
          {
            title: "Present Day",
            desc: "Now a respected institute focused on producing confident, career-ready professionals."
          }
        ].map((item, index) => (

          <motion.div
            key={index}
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 1,
              delay: index * 0.2,
              ease: [0.16, 1, 0.3, 1]
            }}
            viewport={{ once: true }}
            className="relative"
          >

            {/* Animated Dot */}
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              className="absolute -left-[34px] top-1 w-6 h-6 bg-[#178F9E] rounded-full border-4 border-[#F4FDFE] shadow-lg"
            />

            <h3 className="text-2xl font-semibold text-[#0F6F7C] mb-4">
              {item.title}
            </h3>

            <p className="text-[#178F9E] leading-relaxed">
              {item.desc}
            </p>

          </motion.div>

        ))}

      </div>
    </div>

  </div>
</section>
      {/* ================= VISION & MISSION ================= */}
<section className="relative py-32 px-6 bg-[#0F6F7C] text-[#F4FDFE] overflow-hidden">

  {/* Soft Moving Background Glow */}
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 0.2 }}
    transition={{ duration: 2 }}
    viewport={{ once: true }}
    className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#178F9E] blur-[140px] rounded-full"
  />

  <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-24">

    {/* ===== VISION ===== */}
    <motion.div
      initial={{ opacity: 0, x: -80 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="mb-8 h-[3px] w-16 bg-[#46B7C3] group-hover:w-32 transition-all duration-700" />

      <h3 className="text-4xl font-extrabold mb-6 text-white tracking-wide">
        Our Vision
      </h3>

      <p className="text-gray-100 text-lg leading-relaxed">
        To become a leading offline education institute recognized
        for discipline, academic excellence, and career-focused training.
        We aim to create professionals who are not only skilled,
        but ethically grounded and industry-ready.
      </p>
    </motion.div>


    {/* ===== MISSION ===== */}
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="mb-8 h-[3px] w-16 bg-[#46B7C3] group-hover:w-32 transition-all duration-700" />

      <h3 className="text-4xl font-extrabold mb-6 text-white tracking-wide">
        Our Mission
      </h3>

      <p className="text-gray-100 text-lg leading-relaxed">
        To provide structured courses, hands-on practical learning,
        and personalized mentorship that empowers students to succeed
        confidently in competitive industries. Our mission is to ensure
        measurable outcomes and long-term professional growth.
      </p>
    </motion.div>

  </div>
</section>

      {/* ================= ACADEMIC FRAMEWORK ================= */}
 <section className="relative py-15 px-6 bg-[#F4FDFE] overflow-hidden">

  {/* Soft Accent Glow */}
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 0.15 }}
    transition={{ duration: 2 }}
    viewport={{ once: true }}
    className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#46B7C3] blur-[150px] rounded-full"
  />

  <div className="relative max-w-7xl mx-auto">

    {/* Heading Animation */}
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="text-center mb-20"
    >
      <h2 className="text-5xl font-extrabold text-[#178F9E] mb-6">
        Our Academic Framework
      </h2>
      <p className="text-[#178F9E] max-w-2xl mx-auto text-lg">
        A structured system designed to build clarity, competence,
        and measurable academic excellence.
      </p>
    </motion.div>

    {/* Framework Blocks */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.25 }
        }
      }}
      className="grid md:grid-cols-3 gap-16"
    >

      {[
        {
          title: "Structured Curriculum",
          desc: "Step-by-step syllabus design ensuring strong conceptual foundations and progressive mastery."
        },
        {
          title: "Practical Lab Sessions",
          desc: "Real-time demonstrations and implementation-driven assignments aligned with industry needs."
        },
        {
          title: "Performance Monitoring",
          desc: "Regular assessments, feedback sessions, and continuous improvement tracking."
        }
      ].map((item, index) => (

        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 80 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -10, scale: 1.02 }}
          className="group relative"
        >

          {/* Top Accent Line */}
          <div className="h-[3px] w-14 bg-[#46B7C3] mb-8 group-hover:w-28 transition-all duration-700" />

          <h3 className="text-2xl font-bold text-[#0F6F7C] mb-6">
            {item.title}
          </h3>

          <p className="text-[#178F9E] leading-relaxed text-lg">
            {item.desc}
          </p>

        </motion.div>

      ))}

    </motion.div>

  </div>
</section>

      {/* ================= STUDENT BENEFITS ================= */}
<section className="relative py-16 px-6 bg-[#F4FDFE] overflow-hidden">

  {/* Soft Accent Background */}
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 0.12 }}
    transition={{ duration: 2 }}
    viewport={{ once: true }}
    className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#178F9E] blur-[140px] rounded-full"
  />

  <div className="relative max-w-7xl mx-auto">

    {/* Heading Animation */}
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="text-center mb-24"
    >
      <h2 className="text-5xl font-extrabold text-[#178F9E] mb-6">
        Benefits for Students
      </h2>
      <p className="text-[#178F9E] max-w-2xl mx-auto text-lg">
        Designed to ensure clarity, confidence, and measurable professional growth.
      </p>
    </motion.div>

    {/* Benefits Grid */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.15 }
        }
      }}
      className="grid md:grid-cols-2 gap-x-20 gap-y-14"
    >

      {[
        "Small batch sizes for personalized attention.",
        "Industry-relevant course content.",
        "Hands-on practical learning approach.",
        "Career guidance and placement assistance.",
        "Confidence building through presentations & assessments.",
        "Professional certification upon completion."
      ].map((text, index) => (

        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, x: index % 2 === 0 ? -60 : 60 },
            visible: { opacity: 1, x: 0 }
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6 }}
          className="group flex items-start gap-6"
        >

          {/* Animated Indicator */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-6 h-6 mt-1 bg-[#178F9E] rounded-full shadow-md group-hover:scale-110 transition"
          />

          <p className="text-[#0F6F7C] text-lg leading-relaxed font-medium">
            {text}
          </p>

        </motion.div>
      ))}
    </motion.div>

  </div>
</section>

      {/* ================= ACADEMIC EVENTS ================= */}
<section className="relative py-32 px-6 bg-[#0F6F7C] overflow-hidden">

  <div className="max-w-7xl mx-auto text-center mb-20">
    <h2 className="text-5xl font-extrabold text-white mb-6">
      Campus Moments
    </h2>
    <p className="text-gray-100 max-w-2xl mx-auto text-lg">
      A glimpse into our structured, disciplined, and growth-focused environment.
    </p>
  </div>

  {/* ===== Floating Collage Wrapper ===== */}
  <div className="relative max-w-6xl mx-auto h-[650px] hidden md:block">

    {/* Center Main Image */}
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.8 }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
      w-[420px] h-[520px] rounded-3xl overflow-hidden shadow-2xl z-10 group"
    >
      <img
        src="/images/class.png"
        className="w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        alt=""
      />
    </motion.div>

    {/* Floating Image 1 */}
    <motion.div
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 6, repeat: Infinity }}
      className="absolute top-0 left-10 w-[260px] h-[300px] rounded-3xl overflow-hidden shadow-xl"
    >
      <img src="/images/workshops.png" className="w-full h-full object-cover" />
    </motion.div>

    {/* Floating Image 2 */}
    <motion.div
      animate={{ y: [0, 20, 0] }}
      transition={{ duration: 7, repeat: Infinity }}
      className="absolute bottom-0 left-0 w-[280px] h-[320px] rounded-3xl overflow-hidden shadow-xl"
    >
      <img src="/images/projects.png" className="w-full h-full object-cover" />
    </motion.div>

    {/* Floating Image 3 */}
    <motion.div
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 5, repeat: Infinity }}
      className="absolute top-10 right-0 w-[250px] h-[280px] rounded-3xl overflow-hidden shadow-xl"
    >
      <img src="/images/team.png" className="w-full h-full object-cover" />
    </motion.div>

    {/* Floating Image 4 */}
    <motion.div
      animate={{ y: [0, 18, 0] }}
      transition={{ duration: 8, repeat: Infinity }}
      className="absolute bottom-10 right-10 w-[260px] h-[300px] rounded-3xl overflow-hidden shadow-xl"
    >
      <img src="/images/modernLab.png" className="w-full h-full object-cover" />
    </motion.div>

  </div>

  {/* ===== Mobile Clean Layout ===== */}
  <div className="md:hidden grid gap-6">
    {[
      "/images/class.png",
      "/images/workshops.png",
      "/images/projects.png",
      "/images/team.png",
      "/images/modernLab.png"
    ].map((img, i) => (
      <div key={i} className="rounded-3xl overflow-hidden shadow-xl">
        <img src={img} className="w-full h-[260px] object-cover" />
      </div>
    ))}
  </div>

</section>

      {/* ================= TRUST SECTION ================= */}
      <section className="py-28 px-6 text-center">
        <div className="max-w-4xl mx-auto">

          <h2 className="text-4xl font-bold text-[#178F9E] mb-8">
            Why Students Trust {brandName}
          </h2>

          <p className="text-gray-700 leading-relaxed text-lg">
            Our commitment to discipline, consistency, and measurable results
            has built strong trust among students and parents. We focus on
            real learning outcomes, not just course completion.
          </p>

        </div>
      </section>

      {/* ================= FINAL STATEMENT ================= */}
      <section className="py-10   text-center">
        <h2 className="text-5xl font-bold mb-8">
          Excellence Through Discipline.
        </h2>

        <Link
          href="/admission"
          className="inline-block bg-[#178F9E] hover:bg-[#46B7C3] text-[#F4FDFE] px-12 py-4 rounded-full text-lg font-semibold transition-all duration-500 hover:scale-105"
        >
          Apply for Admission
        </Link>
      </section>

      <Footer />
    </main>
  );
}

/* ===== COMPONENTS ===== */

function Feature({ title, desc }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-[#0F6F7C]">
        {title}
      </h3>
      <p className="text-[#178F9E]">
        {desc}
      </p>
    </div>
  );
}

function Benefit({ text }) {
  return (
    <p className="text-[#178F9E] text-lg leading-relaxed">
      • {text}
    </p>
  );
}