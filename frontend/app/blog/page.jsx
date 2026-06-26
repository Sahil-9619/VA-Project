"use client";

import { motion } from "framer-motion";
import Nav from "../sections/Nav";
import Footer from "../sections/Footer";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Blog() {

    const blogPosts = [
  {
    id: 1,
    img: "/images/blog1.png",
    category: "Development",
    title: "How to Build Real Projects That Impress Recruiters",
    excerpt:
      "Practical advice on creating portfolio-ready applications that demonstrate real skill.",
    readTime: "5 min read",
    date: "May 2026",
  },
  {
    id: 2,
    img: "/images/blog2.png",
    category: "Design",
    title: "UI/UX Principles Every Beginner Should Know",
    excerpt:
      "Learn the core design fundamentals that make digital products intuitive and beautiful.",
    readTime: "6 min read",
    date: "May 2026",
  },
  {
    id: 3,
    img: "/images/blog3.png",
    category: "Career",
    title: "How to Crack Technical Interviews in 2026",
    excerpt:
      "Smart strategies to prepare for coding rounds and technical discussions effectively.",
    readTime: "7 min read",
    date: "April 2026",
  },
  {
    id: 4,
    img: "/images/blog4.png",
    category: "Data",
    title: "Why Data Science Is Still a Top Career Choice",
    excerpt:
      "Explore the growing demand and opportunities in the data-driven world.",
    readTime: "4 min read",
    date: "April 2026",
  },
  {
    id: 5,
    img: "/images/blog5.png",
    category: "Marketing",
    title: "Digital Marketing Trends You Shouldn’t Ignore",
    excerpt:
      "Stay ahead with the latest growth strategies and online marketing techniques.",
    readTime: "5 min read",
    date: "March 2026",
  },
  {
    id: 6,
    img: "/images/blog6.png",
    category: "Productivity",
    title: "How to Stay Consistent While Learning Online",
    excerpt:
      "Proven techniques to maintain discipline and complete your online courses.",
    readTime: "3 min read",
    date: "March 2026",
  },
];

const popularPosts = [
  {
    id: 1,
    title: "Top 15 React Interview Questions in 2026",
    img : '/images/popular1.png',
    excerpt:
      "A curated list of frequently asked interview questions with practical answers.",
  },
  {
    id: 2,
    title: "Next.js vs React: What Should You Learn in 2026?",
    img : '/images/popular2.png',
    excerpt:
       "A practical comparison of Next.js and React to help you choose the right path for your career.",
  },
];

  return (
    <main className="bg-[#F4FDFE] text-[#0F6F7C] overflow-hidden">

      <Nav />

      {/* ================= HERO ================= */}
<section className="relative pt-36 pb-28 px-6 bg-[#0F6F7C] text-[#F4FDFE] overflow-hidden">

  {/* Soft Background Glow */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.2 }}
    transition={{ duration: 2 }}
    className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#178F9E] blur-[150px] rounded-full"
  />

  <div className="relative max-w-7xl mx-auto">

    <motion.p
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="uppercase tracking-widest text-white text-md mb-6"
    >
      Educational Blog
    </motion.p>

    <motion.h1
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.3, ease: [0.16,1,0.3,1] }}
      className="text-6xl font-extrabold leading-tight mb-8"
    >
      Practical insights for
      <br />
      disciplined learners.
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, delay: 0.2 }}
      className="text-[#F4FDFE]/80 text-lg max-w-2xl"
    >
      Career guidance, structured learning roadmaps,
      and industry-focused strategies for real growth.
    </motion.p>

  </div>
</section>

      {/* ================= FEATURED POST ================= */}
<section className="py-16 px-6 bg-[#F4FDFE] text-[#0F6F7C]">
  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

    <motion.div
      initial={{ opacity: 0, x: -80 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }}
      viewport={{ once: true }}
      className="rounded-3xl overflow-hidden shadow-2xl group"
    >
      <img
        src="/images/featuredev.png"
        className="w-full h-[500px] object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
      />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2 }}
      viewport={{ once: true }}
    >
      <p className="text-[#178F9E] text-sm mb-4 uppercase tracking-wide">
        Featured
      </p>

      <h2 className="text-4xl font-bold mb-6">
        The Complete Roadmap to Becoming
        a Full Stack Developer in 2026
      </h2>

      <p className="text-[#178F9E] mb-8 leading-relaxed">
        A structured, step-by-step guide covering frontend,
        backend, deployment, and portfolio building.
      </p>

      <button className="flex items-center gap-2 text-[#178F9E] hover:gap-4 transition-all duration-500">
        Read Article <ArrowRight size={18} />
      </button>
    </motion.div>

  </div>
</section>


      {/* ================= LATEST ARTICLES GRID ================= */}
<section className="py-16 px-6 bg-[#0F6F7C] text-[#F4FDFE]">
  <div className="max-w-7xl mx-auto">

    <motion.h2
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className="text-4xl font-bold mb-20 text-center text-white"
    >
      Latest Articles
    </motion.h2>

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.2 } }
      }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-16"
    >

      {blogPosts.map((item) => (
        <motion.article
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 80 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 1, ease: [0.16,1,0.3,1] }}
          whileHover={{ y: -12 }}
          className="group"
        >
          <div className="rounded-3xl overflow-hidden mb-6 shadow-xl">
            <img
              src={item.img}
              className="w-full h-[260px] object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
            />
          </div>

          <p className="text-[#46B7C3] text-xs mb-3 uppercase">
            {item.category}
          </p>

          <h3 className="text-xl font-semibold mb-4">
            {item.title}
          </h3>

          <p className="text-[#F4FDFE]/75 text-sm mb-4">
            {item.excerpt}
          </p>

          <span className="text-[#F4FDFE]/50 text-xs">
            {item.readTime} • {item.date}
          </span>
        </motion.article>
      ))}

    </motion.div>

  </div>
</section>

      {/* ================= POPULAR POSTS ================= */}
      <section className="py-12 px-6 bg-[#0F6F7C] text-[#F4FDFE]">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold mb-12">
            Popular This Month
          </h2>

          <div className="grid md:grid-cols-2 gap-10">

            {popularPosts.map((item) => (
              <div key={item.id} className="flex gap-6 items-center">
                <div className="w-80 h-60 rounded-xl overflow-hidden">
                  <img
                    src={item.img}
                    className="w-full h-full object-contain"
                    alt="Popular"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {item.excerpt}
                    </p>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
<section className="relative py-32 px-6 bg-[#F4FDFE] text-[#0F6F7C] text-center overflow-hidden">

  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 0.15 }}
    transition={{ duration: 2 }}
    viewport={{ once: true }}
    className="absolute left-1/2 -translate-x-1/2 top-0 w-[500px] h-[500px] bg-[#178F9E] blur-[150px] rounded-full"
  />

  <div className="relative max-w-4xl mx-auto">

    <motion.h2
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="text-5xl font-bold mb-8"
    >
      Get smarter every week.
    </motion.h2>

    <p className="text-[#178F9E] mb-12">
      Join our newsletter for structured learning resources.
    </p>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <input
        type="email"
        placeholder="Enter your email"
        className="px-6 py-3 rounded-full border border-[#178F9E]/40 outline-none"
      />
      <button className="px-8 py-3 bg-[#178F9E] hover:bg-[#46B7C3] text-white rounded-full transition-all duration-500 hover:scale-105">
        Subscribe
      </button>
    </div>

  </div>
</section>

      <Footer />

    </main>
  );
}