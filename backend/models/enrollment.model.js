const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "completed", "suspended", "expired"],
      default: "active",
    },
    progress: {
      completedLessons: [
        {
          sectionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          watchTime: {
            type: Number, // in seconds
            default: 0,
          },
          completedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      quizAttempts: [
        {
          scope: {
            type: String,
            enum: ["section", "summary"],
            required: true,
          },
          sectionId: {
            type: mongoose.Schema.Types.ObjectId,
          },
          quizTitle: String,
          score: { type: Number, required: true },
          total: { type: Number, required: true },
          passed: { type: Boolean, default: false },
          responses: [Number], // selected option indexes
          submittedAt: { type: Date, default: Date.now },
        },
      ],
      completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      lastAccessedAt: {
        type: Date,
        default: Date.now,
      },
    },
    payment: {
      transactionId: String,
      amount: Number,
      currency: {
        type: String,
        default: "USD",
      },
      paymentMethod: String,
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      paymentDate: Date,
    },
    certificate: {
      issued: {
        type: Boolean,
        default: false,
      },
      issuedAt: Date,
      certificateUrl: String,
    },
    expiresAt: Date, // for time-limited courses
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });

// Method to calculate progress
enrollmentSchema.methods.calculateProgress = async function () {
  const course = await mongoose.model("Course").findById(this.course);
  if (!course) return 0;

  let totalLessons = 0;
  course.sections.forEach((section) => {
    totalLessons += section.lessons.length;
  });

  if (totalLessons === 0) return 0;

  const completedCount = this.progress.completedLessons.length;
  const percentage = Math.round((completedCount / totalLessons) * 100);

  this.progress.completionPercentage = percentage;
  return percentage;
};

// Method to mark lesson as completed
enrollmentSchema.methods.markLessonCompleted = function (
  sectionId,
  lessonId,
  watchTime = 0
) {
  const existingProgress = this.progress.completedLessons.find(
    (item) =>
      item.sectionId.toString() === sectionId.toString() &&
      item.lessonId.toString() === lessonId.toString()
  );

  if (!existingProgress) {
    this.progress.completedLessons.push({
      sectionId,
      lessonId,
      watchTime,
      completedAt: new Date(),
    });
  } else {
    existingProgress.watchTime = Math.max(
      existingProgress.watchTime,
      watchTime
    );
  }

  this.progress.lastAccessedAt = new Date();
};

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
module.exports = Enrollment;
