const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { broadcastPostEvent } = require('./postController');

// @desc    Get all comments for a post
// @route   GET /api/comments/:postId
// @access  Public
exports.getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comments = await Comment.find({ post: postId })
      .populate('author', 'name username profileImage bio')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a post
// @route   POST /api/comments/:postId
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      post: postId,
      author: req.user.id
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name username profileImage'
    );

    // Live broadcast to all connected readers
    broadcastPostEvent(postId, {
      type: 'COMMENT_ADDED',
      postId,
      comment: populatedComment
    });

    // Notify author if commenter is someone else
    if (post.author && post.author.toString() !== req.user.id.toString()) {
      try {
        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: 'comment',
          post: post._id,
          message: `${req.user.name} commented on "${post.title.substring(0, 35)}..."`
        });
      } catch (nErr) {
        // Continue if notification fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty'
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Only the comment author can edit
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to edit your own comments'
      });
    }

    comment.content = content.trim();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name username profileImage'
    );

    broadcastPostEvent(comment.post, {
      type: 'COMMENT_UPDATED',
      postId: comment.post,
      comment: populatedComment
    });

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      comment: populatedComment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment (Comment author OR Post owner can delete)
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Find the post to check if user is the post owner
    const post = await Post.findById(comment.post);

    const isCommentAuthor = comment.author.toString() === req.user.id;
    const isPostOwner = post && post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment'
      });
    }

    const postId = comment.post;
    await Comment.findByIdAndDelete(id);

    broadcastPostEvent(postId, {
      type: 'COMMENT_DELETED',
      postId,
      commentId: id
    });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

