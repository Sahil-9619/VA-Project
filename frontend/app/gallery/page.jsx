"use client"
import React from 'react'
import Nav from '../sections/Nav.jsx'
import Footer from '../sections/Footer.jsx'
import { motion } from 'framer-motion'

const page = () => {

  const galleryData = [
  {
    id: 1,
    img: "/images/class.png",
    title: "Interactive Classrooms",
    description:
      "Engaging classroom environments designed to encourage active participation and collaborative learning.",
  },
  {
    id: 2,
    img: "/images/workshops.png",
    title: "Hands-on Workshops",
    description:
      "Practical workshops that help students apply theoretical knowledge to real-world scenarios.",
  },
  {
    id: 3,
    img: "/images/smartLearning.png",
    title: "Smart Learning Tools",
    description:
      "Advanced digital tools and platforms that enhance productivity and modern learning experiences.",
  },
  {
    id: 4,
    img: "/images/instructor.png",
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with years of experience and real-world expertise.",
  },
  {
    id: 5,
    img: "/images/team.png",
    title: "Team Collaboration",
    description:
      "Encouraging teamwork and group projects to develop communication and leadership skills.",
  },
  {
    id: 6,
    img: "/images/projects.png",
    title: "Practical Projects",
    description:
      "Build portfolio-ready projects that demonstrate your skills and impress recruiters.",
  },
  {
    id: 7,
    img: "/images/modernLab.png",
    title: "Modern Labs",
    description:
      "State-of-the-art laboratories equipped with the latest technology for hands-on training.",
  },
  {
    id: 8,
    img: "/images/stsuccess.png",
    title: "Student Success",
    description:
      "A strong focus on student growth, achievements, and measurable learning outcomes.",
  },
  {
    id: 9,
    img: "/images/livesession.png",
    title: "Live Sessions",
    description:
      "Interactive live classes with Q&A sessions to ensure real-time engagement and clarity.",
  },
  {
    id: 10,
    img: "/images/career.png",
    title: "Career Growth",
    description:
      "Structured career guidance and mentorship to help students achieve professional success.",
  },
]


  return (
    <div className="bg-[#F4FDFE] text-[#0F6F7C] overflow-hidden">
        <Nav/>
<section className="relative pt-32 pb-24 bg-cyan-100/30 overflow-hidden">

  {/* Soft Accent Glow */}
  <div className="absolute w-[500px] h-[500px] bg-[#46B7C3]/20 blur-3xl rounded-full top-[-150px] left-[-150px]" />
  <div className="absolute w-[400px] h-[400px] bg-[#178F9E]/20 blur-3xl rounded-full bottom-[-120px] right-[-120px]" />

  <div className="relative max-w-7xl mx-auto px-6">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-center mb-20"
    >
      <h1 className="text-5xl md:text-6xl font-bold text-cyan-800 mb-6">
        Our Learning Environment
      </h1>
      <p className="text-cyan-700 text-lg max-w-2xl mx-auto">
        Explore moments from our classrooms, workshops, labs, and student achievements.
      </p>
    </motion.div>

    {/* Collage Grid */}
    <div className="relative">

  {/* MOBILE COLLAGE */}
{/* MOBILE COLLAGE */}
<div className="md:hidden overflow-x-auto no-scrollbar">
  <div className="flex gap-4 w-max px-2">

    {[
      "/images/class.png",
      "/images/workshops.png",
      "/images/smartLearning.png",
      "/images/instructor.png",
      "/images/team.png",
      "/images/projects.png",
      "/images/modernLab.png",
      "/images/stsuccess.png",
    ].map((img, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: i * 0.05 }}
        viewport={{ once: true }}
        className={`
          flex-shrink-0 rounded-3xl overflow-hidden shadow-xl
          ${i % 3 === 0 ? "w-[160px] h-[220px]" : ""}
          ${i % 3 === 1 ? "w-[140px] h-[180px] mt-6" : ""}
          ${i % 3 === 2 ? "w-[120px] h-[160px]" : ""}
        `}
      >
        <img
          src={img}
          className="w-full h-full object-cover"
          alt="Gallery"
        />
      </motion.div>
    ))}

  </div>
</div>
  {/* DESKTOP COLLAGE */}
  <div className="hidden md:grid md:grid-cols-4 gap-6">

    {[
      "/images/class.png",
      "/images/workshops.png",
      "/images/smartLearning.png",
      "/images/instructor.png",
      "/images/team.png",
      "/images/projects.png",
      "/images/modernLab.png",
      "/images/stsuccess.png",
    ].map((img, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: i * 0.08 }}
        viewport={{ once: true }}
        className={`overflow-hidden rounded-3xl ${
          i === 0 || i === 5 ? "col-span-2 row-span-2" : ""
        }`}
      >
        <img
          src={img}
          className="w-full h-full object-cover"
          alt="Gallery"
        />
      </motion.div>
    ))}

  </div>

</div>
  </div>
</section>

<section className="py-32 relative">
  <div className="max-w-7xl mx-auto px-6 space-y-40">

    {galleryData.map((item, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 120, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          delay: index * 0.08
        }}
        viewport={{ once: true, amount: 0.3 }}
        className={`grid md:grid-cols-2 gap-20 items-center`}
      >

        {/* IMAGE SIDE */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.8 }}
          className={`relative group overflow-hidden rounded-[40px] ${
            index % 2 !== 0 ? "md:order-2" : ""
          }`}
        >
          {/* Soft Glow Behind */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#46B7C3]/20 to-[#178F9E]/20 blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000" />

          <motion.img
            src={item.img}
            alt={item.title}
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-[420px] md:h-[500px] object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
        </motion.div>

        {/* TEXT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: index % 2 === 0 ? 80 : -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2
          }}
          viewport={{ once: true }}
          className={`${index % 2 !== 0 ? "md:order-1" : ""}`}
        >
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-[#46B7C3] to-[#178F9E] bg-clip-text text-transparent">
            {item.title}
          </h2>

          <p className="text-gray-700 text-xl leading-relaxed mb-8">
            {item.description}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="relative px-8 py-3 rounded-full font-medium bg-[#178F9E] text-[#F4FDFE] overflow-hidden group"
          >
            <span className="relative z-10">Learn More</span>

            {/* Sliding Shine Effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition duration-1000 ease-in-out" />
          </motion.button>
        </motion.div>

      </motion.div>
    ))}

  </div>
</section>
<Footer/>
    </div>
  )
}

export default page
