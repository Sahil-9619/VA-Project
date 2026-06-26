"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { instructorServices } from "@/services/instructor.service";
import CourseCard from "@/app/user/components/courseCard";
import { getMediaUrl } from "@/app/utils/getAssetsUrl";

const InstructorProfilePage = () => {
  const params = useParams();
  const instructorId = params.id;

  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const data = await instructorServices.instructorProfile(instructorId);
        setInstructor(data?.instructor || null);
        setCourses(data?.courses || []);
      } catch (err) {
        setError("Failed to fetch instructor profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [instructorId]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-lg font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">⚠</span>
          </div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    );

  if (!instructor)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="text-slate-400 text-2xl">👤</span>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            Instructor not found
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
        {/* Hero Section with Profile */}
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl opacity-90"></div>
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-3xl"></div>

          <Card className="relative border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Profile Image */}
                <div className="relative">
                  {instructor.profileImage ? (
                    <div className="relative w-40 h-40 md:w-48 md:h-48">
                      <img
                        src={getMediaUrl(instructor.profileImage)}
                        alt={instructor.name}
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl"
                      />
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                        <span className="text-white text-xl">✓</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white shadow-xl flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">
                        {instructor.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {instructor.name}
                  </h1>

                  {instructor.designation && (
                    <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                      <span className="text-lg font-medium">
                        {instructor.designation}
                      </span>
                    </div>
                  )}

                  {instructor.experience && (
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-yellow-800 text-sm font-bold">
                          ★
                        </span>
                      </div>
                      <span className="text-blue-100 font-medium">
                        {instructor.experience} years experience
                      </span>
                    </div>
                  )}

                  {instructor.shortBio && (
                    <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
                      {instructor.shortBio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        {instructor.skills?.length > 0 && (
          <Card className="border-0 shadow-xl rounded-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Skills & Expertise
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {instructor.skills.map((skill) => (
                  <div key={skill._id} className="group">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-700">
                          {skill.name}
                        </span>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                          {skill.expertise}%
                        </Badge>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${skill.expertise}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses Section */}
        <Card className="border-0 shadow-xl rounded-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📚</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Courses by {instructor.name}
                </h2>
              </div>

              {courses.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-teal-50 rounded-full border border-green-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-700 font-medium">
                    {courses.length} courses available
                  </span>
                </div>
              )}
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <div
                    key={course._id}
                    className="transform hover:scale-105 transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-slate-400 text-4xl">📖</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  No Courses Yet
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  This instructor hasn't published any courses yet. Check back
                  soon for new content!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorProfilePage;
