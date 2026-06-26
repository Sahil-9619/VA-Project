"use client"
import React, { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  BookOpen,
  CreditCard,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  MapPin,
  TrendingUp,
  Award,
  GraduationCap,
  Calendar1
} from "lucide-react";
import { useRouter } from "next/navigation";
import { admissionService } from "@/services/admission.service";
import { useSelector } from "react-redux";
import { adminServices } from "@/services/admin/admin.service";


const App = () => {
  const router = useRouter();
  const [hasAdmission, setHasAdmission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const [studentData, setStudentData] = useState(null);
  const [className, setClassName] = useState("");
  const [feeData, setFeeData] = useState(null);


  // Primary Theme Color constant
  const primaryColor = "#0E94A5";

  // Stats Data - Updated to match the Vigyan Academy Teal palette

  const upcomingClasses = [
    { subject: "Mathematics", topic: "Integration by Parts", time: "10:30 AM", room: "Hall A" },
    { subject: "Chemistry", topic: "Organic Synthesis", time: "01:15 PM", room: "Room 204" },
  ];


  useEffect(() => {
    const checkAdmission = async () => {
      try {
        const res = await admissionService.checkAdmission();

        console.log("ADMISSION RESPONSE 👉", res);

        const admitted =
          res?.hasAdmission === true ||
          res?.data?.hasAdmission === true ||
          !!res?.student ||
          !!res?.data?.student;

        setHasAdmission(admitted);
      } catch (err) {
        console.error("ERROR ❌", err);
        setHasAdmission(false);
      }
    };

    checkAdmission();
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!user?.email) return;

        const email = user.email;

        console.log("USER EMAIL 👉", email);

        // 🔥 STEP 1: get ALL classes
        const classRes = await adminServices.getAllClasses();
        const classes = classRes?.data || classRes;

        console.log("ALL CLASSES 👉", classes);

        let foundStudent = null;
        // 🔥 GET CLASS NAME USING CLASS ID
        if (foundStudent) {
          setStudentData(foundStudent);

          if (foundStudent?.classId?._id) {
            const classRes = await adminServices.getClassById(foundStudent.classId._id);
            const cls = classRes?.data || classRes;

            setClassName(cls?.name || cls?.className || "");
          }
        }

        // 🔥 STEP 2: loop each class and find student
        for (let cls of classes) {
          const res = await adminServices.getstudentsByClass(cls._id);
          const students = res?.data || res;

          if (!Array.isArray(students)) continue;

          const match = students.find(
            (stu) =>
              stu.email?.toLowerCase() === email.toLowerCase() ||
              stu?.user?.email?.toLowerCase() === email.toLowerCase()
          );

          if (match) {
            foundStudent = { ...match, className: cls.name };
            break;
          }
        }

        console.log("FINAL MATCHED STUDENT 👉", foundStudent);
        console.log("CLASS OBJECT 👉", studentData?.classId);

        if (!foundStudent) return;

        // ✅ save full student
        setStudentData(foundStudent);

      } catch (err) {
        console.error("ERROR ❌", err);
      }
    };

    fetchStudent();
  }, [user]);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        if (!studentData?.admissionNumber) return;

        console.log("FETCHING FEE FOR 👉", studentData.admissionNumber);

        const res = await adminServices.getStudentFeeByAdmission(
          studentData.admissionNumber
        );

        const data = res?.data || res;

        console.log("FEE DATA 👉", data);

        setFeeData(data.fee); // 🔥 IMPORTANT
      } catch (err) {
        console.error("FEE ERROR ❌", err);
      }
    };

    fetchFee();
  }, [studentData]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0E94A5] border-t-transparent"></div>
          <p className="text-gray-500 font-medium animate-pulse">Vigyan Academy Portal...</p>
        </div>
      </div>
    );
  }
  const displayName =
    studentData?.firstName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";
  return (
    <div className="min-h-screen bg-[#F8FAFB] bg-cyan-100/20 text-slate-900 font-sans pb-12">
      <div className="mt-10  md:mt-14">
        {/* Header Greeting */}
        <header className=" flex flex-col md:flex-row md:items-end justify-between gap-4 px-6 py-6 bg-gradient-to-r from-[#0A6B78] via-[#0E94A5] to-[#0A6B78] text-white shadow-sm">
          <div>
            <h1 className="text-3xl px-5 font-extrabold tracking-tight text-white sm:text-4xl">
              {getGreeting()}, {displayName}
            </h1>
            <p className="text-white/80 mt-2 font-medium px-8">- Empowering your journey with "विज्ञानं सर्वस्य मूलम्"</p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-lg border border-cyan-100">
            <div className="h-10 w-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Calendar1 />
            </div>
            <div className="pr-4">
              <p className="text-[8px] text-black font-bold uppercase tracking-wider">
                Today
              </p>

              <p className="text-sm font-bold text-cyan-700">
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </header>
      </div>


      <hr className="py-3"></hr>
      {/* ADMISSION BANNER */}
      {!hasAdmission && (
        <div className="mb-10 px-10 relative overflow-hidden rounded-3xl border border-cyan-100  bg-white shadow-xl shadow-[#0E94A5]/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-50 rounded-full opacity-40"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-8 gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0 p-4 bg-cyan-100 rounded-2xl text-[#0E94A5]">
                <AlertCircle size={32} />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-red-600">Admission Process Pending!</h3>
                <p className="text-slate-600 mt-2 max-w-xl leading-relaxed">
                  Finalize your enrollment to access
                  <span className="font-bold text-[#0E94A5]"> get access to the courses, </span>
                  <span className="font-bold text-[#0E94A5]"> your perosnal details and fee details </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/admission")}
              className="group flex items-center gap-3 whitespace-nowrap bg-[#0E94A5] hover:bg-[#087a87] text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-100"
            >
              Get Admission Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      )}

      {/* Stats Grid */}

      <div className="mb-12 ">

        {/* 🔥 OUTER CONTAINER */}
        <div className="relative w-full  py-10 
  bg-white/60 backdrop-blur-sm border border-gray-100 shadow-sm">

          {/* 🔥 TOP FADE BORDER */}
          <div className="absolute top-0 left-0 w-full h-[1px] 
    bg-gradient-to-r from-transparent via-[#0E94A5] to-transparent opacity-40"></div>

          {/* 🔥 BOTTOM FADE BORDER */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] 
    bg-gradient-to-r from-transparent via-[#0E94A5] to-transparent opacity-40"></div>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

            {/* ================= ITEM 1 ================= */}
            <div className="relative flex items-center gap-4 px-4 py-4">

              {/* LEFT ICON */}
              <div className="h-11 w-11 rounded-full bg-[#0E94A5]/10 flex items-center justify-center shrink-0">
                <GraduationCap className="text-[#0E94A5]" size={18} />
              </div>

              {/* TEXT */}
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest ">
                  Class & Section
                </p>

                <h4 className="text-sm font-semibold text-[#0E94A5] mt-1">
                  {studentData
                    ? `Class ${studentData?.classId?.className || "N/A"} - ${studentData?.classId?.section || studentData?.section || "N/A"}`
                    : "Loading..."}
                </h4>
              </div>

              {/* 🔥 DIVIDER RIGHT */}
              <div className="hidden lg:block absolute right-0 top-0 h-full w-[1px] 
        bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
            </div>


            {/* ================= ITEM 2 ================= */}
            <div className="relative flex items-center gap-4 px-4 py-4">

              <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <CreditCard className="text-blue-600" size={18} />
              </div>

              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                  Total Fee
                </p>
                <h4 className="text-2xl font-bold text-gray-800 mt-1">
                  ₹{(feeData?.totalAssignedFee || 0).toLocaleString()}
                </h4>
              </div>

            </div>

            {/* ================= ITEM 3 ================= */}
            <div className="flex items-center gap-4 px-4 py-4">

              <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <CreditCard className="text-red-500" size={18} />
              </div>

              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                  Remaining Fee
                </p>

                <h4 className="text-2xl font-bold text-red-600 mt-1">
                  ₹{(feeData?.remainingAmount || 0).toLocaleString()}
                </h4>
              </div>

            </div>

          </div>
        </div>

      </div>


      <hr className="mb-12 border-cyan-500" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">
          {/* Schedule Card */}
          <section className="bg-white rounded-3xl border border-cyan-50 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
              <button className="text-sm font-semibold text-[#0E94A5] hover:underline">
                Full Calendar
              </button>
            </div>
            <div className="space-y-6">
              {upcomingClasses.map((item, idx) => (
                <div key={idx} className="flex items-start">

                  <div className="min-w-[100px] pr-6 border-r border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{item.time}</p>
                    <p className="text-xs text-gray-400">{item.room}</p>
                  </div>

                  <div className="pl-6">
                    <h4 className="font-semibold text-gray-800">{item.subject}</h4>
                    <p className="text-sm text-gray-500">{item.topic}</p>
                  </div>

                </div>
              ))}
            </div>
          </section>

          {/* Performance Card */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-slate-800 flex items-center gap-3">
                <div className="w-2 h-6 bg-[#0E94A5] rounded-full"></div>
                Performance Analytics
              </h2>
              <select className="text-xs font-bold border-none bg-cyan-50 text-[#0E94A5] rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer">
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="aspect-[21/9] w-full bg-cyan-50/30 rounded-2xl border-2 border-dashed border-cyan-100 flex flex-col items-center justify-center text-center p-6">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                <TrendingUp className="text-[#0E94A5] opacity-30" size={32} />
              </div>
              <p className="text-slate-500 font-bold">Analytics Pending</p>
              <p className="text-slate-400 text-sm mt-1">Charts will update after your first evaluation.</p>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Notice Board */}
          <section className="bg-white rounded-3xl border border-cyan-50 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-cyan-50 bg-[#0F3B45] text-white">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">Notice Board</h2>
                <div className="h-2 w-2 bg-[#0E94A5] rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex-grow">
              {[
                { title: "Weekly Mock Test Schedule", date: "Oct 24", type: "Exam" },
                { title: "Holiday: Diwali Break", date: "Oct 22", type: "Holiday" },
                { title: "Physics Lab Manual Uploaded", date: "Oct 20", type: "Material" }
              ].map((notice, idx) => (
                <div key={idx} className="p-6 border-b border-cyan-50 hover:bg-cyan-50/20 transition-all cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-cyan-50 text-[#0E94A5]">
                      {notice.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">{notice.date}</span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-700 hover:text-[#0E94A5] transition-colors">{notice.title}</h5>
                </div>
              ))}
            </div>
            <button className="w-full py-5 text-xs font-black text-slate-400 uppercase tracking-widest">
              All Notices
            </button>
          </section>

          {/* Support Card */}
          <div className="bg-gradient-to-br from-[#0E94A5] to-[#0A6B78] rounded-3xl p-8 text-white shadow-xl shadow-cyan-100">
            <h4 className="font-bold text-lg mb-2">Help & Support</h4>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">Questions about your batch or fees? Talk to our administrator.</p>
            <button className="w-full py-3 bg-white text-[#0E94A5] font-bold rounded-2xl shadow-sm hover:bg-cyan-50 transition-colors">
              Contact Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App; 