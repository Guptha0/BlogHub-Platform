import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, postService } from '../services/api';
import BlogCard from '../components/common/BlogCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  FiUser,
  FiMail,
  FiAtSign,
  FiEdit,
  FiUpload,
  FiSave,
  FiCalendar,
  FiBookOpen,
  FiUserPlus,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { username } = useParams();
  const { user, updateUser, isAuthenticated } = useAuth();

  const isOwnProfile = !username || (user && user.username === username);

  const [publicUser, setPublicUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
  });

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isOwnProfile && user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user, isOwnProfile]);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        setLoadingPosts(true);
        if (isOwnProfile) {
          const res = await postService.getMyPosts({ status: 'published' });
          if (res.data.success) {
            setPosts(res.data.posts || []);
          }
        } else {
          // Fetch public author profile
          const res = await userService.getProfile(username);
          if (res.data.success) {
            setPublicUser(res.data.user);
            setPosts(res.data.posts || []);
            setIsFollowing(res.data.user?.isFollowing || false);
            setFollowersCount(res.data.user?.followersCount || 0);
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        toast.error('Could not load profile');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfileAndPosts();
  }, [username, isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow creators');
      return;
    }
    if (!publicUser?._id) return;
    try {
      setFollowLoading(true);
      const res = await userService.toggleFollow(publicUser._id);
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount((prev) => (res.data.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Could not update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('image', file);

      const res = await userService.uploadImage(data);
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, profileImage: res.data.url }));
        toast.success('Avatar image uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full name is required');
      return;
    }

    try {
      setSaving(true);
      const res = await userService.updateProfile(formData);
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayUser = isOwnProfile ? user : publicUser;
  const formattedJoinDate = displayUser?.createdAt
    ? new Date(displayUser.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  if (!isOwnProfile && loadingPosts && !publicUser) {
    return (
      <div className="py-20">
        <LoadingSpinner text={`Loading @${username}'s profile...`} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Profile Overview & Edit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft text-center flex flex-col items-center">
          <div className="relative group">
            <img
              src={
                (isOwnProfile ? formData.profileImage : displayUser?.profileImage) ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
              }
              alt={displayUser?.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-brand-500/20 shadow-md"
            />
            {isOwnProfile && (
              <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs font-semibold">
                <FiUpload className="w-5 h-5 mr-1" />
                <span>Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            {displayUser?.name || 'Creator'}
          </h2>
          <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
            @{displayUser?.username || username}
          </p>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs">
            {isOwnProfile
              ? formData.bio || 'Writer, reader, and thinker on BlogHub.'
              : displayUser?.bio || 'Creator on BlogHub.'}
          </p>

          {/* Follow Button for Public Profiles */}
          {!isOwnProfile && (
            <button
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`mt-5 w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm ${
                isFollowing
                  ? 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
              }`}
            >
              {isFollowing ? (
                <>
                  <FiUserCheck className="w-4 h-4 text-brand-500" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <FiUserPlus className="w-4 h-4" />
                  <span>Follow Author</span>
                </>
              )}
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-navy-800 w-full flex items-center justify-around text-xs text-slate-500">
            <div className="flex items-center space-x-1.5">
              <FiBookOpen className="w-4 h-4 text-brand-500" />
              <span>{posts.length} Stories</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <FiCalendar className="w-4 h-4 text-purple-500" />
              <span>Joined {formattedJoinDate}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form OR Public Creator Hub */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-soft">
          {isOwnProfile ? (
            <>
              <div className="mb-6 pb-4 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Account Settings
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update your public profile details and information
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <FiAtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        disabled
                        value={user?.username || ''}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-850/60 border border-slate-200 dark:border-navy-800 text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-850/60 border border-slate-200 dark:border-navy-800 text-sm text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Bio (max 250 chars)
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    maxLength={250}
                    className="w-full p-3 text-sm rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition"
                  />
                  <div className="flex justify-end text-[11px] text-slate-400 mt-1">
                    {formData.bio.length}/250 characters
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 disabled:opacity-50 transition"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-navy-800">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 dark:bg-navy-800 dark:text-brand-300">
                  Creator Spotlight
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {displayUser?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official Contributor & Author on BlogHub
                </p>
              </div>

              {/* Creator Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-850 text-center">
                  <div className="text-xl font-extrabold text-brand-600 dark:text-brand-400">
                    {followersCount}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase mt-1">
                    Followers
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-850 text-center">
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                    {displayUser?.followingCount || 0}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase mt-1">
                    Following
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-850 text-center">
                  <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {posts.length}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase mt-1">
                    Published
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50 to-purple-50 dark:from-navy-950 dark:to-navy-850 border border-brand-100 dark:border-navy-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Creator Mission & Bio
                </h3>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {displayUser?.bio || 'Sharing high-quality tech articles, software engineering insights, and design tutorials with the global developer community.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Published Stories section */}
      <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-navy-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isOwnProfile ? 'My Published Articles' : `${displayUser?.name || 'Author'}'s Articles`} ({posts.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isOwnProfile
              ? 'Stories you have authored that are currently live on BlogHub.'
              : `Explore all published articles written by ${displayUser?.name || 'this creator'}.`}
          </p>
        </div>

        {loadingPosts ? (
          <LoadingSpinner text="Fetching stories..." />
        ) : posts.length === 0 ? (
          <EmptyState
            title={isOwnProfile ? "You haven't published any stories yet" : "No stories published yet"}
            description={
              isOwnProfile
                ? "Share your insights and tutorials with readers across the world."
                : "This author hasn't published any articles on BlogHub yet. Check back soon!"
            }
            actionText={isOwnProfile ? "Write your first story" : undefined}
            actionLink={isOwnProfile ? "/create" : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

