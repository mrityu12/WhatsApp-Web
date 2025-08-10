// src/components/Layout/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatWindow from '../Chat/ChatWindow';
import ChatList from '../Chat/ChatList';

const MainLayout = ({
  isConnected,
  messages: propMessages,
  sendMessage: propSendMessage,
  currentChat: propCurrentChat,
  onChatSelect: propOnChatSelect
}) => {
  const [activeChat, setActiveChat] = useState(propCurrentChat || null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [chats, setChats] = useState([
    {
      id: 1,
      name: 'Alice Johnson',
      lastMessage: 'Hey! How are you doing?',
      time: '10:30 AM',
      unread: 2,
      avatar: '👩‍💼',
      online: true,
      phone: '+1 234 567 8901',
      about: 'Available',
      messages: [
        { id: 1, text: 'Hey! How are you doing?', sender: 'Alice Johnson', time: '10:30 AM', status: 'read', type: 'text' },
        { id: 2, text: 'I\'m doing great! Thanks for asking', sender: 'me', time: '10:32 AM', status: 'read', type: 'text' }
      ]
    },
    {
      id: 2,
      name: 'Work Team',
      lastMessage: 'John: Meeting at 3 PM today',
      time: '9:45 AM',
      unread: 5,
      avatar: '👥',
      isGroup: true,
      participants: 12,
      messages: [
        { id: 1, text: 'Meeting at 3 PM today', sender: 'John', time: '9:45 AM', status: 'delivered', type: 'text' },
        { id: 2, text: 'Got it, I\'ll be there', sender: 'me', time: '9:47 AM', status: 'read', type: 'text' }
      ]
    }
  ]);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sending messages (internal state or via props)
  const handleSendMessage = (messageData) => {
    if (propSendMessage) {
      // Use parent handler if provided
      propSendMessage(messageData);
      return;
    }

    if (activeChat) {
      const newMessage = {
        id: Date.now(),
        text: messageData.text,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        type: messageData.type || 'text',
        replyTo: messageData.replyTo
      };

      setChats(prev =>
        prev.map(chat => {
          if (chat.id === activeChat.id) {
            const updatedChat = {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: messageData.text,
              time: 'now'
            };
            setActiveChat(updatedChat);
            return updatedChat;
          }
          return chat;
        })
      );
    }
  };

  // Handle chat selection (internal state or via props)
  const handleChatSelect = (chat) => {
    if (propOnChatSelect) {
      propOnChatSelect(chat);
    } else {
      setActiveChat(chat);
    }
  };

  const currentMessages = propMessages || activeChat?.messages || [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isMobileView && activeChat ? 'hidden' : 'flex'} w-full md:w-1/3 bg-white border-r border-gray-300 flex-col`}>
        <Header isConnected={isConnected} />
        <Sidebar currentChat={activeChat} onChatSelect={handleChatSelect} />
        <ChatList chats={chats} activeChat={activeChat} onSelectChat={handleChatSelect} />
      </div>

      {/* Main Chat Area */}
      <div className={`${isMobileView && !activeChat ? 'hidden' : 'flex'} flex-1 flex-col`}>
        <ChatWindow
          messages={currentMessages}
          sendMessage={handleSendMessage}
          currentChat={activeChat}
          isConnected={isConnected}
          onBackToChats={() => setActiveChat(null)}
          isMobileView={isMobileView}
        />
      </div>
    </div>
  );
};

export default MainLayout;
