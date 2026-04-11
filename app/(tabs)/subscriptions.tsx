import {Alert, Text, View, TextInput, FlatList} from 'react-native'
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useState } from "react";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptionStore } from "@/lib/subscriptionStore";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import { usePostHog } from 'posthog-react-native';

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);
    const { subscriptions, updateSubscription, deleteSubscription } = useSubscriptionStore();
    const posthog = usePostHog();

    const filteredSubscriptions = subscriptions.filter((subscription) =>
        subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscription.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscription.plan?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEditSubscription = (subscription: Subscription) => {
        setSubscriptionToEdit(subscription);
        setIsModalVisible(true);
    };

    const handleSaveSubscription = async (subscription: Subscription) => {
        await updateSubscription(subscription.id, subscription);
        setSubscriptionToEdit(null);
    };

    const handleDeleteSubscription = (subscription: Subscription) => {
        Alert.alert(
            'Delete subscription',
            `Remove ${subscription.name} from your tracked subscriptions?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteSubscription(subscription.id);
                        if (expandedId === subscription.id) {
                            setExpandedId(null);
                        }
                        posthog.capture('subscription_deleted', {
                            subscription_id: subscription.id,
                            subscription_name: subscription.name,
                        });
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                    <View className="px-5 pt-5">
                        <Text className="text-3xl font-bold text-dark mb-5">Subscriptions</Text>
                        <TextInput
                            className="bg-card rounded-xl px-4 py-3 text-dark mb-4 border-2"
                            placeholder="Search subscriptions..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                }
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedId === item.id}
                        onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        onEditPress={() => handleEditSubscription(item)}
                        onDeletePress={() => handleDeleteSubscription(item)}
                    />
                )}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
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
    )
}
export default Subscriptions
