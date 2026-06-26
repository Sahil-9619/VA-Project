"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  CreditCard,
} from "lucide-react";
import { adminServices } from "@/services/admin/admin.service";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await adminServices.getDashborddata();
        setDashboardData(data);
        console.log("Dashboard Data:", data);
        console.log("Monthly Revenue:", data?.revenue?.monthlyFeeRevenue);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchDashboard();
  }, []);

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  // New API shape
  const { totals, revenue } = dashboardData;

  // Map enrollments per course for PieChart (items have title, count)
  const enrollmentsPieData = (dashboardData.enrollmentsPerClass || []).map(
    (item, idx) => ({
      name: item.name,
      value: item.count || 0,
      color: COLORS[idx % COLORS.length],
    })
  );

  // Map completion per course for BarChart
  const completionBarData = (dashboardData.completionPerCourse || []).map(
    (item) => ({
      name: item.title || "Course",
      completion: item.avgCompletion || 0,
    })
  );

  // Monthly revenue
  const revenueData = (revenue?.monthlyFeeRevenue || []).map((m) => ({
    month: m.month,
    expected: m.expected || 0,
    collected: m.collected || 0,
    pending: m.pending || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Platform-wide metrics and insights</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium opacity-90">
                  Total Classes
                </CardTitle>
                <BookOpen className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {totals?.classes ?? 0}
              </div>

            </CardContent>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white opacity-10 rounded-full"></div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium opacity-90">Users</CardTitle>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                {totals?.users ?? 0}
              </div>
              <p className="text-emerald-100 text-sm">Students: {totals?.students ?? 0} • Instructors: {totals?.instructors ?? 0}</p>
            </CardContent>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white opacity-10 rounded-full"></div>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium opacity-90">Gross Revenue</CardTitle>

              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">
                ₹{(revenue?.grossRevenue || 0).toFixed(2)}
              </div>
              <p className="text-orange-100 text-sm">Profit: ₹{(revenue?.platformProfit || 0).toFixed(2)} • Payout: ₹{(revenue?.netPayoutToInstructors || 0).toFixed(2)}</p>
            </CardContent>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white opacity-10 rounded-full"></div>
          </Card>
        </div>

        {/* 💰 Student Fee Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Expected Revenue */}
          <Card className="shadow-lg bg-white">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Expected Revenue</p>
              <h2 className="text-2xl font-bold text-indigo-600">
                ₹{revenue?.totalExpectedRevenue || 0}
              </h2>
            </CardContent>
          </Card>

          {/* Collected Revenue */}
          <Card className="shadow-lg bg-white">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Collected Revenue</p>
              <h2 className="text-2xl font-bold text-green-600">
                ₹{revenue?.totalCollectedRevenue || 0}
              </h2>
            </CardContent>
          </Card>

          {/* Pending Revenue */}
          <Card className="shadow-lg bg-white">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Pending Revenue</p>
              <h2 className="text-2xl font-bold text-red-600">
                ₹{revenue?.totalPendingRevenue || 0}
              </h2>
            </CardContent>
          </Card>

        </div>

        {/* Enrollments and Top performers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-white">
            <CardHeader className="pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-800">Total Enrollments</CardTitle>
                <Award className="h-6 w-6 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totals?.students ?? 0}</div>
              <p className="text-gray-500 text-sm">Active: {totals?.activeEnrollments ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-white">
            <CardHeader className="pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-800">Top Course (Gross)</CardTitle>
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.topCoursesByRevenue && dashboardData.topCoursesByRevenue[0] ? (
                <div>
                  <div className="font-semibold text-gray-900">{dashboardData.topCoursesByRevenue[0].title}</div>
                  <p className="text-sm text-gray-500">Enrollments: {dashboardData.topCoursesByRevenue[0].enrollments}</p>
                  <p className="text-sm text-gray-500">Gross: ${(dashboardData.topCoursesByRevenue[0].gross || 0).toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No data</p>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-white">
            <CardHeader className="pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-800">Top Instructor (Gross)</CardTitle>
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.topInstructorsByRevenue && dashboardData.topInstructorsByRevenue[0] ? (
                <div>
                  <div className="font-semibold text-gray-900">{dashboardData.topInstructorsByRevenue[0].name}</div>
                  <p className="text-sm text-gray-500">Enrollments: {dashboardData.topInstructorsByRevenue[0].enrollments}</p>
                  <p className="text-sm text-gray-500">Gross: ${(dashboardData.topInstructorsByRevenue[0].gross || 0).toFixed(2)}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-xl text-gray-800">
                  Monthly Revenue
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                  <Tooltip contentStyle={{ backgroundColor: "white", border: "none", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} />
                  <Line type="monotone" dataKey="expected" stroke="#6366f1" strokeWidth={2} name="Expected" />
                  <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} name="Collected" />
                  <Line type="monotone" dataKey="pending" stroke="#ef4444" strokeWidth={2} name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-xl text-gray-800">
                  Enrollments per Class
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={enrollmentsPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {enrollmentsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Course Completion Chart */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-xl text-gray-800">
                Course Completion Rate
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={completionBarData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="completionGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  unit="%"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="completion"
                  fill="url(#completionGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-xl text-gray-800">
                Recent Enrollments
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {(dashboardData.recentEnrollments || []).map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden flex items-center justify-center shadow-lg">
                        {enrollment.user?.profileImage ? (
                          <img src={enrollment.user?.profileImage} alt={enrollment.user?.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {enrollment.user?.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{enrollment.user?.name || "Unknown User"}</p>
                      <p className="text-sm text-indigo-600 font-medium">{enrollment.course?.title || "Unknown Course"}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <CreditCard className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {enrollment.payment?.paymentMethod || "N/A"} • $
                          {Number(enrollment.payment?.amount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-32 mb-2">
                      <Progress value={enrollment.progress?.completionPercentage || 0} className="h-2" />
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-semibold text-gray-700">{enrollment.progress?.completionPercentage || 0}%</span>
                      <Badge
                        variant={
                          (enrollment.progress?.completionPercentage || 0) > 75
                            ? "success"
                            : (enrollment.progress?.completionPercentage || 0) > 50
                              ? "warning"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {(enrollment.progress?.completionPercentage || 0) > 75
                          ? "Excellent"
                          : (enrollment.progress?.completionPercentage || 0) > 50
                            ? "Good"
                            : "Started"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
