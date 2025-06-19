import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Send, X, Smile } from 'lucide-react';
import { Button } from '../UI/Button';
import { ChatMessage } from './ChatMessage';
import { useChatStore } from '../../stores/chatStore';
import { useParticipantsStore } from '../../stores/participantsStore';

export const ChatPanel: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isOpen, togglePanel, sendMessage, markAsRead } = useChatStore();
  const { localParticipant } = useParticipantsStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      markAsRead();
      scrollToBottom();
    }
  }, [isOpen, messages, markAsRead]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && localParticipant) {
      sendMessage(message.trim(), localParticipant.id, localParticipant.displayName);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePanel}
          className="w-8 h-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-lg mb-2">No messages yet</div>
            <div className="text-sm">Start the conversation!</div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === localParticipant?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <span className="text-xs text-gray-500">
                {message.length}/500
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!message.trim()}
            className="mb-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};