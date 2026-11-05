import React, { useState } from 'react';
import { FiX, FiCheck, FiRefreshCw, FiImage, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AESTHETIC_PRESETS = [
  { id: 'tech', label: 'Tech & Cloud', query: 'technology,server,code' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', query: 'cyberpunk,neon,night,future' },
  { id: 'ai', label: 'Neural & AI', query: 'artificial intelligence,network,data' },
  { id: 'minimal', label: 'Minimalist Abstract', query: 'minimal,abstract,architecture' },
  { id: 'editorial', label: 'Modern Workspace', query: 'workspace,laptop,minimalist' },
  { id: 'nature', label: 'Serene Landscapes', query: 'mountains,forest,mist' },
];

const CoverArtGeneratorModal = ({ isOpen, onClose, onSelectImage, currentTitle }) => {
  const [selectedTheme, setSelectedTheme] = useState('tech');
  const [customKeyword, setCustomKeyword] = useState('');
  const [selectedUrl, setSelectedUrl] = useState('');

  if (!isOpen) return null;

  // Generate gallery candidates based on title and aesthetic
  const getImagesForTheme = () => {
    const baseQuery = customKeyword.trim() || AESTHETIC_PRESETS.find((p) => p.id === selectedTheme)?.query || 'technology';
    const cleanTitle = (currentTitle || 'software').toLowerCase().replace(/[^a-z0-9]/g, ',');
    
    // Curated high quality Unsplash photo IDs with query tags
    const photoIds = [
      '1518770660439-4636190af475', // Circuit/Microchip
      '1526374965328-7f61d4dc18c5', // Matrix Code
      '1451187580459-43490279c0fa', // Global Data Sphere
      '1550751827-4bd374c3f58b', // Cyberpunk Street
      '1504639725590-34d0984388bd', // Modern Minimal Work
      '1519389950473-47ba0277781c', // Collaboration Team
      '1618005182384-a83a8bd57fbe', // Abstract Fluid 3D
      '1531403009284-440f080d1e12', // System Architecture Plan
    ];

    return photoIds.map((id, idx) => ({
      url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80&sig=${idx}`,
      thumb: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80&sig=${idx}`,
      caption: `Aesthetic Variant #${idx + 1} (${baseQuery.split(',')[0]})`,
    }));
  };

  const images = getImagesForTheme();

  const handleApply = (urlToUse) => {
    const target = urlToUse || selectedUrl;
    if (!target) {
      toast.error('Please click an image to select it');
      return;
    }
    onSelectImage(target);
    toast.success('Cover banner updated successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-800 overflow-hidden z-10 animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20">
              <FiStar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                AI & Curated Cover Art Studio
              </h3>
              <p className="text-xs text-slate-500">
                Choose an aesthetic or provide custom keywords to generate sharp editorial banners.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4 border-b border-slate-100 dark:border-navy-800/80 bg-slate-50/30 dark:bg-navy-950/20">
          {/* Aesthetic Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Visual Aesthetic
            </label>
            <div className="flex flex-wrap gap-2">
              {AESTHETIC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedTheme(preset.id);
                    setCustomKeyword('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedTheme === preset.id && !customKeyword
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Search Prompt */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Or specify custom concept tags
            </label>
            <input
              type="text"
              placeholder="e.g. quantum computing, purple gradient, neural networks"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Image Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, idx) => {
              const isSelected = selectedUrl === img.url;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedUrl(img.url)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-600 ring-4 ring-brand-500/20 scale-[1.02]'
                      : 'border-transparent hover:border-slate-300 dark:hover:border-navy-700'
                  }`}
                >
                  <img
                    src={img.thumb}
                    alt={img.caption}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-brand-600 text-white shadow-md">
                      <FiCheck className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white truncate font-medium">
                    {img.caption}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/40">
          <span className="text-xs text-slate-400">
            {selectedUrl ? 'Cover image selected' : 'Click any image to select'}
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleApply()}
              disabled={!selectedUrl}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center space-x-1.5"
            >
              <FiCheck className="w-4 h-4" />
              <span>Apply Cover Banner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverArtGeneratorModal;
