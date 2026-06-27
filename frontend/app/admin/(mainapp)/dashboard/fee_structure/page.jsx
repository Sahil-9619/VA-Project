"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminServices } from "@/services/admin/admin.service";
import { toast } from "sonner";
import {
  Search, Banknote, Receipt, Lock, Unlock,
  GraduationCap, Building, Bus, FileText, Clock, Pencil, Save,
  CheckCircle2, Plus, X
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
        setExtraComponents([]);
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
    <div className="min-h-[calc(100vh-4rem)] bg-transparent flex flex-col md:flex-row font-sans border-t border-border dark:border-slate-700 overflow-hidden">

      {/* ====================================================
          LEFT PANE: DIRECTORY
          ==================================================== */}
      <div className={`w-full md:w-[300px] lg:w-[320px] flex-shrink-0 flex flex-col border-r border-border dark:border-slate-700 bg-card dark:bg-slate-800 ${classId ? 'hidden md:flex' : 'flex'}`}>

        {/* Header & Search */}
        <div className="p-4 md:p-6 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2 mb-4">
            <Banknote className="w-5 h-5 text-primary" />
            Fee Management
          </h1>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background dark:bg-slate-900 border border-border dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground shadow-sm text-foreground dark:text-slate-200"
            />
          </div>
        </div>

        {/* Flat List */}
        <div className="flex-1 overflow-y-auto px-2 pb-8 space-y-1 hide-scrollbar">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-3">Class Ledgers</h3>

          {sortedClasses.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground text-xs">
              No classes found.
            </div>
          ) : (
            sortedClasses.map((cls) => {
              const isActive = classId === cls._id;
              return (
                <button
                  key={cls._id}
                  onClick={() => setClassId(cls._id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-md transition-all text-sm ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "hover:bg-muted dark:hover:bg-slate-700 text-foreground dark:text-slate-300 hover:text-foreground"
                    }`}
                >
                  <span>Class {cls.className}</span>
                  {!isActive && <Receipt className="w-3.5 h-3.5 text-muted-foreground opacity-50" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ====================================================
          RIGHT PANE: INVOICE/LEDGER VIEW
          ==================================================== */}
      <div className={`flex-1 flex flex-col bg-background dark:bg-slate-900 relative min-w-0 ${!classId ? 'hidden md:flex' : 'flex'}`}>

        {classId ? (
          <>
            {/* Mobile Back Button */}
            <div className="md:hidden p-3 border-b border-border dark:border-slate-700 flex items-center flex-shrink-0 bg-card dark:bg-slate-800">
              <button
                onClick={() => setClassId("")}
                className="text-xs bg-muted dark:bg-slate-700 text-foreground px-3 py-1.5 rounded-md font-medium hover:bg-accent transition-colors"
              >
                ← Back to List
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Loading ledger data...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Ledger Header */}
                <div className="px-6 py-6 border-b border-border dark:border-slate-700/50 flex-shrink-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-card/50 dark:bg-slate-800/50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${editing ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'}`}>
                        {editing ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {editing ? "Editing Mode" : "Locked"}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground dark:text-slate-100 tracking-tight truncate">
                      Class {String(classes.find((c) => c._id === classId)?.className ?? "")} Ledger
                    </h1>
                  </div>

                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-foreground bg-card hover:bg-muted dark:bg-slate-800 dark:hover:bg-slate-700 border border-border dark:border-slate-600 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Ledger
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 space-y-2 relative hide-scrollbar">
                  {allComponents.map((comp, i) => (
                    <div key={i} className="relative group">
                      <LedgerRow
                        icon={comp.icon}
                        label={comp.label}
                        value={comp.value}
                        setValue={comp.setValue}
                        disabled={!editing}
                      />

                      {/* Extra name edit overlay */}
                      {editing && comp.isExtra && (
                        <div className="absolute left-14 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-background dark:bg-slate-900 pr-2">
                           <input
                            value={extraComponents[comp.index].name}
                            onChange={(e) =>
                              updateComponent(comp.index, "name", e.target.value)
                            }
                            placeholder="Fee Name..."
                            className="w-32 bg-background dark:bg-slate-900 border border-border dark:border-slate-700 focus:border-primary rounded px-2 py-1 text-xs outline-none text-foreground dark:text-slate-200"
                          />
                        </div>
                      )}

                      {/* Remove button */}
                      {editing && comp.isExtra && (
                        <button
                          onClick={() => removeComponent(comp.index)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Late Fee Component */}
                  <div className="mt-4 pt-4 border-t border-border/50 dark:border-slate-700/50">
                    <LedgerRow
                      icon={Clock}
                      label="Late Fee (Per Day)"
                      value={lateFeePerDay}
                      setValue={setLateFeePerDay}
                      disabled={!editing}
                      isPenalty={true}
                    />
                  </div>

                  {editing && (
                    <button
                      onClick={addComponent}
                      className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/10"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Custom Component
                    </button>
                  )}
                </div>

                {/* Sticky Summary & Save Footer */}
                <div className="bg-card dark:bg-slate-800 border-t border-border dark:border-slate-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
                        Total Base Fee
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground dark:text-slate-100 tracking-tight">₹</span>
                        <p className="text-2xl font-black text-foreground dark:text-slate-100 tracking-tight" title={totalFee.toLocaleString('en-IN')}>
                          {totalFee.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {editing ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setEditing(false);
                          setClassId(classId); // re-trigger fetch
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-md border border-border dark:border-slate-600 bg-background dark:bg-slate-900 text-foreground hover:bg-muted dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={updateFee}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2 rounded-md text-xs font-medium bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="sm:hidden w-full flex items-center justify-center gap-2 text-xs font-medium bg-card border border-border px-4 py-2 rounded-md"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  )}
                </div>

              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted dark:bg-slate-800 flex items-center justify-center mb-4 text-muted-foreground opacity-50">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground dark:text-slate-200 mb-1">No Ledger Selected</h3>
            <p className="text-xs text-muted-foreground max-w-[250px]">
              Select a class from the sidebar to manage its fee structure.
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
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between py-2 px-2 sm:px-3 gap-2 rounded-lg transition-colors hover:bg-muted/50 dark:hover:bg-slate-800/50">
      
      {/* Label Side */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
          disabled ? 'bg-muted dark:bg-slate-800 text-muted-foreground' : 
          isPenalty ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`text-sm font-medium ${isPenalty ? 'text-destructive' : 'text-foreground dark:text-slate-200'}`}>
          {label}
        </span>
        <div className="hidden sm:block flex-1 border-b border-dashed border-border/50 mx-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Input Side */}
      <div className="relative flex items-center w-full sm:w-36 flex-shrink-0">
        <span className={`absolute left-3 font-semibold text-sm ${disabled ? 'text-muted-foreground' : isPenalty ? 'text-destructive' : 'text-foreground dark:text-slate-300'}`}>
          ₹
        </span>
        <input
          type="number"
          min="0"
          value={value}
          disabled={disabled}
          placeholder="0"
          onWheel={(e) => e.target.blur()}
          onKeyDown={(e) => {
            if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
          }}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || Number(val) >= 0) setValue(val);
          }}
          className={`w-full pl-8 pr-3 py-1.5 text-right text-sm font-semibold rounded-md outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
            disabled
              ? 'bg-transparent text-muted-foreground cursor-not-allowed border-transparent'
              : `bg-background dark:bg-slate-900 border shadow-sm ${
                  isPenalty 
                    ? 'border-destructive/30 focus:border-destructive focus:ring-1 focus:ring-destructive text-destructive' 
                    : 'border-border dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-foreground dark:text-slate-100'
                }`
          }`}
        />
      </div>
    </div>
  );
}