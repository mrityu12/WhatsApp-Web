import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      // You can add more global error handling here if needed
    }
    return Promise.reject(error);
  }
);

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// API functions

export const fetchMessages = async (chatId, limit = 50, offset = 0) => {
  try {
    const response = await api.get(`/messages/${chatId}`, { params: { limit, offset } });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const sendMessage = async (chatId, messageData) => {
  try {
    const response = await api.post(`/messages/${chatId}`, messageData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchChats = async () => {
  try {
    const response = await api.get('/chats');
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const createChat = async (chatData) => {
  try {
    const response = await api.post('/chats', chatData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const updateChatSettings = async (chatId, settings) => {
  try {
    const response = await api.patch(`/chats/${chatId}`, settings);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const uploadFile = async (file, type = 'image') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const searchMessages = async (query, chatId = null) => {
  try {
    const params = { query };
    if (chatId) params.chatId = chatId;
    const response = await api.get('/messages/search', { params });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const markAsRead = async (chatId, messageId) => {
  try {
    const response = await api.patch(`/messages/${chatId}/${messageId}/read`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const deleteMessage = async (chatId, messageId) => {
  try {
    const response = await api.delete(`/messages/${chatId}/${messageId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Utility function to normalize axios errors
function handleAxiosError(error) {
  if (error.response) {
    // Server responded with a status outside 2xx
    const { status, data } = error.response;
    throw new ApiError(data.message || `HTTP error ${status}`, status, data);
  } else if (error.request) {
    // Request made but no response
    throw new ApiError('Network error: No response received', 0, null);
  } else {
    // Something else happened
    throw new ApiError(error.message, 0, null);
  }
}

export default api;
