"use client";

import React, { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  UserPlus, ShieldCheck, User, Phone, 
  Settings2, BookOpen, MapPin, Camera, 
  UploadCloud, X, AlertTriangle 
} from "lucide-react";

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
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
    if (isOpen) {
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
      // Reset form on open
      setForm({
        roleName: "user",
        name: "", email: "", password: "", phone: "",
        firstName: "", lastName: "", fatherName: "", motherName: "",
        parentPhone: "", dateOfBirth: "", gender: "", address: "",
        category: "", course: "", section: "", photo: null,
      });
      setPhotoPreview(null);
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

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

    if (name === "course") {
      const filtered = allClasses.filter((c) => c.className === value);
      const uniqueSections = [
        ...new Map(filtered.map((sec) => [sec.section, sec])).values(),
      ].sort((a, b) => a.section.localeCompare(b.section));

      setSections(uniqueSections);
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setShowErrorDialog(true);
      return;
    }

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
      if (onUserAdded) onUserAdded();
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong while creating the user.");
      setShowErrorDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles = "bg-background dark:bg-slate-900/80 border-border dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-md transition-all shadow-sm text-sm h-9 text-foreground dark:text-slate-100 placeholder:dark:text-slate-400";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card dark:bg-slate-800/80 dark:backdrop-blur-xl p-4 md:p-6 rounded-lg border-border dark:border-slate-700 shadow-2xl [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/80">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Create New User
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Add a new student, instructor, or administrator.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-6 mt-4">
            
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Assign Role
              </h2>
              <div className="max-w-xs">
                <Select
                  value={form.roleName}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, roleName: value }))}
                >
                  <SelectTrigger className={`h-9 bg-background dark:bg-slate-900/80 ${inputStyles}`}>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md shadow-md border-border">
                    <SelectItem value="user">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              {form.roleName === "user" ? (
                <div className="space-y-6">
                  
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input name="firstName" value={form.firstName} placeholder="First Name" onChange={onChange} className={inputStyles} />
                      <Input name="lastName" value={form.lastName} placeholder="Last Name" onChange={onChange} className={inputStyles} />
                      <Input name="fatherName" value={form.fatherName} placeholder="Father's Name" onChange={onChange} className={inputStyles} />
                      <Input name="motherName" value={form.motherName} placeholder="Mother's Name" onChange={onChange} className={inputStyles} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" /> Contact Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input name="phone" value={form.phone} placeholder="Student Phone (10 Digits)" onChange={onChange} className={inputStyles} />
                      <Input name="parentPhone" value={form.parentPhone} placeholder="Parent Phone (10 Digits)" onChange={onChange} className={inputStyles} />
                      <Input type="email" name="email" value={form.email} placeholder="Email Address" onChange={onChange} className={`md:col-span-2 ${inputStyles}`} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-primary" /> Personal Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} className={inputStyles} />
                      
                      <Select value={form.gender} onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}>
                        <SelectTrigger className={`h-9 ${inputStyles}`}>
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-border shadow-md">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={form.category} onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}>
                        <SelectTrigger className={`h-9 ${inputStyles}`}>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-border shadow-md">
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="obc">OBC</SelectItem>
                          <SelectItem value="sc">SC</SelectItem>
                          <SelectItem value="st">ST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" /> Academic Enrollment
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select
                        value={form.course}
                        onValueChange={(value) => {
                          setForm((prev) => ({ ...prev, course: value }));
                          const filtered = allClasses.filter((c) => String(c.className) === value);
                          const uniqueSections = [...new Map(filtered.map((sec) => [sec.section, sec])).values()].sort((a, b) => a.section.localeCompare(b.section));
                          setSections(uniqueSections);
                        }}
                      >
                        <SelectTrigger className={`h-9 ${inputStyles}`}>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-border shadow-md" position="popper">
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
                        <SelectTrigger className={`h-9 ${inputStyles}`}>
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-border shadow-md">
                          {sections.map((sec) => (
                            <SelectItem key={sec._id} value={sec.section}>
                              Section {sec.section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Address
                      </h2>
                      <Input name="address" value={form.address} placeholder="Full Residential Address" onChange={onChange} className={inputStyles} />
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-primary" /> Profile Photo
                      </h2>
                      <div className="flex items-center gap-4">
                        {photoPreview ? (
                          <div className="relative">
                            <img src={photoPreview} alt="preview" className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-sm" />
                            <button
                              type="button"
                              onClick={() => { setPhotoPreview(null); setForm((prev) => ({ ...prev, photo: null })); }}
                              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/90 transition-colors shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full border border-dashed border-border bg-muted/50 flex items-center justify-center text-muted-foreground">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <label className="cursor-pointer bg-transparent border border-primary px-3 py-1.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10 transition-all shadow-sm flex items-center gap-2">
                          <UploadCloud className="w-4 h-4" />
                          {photoPreview ? "Change Photo" : "Upload Photo"}
                          <input type="file" name="photo" accept="image/*" onChange={onChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-foreground border-b border-border pb-1.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Credentials
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-0.5">Full Name</label>
                      <Input name="name" value={form.name} placeholder="John Doe" onChange={onChange} className={inputStyles} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-0.5">Email Address</label>
                      <Input type="email" name="email" value={form.email} placeholder="john@example.com" onChange={onChange} className={inputStyles} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-0.5">Temporary Password</label>
                      <Input type="password" name="password" value={form.password} placeholder="••••••••" onChange={onChange} className={inputStyles} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground ml-0.5">Phone Number</label>
                      <Input name="phone" value={form.phone} placeholder="10 Digit Phone Number" onChange={onChange} className={inputStyles} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-md shadow-sm text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-md shadow-sm transition-all text-sm"
              >
                {submitting ? "Processing..." : `Create ${form.roleName === "user" ? "Student" : form.roleName.charAt(0).toUpperCase() + form.roleName.slice(1)}`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="rounded-lg border-border dark:border-slate-700 bg-card dark:bg-slate-800/80 dark:backdrop-blur-xl z-[100] shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Success
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              {success || "User account has been successfully created and added to the system."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 text-sm"
              onClick={() => {
                setShowSuccessDialog(false);
                onClose(); // Close the modal on success
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="rounded-lg border-border dark:border-slate-700 bg-card dark:bg-slate-800/80 dark:backdrop-blur-xl z-[100] shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Validation Error
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              {error || "An error occurred while trying to process your request."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-muted hover:bg-muted/80 text-foreground rounded-md px-4 text-sm border border-border"
              onClick={() => setShowErrorDialog(false)}
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
