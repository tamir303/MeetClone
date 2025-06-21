import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Participant } from '../types';
import { api } from '../services/api';

interface ParticipantsState {
    participants: Participant[];
    localParticipant: Participant | null;
    dominantSpeaker: string | null;

    setParticipants: (participants: Participant[]) => void;
    addParticipant: (participant: Participant) => void;
    removeParticipant: (participantId: string) => void;
    updateParticipant: (participantId: string, updates: Partial<Participant & { stream?: MediaStream }>) => void;
    setLocalParticipant: (participant: Participant) => void;
    setCurrentParticipant: (participant: Participant) => void;
    setDominantSpeaker: (participantId: string | null) => void;
    muteParticipant: (participantId: string) => Promise<void>;
    kickParticipant: (participantId: string) => Promise<void>;
    clearParticipants: () => void;
}

export const useParticipantsStore = create<ParticipantsState>()(
    devtools(
        (set, get) => ({
            participants: [],
            localParticipant: null,
            dominantSpeaker: null,

            setParticipants: (participants) => {
                set({ participants });
            },

            addParticipant: (participant) => {
                set(state => ({
                    participants: [...state.participants.filter(p => p.id !== participant.id), participant],
                }));
            },

            removeParticipant: (participantId) => {
                set(state => ({
                    participants: state.participants.filter(p => p.id !== participantId),
                    dominantSpeaker: state.dominantSpeaker === participantId ? null : state.dominantSpeaker,
                }));
            },

            updateParticipant: (participantId, updates) => {
                set(state => ({
                    participants: state.participants.map(p =>
                        p.id === participantId ? { ...p, ...updates } : p
                    ),
                    localParticipant: state.localParticipant?.id === participantId
                        ? { ...state.localParticipant, ...updates }
                        : state.localParticipant,
                }));
            },

            setLocalParticipant: (participant) => {
                set({ localParticipant: participant });
            },

            setCurrentParticipant: (participant) => {
                set({ localParticipant: participant });
            },

            setDominantSpeaker: (participantId) => {
                set({ dominantSpeaker: participantId });
            },

            muteParticipant: async (participantId) => {
                try {
                    const { localParticipant } = get();
                    if (!localParticipant?.isHost) {
                        throw new Error('Only hosts can mute participants');
                    }

                    // This would typically be handled through the API
                    // For now, we'll update the local state
                    get().updateParticipant(participantId, { isAudioEnabled: false });
                } catch (error) {
                    console.error('Failed to mute participant:', error);
                    throw error;
                }
            },

            kickParticipant: async (participantId) => {
                try {
                    const { localParticipant } = get();
                    if (!localParticipant?.isHost) {
                        throw new Error('Only hosts can remove participants');
                    }

                    // This would call the API to remove the participant
                    await api.removeParticipant(localParticipant.id, participantId);
                    get().removeParticipant(participantId);
                } catch (error) {
                    console.error('Failed to remove participant:', error);
                    throw error;
                }
            },

            clearParticipants: () => {
                set({
                    participants: [],
                    localParticipant: null,
                    dominantSpeaker: null,
                });
            },
        }),
        { name: 'participants-store' }
    )
);