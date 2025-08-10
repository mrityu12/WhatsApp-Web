import React from 'react';
import './StatusIndicator.css';

const StatusIndicator = ({ 
  isOnline, 
  isTyping, 
  lastSeen, 
  size = 'small',
  showText = false 
}) => {
  
  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return '';
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeen.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusText = () => {
    if (isTyping) return 'typing...';
    if (isOnline) return 'online';
    if (lastSeen) return `last seen ${formatLastSeen(lastSeen)}`;
    return 'offline';
  };

  const getStatusClass = () => {
    if (isTyping) return 'typing';
    if (isOnline) return 'online';
    return 'offline';
  };

  if (showText) {
    return (
      <div className={`status-indicator-text ${getStatusClass()} ${size}`}>
        {isTyping && (
          <div className="typing-animation">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <span className="status-text">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className={`status-indicator ${getStatusClass()} ${size}`}>
      {isTyping ? (
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      ) : (
        <div className="status-dot"></div>
      )}
    </div>
  );
};

export default StatusIndicator;