import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Meeting, MeetingSettings, MeetingStatus } from '../types';

interface MeetingState {
  meetingId: string | null;
  meeting: Meeting | null;
  isJoined: boolean;
  isHost: boolean;
  meetingStatus: MeetingStatus;
  settings: MeetingSettings;
  isRecording: boolean;
  recordingStartTime: string | null;
  waitingRoom: boolean;
}

interface MeetingActions {
  setMeeting: (meeting: Meeting) => void;
  joinMeeting: (meetingId: string, asHost?: boolean) => void;
  leaveMeeting: () => void;
  updateSettings: (settings: Partial<MeetingSettings>) => void;
  setMeetingStatus: (status: MeetingStatus) => void;
  startRecording: () => void;
  stopRecording: () => void;
  toggleWaitingRoom: () => void;
}

const defaultSettings: MeetingSettings = {
  allowParticipantMicrophone: true,
  allowParticipantCamera: true,
  allowScreenShare: true,
  allowChat: true,
  allowRecording: true,
  maxParticipants: 50,
  requireApproval: false
};

export const useMeetingStore = create<MeetingState & MeetingActions>()(
  devtools(
    (set, get) => ({
      // State
      meetingId: null,
      meeting: null,
      isJoined: false,
      isHost: false,
      meetingStatus: 'idle',
      settings: defaultSettings,
      isRecording: false,
      recordingStartTime: null,
      waitingRoom: false,

      // Actions
      setMeeting: (meeting) => set({ meeting, meetingId: meeting.id }),
      
      joinMeeting: (meetingId, asHost = false) => {
        set({
          meetingId,
          isJoined: true,
          isHost: asHost,
          meetingStatus: 'joining'
        });
      },

      leaveMeeting: () => {
        set({
          meetingId: null,
          meeting: null,
          isJoined: false,
          isHost: false,
          meetingStatus: 'idle',
          isRecording: false,
          recordingStartTime: null
        });
      },

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setMeetingStatus: (status) => set({ meetingStatus: status }),

      startRecording: () => {
        set({
          isRecording: true,
          recordingStartTime: new Date().toISOString()
        });
      },

      stopRecording: () => {
        set({
          isRecording: false,
          recordingStartTime: null
        });
      },

      toggleWaitingRoom: () => {
        set(state => ({ waitingRoom: !state.waitingRoom }));
      }
    }),
    { name: 'meeting-store' }
  )
);