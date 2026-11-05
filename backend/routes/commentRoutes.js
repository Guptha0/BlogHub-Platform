const express = require('express');
const router = express.Router();
const {
  getCommentsByPost,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// Public route to view comments
router.get('/:postId', getCommentsByPost);

// Protected routes to add, edit, or delete comments
router.post('/:postId', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;

