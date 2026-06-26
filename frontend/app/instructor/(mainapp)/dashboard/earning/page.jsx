"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllEnrollmentsForPublisher } from "@/lib/store/features/enrollmentSlice";
import { LucideSearch } from "lucide-react";

const PublisherEnrollments = () => {
  const dispatch = useDispatch();
  const {
    enrollments,
    totalEarnings,
    netEarnings,
    availableBalance,
    status,
    page,
    limit,
    totalRecords,
  } = useSelector((state) => state.enrollment);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(page || 1);

  useEffect(() => {
    dispatch(
      getAllEnrollmentsForPublisher({ page: currentPage, limit, search })
    );
  }, [dispatch, currentPage, limit, search]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {totalEarnings || "$0.00"}
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle>Net Earnings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {netEarnings || "$0.00"}
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {availableBalance || "$0.00"}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <Input
          placeholder="Search student..."
          value={search}
          onChange={handleSearch}
          className="w-64 pl-10"
        />
        <LucideSearch className="absolute ml-3 mt-2.5 text-gray-400" />
      </div>

      {/* Table */}
      <Table className="border rounded-lg overflow-hidden">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>Serial</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Commission</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {status === "loading" ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : enrollments?.length > 0 ? (
            enrollments.map((enroll, idx) => (
              <TableRow
                key={enroll.serial || idx}
                className="hover:bg-gray-50 transition"
              >
                <TableCell>{enroll.serial}</TableCell>
                <TableCell>{enroll.invoice}</TableCell>
                <TableCell>{enroll.student}</TableCell>
                <TableCell>
                  {enroll.course ? enroll.course.title : "-"}
                </TableCell>
                <TableCell>{enroll.date}</TableCell>
                <TableCell>{enroll.paymentStatus}</TableCell>
                <TableCell>{enroll.totalAmount}</TableCell>
                <TableCell>{enroll.revenue}</TableCell>
                <TableCell>{enroll.commission}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                No enrollments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PublisherEnrollments;
