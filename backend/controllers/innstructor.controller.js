const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const User = require("../models/user.model");

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

module.exports = {
  getInstructorProfile,
  getDashboardData,
};
