export const MEETING_STATUS = {
  IDLE: 'idle',
  JOINING: 'joining',
  ACTIVE: 'active',
  ENDED: 'ended'
} as const;

export const MAX_PARTICIPANTS = 50;
export const DEFAULT_VIDEO_QUALITY = 'medium';
export const RECONNECT_ATTEMPTS = 3;

export const VIDEO_CONSTRAINTS = {
  low: { width: 320, height: 240, frameRate: 15 },
  medium: { width: 640, height: 480, frameRate: 24 },
  high: { width: 1280, height: 720, frameRate: 30 }
};

export const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
};

export const LAYOUTS = {
  GRID: 'grid',
  SPEAKER: 'speaker',
  SIDEBAR: 'sidebar'
} as const;

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_MUTE: 'Space',
  TOGGLE_VIDEO: 'KeyE',
  TOGGLE_CHAT: 'KeyH',
  LEAVE_MEETING: 'KeyL'
};

export const COLORS = {
  primary: '#1976D2',
  secondary: '#00ACC1',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: '#212121'
};