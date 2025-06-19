export interface Meeting {
  id: string;
  title: string;
  hostId: string;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  settings: MeetingSettings;
}

export interface MeetingSettings {
  allowParticipantMicrophone: boolean;
  allowParticipantCamera: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
  allowRecording: boolean;
  maxParticipants: number;
  requireApproval: boolean;
}

export interface Participant {
  id: string;
  displayName: string;
  email?: string;
  isHost: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
  stream?: MediaStream;
  isSpeaking: boolean;
}

export interface LocalParticipant extends Participant {
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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'emoji' | 'system';
}

export type LayoutType = 'grid' | 'speaker' | 'sidebar';
export type MeetingStatus = 'idle' | 'joining' | 'active' | 'ended';
export type VideoQuality = 'low' | 'medium' | 'high';
export type Theme = 'light' | 'dark';

export interface DeviceSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoQuality: VideoQuality;
  noiseSupression: boolean;
  echoCancellation: boolean;
}