"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import {
  getCourseById,
  getCourseReviews,
  addOrUpdateReview,
  getMyReviewForCourse,
  deleteMyReview,
} from "@/lib/store/features/courseSlice";
import {
  checkCourseAccess,
  getEnrollmentDetails,
  markLessonCompleted,
  submitQuizAttempt,
  downloadCertificate,
} from "@/lib/store/features/enrollmentSlice";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/videoPlayer";
import {
  CheckCircle,
  Circle,
  Download,
  Star,
  Clock,
  Users,
  Award,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Video,
  Calendar,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import { getMediaUrl } from "@/app/utils/getAssetsUrl";
import { serverurl } from "@/app/contants";
import { toast } from "sonner";

const LearningPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    currentCourse,
    status,
    error,
    reviews,
    reviewsStatus,
    reviewsPagination,
    myReview,
    submitReviewStatus,
    deleteReviewStatus,
  } = useSelector((state) => state.course);
  const { currentEnrollment, courseAccess } = useSelector(
    (state) => state.enrollment
  );

  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");

  // Quiz states
  // activeQuiz: { scope: 'section' | 'summary', sectionIndex?, quizIndex?, quiz }
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResponses, setQuizResponses] = useState([]); // selected option index per question
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null); // { score, total, passed }

  // Sync form with myReview from store
  useEffect(() => {
    if (myReview) {
      setUserRating(myReview.rating || 0);
      setUserReview(myReview.comment || "");
    }
  }, [myReview]);

  useEffect(() => {
    if (id) {
      dispatch(getCourseById(id));
      dispatch(checkCourseAccess(id));
      dispatch(getCourseReviews({ courseId: id, page: 1, limit: 10 }));
      dispatch(getMyReviewForCourse(id));
    }
  }, [id, dispatch]);
  const getActiveEnrollmentId = () => {
    if (courseAccess?.enrollment?._id) return courseAccess.enrollment._id;
    if (currentEnrollment?._id) return currentEnrollment._id;
    if (currentEnrollment?.enrollment?._id)
      return currentEnrollment.enrollment._id;
    return null;
  };
  useEffect(() => {
    if (courseAccess?.enrollment?._id) {
      dispatch(getEnrollmentDetails(courseAccess.enrollment._id));
    }
  }, [courseAccess, dispatch]);

  // Update completed lessons and check course completion
  useEffect(() => {
    let completedLessonsArray = [];
    let totalLessons = 0;

    // Calculate total lessons in course
    if (currentCourse?.sections) {
      totalLessons = currentCourse.sections.reduce(
        (total, section) => total + (section.lessons?.length || 0),
        0
      );
    }

    // Check all possible sources for completed lessons
    if (currentEnrollment?.progress?.completedLessons) {
      completedLessonsArray = currentEnrollment.progress.completedLessons;
    } else if (courseAccess?.enrollment?.progress?.completedLessons) {
      completedLessonsArray = courseAccess.enrollment.progress.completedLessons;
    } else if (currentEnrollment?.enrollment?.progress?.completedLessons) {
      completedLessonsArray =
        currentEnrollment.enrollment.progress.completedLessons;
    }

    if (completedLessonsArray && completedLessonsArray.length > 0) {
      const completedSet = new Set(
        completedLessonsArray.map((lesson) => lesson.lessonId)
      );
      setCompletedLessons(completedSet);

      // Check if course is completed
      if (totalLessons > 0 && completedSet.size >= totalLessons) {
        setIsCourseCompleted(true);
      } else {
        setIsCourseCompleted(false);
      }
    } else {
      setCompletedLessons(new Set());
      setIsCourseCompleted(false);
    }
  }, [courseAccess, currentEnrollment, currentCourse]);

  // Set the first lesson as active when course loads
  useEffect(() => {
    if (currentCourse?.sections?.length > 0) {
      const firstSection = currentCourse.sections[0];
      if (firstSection.lessons?.length > 0) {
        const firstLesson = {
          ...firstSection.lessons[0],
          sectionId: firstSection._id,
        };
        setActiveLesson(firstLesson);
      }
    }
  }, [currentCourse]);

  const handleMarkCompleted = async () => {
    let enrollmentId;

    if (courseAccess?.enrollment?._id) {
      enrollmentId = courseAccess.enrollment._id;
    } else if (currentEnrollment?._id) {
      enrollmentId = currentEnrollment._id;
    } else if (currentEnrollment?.enrollment?._id) {
      enrollmentId = currentEnrollment.enrollment._id;
    }

    if (enrollmentId && activeLesson) {
      setIsMarkingCompleted(true);
      try {
        setCompletedLessons((prev) => new Set(prev).add(activeLesson._id));

        const result = await dispatch(
          markLessonCompleted({
            enrollmentId: enrollmentId,
            lessonData: {
              sectionId: activeLesson.sectionId,
              lessonId: activeLesson._id,
              watchTime: activeLesson.duration * 60,
            },
          })
        ).unwrap();

        if (result.progress?.completedLessons) {
          const completedSet = new Set(
            result.progress.completedLessons.map((lesson) => lesson.lessonId)
          );
          setCompletedLessons(completedSet);
        }
      } catch (error) {
        console.error("Failed to mark lesson as completed:", error);
        setCompletedLessons((prev) => {
          const newSet = new Set(prev);
          newSet.delete(activeLesson._id);
          return newSet;
        });
      } finally {
        setIsMarkingCompleted(false);
      }
    }
  };

  const handleDownloadCertificate = async () => {
    if (!id) return;

    try {
      const enrollmentId = getActiveEnrollmentId();
      if (!enrollmentId) {
        throw new Error("No active enrollment found");
      }

      // Dispatch the download certificate action
      const response = await dispatch(downloadCertificate({ enrollmentId }));

      // Get the blob from the response
      const blob = new Blob([response.payload], { type: "application/pdf" });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate-${
        currentCourse?.title?.replace(/\s+/g, "-") || "Course"
      }.pdf`;

      // Append to body, click and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release the blob URL
      window.URL.revokeObjectURL(url);

      // Show success message
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast.error(error.message || "Failed to download certificate");
    }
  };
  const handleSubmitReview = async () => {
    if (userRating > 0 && userReview.trim()) {
      try {
        await dispatch(
          addOrUpdateReview({
            courseId: id,
            rating: userRating,
            comment: userReview,
          })
        ).unwrap();
        // Refresh reviews and course header stats
        dispatch(getCourseReviews({ courseId: id, page: 1, limit: 10 }));
        dispatch(getCourseById(id));
      } catch (e) {
        // no-op, errors handled in slice
      }
    }
  };

  const handleDeleteMyReview = async () => {
    try {
      await dispatch(deleteMyReview(id)).unwrap();
      setUserRating(0);
      setUserReview("");
      dispatch(getCourseReviews({ courseId: id, page: 1, limit: 10 }));
      dispatch(getCourseById(id));
    } catch (e) {}
  };

  const hasAccess = courseAccess?.hasAccess;
  const certificateEnabled = currentCourse?.certificateEnabled;
  const totalLessons =
    currentCourse?.sections?.reduce(
      (total, section) => total + (section.lessons?.length || 0),
      0
    ) || 0;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;

  // Lesson select clears quiz mode
  const handleLessonSelect = (section, lesson) => {
    setActiveLesson({
      ...lesson,
      sectionId: section._id,
    });
    setActiveQuiz(null);
    setQuizResponses([]);
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  // Quiz helpers
  const startSectionQuiz = (sectionIndex, quizIndex) => {
    if (!hasAccess) return;
    const quiz = currentCourse.sections?.[sectionIndex]?.quizzes?.[quizIndex];
    if (!quiz) return;
    setActiveQuiz({ scope: "section", sectionIndex, quizIndex, quiz });
    setQuizResponses(Array(quiz.questions.length).fill(null));
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const startSummaryQuiz = () => {
    if (!hasAccess) return;
    const quiz = currentCourse.summaryQuiz;
    if (!quiz) return;
    setActiveQuiz({ scope: "summary", quiz });
    setQuizResponses(Array(quiz.questions.length).fill(null));
    setQuizSubmitted(false);
    setQuizResult(null);
  };

  const selectOption = (qIndex, optIndex) => {
    if (quizSubmitted) return;
    setQuizResponses((prev) => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    const qs = activeQuiz.quiz.questions || [];
    let score = 0;
    qs.forEach((q, i) => {
      if (quizResponses[i] === q.correctOptionIndex) score += q.points || 1;
    });
    const total = qs.reduce((sum, q) => sum + (q.points || 1), 0);
    const passed = (activeQuiz.quiz.passScore || 0) <= score;

    setQuizSubmitted(true);
    setQuizResult({ score, total, passed });

    // Persist attempt
    const enrollmentId = getActiveEnrollmentId();
    if (enrollmentId) {
      // Prefer sectionId from sectionIndex to avoid mismatch with activeLesson
      const sectionId =
        activeQuiz.scope === "section"
          ? currentCourse?.sections?.[activeQuiz.sectionIndex]?._id
          : undefined;

      const payload = {
        scope: activeQuiz.scope, // 'section' | 'summary'
        sectionId, // only for section quiz
        quizTitle: activeQuiz.quiz.title || "",
        score,
        total,
        passed,
        responses: quizResponses,
      };

      try {
        await dispatch(submitQuizAttempt({ enrollmentId, payload })).unwrap();
        // Optionally refresh enrollment details if you want the latest progress everywhere:
        // await dispatch(getEnrollmentDetails(enrollmentId));
      } catch (e) {
        console.error("Failed to store quiz attempt", e);
      }
    }
  };

  const isLessonCompleted = (lessonId) => completedLessons.has(lessonId);

  const averageRating =
    reviews?.length > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
        reviews.length
      : 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "learning", label: "What You'll Learn", icon: TrendingUp },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
    { id: "meetings", label: "Live Sessions", icon: Video },
  ];

  if (status === "loading")
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );

  if (!currentCourse)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No course found.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentCourse.title}
                </h1>
                {activeLesson && (
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-700">
                      {activeLesson.title}
                    </h2>
                    {isLessonCompleted(activeLesson._id) && (
                      <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                        <CheckCircle size={16} className="mr-1" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {isCourseCompleted && certificateEnabled && (
                  <Button
                    onClick={handleDownloadCertificate}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    <Award size={18} className="mr-2" />
                    Get Certificate
                  </Button>
                )}

                {/* Instructor Card */}
                <div className="bg-white rounded-xl shadow-sm border px-4 py-3 min-w-[200px]">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Instructor
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {currentCourse.instructor?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {currentCourse.instructor?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentCourse.instructor?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Course Progress
                </span>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <CheckCircle size={16} className="mr-1 text-green-500" />
                    {completedLessons.size} / {totalLessons} lessons
                  </span>
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1 text-blue-500" />
                    {Math.round(progressPercentage)}% complete
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Video / Quiz Section */}
          <div className="flex-1 p-8">
            {activeQuiz ? (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                {currentEnrollment?.progress?.quizAttempts?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Quiz History
                    </h4>
                    <div className="space-y-2">
                      {currentEnrollment.progress.quizAttempts
                        .slice()
                        .reverse()
                        .map((a, i) => (
                          <div
                            key={i}
                            className="text-sm text-gray-700 flex justify-between"
                          >
                            <div>
                              <span className="font-medium">
                                {a.quizTitle || "Quiz"}
                              </span>{" "}
                              <span className="text-gray-500">({a.scope})</span>
                            </div>
                            <div>
                              {a.score}/{a.total} •{" "}
                              {a.passed ? "Passed" : "Not Passed"} •{" "}
                              {new Date(a.submittedAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}{" "}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {activeQuiz.quiz.title}
                    </h3>
                    {activeQuiz.quiz.description && (
                      <p className="text-gray-600 mt-1">
                        {activeQuiz.quiz.description}
                      </p>
                    )}
                    {activeQuiz.quiz.timeLimit > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Time limit: {activeQuiz.quiz.timeLimit} seconds
                      </p>
                    )}
                  </div>
                  {quizSubmitted && quizResult && (
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        quizResult.passed
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {quizResult.passed ? "Passed" : "Not Passed"}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {activeQuiz.quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          Q{qIndex + 1}. {q.question}
                        </h4>
                        <span className="text-xs text-gray-500">
                          Points: {q.points || 1}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {q.options.map((opt, oIndex) => (
                          <label
                            key={oIndex}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              checked={quizResponses[qIndex] === oIndex}
                              onChange={() => selectOption(qIndex, oIndex)}
                              disabled={quizSubmitted}
                            />
                            <span className="text-gray-800">{opt}</span>
                            {quizSubmitted &&
                              q.correctOptionIndex === oIndex && (
                                <span className="text-xs text-green-600 ml-2">
                                  Correct
                                </span>
                              )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {!quizSubmitted ? (
                  <div className="flex justify-end">
                    <Button
                      onClick={submitQuiz}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Quiz
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Score: <strong>{quizResult.score}</strong> /{" "}
                      {quizResult.total}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveQuiz(null);
                        setQuizResponses([]);
                        setQuizSubmitted(false);
                        setQuizResult(null);
                      }}
                    >
                      Back to Lesson
                    </Button>
                  </div>
                )}
              </div>
            ) : activeLesson ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {hasAccess ? (
                    <VideoPlayer
                      url={getMediaUrl(activeLesson.videoUrl)}
                      title={activeLesson.title}
                      trackProgress={true}
                      onComplete={handleMarkCompleted}
                    />
                  ) : (
                    <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen size={32} className="text-blue-600" />
                        </div>
                        <p className="text-xl font-semibold text-gray-700 mb-2">
                          Preview Mode
                        </p>
                        <p className="text-gray-600">
                          Enroll to unlock the full video experience
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Lesson Description
                      </h3>
                      <p className="text-gray-600">
                        {activeLesson.description}
                      </p>
                    </div>
                    {hasAccess && !isLessonCompleted(activeLesson._id) && (
                      <Button
                        onClick={handleMarkCompleted}
                        disabled={isMarkingCompleted}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isMarkingCompleted ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Marking...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="mr-2" />
                            Mark Complete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Tab Headers */}
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center transition-colors ${
                              activeTab === tab.id
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <Icon size={18} className="mr-2" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Course Description
                          </h4>
                          <p className="text-gray-600 leading-relaxed">
                            {currentCourse.description}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <Clock className="text-blue-600 mr-2" size={20} />
                              <span className="font-semibold text-blue-900">
                                Duration
                              </span>
                            </div>
                            <p className="text-blue-700">
                              {Math.floor(currentCourse.totalDuration / 60)}h{" "}
                              {currentCourse.totalDuration % 60}m
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <TrendingUp
                                className="text-green-600 mr-2"
                                size={20}
                              />
                              <span className="font-semibold text-green-900">
                                Level
                              </span>
                            </div>
                            <p className="text-green-700 capitalize">
                              {currentCourse.level}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <Users
                                className="text-purple-600 mr-2"
                                size={20}
                              />
                              <span className="font-semibold text-purple-900">
                                Students
                              </span>
                            </div>
                            <p className="text-purple-700">
                              {currentCourse.enrolledUsers?.length || 0}{" "}
                              enrolled
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Requirements
                          </h4>
                          <ul className="space-y-2">
                            {currentCourse.requirements?.map((req, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle
                                  size={16}
                                  className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                                />
                                <span className="text-gray-600">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {activeTab === "learning" && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">
                          What You'll Learn
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentCourse.whatYouWillLearn?.map(
                            (item, index) => (
                              <div key={index} className="flex items-start">
                                <CheckCircle
                                  size={18}
                                  className="text-green-500 mr-3 mt-1 flex-shrink-0"
                                />
                                <span className="text-gray-700">{item}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {activeTab === "reviews" && (
                      <div className="space-y-6">
                        {/* Rating Overview */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Course Rating
                              </h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={20}
                                      className={
                                        i < Math.floor(averageRating)
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                  {averageRating.toFixed(1)}
                                </span>
                                <span className="text-gray-600">
                                  ({reviews.length} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Add Review */}
                        <div className="border rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Leave a Review
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                              </label>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setUserRating(i + 1)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      size={24}
                                      className={
                                        i < userRating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300 hover:text-yellow-200"
                                      }
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Review
                              </label>
                              <textarea
                                value={userReview}
                                onChange={(e) => setUserReview(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                                placeholder="Share your experience with this course..."
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                onClick={handleSubmitReview}
                                disabled={
                                  !userRating ||
                                  !userReview.trim() ||
                                  submitReviewStatus === "loading"
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {submitReviewStatus === "loading"
                                  ? "Submitting..."
                                  : "Submit Review"}
                              </Button>
                              {myReview && (
                                <Button
                                  variant="outline"
                                  onClick={handleDeleteMyReview}
                                  disabled={deleteReviewStatus === "loading"}
                                >
                                  {deleteReviewStatus === "loading"
                                    ? "Deleting..."
                                    : "Delete My Review"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">
                            All Reviews
                          </h4>
                          {reviews?.map((review) => (
                            <div
                              key={review._id || review.id}
                              className="border rounded-lg p-6"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {review.user?.name || "User"}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={
                                            i < (review.rating || 0)
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      {review.createdAt
                                        ? new Date(
                                            review.createdAt
                                          ).toLocaleDateString()
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeTab === "meetings" && (
                      <div className="space-y-6">
                        <h4 className="font-semibold text-gray-900">
                          Upcoming & Past Live Sessions
                        </h4>

                        {currentCourse?.meetings?.length > 0 ? (
                          <div className="space-y-4">
                            {[...currentCourse.meetings]
                              .sort(
                                (a, b) =>
                                  new Date(a.scheduledAt) -
                                  new Date(b.scheduledAt)
                              )
                              .map((meeting) => {
                                const isUpcoming =
                                  new Date(meeting.scheduledAt) > new Date();
                                const isRecordingAvailable =
                                  !!meeting.recordingUrl;

                                return (
                                  <div
                                    key={meeting._id}
                                    className={`border rounded-lg overflow-hidden ${
                                      isUpcoming
                                        ? "border-blue-200 bg-blue-50"
                                        : "border-gray-200 bg-white"
                                    }`}
                                  >
                                    <div className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center mb-1">
                                            <h5 className="font-medium text-gray-900 mr-2">
                                              {meeting.title}
                                            </h5>
                                            {isUpcoming ? (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Upcoming
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Completed
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex items-center text-sm text-gray-600 mb-2">
                                            <Calendar
                                              size={14}
                                              className="mr-1.5"
                                            />
                                            {new Date(
                                              meeting.scheduledAt
                                            ).toLocaleString("en-US", {
                                              weekday: "short",
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                              hour12: true,
                                            })}
                                          </div>

                                          {meeting.description && (
                                            <p className="text-sm text-gray-600 mb-3">
                                              {meeting.description}
                                            </p>
                                          )}
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                          {isUpcoming ? (
                                            <a
                                              href={meeting.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                              <ExternalLink
                                                size={14}
                                                className="mr-1.5"
                                              />
                                              Join Session
                                            </a>
                                          ) : isRecordingAvailable ? (
                                            <button
                                              onClick={() => {
                                                setActiveLesson({
                                                  ...activeLesson,
                                                  videoUrl:
                                                    meeting.recordingUrl,
                                                  title: `${meeting.title} - Recording`,
                                                  isMeetingRecording: true,
                                                });
                                              }}
                                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                            >
                                              <PlayCircle
                                                size={14}
                                                className="mr-1.5"
                                              />
                                              Watch Recording
                                            </button>
                                          ) : (
                                            <span className="text-xs text-gray-500">
                                              No recording available
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                            <Video
                              size={32}
                              className="mx-auto text-gray-400 mb-2"
                            />
                            <p className="text-gray-600">
                              No live sessions scheduled yet
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Check back later for upcoming sessions
                            </p>
                          </div>
                        )}
                      </div>
                    )}{" "}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">
                    Select a lesson to start learning
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-white border-l shadow-lg overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4">
            <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
            <p className="text-sm text-gray-600 mt-1">
              {currentCourse.sections.length} sections • {totalLessons} lessons
            </p>
          </div>

          <div className="p-4 space-y-4">
            {currentCourse.summaryQuiz && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
                <div className="text-sm font-medium text-purple-900">
                  Summary Quiz
                </div>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!hasAccess}
                  onClick={startSummaryQuiz}
                >
                  Start
                </Button>
              </div>
            )}

            {currentCourse.sections.map((section, sIndex) => (
              <div key={section._id} className="mb-6">
                {/* Section Header */}
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-3">
                      {sIndex + 1}
                    </span>
                    {section.title}
                  </h4>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Lessons */}
                <div className="space-y-2 ml-4">
                  {section.lessons.map((lesson, lIndex) => {
                    const isCompleted = isLessonCompleted(lesson._id);
                    const isActive = activeLesson?._id === lesson._id;

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => handleLessonSelect(section, lesson)}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                            : "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle
                                  className="text-green-500"
                                  size={18}
                                />
                              ) : (
                                <Circle className="text-gray-400" size={18} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isActive ? "text-blue-900" : "text-gray-900"
                                }`}
                              >
                                {lIndex + 1}. {lesson.title}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {lesson.duration} min
                                </span>
                                {lesson.isFree && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    Free
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Resources */}
                {section.resources?.length > 0 && (
                  <div className="ml-8 mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Resources
                    </p>
                    {section.resources.map((res, rIndex) => (
                      <a
                        key={res._id}
                        href={getMediaUrl(res.fileUrl || res.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        <Download className="text-blue-600" size={16} />
                        <span className="text-sm text-gray-700 truncate">
                          {res.title || `Resource ${rIndex + 1}`}
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Quizzes */}
                {(section.quizzes?.length || 0) > 0 && (
                  <div className="ml-8 mt-3 space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Quizzes
                    </p>
                    {section.quizzes.map((q, qIndex) => (
                      <div
                        key={q._id || qIndex}
                        className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg"
                      >
                        <span className="text-sm text-gray-800 truncate mr-2">
                          {q.title || `Quiz ${qIndex + 1}`}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!hasAccess}
                          onClick={() => startSectionQuiz(sIndex, qIndex)}
                        >
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
