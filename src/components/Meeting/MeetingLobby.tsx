import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Settings, UserCheck } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Toggle } from '@/components/UI/Toggle';
import { VideoTile } from '@/components/Media/VideoTile';
import { useMeetingStore } from '../../stores/meetingStore';
import { useParticipantStore } from '../../stores/participantsStore';

interface MeetingLobbyProps {
  meetingId: string;
  onJoin: () => void;
}

export const MeetingLobby: React.FC<MeetingLobbyProps> = ({ meetingId, onJoin }) => {
  const [displayName, setDisplayName] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hasMediaAccess, setHasMediaAccess] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const { joinMeeting } = useMeetingStore();
  const { setCurrentParticipant } = useParticipantStore();

  useEffect(() => {
    initializeMedia();

    return () => {
      // Cleanup stream when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    setIsReady(hasMediaAccess && displayName.trim().length > 0);
  }, [hasMediaAccess, displayName]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      setHasMediaAccess(true);
      setMediaError(null);
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Failed to access media devices');
      setHasMediaAccess(false);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleJoin = async () => {
    try {
      const response = await joinMeeting(meetingId, {
        displayName: displayName.trim(),
        deviceCapabilities: {
          video: true,
          audio: true,
          screenShare: 'getDisplayMedia' in navigator.mediaDevices,
        },
      });

      const localParticipant = response.meeting.participants.find(
          p => p.id === response.participantId
      );

      if (localParticipant) {
        setCurrentParticipant(localParticipant);
      }

      onJoin();
    } catch (error) {
      console.error('Error joining meeting:', error);
      setMediaError('Failed to join meeting. Please try again.');
    }
  };

  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Ready to join?</h2>

              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {hasMediaAccess && localStream ? (
                    <VideoTile
                        participant={{
                          id: 'local-preview',
                          displayName: displayName || 'You',
                          isHost: false,
                          isAudioEnabled: isAudioEnabled,
                          isVideoEnabled: isVideoEnabled,
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
                              <Button
                                  onClick={initializeMedia}
                                  variant="ghost"
                                  className="mt-2 text-white"
                              >
                                Try Again
                              </Button>
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

              <div className="flex items-center justify-center space-x-4">
                <Button
                    variant={isVideoEnabled ? 'ghost' : 'danger'}
                    size="lg"
                    onClick={toggleVideo}
                    className="w-14 h-14 rounded-full"
                    disabled={!hasMediaAccess}
                >
                  {isVideoEnabled ? (
                      <Video className="w-6 h-6" />
                  ) : (
                      <VideoOff className="w-6 h-6" />
                  )}
                </Button>

                <Button
                    variant={isAudioEnabled ? 'ghost' : 'danger'}
                    size="lg"
                    onClick={toggleAudio}
                    className="w-14 h-14 rounded-full"
                    disabled={!hasMediaAccess}
                >
                  {isAudioEnabled ? (
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
                        checked={isVideoEnabled}
                        onChange={() => toggleVideo()}
                        label="Turn on camera"
                        disabled={!hasMediaAccess}
                    />
                    <Toggle
                        checked={isAudioEnabled}
                        onChange={() => toggleAudio()}
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