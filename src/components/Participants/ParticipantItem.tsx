import React from 'react';
import { clsx } from 'clsx';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Crown, 
  MoreHorizontal,
  UserX,
  VolumeX
} from 'lucide-react';
import { Button } from '../UI/Button';
import { useParticipantsStore } from '../../stores/participantsStore';
import type { Participant } from '../../types';

interface ParticipantItemProps {
  participant: Participant;
  isLocal: boolean;
  showHostControls: boolean;
}

export const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isLocal,
  showHostControls
}) => {
  const { muteParticipant, kickParticipant } = useParticipantsStore();

  const handleMute = () => {
    muteParticipant(participant.id);
  };

  const handleKick = () => {
    if (confirm(`Are you sure you want to remove ${participant.displayName}?`)) {
      kickParticipant(participant.id);
    }
  };

  return (
    <div
      className={clsx(
        'flex items-center justify-between p-3 rounded-lg hover:bg-gray-50',
        participant.isSpeaking && 'bg-green-50 border border-green-200'
      )}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div
          className={clsx(
            'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm',
            participant.isSpeaking ? 'bg-green-500' : 'bg-gray-500'
          )}
        >
          {participant.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Participant Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 truncate">
              {participant.displayName}
              {isLocal && ' (You)'}
            </span>
            {participant.isHost && (
              <Crown className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <div className="text-sm text-gray-500">
            {participant.email || 'Guest'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-1">
        {/* Audio Status */}
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center',
            participant.isAudioEnabled
              ? 'bg-gray-100 text-gray-600'
              : 'bg-red-100 text-red-600'
          )}
        >
          {participant.isAudioEnabled ? (
            <Mic className="w-4 h-4" />
          ) : (
            <MicOff className="w-4 h-4" />
          )}
        </div>

        {/* Video Status */}
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center',
            participant.isVideoEnabled
              ? 'bg-gray-100 text-gray-600'
              : 'bg-red-100 text-red-600'
          )}
        >
          {participant.isVideoEnabled ? (
            <Video className="w-4 h-4" />
          ) : (
            <VideoOff className="w-4 h-4" />
          )}
        </div>

        {/* Host Controls */}
        {showHostControls && (
          <div className="flex items-center space-x-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="w-8 h-8 p-0"
              title="Mute participant"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleKick}
              className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
              title="Remove participant"
            >
              <UserX className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};