import React from 'react';
import { clsx } from 'clsx';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isSystemMessage = message.type === 'system';

  if (isSystemMessage) {
    return (
      <div className="text-center py-2">
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={clsx('max-w-xs lg:max-w-md', isOwn ? 'order-1' : 'order-2')}>
        {!isOwn && (
          <div className="text-xs text-gray-500 mb-1 px-1">
            {message.senderName}
          </div>
        )}
        <div
          className={clsx(
            'px-4 py-2 rounded-lg text-sm',
            isOwn
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          )}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          <div
            className={clsx(
              'text-xs mt-1',
              isOwn ? 'text-blue-200' : 'text-gray-500'
            )}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};