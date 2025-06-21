import { useEffect, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import { socketService } from '../services/socket';

export const useChat = (meetingId: string) => {
    const {
        messages,
        typingUsers,
        isTyping,
        addMessage,
        sendMessage,
        loadMessages,
        startTyping,
        stopTyping,
        setUserTyping,
        setUserStoppedTyping,
    } = useChatStore();

    const handleSendMessage = useCallback(async (content: string) => {
        try {
            await sendMessage(content, meetingId);
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }, [meetingId, sendMessage]);

    const handleStartTyping = useCallback(() => {
        startTyping(meetingId);
    }, [meetingId, startTyping]);

    const handleStopTyping = useCallback(() => {
        stopTyping(meetingId);
    }, [meetingId, stopTyping]);

    useEffect(() => {
        loadMessages(meetingId);

        const handleMessageReceived = ({ message }: { message: any }) => {
            addMessage(message);
        };

        const handleUserTyping = ({ participantId, displayName }: { participantId: string; displayName: string }) => {
            setUserTyping(participantId, displayName);
        };

        const handleUserStoppedTyping = ({ participantId }: { participantId: string }) => {
            setUserStoppedTyping(participantId);
        };

        socketService.on('message-received', handleMessageReceived);
        socketService.on('user-typing', handleUserTyping);
        socketService.on('user-stopped-typing', handleUserStoppedTyping);

        return () => {
            socketService.off('message-received', handleMessageReceived);
            socketService.off('user-typing', handleUserTyping);
            socketService.off('user-stopped-typing', handleUserStoppedTyping);
        };
    }, [meetingId, loadMessages, addMessage, setUserTyping, setUserStoppedTyping]);

    return {
        messages,
        typingUsers,
        isTyping,
        sendMessage: handleSendMessage,
        startTyping: handleStartTyping,
        stopTyping: handleStopTyping,
    };
};