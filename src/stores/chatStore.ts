import { create } from 'zustand';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { ChatMessage } from '../types';

interface ChatState {
    messages: ChatMessage[];
    typingUsers: Map<string, string>; // participantId -> displayName
    isTyping: boolean;

    // Actions
    addMessage: (message: ChatMessage) => void;
    sendMessage: (content: string, meetingId: string) => Promise<void>;
    loadMessages: (meetingId: string) => Promise<void>;
    startTyping: (meetingId: string) => void;
    stopTyping: (meetingId: string) => void;
    setUserTyping: (participantId: string, displayName: string) => void;
    setUserStoppedTyping: (participantId: string) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    typingUsers: new Map(),
    isTyping: false,

    addMessage: (message) => {
        set(state => ({
            messages: [...state.messages, message],
        }));
    },

    sendMessage: async (content, meetingId) => {
        try {
            // Send via socket for real-time delivery
            socketService.emit('send-message', {
                meetingId,
                content,
                type: 'text',
            });

            // Also send via API for persistence
            await api.sendChatMessage(meetingId, content);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    loadMessages: async (meetingId) => {
        try {
            const { messages } = await api.getChatMessages(meetingId);
            set({ messages });
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    },

    startTyping: (meetingId) => {
        if (!get().isTyping) {
            set({ isTyping: true });
            socketService.emit('typing-start', { meetingId });
        }
    },

    stopTyping: (meetingId) => {
        if (get().isTyping) {
            set({ isTyping: false });
            socketService.emit('typing-stop', { meetingId });
        }
    },

    setUserTyping: (participantId, displayName) => {
        set(state => ({
            typingUsers: new Map(state.typingUsers).set(participantId, displayName),
        }));
    },

    setUserStoppedTyping: (participantId) => {
        set(state => {
            const newTypingUsers = new Map(state.typingUsers);
            newTypingUsers.delete(participantId);
            return { typingUsers: newTypingUsers };
        });
    },

    clearMessages: () => {
        set({
            messages: [],
            typingUsers: new Map(),
            isTyping: false,
        });
    },
}));
