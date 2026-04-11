import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { appStorage } from '@/lib/storage';

interface AppStore {
  hasHydrated: boolean;
  onboardingCompleted: boolean;
  profileName: string;
  completeOnboarding: (profileName: string) => void;
  setProfileName: (profileName: string) => void;
  resetOnboarding: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      onboardingCompleted: false,
      profileName: 'You',
      completeOnboarding: (profileName) =>
        set({
          onboardingCompleted: true,
          profileName: profileName.trim() || 'You',
        }),
      setProfileName: (profileName) =>
        set({
          profileName: profileName.trim() || 'You',
        }),
      resetOnboarding: () =>
        set({
          onboardingCompleted: false,
          profileName: 'You',
        }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'yourautopay-app',
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({
        onboardingCompleted: state.onboardingCompleted,
        profileName: state.profileName,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
