import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Meeting, MeetingSettings, JoinMeetingRequest, JoinMeetingResponse } from '../types';
import { api } from '../services/api';

interface MeetingState {
    meeting: Meeting | null;
    isLoading: boolean;
    error: string | null;
    isHost: boolean;
    isRecording: boolean;

    setMeeting: (meeting: Meeting) => void;
    createMeeting: (title: string, hostId: string, settings: MeetingSettings) => Promise<Meeting>;
    joinMeeting: (meetingId: string, data: JoinMeetingRequest) => Promise<JoinMeetingResponse>;
    loadMeeting: (meetingId: string) => Promise<Meeting>;
    updateMeetingSettings: (meetingId: string, settings: MeetingSettings) => Promise<void>;
    leaveMeeting: () => Promise<void>;
    endMeeting: (meetingId: string) => Promise<void>;
    startRecording: () => void;
    stopRecording: () => void;
    clearMeeting: () => void;
    setError: (error: string | null) => void;
    setIsHost: (isHost: boolean) => void;
}

export const useMeetingStore = create<MeetingState>()(
    devtools(
        (set, get) => ({
            meeting: null,
            isLoading: false,
            error: null,
            isHost: false,
            isRecording: false,

            setMeeting: (meeting) => {
                const hostId = localStorage.getItem('hostId');
                const participantId = localStorage.getItem('participantId');
                const isHost = hostId === meeting.hostId ||
                    meeting.participants.find(p => p.id === participantId)?.isHost ||
                    false;

                set({ meeting, error: null, isHost });
            },

            createMeeting: async (title, hostId, settings) => {
                set({ isLoading: true, error: null });
                try {
                    const meeting = await api.createMeeting({ title, hostId, settings });
                    set({ meeting, isLoading: false, isHost: true });
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
                    const hostId = localStorage.getItem('hostId');
                    const isHost = hostId === response.meeting.hostId ||
                        response.meeting.participants.find(p => p.id === response.participantId)?.isHost ||
                        false;

                    set({
                        meeting: response.meeting,
                        isLoading: false,
                        isHost
                    });
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
                    const hostId = localStorage.getItem('hostId');
                    const participantId = localStorage.getItem('participantId');
                    const isHost = hostId === meeting.hostId ||
                        meeting.participants.find(p => p.id === participantId)?.isHost ||
                        false;

                    set({ meeting, isLoading: false, isHost });
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

            leaveMeeting: async () => {
                try {
                    const meetingId = window.location.pathname.split('/meeting/')[1];
                    if (meetingId) {
                        await api.leaveMeeting(meetingId);
                    }
                    set({ meeting: null, isHost: false, isRecording: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to leave meeting';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            endMeeting: async (meetingId) => {
                try {
                    await api.endMeeting(meetingId);
                    set({ meeting: null, isHost: false, isRecording: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to end meeting';
                    set({ error: errorMessage });
                    throw error;
                }
            },

            startRecording: () => {
                set({ isRecording: true });
            },

            stopRecording: () => {
                set({ isRecording: false });
            },

            clearMeeting: () => {
                set({
                    meeting: null,
                    error: null,
                    isHost: false,
                    isRecording: false
                });
            },

            setError: (error) => {
                set({ error });
            },

            setIsHost: (isHost) => {
                set({ isHost });
            },
        }),
        { name: 'meeting-store' }
    )
);