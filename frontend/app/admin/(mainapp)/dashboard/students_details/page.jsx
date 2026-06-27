"use client";

import React, { useEffect, useState, useRef } from "react";
import { adminServices } from "@/services/admin/admin.service";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowBigRight, LucideDelete, Pencil, SquareArrowOutUpRight, 
  Trash, ChevronRight, ChevronDown, Search, X, Shield, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ClassWiseStudents() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightId, setHighlightId] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  
  const dropdownRef = useRef(null);
  const [openClassMenu, setOpenClassMenu] = useState(false);
  const [hoverClass, setHoverClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");

  /* -------- FETCH CLASSES -------- */
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenClassMenu(false);
        setHoverClass(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await adminServices.getAllClasses();
      const data = res?.data || [];
      const classMap = {};
      data.forEach((item) => {
        if (!classMap[item.className]) {
          classMap[item.className] = {
            className: item.className,
            sections: []
          };
        }
        classMap[item.className].sections.push({
          name: item.section,
          classId: item._id
        });
      });
      const formatted = Object.values(classMap).sort(
        (a, b) => Number(a.className) - Number(b.className)
      );
      setClasses(formatted);
    } catch (err) {
      console.log(err);
    }
  };

  /* -------- FETCH STUDENTS -------- */
  const loadStudents = async (classData) => {
    try {
      setLoading(true);
      if (classData.section === "ALL") {
        let allStudents = [];
        for (const sec of classData.sections) {
          const res = await adminServices.getstudentsByClass(sec.classId);
          const data = res?.data || [];
          allStudents = [...allStudents, ...data];
        }
        setStudents(allStudents);
      } else {
        const res = await adminServices.getstudentsByClass(classData.classId);
        setStudents(res?.data || []);
      }
      setCurrentPage(1);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* -------- DELETE STUDENT -------- */
  const handleDeleteStudent = async (id) => {
    try {
      await adminServices.deleteStudent(id);
      setStudents((prev) => {
        const updated = prev.filter((student) => student._id !== id);
        if ((currentPage - 1) * rowsPerPage >= updated.length) {
          setCurrentPage((p) => Math.max(p - 1, 1));
        }
        return updated;
      });
      toast.success("Student deleted successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete student.");
    }
  };

  const totalPages = Math.ceil((isSearching ? filteredStudents.length : students.length) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentStudents = (isSearching ? filteredStudents : students).slice(startIndex, endIndex);

  const getVisiblePages = () => {
    const maxVisible = 6;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) return [1, 2, 3, 4, 5, 6];
    if (currentPage >= totalPages - 2) return Array.from({ length: 6 }, (_, i) => totalPages - 5 + i);
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage + 3,
    ];
  };
  const visiblePages = getVisiblePages();

  // Search Logic
  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setIsSearching(false);
      setFilteredStudents([]);
      return;
    }
    const results = students.filter((s) => {
      const admission = (s.admissionNumber || "").toLowerCase();
      const first = (s.firstName || "").toLowerCase();
      const last = (s.lastName || "").toLowerCase();
      const email = (s.email || "").toLowerCase();
      return (
        admission.includes(term) ||
        first.includes(term) ||
        last.includes(term) ||
        `${first} ${last}`.includes(term) ||
        email.includes(term)
      );
    });
    setFilteredStudents(results);
    setIsSearching(true);
    setCurrentPage(1);
  };

  // Update Email
  const handleEmailUpdate = async (id) => {
    try {
      await adminServices.updateStudent(id, { email: editEmail });
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, email: editEmail } : s))
      );
      if (isSearching) {
        setFilteredStudents((prev) =>
          prev.map((s) => (s._id === id ? { ...s, email: editEmail } : s))
        );
      }
      setEditingId(null);
      setEditEmail("");
      toast.success("Email updated successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to update email");
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans pb-10 transition-all duration-300">
      <div className="container mx-auto space-y-6 max-w-7xl pt-2 pb-8 px-2 md:px-0">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Class Wise Students
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and view students sorted by class and section.
            </p>
          </div>
        </div>

        {/* CONTROLS (SEARCH & CLASS FILTER) */}
        <div className="bg-card/60 backdrop-blur-md p-1.5 rounded-lg shadow-sm border border-border/50 flex flex-col md:flex-row items-center gap-2 relative z-10 max-w-2xl">
          
          <div className="flex items-center flex-1 px-3 w-full">
            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by Admission No, Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/70 h-9"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setIsSearching(false);
                  setFilteredStudents([]);
                }}
                className="text-muted-foreground hover:text-foreground transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleSearch}
              className="ml-2 bg-[#178F9E] hover:bg-[#0F6F7C] text-white text-xs font-medium px-4 py-1.5 rounded-md transition-all h-8 shadow-sm"
            >
              Search
            </button>
          </div>

          <div className="w-px h-6 bg-border hidden md:block"></div>

          {/* CLASS FILTER DROPDOWN */}
          <div ref={dropdownRef} className="relative w-full md:w-auto px-2">
            <button
              onClick={() => setOpenClassMenu(!openClassMenu)}
              className="w-full md:w-48 bg-card border border-border px-3 py-1.5 h-9 rounded-md text-sm text-foreground flex items-center justify-between hover:border-primary/50 transition-all shadow-sm focus:ring-1 focus:ring-primary/20 outline-none"
            >
              <span className="truncate">
                {selectedClass ? `Class ${selectedClass} ${selectedSection === "ALL" ? "" : selectedSection}` : "Select Class & Section"}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
            </button>

            <AnimatePresence>
              {openClassMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-11 right-0 md:left-0 md:right-auto bg-popover border border-border rounded-md shadow-lg min-w-[180px] z-[100] py-1"
                >
                  {classes.map((cls) => (
                    <div
                      key={cls.className}
                      onMouseEnter={() => setHoverClass(cls.className)}
                      onMouseLeave={() => setHoverClass(null)}
                      className="relative px-3 py-2 hover:bg-muted cursor-pointer flex justify-between items-center text-sm text-foreground transition-colors"
                    >
                      <span>Class {cls.className}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />

                      {hoverClass === cls.className && (
                        <div className="absolute left-full top-0 -ml-1 bg-popover border border-border rounded-md shadow-lg w-32 max-h-60 overflow-y-auto py-1 z-[101]">
                          <div
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-foreground transition-colors"
                            onClick={() => {
                              setSelectedClass(cls.className);
                              setSelectedSection("ALL");
                              setOpenClassMenu(false);
                              loadStudents({ section: "ALL", sections: cls.sections });
                            }}
                          >
                            All Sections
                          </div>
                          {cls.sections.map((sec) => (
                            <div
                              key={sec.classId}
                              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm text-foreground transition-colors"
                              onClick={() => {
                                setSelectedClass(cls.className);
                                setSelectedSection(sec.name);
                                setOpenClassMenu(false);
                                loadStudents({ section: sec.name, classId: sec.classId });
                              }}
                            >
                              Section {sec.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground italic">No classes found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RESULTS INFO */}
        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <div>
            {isSearching ? (
              <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Search Results: {filteredStudents.length} found
              </span>
            ) : selectedClass ? (
              <span>
                Showing students for <strong className="text-foreground">Class {selectedClass} {selectedSection !== "ALL" && selectedSection}</strong>
              </span>
            ) : (
              <span>Please select a class to view students.</span>
            )}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-card dark:bg-slate-800 border border-border dark:border-slate-700 shadow-sm rounded-lg overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-primary dark:bg-slate-900 text-primary-foreground dark:text-slate-100 border-b border-primary/20 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Adm. No</th>
                  <th className="px-4 py-3 font-medium">Student Name</th>
                  <th className="px-4 py-3 font-medium">Father Name</th>
                  <th className="px-4 py-3 font-medium">Email Address</th>
                  <th className="px-4 py-3 font-medium">Phone Number</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-muted-foreground">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading students...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Shield className="w-8 h-8 text-muted-foreground/50 mb-2" />
                        <span className="text-sm font-medium text-foreground">No students found</span>
                        <span className="text-xs">
                          {selectedClass 
                            ? "There are no students enrolled in this selection." 
                            : "Select a class to load students."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr 
                      key={student._id}
                      className={`hover:bg-muted/50 dark:hover:bg-slate-700/50 transition-colors group border-b border-border/50 dark:border-slate-700/50 last:border-0 ${highlightId === student._id ? "bg-primary/10" : "bg-transparent"}`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {student.admissionNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground font-medium">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {student.fatherName || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === student._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="h-7 px-2 border border-border bg-background rounded text-xs focus:ring-1 focus:ring-primary outline-none"
                              placeholder="Enter email"
                            />
                            <button
                              onClick={() => handleEmailUpdate(student._id)}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditEmail("");
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/email">
                            <span className="text-muted-foreground">{student.email || "—"}</span>
                            <button
                              onClick={() => {
                                setEditingId(student._id);
                                setEditEmail(student.email || "");
                              }}
                              className="text-primary opacity-0 group-hover/email:opacity-100 transition-opacity"
                              title="Edit Email"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {student.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link 
                            href={`/admin/dashboard/student_fee?admission=${student.admissionNumber}`}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="View Fees"
                          >
                            <SquareArrowOutUpRight className="w-4 h-4" />
                          </Link>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button 
                                className="p-1.5 text-muted-foreground hover:text-destructive-foreground hover:bg-destructive rounded-md transition-colors"
                                title="Delete Student"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-lg border-border bg-card shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-destructive flex items-center gap-2">
                                  <Trash className="w-4 h-4" /> Delete Student
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground text-sm">
                                  Are you sure you want to delete <strong>{student.firstName} {student.lastName}</strong>? This action cannot be undone and will remove all their records from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="h-9 text-sm">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStudent(student._id)}
                                  className="h-9 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                  Delete Permanently
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION FOOTER */}
          {currentStudents.length > 0 && (
            <div className="border-t border-border dark:border-slate-700 bg-muted/20 dark:bg-slate-900/50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Rows per page:</span>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-7 border-border dark:border-slate-700 bg-background dark:bg-slate-900 rounded px-2 text-xs w-[70px] text-foreground dark:text-slate-100">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover dark:bg-slate-800 border-border dark:border-slate-700 text-foreground dark:text-slate-100 text-xs shadow-md">
                    <SelectItem value="10" className="text-xs">10</SelectItem>
                    <SelectItem value="25" className="text-xs">25</SelectItem>
                    <SelectItem value="50" className="text-xs">50</SelectItem>
                    <SelectItem value="100" className="text-xs">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Pagination className="justify-end w-auto mx-0">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      className={`h-8 px-2.5 text-xs text-black dark:text-white rounded-md border border-border ${currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"}`}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    />
                  </PaginationItem>
                  
                  {visiblePages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        className={`h-8 w-8 text-xs text-black dark:text-white rounded-md border border-border ${
                          currentPage === page 
                          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
                          : "hover:bg-muted"
                        }`}
                        isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {totalPages > 6 && currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <span className="px-2 text-muted-foreground">...</span>
                    </PaginationItem>
                  )}
                  {totalPages > 6 && !visiblePages.includes(totalPages) && (
                    <PaginationItem>
                      <PaginationLink
                        className={`h-8 w-8 text-xs text-black dark:text-white rounded-md border border-border ${
                          currentPage === totalPages 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "hover:bg-muted"
                        }`}
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      className={`h-8 px-2.5 text-xs text-black dark:text-white rounded-md border border-border ${currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted"}`}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}