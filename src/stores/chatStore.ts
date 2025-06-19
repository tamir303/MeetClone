import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ChatState {
  messages: ChatMessage[];
  unreadCount: number;
  isOpen: boolean;
  isTyping: boolean;
  typingUsers: string[];
}

interface ChatActions {
  sendMessage: (content: string, senderId: string, senderName: string) => void;
  addMessage: (message: ChatMessage) => void;
  markAsRead: () => void;
  togglePanel: () => void;
  setTyping: (isTyping: boolean) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState & ChatActions>()(
  devtools(
    (set, get) => ({
      // State
      messages: [],
      unreadCount: 0,
      isOpen: false,
      isTyping: false,
      typingUsers: [],

      // Actions
      sendMessage: (content, senderId, senderName) => {
        const message: ChatMessage = {
          id: uuidv4(),
          senderId,
          senderName,
          content,
          timestamp: new Date().toISOString(),
          type: 'text'
        };
        
        set(state => ({
          messages: [...state.messages, message]
        }));
      },

      addMessage: (message) => {
        const { isOpen } = get();
        set(state => ({
          messages: [...state.messages, message],
          unreadCount: isOpen ? state.unreadCount : state.unreadCount + 1
        }));
      },

      markAsRead: () => set({ unreadCount: 0 }),

      togglePanel: () => {
        set(state => {
          const newIsOpen = !state.isOpen;
          return {
            isOpen: newIsOpen,
            unreadCount: newIsOpen ? 0 : state.unreadCount
          };
        });
      },

      setTyping: (isTyping) => set({ isTyping }),

      addTypingUser: (userId) => {
        set(state => ({
          typingUsers: state.typingUsers.includes(userId)
            ? state.typingUsers
            : [...state.typingUsers, userId]
        }));
      },

      removeTypingUser: (userId) => {
        set(state => ({
          typingUsers: state.typingUsers.filter(id => id !== userId)
        }));
      },

      clearChat: () => {
        set({
          messages: [],
          unreadCount: 0,
          typingUsers: []
        });
      }
    }),
    { name: 'chat-store' }
  )
);