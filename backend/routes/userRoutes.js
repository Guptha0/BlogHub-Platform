const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
  getAdvancedAnalytics,
  toggleFollowUser,
  getBookmarks,
  toggleBookmark,
  getReadingLists,
  createReadingList,
  addPostToReadingList,
  removePostFromReadingList,
  uploadImage,
  sendTip,
  getWallet,
  subscribeNewsletter,
  getNewsletterStats,
  dispatchNewsletter
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// User profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Bookmark routes
router.get('/bookmarks', protect, getBookmarks);
router.post('/bookmarks/:postId', protect, toggleBookmark);

// Reading lists routes
router.get('/reading-lists', protect, getReadingLists);
router.post('/reading-lists', protect, createReadingList);
router.post('/reading-lists/:listId/add', protect, addPostToReadingList);
router.delete('/reading-lists/:listId/:postId', protect, removePostFromReadingList);

// Dashboard statistics & advanced telemetry
router.get('/dashboard/stats', protect, getDashboardStats);
router.get('/dashboard/analytics', protect, getAdvancedAnalytics);

// Creator Wallet & Micro-Tipping
router.get('/wallet', protect, getWallet);
router.post('/:id/tip', protect, sendTip);

// Newsletter Engine
router.post('/:authorId/subscribe', optionalAuth, subscribeNewsletter);
router.get('/newsletter/stats', protect, getNewsletterStats);
router.post('/newsletter/dispatch', protect, dispatchNewsletter);

// Follow/unfollow author
router.post('/:id/follow', protect, toggleFollowUser);

// Upload image file
router.post('/upload', protect, upload.single('image'), uploadImage);

// Public author profile by username (keep at bottom to avoid matching literal paths)
router.get('/profile/:username', optionalAuth, getUserProfile);

module.exports = router;
