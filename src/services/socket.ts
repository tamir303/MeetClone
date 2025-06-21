import { io, Socket } from 'socket.io-client';
import { env } from '../config/env';
import type { Participant, ChatMessage } from '../types';

export interface SocketEvents {
    'join-meeting': (data: { meetingId: string; participantId: string; token: string }) => void;
    'leave-meeting': (data: { meetingId: string; participantId: string }) => void;
    'offer': (data: { meetingId: string; targetParticipantId: string; offer: RTCSessionDescriptionInit }) => void;
    'answer': (data: { meetingId: string; targetParticipantId: string; answer: RTCSessionDescriptionInit }) => void;
    'ice-candidate': (data: { meetingId: string; targetParticipantId: string; candidate: RTCIceCandidateInit }) => void;
    'send-message': (data: { meetingId: string; content: string; type: 'text' }) => void;
    'typing-start': (data: { meetingId: string }) => void;
    'typing-stop': (data: { meetingId: string }) => void;
    'audio-level': (data: { level: number }) => void;
}

export interface SocketListeners {
    'participant-joined': (data: { participant: Participant }) => void;
    'participant-left': (data: { participantId: string }) => void;
    'participant-updated': (data: { participantId: string; updates: Partial<Participant> }) => void;
    'offer-received': (data: { fromParticipantId: string; offer: RTCSessionDescriptionInit }) => void;
    'answer-received': (data: { fromParticipantId: string; answer: RTCSessionDescriptionInit }) => void;
    'ice-candidate-received': (data: { fromParticipantId: string; candidate: RTCIceCandidateInit }) => void;
    'message-received': (data: { message: ChatMessage }) => void;
    'user-typing': (data: { participantId: string; displayName: string }) => void;
    'user-stopped-typing': (data: { participantId: string }) => void;
    'speaking-changed': (data: { participantId: string; isSpeaking: boolean }) => void;
    'connect': () => void;
    'disconnect': () => void;
    'error': (error: Error) => void;
}

export class SocketService {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    connect(token: string): Promise<Socket> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve(this.socket);
                return;
            }

            this.socket = io(env.WEBSOCKET_URL, {
                auth: { token },
                transports: ['websocket'],
                timeout: 10000,
            });

            this.socket.on('connect', () => {
                console.log('Socket connected');
                this.reconnectAttempts = 0;
                resolve(this.socket!);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                if (reason === 'io server disconnect') {
                    return;
                }
                this.handleReconnect();
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                reject(error);
            });
        });
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting attempt ${this.reconnectAttempts}...`);

            setTimeout(() => {
                this.socket?.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    emit<K extends keyof SocketEvents>(event: K, data: Parameters<SocketEvents[K]>[0]) {
        if (!this.socket?.connected) {
            console.warn('Socket not connected, cannot emit event:', event);
            return;
        }
        this.socket.emit(event, data);
    }

    on<K extends keyof SocketListeners>(event: K, listener: SocketListeners[K]) {
        this.socket?.on(event as string, listener as (...args: any[]) => void);
    }

    off<K extends keyof SocketListeners>(event: K, listener?: SocketListeners[K]) {
        this.socket?.off(event as string, listener as (...args: any[]) => void);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    get connected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();