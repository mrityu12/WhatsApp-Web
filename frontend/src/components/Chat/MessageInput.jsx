import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👻'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 100; // Max height in pixels
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        name: file.name,
        size: formatFileSize(file.size),
        type: isImage ? 'image' : 'file',
        url: isImage ? URL.createObjectURL(file) : null,
        file: file
      };
    });
    
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = ''; // Reset file input
  };

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      // Revoke object URL to prevent memory leaks
      if (newAttachments[index].url) {
        URL.revokeObjectURL(newAttachments[index].url);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.substring(0, start) + emoji + message.substring(end);
    setMessage(newMessage);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Voice recording logic would go here
      setTimeout(() => {
        setIsRecording(false);
        // Simulate voice message
        onSendMessage('🎤 Voice message', []);
      }, 2000);
    }
  };

  return (
    <div className="message-input-container">
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="attachment-preview">
          {attachments.map((attachment, index) => (
            <div key={index} className="attachment-item">
              {attachment.type === 'image' ? (
                <div className="attachment-image-preview">
                  <img src={attachment.url} alt={attachment.name} />
                  <button
                    className="remove-attachment"
                    onClick={() => removeAttachment(index)}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="attachment-file-preview">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <span className="file-name">{attachment.name}</span>
                    <span className="file-size">{attachment.size}</span>
                  </div>
                  <button
                    className="remove-attachment"
                    onClick={() => removeAttachment(index)}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker" ref={emojiPickerRef}>
          <div className="emoji-grid">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-button"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <form className="message-input-form" onSubmit={handleSubmit}>
        <div className="input-actions-left">
          <button
            type="button"
            className="input-action-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.12.23-2.18.65-3.15.42-.97 1.02-1.83 1.78-2.59.76-.76 1.62-1.36 2.59-1.78C9.82 4.23 10.88 4 12 4s2.18.23 3.15.65c.97.42 1.83 1.02 2.59 1.78.76.76 1.36 1.62 1.78 2.59.42.97.65 2.03.65 3.15 0 4.41-3.59 8-8 8z"/>
              <path fill="currentColor" d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="input-action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          </button>
        </div>

        <div className="input-field-container">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            className="message-textarea"
            rows={1}
          />
        </div>

        <div className="input-actions-right">
          {message.trim() || attachments.length > 0 ? (
            <button type="submit" className="send-button" title="Send">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              onClick={handleVoiceRecord}
              title={isRecording ? 'Recording...' : 'Voice message'}
            >
              {isRecording ? (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M6 6h12v12H6z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;