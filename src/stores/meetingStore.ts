import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Meeting, MeetingSettings, JoinMeetingRequest, JoinMeetingResponse } from '../types';
import { api } from '../services/api';

interface MeetingState {
    meeting: Meeting | null;
    isLoading: boolean;
    error: string | null;

    setMeeting: (meeting: Meeting) => void;
    createMeeting: (title: string, hostId: string, settings: MeetingSettings) => Promise<Meeting>;
    joinMeeting: (meetingId: string, data: JoinMeetingRequest) => Promise<JoinMeetingResponse>;
    loadMeeting: (meetingId: string) => Promise<Meeting>;
    updateMeetingSettings: (meetingId: string, settings: MeetingSettings) => Promise<void>;
    endMeeting: (meetingId: string) => Promise<void>;
    clearMeeting: () => void;
    setError: (error: string | null) => void;
}

export const useMeetingStore = create<MeetingState>()(
    devtools(
        (set, get) => ({
            meeting: null,
            isLoading: false,
            error: null,

            setMeeting: (meeting) => {
                set({ meeting, error: null });
            },

            createMeeting: async (title, hostId, settings) => {
                set({ isLoading: true, error: null });
                try {
                    const meeting = await api.createMeeting({ title, hostId, settings });
                    set({ meeting, isLoading: false });
                    return meeting;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create meeting';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            joinMeeting: async (meetingId, data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.joinMeeting(meetingId, data);
                    set({ meeting: response.meeting, isLoading: false });
                    return response;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to join meeting';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            loadMeeting: async (meetingId) => {
                set({ isLoading: true, error: null });
                try {
                    const meeting = await api.getMeeting(meetingId);
                    set({ meeting, isLoading: false });
                    return meeting;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to load meeting';
                    set({ error: errorMessage, isLoading: false });
                    throw error;
                }
            },

            updateMeetingSettings: async (meetingId, settings) => {
                try {
                    await api.updateMeetingSettings(meetingId, settings);
                    const { meeting } = get();
                    if (meeting) {
                        set({ meeting: { ...meeting, settings } });
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            endMeeting: async (meetingId) => {
                try {
                    await api.endMeeting(meetingId);
                    set({ meeting: null });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to end meeting';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            clearMeeting: () => {
                set({ meeting: null, error: null });
            },

            setError: (error) => {
                set({ error });
            },
        }),
        { name: 'meeting-store' }
    )
);