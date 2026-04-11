import { SplashScreen, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import '@/global.css';
import { useFonts } from 'expo-font';
import { useEffect, useRef } from 'react';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/src/config/posthog';
import { useAppStore } from '@/lib/appStore';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import { initializeNotificationSystem } from '@/lib/notificationService';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);
  const appHydrated = useAppStore((state) => state.hasHydrated);
  const subscriptionsHydrated = useSubscriptionStore((state) => state.hasHydrated);
  const syncNotifications = useSubscriptionStore((state) => state.syncNotifications);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      const sanitizedParams = Object.keys(params).reduce((acc, key) => {
        if (['id', 'tab', 'view'].includes(key)) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, string | string[]>);

      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...sanitizedParams,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
  });

  useEffect(() => {
    void initializeNotificationSystem();
  }, []);

  useEffect(() => {
    if (fontsLoaded && appHydrated && subscriptionsHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appHydrated, subscriptionsHydrated]);

  useEffect(() => {
    if (!subscriptionsHydrated) return;
    void syncNotifications(false);
  }, [subscriptionsHydrated, syncNotifications]);

  if (!fontsLoaded || !appHydrated || !subscriptionsHydrated) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
      }}
    >
      <RootLayoutContent />
    </PostHogProvider>
  );
}
