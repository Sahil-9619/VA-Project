const AdminContent = require("../../models/content.model");

// 🔐 Create Content (Admin Only)
const createContent = async (req, res) => {
  try {
    const { section, title, description, altText } = req.body;

    if (!section || !title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const images = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: `/uploads/${file.filename}`,
          altText: altText || "",
        });
      });
    }

    const content = await AdminContent.create({
      section,
      title,
      description,
      images,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      message: "Content created successfully",
      content,
    });
  } catch (error) {
    console.error("Create content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📖 Get All Content
const getAllContent = async (req, res) => {
  try {
    const content = await AdminContent.find().sort({ createdAt: -1 });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📖 Get Content By Section
const getContentBySection = async (req, res) => {
  try {
    const { section } = req.params;

    const content = await AdminContent.find({
      section,
      isPublished: true,
    });

    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ Update Content
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPublished } = req.body;

    const updates = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (typeof isPublished === "boolean")
      updates.isPublished = isPublished;

    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        altText: "",
      }));
    }

    const updated = await AdminContent.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Content not found" });

    res.status(200).json({
      message: "Content updated successfully",
      updated,
    });
  } catch (error) {
    console.error("Update content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🗑 Delete Content
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await AdminContent.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Content not found" });

    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createContent,
  getAllContent,
  getContentBySection,
  updateContent,
  deleteContent,
};