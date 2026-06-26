"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getAllCategories,
  getCourseById,
  updateCourse as updateCourseThunk,
} from "@/lib/store/features/courseSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2, Upload, Video, FileText, GripVertical, File } from "lucide-react";

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentCourse, categories, status, updateStatus, error } = useSelector((s) => s.course);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("beginner");
  const [language, setLanguage] = useState("English");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [requirements, setRequirements] = useState([""]);
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([""]);
  // media and content
  const [thumbnail, setThumbnail] = useState(null);
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
  const [summaryQuiz, setSummaryQuiz] = useState(null);

  // load categories and course
  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    if (id) dispatch(getCourseById(id));
  }, [dispatch, id]);

  // fill form when course loads
  useEffect(() => {
    if (!currentCourse) return;
    setTitle(currentCourse.title || "");
    setSlug(currentCourse.slug || "");
    setDescription(currentCourse.description || "");
    setCategory(currentCourse.category?._id || currentCourse.category || "");
    setLevel(currentCourse.level || "beginner");
    setLanguage(currentCourse.language || "English");
    setIsFree(!!currentCourse.isFree);
    setPrice(String(currentCourse.price ?? ""));
    setDiscountPrice(String(currentCourse.discountPrice ?? ""));
    setIsPublished(!!currentCourse.isPublished);
    setTags(Array.isArray(currentCourse.tags) ? currentCourse.tags : []);
    setRequirements(Array.isArray(currentCourse.requirements) && currentCourse.requirements.length ? currentCourse.requirements : [""]);
    setWhatYouWillLearn(Array.isArray(currentCourse.whatYouWillLearn) && currentCourse.whatYouWillLearn.length ? currentCourse.whatYouWillLearn : [""]);
    // prefill sections & summary quiz
    setSections(
      Array.isArray(currentCourse.sections) && currentCourse.sections.length
        ? currentCourse.sections.map((s, si) => ({
            title: s.title || "",
            description: s.description || "",
            order: typeof s.order === "number" ? s.order : si,
            lessons: (s.lessons || []).map((l, li) => ({
              title: l.title || "",
              videoUrl: l.videoUrl || "",
              videoFile: null,
              duration: l.duration ? String(l.duration) : "",
              description: l.description || "",
              isFree: !!l.isFree,
              order: typeof l.order === "number" ? l.order : li,
            })),
            resources: (s.resources || []).map((r, ri) => ({
              type: r.type || "link",
              title: r.title || "",
              url: r.url || r.fileUrl || "",
              content: r.content || "",
              file: null,
              isFree: !!r.isFree,
              order: typeof r.order === "number" ? r.order : ri,
            })),
            quizzes: (s.quizzes || []).map((q, qi) => ({
              title: q.title || "",
              description: q.description || "",
              timeLimit: q.timeLimit || 0,
              passScore: q.passScore || 0,
              isFree: !!q.isFree,
              order: typeof q.order === "number" ? q.order : qi,
              questions: (q.questions || []).map((qq) => ({
                question: qq.question || "",
                options: Array.isArray(qq.options) ? qq.options.slice(0, 10) : ["", ""],
                correctOptionIndex: typeof qq.correctOptionIndex === "number" ? qq.correctOptionIndex : 0,
                points: qq.points || 1,
                explanation: qq.explanation || "",
              })),
            })),
          }))
        : sections
    );
    setSummaryQuiz(currentCourse.summaryQuiz || null);
  }, [currentCourse]);

  const isLoading = useMemo(() => status === "loading" || updateStatus === "loading", [status, updateStatus]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const addRequirement = () => setRequirements([...requirements, ""]);
  const updateRequirement = (i, v) => {
    const arr = [...requirements];
    arr[i] = v;
    setRequirements(arr);
  };
  const removeRequirement = (i) => {
    if (requirements.length <= 1) return;
    setRequirements(requirements.filter((_, idx) => idx !== i));
  };

  const addOutcome = () => setWhatYouWillLearn([...whatYouWillLearn, ""]);
  const updateOutcome = (i, v) => {
    const arr = [...whatYouWillLearn];
    arr[i] = v;
    setWhatYouWillLearn(arr);
  };
  const removeOutcome = (i) => {
    if (whatYouWillLearn.length <= 1) return;
    setWhatYouWillLearn(whatYouWillLearn.filter((_, idx) => idx !== i));
  };

  // Sections
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
      setSections(sections.filter((_, i) => i !== sectionIndex));
    }
  };
  const updateSectionField = (sectionIndex, field, value) => {
    const ns = [...sections];
    ns[sectionIndex][field] = value;
    setSections(ns);
  };
  // Lessons
  const addLesson = (sectionIndex) => {
    const ns = [...sections];
    ns[sectionIndex].lessons.push({
      title: "",
      videoUrl: "",
      videoFile: null,
      duration: "",
      description: "",
      isFree: false,
      order: ns[sectionIndex].lessons.length,
    });
    setSections(ns);
  };
  const removeLesson = (sectionIndex, lessonIndex) => {
    const ns = [...sections];
    if (ns[sectionIndex].lessons.length > 1) {
      ns[sectionIndex].lessons.splice(lessonIndex, 1);
      setSections(ns);
    }
  };
  const handleLessonChange = (sectionIndex, lessonIndex, field, value) => {
    const ns = [...sections];
    ns[sectionIndex].lessons[lessonIndex][field] = value;
    setSections(ns);
  };
  // Resources
  const addResource = (sectionIndex, type) => {
    const ns = [...sections];
    ns[sectionIndex].resources.push({
      type,
      title: "",
      url: "",
      content: "",
      file: null,
      isFree: false,
      order: ns[sectionIndex].resources.length,
    });
    setSections(ns);
  };
  const removeResource = (sectionIndex, resourceIndex) => {
    const ns = [...sections];
    ns[sectionIndex].resources.splice(resourceIndex, 1);
    setSections(ns);
  };
  const handleResourceChange = (sectionIndex, resourceIndex, field, value) => {
    const ns = [...sections];
    ns[sectionIndex].resources[resourceIndex][field] = value;
    setSections(ns);
  };
  // Quizzes
  const addQuiz = (sectionIndex) => {
    const ns = [...sections];
    const quizzes = ns[sectionIndex].quizzes || [];
    if (quizzes.length >= 3) return;
    quizzes.push({
      title: "",
      description: "",
      timeLimit: 0,
      passScore: 0,
      isFree: false,
      order: quizzes.length,
      questions: [
        { question: "", options: ["", ""], correctOptionIndex: 0, points: 1, explanation: "" },
      ],
    });
    ns[sectionIndex].quizzes = quizzes;
    setSections(ns);
  };
  const removeQuiz = (sectionIndex, quizIndex) => {
    const ns = [...sections];
    ns[sectionIndex].quizzes.splice(quizIndex, 1);
    setSections(ns);
  };
  const updateQuizField = (sectionIndex, quizIndex, field, value) => {
    const ns = [...sections];
    ns[sectionIndex].quizzes[quizIndex][field] = value;
    setSections(ns);
  };
  const addQuestion = (sectionIndex, quizIndex) => {
    const ns = [...sections];
    ns[sectionIndex].quizzes[quizIndex].questions.push({
      question: "",
      options: ["", ""],
      correctOptionIndex: 0,
      points: 1,
      explanation: "",
    });
    setSections(ns);
  };
  const removeQuestion = (sectionIndex, quizIndex, questionIndex) => {
    const ns = [...sections];
    const qs = ns[sectionIndex].quizzes[quizIndex].questions;
    if (qs.length > 1) {
      qs.splice(questionIndex, 1);
      setSections(ns);
    }
  };
  const updateQuestionField = (sectionIndex, quizIndex, questionIndex, field, value) => {
    const ns = [...sections];
    ns[sectionIndex].quizzes[quizIndex].questions[questionIndex][field] = value;
    setSections(ns);
  };
  const addOption = (sectionIndex, quizIndex, questionIndex) => {
    const ns = [...sections];
    const opts = ns[sectionIndex].quizzes[quizIndex].questions[questionIndex].options;
    if (opts.length < 10) {
      opts.push("");
      setSections(ns);
    }
  };
  const removeOption = (sectionIndex, quizIndex, questionIndex, optionIndex) => {
    const ns = [...sections];
    const q = ns[sectionIndex].quizzes[quizIndex].questions[questionIndex];
    if (q.options.length > 2) {
      q.options.splice(optionIndex, 1);
      if (q.correctOptionIndex >= q.options.length) q.correctOptionIndex = 0;
      setSections(ns);
    }
  };
  const updateOption = (sectionIndex, quizIndex, questionIndex, optionIndex, value) => {
    const ns = [...sections];
    ns[sectionIndex].quizzes[quizIndex].questions[questionIndex].options[optionIndex] = value;
    setSections(ns);
  };
  const setCorrectOption = (sectionIndex, quizIndex, questionIndex, optionIndex) => {
    const ns = [...sections];
    ns[sectionIndex].quizzes[quizIndex].questions[questionIndex].correctOptionIndex = optionIndex;
    setSections(ns);
  };
  // Summary quiz
  const initSummaryQuiz = () => {
    setSummaryQuiz({
      title: "",
      description: "",
      timeLimit: 0,
      passScore: 0,
      isFree: false,
      order: 0,
      questions: [
        { question: "", options: ["", ""], correctOptionIndex: 0, points: 1, explanation: "" },
      ],
    });
  };
  const updateSummaryQuizField = (field, value) => setSummaryQuiz((prev) => ({ ...prev, [field]: value }));
  const addSummaryQuestion = () => setSummaryQuiz((prev) => ({ ...prev, questions: [...prev.questions, { question: "", options: ["", ""], correctOptionIndex: 0, points: 1, explanation: "" }] }));
  const removeSummaryQuestion = (qIndex) => setSummaryQuiz((prev) => ({ ...prev, questions: prev.questions.length > 1 ? prev.questions.filter((_, i) => i !== qIndex) : prev.questions }));
  const updateSummaryQuestionField = (qIndex, field, value) => setSummaryQuiz((prev) => { const qs = [...prev.questions]; qs[qIndex] = { ...qs[qIndex], [field]: value }; return { ...prev, questions: qs }; });
  const addSummaryOption = (qIndex) => setSummaryQuiz((prev) => { const qs = [...prev.questions]; if (qs[qIndex].options.length < 10) { qs[qIndex] = { ...qs[qIndex], options: [...qs[qIndex].options, ""] }; } return { ...prev, questions: qs }; });
  const removeSummaryOption = (qIndex, optIndex) => setSummaryQuiz((prev) => { const qs = [...prev.questions]; if (qs[qIndex].options.length > 2) { const newOpts = qs[qIndex].options.filter((_, i) => i !== optIndex); let correct = qs[qIndex].correctOptionIndex; if (correct >= newOpts.length) correct = 0; qs[qIndex] = { ...qs[qIndex], options: newOpts, correctOptionIndex: correct }; } return { ...prev, questions: qs }; });
  const updateSummaryOption = (qIndex, optIndex, value) => setSummaryQuiz((prev) => { const qs = [...prev.questions]; const newOpts = [...qs[qIndex].options]; newOpts[optIndex] = value; qs[qIndex] = { ...qs[qIndex], options: newOpts }; return { ...prev, questions: qs }; });
  const setSummaryCorrectOption = (qIndex, optIndex) => setSummaryQuiz((prev) => { const qs = [...prev.questions]; qs[qIndex] = { ...qs[qIndex], correctOptionIndex: optIndex }; return { ...prev, questions: qs }; });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    const formData = new FormData();
    // basic fields
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("level", level);
    formData.append("language", language);
    formData.append("price", isFree ? "0" : String(price || 0));
    formData.append("discountPrice", String(discountPrice || 0));
    formData.append("isFree", String(!!isFree));
    formData.append("isPublished", String(!!isPublished));
    // arrays
    tags.forEach((tag) => formData.append("tags", tag));
    (requirements || []).filter((r) => r.trim()).forEach((r) => formData.append("requirements", r));
    (whatYouWillLearn || []).filter((r) => r.trim()).forEach((r) => formData.append("whatYouWillLearn", r));
    // thumbnail
    if (thumbnail) formData.append("thumbnail", thumbnail);
    // lesson videos
    sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        if (lesson.videoFile) formData.append("lessonVideos", lesson.videoFile);
      });
    });
    // document files
    sections.forEach((section) => {
      section.resources.forEach((res) => {
        if (res.file && res.type === "document") formData.append("documentFiles", res.file);
      });
    });
    // sections JSON
    const sectionsData = sections.map((section, sIdx) => ({
      title: section.title,
      description: section.description,
      order: section.order,
      lessons: section.lessons.map((lesson, lIdx) => ({
        title: lesson.title,
        videoUrl: lesson.videoUrl, // backend will fill if file provided
        duration: lesson.duration ? parseInt(lesson.duration) : 0,
        description: lesson.description,
        isFree: !!lesson.isFree,
        order: lesson.order,
      })),
      resources: section.resources.map((r, rIdx) => ({
        type: r.type,
        title: r.title,
        url: r.url,
        content: r.content,
        isFree: !!r.isFree,
        order: r.order,
      })),
      quizzes: (section.quizzes || []).slice(0, 3).map((quiz, idx) => ({
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit ? parseInt(quiz.timeLimit) : 0,
        passScore: quiz.passScore ? parseInt(quiz.passScore) : 0,
        isFree: !!quiz.isFree,
        order: typeof quiz.order === "number" ? quiz.order : idx,
        questions: (quiz.questions || []).map((q) => ({
          question: q.question,
          options: (q.options || []).slice(0, 10),
          correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
          points: q.points ? parseInt(q.points) : 1,
          explanation: q.explanation || "",
        })),
      })),
    }));
    formData.append("sections", JSON.stringify(sectionsData));
    // summary quiz JSON
    if (summaryQuiz && summaryQuiz.title && (summaryQuiz.questions || []).length > 0) {
      const normalized = {
        title: summaryQuiz.title,
        description: summaryQuiz.description || "",
        timeLimit: summaryQuiz.timeLimit ? parseInt(summaryQuiz.timeLimit) : 0,
        passScore: summaryQuiz.passScore ? parseInt(summaryQuiz.passScore) : 0,
        isFree: !!summaryQuiz.isFree,
        order: 0,
        questions: (summaryQuiz.questions || []).map((q) => ({
          question: q.question,
          options: (q.options || []).slice(0, 10),
          correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
          points: q.points ? parseInt(q.points) : 1,
          explanation: q.explanation || "",
        })),
      };
      formData.append("summaryQuiz", JSON.stringify(normalized));
    }

    try {
      await dispatch(updateCourseThunk({ id, courseData: formData })).unwrap();
      toast.success("Course updated successfully");
    } catch (err) {
      toast.error(typeof err === "string" ? err : err?.message || "Failed to update course");
    }
  };

  return (
    <div className="mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <Link href="/instructor/dashboard/courses/my-courses">
          <Button variant="outline">Back to List</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Course</CardTitle>
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

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Category *</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
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
                  <Label>Course Thumbnail</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail" className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500">Click to upload new thumbnail</Label>
                      <p className="text-sm text-gray-500">PNG, JPG up to 2MB</p>
                      <input id="thumbnail" type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} className="hidden" />
                    </div>
                    {thumbnail && <p className="mt-2 text-sm text-green-600">Selected: {thumbnail.name}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                    <Button type="button" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" disabled={isFree} required={!isFree} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discount Price ($)</Label>
                    <Input id="discountPrice" type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} min="0" step="0.01" disabled={isFree} />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox id="isFree" checked={isFree} onCheckedChange={setIsFree} />
                    <Label htmlFor="isFree">Free Course</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Course Summary Quiz (Optional)</CardTitle>
                      {!summaryQuiz && (
                        <Button type="button" variant="outline" size="sm" onClick={initSummaryQuiz}>
                          <Plus className="h-4 w-4 mr-2" /> Add Summary Quiz
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {summaryQuiz && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Summary quiz title" value={summaryQuiz.title} onChange={(e) => updateSummaryQuizField("title", e.target.value)} required />
                        <Input type="number" placeholder="Time limit (seconds)" value={summaryQuiz.timeLimit} onChange={(e) => updateSummaryQuizField("timeLimit", parseInt(e.target.value || "0"))} min={0} />
                        <Input type="number" placeholder="Pass score" value={summaryQuiz.passScore} onChange={(e) => updateSummaryQuizField("passScore", parseInt(e.target.value || "0"))} min={0} />
                      </div>
                      <div className="space-y-4">
                        {summaryQuiz.questions.map((q, qi) => (
                          <div key={qi} className="border rounded p-4 space-y-3">
                            <Input placeholder="Question" value={q.question} onChange={(e) => updateSummaryQuestionField(qi, "question", e.target.value)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <input type="radio" name={`sum-correct-${qi}`} checked={q.correctOptionIndex === oi} onChange={() => setSummaryCorrectOption(qi, oi)} />
                                  <Input value={opt} onChange={(e) => updateSummaryOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                                  <Button type="button" variant="outline" onClick={() => removeSummaryOption(qi, oi)} disabled={q.options.length <= 2}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" onClick={() => addSummaryOption(qi)} disabled={q.options.length >= 10}><Plus className="h-4 w-4" /> Option</Button>
                              <Button type="button" variant="destructive" onClick={() => removeSummaryQuestion(qi)} disabled={summaryQuiz.questions.length <= 1}><Trash2 className="h-4 w-4" /> Question</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="secondary" onClick={addSummaryQuestion}><Plus className="h-4 w-4" /> Add Question</Button>
                    </CardContent>
                  )}
                </Card>

                <Separator />

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sections & Lessons</h3>
                  <Button type="button" onClick={addSection}><Plus className="h-4 w-4 mr-2" /> Add Section</Button>
                </div>
                <div className="space-y-4">
                  {sections.map((section, sIdx) => (
                    <Card key={sIdx} className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Section {sIdx + 1}</CardTitle>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => addLesson(sIdx)}><Video className="h-4 w-4 mr-1" /> Lesson</Button>
                            <Button type="button" variant="outline" onClick={() => addResource(sIdx, "link")}><FileText className="h-4 w-4 mr-1" /> Link</Button>
                            <Button type="button" variant="outline" onClick={() => addResource(sIdx, "document")}><File className="h-4 w-4 mr-1" /> Document</Button>
                            <Button type="button" variant="outline" onClick={() => addQuiz(sIdx)}><Plus className="h-4 w-4 mr-1" /> Quiz</Button>
                            <Button type="button" variant="destructive" onClick={() => removeSection(sIdx)} disabled={sections.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input placeholder="Section title" value={section.title} onChange={(e) => updateSectionField(sIdx, "title", e.target.value)} />
                          <Input placeholder="Section description" value={section.description} onChange={(e) => updateSectionField(sIdx, "description", e.target.value)} />
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Lessons</h4>
                          <div className="space-y-3">
                            {section.lessons.map((lesson, lIdx) => (
                              <div key={lIdx} className="border rounded p-3 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <Input placeholder="Lesson title" value={lesson.title} onChange={(e) => handleLessonChange(sIdx, lIdx, "title", e.target.value)} />
                                  <Input placeholder="Video URL (optional)" value={lesson.videoUrl} onChange={(e) => handleLessonChange(sIdx, lIdx, "videoUrl", e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <div>
                                    <Label htmlFor={`video-${sIdx}-${lIdx}`}>Upload Video</Label>
                                    <input id={`video-${sIdx}-${lIdx}`} type="file" accept="video/*" onChange={(e) => handleLessonChange(sIdx, lIdx, "videoFile", e.target.files[0])} />
                                  </div>
                                  <Input type="number" placeholder="Duration (sec)" value={lesson.duration} onChange={(e) => handleLessonChange(sIdx, lIdx, "duration", e.target.value)} />
                                  <div className="flex items-center space-x-2">
                                    <Switch checked={lesson.isFree} onCheckedChange={(v) => handleLessonChange(sIdx, lIdx, "isFree", v)} />
                                    <Label>Free Preview</Label>
                                  </div>
                                </div>
                                <Textarea placeholder="Lesson description" value={lesson.description} onChange={(e) => handleLessonChange(sIdx, lIdx, "description", e.target.value)} />
                                <div className="flex justify-end">
                                  <Button type="button" variant="destructive" onClick={() => removeLesson(sIdx, lIdx)} disabled={section.lessons.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Resources</h4>
                          <div className="space-y-3">
                            {section.resources.map((resource, rIdx) => (
                              <div key={rIdx} className="border rounded p-3 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Select value={resource.type} onValueChange={(v) => handleResourceChange(sIdx, rIdx, "type", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="link">Link</SelectItem>
                                      <SelectItem value="document">Document</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input placeholder="Title" value={resource.title} onChange={(e) => handleResourceChange(sIdx, rIdx, "title", e.target.value)} />
                                  <Input placeholder={resource.type === "document" ? "Document URL (auto if file)" : "Link URL"} value={resource.url} onChange={(e) => handleResourceChange(sIdx, rIdx, "url", e.target.value)} />
                                </div>
                                {resource.type === "document" && (
                                  <div>
                                    <Label htmlFor={`doc-${sIdx}-${rIdx}`}>Upload Document</Label>
                                    <input id={`doc-${sIdx}-${rIdx}`} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.csv,.xls,.xlsx,.png,.jpg,.jpeg" onChange={(e) => handleResourceChange(sIdx, rIdx, "file", e.target.files[0])} />
                                  </div>
                                )}
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-2">
                                    <Switch checked={resource.isFree} onCheckedChange={(v) => handleResourceChange(sIdx, rIdx, "isFree", v)} />
                                    <Label>Free</Label>
                                  </div>
                                  <Button type="button" variant="destructive" onClick={() => removeResource(sIdx, rIdx)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Quizzes</h4>
                          <div className="space-y-3">
                            {(section.quizzes || []).map((quiz, qIdx) => (
                              <div key={qIdx} className="border rounded p-3 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <Input placeholder="Quiz title" value={quiz.title} onChange={(e) => updateQuizField(sIdx, qIdx, "title", e.target.value)} />
                                  <Input type="number" placeholder="Time limit (sec)" value={quiz.timeLimit} onChange={(e) => updateQuizField(sIdx, qIdx, "timeLimit", parseInt(e.target.value || "0"))} />
                                  <Input type="number" placeholder="Pass score" value={quiz.passScore} onChange={(e) => updateQuizField(sIdx, qIdx, "passScore", parseInt(e.target.value || "0"))} />
                                  <div className="flex items-center space-x-2">
                                    <Switch checked={quiz.isFree} onCheckedChange={(v) => updateQuizField(sIdx, qIdx, "isFree", v)} />
                                    <Label>Free</Label>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  {quiz.questions.map((qq, qqi) => (
                                    <div key={qqi} className="border rounded p-2 space-y-2">
                                      <Input placeholder="Question" value={qq.question} onChange={(e) => updateQuestionField(sIdx, qIdx, qqi, "question", e.target.value)} />
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {qq.options.map((opt, oi) => (
                                          <div key={oi} className="flex items-center gap-2">
                                            <input type="radio" name={`q-${sIdx}-${qIdx}-correct-${qqi}`} checked={qq.correctOptionIndex === oi} onChange={() => setCorrectOption(sIdx, qIdx, qqi, oi)} />
                                            <Input value={opt} onChange={(e) => updateOption(sIdx, qIdx, qqi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                                            <Button type="button" variant="outline" onClick={() => removeOption(sIdx, qIdx, qqi, oi)} disabled={qq.options.length <= 2}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => addOption(sIdx, qIdx, qqi)} disabled={qq.options.length >= 10}><Plus className="h-4 w-4" /> Option</Button>
                                        <Button type="button" variant="destructive" onClick={() => removeQuestion(sIdx, qIdx, qqi)} disabled={quiz.questions.length <= 1}><Trash2 className="h-4 w-4" /> Question</Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button type="button" variant="secondary" onClick={() => addQuestion(sIdx, qIdx)}><Plus className="h-4 w-4" /> Add Question</Button>
                                  <Button type="button" variant="destructive" onClick={() => removeQuiz(sIdx, qIdx)}><Trash2 className="h-4 w-4" /> Remove Quiz</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Requirements Tab */}
              <TabsContent value="requirements" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Requirements</Label>
                    {requirements.map((r, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <Input value={r} onChange={(e) => updateRequirement(i, e.target.value)} />
                        <Button type="button" variant="outline" onClick={() => removeRequirement(i)} disabled={requirements.length <= 1}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={addRequirement}><Plus className="h-4 w-4" /> Add Requirement</Button>
                  </div>
                  <div className="space-y-2">
                    <Label>What you'll learn</Label>
                    {whatYouWillLearn.map((r, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <Input value={r} onChange={(e) => updateOutcome(i, e.target.value)} />
                        <Button type="button" variant="outline" onClick={() => removeOutcome(i)} disabled={whatYouWillLearn.length <= 1}>Remove</Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={addOutcome}><Plus className="h-4 w-4" /> Add Outcome</Button>
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                    <Label>Published</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
