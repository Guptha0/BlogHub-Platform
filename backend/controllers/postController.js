const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// SSE Real-Time Clients Registry
const postEventClients = new Map();

const broadcastPostEvent = (postId, eventData) => {
  const pIdStr = postId.toString();
  if (!postEventClients.has(pIdStr)) return;
  const clients = postEventClients.get(pIdStr);
  const payload = `event: message\ndata: ${JSON.stringify(eventData)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch (e) {
      clients.delete(client);
    }
  }
};

exports.broadcastPostEvent = broadcastPostEvent;

// Helper to escape regex special characters (prevents ReDoS)
const sanitizeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Semantic Concept Dictionary for Smart Search
const SEMANTIC_CONCEPTS = {
  async: ['asynchronous', 'promise', 'callback', 'event loop', 'concurrency', 'await', 'non-blocking'],
  asynchronous: ['async', 'promise', 'callback', 'event loop', 'concurrency', 'await', 'non-blocking'],
  ai: ['artificial intelligence', 'machine learning', 'llm', 'neural', 'deep learning', 'gpt', 'model', 'copilot'],
  'machine learning': ['ai', 'artificial intelligence', 'neural', 'deep learning', 'model', 'data science'],
  database: ['mongodb', 'sql', 'nosql', 'mongoose', 'query', 'indexing', 'schema', 'relational', 'postgres'],
  frontend: ['react', 'vue', 'tailwind', 'component', 'dom', 'ui', 'css', 'ux', 'browser'],
  backend: ['node', 'express', 'api', 'server', 'microservice', 'rest', 'middleware', 'endpoint'],
  performance: ['speed', 'latency', 'optimize', 'cache', 'throughput', 'scalability', 'fast'],
  scalability: ['scale', 'distributed', 'throughput', 'microservices', 'load balancing', 'architecture'],
  security: ['jwt', 'auth', 'token', 'bcrypt', 'encryption', 'sanitize', 'vulnerability', 'csrf']
};

// @desc    Get all published posts with search, filter, sort & pagination
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      author,
      tag,
      sort = 'newest',
      page = 1,
      limit = 6,
      status = 'published'
    } = req.query;

    const query = {};

    // Filter by status (only allow published for public, or requested if admin/author)
    if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = 'published';
    }

    // Exclude future scheduled posts for public requests
    if (query.status === 'published') {
      query.$or = [
        { scheduledFor: { $exists: false } },
        { scheduledFor: null },
        { scheduledFor: { $lte: new Date() } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Author filter
    if (author) {
      if (mongoose.Types.ObjectId.isValid(author)) {
        query.author = author;
      }
    }

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // Search query (title, description, content, tags) with sanitized regex & semantic concept expansion
    if (search && search.trim() !== '') {
      const rawTerm = search.trim().toLowerCase();
      const sanitized = sanitizeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
        { tags: searchRegex }
      ];

      // Smart semantic concept expansion
      for (const [key, synonyms] of Object.entries(SEMANTIC_CONCEPTS)) {
        if (rawTerm.includes(key)) {
          for (const syn of synonyms) {
            const synRegex = new RegExp(sanitizeRegex(syn), 'i');
            searchConditions.push(
              { title: synRegex },
              { description: synRegex },
              { tags: synRegex }
            );
          }
        }
      }

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular' || sort === 'views') {
      sortOption = { views: -1, createdAt: -1 };
    } else if (sort === 'claps') {
      sortOption = { clapsCount: -1, createdAt: -1 };
    } else if (sort === 'readingTime') {
      sortOption = { readTime: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 6;
    const skip = (pageNum - 1) * limitNum;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name username profileImage bio')
      .populate('commentCount')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      totalPages,
      currentPage: pageNum,
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID or Slug
// @route   GET /api/posts/:id
// @access  Public (with optional user context)
exports.getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }

    const post = await Post.findOne(query)
      .populate('author', 'name username profileImage bio followers')
      .populate('commentCount');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count asynchronously
    post.views += 1;
    await post.save({ validateBeforeSave: false });

    // Determine current user's claps on this post
    let userClaps = 0;
    if (req.user && post.clapsByUser) {
      const match = post.clapsByUser.find(
        (c) => c.user && c.user.toString() === req.user._id.toString()
      );
      if (match) userClaps = match.count;
    }

    // Auto-generate key takeaways if none exist yet
    if (!post.keyTakeaways || post.keyTakeaways.length === 0) {
      post.keyTakeaways = [
        `Core insights and architectural paradigms in ${post.category || 'technology'}.`,
        `Practical walkthrough designed for immediate production implementation.`,
        `Key performance metrics, security considerations, and future scalability.`
      ];
    }

    res.status(200).json({
      success: true,
      post,
      userClaps
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const {
      title,
      description,
      content,
      image,
      category,
      tags,
      status,
      keyTakeaways,
      scheduledFor
    } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and content'
      });
    }

    // Process tags if string
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // Process key takeaways
    let parsedTakeaways = [];
    if (keyTakeaways) {
      if (Array.isArray(keyTakeaways)) {
        parsedTakeaways = keyTakeaways.map((t) => t.trim()).filter(Boolean);
      } else if (typeof keyTakeaways === 'string') {
        parsedTakeaways = keyTakeaways
          .split('\n')
          .map((t) => t.replace(/^[•\-\*]\s*/, '').trim())
          .filter(Boolean);
      }
    }

    const post = await Post.create({
      title,
      description,
      content,
      image: image || undefined,
      category: category || 'Technology',
      tags: parsedTags,
      status: status || 'published',
      keyTakeaways: parsedTakeaways,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      author: req.user.id
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name username profileImage bio'
    );

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      post: populatedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a blog post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    let post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post'
      });
    }

    const {
      title,
      description,
      content,
      image,
      category,
      tags,
      status,
      keyTakeaways,
      scheduledFor
    } = req.body;

    if (title) post.title = title;
    if (description) post.description = description;
    if (content) post.content = content;
    if (image) post.image = image;
    if (category) post.category = category;
    if (status) post.status = status;
    if (scheduledFor !== undefined) {
      post.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    }

    if (keyTakeaways !== undefined) {
      if (Array.isArray(keyTakeaways)) {
        post.keyTakeaways = keyTakeaways.map((t) => t.trim()).filter(Boolean);
      } else if (typeof keyTakeaways === 'string') {
        post.keyTakeaways = keyTakeaways
          .split('\n')
          .map((t) => t.replace(/^[•\-\*]\s*/, '').trim())
          .filter(Boolean);
      }
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        post.tags = tags;
      } else if (typeof tags === 'string') {
        post.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      'author',
      'name username profileImage bio'
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully!',
      post: updatedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Delete post
    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog post and related comments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's posts
// @route   GET /api/posts/user/my-posts
// @access  Private
exports.getMyPosts = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { author: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const posts = await Post.find(query)
      .populate('commentCount')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on a post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const userIdStr = req.user.id.toString();
    const alreadyLiked = post.likes.some((likeId) => likeId.toString() === userIdStr);

    if (alreadyLiked) {
      // Remove like
      post.likes = post.likes.filter((likeId) => likeId.toString() !== userIdStr);
    } else {
      // Add like
      post.likes.push(req.user.id);
    }

    await post.save({ validateBeforeSave: false });

    // Real-Time SSE Broadcast
    broadcastPostEvent(post._id, {
      type: 'LIKE_UPDATE',
      postId: post._id,
      likesCount: post.likes.length,
      isLiked: !alreadyLiked
    });

    res.status(200).json({
      success: true,
      isLiked: !alreadyLiked,
      likesCount: post.likes.length,
      likes: post.likes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Medium-style multi-clap counter
// @route   POST /api/posts/:id/clap
// @access  Private
exports.clapPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestedCount = parseInt(req.body.count, 10) || 1;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    if (!post.clapsByUser) {
      post.clapsByUser = [];
    }

    const userId = req.user._id.toString();
    let userClap = post.clapsByUser.find((c) => c.user && c.user.toString() === userId);

    if (!userClap) {
      userClap = { user: req.user._id, count: 0 };
      post.clapsByUser.push(userClap);
    }

    if (userClap.count >= 50) {
      return res.status(400).json({
        success: false,
        message: 'You have reached the maximum 50 claps for this article!',
        userClaps: userClap.count,
        clapsCount: post.clapsCount
      });
    }

    const maxAllowed = 50 - userClap.count;
    const countToAdd = Math.min(requestedCount, maxAllowed);

    userClap.count += countToAdd;
    post.clapsCount = (post.clapsCount || 0) + countToAdd;

    await post.save({ validateBeforeSave: false });

    // Broadcast SSE update live across all readers
    broadcastPostEvent(post._id, {
      type: 'CLAP_UPDATE',
      postId: post._id,
      clapsCount: post.clapsCount
    });

    // Notify author if clapper is not the author
    if (post.author && post.author.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'clap',
          post: post._id,
          message: `${req.user.name} clapped ${countToAdd} time(s) on your story "${post.title.substring(0, 35)}..."`
        });
      } catch (nErr) {
        // Continue even if notification creation fails
      }
    }

    res.status(200).json({
      success: true,
      userClaps: userClap.count,
      clapsCount: post.clapsCount,
      message: `+${countToAdd} clap(s) added!`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized feed of followed authors
// @route   GET /api/posts/feed/following
// @access  Private
exports.getFollowingFeed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.following || user.following.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        posts: [],
        message: 'You are not following any authors yet. Explore top creators to curate your personal feed.'
      });
    }

    const posts = await Post.find({
      author: { $in: user.following },
      status: 'published'
    })
      .populate('author', 'name username profileImage bio')
      .populate('commentCount')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    next(error);
  }
};

// Gemini API integration helper with safe fallback
const callGeminiApi = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.warn('Gemini API call failed, using intelligent fallback:', err.message);
    return null;
  }
};

// @desc    Live SSE stream for real-time post events (claps, comments, likes, tips)
// @route   GET /api/posts/:id/stream
// @access  Public
exports.streamPostEvents = (req, res) => {
  const { id } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(`: stream connected for post ${id}\n\n`);

  const pIdStr = id.toString();
  if (!postEventClients.has(pIdStr)) {
    postEventClients.set(pIdStr, new Set());
  }
  const clientSet = postEventClients.get(pIdStr);
  clientSet.add(res);

  // Send heartbeat every 20 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clientSet.delete(res);
    if (clientSet.size === 0) {
      postEventClients.delete(pIdStr);
    }
  });
};

// @desc    AI Writer Copilot & Summary assistant (Gemini Powered with Smart Fallback)
// @route   POST /api/posts/ai-assist
// @access  Private
exports.aiAssist = async (req, res, next) => {
  try {
    const { type, title, content, description, category, tone = 'professional' } = req.body;

    // 1. SUMMARIZE / KEY TAKEAWAYS
    if (type === 'summarize') {
      const prompt = `You are a technical editor. Summarize the following blog post into exactly 3 punchy, high-impact bullet points (no intro, no markdown header, just the 3 bullet points starting with -):
Title: ${title || 'Article'}
Category: ${category || 'Technology'}
Content: ${(content || description || '').substring(0, 3000)}`;

      const geminiResult = await callGeminiApi(prompt);
      if (geminiResult) {
        const bullets = geminiResult
          .split('\n')
          .map((line) => line.replace(/^[\*\-\•\d\.]+\s*/, '').trim())
          .filter(Boolean)
          .slice(0, 3);
        if (bullets.length > 0) {
          return res.status(200).json({ success: true, takeaways: bullets, source: 'gemini' });
        }
      }

      // Intelligent Fallback
      const bullets = [
        `Core insights and architectural paradigms in ${category || 'modern technology'}.`,
        `Practical walkthrough designed for immediate production implementation and code clarity.`,
        `Key performance metrics, security considerations, and future scalability patterns.`
      ];
      return res.status(200).json({ success: true, takeaways: bullets, source: 'fallback' });
    }

    // 2. SEO TITLES GENERATOR
    if (type === 'titles') {
      const topic = title || category || 'Modern Development';
      const prompt = `Generate 4 catchy, high-CTR, professional SEO titles for an article about: "${topic}". Category: ${category || 'Tech'}. Return ONLY the 4 titles, one per line.`;
      const geminiResult = await callGeminiApi(prompt);
      if (geminiResult) {
        const titles = geminiResult
          .split('\n')
          .map((t) => t.replace(/^[\d\.\-\*\"\'\`]+\s*/, '').replace(/[\"\'\`]+$/, '').trim())
          .filter(Boolean)
          .slice(0, 4);
        if (titles.length > 0) {
          return res.status(200).json({ success: true, titles, source: 'gemini' });
        }
      }

      const suggestions = [
        `The Definitive Guide to ${topic} in 2026`,
        `How Mastering ${topic} Transformed Our Engineering Stack`,
        `5 Critical Lessons Every Developer Must Know About ${topic}`,
        `Architecting for Scale: A Pragmatic Approach to ${topic}`
      ];
      return res.status(200).json({ success: true, titles: suggestions, source: 'fallback' });
    }

    // 3. POLISH / ENHANCE
    if (type === 'polish') {
      let textToPolish = (content || '').trim();
      if (!textToPolish) {
        return res.status(400).json({ success: false, message: 'Content is required for polishing' });
      }

      const prompt = `You are a world-class copywriter and developer advocate. Enhance and polish the following Markdown text for grammatical clarity, conciseness, and engaging flow while preserving all original Markdown syntax, links, and code blocks:\n\n${textToPolish.substring(0, 4000)}`;
      const geminiResult = await callGeminiApi(prompt);
      if (geminiResult) {
        return res.status(200).json({
          success: true,
          polished: geminiResult,
          source: 'gemini'
        });
      }

      let polished = textToPolish
        .replace(/\b(very|really|actually)\s+/gi, '')
        .replace(/\b(in order to)\b/gi, 'to')
        .replace(/\s{2,}/g, ' ');

      return res.status(200).json({
        success: true,
        polished: `${polished}\n\n*Enhanced for clarity, tone, and conciseness by BlogHub AI Copilot.*`,
        source: 'fallback'
      });
    }

    // 4. META DESCRIPTION
    if (type === 'meta') {
      const topic = title || 'this article';
      const prompt = `Write a high-converting SEO meta description (under 155 characters) for an article titled "${topic}" about ${category || 'software development'}. Return ONLY the meta description text.`;
      const geminiResult = await callGeminiApi(prompt);
      if (geminiResult && geminiResult.length <= 170) {
        return res.status(200).json({ success: true, metaDescription: geminiResult, source: 'gemini' });
      }

      const meta = `Discover how to elevate your skills with deep insights on ${topic}. Explore practical patterns, architectural takeaways, and industry best practices.`;
      return res.status(200).json({
        success: true,
        metaDescription: meta.substring(0, 155),
        source: 'fallback'
      });
    }

    // 5. TONE REFINER (Professional, Casual, Academic, Engaging)
    if (type === 'tone') {
      const requestedTone = (tone || 'professional').toLowerCase();
      let text = (content || description || '').trim();
      if (!text) {
        return res.status(400).json({ success: false, message: 'Content is required to adjust tone' });
      }

      const prompt = `Rewrite the following blog draft with a ${requestedTone.toUpperCase()} tone. Keep all key technical points intact and preserve markdown headings:\n\n${text.substring(0, 3000)}`;
      const geminiResult = await callGeminiApi(prompt);
      if (geminiResult) {
        return res.status(200).json({
          success: true,
          tone: requestedTone,
          refined: geminiResult,
          source: 'gemini'
        });
      }

      // Local heuristic tone transformer
      let transformed = text;
      if (requestedTone === 'casual') {
        transformed = `Hey everyone! Let's dive right into this.\n\n${text}\n\nCatch you in the comments below!`;
      } else if (requestedTone === 'academic') {
        transformed = `## Abstract & Empirical Investigation\n\n${text}\n\n### References & Methodological Notes\nEmpirically evaluated within production deployment architectures.`;
      } else if (requestedTone === 'engaging') {
        transformed = `💡 **Why this matters more than ever:**\n\n${text}\n\n🚀 *What are your thoughts? Drop a comment and share your experience!*`;
      } else {
        // Professional default
        transformed = `${text}\n\n*Documented with enterprise standards and architectural best practices.*`;
      }

      return res.status(200).json({
        success: true,
        tone: requestedTone,
        refined: transformed,
        source: 'fallback'
      });
    }

    // 6. AUTO-TAG GENERATOR
    if (type === 'tags') {
      const sampleText = `${title || ''} ${category || ''} ${content || ''}`.toLowerCase();
      const prompt = `Suggest 5 relevant, popular technical tags for a blog post titled "${title || ''}" in category "${category || ''}". Return ONLY comma-separated tags like: React, JavaScript, Node, WebDev, FullStack`;
      const geminiResult = await callGeminiApi(prompt);
      if (geminiResult) {
        const parsedTags = geminiResult
          .split(',')
          .map((t) => t.replace(/[#\s]/g, '').trim())
          .filter(Boolean)
          .slice(0, 6);
        if (parsedTags.length > 0) {
          return res.status(200).json({ success: true, tags: parsedTags, source: 'gemini' });
        }
      }

      const candidateTags = [
        'React', 'JavaScript', 'TypeScript', 'NodeJS', 'Express', 'MongoDB',
        'TailwindCSS', 'FullStack', 'WebDev', 'Architecture', 'AI', 'Cloud',
        'Performance', 'Security', 'DevOps', 'Productivity', 'Design'
      ];
      const matched = candidateTags.filter((t) => sampleText.includes(t.toLowerCase()));
      const finalTags = matched.length >= 3 ? matched.slice(0, 5) : [category || 'Technology', 'WebDev', 'Programming', 'FullStack'];

      return res.status(200).json({ success: true, tags: finalTags, source: 'fallback' });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid AI assist type. Supported: summarize, titles, polish, meta, tone, tags'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured posts
// @route   GET /api/posts/featured
// @access  Public
exports.getFeaturedPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name username profileImage')
      .populate('commentCount')
      .sort({ views: -1, createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related posts (same category, different id)
// @route   GET /api/posts/:id/related
// @access  Public
exports.getRelatedPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const related = await Post.find({
      _id: { $ne: post._id },
      category: post.category,
      status: 'published'
    })
      .populate('author', 'name username profileImage')
      .limit(3);

    res.status(200).json({
      success: true,
      posts: related
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Interactive RAG "Ask This Story" AI Assistant
// @route   POST /api/posts/:id/ask-ai
// @access  Public (optionalAuth)
exports.askAiAboutPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a question' });
    }

    const post = await Post.findById(id).populate('author', 'name username');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const articleContext = `Article Title: "${post.title}"\nAuthor: ${post.author?.name || 'Writer'}\nCategory: ${post.category}\nTags: ${post.tags?.join(', ') || 'General'}\nContent Excerpt:\n${post.content.slice(0, 3500)}`;

    const prompt = `You are BlogHub's AI Article Copilot. A reader is reading this article and asking a question about it.
Context:
${articleContext}

Reader Question: "${question}"

Provide a direct, highly articulate, helpful response based strictly on the article context. If the article does not provide enough information for a specific claim, state that transparently while providing reasoned context. Format with clean markdown paragraphs and bullet points if appropriate.`;

    let answer = await callGeminiApi(prompt);

    if (!answer) {
      // Intelligent Heuristic RAG Fallback
      const qLower = question.toLowerCase();
      const sentences = post.content.replace(/[#*`_]/g, '').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);

      if (qLower.includes('summar') || qLower.includes('takeaway') || qLower.includes('key point') || qLower.includes('tldr')) {
        answer = `### 📌 Key Takeaways from "${post.title}":\n\n` +
          `- **Core Thesis:** ${post.description || sentences[0] || 'The article explores key paradigms in this domain.'}\n` +
          `- **Primary Insight:** ${sentences[1] || 'Modern systems require scalable architectures and deliberate design patterns.'}\n` +
          `- **Practical Impact:** ${sentences[2] || 'Adopting these principles drives better developer velocity and resilient user experiences.'}`;
      } else if (qLower.includes('beginner') || qLower.includes('eli5') || qLower.includes('simple')) {
        answer = `### 💡 In Simple Terms (EL15):\n\n` +
          `Imagine "${post.title}" as solving a fundamental challenge in **${post.category}**. The author emphasizes that rather than relying on brittle legacy approaches, modern engineering utilizes structured workflows so systems remain performant under load. Essentially: simplify your moving parts, track your metrics, and build iteratively.`;
      } else if (qLower.includes('code') || qLower.includes('example') || qLower.includes('implement')) {
        const codeMatch = post.content.match(/```(?:[a-z]+)?\n([\s\S]*?)```/);
        if (codeMatch) {
          answer = `### 💻 Code Example from the Article:\n\nHere is the primary implementation snippet provided by the author:\n\n\`\`\`javascript\n${codeMatch[1].trim()}\n\`\`\`\n\nThis pattern ensures modular execution and handles state transitions cleanly.`;
        } else {
          answer = `The author primarily discusses the architectural and design concepts behind **${post.title}**. While high-level logic and workflows are detailed throughout, the key takeaway is to structure your application components with clear interfaces and robust error boundaries.`;
        }
      } else {
        const relevantSentences = sentences.filter(s => {
          const words = qLower.split(' ').filter(w => w.length > 4);
          return words.some(w => s.toLowerCase().includes(w));
        });

        const selectedContext = relevantSentences.slice(0, 3).join('. ');
        answer = selectedContext
          ? `Based on "${post.title}", the author addresses this topic by highlighting:\n\n> ${selectedContext}.\n\nThis underlines the central premise that in ${post.category}, proactive design and clear separation of concerns lead to superior stability.`
          : `According to "${post.title}", the discussion focuses on ${post.description || 'best practices in modern development'}. Key takeaways emphasize that adopting these methodologies allows teams to innovate faster without accumulating technical debt.`;
      }
    }

    res.status(200).json({
      success: true,
      question: question.trim(),
      answer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Translate article summary & key sections
// @route   POST /api/posts/:id/translate
// @access  Public (optionalAuth)
exports.translatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetLang = 'es' } = req.body;

    const langNames = {
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      ja: 'Japanese',
      hi: 'Hindi'
    };

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const langName = langNames[targetLang] || 'Spanish';
    const prompt = `Translate the following article metadata and introduction into ${langName}.
Return ONLY a valid JSON object with keys "translatedTitle", "translatedDescription", and "translatedSummary".

Title: "${post.title}"
Description: "${post.description}"
Content Excerpt: "${post.content.slice(0, 600)}"`;

    let resultJson = null;
    try {
      const raw = await callGeminiApi(prompt);
      if (raw) {
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        resultJson = JSON.parse(cleaned);
      }
    } catch (e) {
      resultJson = null;
    }

    if (!resultJson) {
      // Heuristic multi-language dictionary fallback
      const prefixes = {
        es: { title: '[ES] ', desc: 'Versión en español: ', summary: 'Este artículo examina las mejores prácticas, arquitecturas modernas y estrategias de ingeniería para desarrolladores.' },
        fr: { title: '[FR] ', desc: 'Version en français : ', summary: 'Cet article examine les meilleures pratiques, les architectures modernes et les stratégies d’ingénierie.' },
        de: { title: '[DE] ', desc: 'Deutsche Version: ', summary: 'Dieser Artikel untersucht Best Practices, moderne Architekturen und Entwicklungsstrategien.' },
        ja: { title: '[JA] ', desc: '日本語版: ', summary: 'この記事では、開発者のための最新アーキテクチャとエンジニアリングのベストプラクティスについて解説します。' },
        hi: { title: '[HI] ', desc: 'हिन्दी अनुवाद: ', summary: 'यह लेख आधुनिक सॉफ्टवेयर इंजीनियरिंग और सर्वश्रेष्ठ विकास प्रथाओं की पड़ताल करता है।' }
      };

      const langMeta = prefixes[targetLang] || prefixes.es;
      resultJson = {
        translatedTitle: `${langMeta.title}${post.title}`,
        translatedDescription: `${langMeta.desc}${post.description}`,
        translatedSummary: langMeta.summary
      };
    }

    res.status(200).json({
      success: true,
      targetLang,
      langName,
      ...resultJson
    });
  } catch (error) {
    next(error);
  }
};
