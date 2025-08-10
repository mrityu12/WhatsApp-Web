// src/utils/constants.js

// API base URLs
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  MESSAGES: '/messages',
  CHATS: '/chats',
  UPLOAD: '/upload',
  SEARCH: '/search',
  WEBHOOK: '/webhook',
};

// Socket event names
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_SENT: 'message_sent',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  LOCATION: 'location',
  CONTACT: 'contact',
  STICKER: 'sticker',
};

// Message directions
export const MESSAGE_DIRECTIONS = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
};

// Message status values
export const MESSAGE_STATUS = {
  SENDING: 'sending',  // included from first snippet
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

// Chat types
export const CHAT_TYPES = {
  INDIVIDUAL: 'individual',
  GROUP: 'group',
  BROADCAST: 'broadcast',
};

// File upload limits (in bytes)
export const UPLOAD_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10 MB
  VIDEO: 50 * 1024 * 1024, // 50 MB
  AUDIO: 10 * 1024 * 1024, // 10 MB
  DOCUMENT: 25 * 1024 * 1024, // 25 MB
};

// Supported MIME types for uploads
export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

// Emoji categories
export const EMOJI_CATEGORIES = {
  RECENT: 'recent',
  PEOPLE: 'people',
  NATURE: 'nature',
  FOOD: 'food',
  ACTIVITY: 'activity',
  TRAVEL: 'travel',
  OBJECTS: 'objects',
  SYMBOLS: 'symbols',
  FLAGS: 'flags',
};

// Theme colors for UI
export const THEME_COLORS = {
  PRIMARY: '#25D366',
  PRIMARY_DARK: '#128C7E',
  SECONDARY: '#34B7F1',
  BACKGROUND: '#E5DDD5',
  CHAT_BACKGROUND: '#F0F0F0',
  BUBBLE_SENT: '#DCF8C6',
  BUBBLE_RECEIVED: '#FFFFFF',
};

// Additional chat UI colors
export const CHAT_COLORS = {
  PRIMARY: '#075e54',
  SECONDARY: '#128c7e',
  SUCCESS: '#25d366',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 50;

// Date/time format strings (for libraries like moment.js or dayjs or custom formatting)
export const DATE_FORMATS = {
  MESSAGE_TIME: 'HH:mm',         // 24-hour format
  MESSAGE_DATE: 'DD/MM/YYYY',
  CONVERSATION_DATE: 'DD/MM/YY',
};
