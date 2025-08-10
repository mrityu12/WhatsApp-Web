import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Avatar from '../Common/Avatar';
// Removed unused StatusIndicator import
import './ChatWindow.css';

const ChatWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey, how are you doing?",
      sender: "other",
      timestamp: new Date(Date.now() - 3600000),
      status: "read"
    },
    {
      id: 2,
      text: "I'm doing great! Thanks for asking. How about you?",
      sender: "me",
      timestamp: new Date(Date.now() - 3500000),
      status: "read"
    },
    {
      id: 3,
      text: "Working on some new projects. Really excited about them!",
      sender: "me",
      timestamp: new Date(Date.now() - 3400000),
      status: "read"
    },
    {
      id: 4,
      text: "That sounds amazing! Would love to hear more about it sometime.",
      sender: "other",
      timestamp: new Date(Date.now() - 1800000),
      status: "read"
    },
    {
      id: 5,
      text: "Sure! Let's catch up soon. Maybe over coffee?",
      sender: "me",
      timestamp: new Date(Date.now() - 900000),
      status: "delivered"
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (messageText, attachments = []) => {
    if (!messageText.trim() && attachments.length === 0) return;

    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: "me",
      timestamp: new Date(),
      status: "sent",
      attachments
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
        )
      );
    }, 1000);

    // Simulate typing response
    if (messageText.trim()) {
      setTimeout(() => {
        setIsTyping(true);
      }, 2000);

      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          "That sounds great!",
          "I agree!",
          "Thanks for sharing that with me.",
          "Interesting perspective!",
          "Let me think about that.",
          "Good point!"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseMessage = {
          id: Date.now() + 1,
          text: randomResponse,
          sender: "other",
          timestamp: new Date(),
          status: "read"
        };
        
        setMessages(prev => [...prev, responseMessage]);
      }, 4000);
    }
  };

  const formatLastSeen = (isOnline) => {
    if (isOnline) return "online";
    return "last seen today at 2:30 PM";
  };

  if (!selectedChat) {
    return (
      <div className="chat-window-empty">
        <div className="empty-state">
          <div className="whatsapp-logo">
            <svg width="320" height="320" viewBox="0 0 320 320">
              <defs>
                <linearGradient id="whatsapp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#20b038" />
                  <stop offset="100%" stopColor="#60d669" />
                </linearGradient>
              </defs>
              <circle cx="160" cy="160" r="150" fill="url(#whatsapp-gradient)" />
              <path d="M160 50c-60.751 0-110 49.249-110 110 0 19.49 5.197 37.731 14.232 53.462L50 270l58.209-14.071C123.491 264.434 141.244 270 160 270c60.751 0 110-49.249 110-110S220.751 50 160 50z" fill="#ffffff" />
              <path d="M213.333 181.667c-2.5-1.25-14.792-7.292-17.084-8.125-2.291-.833-3.958-.833-5.624 1.25-1.667 2.083-6.459 8.125-7.917 9.791-1.459 1.667-2.917 1.875-5.417.625-2.5-1.25-10.542-3.875-20.083-12.375-7.417-6.583-12.417-14.708-13.875-17.208-1.458-2.5-.156-3.854 1.094-5.104 1.125-1.125 2.5-2.917 3.75-4.375 1.25-1.458 1.667-2.5 2.5-4.167.833-1.667.416-3.125-.209-4.375-.625-1.25-5.625-13.542-7.708-18.542-2.083-4.792-4.167-4.167-5.625-4.167-1.458 0-3.125-.208-4.791-.208-1.667 0-4.375.625-6.667 3.125-2.291 2.5-8.75 8.542-8.75 20.833s8.959 24.167 10.209 25.833c1.25 1.667 17.708 27.083 42.916 38 5.209 2.25 9.375 3.542 12.584 4.542 5.458 1.666 10.416 1.458 14.375.875 4.375-.625 14.792-6.042 16.875-11.875 2.083-5.833 2.083-10.833 1.458-11.875-.625-1.041-2.291-1.666-4.791-2.916z" fill="#20b038" />
            </svg>
          </div>
          <h2>WhatsApp Web</h2>
          <p>Send and receive messages without keeping your phone online.</p>
          <p>Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <Avatar 
            name={selectedChat.name}
            initials={selectedChat.avatar}
            isOnline={selectedChat.isOnline}
            size="medium"
          />
          <div className="chat-header-details">
            <h3 className="chat-header-name">{selectedChat.name}</h3>
            <p className="chat-header-status">
              {isTyping ? (
                <span className="typing-status">typing...</span>
              ) : (
                formatLastSeen(selectedChat.isOnline)
              )}
            </p>
          </div>
        </div>
        
        <div className="chat-header-actions">
          <button className="header-action-btn" title="Video call">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </button>
          <button className="header-action-btn" title="Voice call">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </button>
          <button className="header-action-btn" title="Search">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5.5 12.49 5.5 10.5S7.01 7 9.5 7 13.5 8.51 13.5 10.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button className="header-action-btn" title="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLastMessage={index === messages.length - 1}
            />
          ))}
          
          {isTyping && (
            <div className="typing-indicator-container">
              <div className="typing-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;