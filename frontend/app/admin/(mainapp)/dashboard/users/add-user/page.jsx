"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminServices } from "@/services/admin/admin.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { 
  UserPlus, ShieldCheck, User, Phone, 
  Settings2, BookOpen, MapPin, Camera, 
  UploadCloud, X, AlertTriangle 
} from "lucide-react";

const AddUsers = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    roleName: "user",

    // Admin / Instructor
    name: "",
    email: "",
    password: "",
    phone: "",

    // Student Fields
    firstName: "",
    lastName: "",
    fatherName: "",
    motherName: "",
    parentPhone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    category: "",
    course: "",
    section: "",
    photo: null,
  });

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [success, setSuccess] = useState("");
  const [allClasses, setAllClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await adminServices.getAllClasses();
        const data = Array.isArray(res) ? res : (res?.data || []);
        setAllClasses(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchClasses();
  }, []);

  /* HANDLE CHANGE */
  const onChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
      const file = files[0];
      setForm((prev) => ({ ...prev, photo: file }));
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    /* when class changes load sections */
    if (name === "course") {
      const filtered = allClasses.filter((c) => c.className === value);
      // remove duplicates + sort sections
      const uniqueSections = [
        ...new Map(filtered.map((sec) => [sec.section, sec])).values(),
      ].sort((a, b) => a.section.localeCompare(b.section));

      setSections(uniqueSections);
    }
  };

  /* CUSTOM STRICT VALIDATION ENGINE */
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Strict 10-digit phone number check
    const phoneRegex = /^[0-9]{10}$/;

    if (form.roleName === "user") {
      if (!form.firstName.trim()) return "First Name is required.";
      if (!form.lastName.trim()) return "Last Name is required.";
      
      if (!form.phone.trim()) return "Student Phone Number is required.";
      if (!phoneRegex.test(form.phone.trim())) return "Invalid Student Phone Number. Must be exactly 10 digits.";
      
      if (form.parentPhone && !phoneRegex.test(form.parentPhone.trim())) return "Invalid Parent Phone Number. Must be exactly 10 digits.";
      
      if (!form.email.trim()) return "Email Address is required.";
      if (!emailRegex.test(form.email.trim())) return "Invalid Email Address format.";
      
      if (!form.dateOfBirth) return "Date of Birth is required.";
      const dob = new Date(form.dateOfBirth);
      if (dob >= new Date()) return "Date of Birth must be a valid past date.";
      
      if (!form.gender) return "Gender selection is required.";
      if (!form.course) return "Academic Class selection is required.";
      if (!form.section) return "Academic Section selection is required.";
      
      if (!form.photo) return "Profile Photo MUST be uploaded.";
      
    } else {
      if (!form.name.trim()) return "Full Name is required.";
      
      if (!form.email.trim()) return "Email Address is required.";
      if (!emailRegex.test(form.email.trim())) return "Invalid Email Address format.";
      
      if (!form.password) return "Temporary Password is required.";
      if (form.password.length < 6) return "Password must be at least 6 characters long.";
      
      if (form.phone && !phoneRegex.test(form.phone.trim())) return "Invalid Phone Number. Must be exactly 10 digits.";
    }

    return null; // Return null if no errors found
  };

  /* HANDLE SUBMIT */
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Run Validations (Triggers Modal if fails)
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setShowErrorDialog(true);
      return;
    }

    // 2. Process Submission
    setSubmitting(true);
    setError("");
    setShowErrorDialog(false);
    setSuccess("");
    try {
      if (form.roleName === "user") {
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
          if (form[key]) {
            formData.append(key, form[key]);
          }
        });
        const res = await adminServices.createStudent(formData);
        setSuccess(res?.data?.message || "Student created successfully");
      } else {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          roleName: form.roleName,
        };
        const res = await adminServices.createUser(payload);
        setSuccess(res?.data?.message || "User created successfully");
      }
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong while creating the user.");
      setShowErrorDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Shared Flat Input Styles (White inputs popping off the slate background)
  const inputStyles = "bg-white border-slate-200 focus:border-[#178F9E] focus:ring-2 focus:ring-[#178F9E]/20 rounded-xl transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans pb-24">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* HEADER AREA */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#178F9E]/10 flex items-center justify-center text-[#178F9E]">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Create New User
            </h1>
            <p className="text-base text-slate-500 mt-1">
              Add a new student, instructor, or administrator to the platform.
            </p>
          </div>
        </div>

        {/* FLAT FORM LAYOUT (No Cards) */}
        <form onSubmit={onSubmit} className="space-y-10">
          
          {/* SUCCESS MESSAGE INLINE */}
          {success && (
            <div className={`p-4 rounded-xl text-sm font-medium bg-teal-50 text-[#178F9E]`}>
              {success}
            </div>
          )}

          {/* ==========================================
              ROLE SELECTION
              ========================================== */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#178F9E]" /> Assign Role
            </h2>
            <div className="max-w-sm">
              <Select
                value={form.roleName}
                onValueChange={(value) => setForm((prev) => ({ ...prev, roleName: value }))}
              >
                <SelectTrigger className={`h-12 bg-white ${inputStyles}`}>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-slate-200">
                  <SelectItem value="user">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ==========================================
              DYNAMIC FORM FIELDS
              ========================================== */}
          <div>
            {form.roleName === "user" ? (
              // ----------------------------------------
              // STUDENT FORM
              // ----------------------------------------
              <div className="space-y-10">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#178F9E]" /> Basic Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Input name="firstName" placeholder="First Name" onChange={onChange} className={inputStyles} />
                    <Input name="lastName" placeholder="Last Name" onChange={onChange} className={inputStyles} />
                    <Input name="fatherName" placeholder="Father's Name" onChange={onChange} className={inputStyles} />
                    <Input name="motherName" placeholder="Mother's Name" onChange={onChange} className={inputStyles} />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#178F9E]" /> Contact Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Input name="phone" placeholder="Student Phone Number (10 Digits)" onChange={onChange} className={inputStyles} />
                    <Input name="parentPhone" placeholder="Parent Phone Number (10 Digits)" onChange={onChange} className={inputStyles} />
                    <Input type="email" name="email" placeholder="Email Address" onChange={onChange} className={`md:col-span-2 ${inputStyles}`} />
                  </div>
                </div>

                {/* Personal Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-[#178F9E]" /> Personal Details
                  </h2>
                  <div className="grid md:grid-cols-3 gap-5">
                    <Input type="date" name="dateOfBirth" onChange={onChange} className={inputStyles} />
                    
                    <Select value={form.gender} onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}>
                      <SelectTrigger className={`h-10 ${inputStyles}`}>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                      <SelectTrigger className={`h-10 ${inputStyles}`}>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="obc">OBC</SelectItem>
                        <SelectItem value="sc">SC</SelectItem>
                        <SelectItem value="st">ST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Academic Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#178F9E]" /> Academic Enrollment
                  </h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Select
                      value={form.course}
                      onValueChange={(value) => {
                        setForm((prev) => ({ ...prev, course: value }));
                        const filtered = allClasses.filter((c) => String(c.className) === value);
                        const uniqueSections = [...new Map(filtered.map((sec) => [sec.section, sec])).values()].sort((a, b) => a.section.localeCompare(b.section));
                        setSections(uniqueSections);
                      }}
                    >
                      <SelectTrigger className={`h-10 ${inputStyles}`}>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg" position="popper">
                        {[...new Map(allClasses.map((c) => [c.className, c])).values()]
                          .sort((a, b) => Number(a.className) - Number(b.className))
                          .map((cls) => (
                            <SelectItem key={cls.className} value={String(cls.className)}>
                              Class {cls.className}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Select value={form.section} onValueChange={(value) => setForm((prev) => ({ ...prev, section: value }))}>
                      <SelectTrigger className={`h-10 ${inputStyles}`}>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                        {sections.map((sec) => (
                          <SelectItem key={sec._id} value={sec.section}>
                            Section {sec.section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address & Photo */}
                <div className="grid md:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#178F9E]" /> Address
                    </h2>
                    <Input name="address" placeholder="Full Residential Address" onChange={onChange} className={inputStyles} />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-[#178F9E]" /> Profile Photo
                    </h2>
                    <div className="flex items-center gap-5">
                      {photoPreview ? (
                        <div className="relative">
                          <img src={photoPreview} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#178F9E] shadow-md" />
                          <button
                            type="button"
                            onClick={() => { setPhotoPreview(null); setForm((prev) => ({ ...prev, photo: null })); }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <label className="cursor-pointer bg-white border border-[#178F9E] px-5 py-2.5 rounded-xl text-sm font-medium text-[#178F9E] hover:bg-[#178F9E] hover:text-white transition-all shadow-sm flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" />
                        {photoPreview ? "Change Photo" : "Upload Photo"}
                        <input type="file" name="photo" accept="image/*" onChange={onChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ----------------------------------------
              // ADMIN / INSTRUCTOR FORM
              // ----------------------------------------
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#178F9E]" /> Credentials
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                    <Input name="name" placeholder="John Doe" onChange={onChange} className={inputStyles} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                    <Input type="email" name="email" placeholder="john@example.com" onChange={onChange} className={inputStyles} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Temporary Password</label>
                    <Input type="password" name="password" placeholder="••••••••" onChange={onChange} className={inputStyles} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                    <Input name="phone" placeholder="10 Digit Phone Number" onChange={onChange} className={inputStyles} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER / SUBMIT BUTTON */}
          <div className="pt-8 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#178F9E] hover:bg-[#0F6F7C] text-white font-bold px-10 py-6 rounded-xl shadow-lg shadow-[#178F9E]/20 transition-all text-lg"
            >
              {submitting ? "Processing..." : `Create ${form.roleName === "user" ? "Student" : form.roleName.charAt(0).toUpperCase() + form.roleName.slice(1)}`}
            </Button>
          </div>
        </form>

        {/* SUCCESS MODAL */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent className="rounded-2xl border-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#178F9E] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Success
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-base">
                {success || "User account has been successfully created and added to the system."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                className="bg-[#178F9E] hover:bg-[#0F6F7C] rounded-xl px-6"
                onClick={() => {
                  setShowSuccessDialog(false);
                  router.push("/admin/dashboard/users");
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ERROR MODAL (Popping from top via standard Shadcn behavior) */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent className="rounded-2xl border-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Validation Error
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-base">
                {error || "An error occurred while trying to process your request. Please check your inputs."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6"
                onClick={() => setShowErrorDialog(false)}
              >
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default AddUsers;