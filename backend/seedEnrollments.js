require("dotenv").config();
const mongoose = require("mongoose");
const Enrollment = require("./models/enrollment.model");
const User = require("./models/user.model");
const Course = require("./models/course.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/backend";

async function seedEnrollments() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Enrolments seed");

    // 1. Get or create a dummy user
    let dummyUser = await User.findOne();
    if (!dummyUser) {
      dummyUser = await User.create({
        name: "Test User",
        email: "testuser@example.com",
        password: "hashedpassword123", // dummy password
        parent: "Dummy Parent",
        class: "10"
      });
      console.log("Created dummy user");
    }

    // 2. Get or create a dummy course
    let dummyCourse = await Course.findOne();
    if (!dummyCourse) {
      dummyCourse = await Course.create({
        title: "Introduction to React",
        slug: "intro-to-react-" + Date.now(),
        instructor: dummyUser._id, // use same user as instructor just to bypass validation if any
        createdBy: dummyUser._id,
        category: new mongoose.Types.ObjectId(), // Dummy category ObjectId
        description: "A complete introduction to React.",
        thumbnail: "https://example.com/thumbnail.jpg",
        price: 99.99,
        isPublished: true,
      });
      console.log("Created dummy course");
    }

    // 3. Clear old dummy enrollments and insert 5 new ones
    const enrollmentsToInsert = [];
    const timestamp = Date.now();
    for (let i = 1; i <= 5; i++) {
      // Need a new dummy user for each enrollment to avoid duplicate {user, course} index
      let uniqueUser = await User.create({
          name: `Student Enrolled ${i}`,
          email: `student_enrolled_${timestamp}_${i}@example.com`,
          password: "password123",
          parent: "Dummy Parent",
          class: "10"
      });

      enrollmentsToInsert.push({
        user: uniqueUser._id,
        course: dummyCourse._id,
        status: "active",
        progress: {
          completionPercentage: Math.floor(Math.random() * 100),
        },
        payment: {
          transactionId: `TXN${timestamp}${i}`,
          amount: dummyCourse.price || 49.99,
          paymentMethod: "Credit Card",
          paymentStatus: "completed",
        },
      });
    }

    await Enrollment.insertMany(enrollmentsToInsert);
    console.log("✅ Successfully inserted 5 dummy enrollments!");

  } catch (error) {
    console.error("❌ Error seeding enrollments:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedEnrollments();
