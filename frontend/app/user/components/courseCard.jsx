"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getMediaUrl } from "@/app/utils/getAssetsUrl";
import { useDispatch, useSelector } from "react-redux";

const CourseCard = ({ course }) => {
  const {
    _id,
    title,
    description,
    thumbnail,
    price,
    originalPrice,
    instructor,
    category,
    rating,
    studentsEnrolled,
    duration,
    level,
    slug,
    isPublished,
  } = course;
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.appSettings);

  // Calculate discount percentage
  const discountPercentage =
    originalPrice && price < originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  // Format price
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Level color mapping
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "intermediate":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "advanced":
        return "bg-rose-100 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-indigo-200 hover:-translate-y-1">
      <Link href={`/user/courses/${_id}/${slug}`}>
        <div className="relative">
          {/* Course Thumbnail */}
          <div className="relative h-52 w-full overflow-hidden">
            <Image
              src={getMediaUrl(thumbnail)}
              alt={title}
              unoptimized
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.target.src = defaultThumbnail;
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                {discountPercentage}% OFF
              </div>
            )}

            {/* Level Badge */}
            {level && (
              <div
                className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold capitalize shadow-sm ${getLevelColor(
                  level
                )}`}
              >
                {level}
              </div>
            )}

            {/* Category Badge */}
            {category && (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <div className="flex items-center">
                  {category.icon && (
                    <span className="mr-1.5 text-sm">{category.icon}</span>
                  )}
                  <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">
                    {category.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Course Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
              {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {description}
            </p>

            {/* Instructor */}
            {instructor && (
              <div className="flex items-center mb-5">
                {instructor.profileImage ? (
                  <img
                    src={getMediaUrl(instructor.profileImage)}
                    alt={instructor.name}
                    className="w-10 h-10 rounded-full object-cover mr-3 ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                    <span className="text-sm font-bold text-white">
                      {instructor.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <Link
                    href={`/profile/${instructor._id}`}
                    className="text-sm text-gray-800 hover:text-indigo-600 font-semibold transition-colors"
                  >
                    {instructor.name}
                  </Link>
                  <p className="text-xs text-gray-500">Instructor</p>
                </div>
              </div>
            )}

            {/* Course Stats */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 text-sm">
                {/* Rating */}
                {rating && (
                  <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg">
                    <svg
                      className="w-4 h-4 text-amber-400 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-amber-700">
                      {rating?.average.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Students Enrolled */}
                {studentsEnrolled !== undefined && (
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-4 h-4 mr-1.5 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {studentsEnrolled.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Duration */}
                {duration && (
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-4 h-4 mr-1.5 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">{duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-baseline space-x-2">
                {price !== undefined && (
                  <>
                    <span className="text-2xl font-bold text-gray-900">
                      {price === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        <>
                          {settings?.currency?.symbol}
                          {price}
                        </>
                      )}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Enhanced Enroll Button */}
              <button
                className={`
                px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg
                ${
                  price === 0
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                }
              `}
              >
                {price === 0 ? (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Enroll Free
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Enroll Now
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CourseCard;
