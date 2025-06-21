import { useRef, useEffect, useCallback, useState } from 'react';
import { socketService } from '@/services/socket';
import { api } from '@/services/api';
import { useParticipantStore } from '../stores/participantsStore';
import { Participant } from '../types';

export const useWebRTC = (meetingId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const { participants, updateParticipant, addParticipant, removeParticipant } = useParticipantStore();

  const createPeerConnection = useCallback((participantId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emit('ice-candidate', {
          meetingId,
          targetParticipantId: participantId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      updateParticipant(participantId, { stream: remoteStream });
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state with ${participantId}:`, peerConnection.connectionState);

      if (peerConnection.connectionState === 'failed') {
        peerConnection.restartIce();
      }
    };

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream.current!);
      });
    }

    peerConnections.current.set(participantId, peerConnection);
    return peerConnection;
  }, [meetingId, iceServers, updateParticipant]);

  const handleOffer = useCallback(async (fromParticipantId: string, offer: RTCSessionDescriptionInit) => {
    try {
      const peerConnection = createPeerConnection(fromParticipantId);
      await peerConnection.setRemoteDescription(offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socketService.emit('answer', {
        meetingId,
        targetParticipantId: fromParticipantId,
        answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      setError('Failed to handle incoming call');
    }
  }, [meetingId, createPeerConnection]);

  const handleAnswer = useCallback(async (fromParticipantId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const peerConnection = peerConnections.current.get(fromParticipantId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  const handleIceCandidate = useCallback(async (fromParticipantId: string, candidate: RTCIceCandidateInit) => {
    try {
      const peerConnection = peerConnections.current.get(fromParticipantId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  const handleParticipantJoined = useCallback(async (participant: Participant) => {
    addParticipant(participant);

    try {
      const peerConnection = createPeerConnection(participant.id);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketService.emit('offer', {
        meetingId,
        targetParticipantId: participant.id,
        offer,
      });
    } catch (error) {
      console.error('Error creating offer for new participant:', error);
    }
  }, [meetingId, addParticipant, createPeerConnection]);

  const handleParticipantLeft = useCallback((participantId: string) => {
    const peerConnection = peerConnections.current.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      peerConnections.current.delete(participantId);
    }

    removeParticipant(participantId);
  }, [removeParticipant]);

  const handleParticipantUpdated = useCallback((participantId: string, updates: Partial<Participant>) => {
    updateParticipant(participantId, updates);
  }, [updateParticipant]);

  const initializeWebRTC = useCallback(async (token: string) => {
    try {
      await socketService.connect(token);

      socketService.on('offer-received', ({ fromParticipantId, offer }) => {
        handleOffer(fromParticipantId, offer);
      });

      socketService.on('answer-received', ({ fromParticipantId, answer }) => {
        handleAnswer(fromParticipantId, answer);
      });

      socketService.on('ice-candidate-received', ({ fromParticipantId, candidate }) => {
        handleIceCandidate(fromParticipantId, candidate);
      });

      socketService.on('participant-joined', ({ participant }) => {
        handleParticipantJoined(participant);
      });

      socketService.on('participant-left', ({ participantId }) => {
        handleParticipantLeft(participantId);
      });

      socketService.on('participant-updated', ({ participantId, updates }) => {
        handleParticipantUpdated(participantId, updates);
      });

      socketService.on('speaking-changed', ({ participantId, isSpeaking }) => {
        updateParticipant(participantId, { isSpeaking });
      });

      const participantId = localStorage.getItem('participantId');
      if (participantId) {
        socketService.emit('join-meeting', {
          meetingId,
          participantId,
          token,
        });
      }

      setIsConnected(true);
      setError(null);
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setError('Failed to connect to meeting');
    }
  }, [meetingId, handleOffer, handleAnswer, handleIceCandidate, handleParticipantJoined, handleParticipantLeft, handleParticipantUpdated, updateParticipant]);

  const getLocalStream = useCallback(async (constraints: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream;

      peerConnections.current.forEach((peerConnection) => {
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });
      });

      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
  }, []);

  const toggleAudio = useCallback(async (enabled: boolean) => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;

        const participantId = localStorage.getItem('participantId');
        if (participantId) {
          await api.updateParticipantStatus(meetingId, participantId, {
            isAudioEnabled: enabled,
          });
        }
      }
    }
  }, [meetingId]);

  const toggleVideo = useCallback(async (enabled: boolean) => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;

        const participantId = localStorage.getItem('participantId');
        if (participantId) {
          await api.updateParticipantStatus(meetingId, participantId, {
            isVideoEnabled: enabled,
          });
        }
      }
    }
  }, [meetingId]);

  const cleanup = useCallback(() => {
    peerConnections.current.forEach((peerConnection) => {
      peerConnection.close();
    });
    peerConnections.current.clear();

    stopLocalStream();

    const participantId = localStorage.getItem('participantId');
    if (participantId) {
      socketService.emit('leave-meeting', {
        meetingId,
        participantId,
      });
    }

    socketService.disconnect();

    setIsConnected(false);
  }, [meetingId, stopLocalStream]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    isConnected,
    error,
    participants,
    initializeWebRTC,
    getLocalStream,
    stopLocalStream,
    toggleAudio,
    toggleVideo,
    cleanup,
    setIceServers,
  };
};