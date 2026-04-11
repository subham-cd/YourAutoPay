import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { useAppStore } from '@/lib/appStore';

const SafeAreaView = styled(RNSafeAreaView);

export default function Onboarding() {
  const router = useRouter();
  const posthog = usePostHog();
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);
  const profileName = useAppStore((state) => state.profileName);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const [name, setName] = useState('');

  useEffect(() => {
    setName(profileName === 'You' ? '' : profileName);
  }, [profileName]);

  if (onboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  }

  const handleContinue = () => {
    const nextName = name.trim() || 'You';
    completeOnboarding(nextName);
    posthog.capture('onboarding_completed', {
      profile_name: nextName,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content onboarding-content">
            <View className="onboarding-hero">
              <View className="onboarding-badge">
                <Text className="onboarding-badge-text">YA</Text>
              </View>
              <Text className="onboarding-title">Track every autopay before it hits</Text>
              <Text className="onboarding-copy">
                Add your subscriptions, watch the total grow in one place, and get ready for reminders in the next step.
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">What should we call you?</Text>
                  <TextInput
                    className="auth-input"
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    autoCapitalize="words"
                    returnKeyType="done"
                  />
                  <Text className="auth-helper">
                    This name will appear on the home screen and in settings.
                  </Text>
                </View>

                <View className="onboarding-points">
                  <Text className="onboarding-point">Track monthly and yearly charges in one list.</Text>
                  <Text className="onboarding-point">See your total subscription spend update instantly.</Text>
                  <Text className="onboarding-point">Get the app ready for reminder notifications next.</Text>
                </View>

                <Pressable className="auth-button" onPress={handleContinue}>
                  <Text className="auth-button-text">Continue to your dashboard</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
