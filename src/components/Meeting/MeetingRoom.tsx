import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useChat } from '../../hooks/useChat';
import { useAudioLevel } from '../../hooks/useAudioLevel';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useMeetingStore } from '../../stores/meetingStore';
import { useParticipantsStore } from '../../stores/participantsStore';
import { VideoGrid } from '../Media/VideoGrid.tsx';
import { ControlBar } from '../Navigation/ControlBar.tsx';
import { ChatPanel } from '../Chat/ChatPanel.tsx';
import { ParticipantsList } from '../Participants/ParticipantsList.tsx';
import { api } from '../../services/api';

export const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const { meeting, loadMeeting, leaveMeeting } = useMeetingStore();
  const { participants } = useParticipantsStore();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const {
    isConnected,
    error: webRtcError,
    initializeWebRTC,
    getLocalStream,
    stopLocalStream,
    toggleAudio,
    toggleVideo,
    cleanup,
    setIceServers,
  } = useWebRTC(meetingId!);

  useChat(meetingId!);
  useAudioLevel(localStream, isAudioEnabled);
  useKeyboardShortcuts();

  useEffect(() => {
    if (!meetingId) {
      navigate('/');
      return;
    }

    const initializeMeeting = async () => {
      try {
        if (!meeting) {
          await loadMeeting(meetingId);
        }

        const token = localStorage.getItem('meetingToken');
        if (!token) {
          navigate(`/join/${meetingId}`);
          return;
        }

        await initializeWebRTC(token);

        const stream = await getLocalStream({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

      } catch (error) {
        console.error('Error initializing meeting:', error);
      }
    };

    initializeMeeting();

    return () => {
      cleanup();
      stopLocalStream();
    };
  }, [meetingId, meeting, navigate, loadMeeting, initializeWebRTC, getLocalStream, cleanup, stopLocalStream]);

  useEffect(() => {
    if (meeting) {
      const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ];
      setIceServers(iceServers);
    }
  }, [meeting, setIceServers]);

  const handleToggleAudio = async () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    await toggleAudio(newState);
  };

  const handleToggleVideo = async () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    await toggleVideo(newState);
  };

  const handleStartScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      setIsScreenSharing(true);

      // Listen for screen share end
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        setIsScreenSharing(false);
      });
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const handleStopScreenShare = () => {
    setIsScreenSharing(false);
  };

  const handleLeaveMeeting = async () => {
    try {
      await leaveMeeting();
      cleanup();
      navigate('/');
    } catch (error) {
      console.error('Error leaving meeting:', error);
      cleanup();
      navigate('/');
    }
  };

  if (!meetingId) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Meeting ID</h1>
            <button
                onClick={() => navigate('/')}
                className="text-blue-400 hover:text-blue-300"
            >
              Go Home
            </button>
          </div>
        </div>
    );
  }

  if (!isConnected) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg mb-2">Connecting to meeting...</p>
            {webRtcError && (
                <>
                  <p className="text-red-400 mt-2">{webRtcError}</p>
                  <button
                      onClick={() => navigate('/')}
                      className="mt-4 text-blue-400 hover:text-blue-300"
                  >
                    Go Home
                  </button>
                </>
            )}
          </div>
        </div>
    );
  }

  return (
      <div className="flex flex-col h-screen bg-gray-900">
        <div className="flex-1 relative">
          <VideoGrid />
          <ChatPanel />
          <ParticipantsList />
        </div>
        <ControlBar
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
            onToggleAudio={handleToggleAudio}
            onToggleVideo={handleToggleVideo}
            onStartScreenShare={handleStartScreenShare}
            onStopScreenShare={handleStopScreenShare}
        />
      </div>
  );
};