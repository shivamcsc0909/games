import { create } from 'zustand';
import { audioManager } from '../audio/AudioManager';

interface AudioState {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (val: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: false,
  volume: 0.7,
  toggleMute: () => {
    set((state) => {
      const nextMuted = !state.isMuted;
      audioManager.setMuted(nextMuted);
      return { isMuted: nextMuted };
    });
  },
  setVolume: (val: number) => {
    audioManager.setVolume(val);
    set({ volume: val });
  }
}));
