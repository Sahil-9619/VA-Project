require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/student.model");
const Class = require("./models/class.model");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/backend";

async function seedStudents() {
  try {
    console.log("Starting student seed process...");

    // 1. Find or create a Class to associate the students with
    let targetClass = await Class.findOne();
    if (!targetClass) {
      targetClass = await Class.create({
        className: "10",
        section: "A",
        subject: "General"
      });
      console.log("Created a dummy class to associate students with.");
    }

    // 2. Generate 100 students
    const students = [];
    const timestamp = Date.now();
    for (let i = 1; i <= 100; i++) {
      students.push({
        admissionNumber: `ADM-${timestamp}-${i}`,
        classId: targetClass._id,
        className: targetClass.className,
        section: targetClass.section || "A",
        firstName: `Student${i}`,
        lastName: `Seed`,
        gender: i % 2 === 0 ? "male" : "female",
        email: `student${i}_${timestamp}@example.com`,
        phone: `99999${i.toString().padStart(5, '0')}`,
        status: "active"
      });
    }

    // 3. Insert into database
    await Student.insertMany(students);
    console.log("✅ Successfully inserted 100 students.");

  } catch (error) {
    console.error("❌ Error seeding students:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

module.exports = seedStudents;
