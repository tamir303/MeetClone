import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Participant, LocalParticipant } from '../types';

interface ParticipantsState {
  participants: Participant[];
  localParticipant: LocalParticipant | null;
  speakingParticipants: string[];
  dominantSpeaker: string | null;
}

interface ParticipantsActions {
  setLocalParticipant: (participant: LocalParticipant) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  setSpeaking: (id: string, speaking: boolean) => void;
  setDominantSpeaker: (id: string | null) => void;
  muteParticipant: (id: string) => void;
  kickParticipant: (id: string) => void;
  clearParticipants: () => void;
}

export const useParticipantsStore = create<ParticipantsState & ParticipantsActions>()(
  devtools(
    (set, get) => ({
      // State
      participants: [],
      localParticipant: null,
      speakingParticipants: [],
      dominantSpeaker: null,

      // Actions
      setLocalParticipant: (participant) => set({ localParticipant: participant }),

      addParticipant: (participant) => {
        const { participants } = get();
        if (!participants.find(p => p.id === participant.id)) {
          set({ participants: [...participants, participant] });
        }
      },

      removeParticipant: (id) => {
        set(state => ({
          participants: state.participants.filter(p => p.id !== id),
          speakingParticipants: state.speakingParticipants.filter(pid => pid !== id),
          dominantSpeaker: state.dominantSpeaker === id ? null : state.dominantSpeaker
        }));
      },

      updateParticipant: (id, updates) => {
        set(state => ({
          participants: state.participants.map(p =>
            p.id === id ? { ...p, ...updates } : p
          )
        }));
        
        // Update local participant if it's the same ID
        const { localParticipant } = get();
        if (localParticipant && localParticipant.id === id) {
          set({ localParticipant: { ...localParticipant, ...updates } });
        }
      },

      setSpeaking: (id, speaking) => {
        set(state => {
          const speakingParticipants = speaking
            ? [...state.speakingParticipants.filter(pid => pid !== id), id]
            : state.speakingParticipants.filter(pid => pid !== id);
          
          return { speakingParticipants };
        });
      },

      setDominantSpeaker: (id) => set({ dominantSpeaker: id }),

      muteParticipant: (id) => {
        get().updateParticipant(id, { isAudioEnabled: false });
      },

      kickParticipant: (id) => {
        get().removeParticipant(id);
      },

      clearParticipants: () => {
        set({
          participants: [],
          localParticipant: null,
          speakingParticipants: [],
          dominantSpeaker: null
        });
      }
    }),
    { name: 'participants-store' }
  )
);