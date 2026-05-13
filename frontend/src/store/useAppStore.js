import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      audioFiles: [],
      imageFile: null,
      jobs: [], // { id, status, progress, filename, etc. }
      currentJobId: null,

      setAudioFiles: (files) => set({ audioFiles: files }),
      setImageFile: (file) => set({ imageFile: file }),
      
      removeAudioFile: (fileName) => set((state) => ({
        audioFiles: state.audioFiles.filter(f => f.name !== fileName)
      })),

      clearUploads: () => set({ audioFiles: [], imageFile: null }),

      addJob: (job) => set((state) => ({ 
        jobs: [job, ...state.jobs],
        currentJobId: job.id
      })),

      updateJobStatus: (jobId, updates) => set((state) => ({
        jobs: state.jobs.map(job => 
          job.id === jobId ? { ...job, ...updates } : job
        )
      })),

      removeJob: (jobId) => set((state) => ({
        jobs: state.jobs.filter(job => job.id !== jobId)
      })),

      resetCurrentJob: () => set({ currentJobId: null }),
    }),
    {
      name: 'audiobook-maker-storage',
      partialize: (state) => ({ jobs: state.jobs }), // Only persist jobs history
    }
  )
);
