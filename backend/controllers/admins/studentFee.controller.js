const StudentFee = require("../../models/studentFee.model");
const Student = require("../../models/student.model");
const FeeStructure = require("../../models/feeStructure.model");
const Class = require("../../models/class.model");
const Invoice = require("../../models/invoice.model");

// ================================
// HELPER: Get or Create Fee Structure
// ================================
const getOrCreateFeeStructure = async (className) => {
  const anyClass = await Class.findOne({ className });

  if (!anyClass) return null;

  let feeStructure = await FeeStructure.findOne({
    className,
    status: "active",
  });

  if (!feeStructure) {
    const feeComponents = [
      { name: "tuition", amount: 5000, type: "monthly" },
      { name: "admission", amount: 1000, type: "one-time" },
      { name: "exam", amount: 1000, type: "one-time" }
    ];

    const totalFee = feeComponents.reduce(
      (sum, f) => sum + (f.type === "monthly" ? f.amount * 12 : f.amount),
      0
    );

    feeStructure = await FeeStructure.create({
      classId: anyClass._id,
      className,
      feeComponents,
      totalFee,
      lateFeePerDay: 50,
      status: "active"
    });
  }

  return feeStructure;
};

// ================================
// ASSIGN FEE TO STUDENT
// ================================
exports.assignFeeToStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Student.findById(studentId).populate("classId");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const feeStructure = await getOrCreateFeeStructure(student.classId.className);

    const exists = await StudentFee.findOne({
      studentId,
      feeStructureId: feeStructure._id,
    });

    if (exists) {
      return res.status(400).json({ success: false, message: "Already assigned" });
    }

    const studentFee = await StudentFee.create({
      studentId,
      feeStructureId: feeStructure._id,
      feeComponents: feeStructure.feeComponents,
      totalAssignedFee: feeStructure.totalFee,
      remainingAmount: feeStructure.totalFee,
      totalPaid: 0,
      status: "due",
      payments: []
    });

    res.json({ success: true, data: studentFee });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================================
// GET FEES BY STUDENT ID
// ================================
exports.getFeesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1️⃣ Validate student
    const student = await Student.findById(studentId)
      .populate("classId");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // 2️⃣ Get fee record
    let fee = await StudentFee.findOne({ studentId })
      .populate("feeStructureId")
      .lean();

    // 3️⃣ If not exist → create automatically
    if (!fee) {
      const feeStructure = await FeeStructure.findOne({
        className: student.classId.className,
        status: "active",
      });

      if (!feeStructure) {
        return res.status(404).json({
          success: false,
          message: "Fee structure not found",
        });
      }

      fee = await StudentFee.create({
        studentId: student._id,
        feeStructureId: feeStructure._id,
        feeComponents: feeStructure.feeComponents,
        totalAssignedFee: feeStructure.totalFee,
        remainingAmount: feeStructure.totalFee,
        totalPaid: 0,
        status: "due",
        payments: []
      });

      fee = await StudentFee.findById(fee._id)
        .populate("feeStructureId")
        .lean();
    }

    // 4️⃣ Monthly breakdown (optional but useful)
    const monthlyFees = {};

    if (fee.payments && fee.payments.length > 0) {
      fee.payments.forEach(p => {
        // Only count payments tagged as monthly (skip one-time: admission, exam, etc.)
        if (!p.month) return;

        const monthKey = p.month;
        if (!monthKey) return;
        if (!monthlyFees[monthKey]) monthlyFees[monthKey] = 0;
        monthlyFees[monthKey] += p.amount;
      });
    }

    // 5️⃣ Response
    res.status(200).json({
      success: true,
      student,
      fee,
      monthlyFees
    });

  } catch (error) {
    console.error("GetFeesByStudent Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update student specific fee
exports.updateStudentSpecificFee = async (req, res) => {
  try {
    const { admissionNumber } = req.params;
    const { feeComponents = [] } = req.body;

    const student = await Student.findOne({ admissionNumber });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    let studentFee = await StudentFee.findOne({ studentId: student._id });

    if (!studentFee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found"
      });
    }

    // 🔥 calculate total — monthly components × 12, one-time as-is (case-insensitive)
    const total = feeComponents.reduce(
      (sum, f) => sum + (String(f.type).toLowerCase().trim() === "monthly" ? Number(f.amount || 0) * 12 : Number(f.amount || 0)),
      0
    );

    studentFee.feeComponents = feeComponents;
    studentFee.totalAssignedFee = total;

    if (studentFee.totalPaid > total) {
      studentFee.totalPaid = total;
    }

    studentFee.remainingAmount = total - studentFee.totalPaid;

    if (studentFee.remainingAmount <= 0) {
      studentFee.status = "paid";
    } else if (studentFee.totalPaid > 0) {
      studentFee.status = "partial";
    } else {
      studentFee.status = "due";
    }

    await studentFee.save();

    res.json({
      success: true,
      message: "Student fee updated successfully",
      data: studentFee
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================================
// GET BY ADMISSION NUMBER
// ================================
exports.getFeeByAdmissionNumber = async (req, res) => {
  try {
    const { admissionNumber } = req.params;

    const student = await Student.findOne({ admissionNumber }).populate("classId");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    let fee = await StudentFee.findOne({ studentId: student._id })
      .populate("feeStructureId")
      .lean();

    if (!fee) {
      const feeStructure = await getOrCreateFeeStructure(student.classId.className);

      fee = await StudentFee.create({
        studentId: student._id,
        feeStructureId: feeStructure._id,
        feeComponents: feeStructure.feeComponents,
        totalAssignedFee: feeStructure.totalFee,
        remainingAmount: feeStructure.totalFee,
        totalPaid: 0,
        status: "due",
        payments: []
      });

      fee = await StudentFee.findById(fee._id).lean();


    } else if (!fee.feeComponents || fee.feeComponents.length === 0) {
      // Self-heal: existing record has no feeComponents → pull from feeStructure
      // NOTE: fee.feeStructureId is already populated (full object) due to .populate() above
      const populatedFeeStructure = fee.feeStructureId;
      const feeStructureComponents =
        populatedFeeStructure?.feeComponents?.length > 0
          ? populatedFeeStructure.feeComponents
          : null;

      if (feeStructureComponents) {
        await StudentFee.findByIdAndUpdate(fee._id, {
          feeComponents: feeStructureComponents
        });
        fee = { ...fee, feeComponents: feeStructureComponents };
      }
    }


    // monthlyExpected = per-month amount (the amount stored in feeComponents for type=monthly, or annual tuition/hostel/transport divided by 12)
    let monthlyExpectedSum = 0;
    (fee.feeComponents || []).forEach(f => {

      const type = String(f.type || "").toLowerCase().trim();

      const isRecurring = type === "monthly";

      if (isRecurring) {
        const amt = Number(f.amount || 0);
        // Smart annual detection: if amount is large, assume yearly. Else, treat as monthly.
        if (type === "monthly") {
          // amount is yearly → convert to monthly
          monthlyExpectedSum += Number(f.amount || 0) / 12;
        }
      }
    });

    const monthlyExpected = Math.round(monthlyExpectedSum);

    // Build monthlyFees map from payments
    const monthlyFees = {};

    if (fee.payments && fee.payments.length > 0) {

      const normalizeMonth = (m) => {
        if (!m) return null;

        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        return months.find(mon => mon.toLowerCase() === m.toLowerCase()) || null;
      };

      fee.payments.forEach(p => {

        // ❗ ONLY use p.month (IMPORTANT)
        if (!p.month) return;

        const monthKey = normalizeMonth(p.month);
        if (!monthKey) return;

        if (!monthlyFees[monthKey]) {
          monthlyFees[monthKey] = 0;
        }

        monthlyFees[monthKey] += Number(p.amount || 0);

      });
    }

    res.json({ success: true, student, fee, monthlyExpected: monthlyExpected > 0 ? monthlyExpected : 0, monthlyFees });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStudentFee = async (req, res) => {
  try {
    const { admissionNumber, payAmount, month, paymentType, componentName } = req.body;

    if (!admissionNumber || !payAmount) {
      return res.status(400).json({ success: false, message: "admissionNumber and payAmount are required" });
    }

    if (paymentType !== "onetime" && !month) {
      return res.status(400).json({ success: false, message: "month is required for monthly payments" });
    }

    const student = await Student.findOne({ admissionNumber }).populate("classId");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const fee = await StudentFee.findOne({ studentId: student._id });
    if (!fee) return res.status(404).json({ success: false, message: "Fee record not found" });

    if (fee.remainingAmount <= 0) {
      return res.status(400).json({ success: false, message: "All fees are already fully paid" });
    }

    const payment = Number(payAmount);
    if (!payment || payment <= 0) {
      return res.status(400).json({ success: false, message: "Enter a valid payment amount" });
    }

    // ─── ONE-TIME PAYMENT ───────────────────────────────────────
    if (paymentType === "onetime") {
      const date = new Date();
      const label = componentName || "one-time";

      const alreadyPaid = fee.payments.some(
        p => p.componentName && p.componentName.toLowerCase() === label.toLowerCase()
      );
      if (alreadyPaid) {
        return res.status(400).json({ success: false, message: `${label} fee has already been paid` });
      }

      if (payment > fee.remainingAmount) {
        return res.status(400).json({ success: false, message: `Payment ₹${payment} exceeds remaining ₹${fee.remainingAmount}` });
      }

      const invoice = await Invoice.create({
        invoiceNumber: `INV-${Date.now()}`,
        studentId: student._id,
        amount: payment,
        month: label,
        studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        className: student.classId?.className || "N/A",
        section: student.classId?.section || "N/A",
      });

      fee.payments.push({ amount: payment, date, componentName: label, invoiceId: invoice._id });
      fee.totalPaid += payment;
      fee.remainingAmount = fee.totalAssignedFee - fee.totalPaid;
      fee.status = fee.remainingAmount <= 0 ? "paid" : "partial";
      await fee.save();

      return res.json({ success: true, data: fee, invoiceId: invoice._id });
    }

    // ─── MONTHLY PAYMENT ────────────────────────────────────────
    // Self-heal: feeComponents missing ho toh feeStructure se lo
    if (!fee.feeComponents || fee.feeComponents.length === 0) {
      const feeStruct = await FeeStructure.findById(fee.feeStructureId);
      if (feeStruct?.feeComponents?.length > 0) {
        fee.feeComponents = feeStruct.feeComponents;
        await StudentFee.findByIdAndUpdate(fee._id, { feeComponents: feeStruct.feeComponents });
      }
    }

    let monthlyExpectedSum = 0;
    (fee.feeComponents || []).forEach(f => {
      if (String(f.type || "").toLowerCase().trim() === "monthly") {
        monthlyExpectedSum += Number(f.amount || 0) / 12;
      }
    });

    const monthlyTotal = Math.round(monthlyExpectedSum);

    if (monthlyTotal === 0) {
      return res.status(400).json({ success: false, message: "Monthly fee structure not configured properly" });
    }

    if (payment !== monthlyTotal && payment !== fee.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Pay exact monthly fee: ₹${monthlyTotal} or remaining balance: ₹${fee.remainingAmount}`
      });
    }

    const invoice = await Invoice.create({
      invoiceNumber: `INV-${Date.now()}`,
      studentId: student._id,
      amount: payment,
      month,
      studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim(),
      className: student.classId?.className || "N/A",
      section: student.classId?.section || "N/A",
    });

    fee.payments.push({
      amount: payment,
      date: new Date(`${month} 1, ${new Date().getFullYear()}`),
      month,
      invoiceId: invoice._id,  // ✅
    });

    fee.totalPaid += payment;
    fee.remainingAmount = fee.totalAssignedFee - fee.totalPaid;
    fee.status = fee.remainingAmount <= 0 ? "paid" : "partial";
    await fee.save();

    return res.json({ success: true, data: fee, invoiceId: invoice._id });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// ================================
// ASSIGN FEE TO CLASS
// ================================
exports.assignFeeToClass = async (req, res) => {
  try {
    const { classId } = req.body;

    const students = await Student.find({ classId });
    const classData = await Class.findById(classId);

    const feeStructure = await getOrCreateFeeStructure(classData.className);

    for (const student of students) {
      const exists = await StudentFee.findOne({ studentId: student._id });

      if (!exists) {
        await StudentFee.create({
          studentId: student._id,
          feeStructureId: feeStructure._id,
          feeComponents: feeStructure.feeComponents,
          totalAssignedFee: feeStructure.totalFee,
          remainingAmount: feeStructure.totalFee,
          totalPaid: 0,
          status: "due"
        });
      }
    }

    res.json({ success: true, message: "Assigned to class" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};