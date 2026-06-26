// website/app/instructor/(mainapp)/dashboard/courses/meetings/[courseId]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { courseService } from "@/services/course.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serverurl } from "@/app/contants";
import { Trash2, Upload } from "lucide-react";

export default function CourseMeetingsPage() {
  const { courseId } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, [courseId]);

  const loadMeetings = async () => {
    try {
      const response = await courseService.getCourseById(courseId);
      setMeetings(response?.course?.meetings || []);
    } catch (error) {
      toast.error("Failed to load meetings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "video/mp4") {
    } else {
      toast.error("Please select an MP4 file");
    }
  };

  const handleUpload = async (meetingId) => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("recording", selectedFile);

    try {
      setUploading(true);
      await courseService.uploadMeetingRecording(meetingId, formData);
      toast.success("Recording uploaded successfully");
      loadMeetings(); // Refresh the list
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload recording");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      return;
    }

    try {
      await courseService.deleteMeeting(courseId, meetingId);
      toast.success("Meeting deleted successfully");
      loadMeetings(); // Refresh the list
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete meeting");
    }
  };

  if (isLoading) return <div>Loading meetings...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Course Meetings</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Recording</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No meetings scheduled yet
              </TableCell>
            </TableRow>
          ) : (
            meetings.map((meeting) => (
              <TableRow key={meeting._id}>
                <TableCell>{meeting.title}</TableCell>
                <TableCell>
                  {(new Date(meeting.scheduledAt)).toLocaleString()}
                </TableCell>
                <TableCell>
                  {meeting.recordingUrl ? (
                    <a 
                      href={serverurl + meeting.recordingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Recording
                    </a>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="video/mp4"
                        onChange={handleFileChange}
                        className="max-w-xs"
                        disabled={uploading}
                      />
<div className="flex items-center gap-2">
                        <Button 
                          onClick={() => handleUpload(meeting._id)}
                          disabled={!selectedFile || uploading}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                        >
                          <Upload className="h-4 w-4" />
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                        <Button 
                          onClick={() => handleDeleteMeeting(meeting._id)}
                          variant="ghost"
                          size="sm"
                          disabled={uploading}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <a 
                    href={meeting.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Join Meeting
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}