const mongoose = require("mongoose");

// Quiz question schema
const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length >= 2 && arr.length <= 10;
      },
      message: "A question must have between 2 and 10 options",
    },
    required: true,
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
  },
  points: {
    type: Number,
    default: 1,
    min: 0,
  },
  explanation: String,
});

// Quiz schema (can be used in sections and as a summary quiz)
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  timeLimit: {
    // seconds; 0 or undefined means unlimited
    type: Number,
    default: 0,
    min: 0,
  },
  passScore: {
    // minimum score to pass; if 0, any score passes
    type: Number,
    default: 0,
    min: 0,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  questions: {
    type: [quizQuestionSchema],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: "A quiz must have at least one question",
    },
    required: true,
  },
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  duration: Number, // in minutes
  description: String,
  isFree: {
    type: Boolean,
    default: false, // allow preview even if course is paid
  },
  order: {
    type: Number,
    default: 0,
  },
});

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "pdf", "quiz", "assignment", "text", "document"], // ADDED "document"
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: String, // S3 or storage link
  fileUrl: String, // NEW: For document file URLs
  videoUrl: String, // for video resources
  duration: Number, // in minutes (for video)
  content: String, // for quiz instructions or assignment text
  isFree: {
    type: Boolean,
    default: false, // allow preview even if course is paid
  },
  order: {
    type: Number,
    default: 0,
  },
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  order: {
    type: Number,
    default: 0,
  },
  lessons: [lessonSchema],
  resources: [resourceSchema],
  // Up to 3 quizzes per section
  quizzes: {
    type: [quizSchema],
    validate: {
      validator: function (arr) {
        return !arr || arr.length <= 3;
      },
      message: "A section can have at most 3 quizzes",
    },
    default: [],
  },
});

// Meeting schema
const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  description: { type: String },
  scheduledAt: { type: Date, required: true },
  recordingUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String, // Image URL
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseCategory",
      required: true,
    },
    tags: [String],

    price: {
      type: Number,
      required: true,
    },
    discountPrice: Number,

    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sections: [sectionSchema],

    // Optional course-level summary quiz (single)
    summaryQuiz: {
      type: quizSchema,
      required: false,
    },

    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    certificateEnabled: {
      type: Boolean,
      default: false,
    },

    templateName: {
      type: String,
      default: "certificate1",
    },
    // Additional useful fields
    totalDuration: {
      type: Number,
      default: 0, // in minutes
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    language: {
      type: String,
      default: "English",
    },

    requirements: [String], // Prerequisites
    whatYouWillLearn: [String], // Learning outcomes
    // Meetings (e.g., Google Meet or any URL) associated with the course
    meetings: [meetingSchema],
  },
  {
    timestamps: true,
  }
);

// Add index for better search performance
courseSchema.index({ title: "text", description: "text", tags: "text" });
courseSchema.index({ category: 1, isPublished: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ slug: 1 });

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
