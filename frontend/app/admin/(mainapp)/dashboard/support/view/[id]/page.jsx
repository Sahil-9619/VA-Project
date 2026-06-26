"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactServices } from "@/services/contact.service";

export default function SupportDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket();
  }, []);

  const fetchTicket = async () => {
    try {
      const res = await ContactServices.getContactById(id);
      setTicket(res?.data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[70vh] text-lg text-muted-foreground">
        Loading ticket details...
      </div>
    );

  if (!ticket)
    return (
      <div className="flex items-center justify-center h-[70vh] text-lg">
        Ticket not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-12"
      >
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Support Ticket
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Complete overview of the customer request and details.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hover:scale-105 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* ===== Premium Card ===== */}
        <Card className="rounded-3xl border border-gray-200 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardContent className="p-14 space-y-14">

            {/* ===== Info Grid ===== */}
            <motion.div
              className="grid md:grid-cols-2 gap-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <InfoBlock label="Full Name" value={ticket?.name || "N/A"} />
              <InfoBlock label="Email Address" value={ticket?.email || "N/A"} />
              <InfoBlock label="Subject" value={ticket?.subject || "-"} />
              <InfoBlock
                label="Submitted On"
                value={
                  ticket?.createdAt
                    ? new Date(ticket.createdAt).toLocaleString()
                    : "-"
                }
              />
            </motion.div>

            {/* ===== Message Section ===== */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4">
                Message
              </p>

              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white to-slate-100 border border-gray-200 shadow-inner leading-relaxed text-[15px] text-gray-700">
                {ticket?.message || "No message provided."}
              </div>
            </motion.div>

            {/* ===== Status ===== */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              

              {ticket?.status === "open" && (
                <Badge className="px-6 py-2 text-sm bg-yellow-500/90 text-white rounded-full shadow-lg">
                  Open
                </Badge>
              )}

              {ticket?.status === "in-progress" && (
                <Badge className="px-6 py-2 text-sm bg-blue-600 text-white rounded-full shadow-lg">
                  In Progress
                </Badge>
              )}

              {ticket?.status === "closed" && (
                <Badge className="px-6 py-2 text-sm bg-green-600 text-white rounded-full shadow-lg">
                  Closed
                </Badge>
              )}
            </motion.div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ===== Elegant Info Block ===== */
function InfoBlock({ label, value }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-xl font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}