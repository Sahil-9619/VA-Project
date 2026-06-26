"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Video,
  FileText,
  GripVertical,
  File,
} from "lucide-react";
import {
  createCourse,
  getAllCategories,
} from "@/lib/store/features/courseSlice";
import { useDispatch, useSelector } from "react-redux";
import * as courseActions from "@/lib/store/features/courseSlice";

export default function EnhancedCourseForm() {
  const dispatch = useDispatch();
  const { categories, status } = useSelector((state) => state.course);
  let isLoading = status == "loading";

  useEffect(() => {
    dispatch(courseActions.getAllCategories());
  }, []);

  // Basic course info
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [language, setLanguage] = useState("English");

  // Pricing
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [isFree, setIsFree] = useState(false);

  // Settings
  const [isPublished, setIsPublished] = useState(false);
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const [templateName, setTemplateName] = useState("certificate1");

  // Available certificate templates
  const certificateTemplates = [
    {
      id: "certificate1",
      name: "Modern Green",
      preview: "/certificate-templates/certificate1-preview.png",
    },
    {
      id: "certificate2",
      name: "Modern Orange",
      preview: "/certificate-templates/certificate2-preview.png",
    },

    // Add more templates as they become available
  ];

  // Tags
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");

  // Requirements and outcomes
  const [requirements, setRequirements] = useState([""]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([""]);

  // Sections and lessons
  const [sections, setSections] = useState([
    {
      title: "",
      description: "",
      order: 0,
      lessons: [
        {
          title: "",
          videoUrl: "",
          videoFile: null,
          duration: "",
          description: "",
          isFree: false,
          order: 0,
        },
      ],
      resources: [],
      quizzes: [],
    },
  ]);

  // Summary quiz (optional, single)
  const [summaryQuiz, setSummaryQuiz] = useState(null);

  // Add Category Modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [catError, setCatError] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    if (!slug) {
      setSlug(generateSlug(value));
    }
  };

  // Auto-generate category slug from category name
  const handleNewCatNameChange = (value) => {
    setNewCatName(value);
    if (!newCatSlug) {
      setNewCatSlug(generateSlug(value));
    }
  };

  const handleCreateCategory = async () => {
    setCatError("");
    const name = newCatName.trim();
    const slugVal = newCatSlug.trim();
    if (!name || !slugVal) {
      setCatError("Name and slug are required");
      return;
    }
    try {
      setCatSubmitting(true);
      const res = await dispatch(
        courseActions.createCategory({ name, slug: slugVal })
      ).unwrap();
      const created = res.category || res;
      if (created?._id) {
        setCategory(created._id);
      }
      // Reset and close modal
      setShowAddCategoryModal(false);
      setNewCatName("");
      setNewCatSlug("");
      setCatError("");
    } catch (e) {
      setCatError(
        typeof e === "string" ? e : e?.message || "Failed to create category"
      );
    } finally {
      setCatSubmitting(false);
    }
  };

  // Tag management
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Requirements management
  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const updateRequirement = (index, value) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  const removeRequirement = (index) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  // Learning outcomes management
  const addLearningOutcome = () => {
    setWhatYouWillLearn([...whatYouWillLearn, ""]);
  };

  const updateLearningOutcome = (index, value) => {
    const newOutcomes = [...whatYouWillLearn];
    newOutcomes[index] = value;
    setWhatYouWillLearn(newOutcomes);
  };

  const removeLearningOutcome = (index) => {
    if (whatYouWillLearn.length > 1) {
      setWhatYouWillLearn(whatYouWillLearn.filter((_, i) => i !== index));
    }
  };

  // Section management
  const addSection = () => {
    setSections([
      ...sections,
      {
        title: "",
        description: "",
        order: sections.length,
        lessons: [
          {
            title: "",
            videoUrl: "",
            videoFile: null,
            duration: "",
            description: "",
            isFree: false,
            order: 0,
          },
        ],
        resources: [],
        quizzes: [],
      },
    ]);
  };

  const removeSection = (sectionIndex) => {
    if (sections.length > 1) {
      setSections(sections.filter((_, index) => index !== sectionIndex));
    }
  };

  const updateSectionField = (sectionIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex][field] = value;
    setSections(newSections);
  };

  // Lesson management
  const addLesson = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons.push({
      title: "",
      videoUrl: "",
      videoFile: null,
      duration: "",
      description: "",
      isFree: false,
      order: newSections[sectionIndex].lessons.length,
    });
    setSections(newSections);
  };

  const removeLesson = (sectionIndex, lessonIndex) => {
    const newSections = [...sections];
    if (newSections[sectionIndex].lessons.length > 1) {
      newSections[sectionIndex].lessons.splice(lessonIndex, 1);
      setSections(newSections);
    }
  };

  const handleLessonChange = (sectionIndex, lessonIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons[lessonIndex][field] = value;
    setSections(newSections);
  };

  // Resource management - UPDATED FOR DOCUMENT NOTES
  const addResource = (sectionIndex, type) => {
    const newSections = [...sections];
    newSections[sectionIndex].resources.push({
      type,
      title: "",
      url: "",
      content: "",
      file: null, // NEW: For document file upload
      isFree: false,
      order: newSections[sectionIndex].resources.length,
    });
    setSections(newSections);
  };

  const removeResource = (sectionIndex, resourceIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].resources.splice(resourceIndex, 1);
    setSections(newSections);
  };

  const handleResourceChange = (sectionIndex, resourceIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].resources[resourceIndex][field] = value;
    setSections(newSections);
  };

  // Quizzes management for sections
  const addQuiz = (sectionIndex) => {
    const newSections = [...sections];
    const quizzes = newSections[sectionIndex].quizzes || [];
    if (quizzes.length >= 3) return; // cap at 3
    quizzes.push({
      title: "",
      description: "",
      timeLimit: 0,
      passScore: 0,
      isFree: false,
      order: quizzes.length,
      questions: [
        {
          question: "",
          options: ["", ""],
          correctOptionIndex: 0,
          points: 1,
          explanation: "",
        },
      ],
    });
    newSections[sectionIndex].quizzes = quizzes;
    setSections(newSections);
  };

  const removeQuiz = (sectionIndex, quizIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].quizzes.splice(quizIndex, 1);
    setSections(newSections);
  };

  const updateQuizField = (sectionIndex, quizIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].quizzes[quizIndex][field] = value;
    setSections(newSections);
  };

  const addQuestion = (sectionIndex, quizIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].quizzes[quizIndex].questions.push({
      question: "",
      options: ["", ""],
      correctOptionIndex: 0,
      points: 1,
      explanation: "",
    });
    setSections(newSections);
  };

  const removeQuestion = (sectionIndex, quizIndex, questionIndex) => {
    const newSections = [...sections];
    const qs = newSections[sectionIndex].quizzes[quizIndex].questions;
    if (qs.length > 1) {
      qs.splice(questionIndex, 1);
      setSections(newSections);
    }
  };

  const updateQuestionField = (
    sectionIndex,
    quizIndex,
    questionIndex,
    field,
    value
  ) => {
    const newSections = [...sections];
    newSections[sectionIndex].quizzes[quizIndex].questions[questionIndex][
      field
    ] = value;
    setSections(newSections);
  };

  const addOption = (sectionIndex, quizIndex, questionIndex) => {
    const newSections = [...sections];
    const opts =
      newSections[sectionIndex].quizzes[quizIndex].questions[questionIndex]
        .options;
    if (opts.length < 10) {
      opts.push("");
      setSections(newSections);
    }
  };

  const removeOption = (
    sectionIndex,
    quizIndex,
    questionIndex,
    optionIndex
  ) => {
    const newSections = [...sections];
    const q =
      newSections[sectionIndex].quizzes[quizIndex].questions[questionIndex];
    if (q.options.length > 2) {
      q.options.splice(optionIndex, 1);
      if (q.correctOptionIndex >= q.options.length) {
        q.correctOptionIndex = 0;
      }
      setSections(newSections);
    }
  };

  const updateOption = (
    sectionIndex,
    quizIndex,
    questionIndex,
    optionIndex,
    value
  ) => {
    const newSections = [...sections];
    newSections[sectionIndex].quizzes[quizIndex].questions[
      questionIndex
    ].options[optionIndex] = value;
    setSections(newSections);
  };

  const setCorrectOption = (
    sectionIndex,
    quizIndex,
    questionIndex,
    optionIndex
  ) => {
    const newSections = [...sections];
    newSections[sectionIndex].quizzes[quizIndex].questions[
      questionIndex
    ].correctOptionIndex = optionIndex;
    setSections(newSections);
  };

  // Summary quiz handlers
  const initSummaryQuiz = () => {
    setSummaryQuiz({
      title: "",
      description: "",
      timeLimit: 0,
      passScore: 0,
      isFree: false,
      order: 0,
      questions: [
        {
          question: "",
          options: ["", ""],
          correctOptionIndex: 0,
          points: 1,
          explanation: "",
        },
      ],
    });
  };

  const updateSummaryQuizField = (field, value) => {
    setSummaryQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const addSummaryQuestion = () => {
    setSummaryQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          options: ["", ""],
          correctOptionIndex: 0,
          points: 1,
          explanation: "",
        },
      ],
    }));
  };

  const removeSummaryQuestion = (qIndex) => {
    setSummaryQuiz((prev) => ({
      ...prev,
      questions:
        prev.questions.length > 1
          ? prev.questions.filter((_, i) => i !== qIndex)
          : prev.questions,
    }));
  };

  const updateSummaryQuestionField = (qIndex, field, value) => {
    setSummaryQuiz((prev) => {
      const qs = [...prev.questions];
      qs[qIndex] = { ...qs[qIndex], [field]: value };
      return { ...prev, questions: qs };
    });
  };

  const addSummaryOption = (qIndex) => {
    setSummaryQuiz((prev) => {
      const qs = [...prev.questions];
      if (qs[qIndex].options.length < 10) {
        qs[qIndex] = { ...qs[qIndex], options: [...qs[qIndex].options, ""] };
      }
      return { ...prev, questions: qs };
    });
  };

  const removeSummaryOption = (qIndex, optIndex) => {
    setSummaryQuiz((prev) => {
      const qs = [...prev.questions];
      if (qs[qIndex].options.length > 2) {
        const newOpts = qs[qIndex].options.filter((_, i) => i !== optIndex);
        let correct = qs[qIndex].correctOptionIndex;
        if (correct >= newOpts.length) correct = 0;
        qs[qIndex] = {
          ...qs[qIndex],
          options: newOpts,
          correctOptionIndex: correct,
        };
      }
      return { ...prev, questions: qs };
    });
  };

  const updateSummaryOption = (qIndex, optIndex, value) => {
    setSummaryQuiz((prev) => {
      const qs = [...prev.questions];
      const newOpts = [...qs[qIndex].options];
      newOpts[optIndex] = value;
      qs[qIndex] = { ...qs[qIndex], options: newOpts };
      return { ...prev, questions: qs };
    });
  };

  const setSummaryCorrectOption = (qIndex, optIndex) => {
    setSummaryQuiz((prev) => {
      const qs = [...prev.questions];
      qs[qIndex] = { ...qs[qIndex], correctOptionIndex: optIndex };
      return { ...prev, questions: qs };
    });
  };

  // Form submission - UPDATED FOR DOCUMENT NOTES
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Basic course data
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("level", level);
    formData.append("language", language);
    formData.append("price", isFree ? "0" : price);
    formData.append("discountPrice", discountPrice || "0");
    formData.append("isFree", isFree.toString());
    formData.append("isPublished", isPublished.toString());
    formData.append("certificateEnabled", certificateEnabled.toString());
    if (certificateEnabled) {
      formData.append("templateName", templateName);
    }

    // Append arrays
    tags.forEach((tag) => {
      formData.append("tags", tag);
    });

    requirements
      .filter((r) => r.trim())
      .forEach((req) => {
        formData.append("requirements", req);
      });

    whatYouWillLearn
      .filter((w) => w.trim())
      .forEach((item) => {
        formData.append("whatYouWillLearn", item);
      });

    // Thumbnail
    if (thumbnail) formData.append("thumbnail", thumbnail);

    // Lesson videos
    sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        if (lesson.videoFile) {
          formData.append("lessonVideos", lesson.videoFile);
        }
      });
    });

    // NEW: Document files for resources
    // In your handleSubmit function, make sure you're appending document files correctly:

    // NEW: Document files for resources
    sections.forEach((section, sIdx) => {
      section.resources.forEach((resource, rIdx) => {
        if (resource.file && resource.type === "document") {
          formData.append("documentFiles", resource.file);
        }
      });
    });
    // Sections data (including quizzes)
    const sectionsData = sections.map((section) => ({
      title: section.title,
      description: section.description,
      order: section.order,
      lessons: section.lessons.map((lesson) => ({
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration ? parseInt(lesson.duration) : 0,
        description: lesson.description,
        isFree: lesson.isFree,
        order: lesson.order,
      })),
      resources: section.resources.map((resource) => ({
        type: resource.type,
        title: resource.title,
        url: resource.url,
        content: resource.content,
        isFree: resource.isFree,
        order: resource.order,
        // File will be handled separately in backend
      })),
      quizzes: (section.quizzes || []).slice(0, 3).map((quiz, idx) => ({
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit ? parseInt(quiz.timeLimit) : 0,
        passScore: quiz.passScore ? parseInt(quiz.passScore) : 0,
        isFree: !!quiz.isFree,
        order: idx,
        questions: (quiz.questions || []).map((q) => ({
          question: q.question,
          options: (q.options || []).slice(0, 10),
          correctOptionIndex:
            typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : 0,
          points: q.points ? parseInt(q.points) : 1,
          explanation: q.explanation || "",
        })),
      })),
    }));

    formData.append("sections", JSON.stringify(sectionsData));

    // Optional summary quiz
    if (
      summaryQuiz &&
      summaryQuiz.title &&
      (summaryQuiz.questions || []).length > 0
    ) {
      const normalizedSummary = {
        title: summaryQuiz.title,
        description: summaryQuiz.description || "",
        timeLimit: summaryQuiz.timeLimit ? parseInt(summaryQuiz.timeLimit) : 0,
        passScore: summaryQuiz.passScore ? parseInt(summaryQuiz.passScore) : 0,
        isFree: !!summaryQuiz.isFree,
        order: 0,
        questions: (summaryQuiz.questions || []).map((q) => ({
          question: q.question,
          options: (q.options || []).slice(0, 10),
          correctOptionIndex:
            typeof q.correctOptionIndex === "number" ? q.correctOptionIndex : 0,
          points: q.points ? parseInt(q.points) : 1,
          explanation: q.explanation || "",
        })),
      };
      formData.append("summaryQuiz", JSON.stringify(normalizedSummary));
    }

    console.log("Form data ready for submission:");

    // Debug: Log what's being sent
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    dispatch(createCourse(formData));
  };

  return (
    <div className="mx-auto p-6 space-y-6">
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddCategoryModal(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newCatName">Name *</Label>
                <Input
                  id="newCatName"
                  value={newCatName}
                  onChange={(e) => handleNewCatNameChange(e.target.value)}
                  placeholder="e.g. Web Development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newCatSlug">Slug *</Label>
                <Input
                  id="newCatSlug"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="web-development"
                />
              </div>
              {catError && <p className="text-sm text-red-600">{catError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCategoryModal(false)}
                disabled={catSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateCategory}
                disabled={catSubmitting}
              >
                {catSubmitting ? "Adding..." : "Add Category"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create New Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab - UNCHANGED */}
              <TabsContent value="basic" className="space-y-6">
                {/* ... (keep all the existing basic info form fields) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter course title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="course-url-slug"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn in this course"
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCategoryModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Category
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Course Thumbnail *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <Label
                        htmlFor="thumbnail"
                        className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Click to upload thumbnail
                      </Label>
                      <p className="text-sm text-gray-500">
                        PNG, JPG up to 2MB
                      </p>
                      <input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                    {thumbnail && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {thumbnail.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="99.00"
                      min="0"
                      step="0.01"
                      disabled={isFree}
                      required={!isFree}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discount Price ($)</Label>
                    <Input
                      id="discountPrice"
                      type="number"
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="79.00"
                      min="0"
                      step="0.01"
                      disabled={isFree}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="isFree"
                      checked={isFree}
                      onCheckedChange={setIsFree}
                    />
                    <Label htmlFor="isFree">Free Course</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Summary Quiz (Optional) */}
              <TabsContent value="content" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Course Summary Quiz (Optional)
                      </CardTitle>
                      {!summaryQuiz && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={initSummaryQuiz}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Summary Quiz
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {summaryQuiz && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Summary quiz title"
                          value={summaryQuiz.title}
                          onChange={(e) =>
                            updateSummaryQuizField("title", e.target.value)
                          }
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Time limit (seconds)"
                          value={summaryQuiz.timeLimit}
                          onChange={(e) =>
                            updateSummaryQuizField(
                              "timeLimit",
                              parseInt(e.target.value || "0")
                            )
                          }
                          min={0}
                        />
                        <Input
                          type="number"
                          placeholder="Pass score"
                          value={summaryQuiz.passScore}
                          onChange={(e) =>
                            updateSummaryQuizField(
                              "passScore",
                              parseInt(e.target.value || "0")
                            )
                          }
                          min={0}
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`summary-free`}
                            checked={!!summaryQuiz.isFree}
                            onCheckedChange={(checked) =>
                              updateSummaryQuizField("isFree", checked)
                            }
                          />
                          <Label htmlFor={`summary-free`}>Free Preview</Label>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Summary quiz description"
                        value={summaryQuiz.description || ""}
                        onChange={(e) =>
                          updateSummaryQuizField("description", e.target.value)
                        }
                      />
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">Questions</div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={addSummaryQuestion}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                          </Button>
                        </div>
                        {summaryQuiz.questions.map((ques, qqIdx) => (
                          <div
                            key={qqIdx}
                            className="border rounded-md p-3 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm">Q{qqIdx + 1}</div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSummaryQuestion(qqIdx)}
                                className="text-red-600"
                                disabled={summaryQuiz.questions.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Question text"
                              value={ques.question}
                              onChange={(e) =>
                                updateSummaryQuestionField(
                                  qqIdx,
                                  "question",
                                  e.target.value
                                )
                              }
                              required
                            />
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-sm">Options</div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addSummaryOption(qqIdx)}
                                  disabled={ques.options.length >= 10}
                                >
                                  <Plus className="h-4 w-4 mr-2" /> Add Option
                                </Button>
                              </div>
                              {ques.options.map((opt, ooIdx) => (
                                <div
                                  key={ooIdx}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="radio"
                                    name={`summary-correct-${qqIdx}`}
                                    checked={ques.correctOptionIndex === ooIdx}
                                    onChange={() =>
                                      setSummaryCorrectOption(qqIdx, ooIdx)
                                    }
                                  />
                                  <Input
                                    value={opt}
                                    onChange={(e) =>
                                      updateSummaryOption(
                                        qqIdx,
                                        ooIdx,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Option ${ooIdx + 1}`}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      removeSummaryOption(qqIdx, ooIdx)
                                    }
                                    disabled={ques.options.length === 2}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <Input
                                type="number"
                                min={0}
                                value={ques.points ?? 1}
                                onChange={(e) =>
                                  updateSummaryQuestionField(
                                    qqIdx,
                                    "points",
                                    parseInt(e.target.value || "0")
                                  )
                                }
                                placeholder="Points"
                              />
                              <Input
                                value={ques.explanation || ""}
                                onChange={(e) =>
                                  updateSummaryQuestionField(
                                    qqIdx,
                                    "explanation",
                                    e.target.value
                                  )
                                }
                                placeholder="Explanation (optional)"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>
              {/* Content Tab - UPDATED FOR DOCUMENT NOTES */}
              <TabsContent value="content" className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Course Sections</h3>
                    <Button
                      type="button"
                      onClick={addSection}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>

                  {sections.map((section, sIdx) => (
                    <Card key={sIdx} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-gray-400" />
                            <CardTitle className="text-lg">
                              Section {sIdx + 1}
                            </CardTitle>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(sIdx)}
                            disabled={sections.length === 1}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Section Title *</Label>
                            <Input
                              value={section.title}
                              onChange={(e) =>
                                updateSectionField(
                                  sIdx,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Introduction to..."
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Section Description</Label>
                            <Input
                              value={section.description}
                              onChange={(e) =>
                                updateSectionField(
                                  sIdx,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Brief description of this section"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Lessons</h4>
                            <Button
                              type="button"
                              onClick={() => addLesson(sIdx)}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Lesson
                            </Button>
                          </div>

                          {section.lessons.map((lesson, lIdx) => (
                            <Card key={lIdx} className="border">
                              <CardContent className="pt-4">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-sm">
                                      Lesson {lIdx + 1}
                                    </h5>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeLesson(sIdx, lIdx)}
                                      disabled={section.lessons.length === 1}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Lesson Title *</Label>
                                      <Input
                                        value={lesson.title}
                                        onChange={(e) =>
                                          handleLessonChange(
                                            sIdx,
                                            lIdx,
                                            "title",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Lesson title"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Duration (minutes)</Label>
                                      <Input
                                        type="number"
                                        value={lesson.duration}
                                        onChange={(e) =>
                                          handleLessonChange(
                                            sIdx,
                                            lIdx,
                                            "duration",
                                            e.target.value
                                          )
                                        }
                                        placeholder="15"
                                        min="1"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Lesson Description</Label>
                                    <Textarea
                                      value={lesson.description}
                                      onChange={(e) =>
                                        handleLessonChange(
                                          sIdx,
                                          lIdx,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      placeholder="What will students learn in this lesson?"
                                      className="min-h-[80px]"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Video URL</Label>
                                    <Input
                                      value={lesson.videoUrl}
                                      onChange={(e) =>
                                        handleLessonChange(
                                          sIdx,
                                          lIdx,
                                          "videoUrl",
                                          e.target.value
                                        )
                                      }
                                      placeholder="https://youtube.com/..."
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label>Or Upload Video File</Label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) =>
                                          handleLessonChange(
                                            sIdx,
                                            lIdx,
                                            "videoFile",
                                            e.target.files[0]
                                          )
                                        }
                                        className="hidden"
                                        id={`video-${sIdx}-${lIdx}`}
                                      />
                                      <Label
                                        htmlFor={`video-${sIdx}-${lIdx}`}
                                        className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                                      >
                                        <Video className="h-4 w-4" />
                                        Choose Video
                                      </Label>
                                      {lesson.videoFile && (
                                        <span className="text-sm text-green-600">
                                          {lesson.videoFile.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`lesson-free-${sIdx}-${lIdx}`}
                                      checked={lesson.isFree}
                                      onCheckedChange={(checked) =>
                                        handleLessonChange(
                                          sIdx,
                                          lIdx,
                                          "isFree",
                                          checked
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={`lesson-free-${sIdx}-${lIdx}`}
                                    >
                                      Free Preview
                                    </Label>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              Additional Resources
                            </h4>
                            <div className="flex gap-2">
                              {/* <Button
                                type="button"
                                onClick={() => addResource(sIdx, "pdf")}
                                variant="outline"
                                size="sm"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                PDF
                              </Button> */}
                              {/* <Button
                                type="button"
                                onClick={() => addResource(sIdx, "quiz")}
                                variant="outline"
                                size="sm"
                              >
                                Quiz
                              </Button> */}
                              {/* NEW: Document Notes Button */}
                              <Button
                                type="button"
                                onClick={() => addResource(sIdx, "document")}
                                variant="outline"
                                size="sm"
                              >
                                <File className="h-4 w-4 mr-2" />
                                Document Notes
                              </Button>
                              <Button
                                type="button"
                                onClick={() => addQuiz(sIdx)}
                                variant="outline"
                                size="sm"
                                disabled={(section.quizzes || []).length >= 3}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Quiz (max 3)
                              </Button>
                            </div>
                          </div>
                          {section.resources.map((resource, rIdx) => (
                            <Card key={rIdx} className="border">
                              <CardContent className="pt-4">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Badge
                                      variant={
                                        resource.type === "document"
                                          ? "default"
                                          : resource.type === "pdf"
                                          ? "destructive"
                                          : resource.type === "quiz"
                                          ? "secondary"
                                          : "outline"
                                      }
                                    >
                                      {resource.type.toUpperCase()}
                                    </Badge>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeResource(sIdx, rIdx)}
                                      className="text-red-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                      value={resource.title}
                                      onChange={(e) =>
                                        handleResourceChange(
                                          sIdx,
                                          rIdx,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Resource title"
                                      required
                                    />

                                    {/* Show URL field only for non-document types */}
                                    {resource.type !== "document" && (
                                      <Input
                                        value={resource.url}
                                        onChange={(e) =>
                                          handleResourceChange(
                                            sIdx,
                                            rIdx,
                                            "url",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Resource URL"
                                      />
                                    )}
                                  </div>

                                  {/* File Upload for Document Notes */}
                                  {resource.type === "document" && (
                                    <div className="space-y-2">
                                      <Label>Upload Document File *</Label>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="file"
                                          accept=".pdf,.doc,.docx,.txt,.md"
                                          onChange={(e) =>
                                            handleResourceChange(
                                              sIdx,
                                              rIdx,
                                              "file",
                                              e.target.files[0]
                                            )
                                          }
                                          className="hidden"
                                          id={`document-${sIdx}-${rIdx}`}
                                          required
                                        />
                                        <Label
                                          htmlFor={`document-${sIdx}-${rIdx}`}
                                          className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                                        >
                                          <File className="h-4 w-4" />
                                          {resource.file
                                            ? "Change Document"
                                            : "Choose Document"}
                                        </Label>
                                        {resource.file && (
                                          <span className="text-sm text-green-600">
                                            {resource.file.name}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        Supported formats: PDF, DOC, DOCX, TXT,
                                        MD (Max 10MB)
                                      </p>
                                    </div>
                                  )}

                                  {/* URL field for PDF type */}
                                  {resource.type === "pdf" && (
                                    <div className="space-y-2">
                                      <Label>PDF URL</Label>
                                      <Input
                                        value={resource.url}
                                        onChange={(e) =>
                                          handleResourceChange(
                                            sIdx,
                                            rIdx,
                                            "url",
                                            e.target.value
                                          )
                                        }
                                        placeholder="https://example.com/document.pdf"
                                      />
                                    </div>
                                  )}

                                  {/* Content field for Quiz type */}
                                  {resource.type === "quiz" && (
                                    <div className="space-y-2">
                                      <Label>Quiz Instructions</Label>
                                      <Textarea
                                        value={resource.content}
                                        onChange={(e) =>
                                          handleResourceChange(
                                            sIdx,
                                            rIdx,
                                            "content",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter quiz instructions or questions..."
                                        className="min-h-[80px]"
                                      />
                                    </div>
                                  )}

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`resource-free-${sIdx}-${rIdx}`}
                                      checked={resource.isFree}
                                      onCheckedChange={(checked) =>
                                        handleResourceChange(
                                          sIdx,
                                          rIdx,
                                          "isFree",
                                          checked
                                        )
                                      }
                                    />
                                    <Label
                                      htmlFor={`resource-free-${sIdx}-${rIdx}`}
                                    >
                                      Free Preview
                                    </Label>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        {/* Quizzes for this section */}
                        {(section.quizzes || []).length > 0 && (
                          <div className="space-y-4 mt-6">
                            <h4 className="font-medium">Section Quizzes</h4>
                            {section.quizzes.map((quiz, qIdx) => (
                              <Card key={qIdx} className="border">
                                <CardContent className="pt-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">
                                      Quiz {qIdx + 1}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeQuiz(sIdx, qIdx)}
                                      className="text-red-600"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                      placeholder="Quiz title"
                                      value={quiz.title}
                                      onChange={(e) =>
                                        updateQuizField(
                                          sIdx,
                                          qIdx,
                                          "title",
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Time limit (seconds)"
                                      value={quiz.timeLimit}
                                      onChange={(e) =>
                                        updateQuizField(
                                          sIdx,
                                          qIdx,
                                          "timeLimit",
                                          parseInt(e.target.value || "0")
                                        )
                                      }
                                      min={0}
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Pass score"
                                      value={quiz.passScore}
                                      onChange={(e) =>
                                        updateQuizField(
                                          sIdx,
                                          qIdx,
                                          "passScore",
                                          parseInt(e.target.value || "0")
                                        )
                                      }
                                      min={0}
                                    />
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`quiz-free-${sIdx}-${qIdx}`}
                                        checked={!!quiz.isFree}
                                        onCheckedChange={(checked) =>
                                          updateQuizField(
                                            sIdx,
                                            qIdx,
                                            "isFree",
                                            checked
                                          )
                                        }
                                      />
                                      <Label
                                        htmlFor={`quiz-free-${sIdx}-${qIdx}`}
                                      >
                                        Free Preview
                                      </Label>
                                    </div>
                                  </div>
                                  <Textarea
                                    placeholder="Quiz description"
                                    value={quiz.description || ""}
                                    onChange={(e) =>
                                      updateQuizField(
                                        sIdx,
                                        qIdx,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-sm">
                                        Questions
                                      </div>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => addQuestion(sIdx, qIdx)}
                                      >
                                        <Plus className="h-4 w-4 mr-2" /> Add
                                        Question
                                      </Button>
                                    </div>
                                    {quiz.questions.map((ques, qqIdx) => (
                                      <div
                                        key={qqIdx}
                                        className="border rounded-md p-3 space-y-3"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="text-sm">
                                            Q{qqIdx + 1}
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              removeQuestion(sIdx, qIdx, qqIdx)
                                            }
                                            className="text-red-600"
                                            disabled={
                                              quiz.questions.length === 1
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <Input
                                          placeholder="Question text"
                                          value={ques.question}
                                          onChange={(e) =>
                                            updateQuestionField(
                                              sIdx,
                                              qIdx,
                                              qqIdx,
                                              "question",
                                              e.target.value
                                            )
                                          }
                                          required
                                        />
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <div className="text-sm">
                                              Options
                                            </div>
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                addOption(sIdx, qIdx, qqIdx)
                                              }
                                              disabled={
                                                ques.options.length >= 10
                                              }
                                            >
                                              <Plus className="h-4 w-4 mr-2" />{" "}
                                              Add Option
                                            </Button>
                                          </div>
                                          {ques.options.map((opt, ooIdx) => (
                                            <div
                                              key={ooIdx}
                                              className="flex items-center gap-2"
                                            >
                                              <input
                                                type="radio"
                                                name={`correct-${sIdx}-${qIdx}-${qqIdx}`}
                                                checked={
                                                  ques.correctOptionIndex ===
                                                  ooIdx
                                                }
                                                onChange={() =>
                                                  setCorrectOption(
                                                    sIdx,
                                                    qIdx,
                                                    qqIdx,
                                                    ooIdx
                                                  )
                                                }
                                              />
                                              <Input
                                                value={opt}
                                                onChange={(e) =>
                                                  updateOption(
                                                    sIdx,
                                                    qIdx,
                                                    qqIdx,
                                                    ooIdx,
                                                    e.target.value
                                                  )
                                                }
                                                placeholder={`Option ${
                                                  ooIdx + 1
                                                }`}
                                              />
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                  removeOption(
                                                    sIdx,
                                                    qIdx,
                                                    qqIdx,
                                                    ooIdx
                                                  )
                                                }
                                                disabled={
                                                  ques.options.length === 2
                                                }
                                                className="text-red-600"
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                          <Input
                                            type="number"
                                            min={0}
                                            value={ques.points ?? 1}
                                            onChange={(e) =>
                                              updateQuestionField(
                                                sIdx,
                                                qIdx,
                                                qqIdx,
                                                "points",
                                                parseInt(e.target.value || "0")
                                              )
                                            }
                                            placeholder="Points"
                                          />
                                          <Input
                                            value={ques.explanation || ""}
                                            onChange={(e) =>
                                              updateQuestionField(
                                                sIdx,
                                                qIdx,
                                                qqIdx,
                                                "explanation",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Explanation (optional)"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Requirements Tab - UNCHANGED */}
              <TabsContent value="requirements" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Course Requirements
                      </h3>
                      <Button
                        type="button"
                        onClick={addRequirement}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Requirement
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {requirements.map((req, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={req}
                            onChange={(e) =>
                              updateRequirement(index, e.target.value)
                            }
                            placeholder="Basic knowledge of..."
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                            disabled={requirements.length === 1}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        What You'll Learn
                      </h3>
                      <Button
                        type="button"
                        onClick={addLearningOutcome}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Outcome
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {whatYouWillLearn.map((outcome, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={outcome}
                            onChange={(e) =>
                              updateLearningOutcome(index, e.target.value)
                            }
                            placeholder="How to build..."
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLearningOutcome(index)}
                            disabled={whatYouWillLearn.length === 1}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab - UNCHANGED */}
              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Publication Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="published">Publish Course</Label>
                          <p className="text-sm text-gray-500">
                            Make this course visible to students
                          </p>
                        </div>
                        <Switch
                          id="published"
                          checked={isPublished}
                          onCheckedChange={setIsPublished}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="certificate">
                              Enable Certificates
                            </Label>
                            <p className="text-sm text-gray-500">
                              Award certificates upon course completion
                            </p>
                          </div>
                          <Switch
                            id="certificate"
                            checked={certificateEnabled}
                            onCheckedChange={setCertificateEnabled}
                          />
                        </div>

                        {certificateEnabled && (
                          <div className="mt-4 space-y-2">
                            <Label>Certificate Template</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                              {certificateTemplates.map((template) => (
                                <div
                                  key={template.id}
                                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                    templateName === template.id
                                      ? "border-primary ring-2 ring-primary/50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                  onClick={() => setTemplateName(template.id)}
                                >
                                  <div className="relative pb-[70%] bg-gray-100 rounded overflow-hidden mb-2">
                                    <img
                                      src={template.preview}
                                      alt={template.name}
                                      className="absolute inset-0 w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "/certificate-placeholder.png";
                                      }}
                                    />
                                  </div>
                                  <p className="text-sm font-medium text-center">
                                    {template.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Course Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {sections.length}
                          </div>
                          <div className="text-sm text-blue-600">Sections</div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {sections.reduce(
                              (total, section) =>
                                total + section.lessons.length,
                              0
                            )}
                          </div>
                          <div className="text-sm text-green-600">Lessons</div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {sections.reduce(
                              (total, section) =>
                                total + section.resources.length,
                              0
                            )}
                          </div>
                          <div className="text-sm text-purple-600">
                            Resources
                          </div>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {sections.reduce(
                              (total, section) =>
                                total +
                                section.lessons.reduce(
                                  (lessonTotal, lesson) =>
                                    lessonTotal +
                                    (lesson.duration
                                      ? parseInt(lesson.duration) || 0
                                      : 0),
                                  0
                                ),
                              0
                            )}
                          </div>
                          <div className="text-sm text-orange-600">Minutes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Preview Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">
                          Free Preview Lessons
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {sections.map((section, sIdx) =>
                            section.lessons
                              .filter((lesson) => lesson.isFree)
                              .map((lesson, lIdx) => (
                                <div
                                  key={`${sIdx}-${lIdx}`}
                                  className="flex items-center gap-2"
                                >
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>
                                    {section.title} -{" "}
                                    {lesson.title || `Lesson ${lIdx + 1}`}
                                  </span>
                                </div>
                              ))
                          )}
                          {sections.every((section) =>
                            section.lessons.every((lesson) => !lesson.isFree)
                          ) && (
                            <p className="text-gray-500 italic">
                              No free preview lessons selected
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions - UNCHANGED */}
            <div className="sticky bottom-0 bg-white border-t pt-6 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant={isPublished ? "default" : "secondary"}>
                    {isPublished ? "Will be published" : "Draft"}
                  </Badge>
                  <Badge variant={isFree ? "secondary" : "default"}>
                    {isFree
                      ? "Free Course"
                      : `${price}${
                          discountPrice ? ` (was ${discountPrice})` : ""
                        }`}
                  </Badge>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={
                      !title ||
                      !slug ||
                      !description ||
                      !category ||
                      (!isFree && !price)
                    }
                  >
                    {isPublished ? "Create & Publish Course" : "Create Course"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
