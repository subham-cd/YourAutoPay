import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import { appStorage } from '@/lib/storage';
import {
  cancelSubscriptionNotification,
  syncAllSubscriptionNotifications,
  syncSubscriptionNotification,
} from '@/lib/notificationService';

interface SubscriptionStore {
  hasHydrated: boolean;
  subscriptions: Subscription[];
  totalBalance: number;
  addSubscription: (subscription: Subscription) => Promise<void>;
  updateSubscription: (subscriptionId: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (subscriptionId: string) => Promise<void>;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  syncNotifications: (promptForPermission?: boolean) => Promise<void>;
  setHasHydrated: (value: boolean) => void;
}

const getTotalBalance = (subscriptions: Subscription[]) =>
  subscriptions.reduce((total, subscription) => total + subscription.price, 0);

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      subscriptions: HOME_SUBSCRIPTIONS,
      totalBalance: getTotalBalance(HOME_SUBSCRIPTIONS),
      addSubscription: async (subscription) => {
        const syncedSubscription = await syncSubscriptionNotification(subscription, true);

        set((state) => {
          const subscriptions = [syncedSubscription, ...state.subscriptions];

          return {
            subscriptions,
            totalBalance: getTotalBalance(subscriptions),
          };
        });
      },
      updateSubscription: async (subscriptionId, updates) => {
        const currentSubscription = get().subscriptions.find(
          (subscription) => subscription.id === subscriptionId
        );

        if (!currentSubscription) return;

        const syncedSubscription = await syncSubscriptionNotification(
          { ...currentSubscription, ...updates },
          true
        );

        set((state) => {
          const subscriptions = state.subscriptions.map((subscription) =>
            subscription.id === subscriptionId ? syncedSubscription : subscription
          );

          return {
            subscriptions,
            totalBalance: getTotalBalance(subscriptions),
          };
        });
      },
      deleteSubscription: async (subscriptionId) => {
        const currentSubscription = get().subscriptions.find(
          (subscription) => subscription.id === subscriptionId
        );

        await cancelSubscriptionNotification(currentSubscription?.notificationId);

        set((state) => {
          const subscriptions = state.subscriptions.filter(
            (subscription) => subscription.id !== subscriptionId
          );

          return {
            subscriptions,
            totalBalance: getTotalBalance(subscriptions),
          };
        });
      },
      setSubscriptions: (subscriptions) => ({
        subscriptions,
        totalBalance: getTotalBalance(subscriptions),
      }),
      syncNotifications: async (promptForPermission = false) => {
        const syncedSubscriptions = await syncAllSubscriptionNotifications(
          get().subscriptions,
          promptForPermission
        );

        set({
          subscriptions: syncedSubscriptions,
          totalBalance: getTotalBalance(syncedSubscriptions),
        });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'yourautopay-subscriptions',
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({
        subscriptions: state.subscriptions,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const subscriptions = state.subscriptions?.length
          ? state.subscriptions
          : HOME_SUBSCRIPTIONS;

        state.setSubscriptions(subscriptions);
        state.setHasHydrated(true);
      },
    }
  )
);
