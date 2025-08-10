import React, { useState, useEffect } from 'react';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import './styles/globals.css';

function App() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  useEffect(() => {
    // Simulate connection status
    const connectionTimer = setTimeout(() => {
      setShowConnectionStatus(true);
      setIsConnected(false);
    }, 2000);

    // Simulate reconnection
    const reconnectionTimer = setTimeout(() => {
      setIsConnected(true);
      setTimeout(() => {
        setShowConnectionStatus(false);
      }, 3000);
    }, 8000);

    return () => {
      clearTimeout(connectionTimer);
      clearTimeout(reconnectionTimer);
    };
  }, []);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleCloseConnectionStatus = () => {
    setShowConnectionStatus(false);
  };

  return (
    <div className="app-container">
      {/* Connection Status Banner */}
      {showConnectionStatus && (
        <div className={`${isConnected ? 'connection-success' : 'connection-error'}`}>
          <span>
            {isConnected 
              ? 'Connected successfully' 
              : 'Failed to connect to server'
            }
          </span>
          <button 
            className="close-btn"
            onClick={handleCloseConnectionStatus}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="main-container">
        {/* Sidebar with Chat List */}
        <div className="sidebar">
          <ChatList 
            onChatSelect={handleChatSelect}
            selectedChatId={selectedChat?.id}
          />
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          <ChatWindow selectedChat={selectedChat} />
        </div>
      </div>
    </div>
  );
}

export default App;