import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { socketService } from '../services/socket';
import { api } from '../services/api';
import { ChatMessage } from '../types';

interface ChatState {
    messages: ChatMessage[];
    typingUsers: Map<string, string>; // participantId -> displayName
    isTyping: boolean;
    isOpen: boolean;
    unreadCount: number;

    // Panel management
    togglePanel: () => void;
    openPanel: () => void;
    closePanel: () => void;
    markAsRead: () => void;

    // Message actions
    addMessage: (message: ChatMessage) => void;
    sendMessage: (content: string, senderId: string, senderName: string) => Promise<void>;
    loadMessages: (meetingId: string) => Promise<void>;

    // Typing indicators
    startTyping: (meetingId: string) => void;
    stopTyping: (meetingId: string) => void;
    setUserTyping: (participantId: string, displayName: string) => void;
    setUserStoppedTyping: (participantId: string) => void;

    clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
    devtools(
        (set, get) => ({
            messages: [],
            typingUsers: new Map(),
            isTyping: false,
            isOpen: false,
            unreadCount: 0,

            togglePanel: () => {
                set(state => {
                    const newIsOpen = !state.isOpen;
                    return {
                        isOpen: newIsOpen,
                        unreadCount: newIsOpen ? 0 : state.unreadCount
                    };
                });
            },

            openPanel: () => {
                set({ isOpen: true, unreadCount: 0 });
            },

            closePanel: () => {
                set({ isOpen: false });
            },

            markAsRead: () => {
                set({ unreadCount: 0 });
            },

            addMessage: (message) => {
                set(state => ({
                    messages: [...state.messages, message],
                    unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
                }));
            },

            sendMessage: async (content, senderId, senderName) => {
                try {
                    // Create temporary message
                    const tempMessage: ChatMessage = {
                        id: Date.now().toString(),
                        senderId,
                        senderName,
                        content,
                        timestamp: new Date().toISOString(),
                        type: 'text',
                    };

                    // Add to local state immediately
                    get().addMessage(tempMessage);

                    // Send via socket for real-time delivery
                    const meetingId = window.location.pathname.split('/').pop();
                    if (meetingId) {
                        socketService.emit('send-message', {
                            meetingId,
                            content,
                            type: 'text',
                        });

                        // Also send via API for persistence
                        await api.sendChatMessage(meetingId, content);
                    }
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
                    unreadCount: 0,
                });
            },
        }),
        { name: 'chat-store' }
    )
);