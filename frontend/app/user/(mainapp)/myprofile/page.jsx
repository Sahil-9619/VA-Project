"use client"
import React, { useEffect, useState } from "react";
import {
  User,
  MapPin,
  Globe,
  Camera,
  Save,
  Plus,
  Trash2,
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
  CheckCircle2,
  GraduationCap,
  ChevronRight,
  Edit3,
  X,
  Phone,
  Mail,
  Calendar,
  Users,
  BookOpen,
  Heart,
  ChevronLeft
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { adminServices } from "@/services/admin/admin.service";


const getMediaUrl = (path) => {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  if (!path.startsWith("uploads")) {
    path = `uploads/${path}`;
  }

  return `http://localhost:5000/api/${path}`;
};

const Page = () => {
  // Mocking Redux behavior - Initial data including Admission fields
  const user = useSelector((state) => state?.auth?.user);
  const dispatch = useDispatch();
  const [classes, setClasses] = useState([]);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    parentPhone: "",
    email: "",
    altEmail: "",
    phone: "",
    dob: "",
    gender: "",
    category: "",
    address: "",
    course: "",
    shortBio: "",
    city: "",
    skills: [{ name: "", expertise: 0 }],
    social: { facebook: "", linkedin: "", twitter: "", instagram: "" },
    profileImage: null,
    removeImage: false
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const tabs = [
    { id: "personal", label: "Basic Info", icon: User },
    { id: "contact", label: "Contact Details", icon: Phone },
    { id: "academic", label: "Academic Info", icon: GraduationCap },
    { id: "location", label: "Address Info", icon: MapPin },
    { id: "social", label: "Social Links", icon: Globe },
  ]

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!user?.email) return;

        const res = await adminServices.getStudentByEmail(user.email);

        const student = res?.data;
        setStudentId(student._id);
        console.log("FETCHED STUDENT 👉", student);

        if (!student) return;

        setProfile((prev) => ({
          ...prev,
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          fatherName: student.fatherName || "",
          motherName: student.motherName || "",

          dob: student.dateOfBirth
            ? new Date(student.dateOfBirth).toISOString().split("T")[0]
            : "",

          gender: student.gender || "",
          email: student.email || "",
          altEmail: student.altEmail || "",
          phone: student.phone || "",
          parentPhone: student.parentPhone || "",
          address: student.address || "",
          category: student.category?.toLowerCase() || "",
          city: student.city || "",

          shortBio: student.shortBio || "",
          skills: student.skills?.length ? student.skills : [{ name: "", expertise: 0 }],
          social: student.social || { facebook: "", linkedin: "", twitter: "", instagram: "" },


          course: student.classId || "",
          section: student.section || "",

          profileImage: student.profileImage,
        }));

      } catch (err) {
        console.error("ERROR ❌", err);
      }
    };

    fetchStudent();
  }, [user]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialChange = (field, value) =>
    setProfile({ ...profile, social: { ...profile.social, [field]: value } });

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...profile.skills];
    newSkills[index][field] = value;
    setProfile({ ...profile, skills: newSkills });
  };

  const addSkill = () => setProfile({ ...profile, skills: [...profile.skills, { name: "", expertise: 0 }] });

  const removeSkill = (index) => {
    const newSkills = profile.skills.filter((_, i) => i !== index);
    setProfile({ ...profile, skills: newSkills.length ? newSkills : [{ name: "", expertise: 0 }] });
  };

  const handleToggleEdit = async () => {
    if (isEditing) {
      try {
        const payload = new FormData();

        // ✅ normal fields
        payload.append("firstName", profile.firstName);
        payload.append("lastName", profile.lastName);
        payload.append("fatherName", profile.fatherName);
        payload.append("motherName", profile.motherName);
        payload.append("gender", profile.gender);
        payload.append("dateOfBirth", profile.dob);

        payload.append("phone", profile.phone);
        payload.append("parentPhone", profile.parentPhone);
        payload.append("altEmail", profile.altEmail);

        payload.append("address", profile.address);
        payload.append("category", profile.category);
        payload.append("city", profile.city);

        payload.append("shortBio", profile.shortBio);

        // ✅ objects → stringify
        payload.append("skills", JSON.stringify(profile.skills));
        payload.append("social", JSON.stringify(profile.social));
        payload.append("removeImage", profile.removeImage ? "true" : "false");
        // ✅ image
        if (profile.photo) {
          payload.append("photo", profile.photo);
        }

        console.log("UPDATING 👉", payload);

        await adminServices.updateStudent(studentId, payload);


        // 🔥 REFRESH DATA
        const res = await adminServices.getStudentByEmail(user.email);
        const student = res?.data;

        setProfile((prev) => ({
          ...prev,
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          fatherName: student.fatherName || "",
          motherName: student.motherName || "",

          dob: student.dateOfBirth
            ? new Date(student.dateOfBirth).toISOString().split("T")[0]
            : "",

          gender: student.gender || "",
          email: student.email || "",
          altEmail: student.altEmail || "",
          phone: student.phone || "",
          parentPhone: student.parentPhone || "",

          address: student.address || "",
          category: student.category?.toLowerCase() || "",
          city: student.city || "",

          shortBio: student.shortBio || "",
          skills: student.skills?.length
            ? student.skills
            : [{ name: "", expertise: 0 }],

          social: student.social || {
            facebook: "",
            linkedin: "",
            twitter: "",
            instagram: "",
          },

          course: student.classId || "",
          section: student.section || "",

          profileImage: student.profileImage,
        }));

        console.log("UPDATED ✅");

      } catch (err) {
        console.error("UPDATE ERROR ❌", err);
      }
    }

    setIsEditing(!isEditing);
  };

  const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label;
  console.log("COMPONENT RENDERED ✅");
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await adminServices.getAllClasses();
        const data = res?.data || res;
        setClasses(data);
      } catch (err) {
        console.error("CLASS FETCH ERROR ❌", err);
      }
    };

    fetchClasses();
  }, []);
  const className = classes.find(
    (c) => String(c._id) === String(profile.course)
  )?.name || classes.find(
    (c) => String(c._id) === String(profile.course)
  )?.className;

  return (
    <div className="min-h-screen mt-10 bg-[#FDFDFD] font-sans text-slate-900">
      <div className="w-full flex flex-col lg:flex-row">

        {/* Navigation Sidebar */}
        <aside className={`w-full ${collapsed ? "lg:w-20" : "lg:w-50"} lg:h-screen lg:sticky lg:top-0 border-r border-slate-100 p-3 lg:p-4 bg-white transition-all duration-300`}>

          <div className="mb-8 mt-2">
            <h2 className="text-lg text-center font-extrabold tracking-tight text-[#0E94A5]">
              {collapsed ? "MP" : "My Profile"}
            </h2>
            <p className="text-[10px] text-center text-slate-400 font-bold  tracking-[0.2em] mt-1">manage your details here</p>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 bg-gray-100 rounded-md hover:bg-slate-100"
              >
                <ChevronLeft
                  size={16}
                  className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            <div className="border-t border-20-black"></div>
          </div>

          <nav className="space-y-1.5">

            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-2.5 rounded-xl transition-all ${activeTab === tab.id
                    ? "bg-[#0E94A5]/10 text-[#0E94A5]"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <div className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-2"}`}>
                    <Icon size={16} />
                    {!collapsed && (
                      <span className="text-[11px] font-semibold">{tab.label}</span>
                    )}
                  </div>
                  {activeTab === tab.id && <ChevronLeft size={12} />}
                </button>
              );
            })}
          </nav>


        </aside>

        {/* Form Content Area */}
        <main className="flex-1 bg-cyan-100/20 p-6 lg:p-12">

          {/* Header Row */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 max-w-4xl">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTabLabel}
              </h1>
              <p className="text-sm  text-slate-400 font-medium">You can update your details.</p>
              <div className="border-t border-20-black"></div>
            </div>


            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-bold hover:bg-slate-200 transition-all"
                >
                  <X size={12} /> Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleEdit}
                className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-sm ${isEditing
                  ? "bg-[#0E94A5] text-white hover:bg-[#087a87]"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {isEditing ? (
                  <> <Save size={14} /> Save Changes </>
                ) : (
                  <> <Edit3 size={14} /> Edit Profile </>
                )}
              </button>
            </div>
          </header>

          <form className="space-y-10 max-w-4xl" onSubmit={(e) => e.preventDefault()}>

            {/* Profile Photo Section */}
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col md:flex-row gap-8 items-center border-b border-slate-200/60 pb-8">
                <div className="relative">
                  <div className="w-28 h-28 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
                    {profile.photo || profile.profileImage ? (
                      <img
                        src={
                          profile.photo
                            ? URL.createObjectURL(profile.photo)
                            : getMediaUrl(profile.profileImage)
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-slate-200" />
                    )}
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h3 className="text-base font-bold text-slate-900">Your Photo</h3>
                  <p className="text-[11px] text-slate-400 mb-4 max-w-xs leading-relaxed">This photo will be used for your student ID card and official records.</p>
                  {isEditing && (
                    <div className="flex justify-center md:justify-start gap-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-[#0E94A5] text-white text-[11px] font-bold rounded-lg cursor-pointer hover:bg-[#087a87] transition-all shadow-md">
                        <Camera size={14} />
                        Upload New
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            handleChange("photo", e.target.files[0])
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          handleChange("profileImage", null);
                          handleChange("photo", null);
                          handleChange("removeImage", true); // ✅ MAIN FIX
                        }}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Dynamic Content Sections */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">

              {/* IDENTITY TAB */}
              {activeTab === "personal" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">First Name</label>
                      <input
                        disabled={!isEditing}
                        className={`w-full py-2 bg-transparent border-b transition-all text-lg font-black text-slate-800 focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-transparent"}`}
                        value={profile.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Last Name</label>
                      <input
                        disabled={!isEditing}
                        className={`w-full py-2 bg-transparent border-b transition-all text-lg font-black text-slate-800 focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-transparent"}`}
                        value={profile.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Father's Name</label>
                      <input
                        disabled={!isEditing}
                        className={`w-full py-2 bg-transparent border-b transition-all font-bold text-sm text-slate-700 focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                        value={profile.fatherName}
                        onChange={(e) => handleChange("fatherName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Mother's Name</label>
                      <input
                        disabled={!isEditing}
                        className={`w-full py-2 bg-transparent border-b transition-all font-bold text-sm text-slate-700 focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                        value={profile.motherName}
                        onChange={(e) => handleChange("motherName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Date of Birth</label>
                      <input
                        disabled={!isEditing}
                        type="date"
                        className={`w-full py-2 bg-transparent border-b transition-all font-bold text-sm text-slate-700 focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                        value={profile.dob}
                        onChange={(e) => handleChange("dob", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Gender</label>
                      <select
                        disabled={!isEditing}
                        className={`w-full py-2 bg-transparent border-b transition-all font-bold text-sm text-slate-700 focus:outline-none appearance-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                        value={profile.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTACT TAB */}
              {activeTab === "contact" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Student Phone</label>
                      <div className="flex items-center gap-2 border-b transition-all pb-1 focus-within:border-[#0E94A5]">
                        <Phone size={12} className="text-slate-300" />
                        <input
                          disabled={!isEditing}
                          className="w-full bg-transparent font-bold text-sm text-slate-700 focus:outline-none"
                          value={profile.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Parent Phone</label>
                      <div className="flex items-center gap-2 border-b transition-all pb-1 focus-within:border-[#0E94A5]">
                        <Users size={12} className="text-slate-300" />
                        <input
                          disabled={!isEditing}
                          className="w-full bg-transparent font-bold text-sm text-slate-700 focus:outline-none"
                          value={profile.parentPhone}
                          onChange={(e) => handleChange("parentPhone", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Official Email</label>
                      <div className="flex items-center gap-2 border-b transition-all pb-1">
                        <Mail size={12} className="text-slate-300" />
                        <input
                          disabled={true}
                          className="w-full bg-transparent font-bold text-sm text-slate-400 cursor-not-allowed"
                          value={profile.email}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Alternate Email</label>
                      <div className="flex items-center gap-2 border-b transition-all pb-1 focus-within:border-[#0E94A5]">
                        <Mail size={12} className="text-slate-300" />
                        <input
                          disabled={!isEditing}
                          className="w-full bg-transparent font-bold text-sm text-slate-700 focus:outline-none"
                          value={profile.altEmail}
                          onChange={(e) => handleChange("altEmail", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACADEMIC TAB */}
              {activeTab === "academic" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="space-y-6">
                    <div className="space-y-2 max-w-sm">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">
                        Enrolled Class
                      </label>

                      <div className="text-lg font-black text-slate-800 flex items-center gap-1">

                        {/* Class Number */}
                        <span>
                          {className || "-"}
                          <sup className="text-[10px] ml-0.5 align-super">
                            {className % 100 >= 11 && className % 100 <= 13
                              ? "th"
                              : className % 10 === 1
                                ? "st"
                                : className % 10 === 2
                                  ? "nd"
                                  : className % 10 === 3
                                    ? "rd"
                                    : "th"}
                          </sup>
                        </span>

                        {/* Section */}
                        {profile.section && (
                          <span className="text- font-bold text-slate-800 ml-1">
                            -{" "}{profile.section}
                          </span>
                        )}

                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Profile Bio</label>
                      <textarea
                        disabled={!isEditing}
                        rows={2}
                        className={`w-full px-4 py-3 rounded-2xl transition-all font-medium text-sm text-slate-700 leading-relaxed focus:outline-none ${isEditing ? "bg-white border border-[#0E94A5]/20 shadow-sm" : "bg-white/50 border border-transparent"}`}
                        placeholder="Write something about yourself..."
                        value={profile.shortBio}
                        onChange={(e) => handleChange("shortBio", e.target.value)}
                      />
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Subject Proficiency</label>
                        {isEditing && (
                          <button onClick={addSkill} className="text-[8px] font-black text-[#0E94A5] flex items-center gap-1 uppercase bg-white px-2 py-0.5 rounded border border-teal-100">
                            <Plus size={10} /> Add Row
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {profile.skills.map((skill, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <input
                              disabled={!isEditing}
                              className={`flex-1 py-1 bg-transparent border-b transition-all font-bold text-sm text-slate-700 focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                              placeholder="Subject"
                              value={skill.name}
                              onChange={(e) => handleSkillChange(index, "name", e.target.value)}
                            />
                            <input
                              disabled={!isEditing}
                              type="number"
                              className={`w-12 py-1 bg-transparent border-b transition-all text-right font-black text-sm text-[#0E94A5] focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                              value={skill.expertise}
                              onChange={(e) => handleSkillChange(index, "expertise", e.target.value)}
                            />
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleChange("profileImage", null);
                                  handleChange("photo", null);

                                  // 🔥 ADD THIS
                                  handleChange("removeImage", true);
                                }}
                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LOCATION TAB */}
              {activeTab === "location" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Residential Address</label>
                      <input
                        disabled={!isEditing}
                        className={`w-full py-2 bg-transparent border-b transition-all font-bold text-sm text-slate-700 focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                        value={profile.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">Caste Category</label>
                      <select
                        disabled={!isEditing}
                        className={`w-full py-2 bg-transparent border-b transition-all font-bold text-sm text-slate-700 focus:outline-none appearance-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                        value={profile.category}
                        onChange={(e) => handleChange("category", e.target.value)}
                      >
                        <option value="general">General</option>
                        <option value="obc">OBC</option>
                        <option value="sc">SC</option>
                        <option value="st">ST</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#0E94A5]">City</label>
                      <input
                        onChange={(e) => handleChange("city", e.target.value)}
                        disabled={!isEditing}
                        className="w-full py-2 bg-transparent border-b border-transparent font-bold text-sm text-slate-700 focus:outline-none"
                        value={profile.city || ""}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SOCIAL TAB */}
              {activeTab === "social" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 gap-6 max-w-xl">
                    {[
                      { id: "linkedin", icon: Linkedin, label: "LinkedIn", color: "text-[#0077b5]", bg: "bg-[#0077b5]/5" },
                      { id: "instagram", icon: Instagram, label: "Instagram", color: "text-[#e1306c]", bg: "bg-[#e1306c]/5" },
                      { id: "twitter", icon: Twitter, label: "Twitter", color: "text-slate-900", bg: "bg-slate-900/5" },
                    ].map((platform) => {
                      const SocialIcon = platform.icon;
                      return (
                        <div key={platform.id} className="flex items-center gap-6 group">
                          <div className={`p-3.5 rounded-2xl ${platform.bg} ${platform.color}`}>
                            <SocialIcon size={18} />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <label className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">{platform.label}</label>
                            <input
                              disabled={!isEditing}
                              className={`w-full py-1.5 bg-transparent border-b transition-all font-bold text-sm text-slate-700 focus:outline-none ${isEditing ? "border-[#0E94A5]" : "border-slate-100"}`}
                              placeholder="Profile Link..."
                              value={profile.social[platform.id]}
                              onChange={(e) => handleSocialChange(platform.id, e.target.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Support Info */}
            <div className="pt-8 mt-4 border-t border-slate-200/60 flex items-center gap-2 text-slate-300">
              <div className="h-1 w-1 rounded-full bg-slate-300 animate-pulse"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em]">Contact Student Support for identity verification.</p>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default Page;