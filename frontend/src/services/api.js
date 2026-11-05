import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bloghub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!localStorage.getItem('bloghub_token');
      if (hadToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('bloghub_token');
        localStorage.removeItem('bloghub_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
};

// Post endpoints
export const postService = {
  getPosts: (params) => API.get('/posts', { params }),
  getFeatured: () => API.get('/posts/featured'),
  getPostById: (id) => API.get(`/posts/${id}`),
  getRelated: (id) => API.get(`/posts/${id}/related`),
  getMyPosts: (params) => API.get('/posts/user/my-posts', { params }),
  getFollowingFeed: () => API.get('/posts/feed/following'),
  createPost: (data) => API.post('/posts', data),
  updatePost: (id, data) => API.put(`/posts/${id}`, data),
  deletePost: (id) => API.delete(`/posts/${id}`),
  toggleLike: (id) => API.put(`/posts/${id}/like`),
  clapPost: (id, count = 1) => API.post(`/posts/${id}/clap`, { count }),
  aiAssist: (data) => API.post('/posts/ai-assist', data),
  askAi: (id, question) => API.post(`/posts/${id}/ask-ai`, { question }),
  translate: (id, targetLang) => API.post(`/posts/${id}/translate`, { targetLang }),
};

// Comment endpoints
export const commentService = {
  getComments: (postId) => API.get(`/comments/${postId}`),
  addComment: (postId, data) => API.post(`/comments/${postId}`, data),
  updateComment: (id, data) => API.put(`/comments/${id}`, data),
  deleteComment: (id) => API.delete(`/comments/${id}`),
};

// User endpoints
export const userService = {
  getProfile: (username) => API.get(username ? `/users/profile/${username}` : '/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  getDashboardStats: () => API.get('/users/dashboard/stats'),
  getAnalytics: () => API.get('/users/dashboard/analytics'),
  toggleFollow: (id) => API.post(`/users/${id}/follow`),
  getBookmarks: () => API.get('/users/bookmarks'),
  toggleBookmark: (postId) => API.post(`/users/bookmarks/${postId}`),
  getReadingLists: () => API.get('/users/reading-lists'),
  createReadingList: (data) => API.post('/users/reading-lists', data),
  addPostToReadingList: (listId, postId) =>
    API.post(`/users/reading-lists/${listId}/add`, { postId }),
  removePostFromReadingList: (listId, postId) =>
    API.delete(`/users/reading-lists/${listId}/${postId}`),
  sendTip: (userId, data) => API.post(`/users/${userId}/tip`, data),
  getWallet: () => API.get('/users/wallet'),
  subscribeNewsletter: (authorId, data) => API.post(`/users/${authorId}/subscribe`, data),
  getNewsletterStats: () => API.get('/users/newsletter/stats'),
  dispatchNewsletter: (data) => API.post('/users/newsletter/dispatch', data),
  uploadImage: (formData) =>
    API.post('/users/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Notification endpoints
export const notificationService = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

export default API;
