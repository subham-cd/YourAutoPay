import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import images from '@/constants/images';
import { useAppStore } from '@/lib/appStore';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const profileName = useAppStore((state) => state.profileName);
  const setProfileName = useAppStore((state) => state.setProfileName);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const [draftName, setDraftName] = useState(profileName);

  useEffect(() => {
    setDraftName(profileName);
  }, [profileName]);

  const handleSaveName = () => {
    const nextName = draftName.trim() || 'You';
    setProfileName(nextName);
    posthog.capture('profile_name_updated', {
      profile_name: nextName,
    });
  };

  const handleRestartOnboarding = () => {
    resetOnboarding();
    posthog.capture('onboarding_restarted');
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-3xl font-sans-bold text-primary mb-6">Preferences</Text>

      <View className="auth-card mb-5">
        <View className="flex-row items-center gap-4 mb-4">
          <Image source={images.avatar} className="size-16 rounded-full" />
          <View className="flex-1">
            <Text className="text-lg font-sans-bold text-primary">{profileName}</Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">
              Local profile for this device
            </Text>
          </View>
        </View>

        <View className="auth-form">
          <View className="auth-field">
            <Text className="auth-label">Display name</Text>
            <TextInput
              className="auth-input"
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
            />
          </View>

          <Pressable className="auth-button" onPress={handleSaveName}>
            <Text className="auth-button-text">Save Name</Text>
          </Pressable>
        </View>
      </View>

      <View className="auth-card mb-5">
        <Text className="text-base font-sans-semibold text-primary mb-3">About this MVP</Text>
        <View className="gap-2">
          <Text className="text-sm font-sans-medium text-muted-foreground">
            Your subscriptions now stay on this device after reloads.
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            The home avatar now opens this preferences screen instead of an auth profile.
          </Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">
            Local reminder notifications now use the subscription settings you choose.
          </Text>
        </View>
      </View>

      <Pressable className="auth-button bg-primary mb-3" onPress={handleRestartOnboarding}>
        <Text className="auth-button-text text-background">Restart Onboarding</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
