import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Mic, MicOff, User } from 'lucide-react';
import type { Participant } from '../../types';

interface VideoTileProps {
  participant: Participant;
  stream?: MediaStream;
  isLocal?: boolean;
  className?: string;
  showControls?: boolean;
  priority?: 'high' | 'normal';
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream,
  isLocal = false,
  className,
  showControls = true,
  priority = 'normal'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const displayName = participant.displayName || 'Unknown';
  const hasVideo = participant.isVideoEnabled && stream;

  return (
    <div
      className={clsx(
        'relative bg-gray-900 rounded-lg overflow-hidden',
        participant.isSpeaking && 'ring-4 ring-green-400',
        priority === 'high' && 'shadow-2xl',
        className
      )}
    >
      {/* Video Element */}
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="flex flex-col items-center text-white">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-3">
              <User className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium">{displayName}</span>
          </div>
        </div>
      )}

      {/* Audio Indicator */}
      {showControls && (
        <div className="absolute top-3 left-3">
          <div
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-full',
              participant.isAudioEnabled
                ? participant.isSpeaking
                  ? 'bg-green-500'
                  : 'bg-gray-700'
                : 'bg-red-500'
            )}
          >
            {participant.isAudioEnabled ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <MicOff className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Participant Name */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-black bg-opacity-50 rounded px-2 py-1">
            <span className="text-white text-sm font-medium truncate">
              {displayName}
              {isLocal && ' (You)'}
              {participant.isHost && ' (Host)'}
            </span>
          </div>
        </div>
      )}

      {/* Screen Share Indicator */}
      {participant.isScreenSharing && (
        <div className="absolute top-3 right-3">
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            Screen
          </div>
        </div>
      )}
    </div>
  );
};