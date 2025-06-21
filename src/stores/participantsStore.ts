import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Participant } from '../types';

interface ParticipantState {
    participants: Participant[];
    currentParticipant: Participant | null;
    dominantSpeaker: string | null;

    setParticipants: (participants: Participant[]) => void;
    addParticipant: (participant: Participant) => void;
    removeParticipant: (participantId: string) => void;
    updateParticipant: (participantId: string, updates: Partial<Participant & { stream?: MediaStream }>) => void;
    setCurrentParticipant: (participant: Participant) => void;
    setLocalParticipant: (participant: Participant) => void;
    setDominantSpeaker: (participantId: string | null) => void;
    clearParticipants: () => void;
}

export const useParticipantStore = create<ParticipantState>()(
    devtools(
        (set) => ({
            participants: [],
            currentParticipant: null,
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
                }));
            },

            setCurrentParticipant: (participant) => {
                set({ currentParticipant: participant });
            },

            setLocalParticipant: (participant) => {
                set({ currentParticipant: participant });
            },

            setDominantSpeaker: (participantId) => {
                set({ dominantSpeaker: participantId });
            },

            clearParticipants: () => {
                set({
                    participants: [],
                    currentParticipant: null,
                    dominantSpeaker: null,
                });
            },
        }),
        { name: 'participants-store' }
    )
);