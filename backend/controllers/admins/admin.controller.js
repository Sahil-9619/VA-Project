const Course = require("../../models/course.model");
const Enrollment = require("../../models/enrollment.model");
const User = require("../../models/user.model");
const Role = require("../../models/role.model");
const bcrypt = require("bcrypt");
const Student = require("../../models/student.model");
const StudentFee = require("../../models/studentFee.model");
const Class = require("../../models/class.model");

const getInstructorProfile = async (req, res) => {
  try {
    const instructorId = req.params.id;

    // 1. Fetch instructor with role populated
    const instructor = await User.findById(instructorId)
      .select(
        "name email profileImage designation experience shortBio skills location social role"
      )
      .populate("role", "name"); // populate role name only

    if (!instructor) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Ensure the user is an instructor
    if (instructor.role?.name !== "instructor") {
      return res
        .status(403)
        .json({ message: "This user is not an instructor" });
    }

    // 3. Fetch only published courses by this instructor
    const courses = await Course.find({
      instructor: instructorId,
      isPublished: true,
    })
      .populate("instructor", "name profileImage") // populate only name & profileImage

      .select(
        "title slug category price discountPrice thumbnail rating studentsEnrolled duration level description instructor isPublished createdAt"
      )

      .lean();

    // 4. For each course, get enrollment count
    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id,
        });
        return {
          ...course,
          enrollments: enrollmentCount,
        };
      })
    );

    res.status(200).json({
      instructor,
      courses: coursesWithEnrollments,
    });
  } catch (error) {
    console.error("Error fetching instructor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new user (student/instructor/admin) by admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, roleName } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already in use" });

    // Resolve role by name; default handled by User pre-save if none provided
    let roleId = null;
    if (roleName) {
      const role = await Role.findOne({ name: roleName });
      if (!role) return res.status(400).json({ message: "Invalid role name" });
      roleId = role._id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      role: roleId || undefined,
      isVerified: true,
      maxDevices: 5,
    });

    const created = await User.findById(newUser._id)
      .select("name email phone profileImage role isVerified")
      .populate("role", "name");

    res
      .status(201)
      .json({ message: "User created successfully", user: created });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const COMMISSION_RATE = 0.1; // 10% commission

const getDashboardData = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // 1️⃣ Total courses by this instructor
    const totalCourses = await Course.countDocuments({
      instructor: instructorId,
    });

    // 2️⃣ Fetch all courses of this instructor
    const courses = await Course.find({ instructor: instructorId }).select(
      "_id title"
    );
    const courseIds = courses.map((course) => course._id);

    // 3️⃣ Total students across all courses
    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: "active",
    });

    // 4️⃣ Recent enrollments (last 5)
    const recentEnrollments = await Enrollment.find({
      course: { $in: courseIds },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email profileImage")
      .populate("course", "title slug price");

    // 5️⃣ Revenue stats
    const allEnrollments = await Enrollment.find({
      course: { $in: courseIds },
      "payment.paymentStatus": "completed",
    });

    // Fix totalRevenue and monthlyRevenue using revenue after commission
    let totalRevenue = 0;
    const monthlyRevenue = {};

    allEnrollments.forEach((enrollment) => {
      const amount = enrollment.payment?.amount || 0;
      const revenue = amount - amount * COMMISSION_RATE; // net revenue

      totalRevenue += revenue;

      const month = new Date(enrollment.payment.paymentDate).toLocaleString(
        "default",
        {
          month: "short",
          year: "numeric",
        }
      );
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenue;
    });

    // Enrollment count per course
    const enrollmentsPerCourse = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds }, status: "active" } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);

    // Completion % per course
    const completionPerCourse = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $project: { course: 1, completion: "$progress.completionPercentage" } },
      { $group: { _id: "$course", avgCompletion: { $avg: "$completion" } } },
    ]);

    res.status(200).json({
      totalCourses,
      totalStudents,
      totalRevenue, // keep same key as before
      monthlyRevenue,
      recentEnrollments,
      enrollmentsPerCourse,
      completionPerCourse,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin-wide dashboard with full platform metrics
const getAdminDashboardData = async (req, res) => {
  try {
    const [
      totalUsers,
      totalClasses,
      totalEnrollments,
      activeEnrollments,
    ] = await Promise.all([
      User.countDocuments({}),
      Class.countDocuments({}),
      Course.countDocuments({ isPublished: true }),
      Enrollment.countDocuments({}),
      Enrollment.countDocuments({ status: "active" }),
    ]);

    // ===============================
    // 📊 ENROLLMENTS PER CLASS
    // ===============================
    const enrollmentsPerClass = await Student.aggregate([
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: "$class" },
      {
        $group: {
          _id: {
            className: "$class.className",
            section: "$class.section",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: {
            $concat: [
              "Class ",
              { $toString: "$_id.className" },  // 👈 FIX
              " - ",
              { $toString: "$_id.section" }     // 👈 FIX
            ],
          },
          count: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    // ===============================
    // 💰 STUDENT FEE REVENUE
    // ===============================
    const feeRevenue = await StudentFee.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$totalPaid" },
          totalAssigned: { $sum: "$totalAssignedFee" }
        }
      }
    ]);

    const totalCollectedRevenue = feeRevenue[0]?.totalCollected || 0;
    const totalExpectedRevenue = feeRevenue[0]?.totalAssigned || 0;
    const totalPendingRevenue =
      totalExpectedRevenue - totalCollectedRevenue;

    // ===============================
    // 📅 MONTHLY STUDENT FEE REVENUE 
    // ===============================
    const monthlyFeeData = await StudentFee.aggregate([
      { $unwind: "$payments" },
      {
        $project: {
          year: {
            $year: {
              date: "$payments.date",
              timezone: "Asia/Kolkata"
            }
          },
          month: {
            $month: {
              date: "$payments.date",
              timezone: "Asia/Kolkata"
            }
          },

          // ✅ ONLY monthly fees
          expected: {
            $add: [
              { $divide: ["$tuitionFee", 12] },
              { $divide: ["$hostelFee", 12] },
              { $divide: ["$transportFee", 12] }
            ]
          },

          collected: "$payments.amount"
        }
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            studentId: "$_id"
          },
          expected: { $first: "$expected" },
          collected: { $sum: "$collected" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);
    const monthlyFeeRevenue = monthlyFeeData.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);

      const expected = Math.round(item.expected);
      const collected = item.collected;
      const pending = Math.max(expected - collected, 0);

      return {
        month: date.toLocaleString("default", {
          month: "short",
          year: "numeric"
        }),
        expected,
        collected,
        pending
      };
    });

    // ===============================
    // ROLE BREAKDOWN
    // ===============================
    const roleBreakdown = await User.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: "$role" },
      { $group: { _id: "$role.name", count: { $sum: 1 } } },
    ]);

    let totalInstructors = 0;
    roleBreakdown.forEach((r) => {
      if (r._id === "instructor") totalInstructors = r.count;
    });

    const totalStudents = await Student.countDocuments();

    // ===============================
    // COURSE REVENUE (UNCHANGED)
    // ===============================
    const monthlyGross = await Enrollment.aggregate([
      { $match: { "payment.paymentStatus": "completed" } },
      {
        $group: {
          _id: {
            y: { $year: "$payment.paymentDate" },
            m: { $month: "$payment.paymentDate" },
          },
          gross: { $sum: "$payment.amount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]);

    let grossRevenue = 0;
    const monthly = monthlyGross.map((row) => {
      const date = new Date(row._id.y, row._id.m - 1, 1);
      const label = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      grossRevenue += row.gross || 0;
      const profit = (row.gross || 0) * COMMISSION_RATE;
      const net = (row.gross || 0) - profit;
      return { month: label, gross: row.gross || 0, net, profit };
    });

    const totalGrossRevenue =
      grossRevenue + totalCollectedRevenue; //  add fees also

    const platformProfit = grossRevenue * COMMISSION_RATE; // only courses pe commission
    const netPayoutToInstructors = grossRevenue - platformProfit;

    // ===============================
    // FINAL RESPONSE
    // ===============================
    res.status(200).json({
      totals: {
        users: totalUsers,
        instructors: totalInstructors,
        students: totalStudents,
        classes: totalClasses,
        enrollments: totalEnrollments,
        activeEnrollments,
      },
      revenue: {
        grossRevenue: totalGrossRevenue,
        netPayoutToInstructors,
        platformProfit,
        monthly, // course revenue
        totalCollectedRevenue,
        totalExpectedRevenue,
        totalPendingRevenue,
        monthlyFeeRevenue, // 
      },
      enrollmentsPerClass,

    });

  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all users with their roles populated + pagination/search/summary
const getAllUsersWithRole = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const search = (req.query.search || "").trim();
    const roleName = (req.query.role || "").trim(); // optional filter by role name

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // If role name provided, resolve to role _id for filtering
    if (roleName) {
      const roleDoc = await Role.findOne({ name: roleName });
      if (!roleDoc) {
        return res.status(200).json({
          users: [],
          pagination: { page, limit, totalPages: 0, totalItems: 0 },
          summary: { totalUsers: 0, byRole: {} },
        });
      }
      filter.role = roleDoc._id;
    }

    const skip = (page - 1) * limit;

    const [users, totalItems, roleBreakdown] = await Promise.all([
      User.find(filter)
        .select("name email profileImage role isVerified")
        .populate("role", "name")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
      // Summary via aggregation to role names (apply same filter without pagination)
      User.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "roles",
            localField: "role",
            foreignField: "_id",
            as: "role",
          },
        },
        { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$role.name",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const byRole = {};
    roleBreakdown.forEach((r) => {
      const key = r._id || "no_role";
      byRole[key] = r.count;
    });

    const totalPages = Math.ceil(totalItems / limit) || 0;

    res.status(200).json({
      users,
      pagination: { page, limit, totalPages, totalItems },
      summary: { totalUsers: totalItems, byRole },
    });
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//fetch student details
const getUserWithStudentCheck = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ User find karo
    const user = await User.findById(id).populate("role", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Student table me same email check karo
    const student = await Student.findOne({ email: user.email });

    // 3️⃣ Agar student mil gaya
    if (student) {
      return res.status(200).json({
        type: "student",
        data: student,
      });
    }

    // 4️⃣ Nahi mila to normal user bhejo
    return res.status(200).json({
      type: "user",
      data: user,
    });

  } catch (error) {
    console.error("Error in user-student check:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch a single user with full details and populated role
const getUserByIdWithDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate("role", "name permissions");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user detail:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a user by admin
const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, roleName, isVerified, password } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (typeof isVerified === "boolean" || isVerified === true || isVerified === false) updates.isVerified = isVerified;

    // If roleName is provided, resolve to Role _id
    if (roleName) {
      const role = await Role.findOne({ name: roleName });
      if (!role) return res.status(400).json({ message: "Invalid role name" });
      updates.role = role._id;
    }

    // If email is changing, ensure uniqueness
    if (updates.email) {
      const existing = await User.findOne({ email: updates.email, _id: { $ne: id } });
      if (existing) return res.status(400).json({ message: "Email already in use" });
    }

    // Optionally update password if provided
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true })
      .select("name email phone profileImage role isVerified")
      .populate("role", "name");

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a user by admin
const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getInstructorProfile,
  getDashboardData,
  getAdminDashboardData,
  getAllUsersWithRole,
  getUserByIdWithDetail,
  createUser,
  updateUserByAdmin,
  deleteUserByAdmin,
  getUserWithStudentCheck,
};
