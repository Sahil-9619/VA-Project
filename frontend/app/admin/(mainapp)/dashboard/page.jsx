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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#178F9E]"></div>
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
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto space-y-6 max-w-7xl pt-2 pb-8 px-2 md:px-0">
        {/* Header */}
        <div className="text-left mb-6">
          <h1 className="text-2xl font-bold text-admin-text mb-1">
            Admin Dashboard
          </h1>
          <p className="text-admin-text/60 text-xs">Platform-wide metrics and insights</p>
        </div>

        {/* Top Summary Cards (Compact Rectangular with Geometric Patterns) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

          {/* Card 1: Total Classes */}
          <Card className="relative overflow-hidden border border-admin-border dark:border-transparent bg-admin-card shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px]">
            <div className="card-line-pattern"></div>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-500"></div>
            <div className="absolute top-4 -right-4 w-12 h-12 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors duration-500"></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-admin-text/60" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-admin-text/60 line-clamp-1 mb-1">Classes</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-admin-text leading-none">{totals?.classes ?? 0}</span>
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Users */}
          <Card className="relative overflow-hidden border border-admin-border dark:border-transparent bg-admin-card shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px]">
            <div className="card-line-pattern"></div>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-admin-text/60" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-admin-text/60 line-clamp-1 mb-1">Users</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-admin-text leading-none">{totals?.users ?? 0}</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Gross Revenue */}
          <Card className="relative overflow-hidden border border-admin-border dark:border-transparent bg-admin-card shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px]">
            <div className="card-line-pattern"></div>
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors duration-500 transform rotate-45"></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-admin-text/60" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-admin-text/60 line-clamp-1 mb-1">Gross Rev</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-admin-text leading-none">₹{Math.floor(revenue?.grossRevenue || 0)}</span>
                    <div className="text-[10px] text-emerald-400 font-medium border border-emerald-400/20 rounded px-1.5 bg-emerald-400/10">+</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Expected Rev */}
          <Card className="relative overflow-hidden border border-admin-border dark:border-transparent bg-admin-card shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px]">
            <div className="card-line-pattern"></div>
            <div className="absolute -right-2 top-0 w-20 h-20 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-500" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-admin-text/60" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-admin-text/60 line-clamp-1 mb-1">Expected</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-admin-text leading-none">₹{Math.floor(revenue?.totalExpectedRevenue || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Collected Rev */}
          <Card className="relative overflow-hidden border border-admin-border dark:border-transparent bg-admin-card shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px]">
            <div className="card-line-pattern"></div>
            <div className="absolute -right-6 -top-6 w-20 h-20 border-[8px] border-cyan-500/10 rounded-full group-hover:border-cyan-500/20 transition-colors duration-500"></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-admin-text/60" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-admin-text/60 line-clamp-1 mb-1">Collected</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-admin-text leading-none">₹{Math.floor(revenue?.totalCollectedRevenue || 0)}</span>
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Pending Rev */}
          <Card className="relative overflow-hidden border border-admin-border dark:border-transparent bg-admin-card shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px]">
            <div className="card-line-pattern"></div>
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-2xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors duration-500 transform rotate-12"></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-admin-text/60" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-admin-text/60 line-clamp-1 mb-1">Pending</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-admin-text leading-none">₹{Math.floor(revenue?.totalPendingRevenue || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 7: Total Enrollments */}
          <Card className="relative overflow-hidden border border-admin-border dark:border-transparent bg-admin-card shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px]">
            <div className="card-line-pattern"></div>
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20 transition-colors duration-500" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-admin-text/60" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-admin-text/60 line-clamp-1 mb-1">Enrollments</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-admin-text leading-none">{totals?.students ?? 0}</span>
                    <div className="text-[10px] text-fuchsia-400 font-medium">Act: {totals?.activeEnrollments ?? 0}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-admin-border dark:border-transparent shadow-lg bg-admin-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-admin-border">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-admin-primary" />
                <CardTitle className="text-xl text-admin-text">
                  Monthly Revenue
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--admin-text)" }} axisLine={{ stroke: "var(--admin-border)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--admin-text)" }} axisLine={{ stroke: "var(--admin-border)" }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)", borderRadius: "8px", color: "var(--admin-text)" }} />
                  <Line type="monotone" dataKey="expected" stroke="#818cf8" strokeWidth={2} name="Expected" />
                  <Line type="monotone" dataKey="collected" stroke="#34d399" strokeWidth={2} name="Collected" />
                  <Line type="monotone" dataKey="pending" stroke="#f87171" strokeWidth={2} name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border border-admin-border shadow-lg bg-admin-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-admin-border">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-xl text-admin-text">
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
                      backgroundColor: "var(--admin-card)",
                      borderColor: "var(--admin-border)",
                      borderRadius: "8px",
                      color: "var(--admin-text)"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>



        {/* Recent Enrollments */}
        <Card className="border border-admin-border dark:border-transparent shadow-lg bg-admin-card/60 backdrop-blur-md">
          <CardHeader className="border-b border-admin-border">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-xl text-admin-text">
                Recent Enrollments
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {(dashboardData.recentEnrollments || []).map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-admin-border bg-admin-card/40 hover:bg-admin-card/70 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-admin-primary to-[#147a87] overflow-hidden flex items-center justify-center shadow-lg">
                        {enrollment.user?.profileImage ? (
                          <img src={enrollment.user?.profileImage} alt={enrollment.user?.name || "User"} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-admin-text font-semibold text-lg">
                            {enrollment.user?.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-admin-bg"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-admin-text">{enrollment.user?.name || "Unknown User"}</p>
                      <p className="text-sm text-admin-primary font-medium">{enrollment.course?.title || "Unknown Course"}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <CreditCard className="h-3 w-3 text-admin-text/40" />
                        <p className="text-xs text-admin-text/60">
                          {enrollment.payment?.paymentMethod || "N/A"} • ₹
                          {Number(enrollment.payment?.amount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-32 mb-2">
                      <Progress value={enrollment.progress?.completionPercentage || 0} className="h-2 bg-admin-border" indicatorclassName="bg-admin-primary" />
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-sm font-semibold text-admin-text/80">{enrollment.progress?.completionPercentage || 0}%</span>
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
