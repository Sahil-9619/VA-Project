import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

import Student from "../models/student.model.js";
import Class from "../models/class.model.js";
import FeeStructure from "../models/feeStructure.model.js";
import StudentFee from "../models/studentFee.model.js";

const DB_URI = "mongodb://localhost:27017/backend";
const BATCH_SIZE = 1000;

const seedUsers = async () => {

  try {

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(DB_URI);
    console.log("✅ MongoDB Connected");

    const startNumber = parseInt(process.argv[2]) || 5000;
    const endNumber = startNumber + BATCH_SIZE;

    console.log(`🎯 Seeding students from ADM${startNumber} → ADM${endNumber - 1}`);

    // ============================
    // FETCH CLASSES
    // ============================

    const classes = await Class.find().lean();

    console.log(`📚 Found ${classes.length} classes`);

    if (!classes.length) {
      throw new Error("No classes found. Seed classes first.");
    }

    // ============================
    // DELETE OLD STUDENTS
    // ============================

    const deleteResult = await Student.deleteMany({
      admissionNumber: {
        $gte: `ADM${startNumber}`,
        $lt: `ADM${endNumber}`
      }
    });

    console.log(`🗑 Deleted ${deleteResult.deletedCount} old students`);

    // ============================
    // PREPARE STUDENT DATA
    // ============================

    const students = [];

    for (let i = 0; i < BATCH_SIZE; i++) {

      const randomClass =
        classes[Math.floor(Math.random() * classes.length)];

      if (!randomClass?._id) continue;

      students.push({

        admissionNumber: `ADM${startNumber + i}`,

        classId: randomClass._id,
        className: randomClass.className,
        section: randomClass.section,

        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),

        fatherName: faker.person.fullName(),
        motherName: faker.person.fullName(),

        email: `${faker.internet.email().toLowerCase()}${i}`,

        phone: faker.phone.number("9#########"),
        parentPhone: faker.phone.number("9#########"),

        address: faker.location.streetAddress(),

        category: "general",

        gender: faker.helpers.arrayElement(["male", "female"]),

        dateOfBirth: faker.date.birthdate()

      });

    }

    console.log(`📝 Prepared ${students.length} students`);

    // ============================
    // INSERT STUDENTS
    // ============================

    let insertedStudents = [];

    try {

      insertedStudents = await Student.insertMany(students, {
        ordered: false
      });

    } catch (err) {

      console.warn("⚠ Partial insert occurred");

      if (err.insertedDocs?.length) {
        insertedStudents = err.insertedDocs;
      }

    }

    console.log(`✅ ${insertedStudents.length} students inserted`);

    if (!insertedStudents.length) {
      throw new Error("No students inserted. Aborting fee creation.");
    }

    // ============================
    // FETCH FEE STRUCTURES
    // ============================

    const feeStructures = await FeeStructure
      .find({ status: "active" })
      .lean();

    console.log(`💰 Found ${feeStructures.length} fee structures`);

    if (!feeStructures.length) {
      throw new Error("No active fee structures found.");
    }

    // ============================
    // MAP CLASS → FEE STRUCTURE
    // ============================

    const classIdToFeeStructure = {};

    for (const fee of feeStructures) {

      if (fee.classId) {
        classIdToFeeStructure[fee.classId.toString()] = fee;
      }

    }

    // ============================
    // PREPARE STUDENT FEES
    // ============================

    const studentFees = [];

    let missingStructures = 0;

    for (const student of insertedStudents) {

      const feeStructure =
        classIdToFeeStructure[student.classId?.toString()];

      if (!feeStructure) {

        missingStructures++;
        console.warn(
          `⚠ No fee structure for classId ${student.classId}`
        );

        continue;

      }

      studentFees.push({

        studentId: student._id,

        feeStructureId: feeStructure._id,

        tuitionFee: feeStructure.tuitionFee || 0,
        admissionFee: feeStructure.admissionFee || 0,
        examFee: feeStructure.examFee || 0,
        hostelFee: feeStructure.hostelFee || 0,
        transportFee: feeStructure.transportFee || 0,

        totalAssignedFee: feeStructure.totalFee || 0,

        remainingAmount: feeStructure.totalFee || 0,

        totalPaid: 0,

        status: "due"

      });

    }

    // ============================
    // INSERT STUDENT FEES
    // ============================

    let insertedFees = [];

    if (studentFees.length) {

      try {

        insertedFees = await StudentFee.insertMany(studentFees, {
          ordered: false
        });

      } catch (err) {

        console.warn("⚠ Partial fee insert");

        if (err.insertedDocs?.length) {
          insertedFees = err.insertedDocs;
        }

      }

    }

    // ============================
    // RESULTS
    // ============================

    console.log(`\n📊 SEEDING SUMMARY`);
    console.log(`-----------------------`);

    console.log(`Students Created : ${insertedStudents.length}`);
    console.log(`Fees Created     : ${insertedFees.length}`);
    console.log(`Missing Fees     : ${missingStructures}`);

    console.log("\n🎉 Seeding completed successfully!");

  } catch (error) {

    console.error("❌ Seed Error:", error.message);

  } finally {

    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");

  }

};

seedUsers();