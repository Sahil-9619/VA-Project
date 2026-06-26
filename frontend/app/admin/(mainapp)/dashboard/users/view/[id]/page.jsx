"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adminServices } from "@/services/admin/admin.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ViewUserPage() {
  const router = useRouter();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!id) return;

  const fetchUser = async () => {
    try {
      const res = await adminServices.getUserById(id);

      console.log("FINAL RESPONSE:", res);

      // 🔥 Your backend returns { user: {...} }
      if (res?.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }

    } catch (error) {
      console.error("FETCH ERROR:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, [id]);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="p-10 text-center text-red-500">No Data Found</div>;
  }

  return (
    <div className="min-h-screen bg-white p-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="shadow-2xl rounded-3xl border border-gray-200">
          <CardHeader className="border-b bg-gray-50 rounded-t-3xl">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                {user.name || "-"}
              </CardTitle>
              <Badge className="capitalize bg-black text-white">
                {user.role?.name || "-"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Info label="Full Name" value={user.name} />
              <Info label="Email" value={user.email} />
              <Info label="Phone" value={user.phone} />
              <Info label="Role" value={user.role?.name} />
              <Info label="Verified" value={user.isVerified ? "Yes" : "No"} />
            </div>

            <div className="pt-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-lg">{value || "-"}</p>
    </div>
  );
}