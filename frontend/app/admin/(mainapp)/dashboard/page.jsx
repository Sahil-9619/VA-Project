"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AreaChart,
  Area,
  Legend,
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
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px] text-white">
            <div className="card-line-pattern opacity-20"></div>
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-500"></div>
            <div className="absolute top-4 -right-4 w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors duration-500"></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-white/80" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white/80 line-clamp-1 mb-1">Classes</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold leading-none">{totals?.classes ?? 0}</span>
                    <TrendingUp className="w-4 h-4 text-blue-200" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Total Users */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-amber-500 to-orange-600 shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px] text-white">
            <div className="card-line-pattern opacity-20"></div>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 group-hover:bg-white/20 transition-colors duration-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-white/80" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white/80 line-clamp-1 mb-1">Users</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold leading-none">{totals?.users ?? 0}</span>
                    <Users className="w-4 h-4 text-amber-200" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Gross Revenue */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px] text-white">
            <div className="card-line-pattern opacity-20"></div>
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 group-hover:bg-white/20 transition-colors duration-500 transform rotate-45"></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-white/80" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white/80 line-clamp-1 mb-1">Gross Rev</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold leading-none">₹{Math.floor(revenue?.grossRevenue || 0)}</span>
                    <div className="text-[10px] text-emerald-100 font-medium border border-emerald-100/30 rounded px-1.5 bg-emerald-100/10">+</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Expected Rev */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px] text-white">
            <div className="card-line-pattern opacity-20"></div>
            <div className="absolute -right-2 top-0 w-20 h-20 bg-white/10 group-hover:bg-white/20 transition-colors duration-500" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-white/80" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white/80 line-clamp-1 mb-1">Expected</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold leading-none">₹{Math.floor(revenue?.totalExpectedRevenue || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Collected Rev */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px] text-white">
            <div className="card-line-pattern opacity-20"></div>
            <div className="absolute -right-6 -top-6 w-20 h-20 border-[8px] border-white/10 rounded-full group-hover:border-white/20 transition-colors duration-500"></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-white/80" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white/80 line-clamp-1 mb-1">Collected</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold leading-none">₹{Math.floor(revenue?.totalCollectedRevenue || 0)}</span>
                    <BookOpen className="w-4 h-4 text-cyan-200" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Pending Rev */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-rose-500 to-pink-600 shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px] text-white">
            <div className="card-line-pattern opacity-20"></div>
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-colors duration-500 transform rotate-12"></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-white/80" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white/80 line-clamp-1 mb-1">Pending</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold leading-none">₹{Math.floor(revenue?.totalPendingRevenue || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 7: Total Enrollments */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md hover:shadow-lg transition-all duration-300 group min-h-[75px] text-white">
            <div className="card-line-pattern opacity-20"></div>
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 group-hover:bg-white/20 transition-colors duration-500" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}></div>

            <CardContent className="p-3 flex flex-col justify-center h-full relative z-10">
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-white/80" />
                <div className="flex flex-col">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-white/80 line-clamp-1 mb-1">Enrollments</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold leading-none">{totals?.students ?? 0}</span>
                    <div className="text-[10px] text-indigo-100 font-medium">Act: {totals?.activeEnrollments ?? 0}</div>
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
            <CardContent className="pt-4 pb-2">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={2} barSize={12}>
                  <defs>
                    <linearGradient id="barExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="barCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--admin-text)" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--admin-text)" }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} 
                    itemStyle={{ color: "var(--admin-text)", fontWeight: "500", fontSize: "13px" }} 
                    labelStyle={{ color: "var(--admin-text)", marginBottom: "4px", fontWeight: "bold", fontSize: "14px" }} 
                    cursor={{ fill: "var(--admin-border)", opacity: 0.2 }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="expected" fill="url(#barExpected)" name="Expected" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" fill="url(#barCollected)" name="Collected" radius={[4, 4, 0, 0]} />
                </BarChart>
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
            <CardContent className="pt-4 pb-2 relative">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={enrollmentsPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="90%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    cornerRadius={10}
                    stroke="none"
                  >
                    {enrollmentsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--admin-card)",
                      borderColor: "var(--admin-border)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                    }}
                    itemStyle={{ color: "var(--admin-text)", fontWeight: "500", fontSize: "13px" }}
                    labelStyle={{ display: "none" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center text for Half Donut */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                <span className="text-2xl font-bold text-admin-text leading-none">{totals?.students ?? 0}</span>
                <span className="text-[10px] text-admin-text/60 font-medium uppercase tracking-wider">Total</span>
              </div>
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
            <div className="rounded-md border border-admin-border bg-admin-card/40">
              <Table>
                <TableHeader>
                  <TableRow className="border-admin-border hover:bg-transparent">
                    <TableHead className="text-admin-text/80">Student</TableHead>
                    <TableHead className="text-admin-text/80">Class & Section</TableHead>
                    <TableHead className="text-admin-text/80">Admission No.</TableHead>
                    <TableHead className="text-admin-text/80 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboardData.recentEnrollments || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-admin-text/60">
                        No recent enrollments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (dashboardData.recentEnrollments || []).map((enrollment) => (
                      <TableRow key={enrollment._id} className="border-admin-border hover:bg-admin-card/70 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-admin-primary to-[#147a87] overflow-hidden flex items-center justify-center shrink-0">
                              {enrollment.profileImage ? (
                                <img src={enrollment.profileImage} alt={enrollment.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-admin-text font-semibold text-xs">
                                  {enrollment.firstName?.[0]?.toUpperCase() || "S"}
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-admin-text">
                              {enrollment.firstName} {enrollment.lastName || ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-admin-primary font-medium">
                            Class {enrollment.className || "N/A"} - {enrollment.section || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-admin-text/80">
                            {enrollment.admissionNumber || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={enrollment.status === "active" ? "success" : "secondary"}
                            className="text-xs"
                          >
                            {enrollment.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
