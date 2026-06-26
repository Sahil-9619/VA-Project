const mongoose = require("mongoose");
const Review = require("../models/review.model");
const Enrollment = require("../models/enrollment.model");
const Course = require("../models/course.model");

async function updateCourseRating(courseId) {
  const stats = await Review.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: "$course",
        count: { $sum: 1 },
        average: { $avg: "$rating" },
      },
    },
  ]);

  const count = stats[0]?.count || 0;
  const average = stats[0]?.average || 0;

  await Course.findByIdAndUpdate(courseId, {
    $set: { "rating.count": count, "rating.average": Number(average.toFixed(2)) },
  });
}

// POST or PUT: add or update review
// body: { rating: number(1-5), comment?: string }
const addOrUpdateReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const { rating, comment = "" } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!(rating >= 1 && rating <= 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check enrollment (active or completed)
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      status: { $in: ["active", "completed"] },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "Only enrolled users can add a review" });
    }

    const updated = await Review.findOneAndUpdate(
      { course: courseId, user: userId },
      { $set: { rating, comment } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("user", "name profileImage");

    await updateCourseRating(courseId);

    res.status(200).json({ message: "Review saved", review: updated });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate review" });
    }
    console.error("addOrUpdateReview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE: remove user's review
const deleteReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const existing = await Review.findOneAndDelete({ course: courseId, user: userId });
    if (!existing) return res.status(404).json({ message: "Review not found" });

    await updateCourseRating(courseId);

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("deleteReview error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET: list course reviews with pagination
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Review.find({ course: courseId })
        .populate("user", "name profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Review.countDocuments({ course: courseId }),
    ]);

    res.status(200).json({
      reviews: items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getCourseReviews error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET: current user's review for a course
const getMyReviewForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const review = await Review.findOne({ course: courseId, user: userId }).lean();
    res.status(200).json({ review });
  } catch (error) {
    console.error("getMyReviewForCourse error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addOrUpdateReview,
  deleteReview,
  getCourseReviews,
  getMyReviewForCourse,
};
