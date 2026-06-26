const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const puppeteer = require("puppeteer");
const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.model");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");

// Enroll in a course
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { paymentMethod, transactionId, paymentStatus } = req.body;
    const userId = req.user.id;

    // 1. Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return res
        .status(404)
        .json({ message: "Course not found or not available" });
    }

    // 2. Check if user already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // 3. Handle free courses (direct enrollment)
    if (course.isFree || course.price === 0) {
      const enrollment = new Enrollment({
        user: userId,
        course: courseId,
        payment: {
          amount: 0,
          paymentMethod: "free",
          paymentStatus: "completed",
          paymentDate: new Date(),
        },
      });

      await enrollment.save();
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledUsers: userId },
      });

      return res.status(201).json({
        message: "Successfully enrolled in free course",
        enrollment,
      });
    }

    // 4. Paid courses → Check if payment is completed
    if (!transactionId || paymentStatus !== "completed") {
      // If payment not completed, create a pending payment record and return
      const pendingPayment = new Payment({
        user: userId,
        course: courseId,
        amount: course.discountPrice || course.price,
        paymentMethod: paymentMethod || "stripe",
        status: "pending",
      });

      await pendingPayment.save();

      return res.status(200).json({
        message: "Payment initiated. Complete the payment to get access.",
        paymentId: pendingPayment._id,
        amount: pendingPayment.amount,
      });
    }

    // 5. Payment completed → Save payment + enrollment
    const payment = new Payment({
      user: userId,
      course: courseId,
      amount: course.discountPrice || course.price,
      paymentMethod: paymentMethod || "stripe",
      status: "completed",
      transactionId,
      metadata: req.body.metadata || {},
    });

    await payment.save();

    const enrollment = new Enrollment({
      user: userId,
      course: courseId,
      payment: {
        transactionId,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        paymentStatus: "completed",
        paymentDate: new Date(),
      },
    });

    await enrollment.save();

    // Link payment <-> enrollment
    payment.enrollment = enrollment._id;
    await payment.save();

    // Add user to course enrolledUsers
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledUsers: userId },
    });

    res.status(201).json({
      message: "Enrollment completed successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Unified enrollment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Complete enrollment after successful payment
// const completeEnrollment = async (req, res) => {
//   try {
//     const { paymentId, transactionId } = req.body;
//     const userId = req.user.id;

//     // Find and update payment
//     const payment = await Payment.findOneAndUpdate(
//       { _id: paymentId, user: userId, status: "pending" },
//       {
//         status: "completed",
//         transactionId,
//         metadata: req.body.metadata || {},
//       },
//       { new: true }
//     );

//     if (!payment) {
//       return res
//         .status(404)
//         .json({ message: "Payment not found or already processed" });
//     }

//     // Create enrollment
//     const enrollment = new Enrollment({
//       user: userId,
//       course: payment.course,
//       payment: {
//         transactionId,
//         amount: payment.amount,
//         currency: payment.currency,
//         paymentMethod: payment.paymentMethod,
//         paymentStatus: "completed",
//         paymentDate: new Date(),
//       },
//     });

//     await enrollment.save();

//     // Update payment with enrollment reference
//     payment.enrollment = enrollment._id;
//     await payment.save();

//     // Add user to course's enrolled users
//     await Course.findByIdAndUpdate(payment.course, {
//       $addToSet: { enrolledUsers: userId },
//     });

//     res.status(201).json({
//       message: "Enrollment completed successfully",
//       enrollment,
//     });
//   } catch (error) {
//     console.log("-->Complete enrollment error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Get user's enrollments
const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: "course",
        select:
          "title slug thumbnail category price discountPrice level totalDuration",
        populate: {
          path: "category",
          select: "name slug",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(query);

    res.status(200).json({
      enrollments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get specific enrollment details
const getEnrollmentDetails = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
    }).populate({
      path: "course",
      populate: {
        path: "category instructor",
        select: "name email",
      },
    });

    if (!enrollment) {
      return res.status(401).json({ message: "Enrollment not found" });
    }

    // Calculate current progress
    await enrollment.calculateProgress();
    await enrollment.save();

    res.status(200).json({ enrollment });
  } catch (error) {
    console.error("Get enrollment details error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark lesson as completed
const markLessonCompleted = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { sectionId, lessonId, watchTime } = req.body;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
      // status: "active",
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Active enrollment not found" });
    }

    enrollment.markLessonCompleted(sectionId, lessonId, watchTime);
    const progress = await enrollment.calculateProgress();

    // Check if course is completed
    if (progress === 100 && enrollment.status === "active") {
      enrollment.status = "completed";
    }

    await enrollment.save();

    res.status(200).json({
      message: "Lesson marked as completed",
      progress: enrollment.progress,
    });
  } catch (error) {
    console.error("Mark lesson completed error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user has access to course
const checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      status: { $in: ["active", "completed"] },
    });

    const hasAccess = !!enrollment;

    res.status(200).json({
      hasAccess,
      enrollment: hasAccess ? enrollment : null,
    });
  } catch (error) {
    console.error("Check course access error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Example commission rate (you can adjust)
const COMMISSION_RATE = 0.1; // 10%

const getEnrollmentandEarning = async (req, res) => {
  try {
    const userId = req.user.id; // Logged-in user (publisher)
    const { status, page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Filter enrollments
    let filter = {};
    if (status) filter.status = status;

    // Populate user and course
    const enrollments = await Enrollment.find(filter)
      .populate({
        path: "user",
        select: "name email",
        match: { name: { $regex: search, $options: "i" } }, // optional search
      })
      .populate({
        path: "course",
        select: "title price",
      })
      .sort({ enrollmentDate: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Filter out enrollments where user doesn't match search
    const filteredEnrollments = enrollments.filter((e) => e.user);

    // Calculate totals
    let totalEarnings = 0;
    let totalRevenue = 0;
    let totalCommission = 0;

    const data = filteredEnrollments.map((enrollment, index) => {
      const amount = enrollment.payment?.amount || 0;
      const commission = parseFloat((amount * COMMISSION_RATE).toFixed(2));
      const revenue = parseFloat((amount - commission).toFixed(2));

      totalEarnings += amount;
      totalRevenue += revenue;
      totalCommission += commission;

      return {
        serial: index + 1 + skip,
        invoice: `${enrollment._id}`,
        student: enrollment.user.name,
        course: enrollment.course,
        date: enrollment.enrollmentDate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        paymentStatus: enrollment.payment?.paymentStatus || "Pending",
        totalAmount: `$${amount.toFixed(2)}`,
        revenue: `$${revenue.toFixed(2)}`,
        commission: `$${commission.toFixed(2)}`,
      };
    });

    res.json({
      totalEarnings: `$${totalEarnings.toFixed(2)}`,
      netEarnings: `$${(totalEarnings - totalCommission).toFixed(2)}`,
      availableBalance: `$${totalRevenue.toFixed(2)}`,
      enrollments: data,
      totalRecords: filteredEnrollments.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

// Submit a quiz attempt and store in enrollment progress
const submitQuizAttempt = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.id;
    const {
      scope, // 'section' | 'summary'
      sectionId, // optional for 'summary'
      quizTitle,
      score,
      total,
      passed,
      responses, // array of selected option indexes
    } = req.body;

    if (!scope || typeof score !== "number" || typeof total !== "number") {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
    });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const attempt = {
      scope,
      sectionId: sectionId || undefined,
      quizTitle: quizTitle || "",
      score,
      total,
      passed: !!passed,
      responses: Array.isArray(responses) ? responses : [],
      submittedAt: new Date(),
    };

    if (!Array.isArray(enrollment.progress.quizAttempts)) {
      enrollment.progress.quizAttempts = [];
    }
    enrollment.progress.quizAttempts.push(attempt);
    enrollment.progress.lastAccessedAt = new Date();

    await enrollment.save();

    return res.status(201).json({
      message: "Quiz attempt stored",
      attempt,
      progress: enrollment.progress,
    });
  } catch (error) {
    console.error("Submit quiz attempt error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const downloadCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.id;

    // 1. Check if enrollment exists and get progress
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId,
      status: "completed",
    }).populate("course", "title templateName");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found or course not completed",
      });
    }

    // 2. Get course details and check template
    const course = await Course.findById(enrollment.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // 3. Check if course has a template
    const templateName = course.templateName || "certificate1";
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "certificate",
      `${templateName}.hbs`
    );
    console.log("===>", templatePath);
    // 4. Read the template
    const template = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = handlebars.compile(template);
    console.log("Template compiled", compiledTemplate);
    // 5. Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 6. Prepare certificate data
    const certificateData = {
      studentName: user.name,
      courseName: course.title,
      completionDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      certificateId: `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    // 7. Generate HTML
    const html = compiledTemplate(certificateData);
    // console.log("Generated HTML", html);
    // 8. Generate PDF
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    // Set the PDF options
    const pdfOptions = {
      format: "A4",
      printBackground: true,
      landscape: true, // 👈 make sure you add this
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    };

    // Generate PDF
    const pdf = await page.pdf(pdfOptions);
    await browser.close();

    // 9. Set response headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Certificate-${course.title.replace(
        /\s+/g,
        "-"
      )}-${user.name.replace(/\s+/g, "-")}.pdf`
    );

    // 10. Send the PDF
    res.write(pdf);
    res.end();
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({
      success: false,
      message: "Error generating certificate",
      error: error.message,
    });
  }
};

module.exports = {
  enrollInCourse,
  // completeEnrollment,
  getUserEnrollments,
  getEnrollmentDetails,
  markLessonCompleted,
  checkCourseAccess,
  getEnrollmentandEarning,
  submitQuizAttempt,
  downloadCertificate,
};
