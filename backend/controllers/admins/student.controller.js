const mongoose = require("mongoose");
const Student = require("../../models/student.model");
const Class = require("../../models/class.model");
const StudentFee = require("../../models/studentFee.model");
const FeeStructure = require("../../models/feeStructure.model");
const fs = require("fs");
const path = require("path");
// =====================================
// AUTO GENERATE ADMISSION NUMBER
// =====================================
const generateAdmissionNumber = async () => {
  const lastStudent = await Student.findOne()
    .sort({ admissionNumber: -1 })
    .select("admissionNumber");

  if (!lastStudent) {
    return "ADM1001";
  }

  const lastNumber = parseInt(
    lastStudent.admissionNumber.replace("ADM", "")
  );

  return `ADM${lastNumber + 1}`;
};

// =====================================
// CREATE STUDENT (AUTO CLASS FETCH)
// =====================================
exports.createStudent = async (req, res) => {
  try {
    console.log("BODY 👉", req.body);
    console.log("FILE 👉", req.file);

    const {
      firstName,
      lastName,
      gender,
      course,
      section,
      fatherName,
      motherName,
      parentPhone,
      phone,
      email,
      altEmail,
      address,
      category,
      dateOfBirth,
    } = req.body;

    // ========================
    // BASIC VALIDATION
    // ========================
    if (!firstName || !course) {
      return res.status(400).json({
        success: false,
        message: "First Name and Class are required",
      });
    }

    // ========================
    // DOB VALIDATION
    // ========================
    let dob = null;

    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();

      if (isNaN(birthDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date of birth",
        });
      }

      if (birthDate > today) {
        return res.status(400).json({
          success: false,
          message: "DOB cannot be in future",
        });
      }

      dob = birthDate;
    }

    // ========================
    // PHONE VALIDATION
    // ========================
    const phoneRegex = /^[0-9]{10}$/;

    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (parentPhone && !phoneRegex.test(parentPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent phone number",
      });
    }

    // ========================
    // EMAIL VALIDATION
    // ========================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // ========================
    // CLASS FETCH
    // ========================
    const selectedSection = section || "A";

    const classData = await Class.findOne({
      className: { $in: [course, Number(course)] },
      section: selectedSection,
      status: "active",
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: "Selected class not found",
      });
    }

    // ========================
    // ADMISSION NUMBER
    // ========================
    const admissionNumber = await generateAdmissionNumber();

    // ========================
    // CREATE STUDENT
    // ========================
    const student = await Student.create({
      admissionNumber,

      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      gender,

      classId: classData._id,
      section: selectedSection,

      fatherName,
      motherName,
      parentPhone,
      phone,

      email,
      altEmail,
      address,
      category,


      city: req.body.city || "",
      shortBio: req.body.shortBio || "",
      skills: req.body.skills ? JSON.parse(req.body.skills) : [],
      social: req.body.social ? JSON.parse(req.body.social) : {},
      dateOfBirth: dob,

      profileImage: req.file ? `uploads/${req.file.filename}` : "",
    });

    // ========================
    // AUTO ASSIGN FEE
    // ========================
    const feeStructure = await FeeStructure.findOne({
      className: course,
      status: "active",
    });

    if (feeStructure) {
      const existingFee = await StudentFee.findOne({
        studentId: student._id,
      });

      if (!existingFee) {
        await StudentFee.create({
          studentId: student._id,
          feeStructureId: feeStructure._id,

          // ✅ feeComponents must be saved so monthlyExpected calculates correctly
          feeComponents: feeStructure.feeComponents || [],

          totalAssignedFee: feeStructure.totalFee,
          remainingAmount: feeStructure.totalFee,
          totalPaid: 0,
          status: "due",
        });
      }
    }

    // ========================
    // RESPONSE
    // ========================
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });

  } catch (error) {
    console.error("CREATE STUDENT ERROR ❌", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// GET STUDENTS BY CLASS
// =====================================
exports.getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Class ID",
      });
    }

    const students = await Student.find({ classId })
      .populate("classId")
      .sort({ createdAt: 1 })
      .lean();

    const studentIds = students.map(s => s._id);

    const fees = await StudentFee.find({
      studentId: { $in: studentIds }
    }).lean();

    const feeMap = {};
    fees.forEach(f => {
      feeMap[f.studentId.toString()] = f;
    });

    const finalData = students.map(s => ({
      ...s,
      fee: feeMap[s._id.toString()] || null
    }));

    res.status(200).json({
      success: true,
      count: finalData.length,
      data: finalData,
    });

  } catch (error) {
    console.error("Get Students Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate("classId");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });

  } catch (error) {
    console.error("Get Student Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// DELETE STUDENT
// =====================================
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Student ID",
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // ❌ yeh line hata di
    // await StudentFee.deleteMany({ studentId: id });

    // ✅ sirf yeh chalega
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });

  } catch (error) {
    console.error("Delete Student Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE STUDENT



exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    let updateData = {};

    // ✅ only include valid fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && req.body[key] !== "") {
        updateData[key] = req.body[key];
      }
    });

    // =========================
    // ✅ DATE FIX
    // =========================
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    // =========================
    // ✅ JSON PARSE
    // =========================
    if (updateData.skills && typeof updateData.skills === "string") {
      updateData.skills = JSON.parse(updateData.skills);
    }

    if (updateData.social && typeof updateData.social === "string") {
      updateData.social = JSON.parse(updateData.social);
    }

    // =========================
    // 🔥 REMOVE IMAGE (MAIN FIX)
    // =========================
    if (req.body.removeImage === "true") {
      if (student.profileImage) {
        const filePath = path.join(__dirname, "..", student.profileImage);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      updateData.profileImage = null;
    }

    // =========================
    // 🔥 NEW IMAGE UPLOAD
    // =========================
    if (req.file) {
      // delete old image
      if (student.profileImage) {
        const filePath = path.join(__dirname, "..", student.profileImage);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      updateData.profileImage = `uploads/${req.file.filename}`;
    }
    // ✅ UPDATE
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });

  } catch (error) {
    console.error("Update Student Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};