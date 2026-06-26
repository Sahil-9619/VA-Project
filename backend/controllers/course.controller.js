const Course = require("../models/course.model");
const CourseCategory = require("../models/courseCategory.model");
const mongoose = require("mongoose");
const Enrollment = require("../models/enrollment.model");
const path = require("path");

const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      isFree,
      sortBy = "createdAt", // now can also be "rating"
      sortOrder = "desc",
      minRating = 0,
      maxRating = 5,
    } = req.query;

    const query = {};

    // ✅ Always only published courses
    query.isPublished = true;

    // Search by title, description, or tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Optional Filters
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await CourseCategory.findOne({
          $or: [
            { slug: category },
            { name: { $regex: category, $options: "i" } },
          ],
        });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    if (isFree !== undefined) query.isFree = isFree === "true";

    // Rating filter
    query["rating.average"] = {
      $gte: parseFloat(minRating),
      $lte: parseFloat(maxRating),
    };

    // Sorting
    const sort = {};
    if (sortBy === "rating") {
      sort["rating.average"] = sortOrder === "asc" ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(query)
      .select(
        "title slug description thumbnail price discountPrice isFree rating category instructor"
      )
      .populate("category", "name slug icon")
      .populate("instructor", "name email profileImage")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Server error while fetching courses" });
  }
};

const getMyEnrolledCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      sortBy = "createdAt", // course createdAt
      sortOrder = "desc",
    } = req.query;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Enrollment query (only user’s enrollments)
    const enrollmentQuery = { user: userId };

    // Populate course with filters
    let courseMatch = {};

    // Search by title/description/tags
    if (search) {
      courseMatch.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        courseMatch.category = category;
      } else {
        const categoryDoc = await CourseCategory.findOne({
          $or: [
            { slug: category },
            { name: { $regex: category, $options: "i" } },
          ],
        });
        if (categoryDoc) {
          courseMatch.category = categoryDoc._id;
        }
      }
    }

    // Sorting
    const sort = {};
    if (sortBy === "rating") {
      sort["course.rating.average"] = sortOrder === "asc" ? 1 : -1;
    } else {
      sort[`course.${sortBy}`] = sortOrder === "asc" ? 1 : -1;
    }

    // Get enrollments with populated courses
    const enrollments = await Enrollment.find(enrollmentQuery)
      .populate({
        path: "course",
        match: courseMatch, // apply filters inside course
        select:
          "title slug description thumbnail price discountPrice isFree rating category instructor",
        populate: [
          { path: "category", select: "name slug icon" },
          { path: "instructor", select: "name email" },
        ],
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Filter out enrollments where course didn't match filters
    const validEnrollments = enrollments.filter((e) => e.course);

    // Total count
    const total = await Enrollment.countDocuments(enrollmentQuery);

    res.status(200).json({
      enrolledCourses: validEnrollments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    res
      .status(500)
      .json({ error: "Server error while fetching enrolled courses" });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("category", "name slug icon");

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ course });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching course", error: err.message });
  }
};

// Get a single course by slug
const getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("instructor", "name email")
      .populate("category", "name slug icon");

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching course", error: err.message });
  }
};

// Update a course (supports multipart for thumbnail, videos, documents)
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Validate category if provided
    if (req.body.category) {
      const categoryExists = await CourseCategory.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
    }

    // Parse sections JSON if provided
    let sectionsData = undefined;
    if (typeof req.body.sections !== "undefined") {
      try {
        sectionsData =
          typeof req.body.sections === "string"
            ? JSON.parse(req.body.sections)
            : req.body.sections;
      } catch (e) {
        return res.status(400).json({ message: "Invalid sections JSON" });
      }
    }

    // Parse optional summaryQuiz JSON if provided
    let summaryQuiz = undefined;
    if (typeof req.body.summaryQuiz !== "undefined") {
      try {
        if (typeof req.body.summaryQuiz === "string") {
          summaryQuiz = JSON.parse(req.body.summaryQuiz);
        } else if (req.body.summaryQuiz && typeof req.body.summaryQuiz === "object") {
          summaryQuiz = req.body.summaryQuiz;
        }
      } catch (e) {
        return res.status(400).json({ message: "Invalid summaryQuiz JSON" });
      }
    }

    // Handle thumbnail upload (optional)
    let thumbnailUrl;
    if (req.files?.thumbnail?.[0]) {
      thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
    }

    // Handle lesson video uploads (optional)
    const uploadedVideos = req.files?.lessonVideos || [];
    let videoIndex = 0;

    // Handle document file uploads (optional)
    const uploadedDocuments = req.files?.documentFiles || [];
    let documentIndex = 0;

    // If sections provided, stitch in uploaded files
    let processedSections;
    if (Array.isArray(sectionsData)) {
      processedSections = sectionsData.map((section) => {
        const lessons = (section.lessons || []).map((lesson) => {
          // If no videoUrl provided, use next uploaded file
          if (!lesson.videoUrl && uploadedVideos[videoIndex]) {
            lesson.videoUrl = `/uploads/${uploadedVideos[videoIndex].filename}`;
            videoIndex++;
          }
          // Normalize numbers/booleans
          lesson.duration = lesson.duration ? parseInt(lesson.duration) : 0;
          lesson.isFree = !!lesson.isFree;
          return lesson;
        });

        const resources = (section.resources || []).map((resource) => {
          if (resource.type === "document" && uploadedDocuments[documentIndex]) {
            resource.fileUrl = `/uploads/${uploadedDocuments[documentIndex].filename}`;
            documentIndex++;
          }
          resource.isFree = !!resource.isFree;
          return resource;
        });

        // Cap quizzes to 3, and normalize
        const quizzes = Array.isArray(section.quizzes)
          ? section.quizzes.slice(0, 3).map((quiz, idx) => ({
            title: quiz.title,
            description: quiz.description || "",
            timeLimit: quiz.timeLimit ? parseInt(quiz.timeLimit) : 0,
            passScore: quiz.passScore ? parseInt(quiz.passScore) : 0,
            isFree: !!quiz.isFree,
            order: typeof quiz.order === "number" ? quiz.order : idx,
            questions: (quiz.questions || []).map((q) => ({
              question: q.question,
              options: (q.options || []).slice(0, 10),
              correctOptionIndex:
                typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : 0,
              points: q.points ? parseInt(q.points) : 1,
              explanation: q.explanation || "",
            })),
          }))
          : [];

        return {
          title: section.title,
          description: section.description,
          order: section.order,
          lessons,
          resources,
          quizzes,
        };
      });
    }

    // Calculate total duration if sections provided
    let totalDuration;
    if (processedSections) {
      totalDuration = 0;
      processedSections.forEach((section) => {
        (section.lessons || []).forEach((lesson) => {
          if (lesson.duration) totalDuration += lesson.duration;
        });
      });
    }

    // Build update payload from allowed fields
    const update = {};
    const assignIfDefined = (key, val) => {
      if (typeof val !== "undefined") update[key] = val;
    };

    assignIfDefined("title", req.body.title);
    assignIfDefined("slug", req.body.slug);
    assignIfDefined("description", req.body.description);
    assignIfDefined("category", req.body.category);
    assignIfDefined("tags", req.body.tags);
    if (typeof req.body.price !== "undefined") update.price = Number(req.body.price);
    if (typeof req.body.discountPrice !== "undefined") update.discountPrice = Number(req.body.discountPrice);
    if (typeof req.body.isFree !== "undefined") update.isFree = req.body.isFree === true || req.body.isFree === "true";
    if (typeof req.body.isPublished !== "undefined") update.isPublished = req.body.isPublished === true || req.body.isPublished === "true";
    if (typeof req.body.certificateEnabled !== "undefined") update.certificateEnabled = req.body.certificateEnabled === true || req.body.certificateEnabled === "true";
    assignIfDefined("level", req.body.level);
    assignIfDefined("language", req.body.language);
    if (thumbnailUrl) update.thumbnail = thumbnailUrl;
    if (processedSections) update.sections = processedSections;
    if (typeof summaryQuiz !== "undefined") update.summaryQuiz = summaryQuiz;
    if (typeof req.body.requirements !== "undefined") update.requirements = req.body.requirements;
    if (typeof req.body.whatYouWillLearn !== "undefined") update.whatYouWillLearn = req.body.whatYouWillLearn;
    if (typeof totalDuration !== "undefined") update.totalDuration = totalDuration;

    const course = await Course.findByIdAndUpdate(courseId, update, {
      new: true,
      runValidators: true,
    })
      .populate("instructor", "name email")
      .populate("category", "name slug icon");

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course updated", course });
  } catch (err) {
    res.status(400).json({ message: "Error updating course", error: err.message });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting course", error: err.message });
  }
};

// Toggle publish/unpublish
const togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "category",
      "name slug icon"
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      message: `Course ${course.isPublished ? "published" : "unpublished"}`,
      course,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error toggling publish state", error: err.message });
  }
};

// Get published courses only (for students / landing page)
const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("instructor", "name email")
      .populate("category", "name slug icon");

    res.json(courses);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching published courses",
      error: err.message,
    });
  }
};

const createCourse = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      category,
      tags = [],
      price,
      discountPrice,
      isFree = false,
      isPublished = false,
      instructor,
      certificateEnabled = false,
      level = "beginner",
      language = "English",
      requirements = [],
      whatYouWillLearn = [],
    } = req.body;

    // Validate required fields
    if (!title || !slug || !description || !category || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate category exists
    const categoryExists = await CourseCategory.findById(category);
    if (!categoryExists)
      return res.status(400).json({ message: "Invalid category ID" });

    // Check for duplicate slug
    const existing = await Course.findOne({ slug });
    if (existing)
      return res.status(409).json({ message: "Slug already exists" });

    // Parse JSON fields (sections)
    let sectionsData = [];
    try {
      sectionsData =
        typeof req.body.sections === "string"
          ? JSON.parse(req.body.sections)
          : req.body.sections || [];
    } catch (err) {
      return res.status(400).json({ message: "Invalid sections JSON" });
    }

    // Parse optional course-level summaryQuiz
    let summaryQuiz = undefined;
    try {
      if (typeof req.body.summaryQuiz === "string") {
        summaryQuiz = JSON.parse(req.body.summaryQuiz);
      } else if (req.body.summaryQuiz && typeof req.body.summaryQuiz === "object") {
        summaryQuiz = req.body.summaryQuiz;
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid summaryQuiz JSON" });
    }

    // Handle thumbnail upload
    let thumbnailUrl = req.body.thumbnail || "";
    if (req.files?.thumbnail?.[0]) {
      thumbnailUrl = `/uploads/${req.files.thumbnail[0].filename}`;
    }

    // Handle lesson video uploads
    const uploadedVideos = req.files?.lessonVideos || [];
    let videoIndex = 0;

    // NEW: Handle document file uploads
    const uploadedDocuments = req.files?.documentFiles || [];
    let documentIndex = 0;

    // Process sections with both videos and documents
    const processedSections = sectionsData.map((section) => {
      // Process lessons with video files
      const lessons = (section.lessons || []).map((lesson) => {
        if (!lesson.videoUrl && uploadedVideos[videoIndex]) {
          lesson.videoUrl = `/uploads/${uploadedVideos[videoIndex].filename}`;
          videoIndex++;
        }
        return lesson;
      });

      // NEW: Process resources with document files
      const resources = (section.resources || []).map((resource) => {
        // For document type resources, assign the uploaded file
        if (resource.type === "document" && uploadedDocuments[documentIndex]) {
          resource.fileUrl = `/uploads/${uploadedDocuments[documentIndex].filename}`;
          documentIndex++;
        }
        return resource;
      });

      // Handle quizzes (cap to 3 per section)
      const quizzes = Array.isArray(section.quizzes)
        ? section.quizzes.slice(0, 3)
        : [];

      return { ...section, lessons, resources, quizzes };
    });

    // Calculate total duration
    let totalDuration = 0;
    processedSections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        if (lesson.duration) totalDuration += lesson.duration;
      });
    });

    // Create the course
    const newCourse = await Course.create({
      title,
      slug,
      description,
      thumbnail: thumbnailUrl,
      category,
      tags,
      price,
      discountPrice,
      templateName: certificateEnabled ? req.body.templateName : undefined,
      isFree,
      isPublished,
      instructor: instructor || req.user?.id,
      certificateEnabled,
      createdBy: req.user?.id || instructor,
      sections: processedSections,
      summaryQuiz,
      totalDuration,
      level,
      language,
      requirements,
      whatYouWillLearn,
    });

    // Populate for response
    const populatedCourse = await Course.findById(newCourse._id)
      .populate("instructor", "name email")
      .populate("category", "name slug icon");

    res.status(201).json({
      message: "Course created successfully",
      course: populatedCourse,
    });
  } catch (error) {
    console.error("Course creation failed:", error);

    // Validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation error", errors });
    }

    res.status(500).json({ message: "Server error while creating course" });
  }
};

// Get courses by category
const getCoursesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate category exists
    const category = await CourseCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find({
      category: categoryId,
      isPublished: true,
    })
      .populate("instructor", "name email")
      .populate("category", "name slug icon")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments({
      category: categoryId,
      isPublished: true,
    });

    res.json({
      data: courses,
      category: category,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching courses by category",
      error: err.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categoryList = await CourseCategory.find().sort({ name: 1 });
    res.status(200).json({ categories: categoryList });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Server error while fetching categories" });
  }
};

const addNewCategory = async (req, res) => {
  try {
    const { name, slug, icon, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }
    // Check for existing category with same name or slug
    const existingCategory = await CourseCategory.findOne({
      $or: [{ name }, { slug }],
    });
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "Category with same name or slug already exists" });
    }
    const newCategory = new CourseCategory({ name, slug, icon, description });
    await newCategory.save();
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: "Server error while creating category" });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, isActive } = req.body;

    // Ensure uniqueness for name/slug if they are being updated
    if (name || slug) {
      const conflict = await CourseCategory.findOne({
        _id: { $ne: id },
        $or: [
          ...(name ? [{ name }] : []),
          ...(slug ? [{ slug }] : []),
        ],
      });
      if (conflict) {
        return res
          .status(409)
          .json({ message: "Category with same name or slug already exists" });
      }
    }

    const updated = await CourseCategory.findByIdAndUpdate(
      id,
      { name, slug, description, icon, isActive },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category updated successfully", category: updated });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: "Server error while updating category" });
  }
};

// Delete a category (prevent if any Course references it)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await CourseCategory.findById(id);
    if (!exists) return res.status(404).json({ message: "Category not found" });

    const linkedCoursesCount = await Course.countDocuments({ category: id });
    if (linkedCoursesCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category that is linked to existing courses",
        linkedCoursesCount,
      });
    }

    await CourseCategory.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Server error while deleting category" });
  }
};

const getallcoursesforpublisher = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: user not found" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      instructor: new mongoose.Types.ObjectId(userId),
      title: { $regex: search, $options: "i" },
    };

    const courses = await Course.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "enrollments",
          localField: "_id",
          foreignField: "course",
          as: "enrollments",
        },
      },
      {
        $addFields: {
          enrolledNumbers: { $size: "$enrollments" },
        },
      },
      {
        $lookup: {
          from: "coursecategories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          price: 1,
          visibility: {
            $cond: { if: "$isPublished", then: "Published", else: "Draft" },
          },
          enrolledNumbers: 1,
          category: "$categoryData.name",
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const total = await Course.countDocuments(query);

    res.status(200).json({
      courses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courses for publisher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addCourseMeeting = async (req, res) => {
  try {
    const { id } = req.params; // course id from route
    const { title, url, description, scheduledAt } = req.body;

    if (!title || !url || !scheduledAt) {
      return res.status(400).json({ message: "title, url and scheduledAt are required" });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const meeting = {
      title,
      url,
      description: description || "",
      scheduledAt: new Date(scheduledAt),
      createdBy: req.user?.id || null,
    };

    course.meetings.push(meeting);
    await course.save();

    res.status(201).json({ message: "Meeting added", meeting });
  } catch (error) {
    console.error("Error adding course meeting:", error);
    res.status(500).json({ message: "Server error while adding course meeting" });
  }
};


const uploadMeetingRecording = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const recordingFile = req.file;

    if (!recordingFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update the meeting with the recording URL
    const course = await Course.findOneAndUpdate(
      { 'meetings._id': meetingId },
      {
        $set: {
          'meetings.$.recordingUrl': `/uploads/${recordingFile.filename}`
        }
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.status(200).json({
      message: 'Recording uploaded successfully',
      recordingUrl: `/uploads/${recordingFile.filename}`
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    res.status(500).json({ message: 'Server error while uploading recording' });
  }
};


const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const course = await Course.findOneAndUpdate(
      { 'meetings._id': meetingId },
      { $pull: { meetings: { _id: meetingId } } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.status(200).json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ message: 'Server error while deleting meeting' });
  }
};
module.exports = {
  getAllCourses,
  createCourse,
  getCourseById,
  getCourseBySlug,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  getPublishedCourses,
  getCoursesByCategory,
  getMyEnrolledCourses,
  getAllCategories,
  getallcoursesforpublisher,
  addNewCategory,
  updateCategory,
  deleteCategory,
  addCourseMeeting, uploadMeetingRecording, deleteMeeting
};
