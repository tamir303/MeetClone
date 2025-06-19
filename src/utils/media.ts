import { VIDEO_CONSTRAINTS, AUDIO_CONSTRAINTS } from '../constants';
import type { VideoQuality } from '../types';

export const getUserMedia = async (
  videoEnabled: boolean = true,
  audioEnabled: boolean = true,
  videoQuality: VideoQuality = 'medium'
): Promise<MediaStream> => {
  const constraints: MediaStreamConstraints = {
    video: videoEnabled ? {
      ...VIDEO_CONSTRAINTS[videoQuality],
      facingMode: 'user'
    } : false,
    audio: audioEnabled ? AUDIO_CONSTRAINTS : false
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw new Error('Failed to access camera and microphone');
  }
};

export const getDisplayMedia = async (): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' },
      audio: true
    });
  } catch (error) {
    console.error('Error accessing screen share:', error);
    throw new Error('Failed to start screen sharing');
  }
};

export const enumerateDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      cameras: devices.filter(device => device.kind === 'videoinput'),
      microphones: devices.filter(device => device.kind === 'audioinput'),
      speakers: devices.filter(device => device.kind === 'audiooutput')
    };
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return { cameras: [], microphones: [], speakers: [] };
  }
};

export const stopAllTracks = (stream: MediaStream) => {
  stream.getTracks().forEach(track => {
    track.stop();
  });
};

export const switchAudioOutput = async (deviceId: string, audioElement: HTMLAudioElement) => {
  if ('setSinkId' in audioElement) {
    try {
      await (audioElement as any).setSinkId(deviceId);
    } catch (error) {
      console.error('Error switching audio output:', error);
    }
  }
};

export const analyzeAudioLevel = (stream: MediaStream): number => {
  try {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    microphone.connect(analyser);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    
    return sum / dataArray.length / 255;
  } catch (error) {
    console.error('Error analyzing audio level:', error);
    return 0;
  }
};

export const applyVideoConstraints = async (
  stream: MediaStream,
  quality: VideoQuality
) => {
  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack) {
    try {
      await videoTrack.applyConstraints(VIDEO_CONSTRAINTS[quality]);
    } catch (error) {
      console.error('Error applying video constraints:', error);
    }
  }
};