import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
  FiArrowLeft,
  FiStar,
  FiX,
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

const EditBlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const [activeTab, setActiveTab] = useState('write');
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState(null);

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

  const editAutoSaveKey = `bloghub_draft_edit_${id}`;

  useEffect(() => {
    const fetchExistingPost = async () => {
      try {
        setInitialLoading(true);
        const res = await postService.getPostById(id);
        if (res.data.success) {
          const post = res.data.post;

          // Verify ownership
          if (user && post.author?._id !== user._id && user.role !== 'admin') {
            toast.error('You are not authorized to edit this article');
            navigate('/dashboard');
            return;
          }

          // Format scheduled date if present
          let formattedScheduled = '';
          if (post.scheduledFor) {
            const d = new Date(post.scheduledFor);
            formattedScheduled = d.toISOString().slice(0, 16);
          }

          setFormData({
            title: post.title || '',
            description: post.description || '',
            category: post.category || 'Technology',
            image: post.image || '',
            content: post.content || '',
            tags: post.tags ? post.tags.join(', ') : '',
            status: post.status || 'published',
            scheduledFor: formattedScheduled,
            keyTakeaways: post.keyTakeaways ? post.keyTakeaways.join('\n') : '',
          });
        }
      } catch (err) {
        toast.error('Failed to load article details');
        navigate('/dashboard');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExistingPost();
  }, [id, user, navigate]);

  // Local auto-save for edit
  useEffect(() => {
    if (!formData.title && !formData.content) return;

    const timer = setTimeout(() => {
      localStorage.setItem(editAutoSaveKey, JSON.stringify(formData));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaved(timeStr);
    }, 2500);

    return () => clearTimeout(timer);
  }, [formData, editAutoSaveKey]);

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
      toast.error(err.response?.data?.message || 'AI Copilot failed');
    } finally {
      setAiLoading(false);
    }
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
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        status: statusToSave,
        keyTakeaways: formData.keyTakeaways
          ? formData.keyTakeaways.split('\n').filter(Boolean)
          : undefined,
        scheduledFor: formData.scheduledFor || undefined,
      };

      const res = await postService.updatePost(id, payload);
      if (res.data.success) {
        localStorage.removeItem(editAutoSaveKey);
        toast.success('Article updated successfully!');
        const postSlug = res.data.post.slug || res.data.post._id;
        navigate(statusToSave === 'draft' ? '/dashboard' : `/blog/${postSlug}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading article for editing..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-navy-800">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition mb-2"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Edit Article
          </h1>
          {lastAutoSaved && (
            <p className="text-xs text-emerald-500 font-medium mt-1">
              • Auto-saved locally at {lastAutoSaved}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setIsOgModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
          >
            <FiGlobe className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Social Preview</span>
          </button>

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
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 transition"
          >
            <FiSave className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span>Update & Publish</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Article Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition shadow-soft"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Description & Subheading *
          </label>
          <textarea
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition shadow-soft"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-soft"
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
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-soft"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Schedule Publish (Optional)
            </label>
            <input
              type="datetime-local"
              name="scheduledFor"
              value={formData.scheduledFor}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-soft"
            />
          </div>
        </div>

        {/* Key Takeaways */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            AI Summary / Key Takeaways (1 per line)
          </label>
          <textarea
            name="keyTakeaways"
            rows={3}
            value={formData.keyTakeaways}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-soft font-mono"
          />
        </div>

        {/* Cover Image */}
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
              className="flex-1 w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-soft"
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

        {/* Content Tabs */}
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
          </div>

          {activeTab === 'write' ? (
            <textarea
              name="content"
              rows={16}
              value={formData.content}
              onChange={handleChange}
              className="w-full p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition shadow-soft leading-relaxed"
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
                <p className="text-slate-400 italic">No content to preview.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Copilot Drawer */}
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
                    AI Writer Copilot
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Auto-generate suggestions and refine your article
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleAiAction('titles')}
                disabled={aiLoading}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 transition"
              >
                <span>🎯 Suggest Titles</span>
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('summarize')}
                disabled={aiLoading}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 transition"
              >
                <span>💡 Key Takeaways</span>
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('meta')}
                disabled={aiLoading}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 transition"
              >
                <span>📝 Meta Description</span>
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('polish')}
                disabled={aiLoading}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 transition"
              >
                <span>✨ Polish Content</span>
              </button>
              <button
                type="button"
                onClick={() => handleAiAction('tags')}
                disabled={aiLoading}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500 transition"
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
                <span>Generating with AI...</span>
              </div>
            )}

            {aiTitles.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-navy-800">
                <span className="text-xs font-bold text-slate-400">Select title to apply:</span>
                {aiTitles.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFormData((p) => ({ ...p, title: t }));
                      toast.success('Title applied');
                    }}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-semibold bg-brand-50/70 dark:bg-navy-950 text-slate-800 dark:text-slate-200 hover:bg-brand-100 transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {aiTakeaways.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Key Takeaways:</span>
                  <button
                    onClick={() => {
                      setFormData((p) => ({ ...p, keyTakeaways: aiTakeaways.join('\n') }));
                      toast.success('Takeaways applied');
                    }}
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

            {aiMeta && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Meta Description:</span>
                  <button
                    onClick={() => {
                      setFormData((p) => ({ ...p, description: aiMeta }));
                      toast.success('Meta applied');
                    }}
                    className="text-xs font-bold text-brand-600 hover:underline"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">{aiMeta}</p>
              </div>
            )}

            {aiPolished && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Polished Content:</span>
                  <button
                    onClick={() => {
                      setFormData((p) => ({ ...p, content: aiPolished }));
                      toast.success('Polished content applied');
                    }}
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

export default EditBlogPage;
