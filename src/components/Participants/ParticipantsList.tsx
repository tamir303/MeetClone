import React from 'react';
import { clsx } from 'clsx';
import { X, UserPlus } from 'lucide-react';
import { Button } from '../UI/Button';
import { ParticipantItem } from './ParticipantItem';
import { useParticipantsStore } from '../../stores/participantsStore';
import { useUIStore } from '../../stores/uiStore';
import { useMeetingStore } from '../../stores/meetingStore';

export const ParticipantsList: React.FC = () => {
  const { participants, localParticipant } = useParticipantsStore();
  const { participantsOpen, toggleParticipants } = useUIStore();
  const { isHost } = useMeetingStore();

  const allParticipants = [
    ...(localParticipant ? [localParticipant] : []),
    ...participants
  ];

  if (!participantsOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Participants ({allParticipants.length})
        </h3>
        <div className="flex items-center space-x-2">
          {isHost && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleParticipants}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {allParticipants.map((participant) => (
            <ParticipantItem
              key={participant.id}
              participant={participant}
              isLocal={participant.id === localParticipant?.id}
              showHostControls={isHost && participant.id !== localParticipant?.id}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      {isHost && (
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full"
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Invite Others
          </Button>
        </div>
      )}
    </div>
  );
};