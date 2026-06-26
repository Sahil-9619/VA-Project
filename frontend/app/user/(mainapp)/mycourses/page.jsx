"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyEnrolledCourses } from "@/lib/store/features/courseSlice";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { getMediaUrl } from "@/app/utils/getAssetsUrl";
import {
  BookOpen,
  Share2,
  Play,
  Star,
  Clock,
  Award,
  TrendingUp,
  Users,
} from "lucide-react";

const MyCourses = () => {
  const dispatch = useDispatch();

  const { myEnrolledcourses, status, error } = useSelector(
    (state) => state.course
  );

  useEffect(() => {
    dispatch(getMyEnrolledCourses());
  }, []);

  const handleShare = (course) => {
    const url = `${window.location.origin}/user/courses/${course._id}/${course.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Course link copied to clipboard!");
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 20) return "bg-amber-500";
    return "bg-gray-400";
  };

  const getProgressText = (percentage) => {
    if (percentage === 100) return "Completed!";
    if (percentage >= 80) return "Almost there!";
    if (percentage >= 50) return "Halfway done";
    if (percentage > 0) return "In progress";
    return "Not started";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg h-96">
                  <div className="bg-gray-300 h-48 rounded-t-2xl"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => dispatch(getMyEnrolledCourses())}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!myEnrolledcourses || myEnrolledcourses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md border border-gray-200">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            No Courses Yet
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't enrolled in any courses yet. Start your learning journey
            today!
          </p>
          <Link href="/courses">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                My Learning Journey
              </h1>
              <p className="text-gray-600">
                Continue your progress and master new skills
              </p>
            </div>{" "}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {myEnrolledcourses.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      myEnrolledcourses.filter(
                        (e) => e.progress?.completionPercentage === 100
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      myEnrolledcourses.filter(
                        (e) =>
                          e.progress?.completionPercentage > 0 &&
                          e.progress?.completionPercentage < 100
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myEnrolledcourses.map((enrollment) => {
            const { course, progress } = enrollment;
            const completionPercentage = progress?.completionPercentage || 0;

            return (
              <Card
                key={course._id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden hover:scale-105 transform"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={getMediaUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-gray-700 backdrop-blur-sm border-0 shadow-md"
                    >
                      {course.category.name}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge
                      variant="secondary"
                      className={`text-white border-0 shadow-md ${course.isFree
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                    >
                      {course.isFree
                        ? "FREE"
                        : `$${course.discountPrice || course.price}`}
                    </Badge>
                  </div>

                  {/* Progress Overlay */}
                  {completionPercentage === 100 && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-emerald-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Completed!
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2 text-sm">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-4">
                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={completionPercentage}
                        className="h-2 bg-gray-200 rounded-full overflow-hidden"
                      />
                      <div
                        className={`absolute top-0 left-0 h-full ${getProgressColor(
                          completionPercentage
                        )} rounded-full transition-all duration-500 shadow-sm`}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getProgressText(completionPercentage)}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 flex gap-3">
                  <Link
                    href={`/user/mycourses/learning/${course._id}`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      {completionPercentage === 0
                        ? "Start Learning"
                        : "Continue"}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare(course)}
                    className="rounded-xl border-2 hover:bg-gray-50 transition-colors duration-300 hover:scale-110 transform"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
