"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCourse,
  getAllCoursesForPublisher,
} from "@/lib/store/features/courseSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { courseService } from "@/services/course.service";

export default function PublishedCourse() {
  const dispatch = useDispatch();
  const { courses, pagination, status, error } = useSelector(
    (state) => state.course
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // meeting state
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingDateTime, setMeetingDateTime] = useState("");
  const resetMeetingForm = () => {
    setMeetingTitle("");
    setMeetingUrl("");
    setMeetingDescription("");
    setMeetingDateTime("");
  };
  const saveMeeting = async () => {
    if (!activeCourseId) return;
    if (!meetingTitle || !meetingUrl || !meetingDateTime) {
      toast.error("Please fill title, URL and date/time");
      return;
    }
    try {
      await courseService.addCourseMeeting(activeCourseId, {
        title: meetingTitle,
        url: meetingUrl,
        description: meetingDescription,
        scheduledAt: meetingDateTime,
      });
      toast.success("Meeting added");
      resetMeetingForm();
      setActiveCourseId(null);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to add meeting"
      );
    }
  };

  useEffect(() => {
    error && toast.error(error);
  }, [error]);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    dispatch(getAllCoursesForPublisher({ page, search: debouncedSearch }));
  }, [dispatch, page, debouncedSearch]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Course List</h2>
        <Link href="/instructor/dashboard/courses/add-course">
          <Button>Create New</Button>
        </Link>
      </div>

      {/* Search + Entries */}
      <div className="flex justify-between items-center">
        {/* <div>
          Show{" "}
          <select className="border rounded px-2 py-1">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>{" "}
          entries
        </div> */}
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setPage(1); // reset to first page
            setSearch(e.target.value);
          }}
          className="w-56"
        />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serial</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Enrollments</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses?.map((course, idx) => (
            <TableRow key={course._id}>
              <TableCell>{(page - 1) * 10 + idx + 1}</TableCell>
              <TableCell>{course.title}</TableCell>
              <TableCell>{course.category}</TableCell>
              <TableCell>${course.price}</TableCell>{" "}
              <TableCell>{course.enrolledNumbers}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    course.visibility === "Published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {course.visibility}
                </span>
              </TableCell>
              {/* Actions */}
              <TableCell className="flex gap-2">
                <Link
                  href={`/instructor/dashboard/courses/edit-course/${course._id}`}
                >
                  <Button variant="default" size="sm">
                    Edit
                  </Button>
                </Link>

                <Link
                  href={`/instructor/dashboard/courses/meetings/${course._id}`}
                >
                  <Button variant="default" size="sm">
                    View Meetings
                  </Button>
                </Link>

                {/* Add Meeting */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveCourseId(course._id);
                        resetMeetingForm();
                      }}
                    >
                      Add Meeting
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Add Meeting</AlertDialogTitle>
                      <AlertDialogDescription>
                        Create a meeting for this course. Provide a title, URL
                        (Google Meet or any), description, and schedule time.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-3">
                      <Input
                        placeholder="Meeting title"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                      />
                      <Input
                        placeholder="Meeting URL (https://...)"
                        value={meetingUrl}
                        onChange={(e) => setMeetingUrl(e.target.value)}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={meetingDescription}
                        onChange={(e) => setMeetingDescription(e.target.value)}
                      />
                      <div>
                        <label className="text-sm mb-1 block">Schedule</label>
                        <Input
                          type="datetime-local"
                          value={meetingDateTime}
                          onChange={(e) => setMeetingDateTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setActiveCourseId(null)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={saveMeeting}>
                        Save
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Delete with confirm */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the course{" "}
                        <span className="font-semibold">{course.title}</span>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            await dispatch(deleteCourse(course._id)).unwrap();
                            toast.success("Course deleted successfully");
                          } catch (err) {
                            toast.error(err || "Failed to delete course");
                          }
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>
          Showing {(page - 1) * 10 + 1} to{" "}
          {Math.min(page * 10, pagination?.total || 0)} of{" "}
          {pagination?.total || 0} entries
        </span>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="px-2 py-1 bg-primary text-white rounded">
            {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pagination?.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
