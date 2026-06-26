// scripts/seedRoles.js
const mongoose = require("mongoose");
const Permission = require("../models/permission.model");
const Role = require("../models/role.model");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

const seedRoles = async () => {
  //   await Permission.deleteMany({});
  //   await Role.deleteMany({});

  // Permissions
  const permissions = await Permission.create([
    { name: "create_course" },
    { name: "view_course" },
    { name: "delete_course" },
    { name: "update_course" },
  ]);
  const permMap = Object.fromEntries(permissions.map((p) => [p.name, p._id]));

  const [createCourse, viewCourse, deleteCourse] = permissions;

  // Roles
  const roles = await Role.create([
    {
      name: "admin",
      permissions: permissions.map((p) => p._id), // all permissions
    },
    {
      name: "instructor",
      permissions: [createCourse._id, viewCourse._id],
    },
    {
      name: "user",
      permissions: [viewCourse._id],
    },
  ]);
  const adminRole = roles.find((r) => r.name === "admin");
  const hashedPassword = await bcrypt.hash("admin@123", 10);

  const existingAdmin = await User.findOne({ email: "admin@lms.com" });

  if (!existingAdmin) {
    let newAdmin = new User({
      name: "Super Admin",
      email: "admin@lms.com",
      password: hashedPassword,
      isVerified: true,
      role: adminRole._id,
    });
    await newAdmin.save();

    console.log("✅ Admin user created: admin@example.com / admin123");
  } else {
    console.log("ℹ️ Admin user already exists");
  }

  console.log("✅ Roles and permissions seeded");
  process.exit();
};

// seedRoles();

module.exports = seedRoles;
