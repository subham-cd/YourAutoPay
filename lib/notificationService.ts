import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import { formatCurrency } from '@/lib/utils';

const REMINDER_CHANNEL_ID = 'subscription-reminders';
let notificationsInitialized = false;

type ExpoNotificationsModule = typeof import('expo-notifications');

function isNotificationsSupported() {
  return !(Platform.OS === 'android' && isRunningInExpoGo());
}

async function getNotificationsModule(): Promise<ExpoNotificationsModule | null> {
  if (!isNotificationsSupported()) {
    return null;
  }

  return import('expo-notifications');
}

export async function initializeNotificationSystem() {
  if (notificationsInitialized) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  notificationsInitialized = true;
}

export async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Subscription reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 200, 200],
    lightColor: '#ea7a53',
  });
}

export async function ensureNotificationPermissions(promptForPermission = true) {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  const existingPermissions = await Notifications.getPermissionsAsync();

  if (
    existingPermissions.granted ||
    existingPermissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  if (!promptForPermission) {
    return false;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return (
    requestedPermissions.granted ||
    requestedPermissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function cancelSubscriptionNotification(notificationId?: string) {
  if (!notificationId) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

function getNotificationDate(subscription: Subscription) {
  if (!subscription.renewalDate || !subscription.notificationsEnabled) {
    return null;
  }

  const remindBeforeDays = subscription.remindBeforeDays ?? 3;
  const notificationDate = dayjs(subscription.renewalDate).subtract(remindBeforeDays, 'day');

  if (!notificationDate.isValid() || !notificationDate.isAfter(dayjs())) {
    return null;
  }

  return notificationDate.toDate();
}

export async function scheduleSubscriptionNotification(
  subscription: Subscription,
  promptForPermission = true
) {
  const Notifications = await getNotificationsModule();
  if (!Notifications || !subscription.notificationsEnabled) {
    return undefined;
  }

  const notificationDate = getNotificationDate(subscription);
  if (!notificationDate) {
    return undefined;
  }

  const hasPermission = await ensureNotificationPermissions(promptForPermission);
  if (!hasPermission) {
    return undefined;
  }

  await ensureNotificationChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${subscription.name} renews soon`,
      body: `${formatCurrency(subscription.price, subscription.currency)} will be charged in ${
        subscription.remindBeforeDays ?? 3
      } day${(subscription.remindBeforeDays ?? 3) === 1 ? '' : 's'}.`,
      data: {
        subscriptionId: subscription.id,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notificationDate,
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
  });
}

export async function syncSubscriptionNotification(
  subscription: Subscription,
  promptForPermission = true
) {
  await cancelSubscriptionNotification(subscription.notificationId);

  const notificationId = await scheduleSubscriptionNotification(
    { ...subscription, notificationId: undefined },
    promptForPermission
  );

  return {
    ...subscription,
    notificationId,
  };
}

export async function syncAllSubscriptionNotifications(
  subscriptions: Subscription[],
  promptForPermission = false
) {
  return Promise.all(
    subscriptions.map((subscription) =>
      syncSubscriptionNotification(subscription, promptForPermission)
    )
  );
}

export function getNotificationSupportState() {
  return {
    supported: isNotificationsSupported(),
    reason: isNotificationsSupported()
      ? null
      : 'Local notification scheduling is disabled in Expo Go on Android. Use a development build to test it.',
  };
}
