import React, { useEffect } from 'react';
import { VideoGrid } from '../Media/VideoGrid';
import { ControlBar } from '../Navigation/ControlBar';
import { ChatPanel } from '../Chat/ChatPanel';
import { ParticipantsList } from '../Participants/ParticipantsList';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useMeetingStore } from '../../stores/meetingStore';
import { useParticipantsStore } from '../../stores/participantsStore';

interface MeetingRoomProps {
  meetingId: string;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ meetingId }) => {
  const { setMeetingStatus } = useMeetingStore();
  const { localParticipant } = useParticipantsStore();

  // Initialize WebRTC connection
  const webrtc = useWebRTC({
    meetingId,
    participantId: localParticipant?.id || ''
  });

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    setMeetingStatus('active');
    
    // Cleanup when component unmounts
    return () => {
      webrtc.closeAllConnections();
    };
  }, [setMeetingStatus, webrtc]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 relative">
        <VideoGrid />
        
        {/* Overlay Panels */}
        <ChatPanel />
        <ParticipantsList />
      </div>

      {/* Control Bar */}
      <ControlBar />
      
      {/* Bottom padding for control bar */}
      <div className="h-20" />
    </div>
  );
};