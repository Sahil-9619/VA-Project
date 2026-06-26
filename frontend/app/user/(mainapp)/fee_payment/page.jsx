"use client";
import React, { useEffect, useState } from "react";
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
  PieChart
} from "lucide-react";

import { useSelector } from "react-redux";
import { adminServices } from "@/services/admin/admin.service";


const App = () => {

  const { user } = useSelector((state) => state.auth);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [student, setStudent] = useState(null);
  const [monthlyFees, setMonthlyFees] = useState({});
  const monthlyFee = feeData?.monthlyFee || 0;
  const admissionDate = feeData?.admissionDate;
  const finalUser = student || user;


  const totalFee = feeData?.totalAssignedFee || 0;
  const paidFee = feeData?.totalPaid || 0;
  const remainingFee = feeData?.remainingAmount || 0;
  const nextInstallment = feeData?.nextInstallment || 0;
  const nextDueDate = feeData?.nextDueDate || "-";
  const totalEmis = 12;

  const monthlyComponentsTotal = (feeData?.feeComponents || [])
    .filter(item =>
      item.type === "monthly" ||
      ["tuition", "hostel", "transport"].includes(item.name?.toLowerCase())
    )
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const monthlyEmi = monthlyComponentsTotal / totalEmis;
  const monthlyPaidTotal = (feeData?.payments || [])
    .filter(p => p.month) // sirf monthly payments
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const emisPaid = monthlyEmi
    ? Math.floor(monthlyPaidTotal / monthlyEmi)
    : 0;
  const emisRemaining = Math.max(totalEmis - emisPaid, 0);


  const paidPercentage = totalFee ? Math.round((paidFee / totalFee) * 100) : 0;
  const emiProgress = feeData?.totalEmis ? Math.round((feeData?.emisPaid / feeData?.totalEmis) * 100) : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.email) return;

        // 🔥 Student details
        const studentRes = await adminServices.getStudentByEmail(user.email);
        const studentData = studentRes?.data || studentRes;

        setStudent(studentData);

        const admissionNo = studentData?.admissionNumber || user?.admissionNumber;


        const feeRes = await adminServices.getStudentFeeByAdmission(admissionNo);

        const data = feeRes?.data?.data || feeRes?.data || feeRes;

        setStudent(data.student);
        setFeeData(data.fee);
        setMonthlyFees(data.monthlyFees || {});
        setPayAmount(data.fee?.nextInstallment?.toString() || "");
      } catch (err) {

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (monthlyEmi) {
      setPayAmount(monthlyEmi);
    }
  }, [monthlyEmi]);


  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
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
  const breakdown = (feeData?.feeComponents || [])
    .filter((item) => item?.amount > 0)
    .map((item) => {
      const name = item.name?.toLowerCase();
      const isMonthly =
        item.type === "monthly" ||
        ["tuition", "hostel", "transport"].includes(name);

      // Monthly components ka paid amount = sirf monthly payments se
      const totalMonthlyAmount = (feeData?.feeComponents || [])
  .filter(c =>
    c.type === "monthly" ||
    ["tuition", "hostel", "transport"].includes(c.name?.toLowerCase())
  )
  .reduce((sum, c) => sum + Number(c.amount || 0), 0);

const totalMonthlyPaid = (feeData?.payments || [])
  .filter(p => p.month)
  .reduce((sum, p) => sum + Number(p.amount || 0), 0);

// 🔥 proportional distribution
const monthlyPaid = isMonthly
  ? (item.amount / totalMonthlyAmount) * totalMonthlyPaid
  : 0;

      // One-time components ka paid amount = componentName se match
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
        amount: item.amount,       // total (original)
        paid,
        remaining,
        isMonthly,
      };
    });
  const paidComponents = new Set(
    (feeData?.payments || [])
      .filter(p => p.componentName)
      .map(p => p.componentName.toLowerCase())
  );
  const generateInstallments = () => {
    if (!feeData?.createdAt) return [];

    const today = new Date();
    const startYear = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();
    const start = new Date(startYear, 3, 1); // April

    const monthNames = [
      "April", "May", "June", "July", "August", "September",
      "October", "November", "December", "January", "February", "March"
    ];

    return monthNames.map((monthName, i) => {
      const date = new Date(start);
      date.setMonth(start.getMonth() + i);

      const matchedPayment = (feeData?.payments || []).find(
        (p) => p.month && p.month.toLowerCase() === monthName.toLowerCase()
      );
      const isPaid = !!matchedPayment;



      // First unpaid month index
      const firstUnpaidIdx = monthNames.findIndex(
        (m) => !(feeData?.payments || []).some(
          (p) => p.month && p.month.toLowerCase() === m.toLowerCase()
        )
      );

      let status = "Upcoming";
      if (isPaid) {
        status = "Paid";
      } else if (i === firstUnpaidIdx) {
        status = "Current";
      } else if (i === firstUnpaidIdx + 1) {
        status = "Due";
      }

      return {
        month: date.toLocaleString("default", { month: "long", year: "numeric" }),
        amount: monthlyEmi,
        dueDate: new Date(date.setDate(5)).toLocaleDateString("en-GB"),
        status,
        invoiceId: matchedPayment?.invoiceId || null,
      };
    });
  };
  const installments = generateInstallments();

  const formatLabel = (key) => {
    if (!key || typeof key !== "string") return "Unknown";

    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };


  return (
    <div className="min-h-screen mt-10 md:mt-14 border-gray-200  shadow-inner bg-white border-12 font-sans text-slate-900 pb-16">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12f">

        {/* Header Section (Open layout, no navbar) */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Fee Management</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500 font-medium text-sm">
              {student?.firstName || user?.firstName || "User"}{" "}{student?.lastName || user?.lastName || "User"}
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{student?.admissionNumber || user?.admissionNumber}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-1.5">
                <GraduationCap size={16} />
                <span>
                  {student?.classId?.className || user?.class}
                  <sup className="text-[9px] ml-0.5 align-super">
                    {user?.class % 100 >= 11 && user?.class % 100 <= 13
                      ? "th"
                      : user?.class % 10 === 1
                        ? "st"
                        : user?.class % 10 === 2
                          ? "nd"
                          : user?.class % 10 === 3
                            ? "rd"
                            : "th"}
                  </sup>
                </span>
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors w-fit">
            <Download size={16} />
            Statement
          </button>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Payment Action & Progress */}
          <div className="lg:col-span-5 space-y-12">

            {/* Quick Pay Box (Only card on the page) */}
            <div className="bg-gradient-to-br from-[#0E94A5] to-[#0a7280] rounded-3xl p-8 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">Next Due</h2>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                    {installments.find(i => i.status === "Due" || i.status === "Current")?.dueDate || "-"}
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
                      type="text"
                      value={Number(monthlyEmi || 0).toFixed(2)} max={monthlyEmi}
                      readOnly
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= monthlyEmi) {
                          setPayAmount(val);
                        }
                      }}
                      className="w-full bg-white text-slate-900 rounded-2xl py-4 pl-12 pr-4 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-teal-400/30 transition-all"

                    />
                  </div>

                  <button
                    disabled={!payAmount || payAmount <= 0}
                    className={`w-full rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all
                      ${payAmount > 0
                        ? "bg-slate-900 hover:bg-slate-800 text-white"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    <CreditCard size={20} />
                    {payAmount > 0 ? "Pay Now" : "Enter Amount"}
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-teal-100 text-xs font-medium">
                  <ShieldCheck size={14} />Secured Payment Gateway
                </div>
              </div>
            </div>

            {/* Overall Payment Progress (Open Layout) */}
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
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${paidPercentage > 70
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
                <span className="text-slate-900">
                  {formatCurrency(remainingFee || 0)} left
                </span>
              </div>
            </div>
            {/* 🔥 CATEGORY WISE PAYMENT */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Layers size={18} className="text-slate-400" />
                Category Payment
              </h3>

              <div className="space-y-3">
                {breakdown.map((item, i) => {
                  const isPaid =
                    item.isMonthly
                      ? item.remaining === 0
                      : paidComponents.has(item.category.toLowerCase());

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {formatLabel(item.category)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Total: {formatCurrency(item.amount)}
                        </p>
                        {item.paid > 0 && (
                          <p className="text-xs text-emerald-600">
                            Paid: {formatCurrency(item.paid)}
                          </p>
                        )}
                        {item.remaining > 0 && (
                          <p className="text-xs text-rose-500">
                            Remaining: {formatCurrency(item.remaining)}
                          </p>
                        )}
                      </div>

                      {isPaid ? (
                        <span className="px-3 py-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} /> Paid
                        </span>
                      ) : (
                        <button className="px-3 py-1.5 text-xs font-bold bg-[#0E94A5] text-white rounded-full hover:bg-[#0a7280]">
                          Pay
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* 🔥 FULL PAYMENT (ONE TIME) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Wallet size={18} />
                Full Payment
              </h3>

              <p className="text-sm text-slate-300 mb-2">
                Pay complete fee in one go
              </p>

              <p className="text-3xl font-black mb-4">
                {formatCurrency(remainingFee)}
              </p>

              <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
                Pay Full Amount
              </button>
            </div>
            {/* Monthly EMI Status (Open Layout) */}
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
                    <p className="text-xl font-bold text-rose-600">{emisRemaining} <span className="text-sm text-slate-400 font-medium">of {totalEmis} EMIs</span></p>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-2">
                  {Array.from({ length: totalEmis }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full ${index < emisPaid ? 'bg-emerald-400' : 'bg-slate-100'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Fee Breakdown & Schedule */}
          <div className="lg:col-span-7 space-y-12">

            {/* Applied Fee Breakdown (Invoice/Document Style) */}
            <div>
              <h3 className="text-xl pt-4 font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Layers size={24} className="  text-slate-300" /> Applied Fee Breakdown
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
                      <span className="text-slate-900">
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
                    <span>Paid</span>
                    <span className="font-bold">
                      -{formatCurrency(feeData?.totalPaid || 0)}
                    </span>
                  </li>

                  {/* Remaining */}
                  <li className="pt-4 mt-4 border-t flex justify-between items-center">
                    <span className="text-rose-600 font-bold text-base">Remaining</span>
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
                          {
                            item.status === "Paid" ? (
                              <button

                                onClick={async () => {
                                  if (!item.invoiceId) {
                                    alert("Invoice not available");
                                    return;
                                  }
                                  try {
                                    const blob = await adminServices.generateInvoicePDF(item.invoiceId);
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `receipt_${item.month.replace(" ", "_")}.pdf`;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                  } catch (err) {
                                    alert("Failed to download receipt");
                                  }
                                }}
                                className="text-[#0E94A5] flex items-center gap-1.5 text-xs font-bold ml-auto">
                                <Receipt size={14} /> Receipt
                              </button>
                            ) : item.status === "Due" || item.status === "Current" ? (
                              <button className="text-slate-900 flex items-center gap-1.5 text-xs font-bold ml-auto">
                                Pay <ArrowRight size={14} />
                              </button>
                            ) : (
                              <span className="text-slate-300 text-xs font-bold">Not Available</span>
                            )
                          }
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
