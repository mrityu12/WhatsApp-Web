// src/components/Header/AppHeader.jsx
import React, { useState } from 'react';
import {
  MoreVertical,
  Users,
  MessageCircle,
  Edit3,
  UserPlus,
  Star,
  Archive,
  Settings
} from 'lucide-react';
import Avatar from '../Common/Avatar';

const AppHeader = () => {
  const [showMainMenu, setShowMainMenu] = useState(false);

  return (
    <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Avatar user={{ name: 'You', avatar: '😊' }} size="md" />
        <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
          WhatsApp
        </h1>
      </div>

      <div className="flex items-center space-x-1">
        <button
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Communities"
        >
          <Users size={20} className="text-gray-600" />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="Status"
        >
          <MessageCircle size={20} className="text-gray-600" />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          title="New chat"
        >
          <Edit3 size={20} className="text-gray-600" />
        </button>

        <div className="relative">
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            onClick={() => setShowMainMenu(!showMainMenu)}
          >
            <MoreVertical size={20} className="text-gray-600" />
          </button>

          {showMainMenu && (
            <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg py-2 w-48 z-20 border">
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                <UserPlus size={16} />
                <span>New group</span>
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                <Star size={16} />
                <span>Starred messages</span>
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                <Archive size={16} />
                <span>Archived chats</span>
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2">
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
