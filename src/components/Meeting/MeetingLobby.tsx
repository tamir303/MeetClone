import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Video, VideoOff, Mic, MicOff, Settings, UserCheck } from 'lucide-react';
import { Button } from '../UI/Button';
import { Toggle } from '../UI/Toggle';
import { VideoTile } from '../Media/VideoTile';
import { useMediaStore } from '../../stores/mediaStore';
import { useParticipantsStore } from '../../stores/participantsStore';
import { useMeetingStore } from '../../stores/meetingStore';
import type { LocalParticipant } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface MeetingLobbyProps {
  meetingId: string;
  onJoin: () => void;
}

export const MeetingLobby: React.FC<MeetingLobbyProps> = ({ meetingId, onJoin }) => {
  const [displayName, setDisplayName] = useState('');
  const [isReady, setIsReady] = useState(false);
  
  const {
    localStream,
    settings,
    hasMediaAccess,
    mediaError,
    initializeMedia,
    toggleVideo,
    toggleAudio
  } = useMediaStore();

  const { setLocalParticipant } = useParticipantsStore();
  const { joinMeeting } = useMeetingStore();

  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);

  useEffect(() => {
    setIsReady(hasMediaAccess && displayName.trim().length > 0);
  }, [hasMediaAccess, displayName]);

  const handleJoin = () => {
    const localParticipant: LocalParticipant = {
      id: uuidv4(),
      displayName: displayName.trim(),
      isHost: false,
      isAudioEnabled: settings.audioEnabled,
      isVideoEnabled: settings.videoEnabled,
      isScreenSharing: false,
      joinedAt: new Date().toISOString(),
      isSpeaking: false,
      devices: {
        cameras: [],
        microphones: [],
        speakers: []
      },
      selectedDevices: {
        camera: '',
        microphone: '',
        speaker: ''
      }
    };

    setLocalParticipant(localParticipant);
    joinMeeting(meetingId);
    onJoin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Video Preview */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ready to join?</h2>
            
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {hasMediaAccess && localStream ? (
                <VideoTile
                  participant={{
                    id: 'local-preview',
                    displayName: displayName || 'You',
                    isHost: false,
                    isAudioEnabled: settings.audioEnabled,
                    isVideoEnabled: settings.videoEnabled,
                    isScreenSharing: false,
                    joinedAt: '',
                    isSpeaking: false
                  }}
                  stream={localStream}
                  isLocal={true}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    {mediaError ? (
                      <>
                        <VideoOff className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-red-400">{mediaError}</p>
                      </>
                    ) : (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
                        <p>Setting up your camera and microphone...</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Media Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant={settings.videoEnabled ? 'ghost' : 'danger'}
                size="lg"
                onClick={toggleVideo}
                className="w-14 h-14 rounded-full"
                disabled={!hasMediaAccess}
              >
                {settings.videoEnabled ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant={settings.audioEnabled ? 'ghost' : 'danger'}
                size="lg"
                onClick={toggleAudio}
                className="w-14 h-14 rounded-full"
                disabled={!hasMediaAccess}
              >
                {settings.audioEnabled ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="w-14 h-14 rounded-full"
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Join Form */}
          <div className="space-y-6 flex flex-col justify-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Join Meeting
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={50}
                  />
                </div>

                <div className="space-y-3">
                  <Toggle
                    checked={settings.videoEnabled}
                    onChange={toggleVideo}
                    label="Turn on camera"
                    disabled={!hasMediaAccess}
                  />
                  <Toggle
                    checked={settings.audioEnabled}
                    onChange={toggleAudio}
                    label="Turn on microphone"
                    disabled={!hasMediaAccess}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleJoin}
                disabled={!isReady}
                className="w-full py-3 text-lg font-medium"
                leftIcon={<UserCheck className="w-5 h-5" />}
              >
                Join Meeting
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                Meeting ID: {meetingId}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};