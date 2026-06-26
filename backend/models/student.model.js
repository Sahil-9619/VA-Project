const mongoose = require("mongoose");
const StudentFee = require("./studentFee.model");

const studentSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    className: String,
    section: {
      type: String, // A, B, C
      required: true,
    },



    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    dateOfBirth: Date,
    bloodGroup: String,
    category: {
      type: String,
      enum: ["general", "obc", "sc", "st"],
    },

    phone: String,
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    altEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    address: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v.trim().split(/\s+/).length <= 100;
        },
        message: "Address must not exceed 100 words",
      },
    },

    fatherName: String,
    motherName: String,
    parentPhone: String,

    profileImage: String,




    academicYear: {
      type: String,
    },
    city: String,

shortBio: String,

skills: [
  {
    name: String,
    expertise: Number,
  },
],

social: {
  facebook: String,
  linkedin: String,
  twitter: String,
  instagram: String,
},

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
studentSchema.index({ classId: 1 });
studentSchema.index({ admissionNumber: 1 });

// AUTO DELETE StudentFee WHEN STUDENT IS DELETED
studentSchema.pre("findOneAndDelete", async function (next) {
  try {
    const student = await this.model.findOne(this.getFilter());

    if (student) {
      await StudentFee.deleteMany({ studentId: student._id });
      console.log("StudentFee deleted for student:", student._id);
    }

    next();
  } catch (error) {
    next(error);
  }
});


// Virtual full name
studentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName || ""}`;
});

studentSchema.set("toJSON", { virtuals: true });
studentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Student", studentSchema);