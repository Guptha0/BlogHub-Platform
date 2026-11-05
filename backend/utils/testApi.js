const http = require('http');

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const postDataStr = postData ? (typeof postData === 'string' ? postData : JSON.stringify(postData)) : null;
    const headers = { ...options.headers };

    if (postDataStr) {
      headers['Content-Length'] = Buffer.byteLength(postDataStr);
    }

    const req = http.request({ ...options, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postDataStr) {
      req.write(postDataStr);
    }
    req.end();
  });
};

const runIntegrationTests = async () => {
  console.log('--- Starting BlogHub Integration Verification ---');
  const baseUrl = 'localhost';
  const port = 5000;

  // 1. Health check
  console.log('1. Testing /api/health ...');
  const healthRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: '/api/health',
    method: 'GET',
  });
  console.log(`   Status: ${healthRes.status}, Response:`, healthRes.data);
  if (healthRes.status !== 200) throw new Error('Health check failed');

  // 2. Register user
  const randomSuffix = Math.floor(Math.random() * 100000);
  const testUser = {
    name: `Test User ${randomSuffix}`,
    username: `testuser_${randomSuffix}`,
    email: `test_${randomSuffix}@bloghub.test`,
    password: 'password123',
    confirmPassword: 'password123',
  };

  console.log(`2. Testing Registration for ${testUser.username} ...`);
  const regRes = await makeRequest(
    {
      hostname: baseUrl,
      port,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    testUser
  );
  console.log(`   Status: ${regRes.status}, Message:`, regRes.data?.message);
  if (regRes.status !== 201 || !regRes.data?.token) {
    console.error('Registration error details:', regRes.data);
    throw new Error('Registration failed');
  }
  const token = regRes.data.token;

  // 3. Login test
  console.log('3. Testing Login ...');
  const loginRes = await makeRequest(
    {
      hostname: baseUrl,
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: testUser.email, password: testUser.password }
  );
  console.log(`   Status: ${loginRes.status}, Welcome:`, loginRes.data?.message);
  if (loginRes.status !== 200) throw new Error('Login failed');

  // 4. Get Current User /api/auth/me
  console.log('4. Testing GET /api/auth/me ...');
  const meRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${meRes.status}, Authenticated as:`, meRes.data?.user?.email);
  if (meRes.status !== 200) throw new Error('GetMe failed');

  // 5. Create Blog Post
  console.log('5. Testing POST /api/posts ...');
  const postPayload = {
    title: `Integration Test Article ${randomSuffix}`,
    description: 'This is an end-to-end integration test article for verifying BlogHub platform features.',
    content: 'Full comprehensive article content with rich markdown.\n\n### Subheading\nValidating database insertion, reading time calculation, and comment cascades.',
    category: 'Technology',
    tags: ['Testing', 'FullStack'],
    status: 'published',
  };
  const createPostRes = await makeRequest(
    {
      hostname: baseUrl,
      port,
      path: '/api/posts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    postPayload
  );
  console.log(`   Status: ${createPostRes.status}, Post ID:`, createPostRes.data?.post?._id);
  if (createPostRes.status !== 201) throw new Error('Create post failed');
  const createdPostId = createPostRes.data.post._id;

  // 6. Get All Posts
  console.log('6. Testing GET /api/posts ...');
  const getPostsRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: '/api/posts?limit=5',
    method: 'GET',
  });
  console.log(`   Status: ${getPostsRes.status}, Total Posts in DB:`, getPostsRes.data?.total);
  if (getPostsRes.status !== 200 || !getPostsRes.data?.posts?.length) throw new Error('Get posts failed');

  // 7. Get Single Post
  console.log(`7. Testing GET /api/posts/${createdPostId} ...`);
  const getSingleRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: `/api/posts/${createdPostId}`,
    method: 'GET',
  });
  console.log(`   Status: ${getSingleRes.status}, Views:`, getSingleRes.data?.post?.views);
  if (getSingleRes.status !== 200) throw new Error('Get single post failed');

  // 8. Like Post
  console.log(`8. Testing PUT /api/posts/${createdPostId}/like ...`);
  const likeRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: `/api/posts/${createdPostId}/like`,
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${likeRes.status}, Likes Count:`, likeRes.data?.likesCount);
  if (likeRes.status !== 200 || likeRes.data?.likesCount !== 1) throw new Error('Toggle like failed');

  // 9. Add Comment
  console.log(`9. Testing POST /api/comments/${createdPostId} ...`);
  const commentPayload = { content: 'Excellent integration test comment on BlogHub!' };
  const addCommentRes = await makeRequest(
    {
      hostname: baseUrl,
      port,
      path: `/api/comments/${createdPostId}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    commentPayload
  );
  console.log(`   Status: ${addCommentRes.status}, Comment ID:`, addCommentRes.data?.comment?._id);
  if (addCommentRes.status !== 201) throw new Error('Add comment failed');
  const createdCommentId = addCommentRes.data.comment._id;

  // 10. Update Comment
  console.log(`10. Testing PUT /api/comments/${createdCommentId} ...`);
  const updateCommentRes = await makeRequest(
    {
      hostname: baseUrl,
      port,
      path: `/api/comments/${createdCommentId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { content: 'Updated comment content after editing!' }
  );
  console.log(`   Status: ${updateCommentRes.status}, New Content:`, updateCommentRes.data?.comment?.content);
  if (updateCommentRes.status !== 200) throw new Error('Update comment failed');

  // 11. Get Comments
  console.log(`11. Testing GET /api/comments/${createdPostId} ...`);
  const getCommentsRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: `/api/comments/${createdPostId}`,
    method: 'GET',
  });
  console.log(`   Status: ${getCommentsRes.status}, Comments count:`, getCommentsRes.data?.count);
  if (getCommentsRes.status !== 200 || getCommentsRes.data?.count !== 1) throw new Error('Get comments failed');

  // 12. Delete Comment
  console.log(`12. Testing DELETE /api/comments/${createdCommentId} ...`);
  const delCommentRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: `/api/comments/${createdCommentId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${delCommentRes.status}, Result:`, delCommentRes.data?.message);
  if (delCommentRes.status !== 200) throw new Error('Delete comment failed');

  // 13. Update Post
  console.log(`13. Testing PUT /api/posts/${createdPostId} ...`);
  const updatePostRes = await makeRequest(
    {
      hostname: baseUrl,
      port,
      path: `/api/posts/${createdPostId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { title: `Updated Title ${randomSuffix}`, status: 'published' }
  );
  console.log(`   Status: ${updatePostRes.status}, Updated Title:`, updatePostRes.data?.post?.title);
  if (updatePostRes.status !== 200) throw new Error('Update post failed');

  // 14. Get User Dashboard Stats
  console.log('14. Testing GET /api/users/dashboard/stats ...');
  const statsRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: '/api/users/dashboard/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${statsRes.status}, Stats:`, statsRes.data?.stats);
  if (statsRes.status !== 200) throw new Error('Get dashboard stats failed');

  // 15. Testing Claps on Post
  console.log(`15. Testing POST /api/posts/${createdPostId}/clap ...`);
  const clapRes = await makeRequest(
    {
      hostname: baseUrl,
      port,
      path: `/api/posts/${createdPostId}/clap`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { count: 5 }
  );
  console.log(`   Status: ${clapRes.status}, Claps:`, clapRes.data?.clapsCount);
  if (clapRes.status !== 200 || clapRes.data?.clapsCount < 5) throw new Error('Clap test failed');

  // 16. Bookmark toggle
  console.log(`16. Testing POST /api/users/bookmarks/${createdPostId} ...`);
  const bookmarkRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: `/api/users/bookmarks/${createdPostId}`,
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${bookmarkRes.status}, isBookmarked:`, bookmarkRes.data?.isBookmarked);
  if (bookmarkRes.status !== 200 || !bookmarkRes.data?.isBookmarked) throw new Error('Bookmark toggle failed');

  // 17. Get Bookmarks
  console.log('17. Testing GET /api/users/bookmarks ...');
  const getBookmarksRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: '/api/users/bookmarks',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${getBookmarksRes.status}, Bookmarks Count:`, getBookmarksRes.data?.count);
  if (getBookmarksRes.status !== 200 || getBookmarksRes.data?.count !== 1) throw new Error('Get bookmarks failed');

  // 18. Following Feed
  console.log('18. Testing GET /api/posts/feed/following ...');
  const feedRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: '/api/posts/feed/following',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${feedRes.status}, Following Feed Posts:`, feedRes.data?.count);
  if (feedRes.status !== 200) throw new Error('Following feed failed');

  // 19. AI Assist (summarize & titles)
  console.log('19. Testing POST /api/posts/ai-assist ...');
  const aiRes = await makeRequest(
    {
      hostname: baseUrl,
      port,
      path: '/api/posts/ai-assist',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    { type: 'summarize', category: 'Technology', title: 'Modern React' }
  );
  console.log(`   Status: ${aiRes.status}, Takeaways:`, aiRes.data?.takeaways?.length);
  if (aiRes.status !== 200 || !aiRes.data?.takeaways) throw new Error('AI assist failed');

  // 20. Advanced Telemetry Analytics
  console.log('20. Testing GET /api/users/dashboard/analytics ...');
  const analyticsRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: '/api/users/dashboard/analytics',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${analyticsRes.status}, Engagement Rate:`, analyticsRes.data?.analytics?.engagementRate);
  if (analyticsRes.status !== 200 || !analyticsRes.data?.analytics) throw new Error('Analytics failed');

  // 21. Delete Post
  console.log(`21. Testing DELETE /api/posts/${createdPostId} ...`);
  const delPostRes = await makeRequest({
    hostname: baseUrl,
    port,
    path: `/api/posts/${createdPostId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`   Status: ${delPostRes.status}, Result:`, delPostRes.data?.message);
  if (delPostRes.status !== 200) throw new Error('Delete post failed');

  console.log('\n======================================================');
  console.log('🎉 ALL 21 END-TO-END INTEGRATION TESTS PASSED CLEANLY! 🎉');
  console.log('======================================================\n');
};

if (require.main === module) {
  runIntegrationTests().catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}

module.exports = { runIntegrationTests };
