import React, { useState, useEffect } from 'react';
import Avatar from '../Common/Avatar';
import StatusIndicator from './StatusIndicator';
import './ChatList.css';

const ChatList = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "John Doe",
      lastMessage: "Hey, how are you doing?",
      time: "12:30 PM",
      unreadCount: 2,
      avatar: "JD",
      isOnline: true,
      isTyping: false
    },
    {
      id: 2,
      name: "Sarah Wilson",
      lastMessage: "Thanks for the help!",
      time: "11:45 AM",
      unreadCount: 0,
      avatar: "SW",
      isOnline: false,
      isTyping: false
    },
    {
      id: 3,
      name: "Team Group",
      lastMessage: "Alice: Meeting at 3 PM",
      time: "10:20 AM",
      unreadCount: 5,
      avatar: "TG",
      isOnline: true,
      isTyping: true,
      isGroup: true
    },
    {
      id: 4,
      name: "Mom",
      lastMessage: "Don't forget dinner tonight",
      time: "Yesterday",
      unreadCount: 1,
      avatar: "M",
      isOnline: true,
      isTyping: false
    },
    {
      id: 5,
      name: "Work Chat",
      lastMessage: "Project deadline extended",
      time: "Yesterday",
      unreadCount: 0,
      avatar: "WC",
      isOnline: false,
      isTyping: false,
      isGroup: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats);

  useEffect(() => {
    const filtered = chats.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchTerm, chats]);

  const handleChatClick = (chat) => {
    onChatSelect(chat);
    // Mark as read
    setChats(prevChats =>
      prevChats.map(c =>
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const formatTime = (timeStr) => {
    // Removed unused variables 'today' and 'yesterday'
    if (timeStr.includes('PM') || timeStr.includes('AM')) {
      return timeStr;
    } else if (timeStr === 'Yesterday') {
      return 'Yesterday';
    }
    return timeStr;
  };

  return (
    <div className="chat-list">
      <div className="search-container">
        <div className="search-wrapper">
          <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5.5 12.49 5.5 10.5S7.01 7 9.5 7 13.5 8.51 13.5 10.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filter-tabs">
        <button className="filter-tab active">All</button>
        <button className="filter-tab">Unread</button>
        <button className="filter-tab">Groups</button>
      </div>

      <div className="chat-list-container">
        {filteredChats.length === 0 ? (
          <div className="no-chats">
            <div className="no-chats-icon">💬</div>
            <p>No chats yet</p>
            <span>Start a new conversation</span>
            <button className="start-chatting-btn">Start chatting</button>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChatId === chat.id ? 'selected' : ''}`}
              onClick={() => handleChatClick(chat)}
            >
              <div className="chat-avatar-container">
                <Avatar 
                  name={chat.name} 
                  initials={chat.avatar}
                  isOnline={chat.isOnline}
                  size="large"
                />
              </div>
              
              <div className="chat-info">
                <div className="chat-header">
                  <h3 className="chat-name">{chat.name}</h3>
                  <span className="chat-time">{formatTime(chat.time)}</span>
                </div>
                
                <div className="chat-preview">
                  <div className="last-message">
                    {chat.isTyping ? (
                      <span className="typing-indicator">
                        <span className="typing-text">typing</span>
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </span>
                    ) : (
                      <span className={chat.unreadCount > 0 ? 'unread' : ''}>
                        {chat.lastMessage}
                      </span>
                    )}
                  </div>
                  
                  {chat.unreadCount > 0 && !chat.isTyping && (
                    <div className="unread-count">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </div>
                  )}
                  
                  <StatusIndicator 
                    isOnline={chat.isOnline} 
                    isTyping={chat.isTyping}
                    size="small"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;