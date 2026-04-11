import { Redirect } from 'expo-router';
import { useAppStore } from '@/lib/appStore';

export default function Index() {
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);

  return <Redirect href={onboardingCompleted ? '/(tabs)' : '/onboarding'} />;
}
