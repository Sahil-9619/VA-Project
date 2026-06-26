"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminServices } from "@/services/admin/admin.service";
import { toast } from "sonner";
import {
  Search, Banknote, Receipt, Lock, Unlock,
  GraduationCap, Building, Bus, FileText, Clock, Pencil, Save,
  CheckCircle2
} from "lucide-react";

export default function ClassFeeManagement() {
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [extraComponents, setExtraComponents] = useState([]);
  const [existingComponents, setExistingComponents] = useState([]);

  const [tuitionFee, setTuitionFee] = useState("");
  const [admissionFee, setAdmissionFee] = useState("");
  const [examFee, setExamFee] = useState("");
  const [hostelFee, setHostelFee] = useState("");
  const [transportFee, setTransportFee] = useState("");
  const [lateFeePerDay, setLateFeePerDay] = useState("");

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // 1. Fetch Classes on Mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await adminServices.getAllClasses();
        const data = res?.data || [];
        const uniqueClasses = [...new Map(data.map(item => [item.className, item])).values()];
        setClasses(uniqueClasses);
      } catch (err) {
        toast.error("Failed to load classes directory.");
      }
    };
    fetchClasses();
  }, []);

  // 2. Fetch Fee Data automatically when a Class is selected from the sidebar
  useEffect(() => {
    if (!classId) return;

    const fetchCurrentFee = async () => {
      setError("");
      setLoading(true);
      setDataFetched(false);

      try {
        const res = await adminServices.getClassFeeByClass(classId);
        const data = res?.data || res;

        const components = data.feeComponents || [];
        const getAmount = (name) =>
          components.find((f) => f.name === name)?.amount || "";

        setTuitionFee(getAmount("tuition"));
        setAdmissionFee(getAmount("admission"));
        setExamFee(getAmount("exam"));
        setHostelFee(getAmount("hostel"));
        setTransportFee(getAmount("transport"));
        setLateFeePerDay(data.lateFeePerDay || "");

        // 🔥 store existing
        setExistingComponents(components);

        // 🔥 extras
        const extras = components.filter(
          (c) =>
            !["tuition", "admission", "exam", "hostel", "transport"].includes(c.name)
        );

        setExtraComponents(extras);

        setEditing(false);
        setDataFetched(true);
      } catch (err) {
        // Reset if not found
        setTuitionFee("");
        setAdmissionFee("");
        setExamFee("");
        setHostelFee("");
        setTransportFee("");
        setLateFeePerDay("");
        setDataFetched(true);
        setEditing(true); // Auto-unlock for new entries
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentFee();
  }, [classId]);

  const mergeComponent = (name, newValue, type) => {
    const existing = existingComponents.find(c => c.name === name);

    return {
      name,
      amount:
        newValue !== "" && newValue !== null && newValue !== undefined
          ? Number(newValue)
          : existing?.amount || 0,
      type
    };
  };

  /* UPDATE FEE */
  const updateFee = async () => {
    if (!classId) return;
    try {
      let feeComponents = [
        mergeComponent("tuition", tuitionFee, "monthly"),
        mergeComponent("admission", admissionFee, "one-time"),
        mergeComponent("exam", examFee, "one-time"),
        mergeComponent("hostel", hostelFee, "monthly"),
        mergeComponent("transport", transportFee, "monthly"),

        ...extraComponents
          .filter(c => c.name)
          .map(c => ({
            name: c.name.trim().toLowerCase(),
            amount: Number(c.amount) || 0,
            type: c.type || "one-time"
          }))
      ];

      // remove duplicates
      const map = new Map();
      feeComponents.forEach(f => map.set(f.name, f));

      const payload = {
        classId,
        feeComponents: Array.from(map.values()),
        lateFeePerDay: Number(lateFeePerDay) || 0
      };
      try {
        await adminServices.updateClassFee(classId, payload);
      } catch (err) {
        if (err?.response?.data?.message === "Fee structure not found") {
          await adminServices.createFeeStructure(payload);
        } else {
          throw err;
        }
      }

      toast.success("Fee ledger updated successfully.");
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save fee structure.");
    }
  };

  // Calculations
  const extraTotal = extraComponents.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0
  );

  const totalFee =
    ((Number(tuitionFee) || 0)) +
    ((Number(hostelFee) || 0)) +
    ((Number(transportFee) || 0)) +
    (Number(admissionFee) || 0) +
    (Number(examFee) || 0) +
    extraTotal;

  const sortedClasses = [...classes]
    .filter((c) =>
      String(c.className).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => Number(a.className) - Number(b.className));

  const addComponent = () => {
    setExtraComponents([
      ...extraComponents,
      { name: "", amount: 0, type: "one-time" }
    ]);
  };

  const removeComponent = (index) => {
    const updated = [...extraComponents];
    updated.splice(index, 1);
    setExtraComponents(updated);
  };

  const updateComponent = (index, field, value) => {
    const updated = [...extraComponents];
    updated[index][field] = value;
    setExtraComponents(updated);
  };

  const allComponents = [
    {
      label: "Annual Tuition Fee",
      value: tuitionFee,
      setValue: setTuitionFee,
      icon: GraduationCap,
    },
    {
      label: "Admission / Registration Fee",
      value: admissionFee,
      setValue: setAdmissionFee,
      icon: CheckCircle2,
    },
    {
      label: "Examination & Lab Fees",
      value: examFee,
      setValue: setExamFee,
      icon: FileText,
    },
    {
      label: "Hostel & Boarding Fee",
      value: hostelFee,
      setValue: setHostelFee,
      icon: Building,
    },
    {
      label: "Transport & Bus Fee",
      value: transportFee,
      setValue: setTransportFee,
      icon: Bus,
    },

    // EXTRA COMPONENTS ADD HERE
    ...extraComponents.map((comp, index) => ({
      label: comp.name || "Custom Fee",
      value: comp.amount,
      setValue: (val) => updateComponent(index, "amount", val),
      icon: FileText,
      isExtra: true,
      index,
    })),
  ];
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex flex-col md:flex-row font-sans border-t border-slate-100 overflow-hidden">

      {/* ====================================================
          LEFT PANE: DIRECTORY
          ==================================================== */}
      <div className={`w-full md:w-[320px] lg:w-[380px] flex-shrink-0 flex flex-col border-r border-slate-200 bg-slate-50/50 ${classId ? 'hidden md:flex' : 'flex'}`}>

        {/* Header & Search */}
        <div className="p-6 md:p-8 pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-6 flex items-center gap-3">
            <Banknote className="w-6 h-6 text-[#178F9E]" />
            Fee Management
          </h1>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#178F9E] transition-colors" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-[#178F9E] focus:ring-4 focus:ring-[#178F9E]/10 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
        </div>

        {/* Flat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-4">Select Class Ledger</h3>

          {sortedClasses.length === 0 ? (
            <div className="text-center p-6 text-slate-400 text-sm font-medium">
              No classes found.
            </div>
          ) : (
            sortedClasses.map((cls) => {
              const isActive = classId === cls._id;
              return (
                <button
                  key={cls._id}
                  onClick={() => setClassId(cls._id)}
                  className={`w-full text-left flex items-center justify-between px-5 py-3.5 rounded-xl transition-all relative ${isActive
                    ? "bg-[#178F9E] text-white shadow-md shadow-[#178F9E]/20"
                    : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <span className="text-base font-bold">
                    Class {cls.className}
                  </span>
                  {!isActive && (
                    <Receipt className="w-4 h-4 text-slate-300" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ====================================================
          RIGHT PANE: INVOICE/LEDGER VIEW
          ==================================================== */}
      <div className={`flex-1 flex flex-col bg-white relative min-w-0 ${!classId ? 'hidden md:flex' : 'flex'}`}>

        {classId ? (
          <>
            {/* Mobile Back Button */}
            <div className="md:hidden p-4 border-b border-slate-100 flex items-center flex-shrink-0">
              <button
                onClick={() => setClassId("")}
                className="text-sm bg-cyan-800 text-white p-2 rounded-xl font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 mt-5"
              >
                ← Back to Class List
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-[#178F9E] rounded-full animate-spin mb-4"></div>
                <p className="font-semibold tracking-wide">Retrieving ledger data...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Ledger Header */}
                <div className="px-8 md:px-16 pt-12 pb-8 border-b border-slate-100 flex-shrink-0 flex items-end justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${editing ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {editing ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {editing ? "Editing Mode" : "Locked & Active"}
                      </span>
                    </div>
                    {/* Academic Session has been removed, only showing the Class Name */}
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight truncate">
                      Class {String(classes.find((c) => c._id === classId)?.className ?? "")}
                    </h1>
                  </div>

                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#178F9E] bg-slate-50 hover:bg-[#178F9E]/10 px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
                    >
                      <Pencil className="w-4 h-4" /> Edit Ledger
                    </button>
                  )}
                </div>

                {allComponents.map((comp, i) => (
                  <div key={i} className="relative">

                    <LedgerRow
                      icon={comp.icon}
                      label={comp.label}
                      value={comp.value}
                      setValue={comp.setValue}
                      disabled={!editing}
                    />

                    {/* Extra name edit */}
                    {editing && comp.isExtra && (
                      <input
                        value={extraComponents[comp.index].name}
                        onChange={(e) =>
                          updateComponent(comp.index, "name", e.target.value)
                        }
                        placeholder="Component Name"
                        className="ml-14 mt-1 border px-2 py-1 rounded text-sm"
                      />
                    )}

                    {/* Remove button */}
                    {editing && comp.isExtra && (
                      <button
                        onClick={() => removeComponent(comp.index)}
                        className="absolute right-0 top-2 text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {editing && (
                  <button
                    onClick={addComponent}
                    className="mt-3 text-sm text-blue-600 font-bold"
                  >
                    + Add Fee Component
                  </button>
                )}

                {/* Sticky Summary & Save Footer */}
                <div className="bg-slate-900 border-t border-slate-200 px-8 md:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 flex-shrink-0 min-w-0">
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="hidden sm:flex w-12 h-12 rounded-full bg-white/10 items-center justify-center text-white flex-shrink-0">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 truncate">
                        Calculated Total
                      </p>
                      <div className="flex items-baseline min-w-0">
                        <span className="text-3xl font-black text-white tracking-tight mr-1">₹</span>
                        <p
                          className="text-3xl font-black text-white tracking-tight truncate max-w-[180px] md:max-w-[250px]"
                          title={totalFee.toLocaleString('en-IN')}
                        >
                          {totalFee.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {editing ? (
                    <div className="flex gap-3 w-full sm:w-auto flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditing(false);
                          setClassId(classId); // re-trigger fetch
                        }}
                        className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={updateFee}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-[#178F9E] hover:bg-[#0F6F7C] shadow-lg shadow-[#178F9E]/30 transition-all"
                      >
                        <Save className="w-5 h-5" /> Save Ledger
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="sm:hidden w-full flex items-center justify-center gap-2 text-base font-bold text-slate-900 bg-white border border-slate-200 px-6 py-3.5 rounded-xl transition-colors"
                    >
                      <Pencil className="w-5 h-5" /> Edit Ledger
                    </button>
                  )}
                </div>

              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6 text-slate-300">
              <Receipt className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No Class Selected</h3>
            <p className="text-slate-500 font-medium max-w-sm">
              Please select a class from the directory on the left to view, manage, and configure its financial ledger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOM INVOICE-STYLE ROW COMPONENT
   ========================================================= */
function LedgerRow({ icon: Icon, label, value, setValue, disabled, isPenalty = false }) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-2 gap-2 sm:gap-6 rounded-xl transition-colors hover:bg-slate-50 focus-within:bg-slate-50 px-2 sm:px-4 -mx-2 sm:-mx-4">

      {/* Label Side */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${disabled ? 'bg-slate-100 text-slate-400' : isPenalty ? 'bg-rose-50 text-rose-500' : 'bg-[#178F9E]/10 text-[#178F9E]'
          }`}>
          <Icon className="w-5 h-5" />
        </div>
        {/* FIX: Removed 'truncate' so long text fully displays and wraps normally */}
        <span className={`text-base font-bold whitespace-normal leading-tight ${isPenalty ? 'text-rose-600' : 'text-slate-700'}`}>
          {label}
        </span>
        {/* Decorative Dotted Line filler */}
        <div className="hidden sm:block flex-1 border-b-2 border-dotted border-slate-200 mx-4 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"></div>
      </div>

      {/* Input Side */}
      <div className="relative flex items-center w-full sm:w-48 flex-shrink-0 min-w-0">
        <span className={`absolute left-4 font-black text-lg ${disabled ? 'text-slate-400' : isPenalty ? 'text-rose-500' : 'text-slate-900'}`}>
          ₹
        </span>

        {/* INPUT FIXES:
            1. No arrows: [appearance:textfield] & webkit-outer-spin-button hides browser arrows.
            2. No scrolling: onWheel={(e) => e.target.blur()} prevents mouse scroll changing values.
            3. No negatives: onKeyDown explicitly blocks '-', '+', 'e', 'E'.
            4. No blowouts: Internal scrolling inside the input (via flex-shrink-0 min-w-0 on parent).
        */}
        <input
          type="number"
          min="0"
          value={value}
          disabled={disabled}
          placeholder="0"
          onWheel={(e) => e.target.blur()}
          onKeyDown={(e) => {
            if (['-', '+', 'e', 'E'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const val = e.target.value;
            // Strict check to prevent any accidental negative pastes
            if (val === "" || Number(val) >= 0) {
              setValue(val);
            }
          }}
          className={`w-full min-w-0 pl-9 pr-4 py-2.5 text-right text-xl font-black font-mono rounded-xl outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${disabled
            ? 'bg-transparent text-slate-500 cursor-not-allowed'
            : `bg-white border-2 shadow-sm ${isPenalty ? 'border-rose-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-rose-700' : 'border-slate-200 focus:border-[#178F9E] focus:ring-4 focus:ring-[#178F9E]/10 text-[#178F9E] hover:border-slate-300'}`
            }`}
        />
      </div>
    </div>
  );
}