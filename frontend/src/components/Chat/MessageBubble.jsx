import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, isLastMessage }) => {
  const formatTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const today = now.toDateString();
    const messageDay = messageDate.toDateString();

    if (today === messageDay) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
      if (yesterday === messageDay) {
        return `Yesterday ${messageDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`;
      } else {
        return messageDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return (
          <svg width="16" height="15" viewBox="0 0 16 15" className="message-status-icon sent">
            <path fill="currentColor" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      case 'delivered':
        return (
          <svg width="16" height="15" viewBox="0 0 16 15" className="message-status-icon delivered">
            <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.191-1.142a.365.365 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l1.709 1.671c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
            <path fill="currentColor" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      case 'read':
        return (
          <svg width="16" height="15" viewBox="0 0 16 15" className="message-status-icon read">
            <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-1.191-1.142a.365.365 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l1.709 1.671c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
            <path fill="currentColor" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const isMyMessage = message.sender === 'me';

  return (
    <div className={`message-bubble-container ${isMyMessage ? 'my-message' : 'other-message'}`}>
      <div className="message-bubble">
        {/* Message content */}
        <div className="message-content">
          {message.attachments && message.attachments.length > 0 && (
            <div className="message-attachments">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="message-attachment">
                  {attachment.type === 'image' && (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="attachment-image"
                      onLoad={(e) => {
                        e.target.style.opacity = '1';
                      }}
                    />
                  )}
                  {attachment.type === 'file' && (
                    <div className="attachment-file">
                      <div className="file-icon">📄</div>
                      <div className="file-info">
                        <span className="file-name">{attachment.name}</span>
                        <span className="file-size">{attachment.size}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {message.text && (
            <div className="message-text">
              {message.text}
            </div>
          )}
        </div>

        {/* Message metadata */}
        <div className="message-meta">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {isMyMessage && (
            <span className="message-status">
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>

      {/* Message tail */}
      <div className="message-tail"></div>
    </div>
  );
};

export default MessageBubble;