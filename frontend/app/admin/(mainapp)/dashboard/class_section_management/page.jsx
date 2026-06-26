"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminServices } from "@/services/admin/admin.service";
import { toast } from "sonner";
import {
  Trash2, Plus, Users, Search,
  ArrowRight, FolderOpen, Layers
} from "lucide-react";

export default function ClassSectionManagement() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [newClass, setNewClass] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteType, setDeleteType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);

  /* =========================================================
     DATA FETCHING
     ========================================================= */
  const fetchAllData = async () => {
    try {
      const res = await adminServices.getAllClasses();
      const data = res?.data || [];

      const unique = [...new Map(data.map((i) => [i.className, i])).values()];
      setClasses(unique);

      if (selectedClass) {
        const selected = unique.find((c) => c._id === selectedClass);
        if (selected) {
          const sectionsList = data
            .filter((c) => c.className === selected.className)
            .sort((a, b) => a.section.localeCompare(b.section));
          setSections(sectionsList);
        }
      }
    } catch {
      toast.error("Failed to load class data.");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setSections([]);
      return;
    }
    fetchAllData();
  }, [selectedClass]);


  /* =========================================================
     MUTATIONS (CREATE / DELETE)
     ========================================================= */
  const createClass = async (e) => {
    if (e) e.preventDefault();
    const value = newClass.trim();

    if (!value) return toast.error("Please enter a class name.");
    if (classes.some((c) => c.className === value)) return toast.error("Class already exists.");

    try {
      setLoading(true);
      await adminServices.createClass({
        className: value,
        section: "A",
        academicYear: new Date().getFullYear(),
      });
      toast.success(`Class ${value} created.`);
      setNewClass("");
      await fetchAllData();
    } catch {
      toast.error("Failed to create class.");
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id) => {
    try {
      const selected = classes.find((c) => c._id === id);
      const res = await adminServices.getAllClasses();
      const all = res?.data || [];
      const docs = all.filter((c) => c.className === selected.className);

      await Promise.all(docs.map((d) => adminServices.deleteClass(d._id)));
      toast.success(`Class ${selected.className} deleted.`);

      if (selectedClass === id) {
        setSelectedClass("");
        setSections([]);
      }
      await fetchAllData();
    } catch {
      toast.error("Failed to delete class.");
    }
  };

  const createSection = async (e) => {
    if (e) e.preventDefault();
    const value = sectionName.trim().toUpperCase();

    if (!selectedClass) return toast.error("Select a class first.");
    if (!value) return toast.error("Please enter a section name.");
    if (sections.some((sec) => sec.section === value)) return toast.error(`Section ${value} already exists.`);

    const selected = classes.find((c) => c._id === selectedClass);

    try {
      setIsAddingSection(true);
      await adminServices.createClass({
        className: selected.className,
        section: value,
        academicYear: new Date().getFullYear(),
      });
      toast.success(`Section ${value} added.`);
      setSectionName("");
      await fetchAllData();
    } catch {
      toast.error("Failed to create section.");
    } finally {
      setIsAddingSection(false);
    }
  };

  const deleteSection = async (id) => {
    try {
      await adminServices.deleteClass(id);
      toast.success("Section removed.");
      setSections((prev) => prev.filter((s) => s._id !== id));
      await fetchAllData();
    } catch {
      toast.error("Failed to delete section.");
    }
  };

  const confirmDelete = async () => {
    if (deleteType === "class") await deleteClass(deleteId);
    if (deleteType === "section") await deleteSection(deleteId);
    setDeleteType(null);
    setDeleteId(null);
  };

  /* =========================================================
     HELPERS & SORTING
     ========================================================= */
  const sortedClasses = [...classes]
    .filter((c) =>
      String(c.className).toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      String(a.className).localeCompare(String(b.className), undefined, {
        numeric: true,
      })
    );

  const activeClassObject = classes.find((c) => c._id === selectedClass);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background text-foreground font-sans">

      {/* ====================================================
          LEFT PANE: CLASSES DIRECTORY
          ==================================================== */}
      <div className={`w-full md:w-[320px] lg:w-[380px] flex-shrink-0 flex flex-col border-r border-border bg-muted/10 ${selectedClass ? 'hidden md:flex' : 'flex'}`}>

        {/* Header & Search */}
        <div className="p-6 pb-4">
          <h1 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Directory
          </h1>
          <div className="relative group mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary rounded-md py-2.5 pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground shadow-sm"
            />
          </div>
        </div>

        {/* PROMINENT ADD CLASS TOOLBAR */}
        <form onSubmit={createClass} className="px-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New class name..."
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              disabled={loading}
              className="flex-1 bg-background border border-border focus:border-primary rounded-md py-2.5 px-3 text-sm outline-none transition-colors shadow-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !newClass.trim()}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors shadow-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </form>

        {/* Classes Flat List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Classes List</h3>
          {sortedClasses.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground text-sm">
              No classes found.
            </div>
          ) : (
            sortedClasses.map((cls) => {
              const isActive = selectedClass === cls._id;
              return (
                <button
                  key={cls._id}
                  onClick={() => setSelectedClass(cls._id)}
                  className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-md transition-colors group ${isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <span className="text-sm truncate">
                    Class {cls.className}
                  </span>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteType("class");
                      setDeleteId(cls._id);
                    }}
                    className={`p-1.5 rounded-md transition-colors ${isActive
                      ? "text-primary/60 hover:text-destructive hover:bg-destructive/10"
                      : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      }`}
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ====================================================
          RIGHT PANE: SECTIONS VIEW
          ==================================================== */}
      <div className={`flex-1 flex flex-col bg-background relative ${!selectedClass ? 'hidden md:flex' : 'flex'}`}>

        {selectedClass ? (
          <>


            {/* Detail Header */}
            <div className="px-8 pt-10 pb-6 flex-shrink-0">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Class {activeClassObject?.className}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Manage sections for this grade level.
              </p>
            </div>

            {/* PROMINENT ADD SECTION TOOLBAR */}
            <form onSubmit={createSection} className="px-8 py-5 border-y border-border bg-muted/5 flex items-center gap-3">
              <input
                type="text"
                placeholder="Section Name (e.g. A, B, C)"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value.toUpperCase())}
                maxLength={5}
                className="w-[240px] bg-background border border-border focus:border-primary rounded-md py-2.5 px-4 text-sm font-medium outline-none transition-colors shadow-sm uppercase placeholder:font-normal placeholder:normal-case"
              />
              <button
                type="submit"
                disabled={!sectionName.trim() || isAddingSection}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-5 rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </form>

            {/* Sections Flat List */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="flex flex-col max-w-3xl">

                {/* List Header */}
                <div className="flex items-center justify-between py-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <span>Section Name</span>
                  <span className="w-10 text-right">Action</span>
                </div>

                {sections.length === 0 && (
                  <div className="text-sm text-muted-foreground py-6">
                    No sections available. Add one above.
                  </div>
                )}


                <AnimatePresence>
                  {sections.map((sec) => (
                    <motion.div
                      key={sec._id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="group flex items-center justify-between py-3.5 border-b border-border/50 hover:bg-muted/30 -mx-4 px-4 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">
                        Section {sec.section}
                      </span>

                      <button
                        onClick={() => {
                          setDeleteType("section");
                          setDeleteId(sec._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {/* Toolbar (Mobile Back Button) */}
              <div className="md:hidden h-14 flex items-center px-4 border-b border-border flex-shrink-0">
                <button
                  onClick={() => setSelectedClass("")}
                  className="flex bg-cyan-800 rounded-xl text-white p-2 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Back to Class List
                </button>
              </div>
            </div>
          </>
        ) : (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-background">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Class Selected</h3>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              Select a class from the directory on the left to view and manage its sections.
            </p>
          </div>
        )}
      </div>


      {/* ====================================================
          THEMED DELETE MODAL
          ==================================================== */}
      <AnimatePresence>
        {deleteType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDeleteType(null);
                setDeleteId(null);
              }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-[400px] bg-background border border-border rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Delete {deleteType === "class" ? "Class" : "Section"}?
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {deleteType === "class"
                    ? "This will permanently delete this class and all associated sections. This action cannot be undone."
                    : "This section will be permanently removed. This action cannot be undone."}
                </p>
              </div>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
                <button
                  onClick={() => {
                    setDeleteType(null);
                    setDeleteId(null);
                  }}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}   