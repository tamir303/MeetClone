import { env } from '../config/env';
import {
    ChatMessage,
    CreateMeetingRequest,
    JoinMeetingRequest,
    JoinMeetingResponse,
    Meeting, MeetingSettings,
    Participant
} from "../types";

class APIError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'APIError';
    }
}

export class MeetingAPI {
    private baseURL = env.API_BASE_URL;

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('meetingToken');

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new APIError(response.status, errorData.message || 'Request failed');
            }

            return response.json();
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError(0, 'Network error');
        }
    }

    async createMeeting(data: CreateMeetingRequest): Promise<Meeting> {
        return this.request<Meeting>('/meetings', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMeeting(meetingId: string): Promise<Meeting> {
        return this.request<Meeting>(`/meetings/${meetingId}`);
    }

    async joinMeeting(meetingId: string, data: JoinMeetingRequest): Promise<JoinMeetingResponse> {
        const response = await this.request<JoinMeetingResponse>(`/meetings/${meetingId}/join`, {
            method: 'POST',
            body: JSON.stringify(data),
        });

        // Store token for subsequent requests
        localStorage.setItem('meetingToken', response.token);
        localStorage.setItem('participantId', response.participantId);

        return response;
    }

    async leaveMeeting(meetingId: string): Promise<void> {
        const participantId = localStorage.getItem('participantId');
        if (!participantId) return;

        await this.request(`/meetings/${meetingId}/leave`, {
            method: 'POST',
            body: JSON.stringify({ participantId }),
        });

        // Clear stored data
        localStorage.removeItem('meetingToken');
        localStorage.removeItem('participantId');
    }

    async updateParticipantStatus(
        meetingId: string,
        participantId: string,
        status: Partial<Pick<Participant, 'isAudioEnabled' | 'isVideoEnabled' | 'isScreenSharing'>>
    ): Promise<void> {
        return this.request(`/meetings/${meetingId}/participants/${participantId}`, {
            method: 'PUT',
            body: JSON.stringify(status),
        });
    }

    async removeParticipant(meetingId: string, participantId: string): Promise<void> {
        return this.request(`/meetings/${meetingId}/participants/${participantId}`, {
            method: 'DELETE',
        });
    }

    async getChatMessages(meetingId: string): Promise<{ messages: ChatMessage[] }> {
        return this.request<{ messages: ChatMessage[] }>(`/meetings/${meetingId}/messages`);
    }

    async sendChatMessage(meetingId: string, content: string): Promise<void> {
        return this.request(`/meetings/${meetingId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content, type: 'text' }),
        });
    }

    async updateMeetingSettings(meetingId: string, settings: MeetingSettings): Promise<void> {
        return this.request(`/meetings/${meetingId}/settings`, {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }

    async endMeeting(meetingId: string): Promise<void> {
        return this.request(`/meetings/${meetingId}`, {
            method: 'DELETE',
        });
    }
}

export const api = new MeetingAPI();