"use client";

import { useEffect, useRef, useState } from "react";
import { adminServices } from "@/services/admin/admin.service";
import { Pencil, ChevronRight, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";


const months = [ "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December",
  "January", "February", "March",
];

  
export default function AdminFeeManagement() {

  const router = useRouter();
  const dropdownRef = useRef(null)

  const [admissionNo, setAdmissionNo] = useState("");
  const [student, setStudent] = useState(null);
  const [feeStructure, setFeeStructure] = useState({});
  const [summary, setSummary] = useState({});
  const [monthlyFees, setMonthlyFees] = useState({});
  const [payAmount, setPayAmount] = useState("");
  const [monthlyExpected, setMonthlyExpected] = useState(0);
  const [paymentMode, setPaymentMode] = useState("monthly"); // "monthly" | "onetime"
  const searchParams = useSearchParams();
  const admissionParam = searchParams.get("admission");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [classStudents, setClassStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [openClassMenu, setOpenClassMenu] = useState(false)
  const [hoverClass, setHoverClass] = useState(null)
  const [selectedSection, setSelectedSection] = useState("")

  useEffect(() => {
    if (!admissionNo) {
      setStudent(null);
      setFeeStructure({});
      setSummary({});
      setMonthlyFees({});
    }
  }, [admissionNo]);


  useEffect(() => {

    if (admissionParam) {

      setAdmissionNo(admissionParam);

      handleSearch(admissionParam);

    }
  }, [admissionParam]);


  useEffect(() => {

    const fetchClasses = async () => {

      try {

        const res = await adminServices.getAllClasses()

        const data = res?.data || []


        /*
        Expected DB structure example
        [
         { _id, className:"7", section:"A" },
         { _id, className:"7", section:"B" },
         { _id, className:"8", section:"A" }
        ]
        */

        const classMap = {}

        data.forEach((item) => {

          if (!item._id || !item.className) {
            console.warn("Incomplete class data - missing ID or className:", item);
            return;
          }

          if (!classMap[item.className]) {

            classMap[item.className] = {
              className: item.className,
              sections: []
            }

          }

          // Only add section if it exists and is not empty
          if (item.section && item.section.trim()) {
            if (!classMap[item.className].sections.find(s => s.name === item.section)) {
              classMap[item.className].sections.push({
                name: item.section,
                classId: item._id
              })
            }
          } else {
            // If no section, add this class's _id as a fallback section
            if (!classMap[item.className].sections.find(s => s.classId === item._id)) {
              classMap[item.className].sections.push({
                name: "Default",
                classId: item._id
              })
            }
          }

        })

        const formatted = Object.values(classMap).sort(
          (a, b) => Number(a.className) - Number(b.className)
        )

        // Validate all sections have classId
        formatted.forEach((cls, idx) => {
          try {
            cls.sections.forEach((sec, secIdx) => {
              if (!sec.classId) {
                console.error(`Class ${idx}, Section ${secIdx}: Missing classId!`, sec);
              } else {
                console.log(`✓ Class ${cls.className} Section ${sec.name}: classId = ${sec.classId}`);
              }
            });
          } catch (e) {
            console.error(`Error validating class ${idx}:`, e, cls);
          }
        });

        setClasses(formatted)

      } catch (err) {

        console.error("Error fetching classes:", err)

      }

    }

    fetchClasses()

  }, [])
  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {

        setOpenClassMenu(false)
        setHoverClass(null)

      }

    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])
  /* ---------------- SEARCH STUDENT ---------------- */

  const handleSearch = async (admission) => {
    setStudent(null);
    setFeeStructure({});
    setSummary({});
    setMonthlyFees({});
    try {
      if (!admission && !admissionNo) {
        toast.error("Enter admission number", {
          position: "top-center"
        });
        return;
      }
      // Case 1 → admission search (existing logic)
      if (admission || admissionNo?.trim()) {

        const res = await adminServices.getStudentFeeByAdmission(admission || admissionNo);

        const data = res?.data || res;

        if (!data || !data.student) {

          toast.error("Student not found")

          setStudent(null);
          setFeeStructure({});
          setSummary({});
          setMonthlyFees({});
          setAdmissionNo("");
          router.replace("/admin/dashboard/student_fee");
          return;
        }

        setStudent(data.student);

        // Map feeComponents array → named fields for the UI
        const fee = data.fee || {};
        const componentsMap = {};
        console.log("🔍 feeComponents from API:", fee.feeComponents);
        (fee.feeComponents || []).forEach(f => {
          const key = f.name?.toLowerCase();
          console.log("  component:", key, "->", f.amount);
          if (key === "tuition") componentsMap.tuitionFee = f.amount;
          if (key === "admission") componentsMap.admissionFee = f.amount;
          if (key === "exam") componentsMap.examFee = f.amount;
          if (key === "hostel") componentsMap.hostelFee = f.amount;
          if (key === "transport") componentsMap.transportFee = f.amount;
          if (key === "late fee" || key === "latefee") componentsMap.lateFeePerDay = f.amount;
        });
        componentsMap.lateFeePerDay = componentsMap.lateFeePerDay ?? (fee.lateFeePerDay || 0);
        console.log("🗺️ mapped:", componentsMap);

        setFeeStructure({ ...fee, ...componentsMap });
        setSummary(fee);
        setMonthlyFees(data.monthlyFees || {});

        const apiMonthlyExpected = data.monthlyExpected || 0;
        let fallbackSum = 0;
        (fee.feeComponents || []).forEach(f => {
          const name = String(f.name || "").toLowerCase().trim();
          const type = String(f.type || "").toLowerCase().trim();

          const isRecurring = type === "monthly" || ["tuition", "hostel", "transport"].includes(name);

          if (isRecurring) {
            const amt = Number(f.amount || 0);
            fallbackSum += Number(f.amount || 0);
          }
        });
        setMonthlyExpected(apiMonthlyExpected || Math.round(fallbackSum));

        return;
      }

    } catch (err) {

      toast.error("Student not found", {
        position: "top-center",
      });

      setStudent(null);
      setFeeStructure({});
      setSummary({});
      setMonthlyFees({});
      setAdmissionNo("");
      router.replace("/admin/dashboard/student_fee");

    }
  }

  /* ---------------- UPDATE FEE STRUCTURE ---------------- */

  const handleChange = (field, value) => {

    setFeeStructure({
      ...feeStructure,
      [field]: value
    });

  };

  /* ---------------- HANDLE PAYMENT ---------------- */
  const handlePayment = async (overrideAmount, overrideType, overrideComponentName) => {
    try {
      const isOnetime = overrideType === "onetime" || paymentMode === "onetime";

      // Block all payments if fully paid
      if (summary.remainingAmount <= 0) {
        toast.error("All fees are already fully paid");
        return;
      }

      if (!isOnetime && !selectedMonth) {
        toast.error("Please select a month first");
        return;
      }

      // Block re-payment of an already fully paid month
      if (!isOnetime && selectedMonth) {
        const alreadyPaid = (summary.payments || []).some(
          p => p.month && p.month.toLowerCase() === selectedMonth.toLowerCase()
        );
        if (alreadyPaid) {
          toast.error(`${selectedMonth} fee is already paid`);
          return;
        }

        // 🔒 Sequential check: all previous months must be paid first
        const monthIndex = months.indexOf(selectedMonth);
        for (let i = 0; i < monthIndex; i++) {
          const prevMonth = months[i];
          const isPrevPaid = (summary.payments || []).some(
            p => p.month && p.month.toLowerCase() === prevMonth.toLowerCase()
          );
          if (!isPrevPaid) {
            toast.error(`Please pay ${prevMonth} fee first`);
            return;
          }
        }
      }

      const amount = overrideAmount || Number(payAmount);

      if (!amount || amount <= 0) {
        toast.error("Enter valid amount");
        return;
      }

      // Max allowed for monthly
      if (!isOnetime) {
        let maxAllowed = monthlyExpected > 0 ? monthlyExpected : (summary.remainingAmount || 0);
        if (monthlyExpected > 0 && summary.remainingAmount > 0 && summary.remainingAmount <= monthlyExpected * 1.5) {
          maxAllowed = summary.remainingAmount;
        }
        if (maxAllowed > 0 && amount > maxAllowed) {
          toast.error(`Amount cannot exceed ₹${maxAllowed}`);
          return;
        }
      }

      const payload = {
        admissionNumber: admissionNo,
        payAmount: amount,
        month: isOnetime ? undefined : selectedMonth,
        paymentType: isOnetime ? "onetime" : "monthly",
        componentName: overrideComponentName || undefined,
      };

      const res = await adminServices.updateStudentFee(payload);
      const invoiceId = res.invoiceId;

      console.log("API RESPONSE:", res);

      if (!invoiceId) {
        toast.error("Invoice not generated");
        return;
      }

      const blob = await adminServices.generateInvoicePDF(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${student.admissionNumber}.pdf`;
      a.click();

      await handleSearch();
      setPayAmount("");

    } catch (err) {
      console.log(err);
      toast.error("Payment failed");
    }
  };
  const handleFeeStructureUpdate = async () => {
    try {
      // Use the live feeComponents array directly from summary state
      const feeComponents = (summary.feeComponents || []).map(f => ({
        name: f.name,
        amount: Number(f.amount || 0),
        type: f.type || "one-time"
      }));

      if (feeComponents.length === 0) {
        toast.error("No fee components to save");
        return;
      }

      await adminServices.updateStudentFeeStructure(admissionNo, { feeComponents });

      toast.success("Fee structure updated");
      handleSearch();

    } catch (err) {
      console.log(err);
      toast.error("Failed to update fee structure");
    }
  };
  const getMonthStatus = (month) => {

    const paid = monthlyFees[month] || 0;

    const hasMonthlyComponents = (summary.feeComponents || []).some(
      f =>
        String(f.type).toLowerCase().trim() === "monthly" ||
        ["tuition", "hostel", "transport"].includes(f.name?.toLowerCase())
    );

    const isFullyPaid =
      summary.status === "paid" || Number(summary.remainingAmount) <= 0;

    if (isFullyPaid || (paid === 0 && monthlyExpected <= 0)) return "full";

    if (paid === 0) return "none";

    if (monthlyExpected > 0 && paid < monthlyExpected) return "partial";

    return "full";
  };

  // Set of one-time component names that have been paid
  const paidOneTimeComponents = new Set(
    (summary.payments || []).filter(p => p.componentName).map(p => p.componentName.toLowerCase())
  );
  const totalPages = Math.ceil(classStudents.length / rowsPerPage)

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage

  const currentStudents = classStudents.slice(startIndex, endIndex)

  const getVisiblePages = () => {

    const maxVisible = 6

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, 6]
    }

    if (currentPage >= totalPages - 2) {
      return Array.from({ length: 6 }, (_, i) => totalPages - 5 + i)
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage + 3
    ]

  }

  const visiblePages = getVisiblePages()
  const loadStudents = async (classData) => {

    try {

      if (!classData || !classData.section) {
        console.error("Invalid classData:", classData);
        toast.error("Please select a valid class and section");
        return;
      }

      if (classData.section === "ALL") {
        // Load all sections for this class
        if (!classData.sections || classData.sections.length === 0) {
          console.error("No sections available");
          toast.error("No sections found for this class");
          return;
        }

        let allStudents = [];

        // NEW: fetch class fee using first section classId
        try {
          const feeRes = await adminServices.getClassFeeByClass(classData.sections[0]?.classId);
          console.log("Class Fee Response:", feeRes);
        } catch (err) {
          console.error("Error fetching class fee:", err);
        }

        for (const sec of classData.sections) {
          if (!sec.classId) {
            console.warn("Missing classId for section:", sec);
            continue;
          }
          try {
            const res = await adminServices.getstudentsByClass(sec.classId);
            const students = res?.data || [];
            allStudents = [...allStudents, ...students];
          } catch (sectionErr) {
            console.error(`Error loading students for section ${sec.name}:`, sectionErr);
          }
        }

        const sortedStudents = allStudents.sort(
          (a, b) =>
            Number(a.admissionNumber.replace("ADM", "")) -
            Number(b.admissionNumber.replace("ADM", ""))
        );

        setClassStudents(sortedStudents);

      } else {
        // Load specific section
        if (!classData.classId) {
          console.error("Missing classId for section:", classData.section);
          toast.error("Invalid section selected");
          return;
        }

        const res = await adminServices.getstudentsByClass(classData.classId)

        let students = res?.data || []

        // NEW: fetch class fee here
        try {
          const feeRes = await adminServices.getClassFeeByClass(classData.classId);

          const feeData = feeRes?.data || feeRes;

          setSummary(prev => ({
            ...prev,
            totalAssignedFee: feeData?.totalFee || 0
          }));
        } catch (err) {
          console.error("Error fetching class fee:", err);
        }

        const sortedStudents = students.sort(
          (a, b) =>
            Number(a.admissionNumber.replace("ADM", "")) -
            Number(b.admissionNumber.replace("ADM", ""))
        )

        setClassStudents(sortedStudents);
      }

      setCurrentPage(1)

    } catch (err) {

      console.error("Load students error:", err)
      toast.error("Failed to load students");

    }

  }

  // Monthly expected comes directly from API (sum of monthly-type fee components)
  // Do NOT compute it as remainingAmount/12 — that changes after one-time payments are made.

  return (

    <div className="p-10 bg-[#F4FDFE] min-h-screen space-y-12">

      {/* ---------------- Search ---------------- */}

      <section>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Fee Management Search
        </h2>

        <div className="flex flex-wrap gap-4 items-end">
          <div ref={dropdownRef} className="relative">

            <button
              onClick={() => setOpenClassMenu(!openClassMenu)}
              className="border border-gray-300 px-4 py-2 rounded-md text-sm w-40 bg-white flex items-center justify-between"
            >
              <span>
                {selectedClass
                  ? (() => {
                    if (selectedSection === "ALL") {
                      for (const cls of classes) {
                        if (cls.sections.some(s => s.classId === selectedClass)) {
                          return `Class ${cls.className} - ALL`;
                        }
                      }
                    }
                    for (const cls of classes) {
                      const section = cls.sections.find(s => s.classId === selectedClass);
                      if (section) {
                        return `Class ${cls.className} - ${section.name}`;
                      }
                    }
                    return "Select Class";
                  })()
                  : "Select Class"}
              </span>

              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${openClassMenu ? "rotate-180" : ""
                  }`}
              />
            </button>

            {openClassMenu && (

              <div className="absolute top-10 left-0 bg-white border rounded-md shadow-md w-40 z-50">

                {classes.map((cls) => (

                  <div
                    key={cls.className}
                    onClick={() =>
                      setHoverClass(hoverClass === cls.className ? null : cls.className)
                    }
                    className="relative px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                  >

                    <span>Class {cls.className}</span>

                    <ChevronRight size={16} className="text-gray-500" />

                    {/* SECTION MENU */}

                    {hoverClass === cls.className && (

                      <div className="absolute left-full top-0 bg-white border rounded-md shadow-md w-32">

                        <div
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            if (!cls.sections || cls.sections.length === 0) {
                              console.error("No sections available for this class");
                              toast.error("No sections available");
                              return;
                            }
                            setAdmissionNo("")
                            router.replace("/admin/dashboard/student_fee")
                            setSelectedClass(cls.sections[0]?.classId)
                            setSelectedSection("ALL")
                            setOpenClassMenu(false)
                            loadStudents({ section: "ALL", sections: cls.sections })
                          }}
                        >
                          All
                        </div>

                        {cls.sections.map((sec) => (

                          <div
                            key={sec.name}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              if (!sec || !sec.classId || !sec.name) {
                                console.error("Invalid section data:", sec);
                                toast.error("Invalid section data");
                                return;
                              }
                              setAdmissionNo("")
                              router.replace("/admin/dashboard/student_fee")
                              setSelectedClass(sec.classId)
                              setSelectedSection(sec.name)
                              setOpenClassMenu(false)
                              loadStudents({ section: sec.name, classId: sec.classId })
                            }}
                          >
                            {sec.name}

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

          </div>


          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value)
              setAdmissionNo("")
              router.replace("/admin/dashboard/student_fee")
            }} className="border border-gray-300 px-4 py-2 rounded-md text-sm focus:ring-2 focus:ring-[#178F9E]"
          >
            <option value="">Select Month</option>

            {months.map((m) => {

              const isPaidMonth = !!(monthlyFees[m] && monthlyFees[m] > 0);
              return (
                <option
                  key={m}
                  value={m}
                  disabled={isPaidMonth}
                  style={isPaidMonth ? { color: '#9ca3af', background: '#f3f4f6' } : {}}
                >
                  {m}{isPaidMonth ? ' ✓ Paid' : ''}
                </option>
              );
            })}

          </select>


          <input
            type="text"
            placeholder="Admission No (ADM1001)"
            value={admissionNo}
            onChange={(e) => {
              const value = e.target.value;
              setAdmissionNo(value);

              if (!value) {
                router.replace("/admin/dashboard/student_fee");
              }
            }}
            className="border border-gray-300 px-4 py-2 rounded-md text-sm w-72"
          />


          <button
            onClick={() => {

              if (admissionNo) {
                setSelectedClass("")
                setSelectedMonth("")
                setClassStudents([])
              }

              handleSearch()

            }}
            className="bg-[#178F9E] text-white px-6 py-2 rounded-md hover:bg-[#0F6F7C]"
          >
            Search
          </button>
        </div>

      </section>
      {selectedClass && !admissionNo && (

        <section>

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Student Fee Status - {selectedSection === "ALL" ? (() => {
              for (const cls of classes) {
                if (cls.sections.some(s => s.classId === selectedClass)) {
                  return `Class ${cls.className}`;
                }
              }
            })() : (() => {
              for (const cls of classes) {
                const section = cls.sections.find(s => s.classId === selectedClass);
                if (section) {
                  return `Class ${cls.className} - ${section.name}`;
                }
              }
            })()}
          </h2>


          <div className="overflow-x-auto">

            <table className="w-full border border-[#D9F1F4] text-sm">

              <thead className="bg-[#E8F9FB] text-[#0F6F7C]">

                <tr>
                  <th className="p-3 border text-left">Admission No</th>
                  <th className="p-3 border text-left">Student Name</th>
                  <th className="p-3 border text-left">Father Name</th>
                  <th className="p-3 border text-left">Email</th>
                  <th className="p-3 border text-left">Phone</th>
                  <th className="p-3 border text-left">Total Fee</th>
                  <th className="p-3 border text-left">
                    {selectedMonth ? `${selectedMonth} Status` : "Status"}
                  </th>
                </tr>

              </thead>


              <tbody>

                {currentStudents.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-6 text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}

                {currentStudents.map((s, index) => {
                  const totalAssignedFee =
                    s?.fee?.totalAssignedFee || 0

                  const totalPaid =
                    s?.fee?.totalPaid || 0

                  const remaining =
                    s?.fee?.remainingAmount || 0
                  console.log("Student data:", s)
                  return (
                    <tr
                      key={s._id}
                      className={`

${index % 2 === 0 ? "bg-white" : "bg-[#F4FDFE]"}
hover:bg-[#ECFAFC] transition

`}
                    >


                      <td className="p-3 border border-[#D9F1F4]">
                        {s.admissionNumber}
                      </td>


                      <td className="p-3 border border-[#D9F1F4]">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="p-3 border border-[#D9F1F4]">
                        {s.fatherName || "N/A"}
                      </td>



                      <td className="p-3 border border-[#D9F1F4]">
                        {s.email || "N/A"}
                      </td>


                      <td className="p-3 border border-[#D9F1F4]">
                        {s.phone || "N/A"}
                      </td>


                      <td className="p-3 border border-[#D9F1F4] font-semibold">
                        <Summary

                          value={totalAssignedFee}
                          color="text-[#0F6F7C]"
                        />
                      </td>

                      <td className="p-3 border border-[#D9F1F4]">
                        {selectedMonth ? (() => {
                          const studentMonthlyFees = {};
                          (s.fee?.payments || []).forEach(p => {
                            if (p.month && p.month.toLowerCase() === selectedMonth.toLowerCase()) {
                              studentMonthlyFees[selectedMonth] = (studentMonthlyFees[selectedMonth] || 0) + Number(p.amount || 0);
                            }
                          });

                          let studentMonthlyExpected = 0;
                          (s.fee?.feeComponents || []).forEach(f => {
                            const name = String(f.name || "").toLowerCase().trim();
                            const type = String(f.type || "").toLowerCase().trim();

                            const isRecurring = type === "monthly" || ["tuition", "hostel", "transport"].includes(name);

                            if (isRecurring) {
                              const amt = Number(f.amount || 0);
                              studentMonthlyExpected += amt / 12;
                            }
                          });
                          studentMonthlyExpected = Math.round(studentMonthlyExpected);

                          const paid = studentMonthlyFees[selectedMonth] || 0;

                          if (s.fee?.status === "paid" || (s.fee?.remainingAmount || 0) <= 0) {
                            return <span className="text-green-600 font-semibold flex items-center gap-1">✓ Paid</span>;
                          }

                          if (studentMonthlyExpected <= 0) {
                            return <span className="text-gray-400 font-medium italic">N/A</span>;
                          }

                          if (paid === 0) return <span className="text-red-500 font-semibold">Unpaid</span>;

                          if (paid < studentMonthlyExpected) {
                            return <span className="text-yellow-600 font-semibold">Partial (₹{paid})</span>;
                          }
                          return <span className="text-green-600 font-semibold flex items-center gap-1">✓ Paid</span>;
                        })() : (
                          remaining === 0 ? (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                              ✓ Paid
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">
                              ₹{remaining} Due
                            </span>
                          )
                        )}
                      </td>


                      <td className="p-3 border border-[#D9F1F4]">

                        <Link href={`/admin/dashboard/student_fee?admission=${s.admissionNumber}`}>

                          <SquareArrowOutUpRight
                            size={22}
                            className="cursor-pointer text-[#178F9E]"
                          />

                        </Link>

                      </td>

                    </tr>

                  )

                })}

              </tbody>

            </table>
            <div className="flex justify-between items-center mt-6">

              <div className="flex items-center gap-2 text-sm">

                <span>Rows per page:</span>

                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border rounded px-2 py-1"
                >

                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>

                </select>

              </div>

              <Pagination>

                <PaginationContent>

                  <PaginationItem>

                    <PaginationPrevious
                      className={`cursor-pointer select-none ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    />

                  </PaginationItem>

                  {visiblePages.map((page) => (
                    <PaginationItem key={page}>

                      <PaginationLink
                        className="cursor-pointer select-none"
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >

                        {page}

                      </PaginationLink>

                    </PaginationItem>
                  ))}

                  <PaginationItem>

                    <PaginationNext
                      className={`cursor-pointer select-none ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    />

                  </PaginationItem>

                </PaginationContent>

              </Pagination>

            </div>

          </div>

        </section>

      )}

      {/* Show sections only if student loaded */}

      {student && (

        <>

          {/* ---------------- Student Details ---------------- */}

          <section>

            <h2 className="text-xl font-bold text-[#0F6F7C] mb-6">
              Student Information
            </h2>

            <div className="grid grid-cols-4 gap-6">

              <Input label="Student Name" value={student.fullName} />
              <Input label="Admission No" value={student.admissionNumber} />
              <Input label="Class" value={student.classId?.className} />
              <Input label="Section" value={student.classId?.section} />

            </div>

          </section>


          {/* ---------------- Fee Structure ---------------- */}

          <section>

            <h2 className="text-xl font-bold text-[#0F6F7C] mb-6">
              Fee Structure
            </h2>

            {(summary.feeComponents && summary.feeComponents.length > 0) ? (
              <div className="grid grid-cols-3 gap-6">

                {summary.feeComponents.map((component, index) => (
                  <div key={index}>
                    <label className="text-sm text-gray-500 capitalize flex items-center gap-1 mb-1">
                      <span>✏️</span>
                      {component.name.charAt(0).toUpperCase() + component.name.slice(1)} Fee
                      <span className="text-xs text-gray-400 ml-1">({component.type})</span>
                    </label>
                    <input
                      type="number"
                      value={component.amount}
                      onChange={(e) => {
                        const updated = [...summary.feeComponents];
                        updated[index] = { ...updated[index], amount: Number(e.target.value) };
                        setSummary(prev => ({ ...prev, feeComponents: updated }));
                        setFeeStructure(prev => ({ ...prev, feeComponents: updated }));
                      }}
                      className="border border-gray-300 rounded-lg p-2 w-full text-sm"
                    />
                  </div>
                ))}

              </div>
            ) : (
              <p className="text-gray-400 text-sm">No fee components found. Please assign a fee structure to this student first.</p>
            )}

            <button
              onClick={handleFeeStructureUpdate}
              className="bg-[#178F9E] text-white px-4 py-2 rounded-lg mt-6"
            >
              Save Changes
            </button>
          </section>


          {/* ---------------- Fee Summary ---------------- */}

          <section>

            <h2 className="text-xl font-bold text-[#0F6F7C] mb-6">
              Fee Summary
            </h2>

            <div className="grid grid-cols-4 gap-6">

              <Summary label="Total Assigned Fee"
                value={summary.totalAssignedFee}
                color="text-[#0F6F7C]"
              />

              <Summary label="Total Paid"
                value={summary.totalPaid}
                color="text-green-600"
              />

              <Summary label="Remaining"
                value={summary.remainingAmount}
                color="text-red-600"
              />

              <div>

                <label className="text-sm text-gray-500">
                  Status
                </label>

                <p className={`font-bold capitalize
${summary.status === "paid"
                    ? "text-green-600"
                    : summary.status === "partial"
                      ? "text-yellow-600"
                      : "text-red-600"}
`}>
                  {summary.status}
                </p>

              </div>

            </div>

            {/* ── Breakdown: One-time vs Monthly ── */}
            {(() => {
              const oneTimeComponents = (summary.feeComponents || []).filter(
                f => f.type === "one-time" && !["tuition", "hostel", "transport"].includes(f.name?.toLowerCase())
              );
              const monthlyComponents = (summary.feeComponents || []).filter(
                f => String(f.type).toLowerCase().trim() === "monthly" || ["tuition", "hostel", "transport"].includes(f.name?.toLowerCase())
              );

              const oneTimeTotal = oneTimeComponents.reduce((s, f) => s + Number(f.amount || 0), 0);
              // For monthly components, if they are explicitly "monthly", they store per-month amount so we do *12.
              // If they are annualized like "tuition", they already contain the annual amount.
              const monthlyTotal = monthlyComponents.reduce((s, f) => {
                if (String(f.type).toLowerCase().trim() === "monthly") {
                  return s + Number(f.amount || 0);
                }
                return s + Number(f.amount || 0); // already annual
              }, 0);

              const oneTimePaid = (summary.payments || [])
                .filter(p => p.componentName)
                .reduce((s, p) => s + Number(p.amount || 0), 0);

              const monthlyPaid = (summary.payments || [])
                .filter(p => p.month && !p.componentName)
                .reduce((s, p) => s + Number(p.amount || 0), 0);

              const oneTimeRemaining = Math.max(oneTimeTotal - oneTimePaid, 0);
              const monthlyRemaining = Math.max(monthlyTotal - monthlyPaid, 0);

              if (oneTimeTotal === 0 && monthlyTotal === 0) return null;

              return (
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-2xl">

                  {/* One-time block */}
                  {oneTimeTotal > 0 && (
                    <div className="rounded-xl border border-[#D9F1F4] bg-white p-4 flex flex-col gap-1">
                      <p className="text-sm font-semibold text-[#0F6F7C]">🧾 One-Time Fees</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Total</span><span className="font-medium text-gray-700">₹{oneTimeTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Paid</span><span className="font-medium text-green-600">₹{oneTimePaid}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Remaining</span>
                        <span className={`font-medium ${oneTimeRemaining === 0 ? "text-green-600" : "text-red-500"}`}>
                          {oneTimeRemaining === 0 ? "✓ Fully Paid" : `₹${oneTimeRemaining}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Monthly block */}
                  {monthlyTotal > 0 && (
                    <div className="rounded-xl border border-[#D9F1F4] bg-white p-4 flex flex-col gap-1">
                      <p className="text-sm font-semibold text-[#0F6F7C]">📅 Monthly Fees (Annual)</p>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Total (12 months)</span><span className="font-medium text-gray-700">₹{monthlyTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Paid</span><span className="font-medium text-green-600">₹{monthlyPaid}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Remaining</span>
                        <span className={`font-medium ${monthlyRemaining === 0 ? "text-green-600" : "text-red-500"}`}>
                          {monthlyRemaining === 0 ? "✓ Fully Paid" : `₹${monthlyRemaining}`}
                        </span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

          </section>


          {/* ---------------- Payment Section ---------------- */}

          <section>

            <h2 className="text-xl font-bold mb-4">Update Payment</h2>

            {/* Tab buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setPaymentMode("monthly")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${paymentMode === "monthly"
                  ? "bg-[#178F9E] text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                📅 Monthly Fee
              </button>
              <button
                onClick={() => setPaymentMode("onetime")}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${paymentMode === "onetime"
                  ? "bg-[#178F9E] text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                🧾 One-Time Fees
              </button>
            </div>

            {/* ── MONTHLY PAYMENT ── */}
            {paymentMode === "monthly" && (
              <div className="flex flex-col gap-3">

                {summary.status === "paid" || Number(summary.remainingAmount) <= 0 ? (
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-400 text-green-700 text-sm font-semibold px-4 py-3 rounded-lg w-fit">
                    ✓ All fees fully paid — no payment due
                  </div>
                ) : (
                  <>
                    {monthlyExpected > 0 && (

                      <div className="inline-flex items-center gap-2 bg-[#E8F9FB] border border-[#178F9E] text-[#0F6F7C] text-sm font-medium px-4 py-2 rounded-lg w-fit">
                        <span>📅 Monthly Fee Required:</span>
                        <span className="font-bold text-base">₹{monthlyExpected}</span>
                      </div>
                    )}
                    {/* Full Year Payment Option */}
                    {summary.remainingAmount > 0 && (
                      <div className="inline-flex items-center gap-2 bg-green-50 border border-green-500 text-green-700 text-sm font-medium px-4 py-2 rounded-lg w-fit mt-2">
                        <span>💰 Full Year Payment:</span>
                        <span className="font-bold text-base">₹{summary.remainingAmount}</span>

                        <button
                          onClick={() => handlePayment(summary.remainingAmount, "onetime")}
                          className="ml-3 bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700"
                        >
                          Pay Full
                        </button>
                      </div>
                    )}

                    {/* Month selector with sequential enforcement */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-gray-500 font-medium">Select Month</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-gray-300 px-4 py-2 rounded-lg text-sm w-72 focus:ring-2 focus:ring-[#178F9E]"
                      >
                        <option value="">-- Select Month --</option>
                        {months.map((m, idx) => {
                          const isPaid = (summary.payments || []).some(
                            p => p.month && p.month.toLowerCase() === m.toLowerCase()
                          );
                          // Disable if any previous month is unpaid
                          const isPrevUnpaid = months.slice(0, idx).some(prev =>
                            !(summary.payments || []).some(
                              p => p.month && p.month.toLowerCase() === prev.toLowerCase()
                            )
                          );
                          const isDisabled = isPaid || isPrevUnpaid;
                          return (
                            <option key={m} value={m} disabled={isDisabled}
                              style={isDisabled ? { color: '#9ca3af', background: '#f3f4f6' } : {}}>
                              {isPaid ? `✓ ${m} (Paid)` : isPrevUnpaid ? `🔒 ${m}` : m}
                            </option>
                          );
                        })}
                      </select>
                      {selectedMonth && (() => {
                        const firstUnpaidIdx = months.findIndex(m =>
                          !(summary.payments || []).some(p => p.month && p.month.toLowerCase() === m.toLowerCase())
                        );
                        const selIdx = months.indexOf(selectedMonth);
                        if (firstUnpaidIdx >= 0 && selIdx > firstUnpaidIdx) {
                          return (
                            <span className="text-xs text-red-500">
                              ⚠ Pay {months[firstUnpaidIdx]} first before paying {selectedMonth}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          placeholder={monthlyExpected > 0 ? `Enter ₹${monthlyExpected}` : "Enter Payment Amount"}
                          value={payAmount}
                          min={1}
                          max={
                            (monthlyExpected > 0 && summary.remainingAmount <= (monthlyExpected / 12) * 1.5)
                              ? summary.remainingAmount
                              : (monthlyExpected > 0 ? (monthlyExpected / 12) : (summary.remainingAmount || undefined))
                          }
                          onChange={(e) => {
                            const val = Number(e.target.value);

                            let maxAllowed = monthlyExpected > 0
                              ? (monthlyExpected)
                              : (summary.remainingAmount || Infinity);

                            if (
                              monthlyExpected > 0 &&
                              summary.remainingAmount > 0 &&
                              summary.remainingAmount <= (monthlyExpected / 12) * 1.5
                            ) {
                              maxAllowed = summary.remainingAmount;
                            }

                            setPayAmount(val > maxAllowed ? String(maxAllowed) : e.target.value);
                          }}
                          className="border rounded-lg p-3 w-72 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        {monthlyExpected > 0 && (
                          <span className="text-xs text-gray-500">
                            Enter exact amount: <strong>₹{monthlyExpected}</strong>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handlePayment()}
                        className="bg-[#178F9E] text-white px-6 py-3 rounded-lg"
                      >
                        Pay Monthly Fee
                      </button>
                    </div>
                  </>
                )}

              </div>
            )}

            {/* ── ONE-TIME PAYMENTS ── */}
            {paymentMode === "onetime" && (
              <div className="flex flex-col gap-4">

                {(summary.feeComponents || []).filter(f => f.type === "one-time" && !["tuition", "hostel", "transport"].includes(f.name?.toLowerCase())).length === 0 && (
                  <p className="text-gray-400 text-sm">No one-time fee components found in fee structure.</p>
                )}

                <div className="grid grid-cols-2 gap-4 max-w-xl">
                  {(summary.feeComponents || [])
                    .filter(f => f.type === "one-time" && !["tuition", "hostel", "transport"].includes(f.name?.toLowerCase()))
                    .map((comp, idx) => (
                      <div key={idx} className="border border-[#D9F1F4] rounded-xl p-4 bg-[#F4FDFE] flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[#0F6F7C] capitalize">{comp.name} Fee</span>
                          <span className="text-lg font-bold text-gray-800">₹{comp.amount}</span>
                        </div>
                        <span className="text-xs text-gray-400">One-time payment</span>
                        {paidOneTimeComponents.has(comp.name.toLowerCase()) ? (
                          <div className="bg-green-100 text-green-700 text-sm py-2 rounded-lg mt-1 text-center font-medium">
                            ✓ Paid
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePayment(comp.amount, "onetime", comp.name)}
                            className="bg-[#178F9E] text-white text-sm py-2 rounded-lg mt-1 hover:bg-[#0F6F7C] transition"
                          >
                            Pay ₹{comp.amount}
                          </button>
                        )}
                      </div>
                    ))}
                </div>

              </div>
            )}

          </section>


          {/* ---------------- Monthly Fee Status ---------------- */}

          <section>

            <h2 className="text-xl font-bold text-[#0F6F7C] mb-6">
              Monthly Fee Status (Session: April - March)
            </h2>

            <div className="grid grid-cols-4 gap-6 max-w-4xl">

              {months.map((month, index) => {

                const paid = Math.min(monthlyFees[month] || 0, monthlyExpected);
                const pending = Math.max((monthlyExpected) - paid, 0);


                const status = getMonthStatus(month);

                return (

                  <div
                    key={month}
                    className={`h-24 rounded-xl border flex flex-col items-center justify-center text-center font-semibold shadow-sm transition hover:scale-105
          
          ${status === "full"
                        ? "bg-green-400 text-white"
                        : status === "partial"
                          ? "bg-yellow-400 text-black"
                          : "bg-red-400 text-white"
                      }
          `}
                  >

                    <p className="text-lg">{month.slice(0, 3)}</p>
                    <p className="text-xs font-semibold">
                      {status === "full" ? (
                        paid > 0
                          ? <span className="text-white">₹{paid} Paid</span>
                          : <span className="text-white">✓ Paid</span>
                      ) : (
                        <>
                          {paid > 0 && (
                            <span className="text-white">₹{paid} Paid</span>
                          )}
                          {pending > 0 && (
                            <span className="text-red-200 block">
                              ₹{pending} Pending
                            </span>
                          )}
                        </>
                      )}
                    </p>

                  </div>

                );

              })}

            </div>

          </section>
        </>

      )}


    </div>

  )

}

/* ---------------- Components ---------------- */

function Input({ label, value }) {

  return (

    <div>

      <label className="text-sm text-gray-500">
        {label}
      </label>

      <input
        value={value || ""}
        readOnly
        className="border rounded-lg p-3 w-full"
      />

    </div>

  )

}

function EditableInput({ label, value, onChange }) {

  return (

    <div>

      <label className="text-sm text-gray-500 flex gap-1">
        <Pencil size={15} />
        {label}
      </label>


      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border border-gray-300 focus:border-[#178F9E] focus:ring-1 focus:ring-[#178F9E] p-3 rounded-md appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

    </div>

  )

}

function Summary({ label, value, color }) {

  return (

    <div>

      <label className="text-sm text-gray-500">
        {label}
      </label>

      <p className={`font-bold ${color}`}>
        ₹{value || 0}
      </p>


    </div>


  )

}