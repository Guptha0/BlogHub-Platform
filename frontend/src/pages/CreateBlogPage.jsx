import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService, userService } from '../services/api';
import OgPreviewModal from '../components/common/OgPreviewModal';
import CoverArtGeneratorModal from '../components/common/CoverArtGeneratorModal';
import {
  FiImage,
  FiUpload,
  FiClock,
  FiEye,
  FiEdit3,
  FiCheck,
  FiSave,
  FiZap,
  FiCalendar,
  FiX,
  FiStar,
  FiRefreshCw,
  FiGlobe,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const categories = [
  'Technology',
  'Programming',
  'Design & UX',
  'Artificial Intelligence',
  'Business',
  'Productivity',
];

const AUTOSAVE_KEY = 'bloghub_draft_create';

const CreateBlogPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    image: '',
    content: '',
    tags: '',
    status: 'published',
    scheduledFor: '',
    keyTakeaways: '',
  });

  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // AI Copilot & SEO Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isOgModalOpen, setIsOgModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTitles, setAiTitles] = useState([]);
  const [aiTakeaways, setAiTakeaways] = useState([]);
  const [aiMeta, setAiMeta] = useState('');
  const [aiPolished, setAiPolished] = useState('');
  const [aiTags, setAiTags] = useState([]);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  // Check for auto-saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.content) {
          setHasRestoredDraft(true);
        }
      }
    } catch (e) {
      // Ignore parse error
    }
  }, []);

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        toast.success('Auto-saved draft restored!');
      }
    } catch (e) {
      toast.error('Could not restore draft');
    } finally {
      setHasRestoredDraft(false);
    }
  };

  const discardAutoSave = () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setHasRestoredDraft(false);
    toast('Auto-saved draft discarded');
  };

  // Local auto-save interval / effect
  useEffect(() => {
    if (!formData.title && !formData.content) return;

    const timer = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaved(timeStr);
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const calculateReadTime = (content) => {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('image', file);

      const res = await userService.uploadImage(data);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
        toast.success('Image uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // AI Copilot Actions
  const handleAiAction = async (type) => {
    try {
      setAiLoading(true);
      const res = await postService.aiAssist({
        type,
        tone: selectedTone,
        title: formData.title,
        content: formData.content,
        description: formData.description,
        category: formData.category,
      });

      if (res.data.success) {
        if (type === 'titles') setAiTitles(res.data.titles || []);
        if (type === 'summarize') setAiTakeaways(res.data.takeaways || []);
        if (type === 'meta') setAiMeta(res.data.metaDescription || '');
        if (type === 'polish') setAiPolished(res.data.polished || '');
        if (type === 'tone') setAiPolished(res.data.refined || '');
        if (type === 'tags') setAiTags(res.data.tags || []);
        toast.success(`AI ${type} processed!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI Copilot failed to process');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiTitle = (title) => {
    setFormData((prev) => ({ ...prev, title }));
    toast.success('Title applied!');
  };

  const applyAiMeta = (meta) => {
    setFormData((prev) => ({ ...prev, description: meta }));
    toast.success('Meta description applied!');
  };

  const applyAiTakeaways = (takeaways) => {
    setFormData((prev) => ({ ...prev, keyTakeaways: takeaways.join('\n') }));
    toast.success('Key Takeaways applied!');
  };

  const applyAiPolished = (polished) => {
    setFormData((prev) => ({ ...prev, content: polished }));
    toast.success('Polished content applied!');
  };

  const applyAiTags = (tags) => {
    const existing = formData.tags
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const merged = Array.from(new Set([...existing, ...tags])).join(', ');
    setFormData((prev) => ({ ...prev, tags: merged }));
    toast.success('Tags appended to story!');
  };

  const handleSubmit = async (targetStatus) => {
    const statusToSave = targetStatus || formData.status;

    if (!formData.title.trim()) {
      toast.error('Please provide a title for your blog post');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please provide a short description / summary');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please write the article content');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        status: statusToSave,
        keyTakeaways: formData.keyTakeaways
          ? formData.keyTakeaways.split('\n').filter(Boolean)
          : undefined,
        scheduledFor: formData.scheduledFor || undefined,
      };

      const res = await postService.createPost(payload);
      if (res.data.success) {
        // Clear autosave
        localStorage.removeItem(AUTOSAVE_KEY);

        toast.success(
          statusToSave === 'draft'
            ? 'Saved as draft in your dashboard!'
            : formData.scheduledFor
            ? 'Article scheduled successfully!'
            : 'Article published successfully!'
        );
        const postSlug = res.data.post.slug || res.data.post._id;
        navigate(statusToSave === 'draft' ? '/dashboard' : `/blog/${postSlug}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  const readTimeEstimate = calculateReadTime(formData.content);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Auto-save Restore Notification Banner */}
      {hasRestoredDraft && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-navy-900 border border-indigo-200 dark:border-brand-800 flex items-center justify-between text-xs sm:text-sm text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center space-x-2">
            <FiClock className="w-4 h-4 text-brand-500 shrink-0" />
            <span>We found an unsubmitted draft from your previous session.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={restoreDraft}
              className="px-3 py-1 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition"
            >
              Restore
            </button>
            <button
              onClick={discardAutoSave}
              className="px-3 py-1 rounded-xl text-slate-500 hover:text-slate-800 transition"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create New Article
          </h1>
          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
            <span>Craft high-quality stories and tutorials for the BlogHub community.</span>
            {lastAutoSaved && (
              <span className="text-emerald-500 font-medium">
                • Auto-saved {lastAutoSaved}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Social & SEO Previewer */}
          <button
            type="button"
            onClick={() => setIsOgModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-navy-750 transition"
          >
            <FiGlobe className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Social Preview</span>
          </button>

          {/* AI Copilot Button */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:opacity-95 transition"
          >
            <FiStar className="w-4 h-4 text-amber-300" />
            <span>AI Copilot</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-750 transition"
          >
            <FiSave className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Article Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Architecting Resilient Full-Stack Systems with React and Node"
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-lg font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 transition shadow-soft"
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Description & Subheading (Meta Summary) *
          </label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            placeholder="A compelling 1-2 sentence overview shown in feed cards and search previews..."
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition shadow-soft"
          />
        </div>

        {/* Category, Tags & Scheduled Publishing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition shadow-soft"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, TypeScript, Cloud"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition shadow-soft"
            />
          </div>

          {/* Scheduled Publishing Option */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Schedule Publish (Optional)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                name="scheduledFor"
                value={formData.scheduledFor}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition shadow-soft"
              />
            </div>
          </div>
        </div>

        {/* Key Takeaways (3 Bullet Points) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            AI Summary / Key Takeaways (1 bullet per line)
          </label>
          <textarea
            name="keyTakeaways"
            rows={3}
            value={formData.keyTakeaways}
            onChange={handleChange}
            placeholder="• First high-level insight&#10;• Architecture or execution pattern&#10;• Real-world takeaway for engineers"
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition shadow-soft font-mono"
          />
        </div>

        {/* Cover Image Upload / URL */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Cover Image
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Paste image URL (Unsplash, Cloudinary, etc.)"
              className="flex-1 w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition shadow-soft"
            />
            <label className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold cursor-pointer transition">
              <FiUpload className="w-4 h-4 text-brand-500" />
              <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setCoverModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
            >
              <FiStar className="w-4 h-4 text-amber-300" />
              <span>AI Cover Studio</span>
            </button>
          </div>
        </div>

        {/* Content Tabs (Write vs Live Preview) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-navy-850 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
                  activeTab === 'write'
                    ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FiEdit3 className="w-3.5 h-3.5" />
                <span>Write (Markdown)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FiEye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <FiClock className="w-3.5 h-3.5" />
              <span>Estimated: ~{readTimeEstimate} min read</span>
            </div>
          </div>

          {activeTab === 'write' ? (
            <textarea
              name="content"
              rows={16}
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your article in Markdown. Use ## for headings, `code` for snippets, and standard Markdown formatting..."
              className="w-full p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition shadow-soft leading-relaxed"
            />
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft min-h-[350px] prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
              {formData.content ? (
                formData.content.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-4 whitespace-pre-line">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-slate-400 italic">No content to preview yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Copilot Drawer / Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
                  <FiStar className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    BlogHub AI Writer Copilot
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enhance your draft with automated titles, summaries, and polish
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-navy-800"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* AI Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleAiAction('titles')}
                disabled={aiLoading}
                className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-brand-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
              >
                <span>🎯 Suggest Titles</span>
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('summarize')}
                disabled={aiLoading}
                className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-brand-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
              >
                <span>💡 Key Takeaways</span>
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('meta')}
                disabled={aiLoading}
                className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-brand-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
              >
                <span>📝 Meta Description</span>
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('polish')}
                disabled={aiLoading}
                className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-brand-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
              >
                <span>✨ Polish Content</span>
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('tags')}
                disabled={aiLoading}
                className="flex items-center justify-center space-x-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 hover:border-brand-500 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
              >
                <span>🏷️ Auto-Detect Tags</span>
              </button>
              <div className="flex items-center space-x-1 p-1 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800">
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1 py-1 outline-none w-full"
                >
                  <option value="professional" className="bg-white dark:bg-navy-900">Professional</option>
                  <option value="casual" className="bg-white dark:bg-navy-900">Casual</option>
                  <option value="academic" className="bg-white dark:bg-navy-900">Academic</option>
                  <option value="engaging" className="bg-white dark:bg-navy-900">Engaging</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleAiAction('tone')}
                  disabled={aiLoading}
                  className="px-2 py-1 bg-brand-600 text-white rounded-xl text-[10px] font-bold shrink-0 hover:bg-brand-700 transition"
                >
                  Tone
                </button>
              </div>
            </div>

            {aiLoading && (
              <div className="py-4 text-center text-xs font-bold text-brand-600 flex items-center justify-center space-x-2">
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>AI is crafting suggestions...</span>
              </div>
            )}

            {/* Generated Titles */}
            {aiTitles.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <span className="text-xs font-bold text-slate-400">Click title to apply:</span>
                <div className="space-y-1.5">
                  {aiTitles.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyAiTitle(t)}
                      className="w-full text-left p-2.5 rounded-xl text-xs font-semibold bg-brand-50/70 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-brand-100 dark:hover:bg-brand-950/60 transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Takeaways */}
            {aiTakeaways.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Key Takeaways:</span>
                  <button
                    onClick={() => applyAiTakeaways(aiTakeaways)}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Apply All
                  </button>
                </div>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  {aiTakeaways.map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Generated Meta */}
            {aiMeta && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Meta Description:</span>
                  <button
                    onClick={() => applyAiMeta(aiMeta)}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">{aiMeta}</p>
              </div>
            )}

            {/* Generated Polished Content */}
            {aiPolished && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Polished Content:</span>
                  <button
                    onClick={() => applyAiPolished(aiPolished)}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Apply
                  </button>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 text-xs font-mono max-h-32 overflow-y-auto">
                  {aiPolished}
                </div>
              </div>
            )}

            {/* Generated Tags */}
            {aiTags.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Suggested Tags:</span>
                  <button
                    type="button"
                    onClick={() => applyAiTags(aiTags)}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Apply All Tags
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aiTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-brand-50 dark:bg-navy-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-navy-800 text-[11px] font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social & SEO OpenGraph Previewer Modal */}
      <OgPreviewModal
        isOpen={isOgModalOpen}
        onClose={() => setIsOgModalOpen(false)}
        title={formData.title}
        description={formData.description}
        image={formData.image}
        category={formData.category}
      />

      {/* AI Cover Art Studio Modal */}
      <CoverArtGeneratorModal
        isOpen={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        currentTitle={formData.title}
        onSelectImage={(url) => setFormData((prev) => ({ ...prev, image: url }))}
      />
    </div>
  );
};

export default CreateBlogPage;
