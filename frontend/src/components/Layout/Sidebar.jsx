import React, { useState, useRef, useEffect } from 'react';
import Avatar from '../Common/Avatar';
// Removed unused Loader import
import { SkeletonLoader } from '../Common/Loader';
import './Sidebar.css';

const Sidebar = ({ 
  isOpen = true,
  onToggle,
  chats = [],
  currentChatId,
  onChatSelect,
  onNewChat,
  onSettings,
  onProfile,
  loading = false,
  searchQuery = '',
  onSearchChange,
  user = null,
  onArchiveToggle,
  showArchived = false
}) => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'status', 'calls'
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onSearchChange?.('');
    searchInputRef.current?.focus();
  };

  const filteredChats = chats.filter(chat => {
    if (!localSearchQuery) return true;
    return chat.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
           (chat.lastMessage?.content || '').toLowerCase().includes(localSearchQuery.toLowerCase());
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const { content, type, isOwn } = chat.lastMessage;
    // Removed unused 'sender' variable
    const prefix = isOwn ? 'You: ' : '';
    
    switch (type) {
      case 'image':
        return `${prefix}📷 Photo`;
      case 'video':
        return `${prefix}🎥 Video`;
      case 'audio':
        return `${prefix}🎵 Audio`;
      case 'document':
        return `${prefix}📄 Document`;
      case 'location':
        return `${prefix}📍 Location`;
      case 'contact':
        return `${prefix}👤 Contact`;
      default:
        return `${prefix}${content}`;
    }
  };

  const profileMenuItems = [
    { label: 'New group', icon: '👥', action: () => console.log('New group') },
    { label: 'New contact', icon: '👤', action: () => console.log('New contact') },
    { label: 'Settings', icon: '⚙️', action: onSettings },
    { label: 'Profile', icon: '👤', action: onProfile },
    { label: 'Log out', icon: '🚪', action: () => console.log('Log out') },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-user">
          {user && (
            <div className="user-info" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
              <Avatar 
                src={user.avatar}
                name={user.name}
                size="medium"
                isOnline={user.isOnline}
              />
              <div className="user-details">
                <h3 className="user-name">{user.name}</h3>
                <p className="user-status">{user.status || 'Available'}</p>
              </div>
              <div className="dropdown-arrow">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                </svg>
              </div>
            </div>
          )}

          <div className="sidebar-actions">
            <button className="action-btn" onClick={onNewChat} title="New chat">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            
            <div className="dropdown-container" ref={dropdownRef}>
              <button 
                className="action-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                title="Menu"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/>
                </svg>
              </button>
              
              {showProfileDropdown && (
                <div className="dropdown-menu">
                  {profileMenuItems.map((item, index) => (
                    <div 
                      key={index}
                      className="dropdown-item"
                      onClick={() => {
                        item.action?.();
                        setShowProfileDropdown(false);
                      }}
                    >
                      <span className="dropdown-icon">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <div className="search-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or start new chat"
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {localSearchQuery && (
              <button 
                className="search-clear"
                onClick={handleClearSearch}
                title="Clear search"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="filter-pills">
          <button 
            className={`pill ${activeTab === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            All
          </button>
          <button 
            className={`pill ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread
          </button>
          <button 
            className={`pill ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="sidebar-content">
        {/* Archive Toggle */}
        {!showArchived && chats.some(chat => chat.isArchived) && (
          <div className="archive-section" onClick={onArchiveToggle}>
            <div className="archive-icon">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
              </svg>
            </div>
            <div className="archive-info">
              <span className="archive-label">Archived</span>
              <span className="archive-count">
                {chats.filter(chat => chat.isArchived).length} chats
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonLoader count={8} />
        ) : (
          <div className="chat-list">
            {filteredChats.length === 0 ? (
              <div className="empty-state">
                {localSearchQuery ? (
                  <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <h3>No chats found</h3>
                    <p>Try a different search term</p>
                  </div>
                ) : (
                  <div className="no-chats">
                    <div className="no-chats-icon">💬</div>
                    <h3>No chats yet</h3>
                    <p>Start a new conversation</p>
                    <button className="start-chat-btn" onClick={onNewChat}>
                      Start chatting
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${currentChatId === chat.id ? 'active' : ''} ${chat.isPinned ? 'pinned' : ''}`}
                  onClick={() => onChatSelect(chat)}
                >
                  <div className="chat-avatar">
                    <Avatar 
                      src={chat.avatar}
                      name={chat.name}
                      size="large"
                      isOnline={chat.isOnline}
                    />
                    {chat.isPinned && (
                      <div className="pin-indicator">
                        <svg viewBox="0 0 24 24" width="12" height="12">
                          <path fill="currentColor" d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="chat-info">
                    <div className="chat-header">
                      <h4 className="chat-name">{chat.name}</h4>
                      <div className="chat-meta">
                        <span className="chat-time">
                          {formatTime(chat.lastMessage?.timestamp)}
                        </span>
                        {chat.isMuted && (
                          <div className="mute-icon">
                            <svg viewBox="0 0 24 24" width="14" height="14">
                              <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="chat-preview">
                      <p className="last-message">
                        {chat.isTyping ? (
                          <span className="typing-indicator">
                            <span className="typing-text">typing</span>
                            <span className="typing-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                            </span>
                          </span>
                        ) : (
                          getLastMessagePreview(chat)
                        )}
                      </p>
                      
                      <div className="chat-badges">
                        {chat.unreadCount > 0 && (
                          <div className={`unread-badge ${chat.isMuted ? 'muted' : ''}`}>
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </div>
                        )}
                        
                        {chat.lastMessage?.status && (
                          <div className={`message-status ${chat.lastMessage.status}`}>
                            <svg viewBox="0 0 24 24" width="12" height="12">
                              {chat.lastMessage.status === 'sent' && (
                                <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                              )}
                              {chat.lastMessage.status === 'delivered' && (
                                <path fill="currentColor" d="M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z"/>
                              )}
                              {chat.lastMessage.status === 'read' && (
                                <path fill="currentColor" d="M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z"/>
                              )}
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;