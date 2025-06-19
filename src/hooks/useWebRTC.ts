import { useEffect, useRef, useState } from 'react';
import { useMediaStore } from '../stores/mediaStore';
import { useParticipantsStore } from '../stores/participantsStore';
import { createPeerConnection } from '../utils/webrtc';

interface UseWebRTCProps {
  meetingId: string;
  participantId: string;
}

export const useWebRTC = ({ meetingId, participantId }: UseWebRTCProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const peerConnections = useRef<Map<string, any>>(new Map());
  const { localStream, addRemoteStream, removeRemoteStream } = useMediaStore();
  const { participants } = useParticipantsStore();

  const handleIceCandidate = (candidate: RTCIceCandidate, targetParticipant: string) => {
    // In a real app, this would send the candidate through signaling server
    console.log('ICE candidate for:', targetParticipant, candidate);
  };

  const handleTrack = (stream: MediaStream, participantId: string) => {
    addRemoteStream(participantId, stream);
  };

  const createConnection = (participantId: string) => {
    const connection = createPeerConnection(
      (candidate) => handleIceCandidate(candidate, participantId),
      (stream) => handleTrack(stream, participantId)
    );

    if (localStream) {
      connection.addStream(localStream);
    }

    peerConnections.current.set(participantId, connection);
    return connection;
  };

  const initiateCall = async (participantId: string) => {
    try {
      const connection = createConnection(participantId);
      const offer = await connection.createOffer();
      
      // In a real app, send offer through signaling server
      console.log('Created offer for:', participantId, offer);
      setIsConnected(true);
    } catch (error) {
      setConnectionError('Failed to initiate call');
      console.error('Error initiating call:', error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromParticipant: string) => {
    try {
      const connection = createConnection(fromParticipant);
      const answer = await connection.createAnswer(offer);
      
      // In a real app, send answer back through signaling server
      console.log('Created answer for:', fromParticipant, answer);
    } catch (error) {
      setConnectionError('Failed to handle offer');
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, fromParticipant: string) => {
    const connection = peerConnections.current.get(fromParticipant);
    if (connection) {
      try {
        await connection.handleAnswer(answer);
      } catch (error) {
        setConnectionError('Failed to handle answer');
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidateMessage = async (candidate: RTCIceCandidateInit, fromParticipant: string) => {
    const connection = peerConnections.current.get(fromParticipant);
    if (connection) {
      try {
        await connection.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const closeConnection = (participantId: string) => {
    const connection = peerConnections.current.get(participantId);
    if (connection) {
      connection.close();
      peerConnections.current.delete(participantId);
      removeRemoteStream(participantId);
    }
  };

  const closeAllConnections = () => {
    peerConnections.current.forEach((connection, participantId) => {
      connection.close();
      removeRemoteStream(participantId);
    });
    peerConnections.current.clear();
    setIsConnected(false);
  };

  useEffect(() => {
    // Connect to new participants
    participants.forEach(participant => {
      if (!peerConnections.current.has(participant.id)) {
        initiateCall(participant.id);
      }
    });

    // Cleanup connections for participants who left
    peerConnections.current.forEach((_, participantId) => {
      if (!participants.find(p => p.id === participantId)) {
        closeConnection(participantId);
      }
    });
  }, [participants]);

  useEffect(() => {
    return () => {
      closeAllConnections();
    };
  }, []);

  return {
    isConnected,
    connectionError,
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidateMessage,
    closeConnection,
    closeAllConnections
  };
};