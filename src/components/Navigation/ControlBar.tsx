import React from 'react';
import { clsx } from 'clsx';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Monitor,
  MessageSquare,
  Users,
  Settings,
  MoreVertical
} from 'lucide-react';
import { Button } from '../UI/Button';
import { useMediaStore } from '../../stores/mediaStore';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { useMeetingStore } from '../../stores/meetingStore';

export const ControlBar: React.FC = () => {
  const {
    settings,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare
  } = useMediaStore();

  const { unreadCount, togglePanel: toggleChat } = useChatStore();
  const { toggleParticipants, toggleSettings } = useUIStore();
  const { leaveMeeting, isRecording } = useMeetingStore();

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant={settings.audioEnabled ? 'ghost' : 'danger'}
            size="md"
            onClick={toggleAudio}
            className={clsx(
              'w-12 h-12 rounded-full',
              settings.audioEnabled ? 'hover:bg-gray-100' : ''
            )}
          >
            {settings.audioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant={settings.videoEnabled ? 'ghost' : 'danger'}
            size="md"
            onClick={toggleVideo}
            className={clsx(
              'w-12 h-12 rounded-full',
              settings.videoEnabled ? 'hover:bg-gray-100' : ''
            )}
          >
            {settings.videoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant={isScreenSharing ? 'primary' : 'ghost'}
            size="md"
            onClick={handleScreenShare}
            className="w-12 h-12 rounded-full"
          >
            <Monitor className="w-5 h-5" />
          </Button>
        </div>

        {/* Center Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            {isRecording && (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Recording</span>
              </>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="md"
            onClick={toggleChat}
            className="w-12 h-12 rounded-full relative"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={toggleParticipants}
            className="w-12 h-12 rounded-full"
          >
            <Users className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={toggleSettings}
            className="w-12 h-12 rounded-full"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="md"
            className="w-12 h-12 rounded-full"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={leaveMeeting}
            className="w-12 h-12 rounded-full"
          >
            <Phone className="w-5 h-5 rotate-135" />
          </Button>
        </div>
      </div>
    </div>
  );
};