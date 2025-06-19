import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { VideoQuality, DeviceSettings } from '../types';

interface MediaState {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  devices: {
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  };
  selectedDevices: {
    camera: string;
    microphone: string;
    speaker: string;
  };
  settings: DeviceSettings;
  isScreenSharing: boolean;
  hasMediaAccess: boolean;
  mediaError: string | null;
}

interface MediaActions {
  initializeMedia: () => Promise<void>;
  setLocalStream: (stream: MediaStream | null) => void;
  setScreenStream: (stream: MediaStream | null) => void;
  addRemoteStream: (participantId: string, stream: MediaStream) => void;
  removeRemoteStream: (participantId: string) => void;
  updateDevices: (devices: Partial<MediaState['devices']>) => void;
  setSelectedDevice: (type: 'camera' | 'microphone' | 'speaker', deviceId: string) => void;
  updateSettings: (settings: Partial<DeviceSettings>) => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
  setMediaError: (error: string | null) => void;
  cleanup: () => void;
}

const defaultSettings: DeviceSettings = {
  videoEnabled: true,
  audioEnabled: true,
  videoQuality: 'medium',
  noiseSupression: true,
  echoCancellation: true
};

export const useMediaStore = create<MediaState & MediaActions>()(
  devtools(
    (set, get) => ({
      // State
      localStream: null,
      screenStream: null,
      remoteStreams: new Map(),
      devices: {
        cameras: [],
        microphones: [],
        speakers: []
      },
      selectedDevices: {
        camera: '',
        microphone: '',
        speaker: ''
      },
      settings: defaultSettings,
      isScreenSharing: false,
      hasMediaAccess: false,
      mediaError: null,

      // Actions
      initializeMedia: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter(d => d.kind === 'videoinput');
          const microphones = devices.filter(d => d.kind === 'audioinput');
          const speakers = devices.filter(d => d.kind === 'audiooutput');

          set({
            localStream: stream,
            devices: { cameras, microphones, speakers },
            hasMediaAccess: true,
            mediaError: null,
            selectedDevices: {
              camera: cameras[0]?.deviceId || '',
              microphone: microphones[0]?.deviceId || '',
              speaker: speakers[0]?.deviceId || ''
            }
          });
        } catch (error) {
          set({
            mediaError: error instanceof Error ? error.message : 'Failed to access media devices',
            hasMediaAccess: false
          });
        }
      },

      setLocalStream: (stream) => set({ localStream: stream }),
      
      setScreenStream: (stream) => set({ screenStream: stream }),

      addRemoteStream: (participantId, stream) => {
        const { remoteStreams } = get();
        const newStreams = new Map(remoteStreams);
        newStreams.set(participantId, stream);
        set({ remoteStreams: newStreams });
      },

      removeRemoteStream: (participantId) => {
        const { remoteStreams } = get();
        const newStreams = new Map(remoteStreams);
        newStreams.delete(participantId);
        set({ remoteStreams: newStreams });
      },

      updateDevices: (newDevices) => {
        set(state => ({
          devices: { ...state.devices, ...newDevices }
        }));
      },

      setSelectedDevice: (type, deviceId) => {
        set(state => ({
          selectedDevices: { ...state.selectedDevices, [type]: deviceId }
        }));
      },

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      toggleVideo: () => {
        const { localStream, settings } = get();
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = !settings.videoEnabled;
            set(state => ({
              settings: { ...state.settings, videoEnabled: !state.settings.videoEnabled }
            }));
          }
        }
      },

      toggleAudio: () => {
        const { localStream, settings } = get();
        if (localStream) {
          const audioTrack = localStream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.enabled = !settings.audioEnabled;
            set(state => ({
              settings: { ...state.settings, audioEnabled: !state.settings.audioEnabled }
            }));
          }
        }
      },

      startScreenShare: async () => {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
          });
          
          set({
            screenStream,
            isScreenSharing: true
          });

          // Listen for screen share end
          screenStream.getVideoTracks()[0].addEventListener('ended', () => {
            get().stopScreenShare();
          });
        } catch (error) {
          set({ mediaError: 'Failed to start screen sharing' });
        }
      },

      stopScreenShare: () => {
        const { screenStream } = get();
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
          set({
            screenStream: null,
            isScreenSharing: false
          });
        }
      },

      switchCamera: async (deviceId) => {
        try {
          const { localStream } = get();
          if (localStream) {
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: deviceId } },
              audio: true
            });
            
            // Replace video track
            const videoTrack = newStream.getVideoTracks()[0];
            const sender = localStream.getVideoTracks()[0];
            if (sender && videoTrack) {
              localStream.removeTrack(sender);
              localStream.addTrack(videoTrack);
              sender.stop();
            }
            
            set(state => ({
              selectedDevices: { ...state.selectedDevices, camera: deviceId }
            }));
          }
        } catch (error) {
          set({ mediaError: 'Failed to switch camera' });
        }
      },

      switchMicrophone: async (deviceId) => {
        try {
          const { localStream } = get();
          if (localStream) {
            const newStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: { deviceId: { exact: deviceId } }
            });
            
            // Replace audio track
            const audioTrack = newStream.getAudioTracks()[0];
            const sender = localStream.getAudioTracks()[0];
            if (sender && audioTrack) {
              localStream.removeTrack(sender);
              localStream.addTrack(audioTrack);
              sender.stop();
            }
            
            set(state => ({
              selectedDevices: { ...state.selectedDevices, microphone: deviceId }
            }));
          }
        } catch (error) {
          set({ mediaError: 'Failed to switch microphone' });
        }
      },

      setMediaError: (error) => set({ mediaError: error }),

      cleanup: () => {
        const { localStream, screenStream, remoteStreams } = get();
        
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
        }
        
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
        }
        
        remoteStreams.forEach(stream => {
          stream.getTracks().forEach(track => track.stop());
        });

        set({
          localStream: null,
          screenStream: null,
          remoteStreams: new Map(),
          isScreenSharing: false,
          hasMediaAccess: false
        });
      }
    }),
    { name: 'media-store' }
  )
);