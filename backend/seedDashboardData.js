require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("./models/student.model");
const Class = require("./models/class.model");
const StudentFee = require("./models/studentFee.model");
const FeeStructure = require("./models/feeStructure.model"); // Assuming this exists

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/backend";

async function seedDashboardData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Dashboard Data seed");

    // 1. Setup Classes
    const classNames = [
      { className: "10", section: "A" },
      { className: "10", section: "B" },
      { className: "9", section: "A" },
      { className: "11", section: "Science" },
    ];
    
    let classes = [];
    for (const c of classNames) {
      let cl = await Class.findOne({ className: c.className, section: c.section });
      if (!cl) {
        cl = await Class.create({ className: c.className, section: c.section });
      }
      classes.push(cl);
    }
    console.log("Classes ready.");

    // 2. Setup Fee Structure
    let feeStruct = null;
    try {
      feeStruct = await FeeStructure.findOne();
      if (!feeStruct) {
        feeStruct = await FeeStructure.create({
          classId: classes[0]._id,
          academicYear: "2026-2027",
          feeComponents: [{ name: "Tuition", amount: 12000, type: "monthly" }],
          totalFee: 12000
        });
      }
    } catch (err) {
      console.log("No FeeStructure model or it failed. Creating dummy ID.");
      feeStruct = { _id: new mongoose.Types.ObjectId() };
    }

    // 3. Update students and generate fees
    const students = await Student.find({});
    
    // Distribute students and generate fee payments
    let updateCount = 0;
    let feeCount = 0;
    
    // Let's create payments for the last 6 months
    const today = new Date();
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Assign to a random class
      const randomClass = classes[i % classes.length];
      student.classId = randomClass._id;
      student.className = randomClass.className;
      student.section = randomClass.section;
      await student.save();
      updateCount++;

      // Create StudentFee if not exists
      let fee = await StudentFee.findOne({ studentId: student._id });
      if (!fee) {
        const totalAssigned = 12000;
        
        // Generate random payments for the last 6 months
        const payments = [];
        let totalPaid = 0;
        
        for (let m = 0; m < 6; m++) {
          const amount = Math.floor(Math.random() * 500) + 500; // random between 500-1000
          totalPaid += amount;
          
          const d = new Date();
          d.setMonth(d.getMonth() - m);
          d.setDate(Math.floor(Math.random() * 28) + 1);
          
          payments.push({
            amount,
            date: d,
            componentName: "Tuition",
            month: d.toLocaleString('default', { month: 'long' })
          });
        }
        
        await StudentFee.create({
          studentId: student._id,
          feeStructureId: feeStruct._id,
          feeComponents: [{ name: "Tuition", amount: totalAssigned, type: "monthly" }],
          payments: payments,
          totalAssignedFee: totalAssigned,
          totalPaid: totalPaid,
          remainingAmount: totalAssigned - totalPaid,
          status: "partial"
        });
        feeCount++;
      }
    }
    
    console.log(`✅ Updated ${updateCount} students with varied classes.`);
    console.log(`✅ Created ${feeCount} StudentFee records with 6 months of payments.`);

  } catch (error) {
    console.error("❌ Error seeding dashboard data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedDashboardData();
