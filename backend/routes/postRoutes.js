const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  toggleLike,
  clapPost,
  getFollowingFeed,
  aiAssist,
  getFeaturedPosts,
  getRelatedPosts,
  streamPostEvents,
  askAiAboutPost,
  translatePost
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public query routes
router.get('/', getPosts);
router.get('/featured', getFeaturedPosts);
router.get('/:id/related', getRelatedPosts);

// Authenticated specific routes (must precede /:id)
router.get('/user/my-posts', protect, getMyPosts);
router.get('/feed/following', protect, getFollowingFeed);
router.post('/ai-assist', protect, aiAssist);

// Real-time SSE event stream for live claps, likes, comments & tips
router.get('/:id/stream', streamPostEvents);

// Single post (by ID or Slug) - optionalAuth to compute userClaps and liked state
router.get('/:id', optionalAuth, getPostById);

// Interactive AI & Translation routes
router.post('/:id/ask-ai', optionalAuth, askAiAboutPost);
router.post('/:id/translate', optionalAuth, translatePost);

// Protected mutation routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/clap', protect, clapPost);

module.exports = router;
