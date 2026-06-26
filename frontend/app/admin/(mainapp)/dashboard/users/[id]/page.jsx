"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/app/utils/getAssetsUrl";
import { adminServices } from "@/services/admin/admin.service";

const mergedDataPage = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await adminServices.getStudentById(id);
          console.log("API RESPONSE:", res.data); 
        setStudent(res.data.data);
      } catch (err) {
        setError("Failed to load student");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm("Delete this student? This action cannot be undone.");
    if (!ok) return;
    try {
      await adminServices.deleteStudent(id);
      router.push("/admin/(mainapp)/dashboard/users");
    } catch (e) {
      alert("Failed to delete student");
    }
  };

  if (loading) return <div className="p-4">Loading user...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!student) return null;

  const displayData = student; // 🔥 only change

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={getMediaUrl(displayData.profileImage) || ""} />
            <AvatarFallback>
              {displayData.firstName
                ? `${displayData.firstName[0]}${displayData.lastName?.[0] || ""}`
                : "S"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">
              {displayData.firstName
                ? `${displayData.firstName} ${displayData.lastName || ""}`
                : "-"}
            </h1>
            <div className="text-muted-foreground">{displayData.email}</div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">student</Badge>
              <Badge className="bg-green-600 hover:bg-green-600">
                {displayData.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="space-x-2">
          <Button asChild variant="outline">
            <Link href="/admin/(mainapp)/dashboard/users">Back</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/admin/(mainapp)/dashboard/users/${id}/edit`}>
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="rounded border p-4 space-y-2">
            <div>
              <span className="font-medium">Phone:</span>{" "}
              {displayData.phone || "-"}
            </div>
            <div>
              <span className="font-medium">Parent Name:</span>{" "}
              {displayData.parentName || "-"}
            </div>
            <div>
              <span className="font-medium">Parent Phone:</span>{" "}
              {displayData.parentPhone || "-"}
            </div>
            <div>
              <span className="font-medium">Class:</span>{" "}
              {displayData.classId?.className || "-"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Location</h2>
          <div className="rounded border p-4 space-y-2">
            <div>
              <span className="font-medium">Address:</span>{" "}
              {displayData.address || "-"}
            </div>
            <div>
              <span className="font-medium">Category:</span>{" "}
              {displayData.category || "-"}
            </div>
            <div>
              <span className="font-medium">Gender:</span>{" "}
              {displayData.gender || "-"}
            </div>
            <div>
              <span className="font-medium">Academic Year:</span>{" "}
              {displayData.academicYear || "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Social</h2>
        <div className="rounded border p-4 space-y-2">
          <div>-</div>
        </div>
      </div>
    </div>
  );
};

export default mergedDataPage;