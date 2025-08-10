import React from 'react';
import './Loader.css';

const Loader = ({ 
  size = 'medium',        // 'small' | 'medium' | 'large'
  color = '#25D366',      // spinner border-top color
  text = '',              // optional text below spinner
  overlay = false,        // if true, covers full screen with semi-transparent overlay
  className = ''          // additional classNames
}) => {
  const sizeClasses = {
    small: 'loader-small',
    medium: 'loader-medium',
    large: 'loader-large'
  };

  const loaderContent = (
    <div className={`loader-container ${className}`}>
      <div 
        className={`loader-spinner ${sizeClasses[size]}`}
        style={{ borderTopColor: color }}
      >
        <div className="loader-inner"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loader-overlay">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

// WhatsApp-style dots loader for chat typing indicators etc.
export const DotsLoader = ({ className = '' }) => (
  <div className={`dots-loader ${className}`}>
    <div className="dot dot-1"></div>
    <div className="dot dot-2"></div>
    <div className="dot dot-3"></div>
  </div>
);

// Skeleton loader for chat list items or similar UI
export const SkeletonLoader = ({ count = 1, className = '' }) => (
  <div className={`skeleton-container ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="skeleton-item">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-content">
          <div className="skeleton-name"></div>
          <div className="skeleton-message"></div>
        </div>
        <div className="skeleton-time"></div>
      </div>
    ))}
  </div>
);

// Message sending loader bubble with dots inside
export const MessageLoader = () => (
  <div className="message-loader">
    <div className="message-loader-bubble">
      <DotsLoader />
    </div>
  </div>
);

export default Loader;
