import { Alert, Image, Pressable, ScrollView, Text, TextInput, View, Share, Linking } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system/legacy';
import images from '@/constants/images';
import { useAppStore } from '@/lib/appStore';
import { useSubscriptionStore } from '@/lib/subscriptionStore';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const profileName = useAppStore((state) => state.profileName);
  const setProfileName = useAppStore((state) => state.setProfileName);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const setSubscriptions = useSubscriptionStore((state) => state.setSubscriptions);
  
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
    Alert.alert('Success', 'Profile name updated successfully.');
  };

  const handleRestartOnboarding = () => {
    resetOnboarding();
    posthog.capture('onboarding_restarted');
    router.replace('/onboarding');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:subham0506singh@gmail.com?subject=YouAutoPay Support Request');
  };

  const handleRateApp = () => {
    // Placeholder for Google Play Store deep link
    Linking.openURL('https://play.google.com/store/apps/details?id=com.yourautopay.app').catch(() => {
      Alert.alert('Notice', 'Play Store link is not available yet.');
    });
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out YouAutoPay, a simple and secure app to track all your subscriptions locally! https://play.google.com/store/apps/details?id=com.yourautopay.app',
      });
      posthog.capture('app_shared');
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL('https://yourautopay.com/privacy-policy').catch(() => {
      Alert.alert('Notice', 'Privacy Policy is currently being drafted.');
    });
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://yourautopay.com/terms').catch(() => {
      Alert.alert('Notice', 'Terms of Service is currently being drafted.');
    });
  };

  const handleExportData = async () => {
    try {
      const data = JSON.stringify(subscriptions, null, 2);
      const uri = FileSystem.documentDirectory + 'subscriptions-backup.json';
      await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 });
      
      await Share.share({
        url: uri,
        message: 'Here is my YouAutoPay subscription backup.',
      });
      posthog.capture('data_exported');
    } catch (error) {
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Subscriptions',
      'Are you sure you want to delete all your tracked subscriptions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive', 
          onPress: () => {
            setSubscriptions([]);
            posthog.capture('all_data_cleared');
            Alert.alert('Data Cleared', 'All subscriptions have been deleted.');
          } 
        }
      ]
    );
  };

  const AppVersion = Application.nativeApplicationVersion || '1.0.0';
  const BuildVersion = Application.nativeBuildVersion || '1';

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <Text className="text-3xl font-sans-bold text-primary mb-6">Settings</Text>

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

        <Text className="text-base font-sans-bold text-primary mb-3 mt-2">Support & Feedback</Text>
        <View className="auth-card mb-5 !mt-0 !p-2">
          <Pressable className="flex-row items-center justify-between p-3 border-b border-border/50" onPress={handleContactSupport}>
            <Text className="text-base font-sans-medium text-primary">Contact Support</Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">Email</Text>
          </Pressable>
          <Pressable className="flex-row items-center justify-between p-3 border-b border-border/50" onPress={handleRateApp}>
            <Text className="text-base font-sans-medium text-primary">Rate YouAutoPay</Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">Play Store</Text>
          </Pressable>
          <Pressable className="flex-row items-center justify-between p-3" onPress={handleShareApp}>
            <Text className="text-base font-sans-medium text-primary">Share App</Text>
            <Text className="text-sm font-sans-medium text-muted-foreground">Invite friends</Text>
          </Pressable>
        </View>

        <Text className="text-base font-sans-bold text-primary mb-3 mt-2">Legal</Text>
        <View className="auth-card mb-5 !mt-0 !p-2">
          <Pressable className="flex-row items-center justify-between p-3 border-b border-border/50" onPress={handleOpenPrivacyPolicy}>
            <Text className="text-base font-sans-medium text-primary">Privacy Policy</Text>
          </Pressable>
          <Pressable className="flex-row items-center justify-between p-3" onPress={handleOpenTerms}>
            <Text className="text-base font-sans-medium text-primary">Terms of Service</Text>
          </Pressable>
        </View>

        <Text className="text-base font-sans-bold text-primary mb-3 mt-2">Data Management</Text>
        <View className="auth-card mb-5 !mt-0 !p-4 gap-4">
          <View>
            <Text className="text-sm font-sans-medium text-muted-foreground mb-3">
              Your data is stored locally on this device using secure storage. You can backup your subscriptions or reset your data completely.
            </Text>
            <View className="flex-row gap-3">
              <Pressable className="flex-1 items-center justify-center rounded-xl bg-primary py-3" onPress={handleExportData}>
                <Text className="text-sm font-sans-bold text-background">Export Backup</Text>
              </Pressable>
              <Pressable className="flex-1 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 py-3" onPress={handleClearData}>
                <Text className="text-sm font-sans-bold text-destructive">Clear Data</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable className="auth-button bg-primary mb-6" onPress={handleRestartOnboarding}>
          <Text className="auth-button-text text-background">Restart Onboarding</Text>
        </Pressable>
        
        <View className="items-center pb-6">
          <Text className="text-xs font-sans-medium text-muted-foreground">Version {AppVersion} ({BuildVersion})</Text>
          <Text className="text-xs font-sans-medium text-muted-foreground mt-1">Made with ♥</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
