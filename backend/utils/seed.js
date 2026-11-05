const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const usersData = [
  {
    name: 'Sophia Vance',
    username: 'sophia_tech',
    email: 'sophia@bloghub.com',
    password: 'password123',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Lead Software Architect & Cloud Enthusiast. Writing about scalable systems, modern JavaScript, and distributed engineering.',
    role: 'admin'
  },
  {
    name: 'Liam Chen',
    username: 'liam_dev',
    email: 'liam@bloghub.com',
    password: 'password123',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Full-Stack Developer passionate about React, Node.js, and crafting delightful, responsive developer experiences.',
    role: 'user'
  },
  {
    name: 'Elena Rostova',
    username: 'elena_ux',
    email: 'elena@bloghub.com',
    password: 'password123',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Senior UI/UX Designer & Accessibility advocate. Obsessed with micro-interactions, typography, and cohesive design systems.',
    role: 'user'
  }
];

const samplePosts = [
  {
    title: 'The Future of Full-Stack Web Development in 2026 and Beyond',
    description: 'Explore the evolving landscape of full-stack engineering, serverless architectures, and next-generation frameworks reshaping our workflow.',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    tags: ['FullStack', 'JavaScript', 'WebDev', 'Cloud'],
    status: 'published',
    views: 1420,
    content: `Web development is undergoing one of its most transformative eras. In 2026, the boundaries between client and server have fundamentally blurred. From edge rendering to hybrid state synchronization, developers are expected to ship blistering fast, resilient applications with seamless offline support and intelligent user personalization.

### The Rise of Unified Frameworks
Gone are the days when frontend and backend teams operated in completely isolated silos. Modern architectures embrace unified types, end-to-end data validation, and streamlined RESTful APIs that bridge frontend experiences directly to high-throughput databases.

### Key Tenets of Modern Web Systems:
1. **Low-Latency Edge Execution:** Moving compute closer to users eliminates cold-starts and optimizes Core Web Vitals.
2. **Granular Component-Level Data Fetching:** Leveraging reactive state hooks and resilient API caching patterns.
3. **Inclusive & Accessible Interfaces:** Ensuring WCAG AAA contrast, keyboard navigability, and smooth animations across devices.

### What Lies Ahead
As AI-assisted tooling and autonomous agent workflows mature, the engineer's role shifts from boilerplate code writing to system architecture, security hardening, and user-centric problem solving.`
  },
  {
    title: 'Mastering Clean Architecture with Express and React',
    description: 'A deep-dive tutorial on structuring scalable MERN applications with modular controllers, custom hooks, and reliable error handling.',
    category: 'Programming',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    tags: ['React', 'NodeJS', 'Express', 'Architecture'],
    status: 'published',
    views: 890,
    content: `When scaling web applications from hobby projects to production-grade platforms, the primary bottleneck is rarely database performance or server CPU. It is almost always maintainability and architectural cohesion.

### Why Layered Architecture Matters
A robust backend separates concerns cleanly:
- **Routing Layer:** Declares endpoints and connects appropriate middleware.
- **Controller Layer:** Coordinates business logic, input validation, and HTTP responses.
- **Service & Data Layer:** Manages Mongoose ODM schemas, indexes, and queries.

\`\`\`javascript
// Example Controller Structure
exports.createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({ title, content, author: req.user.id });
    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};
\`\`\`

By adhering to this discipline, your testing footprint remains clean and onboarded engineers can orient themselves in minutes.`
  },
  {
    title: 'Designing Cohesive Design Systems: Dark Navy and Purple Aesthetics',
    description: 'How to combine color psychology, high-contrast palette harmonies, and subtle shadows for an irresistible modern SaaS product.',
    category: 'Design & UX',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    tags: ['Design', 'UI', 'UX', 'TailwindCSS'],
    status: 'published',
    views: 1105,
    content: `Dark mode is no longer just an aesthetic novelty—it is an expectation. However, many developers mistakenly assume that dark mode merely means turning white surfaces into pure black \`#000000\`.

### Avoiding Pure Black
Pure black causes severe contrast vibration against pure white text, inducing eye fatigue. Instead, modern digital platforms utilize **Deep Navy** (\`#0a0f1d\`) and rich slate neutrals:

- **Surface Neutral:** Deep Midnight Navy (\`#0f172a\`)
- **Card Elevated:** Dark Navy Slate (\`#1e293b\`)
- **Primary Accent:** Vivid Indigo / Purple (\`#6366f1\` and \`#8b5cf6\`)
- **Accent Glow:** Subtle gradient highlights and soft purple blur backdrops

### Micro-Interactions that Delight
Subtle transitions on button hovers, glowing borders on focused form inputs, and responsive card elevations make users feel like the platform is alive and tactile.`
  },
  {
    title: 'Demystifying Generative AI and Multimodal LLMs',
    description: 'An approachable breakdown of neural tokens, embeddings, vector search, and how modern developers can harness AI in everyday web apps.',
    category: 'Artificial Intelligence',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    tags: ['AI', 'MachineLearning', 'LLM', 'Innovation'],
    status: 'published',
    views: 2310,
    content: `Artificial Intelligence has evolved from obscure academic research into the most pivotal developer primitive of the decade. Today, incorporating natural language search, real-time transcription, or automated summarization is as straightforward as consuming a REST endpoint.

### Understanding Vector Embeddings
At the core of modern semantic search is the concept of high-dimensional embeddings. Text, code, and images are mapped to floating-point vectors where semantic similarity correlates to cosine distance.

### The New Developer Paradigm
1. **Prompt Engineering & Structured Outputs:** Ensuring models return strict JSON adhering to your schema.
2. **Context Window Strategy:** Smart retrieval mechanisms (RAG) rather than feeding uncurated data dumps.
3. **Agentic Workflows:** Combining tools, execution loops, and automated validation to solve complex, multi-step queries.`
  },
  {
    title: 'The Psychology of High-Converting Landing Pages',
    description: 'Learn the proven UX principles behind persuasive headlines, clear visual hierarchy, and frictionless user onboarding.',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    tags: ['Startup', 'Growth', 'Conversion', 'UX'],
    status: 'published',
    views: 640,
    content: `A great product with a confusing landing page will always lose to an average product with crystal-clear communication. Your landing page has one job: communicate value and remove friction.

### The 5-Second Test
Within five seconds of landing on your page, a visitor should know:
- **What is it?**
- **Who is it for?**
- **What specific problem does it solve?**
- **What should I do next?**

Clear hero sections with strong typography and high-contrast call-to-actions consistently outperform ambiguous, buzzword-heavy copy.`
  },
  {
    title: '10 Essential VS Code Shortcuts and Extensions for 10x Productivity',
    description: 'Boost your daily development speed with these hand-picked extensions, keyboard shortcuts, and terminal workflow tips.',
    category: 'Productivity',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    tags: ['VSCode', 'Productivity', 'DeveloperTools'],
    status: 'published',
    views: 750,
    content: `Every second spent searching through nested file trees or manually formatting messy indentation adds up to hours over a sprint. Mastering your primary IDE is the highest-ROI investment any programmer can make.

### Key Shortcuts You Should Memorize:
- **Multi-cursor editing:** \`Alt + Click\` or \`Ctrl + D\` to select matching symbols.
- **Quick File Switcher:** \`Ctrl + P\` with fuzzy name matching.
- **Command Palette:** \`Ctrl + Shift + P\` for any command.
- **Toggle Terminal:** \`Ctrl + \` for instant CLI context without leaving the editor.`
  }
];

const sampleComments = [
  'Fantastic article! The breakdown of clean layered architecture was exactly what I needed for my current project.',
  'Great insights on color theory and avoiding pure black in dark mode. The navy slate palette looks remarkably sharp!',
  'The future of full-stack engineering is indeed exciting. Edge computing combined with reactive client state is a game changer.',
  'Really clear and well-written. Looking forward to reading more from you on BlogHub!'
];

const seedData = async (shouldExit = true) => {
  try {
    console.log('Seeding BlogHub database...');

    // Clear existing data
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();

    console.log('Existing collections cleared.');

    // Create users (password will be hashed by pre-save hook)
    const createdUsers = [];
    for (const userData of usersData) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} seed users.`);

    // Create posts
    const createdPosts = [];
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      const author = createdUsers[i % createdUsers.length];

      // Add some sample likes
      const likes = createdUsers
        .slice(0, (i % createdUsers.length) + 1)
        .map((u) => u._id);

      const post = await Post.create({
        ...postData,
        author: author._id,
        likes,
        clapsCount: 25 + (i * 14),
        clapsByUser: [
          { user: createdUsers[(i + 1) % createdUsers.length]._id, count: 15 },
          { user: createdUsers[(i + 2) % createdUsers.length]._id, count: 10 + (i * 4) }
        ],
        keyTakeaways: [
          `Key takeaway 1: Actionable best practices and performance optimization for ${postData.category}.`,
          `Key takeaway 2: Deep architectural principles to enhance resilience and user experience.`,
          `Key takeaway 3: Real-world engineering patterns that streamline development velocity.`
        ]
      });
      createdPosts.push(post);
    }
    console.log(`Created ${createdPosts.length} seed blog posts.`);

    // Connect mutual follows and sample bookmarks/reading lists
    createdUsers[0].following = [createdUsers[1]._id, createdUsers[2]._id];
    createdUsers[0].followers = [createdUsers[1]._id];
    createdUsers[0].bookmarks = [createdPosts[1]._id, createdPosts[2]._id];
    createdUsers[0].readingLists = [
      {
        name: 'Must-Read System Architecture',
        description: 'Crucial reads for full-stack engineering, performance, and clean code.',
        posts: [createdPosts[0]._id, createdPosts[1]._id]
      }
    ];
    await createdUsers[0].save();

    createdUsers[1].following = [createdUsers[0]._id];
    createdUsers[1].followers = [createdUsers[0]._id, createdUsers[2]._id];
    createdUsers[1].bookmarks = [createdPosts[0]._id];
    await createdUsers[1].save();

    createdUsers[2].following = [createdUsers[1]._id];
    createdUsers[2].followers = [createdUsers[0]._id];
    createdUsers[2].bookmarks = [createdPosts[0]._id, createdPosts[3]._id];
    await createdUsers[2].save();

    // Create comments
    let commentCount = 0;
    for (let i = 0; i < createdPosts.length; i++) {
      const post = createdPosts[i];
      // Add 2 comments to each post
      for (let j = 0; j < 2; j++) {
        const commenter = createdUsers[(i + j + 1) % createdUsers.length];
        const content = sampleComments[(i + j) % sampleComments.length];

        await Comment.create({
          content,
          post: post._id,
          author: commenter._id
        });
        commentCount++;
      }
    }
    console.log(`Created ${commentCount} seed comments.`);
    console.log('Database seeding completed successfully!');

    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding error:', error);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

// If run directly via CLI `node utils/seed.js`
if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB().then(() => {
    seedData(true);
  });
}

module.exports = { seedData };

