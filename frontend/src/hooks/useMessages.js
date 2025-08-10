import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../utils/constants';

// Helper to fetch messages of a chat
const fetchMessagesAPI = async (chatId) => {
  const res = await fetch(`${API_BASE_URL}/messages/${chatId}`);
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch messages');
  return data.data;
};

const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load messages for the chat
  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedMessages = await fetchMessagesAPI(chatId);
      setMessages(fetchedMessages);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // Add message locally (e.g. optimistic UI)
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Update message by ID
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  // Send a new message with optimistic UI
  const sendMessage = useCallback(
    async (messageData) => {
      if (!chatId) throw new Error('chatId is required to send a message');

      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        ...messageData,
        sender: 'me',
        timestamp: new Date().toISOString(),
        status: 'sending',
      };

      addMessage(tempMessage);

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/messages/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId,
            ...messageData,
            type: messageData.type || 'text',
          }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        if (!data.success) throw new Error(data.message || 'Failed to send message');

        // Update temp message with real ID and status
        updateMessage(tempId, {
          id: data.data.id,
          status: 'sent',
          timestamp: data.data.timestamp || tempMessage.timestamp,
        });

        return data.data;
      } catch (err) {
        updateMessage(tempId, { status: 'failed' });
        setError(err.message || 'Failed to send message');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [chatId, addMessage, updateMessage]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    async (wa_id) => {
      try {
        const res = await fetch(`${API_BASE_URL}/messages/${wa_id}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data.success;
      } catch (err) {
        console.error('Error marking as read:', err);
        return false;
      }
    },
    []
  );

  // Search messages
  const searchMessages = useCallback(
    async (query) => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/messages/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Search failed');
        return data.data;
      } catch (err) {
        console.error('Error searching messages:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    error,
    addMessage,
    updateMessage,
    sendMessage,
    markAsRead,
    searchMessages,
    refreshMessages: loadMessages,
  };
};

export default useMessages;
