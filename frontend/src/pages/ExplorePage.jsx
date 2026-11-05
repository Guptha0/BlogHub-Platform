import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postService } from '../services/api';
import BlogCard from '../components/common/BlogCard';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { FiSearch, FiFilter, FiSliders, FiX } from 'react-icons/fi';

const categories = [
  'All',
  'Technology',
  'Programming',
  'Design & UX',
  'Artificial Intelligence',
  'Business',
  'Productivity',
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Longest Read', value: 'readingTime' },
];

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSort = searchParams.get('sort') || 'newest';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync state if URL search params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'All');
    setSort(searchParams.get('sort') || 'newest');
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Fetch posts whenever query values change
  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 9,
          sort,
          status: 'published',
        };

        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        if (category && category !== 'All') {
          params.category = category;
        }

        const res = await postService.getPosts(params);
        if (res.data.success) {
          setPosts(res.data.posts || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalCount(res.data.total || 0);
        }
      } catch (err) {
        console.error('Failed to load explore posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, [searchTerm, category, sort, currentPage]);

  const updateQueryParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === '' || val === 'All') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateQueryParams({ search: searchTerm, page: 1 });
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
    updateQueryParams({ category: cat, page: 1 });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
    updateQueryParams({ sort: newSort, page: 1 });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateQueryParams({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setSort('newest');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = searchTerm !== '' || category !== 'All' || sort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Articles & Ideas
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Browse through all published stories, filter by topics, or search for specialized programming and design concepts.
        </p>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by keywords, titles, or concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                updateQueryParams({ search: '', page: 1 });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <FiSliders className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills & Filter Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          <FiFilter className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                category === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:border-brand-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
          >
            <FiX className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing {posts.length} of {totalCount} published articles
        </span>
        {searchTerm && (
          <span>
            Matching query: "<strong>{searchTerm}</strong>"
          </span>
        )}
      </div>

      {/* Posts Grid */}
      {loading ? (
        <LoadingSpinner text="Searching articles..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No articles match your criteria"
          description="Try modifying your search keywords or switching category filters."
          actionText="Clear Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ExplorePage;

