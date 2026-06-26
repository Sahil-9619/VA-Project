// scripts/seedCategories.js
const mongoose = require("mongoose");
const CourseCategory = require("../models/courseCategory.model");

const seedCourseCategory = async () => {
  try {
    const categories = [
      { name: "Programming", slug: "programming" },
      { name: "Design", slug: "design" },
      { name: "Marketing", slug: "marketing" },
      { name: "Business", slug: "business" },
      { name: "Data Science", slug: "data-science" },
      { name: "Photography", slug: "photography" },
    ];

    console.log("🌱 Starting category seeding...");

    // Use upsert to avoid duplicates
    for (const category of categories) {
      try {
        await CourseCategory.findOneAndUpdate({ name: category.name }, category, {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        });
      } catch (err) {
        if (err.code === 11000) {
          console.warn(`⚠️ Category '${category.name}' skipped due to duplicate key conflict.`);
        } else {
          throw err;
        }
      }
    }

    console.log("✅ Categories seeded/updated successfully");
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
  }
};

module.exports = seedCourseCategory;
