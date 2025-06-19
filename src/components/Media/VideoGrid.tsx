import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { VideoTile } from './VideoTile';
import { useParticipantsStore } from '../../stores/participantsStore';
import { useMediaStore } from '../../stores/mediaStore';
import { useUIStore } from '../../stores/uiStore';
import type { LayoutType } from '../../types';

export const VideoGrid: React.FC = () => {
  const { participants, localParticipant, dominantSpeaker } = useParticipantsStore();
  const { localStream, remoteStreams } = useMediaStore();
  const { layout } = useUIStore();

  const allParticipants = useMemo(() => {
    const all = [...participants];
    if (localParticipant) {
      all.unshift(localParticipant);
    }
    return all;
  }, [participants, localParticipant]);

  const getGridClasses = (count: number, layout: LayoutType) => {
    if (layout === 'speaker') {
      return 'grid-cols-1';
    }

    if (layout === 'sidebar') {
      return 'grid-cols-4 gap-2';
    }

    // Grid layout
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    if (count <= 9) return 'grid-cols-3 grid-rows-3';
    if (count <= 12) return 'grid-cols-4 grid-rows-3';
    return 'grid-cols-4 grid-rows-4';
  };

  const renderSpeakerView = () => {
    const speaker = dominantSpeaker 
      ? allParticipants.find(p => p.id === dominantSpeaker) 
      : allParticipants[0];
    
    const otherParticipants = allParticipants.filter(p => p.id !== speaker?.id);

    if (!speaker) return null;

    return (
      <div className="flex flex-col h-full">
        {/* Main Speaker */}
        <div className="flex-1 p-2">
          <VideoTile
            participant={speaker}
            stream={speaker.id === localParticipant?.id ? localStream || undefined : remoteStreams.get(speaker.id)}
            isLocal={speaker.id === localParticipant?.id}
            className="w-full h-full max-h-[70vh]"
            priority="high"
          />
        </div>

        {/* Other Participants */}
        {otherParticipants.length > 0 && (
          <div className="h-32 p-2">
            <div className="flex gap-2 overflow-x-auto">
              {otherParticipants.map(participant => (
                <VideoTile
                  key={participant.id}
                  participant={participant}
                  stream={participant.id === localParticipant?.id ? localStream || undefined : remoteStreams.get(participant.id)}
                  isLocal={participant.id === localParticipant?.id}
                  className="w-24 h-24 flex-shrink-0"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGridView = () => {
    const gridClasses = getGridClasses(allParticipants.length, layout);

    return (
      <div className={clsx('grid gap-2 p-2 h-full', gridClasses)}>
        {allParticipants.map(participant => (
          <VideoTile
            key={participant.id}
            participant={participant}
            stream={participant.id === localParticipant?.id ? localStream || undefined : remoteStreams.get(participant.id)}
            isLocal={participant.id === localParticipant?.id}
            className="w-full h-full min-h-[200px]"
          />
        ))}
      </div>
    );
  };

  if (allParticipants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No participants in the meeting</div>
          <div className="text-gray-400">Waiting for others to join...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 overflow-hidden">
      {layout === 'speaker' ? renderSpeakerView() : renderGridView()}
    </div>
  );
};