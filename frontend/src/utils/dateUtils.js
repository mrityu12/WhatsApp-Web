// Removed unused import
// import { abort } from "node:process";

// Check if two dates are the same calendar day
export const isSameDay = (date1, date2) =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() === date2.getFullYear();

// Format relative time for messages (e.g., "now", "5m", "Yesterday")
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'now'; // less than 1 min
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`; // less than 1 hour

  if (isSameDay(date, now)) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';

  if (diff < 604800000) { // less than 7 days
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Format detailed full date/time string
export const formatDetailedTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Format "last seen" time with friendly labels
export const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'last seen recently';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'online';
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `last seen ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (isSameDay(date, now)) {
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `last seen today at ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `last seen yesterday at ${time}`;
  }

  if (diff < 604800000) {
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `last seen ${day} at ${time}`;
  }

  return `last seen ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })}`;
};

// Format date header for grouping messages
export const formatDateHeader = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();

  if (isSameDay(date, now)) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';

  const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });

  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// Get relative time string (e.g., "2 hours ago")
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (weeks < 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

// Format duration seconds as "m:ss"
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// Checks for today, yesterday, this week
export const isToday = (timestamp) => timestamp && isSameDay(new Date(timestamp), new Date());

export const isYesterday = (timestamp) => {
  if (!timestamp) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(new Date(timestamp), yesterday);
};

export const isThisWeek = (timestamp) => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const now = new Date();
  const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  return daysDiff < 7;
};

// Get start/end of day
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Group messages by start of day
export const groupMessagesByDate = (messages) => {
  const groups = new Map();

  messages.forEach(message => {
    const dateKey = getStartOfDay(new Date(message.timestamp)).toISOString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, { date: new Date(dateKey), messages: [] });
    }
    groups.get(dateKey).messages.push(message);
  });

  return Array.from(groups.values()).sort((a, b) => a.date - b.date);
};

// Parse input into Date object
export const parseDate = (input) => {
  if (!input) return null;

  if (input instanceof Date) return input;

  if (typeof input === 'number') {
    // If timestamp in seconds
    if (input.toString().length <= 10) return new Date(input * 1000);
    return new Date(input);
  }

  if (typeof input === 'string') {
    if (/^\d+$/.test(input)) {
      return input.length <= 10 ? new Date(parseInt(input) * 1000) : new Date(parseInt(input));
    }
    return new Date(input);
  }

  return null;
};

// Timezone helpers
export const getTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatTimeWithTimeZone = (timestamp, timeZone = getTimeZone()) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Export all as default object - Fixed anonymous default export
const dateUtils = {
  isSameDay,
  formatTime,
  formatDetailedTime,
  formatLastSeen,
  formatDateHeader,
  getRelativeTime,
  formatDuration,
  isToday,
  isYesterday,
  isThisWeek,
  getStartOfDay,
  getEndOfDay,
  groupMessagesByDate,
  parseDate,
  getTimeZone,
  formatTimeWithTimeZone,
};

export default dateUtils;