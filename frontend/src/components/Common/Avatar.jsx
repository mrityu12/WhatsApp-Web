import React from 'react';
import './Avatar.css';

const Avatar = ({ 
  name, 
  initials, 
  imageUrl, 
  isOnline, 
  size = 'medium',
  showOnlineStatus = true 
}) => {
  
  const getInitials = (name, fallbackInitials) => {
    if (fallbackInitials) return fallbackInitials;
    if (!name) return '?';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return '#8696a0';
    
    const colors = [
      '#e17076', '#7bc862', '#65aadd', '#a695e7',
      '#ee7aae', '#6ec9cb', '#faa774', '#f48fb1',
      '#8e24aa', '#7986cb', '#26a69a', '#ffa726',
      '#29b6f6', '#26c6da', '#66bb6a', '#ab47bc'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium', 
    large: 'avatar-large',
    xlarge: 'avatar-xlarge'
  };

  return (
    <div className={`avatar-container ${sizeClasses[size]}`}>
      <div 
        className="avatar"
        style={{
          backgroundColor: imageUrl ? 'transparent' : getAvatarColor(name || initials)
        }}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name || 'Avatar'} 
            className="avatar-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="avatar-initials"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          {getInitials(name, initials)}
        </div>
      </div>
      
      {showOnlineStatus && isOnline !== undefined && (
        <div className={`online-indicator ${isOnline ? 'online' : 'offline'}`}></div>
      )}
    </div>
  );
};

export default Avatar;