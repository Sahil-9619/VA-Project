"use client";

import { motion, AnimatePresence } from "framer-motion";
import Nav from "../sections/Nav";
import Footer from "../sections/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { registrationService } from "@/services/user/registration.service";
import { useSelector } from "react-redux";
import { adminServices } from "@/services/admin/admin.service";
import { ArrowBigRight } from "lucide-react";

export default function AdmissionPage() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
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
    photo: null,
    preview: null,
    hostel: false,
    transport: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [feeComponents, setFeeComponents] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  // ✅ FIX: derive fees directly from feeComponents (no separate extraFees object needed)
  const registrationFee =
    feeComponents.find((f) => f.name === "admission")?.amount || 0;

  const hostelFeeAmount =
    feeComponents.find((f) => f.name === "hostel")?.amount || 0;

  const transportFeeAmount =
    feeComponents.find((f) => f.name === "transport")?.amount || 0;

  const totalFee = feeComponents.reduce((sum, item) => {
    if (item.name === "hostel" && !formData.hostel) return sum;
    if (item.name === "transport" && !formData.transport) return sum;
    return sum + item.amount;
  }, 0);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;

    const fullName = user.name || "";
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const userClass = user.course || user.class || "";

    setFormData((prev) => ({
      ...prev,
      email: user.email || "",
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      phone: user.phone || prev.phone,
      fatherName: user.fatherName || prev.fatherName,
      course: userClass || prev.course,
    }));

    if (userClass) {
      getClassAndFetchFee(userClass);
    }
  }, [user]);

  const getClassAndFetchFee = async (className) => {
    try {
      const classRes = await adminServices.getAllClasses();
      const classes = classRes?.data || [];
      const foundClass = classes.find(
        (cls) => String(cls.className) === String(className)
      );
      if (!foundClass) return;
      fetchClassFee(foundClass._id);
    } catch (err) {
      console.error("Error fetching class:", err);
    }
  };

  const fetchClassFee = async (classId) => {
    try {
      const res = await adminServices.getClassFeeByClass(classId);
      const components = res?.data?.feeComponents || [];
      setFeeComponents(components);
    } catch (err) {
      console.error("Error fetching fees:", err);
    }
  };

  // ✅ FIXED handleSubmit — extraFees removed, uses derived values
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        // skip preview (blob URL, not needed by backend)
        if (key === "preview") return;

        if (key === "dob") {
          payload.append("dateOfBirth", formData[key]);
        } else if (key === "photo") {
          // only append if a file was actually selected
          if (formData.photo) {
            payload.append("photo", formData.photo);
          }
        } else {
          payload.append(key, formData[key]);
        }
      });

      // ✅ FIX: use derived fee amounts instead of undefined extraFees
      payload.append("hostelFee", formData.hostel ? hostelFeeAmount : 0);
      payload.append("transportFee", formData.transport ? transportFeeAmount : 0);
      payload.append("totalFee", totalFee);

      const res = await registrationService.registerStudent(payload);

      setSuccess("Student registered successfully!");

      setTimeout(() => {
        router.push("/admission/registered");
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (["firstName", "lastName", "fatherName", "motherName"].includes(name)) {
      if (/[^a-zA-Z\s]/.test(value)) return;
    }

    if (["phone", "parentPhone"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
      setFieldErrors((prev) => ({
        ...prev,
        [name]:
          value.length > 0 && value.length < 10
            ? "Phone number must be 10 digits"
            : "",
      }));
    }

    if (name === "altEmail") {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setError("Invalid alternate email");
      } else {
        setError("");
      }
    }

    if (name === "dob") {
      const today = new Date().toISOString().split("T")[0];
      if (value > today) {
        setError("DOB cannot be a future date");
        return;
      } else {
        setError("");
      }
    }

    if (type === "file") {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          photo: file,
          preview: URL.createObjectURL(file),
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ====== VALIDATION ====== */
  const isStep1Valid =
    /^[A-Za-z\s]+$/.test(formData.firstName) &&
    /^[A-Za-z\s]+$/.test(formData.lastName) &&
    /^[A-Za-z\s]+$/.test(formData.fatherName) &&
    /^[A-Za-z\s]+$/.test(formData.motherName) &&
    /^\d{10}$/.test(formData.phone) &&
    /^\d{10}$/.test(formData.parentPhone) &&
    formData.email &&
    (!formData.altEmail ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.altEmail)) &&
    formData.dob &&
    new Date(formData.dob) <= new Date();

  const isStep2Valid = formData.address && formData.category;
  const isStep3Valid = formData.course;

  const nextStep = () => {
    if (
      (step === 1 && isStep1Valid) ||
      (step === 2 && isStep2Valid) ||
      (step === 3 && isStep3Valid) ||
      (step === 4 && acceptedTerms) ||
      step === 5
    ) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <main className="bg-[#F4FDFE] text-slate-700 min-h-screen">
      {/* HERO */}
      <section className="pt-18 pb-16 bg-[#0F6F7C] text-white text-center">
        <h1 className="text-5xl font-bold text-primary-foreground">
          Admission Registration {new Date().getFullYear()}
        </h1>
        <p className="text-lg mt-5">
          Class {formData.course} Admission Fee:
          <strong>
            {registrationFee ? ` ₹${registrationFee}` : " Loading..."}
          </strong>
        </p>
      </section>

      {/* PROGRESS BAR */}
      <div className="w-full h-2 bg-[#178F9E]/20">
        <motion.div
          animate={{ width: `${(step / 5) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-[#178F9E]"
        />
      </div>

      {/* FORM */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto overflow-hidden">
          <AnimatePresence mode="wait">

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-[#0F6F7C]">
                  Fill Personal Details
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                  <Input label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                  <Input label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} />
                  <Input label="Student Phone" name="phone" value={formData.phone} onChange={handleChange} error={fieldErrors.phone} />
                  <Input label="Parent Phone" name="parentPhone" value={formData.parentPhone} onChange={handleChange} error={fieldErrors.parentPhone} />
                  <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} readOnly />
                  <Input label="Alternate Email (optional)" name="altEmail" type="email" value={formData.altEmail} onChange={handleChange} />
                  <Input label="Date of Birth" name="dob" type="date" value={formData.dob} max={new Date().toISOString().split("T")[0]} onChange={handleChange} />
                  <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-center justify-between pt-12 gap-4 flex-wrap">
                  <p className="text-xs text-gray-800 max-w-md">
                    Name is fetched from your account (not editable here). You can update it in <strong>My Profile</strong>.
                  </p>
                  <div className="relative group">
                    <motion.button
                      whileHover={isStep1Valid ? { scale: 1.05 } : {}}
                      whileTap={isStep1Valid ? { scale: 0.95 } : {}}
                      disabled={!isStep1Valid}
                      onClick={nextStep}
                      className={`px-10 py-3 font-semibold rounded-full shadow-md transition-all duration-300 ${
                        isStep1Valid
                          ? "bg-[#178F9E] text-white hover:bg-[#0F6F7C]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Next →
                    </motion.button>
                    {!isStep1Valid && (
                      <div className="absolute bottom-full mb-2 left-1/4 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-700 text-white text-xs px-3 py-1 rounded-md whitespace-nowrap shadow-lg">
                        Please fill all required details!
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-[#0F6F7C]">
                  Address & Category
                </h2>
                <Textarea label="Residential Address" name="address" value={formData.address} onChange={handleChange} />
                <div>
                  <label className="block mb-2 text-[#0F6F7C] font-medium">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="input">
                    <option value="">Select Category</option>
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                  </select>
                </div>
                <div className="flex justify-between pt-12">
                  <AnimatedBack prevStep={prevStep} />
                  <AnimatedNext nextStep={nextStep} disabled={!isStep2Valid} />
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-[#0F6F7C]">
                  Select Class & Photo
                </h2>
                <Input label="Selected Class" name="course" value={`Class ${formData.course}`} readOnly />
                <div className="flex flex-wrap gap-6 mt-4 items-center">
                  <h1 className="text-[#0F6F7C] flex items-center gap-2 font-semibold">
                    Select optional services: <ArrowBigRight size={20} />
                  </h1>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hostel}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, hostel: e.target.checked }))
                      }
                    />
                    Hostel Fee {hostelFeeAmount ? `(₹${hostelFeeAmount})` : ""}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.transport}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, transport: e.target.checked }))
                      }
                    />
                    Transport Fee {transportFeeAmount ? `(₹${transportFeeAmount})` : ""}
                  </label>
                </div>
                <div className="space-y-4">
                  <label className="block font-semibold text-[#0F6F7C]">Upload Your Photo</label>
                  <div className="flex items-center gap-6">
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-[#0F6F7C] px-6 py-3 rounded-lg font-medium transition-all duration-300">
                      Choose File
                      <input type="file" accept="image/*" name="photo" onChange={handleChange} className="hidden" />
                    </label>
                    {formData.photo && (
                      <span className="text-sm text-slate-500">{formData.photo.name}</span>
                    )}
                  </div>
                  {formData.preview && (
                    <div className="mt-4">
                      <img
                        src={formData.preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border border-[#178F9E]/30 shadow-md"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-12">
                  <AnimatedBack prevStep={prevStep} />
                  <AnimatedNext nextStep={nextStep} disabled={!isStep3Valid} />
                </div>
              </motion.div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-[#0F6F7C] text-center">
                  Fee Breakdown & Confirmation
                </h2>
                <div className="w-full border border-gray-200 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-6 py-4 font-semibold text-gray-600 tracking-wide">Fee Details</th>
                        <th className="text-right px-6 py-4 font-semibold text-gray-600 tracking-wide">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeComponents.map((item) => {
                        if (item.name === "hostel" && !formData.hostel) return null;
                        if (item.name === "transport" && !formData.transport) return null;
                        return (
                          <tr key={item._id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-700 capitalize">{item.name} Fee</td>
                            <td className="px-6 py-4 text-right font-semibold">₹{item.amount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2">
                        <td className="px-6 py-5 text-base font-semibold text-gray-800">Total Amount</td>
                        <td className="px-6 py-5 text-right text-xl font-bold text-[#0F6F7C]">₹{totalFee}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <p className="text-sm">I agree to the Terms & Conditions and fee policy.</p>
                </div>
                <div className="flex justify-between pt-6">
                  <AnimatedBack prevStep={prevStep} />
                  <AnimatedNext nextStep={nextStep} disabled={!acceptedTerms} />
                </div>
              </motion.div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8 text-center"
              >
                <h2 className="text-2xl font-bold text-[#0F6F7C]">
                  Registration Fee Payment
                </h2>

                <p className="text-lg">
                  Admission Registration Fee:{" "}
                  <strong>
                    {registrationFee ? `₹${registrationFee}` : "Loading..."}
                  </strong>
                </p>

                {/* ✅ error / success feedback */}
                {error && (
                  <p className="text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-600 font-medium bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                    {success}
                  </p>
                )}

                {/* ✅ FIX: onClick calls handleSubmit directly (no event object needed) */}
                <motion.button
                  whileHover={!loading ? { scale: 1.07 } : {}}
                  whileTap={!loading ? { scale: 0.95 } : {}}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSubmit({ preventDefault: () => {} })}
                  className={`px-14 py-4 text-white font-bold text-lg rounded-full shadow-lg transition-all duration-300 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#178F9E] hover:bg-[#0F6F7C]"
                  }`}
                >
                  {loading
                    ? "Processing..."
                    : `Pay Securely → ₹${registrationFee || "..."}`}
                </motion.button>

                <div className="pt-2">
                  <AnimatedBack prevStep={prevStep} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ====== BUTTON COMPONENTS ====== */
function AnimatedNext({ nextStep, disabled }) {
  return (
    <div className="relative group">
      <motion.button
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        disabled={disabled}
        onClick={nextStep}
        className={`px-10 py-3 font-semibold rounded-full shadow-md transition-all duration-300 ${
          !disabled
            ? "bg-[#178F9E] text-white hover:bg-[#0F6F7C]"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Next →
      </motion.button>
      {disabled && (
        <div className="absolute bottom-full mb-2 left-1/4 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-700 text-white text-xs px-3 py-1 rounded-md whitespace-nowrap shadow-lg">
          Please fill all required details
        </div>
      )}
    </div>
  );
}

function AnimatedBack({ prevStep }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={prevStep}
      className="px-8 py-3 border-2 border-[#178F9E] text-[#0F6F7C] font-medium rounded-full hover:bg-[#178F9E]/10 transition-all duration-300"
    >
      ← Back
    </motion.button>
  );
}

/* ====== INPUT COMPONENTS ====== */
function Input({ label, name, type = "text", onChange, value, readOnly = false, error }) {
  const isNameField = name === "firstName" || name === "lastName";
  return (
    <div>
      <label className="block mb-2 text-[#0F6F7C] font-medium">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly || isNameField}
        className={`input ${isNameField ? "bg-gray-100 cursor-not-allowed" : ""} ${
          error ? "border-red-500 focus:ring-red-500" : ""
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function Textarea({ label, name, onChange, value }) {
  return (
    <div>
      <label className="block mb-2 text-[#0F6F7C] font-medium">{label}</label>
      <textarea name={name} rows="3" value={value} onChange={onChange} className="input" />
    </div>
  );
}