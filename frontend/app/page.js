"use client";
import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Clock,
  BarChart2,
  MonitorPlay,
  Globe,
  MessageSquare,
  ShieldCheck,
  LayoutDashboard,
  Rocket,
  ChevronRight,
  Star,
  Check, ChevronLeft 
} from "lucide-react";
import { brandName } from "./contants";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Nav from './sections/Nav'
import Footer from "./sections/Footer";



const Home = () => {
  
  const { settings } = useSelector((state) => state.appSettings);
  
  const [index, setIndex] = useState(0);
const images = [
  "/images/banner1.png", 
  "/images/banner2.png",
];

const courses = [
  {
    id: 1,
    title: "UI/UX Design Masterclass",
    category: "Design",
    img: '/images/uiux.jpg',
    lessons: 12,
    duration: "8h 30m",
    rating: 4.9,
    price: 89.99,
  },
  {
    id: 2,
    title: "Full Stack Web Development",
    category: "Development",
    img:'/images/dev.jpg',
    lessons: 24,
    duration: "32h 15m",
    rating: 4.8,
    price: 129.99,
  },
  {
    id: 3,
    title: "Digital Marketing Fundamentals",
    category: "Business",
    img:"/images/digmar.jpg",
    lessons: 8,
    duration: "6h 20m",
    rating: 4.7,
    price: 69.99,
  }
];

useEffect(() => {
  const interval = setInterval(() => {
    setIndex((prev) => (prev + 1) % images.length);
  }, 5000);
  return () => clearInterval(interval);
}, []);

  
  return (
<div className="font-sans   min-h-screen overflow-x-hidden">
        {/* Navigation */}
      <Nav/>

      {/* Hero Section */}
   
     <section className="relative pt-35 pb-10 w-full overflow-hidden">

  {/* Background Images Fade */}
  <div className="absolute inset-0 ">
    {images.map((img, i) => (
      <motion.div
        key={i}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${img})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: i === index ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
    ))}
  </div>
  
  {/* Olive Overlay Instead of Black */}
  <div className="absolute inset-0 bg-[white]/80" />
  
  {/* Content */}
  <div className="relative z-10 h-full flex items-center">
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-2xl text-[#FEFAE0]">

        <h1 className="text-5xl  text-black md:text-6xl font-bold leading-tight mb-6">
          Learn New Skills Online With{" "}
          <span className="text-cyan-500">{brandName}</span>
        </h1>

        <p className="text-xl text-gray-800 mb-8">
          Access 5,000+ courses from top instructors around the globe.
          Grow your skills today.
        </p>

        <div className="flex flex-wrap gap-4">

          <Link 
            href="/user/login"
            className="bg-[#178F9E] text-[#FEFAE0] px-8 py-3 rounded-full font-medium hover:bg-[#0F6F7C] transition-all"
          >
            Get Started
          </Link>

          <Link 
            href="/admission"
            className="bg-[#178F9E] text-[#FEFAE0] px-8 py-3 rounded-full font-medium hover:bg-[#0F6F7C] hover:text-[#FEFAE0] transition-all"
          >
            GET ADMISSION
          </Link>

        </div>
      </div>
    </div>
  </div>
  
</section>

{/* Admission Section*/}
<section className="py-10 bg-gradient-to-br from-[#0F6F7C] via-[#178F9E] to-[#46B7C3] text-white overflow-hidden">
  <div className="max-w-6xl mx-auto px-6 text-center">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="mb-14"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Admissions Open 2026
      </h2>

      <p className="text-lg text-white max-w-2xl mx-auto leading-relaxed">
        Secure your seat at <span className="text-cyan-300 font-semibold">{brandName}</span>{" "}
        and begin your journey toward career-focused classroom excellence.
      </p>
    </motion.div>

    {/* Features Line */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-8 mb-14 text-sm md:text-base"
    >
      <div className="flex items-center gap-2">
        <Check className="h-5 w-5 text-green-300" />
        Limited Seats Available
      </div>

      <div className="flex items-center gap-2">
        <Check className="h-5 w-5 text-green-300" />
        Industry-Focused Curriculum
      </div>
    </motion.div>

    {/*Button */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true }}
    >
      <Link
        href="/admission"
        className="border-2 border-white inline-block px-10 py-4 bg-[#178F9E] text-white font-semibold rounded-full hover:bg-[#0F6F7C] transition-all duration-300"
      >
        Apply for Admission →
      </Link>
    </motion.div>

  </div>
</section>

{/* About Us Section */}
<section className="py-24 bg-white text-gray-900 overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

    {/* Left Image */}
    <motion.div
      initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="relative"
    >
      <motion.img
        src="/images/class.png"
        alt="About Vigyan Academy"
        className="rounded-2xl shadow-2xl w-full h-[450px] object-cover"
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.6 }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="absolute -bottom-6 -right-6 bg-[#0F6F7C] text-white p-6 rounded-2xl shadow-xl"
      >
        <h3 className="text-3xl font-bold text-cyan-300">10+ Years</h3>
        <p className="text-sm">Of Excellence</p>
      </motion.div>
    </motion.div>

    {/* Right Content */}
    <motion.div
      initial={{ opacity: 0, x: 60, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl md:text-5xl text-gray-700 font-bold mb-6">
        About <span className="text-cyan-500">{brandName} Institute</span>
      </h2>

      <p className="text-[#283618]/85 text-lg mb-6 leading-relaxed">
        {brandName} is a premier offline learning center dedicated to 
        providing high-quality classroom education. We focus on practical training, 
        real-time interaction, and hands-on learning experiences that help students 
        build strong foundations and industry-ready skills.
      </p>

      <p className="text-[#606C38] mb-8">
        Our mission is to deliver personalized attention, structured courses, 
        and expert mentorship in a supportive classroom environment that 
        encourages growth and success.
      </p>

      {/* Feature List - Staggered Premium Reveal */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.12
            }
          }
        }}
        className="grid grid-cols-2 gap-6 mb-8"
      >
        {[
          "Expert Instructors",
          "Lifetime Access",
          "Certified Courses",
          "Career Support"
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <Check className="h-6 w-6 text-[#178F9E]" />
            <span>{item}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          href="/about"
          className="inline-flex items-center bg-cyan-600 hover:bg-cyan-800 text-[#FEFAE0] px-8 py-3 rounded-full font-medium transition-all"
        >
          Learn More <ChevronRight className="ml-2 h-5 w-5" />
        </Link>
      </motion.div>
    </motion.div>

  </div>
</section>


      {/* Stats Section */}
<section className="relative py-28 overflow-hidden bg-white">

  {/* Soft Ambient Glow */}
  <div className="absolute w-[600px] h-[600px] bg-[#46B7C3]/20 blur-3xl rounded-full top-[-150px] left-[-150px]" />
  <div className="absolute w-[500px] h-[500px] bg-[#178F9E]/20 blur-3xl rounded-full bottom-[-150px] right-[-150px]" />

  <div className="relative max-w-7xl mx-auto px-6">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="text-center mb-20"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#283618]">
        Our Impact in Numbers
      </h2>
      <p className="text-[#606C38] text-lg">
        Empowering learners worldwide with measurable success.
      </p>
    </motion.div>

    {/* Elegant Stats Layout */}
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
        className="grid grid-cols-4 gap-4 text-center"    >
      {[
        { icon: Users, number: "50K+", label: "Active Students" },
        { icon: BookOpen, number: "5K+", label: "Courses Available" },
        { icon: Award, number: "300+", label: "Expert Instructors" },
        { icon: Clock, number: "24/7", label: "Learning Access" }
      ].map((item, i) => (
        <motion.div
  key={i}
  variants={{
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
  className="group"
>
  <item.icon className="h-6 w-6 md:h-8 md:w-8 text-[#178F9E] mx-auto mb-3 transition-transform duration-500 group-hover:scale-110" />

  <h3 className="text-2xl md:text-5xl font-extrabold text-cyan-600 mb-2">
    {item.number}
  </h3>

  <p className="text-cyan-900 text-[11px] md:text-base leading-tight">
    {item.label}
  </p>
</motion.div>
      ))}
    </motion.div>

  </div>
</section>


{/* Why Choose Us */}

<section className="py-24 bg-gray-100 text-cyan-700 overflow-hidden">
  <div className="max-w-7xl mx-auto px-6">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="text-center mb-20"
    >
      <h2 className="text-3xl md:text-5xl font-bold mb-4">
        Why Choose {brandName} Institute
      </h2>
      <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
        Experience classroom excellence with expert mentorship,
        practical training, and career-focused learning.
      </p>
    </motion.div>

    {/* Clean Feature Layout */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } }
      }}
      className="grid grid-cols-2 md:grid-cols-3 gap-y-16 gap-x-10"
    >
      {[
        { icon: MonitorPlay, title: "Smart Classrooms", desc: "Modern digital classroom infrastructure." },
        { icon: Users, title: "Small Batch Size", desc: "Personalized learning experience." },
        { icon: Award, title: "Certified Programs", desc: "Industry-recognized certifications." },
        { icon: LayoutDashboard, title: "Lab Sessions", desc: "Hands-on real-world training." },
        { icon: MessageSquare, title: "Mentorship", desc: "Direct expert guidance." },
        { icon: Rocket, title: "Placement Support", desc: "Career & interview preparation." }
      ].map((feature, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 60 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="group"
        >
          <feature.icon className="h-8 w-8 text-cyan-600 mb-6 transition-transform duration-500 group-hover:scale-110" />

          <h3 className="text-lg md:text-xl text-black font-semibold mb-3">
            {feature.title}
          </h3>

          <div className="w-10 h-[2px] bg-cyan-500 mb-4 transition-all duration-500 group-hover:w-16" />

          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            {feature.desc}
          </p>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>




{/* Proud Moments - Collage Design */}
<section className="py-28 bg-gradient-to-br from-[#0F6F7C] via-[#178F9E] to-[#46B7C3] text-[#FEFAE0] overflow-hidden">
  <div className="max-w-7xl mx-auto px-6">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="text-center mb-24"
    >
      <h2 className="text-4xl text-white md:text-5xl font-bold mb-6">
        Our Proud Moments
      </h2>
      <p className="text-white text-lg max-w-2xl mx-auto">
        Celebrating our journey, achievements, and student success stories.
      </p>
    </motion.div>

    {/* ROW 1 */}
    <div className="grid md:grid-cols-2 gap-16 items-center mb-28">

      <motion.div
        initial={{ opacity: 0, x: -80, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="relative group overflow-hidden rounded-3xl"
      >
        <motion.img
          src="/images/pic1.png"
          className="w-full h-[400px] object-cover"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.8 }}
          alt="Annual Event"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
          Grand Annual Tech Fest
        </h3>
        <p className="text-gray-100 leading-relaxed text-lg">
          Our institute hosts large-scale technical festivals every year
          where students showcase projects, innovations, and creativity.
          Industry experts participate and guide students for future growth.
        </p>
      </motion.div>

    </div>

    {/* ROW 2 */}
    <div className="grid md:grid-cols-2 gap-16 items-center mb-28">

      <motion.div
        initial={{ opacity: 0, x: -80 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="order-2 md:order-1"
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
          Placement Success Stories
        </h3>
        <p className="text-gray-100 leading-relaxed text-lg">
          Our students consistently secure placements in reputed companies.
          Through continuous mentorship, mock interviews, and skill-building
          programs, we ensure every student is industry-ready.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 80, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="order-1 md:order-2 relative group overflow-hidden rounded-3xl"
      >
        <motion.img
          src="/images/pic2.jpg"
          className="w-full h-[400px] object-cover"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.8 }}
          alt="Successful Students"
        />
      </motion.div>

    </div>

    {/* ROW 3 */}
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto text-center"
    >
      <div className="overflow-hidden rounded-3xl mb-10">
        <motion.img
          src="/images/pic4.jpg"
          className="w-full h-[450px] object-cover"
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.8 }}
          alt="Certification Ceremony"
        />
      </div>

      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
        Certification & Achievement Ceremony
      </h3>

      <p className="text-gray-100 text-lg leading-relaxed">
        We proudly celebrate our students' accomplishments through
        grand certification ceremonies. Recognizing hard work and
        dedication motivates students to aim higher and achieve more.
      </p>
    </motion.div>

  </div>
</section>


      {/* Testimonials */}
<section className="py-24 bg-[#F4FDFE] overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 md:px-6">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="text-center mb-20"
    >
      <h2 className="text-3xl md:text-5xl text-[#283618] font-bold mb-4">
        What Our Students Say
      </h2>
      <p className="text-base md:text-xl text-[#606C38] max-w-2xl mx-auto">
        Hear from our students about their learning experience
      </p>
    </motion.div>

    {/* Testimonials */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } }
      }}
      className="grid grid-cols-3 gap-6 md:gap-12"
    >
      {[1, 2, 3].map((item) => (
        <motion.div
          key={item}
          variants={{
            hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="group"
        >
          {/* Profile */}
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 md:h-14 md:w-14 rounded-full overflow-hidden mr-4 border border-[#178F9E]">
              <img
                src={`https://randomuser.me/api/portraits/${
                  item === 1 ? "women" : item === 2 ? "men" : "women"
                }/${item}2.jpg`}
                alt="Student"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-sm md:text-lg text-[#283618]">
                {item === 1
                  ? "Sarah Johnson"
                  : item === 2
                  ? "Michael Chen"
                  : "Emma Rodriguez"}
              </h4>
              <p className="text-[11px] md:text-sm text-[#606C38]">
                {item === 1
                  ? "UI Designer"
                  : item === 2
                  ? "Web Developer"
                  : "Marketing Specialist"}
              </p>
            </div>
          </div>

          {/* Text */}
          <p className="text-xs md:text-base text-[#283618]/90 mb-6 leading-relaxed">
            {item === 1
              ? "The courses transformed my design skills. The instructors are knowledgeable and the platform is easy to use."
              : item === 2
              ? "I landed my dream job after completing the Full Stack Development course. The hands-on projects were incredibly valuable."
              : "The digital marketing course gave me practical skills I could apply immediately to grow my business."}
          </p>

          {/* Divider */}
          <div className="w-8 h-[2px] bg-cyan-500 mb-4 transition-all duration-500 group-hover:w-16" />

          {/* Rating */}
          <div className="flex text-[#DDA15E]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-3 w-3 text-teal-500 md:h-5 md:w-5 fill-current" />
            ))}
          </div>

        </motion.div>
      ))}
    </motion.div>

  </div>
</section>

{/* Top Students Section */}
<section className="py-28 bg-[#F4FDFE] text-black overflow-hidden">
  <div className="max-w-7xl mx-auto px-6">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="text-center mb-24"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        Our Top Students
      </h2>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Recognizing excellence and celebrating outstanding achievements.
      </p>
    </motion.div>

    {/* Students Grid */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } }
      }}
      className="grid grid-cols-2 md:grid-cols-4 gap-14 text-center"
    >
      {[
        {
          name: "Rahul Kumar",
          course: "Full Stack Development",
          company: "Placed at TCS",
          img: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
          name: "Priya Sharma",
          course: "UI/UX Design",
          company: "Infosys",
          img: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
          name: "Amit Verma",
          course: "Digital Marketing",
          company: "Wipro",
          img: "https://randomuser.me/api/portraits/men/55.jpg"
        },
        {
          name: "Neha Singh",
          course: "Frontend Development",
          company: "HCL",
          img: "https://randomuser.me/api/portraits/women/68.jpg"
        }
      ].map((student, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 60, filter: "blur(6px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="group"
        >
          {/* Image */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-6">
            <motion.img
              src={student.img}
              alt={student.name}
              className="w-full h-full rounded-full object-cover border-2 border-[#178F9E]"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Name */}
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            {student.name}
          </h3>

          {/* Accent Line */}
          <div className="w-8 h-[2px] bg-cyan-500 mx-auto mb-3 transition-all duration-500 group-hover:w-16" />

          {/* Course */}
          <p className="text-black text-xs md:text-sm mb-2">
            {student.course}
          </p>

          {/* Company */}
          <p className="text-cyan-700 text-xs md:text-sm">
            {student.company}
          </p>

        </motion.div>
      ))}
    </motion.div>

  </div>
</section>


{/* CTA Section */}
<section className="py-20 bg-cyan-100/20 dark:bg-slate-900/50">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl font-bold mb-6 text-[#283618] dark:text-slate-100">
      Ready to Start Learning?
    </h2>

    <p className="text-xl text-[#606C38] dark:text-slate-300 mb-8">
      Join thousands of students advancing their careers with our courses
    </p>

    <div className="flex flex-wrap justify-center gap-4">
      <Link
        href="/user/login"
        className="bg-[#178F9E] text-[#FEFAE0] px-8 py-3 rounded-full font-medium hover:bg-[#0F6F7C] transition-all flex items-center"
      >
        Get Started <ChevronRight className="ml-2 h-5 w-5" />
      </Link>

      <Link
        href="/admission"
        className="border border-[#178F9E] text-[#178F9E] rounded-full hover:bg-cyan-800 hover:text-white px-8 py-3 rounded-full font-medium hover:bg-[#DDA15E]/20 transition-all"
      >
        Get Admission
      </Link>
    </div>
  </div>
</section>



{/* Branches Section */}
<section className="py-14 pb-4 bg-gradient-to-br from-[#0F6F7C] via-[#178F9E] to-[#46B7C3] text-white">
  <div className="max-w-7xl mx-auto px-6">

    <div className="text-center mb-16">
      <h2 className="text-4xl  font-bold mb-4">
        Our Branches
      </h2>
      <p className="text-gray-200 text-lg max-w-2xl mx-auto">
        Expanding quality classroom education across multiple cities.
      </p>
    </div>

    {[
      {
        state: "Bihar Branches",
        branches: [
          {
            name: "Patna Branch",
            address: "Boring Road, Patna, Bihar",
            phone: "+91 98765 11111",
            img: "/images/pic1.png"
          },
          {
            name: "Gaya Branch",
            address: "Station Road, Gaya, Bihar",
            phone: "+91 98765 22222",
            img: "/images/pic2.jpg"
          },
          {
            name: "Muzaffarpur Branch",
            address: "Main Market Area, Muzaffarpur",
            phone: "+91 98765 33333",
            img: "/images/pic4.jpg"
          },
          {
            name: "Bhagalpur Branch",
            address: "Tilka Manjhi Chowk, Bhagalpur",
            phone: "+91 98765 44444",
            img: "/images/pic5.jpg"
          }
        ]
      },
      {
        state: "Delhi Branches",
        branches: [
          {
            name: "Laxmi Nagar Branch",
            address: "Metro Pillar 45, Delhi",
            phone: "+91 91234 11111",
            img: "/images/pic2.jpg"
          },
          {
            name: "Rohini Branch",
            address: "Sector 10, Rohini, Delhi",
            phone: "+91 91234 22222",
            img: "/images/pic4.jpg"
          },
          {
            name: "Dwarka Branch",
            address: "Sector 12, Dwarka, Delhi",
            phone: "+91 91234 33333",
            img: "/images/pic1.png"
          },
          {
            name: "Karol Bagh Branch",
            address: "Ajmal Khan Road, Delhi",
            phone: "+91 91234 44444",
            img: "/images/pic5.jpg"
          }
        ]
      }
    ].map((stateData, index) => (
      <div key={index} className="mb-20">

        <h3 className="text-3xl font-bold mb-10">
          {stateData.state}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stateData.branches.map((branch, i) => (
            <div
              key={i}
              className="bg-[#178F9E]/30 backdrop-blur-lg border border-cyan-200 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <h4 className="text-xl font-bold text-[#FEFAE0] mb-2">
                  {branch.name}
                </h4>

                <p className="text-gray-100 mb-3 text-sm">
                  📍 {branch.address}
                </p>

                <p className="text-gray-100 text-sm">
                  📞 {branch.phone}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    ))}

  </div>
</section>

      {/* Footer */}
    <Footer/>
    </div>
  );
};

export default Home;
