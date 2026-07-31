"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  GraduationCap,
  Wallet,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
  Layers,
  PieChart,
  Loader2
} from "lucide-react";
import { useSelector } from "react-redux";
import { adminServices } from "@/services/admin/admin.service";
import { toast } from "sonner";

const App = () => {
  const { user } = useSelector((state) => state.auth);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [student, setStudent] = useState(null);
  const [monthlyFees, setMonthlyFees] = useState({});

  const totalFee = feeData?.totalAssignedFee || 0;
  const paidFee = feeData?.totalPaid || 0;
  const remainingFee = feeData?.remainingAmount || 0;
  const totalEmis = 12;

  const monthlyComponentsTotal = (feeData?.feeComponents || [])
    .filter((item) =>
      item.type === "monthly" ||
      ["tuition", "hostel", "transport"].includes(item.name?.toLowerCase())
    )
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const monthlyEmi = Math.round(monthlyComponentsTotal / totalEmis);
  const monthlyPaidTotal = (feeData?.payments || [])
    .filter((p) => p.month) // monthly payments
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const emisPaid = monthlyEmi
    ? Math.floor(monthlyPaidTotal / monthlyEmi)
    : 0;
  const emisRemaining = Math.max(totalEmis - emisPaid, 0);

  const paidPercentage = totalFee ? Math.round((paidFee / totalFee) * 100) : 0;

  const fetchData = useCallback(async () => {
    try {
      if (!user?.email && !user?.admissionNumber) {
        setLoading(false);
        return;
      }

      let studentData = student;
      if (!studentData) {
        try {
          const studentRes = user?.email
            ? await adminServices.getStudentByEmail(user.email)
            : null;
          studentData = studentRes?.data || studentRes;
          if (studentData) setStudent(studentData);
        } catch (err) {
          console.warn("Could not fetch student by email:", err);
        }
      }

      const admissionNo = studentData?.admissionNumber || user?.admissionNumber;
      if (!admissionNo) {
        setLoading(false);
        return;
      }

      const feeRes = await adminServices.getStudentFeeByAdmission(admissionNo);
      const data = feeRes?.data?.data || feeRes?.data || feeRes;

      if (data.student) setStudent(data.student);
      if (data.fee) setFeeData(data.fee);
      if (data.monthlyFees) setMonthlyFees(data.monthlyFees || {});

      const currentMonthlyEmi = Math.round(
        (data.fee?.feeComponents || [])
          .filter(
            (item) =>
              item.type === "monthly" ||
              ["tuition", "hostel", "transport"].includes(item.name?.toLowerCase())
          )
          .reduce((sum, item) => sum + Number(item.amount || 0), 0) / totalEmis
      );

      if (currentMonthlyEmi > 0) {
        setPayAmount(currentMonthlyEmi.toString());
      }
    } catch (err) {
      console.error("Fetch fee data error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, student, totalEmis]);

  useEffect(() => {
    fetchData();
  }, [user]);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const generateInstallments = () => {
    const today = new Date();
    const startYear = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
    const start = new Date(startYear, 3, 1); // April

    const monthNames = [
      "April", "May", "June", "July", "August", "September",
      "October", "November", "December", "January", "February", "March"
    ];

    const firstUnpaidIdx = monthNames.findIndex(
      (m) => !(feeData?.payments || []).some(
        (p) => p.month && p.month.toLowerCase() === m.toLowerCase()
      )
    );

    return monthNames.map((monthName, i) => {
      const date = new Date(start);
      date.setMonth(start.getMonth() + i);

      const matchedPayment = (feeData?.payments || []).find(
        (p) => p.month && p.month.toLowerCase() === monthName.toLowerCase()
      );
      const isPaid = !!matchedPayment;

      let status = "Upcoming";
      if (isPaid) {
        status = "Paid";
      } else if (i === firstUnpaidIdx) {
        status = "Current";
      } else if (i < firstUnpaidIdx) {
        status = "Due";
      }

      return {
        month: `${monthName} ${date.getFullYear()}`,
        monthName,
        amount: monthlyEmi,
        dueDate: new Date(date.setDate(5)).toLocaleDateString("en-GB"),
        status,
        invoiceId: matchedPayment?.invoiceId || null,
      };
    });
  };

  const installments = generateInstallments();

  // Category breakdown calculation
  const breakdown = (feeData?.feeComponents || [])
    .filter((item) => item?.amount > 0)
    .map((item) => {
      const name = item.name?.toLowerCase();
      const isMonthly =
        item.type === "monthly" ||
        ["tuition", "hostel", "transport"].includes(name);

      const totalMonthlyAmount = (feeData?.feeComponents || [])
        .filter((c) =>
          c.type === "monthly" ||
          ["tuition", "hostel", "transport"].includes(c.name?.toLowerCase())
        )
        .reduce((sum, c) => sum + Number(c.amount || 0), 0);

      const totalMonthlyPaid = (feeData?.payments || [])
        .filter((p) => p.month)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const monthlyPaid = (isMonthly && totalMonthlyAmount > 0)
        ? Math.round((item.amount / totalMonthlyAmount) * totalMonthlyPaid)
        : 0;

      const oneTimePaid = !isMonthly
        ? (feeData?.payments || [])
            .filter(
              (p) =>
                p.componentName &&
                p.componentName.toLowerCase() === name
            )
            .reduce((sum, p) => sum + Number(p.amount || 0), 0)
        : 0;

      const paid = isMonthly ? monthlyPaid : oneTimePaid;
      const remaining = Math.max(item.amount - paid, 0);

      return {
        category: item.name,
        amount: item.amount,
        paid,
        remaining,
        isMonthly,
      };
    });

  const paidComponents = new Set(
    (feeData?.payments || [])
      .filter((p) => p.componentName)
      .map((p) => p.componentName.toLowerCase())
  );

  const formatLabel = (key) => {
    if (!key || typeof key !== "string") return "Unknown";
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // ---------------- PAYMENT HANDLERS ----------------
  const handlePayInstallment = async (targetMonth, amount) => {
    const admissionNo = student?.admissionNumber || user?.admissionNumber;
    if (!admissionNo) {
      toast.error("Student admission number missing");
      return;
    }

    if (remainingFee <= 0) {
      toast.info("All fees are already fully paid!");
      return;
    }

    const amt = Number(amount) || Number(payAmount) || monthlyEmi;
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const rawMonth = targetMonth || installments.find((i) => i.status === "Current" || i.status === "Due" || i.status === "Upcoming")?.monthName || "April";
    const monthName = rawMonth.includes(" ") ? rawMonth.split(" ")[0] : rawMonth;

    setProcessingPayment(true);
    try {
      const res = await adminServices.updateStudentFee({
        admissionNumber: admissionNo,
        payAmount: Math.round(amt),
        month: monthName,
        paymentType: "monthly",
      });

      if (res?.success) {
        toast.success(`Payment of ${formatCurrency(amt)} for ${monthName} successful! 🎉`);
        await fetchData();
      } else {
        toast.error(res?.message || "Payment failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment error occurred");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayCategory = async (item) => {
    const admissionNo = student?.admissionNumber || user?.admissionNumber;
    if (!admissionNo) {
      toast.error("Student admission number missing");
      return;
    }

    setProcessingPayment(true);
    try {
      let res;
      if (item.isMonthly) {
        const nextUnpaid = installments.find(
          (i) => i.status === "Current" || i.status === "Due" || i.status === "Upcoming"
        );
        const monthName = nextUnpaid ? nextUnpaid.monthName : "April";
        res = await adminServices.updateStudentFee({
          admissionNumber: admissionNo,
          payAmount: Math.round(monthlyEmi),
          month: monthName,
          paymentType: "monthly",
        });
      } else {
        const amtToPay = item.remaining > 0 ? item.remaining : item.amount;
        res = await adminServices.updateStudentFee({
          admissionNumber: admissionNo,
          payAmount: Math.round(amtToPay),
          paymentType: "onetime",
          componentName: item.category,
        });
      }

      if (res?.success) {
        toast.success(`Payment for ${formatLabel(item.category)} successful! 🎉`);
        await fetchData();
      } else {
        toast.error(res?.message || "Category payment failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment processing error");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayFullRemaining = async () => {
    const admissionNo = student?.admissionNumber || user?.admissionNumber;
    if (!admissionNo) {
      toast.error("Student admission number missing");
      return;
    }

    if (remainingFee <= 0) {
      toast.info("All fees are already fully paid!");
      return;
    }

    setProcessingPayment(true);
    try {
      // 1. Pay unpaid one-time components
      const unpaidOneTime = breakdown.filter((b) => !b.isMonthly && b.remaining > 0);
      for (const comp of unpaidOneTime) {
        await adminServices.updateStudentFee({
          admissionNumber: admissionNo,
          payAmount: Math.round(comp.remaining),
          paymentType: "onetime",
          componentName: comp.category,
        });
      }

      // 2. Pay remaining monthly installments
      const monthNames = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
      ];
      const paidMonths = new Set(
        (feeData?.payments || [])
          .filter((p) => p.month)
          .map((p) => p.month.toLowerCase())
      );

      for (const m of monthNames) {
        if (!paidMonths.has(m.toLowerCase())) {
          await adminServices.updateStudentFee({
            admissionNumber: admissionNo,
            payAmount: Math.round(monthlyEmi),
            month: m,
            paymentType: "monthly",
          });
        }
      }

      toast.success("Full fee paid successfully! Congratulations 🎉");
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Full payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadStatement = () => {
    toast.info("Preparing your fee statement...");
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0E94A5]/20 border-t-[#0E94A5] rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Fetching your fee details...</p>
      </div>
    );
  }

  const progressColor =
    paidPercentage > 70
      ? "text-emerald-500"
      : paidPercentage > 30
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="min-h-screen mt-10 md:mt-14 border-gray-200 shadow-inner bg-white border-12 font-sans text-slate-900 pb-16">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Fee Management</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500 font-medium text-sm">
              <span>{student?.firstName || user?.firstName || "User"} {student?.lastName || user?.lastName || ""}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{student?.admissionNumber || user?.admissionNumber || "N/A"}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-1.5">
                <GraduationCap size={16} />
                <span>
                  {student?.classId?.className || user?.class || "N/A"}
                </span>
              </span>
            </div>
          </div>
          <button 
            onClick={handleDownloadStatement}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors w-fit cursor-pointer"
          >
            <Download size={16} />
            Statement
          </button>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Payment Action & Progress */}
          <div className="lg:col-span-5 space-y-12">

            {/* Quick Pay Box */}
            <div className="bg-gradient-to-br from-[#0E94A5] to-[#0a7280] rounded-3xl p-8 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">Next Due</h2>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                    {installments.find((i) => i.status === "Due" || i.status === "Current")?.dueDate || "-"}
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-sm text-teal-100 font-medium mb-1">Installment Amount</p>
                  <p className="text-5xl font-black tracking-tight">{formatCurrency(monthlyEmi)}</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IndianRupee size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={payAmount}
                      disabled={processingPayment || remainingFee <= 0}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full bg-white text-slate-900 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-teal-400/30 transition-all"
                    />
                  </div>

                  <button
                    disabled={processingPayment || remainingFee <= 0 || !payAmount || Number(payAmount) <= 0}
                    onClick={() => {
                      const nextItem = installments.find(
                        (i) => i.status === "Current" || i.status === "Due" || i.status === "Upcoming"
                      );
                      handlePayInstallment(nextItem?.monthName, payAmount);
                    }}
                    className={`w-full rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      processingPayment || remainingFee <= 0 || !payAmount || Number(payAmount) <= 0
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                    }`}
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : remainingFee <= 0 ? (
                      <>
                        <CheckCircle2 size={20} />
                        Fully Paid
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        Pay {formatCurrency(Number(payAmount) || monthlyEmi)}
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-teal-100 text-xs font-medium">
                  <ShieldCheck size={14} />Secured Payment Gateway
                </div>
              </div>
            </div>

            {/* Overall Payment Progress */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <PieChart size={20} className="text-slate-400" /> Overall Progress
              </h3>

              <div className="mb-3">
                <p className="text-xs text-slate-400 mb-1">Payment Completion</p>

                <div className="flex items-end justify-between">
                  <span className={`text-4xl font-black leading-none ${progressColor}`}>
                    {paidPercentage || 0}%
                  </span>

                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    Paid
                  </span>
                </div>
              </div>

              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    paidPercentage > 70
                      ? "bg-emerald-500"
                      : paidPercentage > 30
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(paidPercentage || 0, 100)}%` }}
                ></div>
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">
                  {formatCurrency(paidFee || 0)} paid
                </span>
                <span className="text-slate-900 font-semibold">
                  {formatCurrency(remainingFee || 0)} left
                </span>
              </div>
            </div>

            {/* CATEGORY WISE PAYMENT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Layers size={18} className="text-slate-400" />
                Category Payment
              </h3>

              <div className="space-y-3">
                {breakdown.map((item, i) => {
                  const isPaid = item.isMonthly
                    ? item.remaining === 0
                    : paidComponents.has(item.category.toLowerCase());

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatLabel(item.category)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Total: {formatCurrency(item.amount)}
                        </p>
                        {item.paid > 0 && (
                          <p className="text-xs text-emerald-600 font-medium">
                            Paid: {formatCurrency(item.paid)}
                          </p>
                        )}
                        {item.remaining > 0 && (
                          <p className="text-xs text-rose-500 font-medium">
                            Remaining: {formatCurrency(item.remaining)}
                          </p>
                        )}
                      </div>

                      {isPaid ? (
                        <span className="px-3 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <button
                          disabled={processingPayment}
                          onClick={() => handlePayCategory(item)}
                          className="px-4 py-1.5 text-xs font-bold bg-[#0E94A5] text-white rounded-full hover:bg-[#0a7280] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {processingPayment ? "..." : "Pay"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FULL PAYMENT (ONE TIME) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Wallet size={18} />
                Full Payment
              </h3>

              <p className="text-sm text-slate-300 mb-2">
                Pay complete remaining fee in one go
              </p>

              <p className="text-3xl font-black mb-4">
                {formatCurrency(remainingFee)}
              </p>

              <button
                disabled={processingPayment || remainingFee <= 0}
                onClick={handlePayFullRemaining}
                className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </>
                ) : remainingFee <= 0 ? (
                  "All Fees Paid"
                ) : (
                  "Pay Full Amount"
                )}
              </button>
            </div>

            {/* Monthly EMI Status */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" /> EMI Status
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Monthly EMI</p>
                    <p className="text-2xl font-black text-slate-900">{formatCurrency(monthlyEmi)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-500">Remaining</p>
                    <p className="text-xl font-bold text-rose-600">
                      {emisRemaining} <span className="text-sm text-slate-400 font-medium">of {totalEmis} EMIs</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-2">
                  {Array.from({ length: totalEmis }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full ${index < emisPaid ? 'bg-emerald-500' : 'bg-slate-100'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fee Breakdown & Schedule */}
          <div className="lg:col-span-7 space-y-12">

            {/* Applied Fee Breakdown */}
            <div>
              <h3 className="text-xl pt-4 font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Layers size={24} className="text-slate-300" /> Applied Fee Breakdown
              </h3>

              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-400 mb-3">
                  All charges are calculated from your assigned fee structure.
                </p>
                <ul className="space-y-4 text-sm font-medium">

                  {/* Dynamic Categories from Backend */}
                  {breakdown.map((item, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>{formatLabel(item.category)}</span>
                      <span className="text-slate-900 font-semibold">
                        {formatCurrency(item.amount)}
                      </span>
                    </li>
                  ))}

                  {/* Total */}
                  <li className="pt-4 mt-4 border-t border-dashed flex justify-between items-center">
                    <span className="font-bold text-base">Total Fee</span>
                    <span className="font-black text-lg">
                      {formatCurrency(feeData?.totalAssignedFee || 0)}
                    </span>
                  </li>

                  {/* Paid */}
                  <li className="flex justify-between items-center text-emerald-600">
                    <span>Total Paid</span>
                    <span className="font-bold">
                      -{formatCurrency(feeData?.totalPaid || 0)}
                    </span>
                  </li>

                  {/* Remaining */}
                  <li className="pt-4 mt-4 border-t flex justify-between items-center">
                    <span className="text-rose-600 font-bold text-base">Remaining Balance</span>
                    <span className="text-rose-600 font-black text-2xl">
                      {formatCurrency(remainingFee || 0)}
                    </span>
                  </li>

                </ul>
              </div>
            </div>

            {/* Fee Schedule */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Fee Schedule</h3>
                  <p className="text-sm text-slate-500 mt-1">Track your upcoming and past installments</p>
                </div>
                <Calendar className="text-slate-300" size={24} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-900 text-xs uppercase tracking-wider">
                      <th className="py-4 font-bold">Installment</th>
                      <th className="py-4 font-bold">Due Date</th>
                      <th className="py-4 font-bold">Amount</th>
                      <th className="py-4 font-bold">Status</th>
                      <th className="py-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {installments.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pr-4">
                          <p className="text-sm font-bold text-slate-900">{item.month}</p>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <Clock size={14} className="text-slate-400" />
                            {item.dueDate}
                          </div>
                        </td>
                        <td className="py-5 pr-4">
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(item.amount)}</p>
                        </td>
                        <td className="py-5 pr-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold 
                          ${item.status === "Paid" ? "bg-emerald-50 text-emerald-700" :
                              item.status === "Current" ? "bg-blue-50 text-blue-700" :
                                item.status === "Due" ? "bg-amber-50 text-amber-700" :
                                  "bg-slate-100 text-slate-600"}`}>

                            {item.status === "Paid" && <CheckCircle2 size={12} />}
                            {item.status === "Due" && <AlertCircle size={12} />}
                            {item.status === "Current" && <Clock size={12} />}

                            {item.status}
                          </span>
                        </td>
                        <td className="py-5 text-right">
                          {item.status === "Paid" ? (
                            <button
                              disabled={processingPayment}
                              onClick={async () => {
                                if (!item.invoiceId) {
                                  toast.info("Invoice is being generated");
                                  return;
                                }
                                try {
                                  toast.info("Downloading receipt...");
                                  const blob = await adminServices.generateInvoicePDF(item.invoiceId);
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `receipt_${item.monthName}.pdf`;
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  toast.success("Receipt downloaded successfully!");
                                } catch (err) {
                                  toast.error("Failed to download receipt");
                                }
                              }}
                              className="text-[#0E94A5] hover:text-[#0a7280] flex items-center gap-1.5 text-xs font-bold ml-auto cursor-pointer"
                            >
                              <Receipt size={14} /> Receipt
                            </button>
                          ) : item.status === "Due" || item.status === "Current" || item.status === "Upcoming" ? (
                            <button
                              disabled={processingPayment}
                              onClick={() => handlePayInstallment(item.monthName, item.amount)}
                              className="text-slate-900 hover:text-[#0E94A5] flex items-center gap-1.5 text-xs font-bold ml-auto cursor-pointer disabled:opacity-50"
                            >
                              {processingPayment ? "..." : "Pay"} <ArrowRight size={14} />
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs font-bold">Not Available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
