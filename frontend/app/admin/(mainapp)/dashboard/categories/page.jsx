"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  FolderPlus, 
  Edit3, 
  Trash2, 
  X, 
  LayoutGrid, 
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import { courseService } from "@/services/course.service";

// Custom Reusable Modal Component styled with theme variables
const Modal = ({ isOpen, onClose, title, subtitle, children, icon: Icon, iconColorClass }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border rounded-xl shadow-lg w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-transparent hover:bg-secondary rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          {Icon && (
            <div className={`p-2.5 rounded-lg ${iconColorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
};

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create State
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, name: "", slug: "", description: "" });
  const [editSlugEdited, setEditSlugEdited] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCategories();
      setCategories(data?.categories || data || []);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const slugify = (str) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  // --- CREATE HANDLERS ---
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !slugEdited) next.slug = slugify(value || "");
      if (name === "slug") {
        setSlugEdited(true);
        next.slug = slugify(value || "");
      }
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return toast.error("Name is required");
    
    try {
      setSubmitting(true);
      await courseService.createCategory({
        name: form.name.trim(),
        slug: form.slug?.trim() || slugify(form.name.trim()),
        description: form.description?.trim() || "",
      });
      setOpen(false);
      setForm({ name: "", slug: "", description: "" });
      setSlugEdited(false);
      toast.success("Category created");
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  // --- EDIT HANDLERS ---
  const startEdit = (cat) => {
    setEditForm({ 
      id: cat._id || cat.id, 
      name: cat.name || "", 
      slug: cat.slug || "", 
      description: cat.description || "" 
    });
    setEditSlugEdited(false);
    setEditOpen(true);
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !editSlugEdited) next.slug = slugify(value || "");
      if (name === "slug") {
        setEditSlugEdited(true);
        next.slug = slugify(value || "");
      }
      return next;
    });
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name?.trim()) return toast.error("Name is required");

    try {
      setEditSubmitting(true);
      await courseService.updateCategory(editForm.id, {
        name: editForm.name.trim(),
        slug: editForm.slug?.trim() || slugify(editForm.name.trim()),
        description: editForm.description?.trim() || "",
      });
      setEditOpen(false);
      toast.success("Category updated");
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update category");
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- DELETE HANDLERS ---
  const onConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await courseService.deleteCategory(deleteId);
      setDeleteId(null);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  };

  // --- SHARED INPUT CLASSES (shadcn styling) ---
  const inputBase = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const labelBase = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block";

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <p className="text-muted-foreground text-sm font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categories</h1>
            <p className="text-sm text-muted-foreground">Manage and organize your course categories.</p>
          </div>
          <button 
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 w-fit"
          >
            <FolderPlus className="w-4 h-4" />
            Add Category
          </button>
        </header>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat._id || cat.id} 
                className="bg-card text-card-foreground rounded-xl p-5 border shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(cat)}
                      className="p-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-accent rounded-md transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteId(cat._id || cat.id)}
                      className="p-2 text-muted-foreground hover:text-destructive bg-secondary hover:bg-destructive/10 rounded-md transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold tracking-tight">{cat.name}</h3>
                <div className="mt-1 mb-3">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground">
                    /{cat.slug}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground flex-1">
                  {cat.description || "No description provided."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center animate-in fade-in-50">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <FolderPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No categories added</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                You have not created any categories yet. Add one to get started.
              </p>
              <button 
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Add Category
              </button>
            </div>
          </div>
        )}

        {/* --- MODALS --- */}

        {/* CREATE MODAL */}
        <Modal 
          isOpen={open} 
          onClose={() => setOpen(false)}
          title="New Category"
          subtitle="Add a new category for your courses."
          icon={FolderPlus}
          iconColorClass="bg-primary/10 text-primary"
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelBase}>Name</label>
              <input id="name" name="name" placeholder="e.g. Web Development" value={form.name} onChange={onChange} className={inputBase} required />
            </div>
            <div>
              <label htmlFor="slug" className={labelBase}>Slug</label>
              <input id="slug" name="slug" placeholder="web-development" value={form.slug} onChange={onChange} className={inputBase} />
            </div>
            <div>
              <label htmlFor="description" className={labelBase}>Description (Optional)</label>
              <textarea id="description" name="description" placeholder="A brief description..." value={form.description} onChange={onChange} rows={3} className={`${inputBase} min-h-[80px] resize-none`} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
              <button type="button" onClick={() => setOpen(false)} className="mt-2 sm:mt-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                {submitting ? "Saving..." : "Create Category"}
              </button>
            </div>
          </form>
        </Modal>

        {/* EDIT MODAL */}
        <Modal 
          isOpen={editOpen} 
          onClose={() => setEditOpen(false)}
          title="Edit Category"
          subtitle="Update the details of this category."
          icon={Edit3}
          iconColorClass="bg-muted text-foreground"
        >
          <form onSubmit={onEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className={labelBase}>Name</label>
              <input id="edit-name" name="name" value={editForm.name} onChange={onEditChange} className={inputBase} required />
            </div>
            <div>
              <label htmlFor="edit-slug" className={labelBase}>Slug</label>
              <input id="edit-slug" name="slug" value={editForm.slug} onChange={onEditChange} className={inputBase} />
            </div>
            <div>
              <label htmlFor="edit-description" className={labelBase}>Description</label>
              <textarea id="edit-description" name="description" value={editForm.description} onChange={onEditChange} rows={3} className={`${inputBase} min-h-[80px] resize-none`} />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
              <button type="button" onClick={() => setEditOpen(false)} className="mt-2 sm:mt-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Cancel
              </button>
              <button type="submit" disabled={editSubmitting} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                {editSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* DELETE MODAL */}
        <Modal 
          isOpen={!!deleteId} 
          onClose={() => setDeleteId(null)}
          title="Are you absolutely sure?"
          subtitle="This action cannot be undone. This will permanently delete the category."
          icon={AlertTriangle}
          iconColorClass="bg-destructive/10 text-destructive"
        >
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 mt-2">
            <button onClick={() => setDeleteId(null)} className="mt-2 sm:mt-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Cancel
            </button>
            <button onClick={onConfirmDelete} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2">
              Yes, Delete
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
};

export default AllCategories;