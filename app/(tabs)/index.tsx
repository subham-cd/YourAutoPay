import '@/global.css';
import { Alert, FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import images from '@/constants/images';
import { icons } from '@/constants/icons';
import { formatCurrency } from '@/lib/utils';
import ListHeading from '@/components/ListHeading';
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard';
import SubscriptionCard from '@/components/SubscriptionCard';
import CreateSubscriptionModal from '@/components/CreateSubscriptionModal';
import { usePostHog } from 'posthog-react-native';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import { useAppStore } from '@/lib/appStore';

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const router = useRouter();
  const posthog = usePostHog();
  const profileName = useAppStore((state) => state.profileName);
  const [currentTime, setCurrentTime] = useState(() => dayjs());
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);
  const { subscriptions, totalBalance, addSubscription, updateSubscription, deleteSubscription } =
    useSubscriptionStore();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const upcomingSubscriptions = useMemo(() => {
    const now = currentTime;
    const nextWeek = now.add(7, 'days');

    return subscriptions
      .filter(
        (subscription) =>
          subscription.status === 'active' &&
          subscription.renewalDate &&
          dayjs(subscription.renewalDate).isAfter(now) &&
          dayjs(subscription.renewalDate).isBefore(nextWeek)
      )
      .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)))
      .map((subscription) => ({
        renewalMoment: dayjs(subscription.renewalDate),
        id: subscription.id,
        icon: subscription.icon,
        name: subscription.name,
        price: subscription.price,
        currency: subscription.currency,
      }))
      .map((subscription) => {
        const minutesLeft = subscription.renewalMoment.diff(now, 'minute');
        const hoursLeft = subscription.renewalMoment.diff(now, 'hour');
        const daysLeft = Math.max(subscription.renewalMoment.diff(now, 'day'), 0);

        let timeLeftLabel = 'Last day';

        if (minutesLeft < 60) {
          timeLeftLabel = `${Math.max(minutesLeft, 1)} min left`;
        } else if (hoursLeft < 24) {
          timeLeftLabel = `${Math.max(hoursLeft, 1)} hr${hoursLeft === 1 ? '' : 's'} left`;
        } else if (daysLeft > 1) {
          timeLeftLabel = `${daysLeft} days left`;
        }

        return {
          id: subscription.id,
          icon: subscription.icon,
          name: subscription.name,
          price: subscription.price,
          currency: subscription.currency,
          daysLeft,
          timeLeftLabel,
        };
      });
  }, [currentTime, subscriptions]);

  const nextRenewalDate = useMemo(() => {
    const now = currentTime;

    return subscriptions
      .filter(
        (subscription) => subscription.renewalDate && dayjs(subscription.renewalDate).isAfter(now)
      )
      .sort((a, b) => dayjs(a.renewalDate).diff(dayjs(b.renewalDate)))[0]?.renewalDate;
  }, [currentTime, subscriptions]);

  const handleSubscriptionPress = (item: Subscription) => {
    const isExpanding = expandedSubscriptionId !== item.id;
    setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : item.id));
    posthog.capture(isExpanding ? 'subscription_expanded' : 'subscription_collapsed', {
      subscription_name: item.name,
      subscription_id: item.id,
    });
  };

  const handleSaveSubscription = async (subscription: Subscription) => {
    const isEditing = subscriptions.some((item) => item.id === subscription.id);

    if (isEditing) {
      await updateSubscription(subscription.id, subscription);
      setSubscriptionToEdit(null);
      return;
    }

    setSubscriptionToEdit(null);
    await addSubscription(subscription);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSubscriptionToEdit(subscription);
    setIsModalVisible(true);
  };

  const handleDeleteSubscription = (subscription: Subscription) => {
    Alert.alert('Delete subscription', `Remove ${subscription.name} from your tracked subscriptions?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSubscription(subscription.id);
          if (expandedSubscriptionId === subscription.id) {
            setExpandedSubscriptionId(null);
          }
          posthog.capture('subscription_deleted', {
            subscription_id: subscription.id,
            subscription_name: subscription.name,
          });
        },
      },
    ]);
  };

  const openCreateModal = () => {
    setSubscriptionToEdit(null);
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <Pressable className="home-user" onPress={() => router.push('/(tabs)/settings')}>
                <Image source={images.avatar} className="home-avatar" />
                <View>
                  <Text className="home-user-name">{profileName}</Text>
                  <Text className="home-user-subtitle">Open your preferences</Text>
                </View>
              </Pressable>

              <Pressable onPress={openCreateModal}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Total Subscription Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">{formatCurrency(totalBalance)}</Text>
                <Text className="home-balance-date">
                  {nextRenewalDate ? dayjs(nextRenewalDate).format('MM/DD') : '--/--'}
                </Text>
              </View>

              <Text className="home-balance-label">
                {subscriptions.length} tracked subscription{subscriptions.length === 1 ? '' : 's'}
              </Text>
            </View>
            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => handleSubscriptionPress(item)}
            onEditPress={() => handleEditSubscription(item)}
            onDeletePress={() => handleDeleteSubscription(item)}
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
        contentContainerClassName="pb-30"
      />

      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSubscriptionToEdit(null);
        }}
        onSubmit={handleSaveSubscription}
        initialValues={subscriptionToEdit}
      />
    </SafeAreaView>
  );
}
