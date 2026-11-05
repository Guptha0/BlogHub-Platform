const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a short description'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide blog content']
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
      default: 'Technology'
    },
    tags: {
      type: [String],
      default: []
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    clapsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    clapsByUser: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        count: {
          type: Number,
          default: 0,
          max: 50
        }
      }
    ],
    keyTakeaways: {
      type: [String],
      default: []
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    views: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number,
      default: 3
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for comment count
postSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true
});

// Calculate read time and slug before save
postSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordCount = this.content ? this.content.split(/\s+/).length : 0;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  if (this.isModified('title') && !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const randomHex = Math.random().toString(36).substring(2, 7);
    this.slug = `${baseSlug}-${randomHex}`;
  }

  next();
});

// Index for search queries
postSchema.index({ title: 'text', description: 'text', content: 'text', category: 'text' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

