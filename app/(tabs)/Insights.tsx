import '@/global.css';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { useMemo, useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';
import { useSubscriptionStore } from '@/lib/subscriptionStore';
import { formatCurrency } from '@/lib/utils';
import ListHeading from '@/components/ListHeading';
import { CATEGORY_COLORS } from '@/constants/data';
import { clsx } from 'clsx';

const SafeAreaView = styled(RNSafeAreaView);

export default function Insights() {
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptionStore();

  useEffect(() => {
    posthog.capture('insights_viewed');
  }, []);

  const stats = useMemo(() => {
    let trueMonthly = 0;
    const categoryTotals: Record<string, number> = {};

    subscriptions.forEach((sub) => {
      const monthlyPrice = sub.billing === 'Yearly' ? sub.price / 12 : sub.price;
      trueMonthly += monthlyPrice;

      const cat = sub.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + monthlyPrice;
    });

    const topSubscriptions = [...subscriptions]
      .sort((a, b) => {
        const priceA = a.billing === 'Yearly' ? a.price / 12 : a.price;
        const priceB = b.billing === 'Yearly' ? b.price / 12 : b.price;
        return priceB - priceA;
      })
      .slice(0, 4);

    const categories = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other,
        percentage: trueMonthly > 0 ? (amount / trueMonthly) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      trueMonthly,
      trueYearly: trueMonthly * 12,
      topSubscriptions,
      categories,
    };
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <View className="mb-6">
          <Text className="text-3xl font-sans-bold text-primary">Insights</Text>
          <Text className="text-sm font-sans-medium text-muted-foreground">Analyze your subscription spending</Text>
        </View>

        <View className="home-balance-card mb-8">
          <View>
            <Text className="home-balance-label">True Monthly Cost</Text>
            <Text className="home-balance-amount">{formatCurrency(stats.trueMonthly)}</Text>
          </View>
          <View className="mt-4 flex-row items-center justify-between border-t border-white/20 pt-4">
            <View>
              <Text className="text-xs font-sans-medium text-white/70 uppercase tracking-wider">Projected Yearly</Text>
              <Text className="text-xl font-sans-bold text-white">{formatCurrency(stats.trueYearly)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs font-sans-medium text-white/70 uppercase tracking-wider">Active Subs</Text>
              <Text className="text-xl font-sans-bold text-white">{subscriptions.length}</Text>
            </View>
          </View>
        </View>

        <View className="mb-8">
          <ListHeading title="Top Expenses" />
          <View className="gap-4">
            {stats.topSubscriptions.map((sub) => (
              <View key={sub.id} className="sub-card bg-card flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View 
                    className="size-10 rounded-full items-center justify-center" 
                    style={{ backgroundColor: sub.color || '#d4d4d4' }}
                  >
                    <Text className="text-xs font-sans-bold text-primary">
                      {sub.name.substring(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-sans-bold text-primary" numberOfLines={1}>{sub.name}</Text>
                    <Text className="text-xs font-sans-medium text-muted-foreground">{sub.billing} plan</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-base font-sans-bold text-primary">{formatCurrency(sub.price, sub.currency)}</Text>
                  <Text className="text-[10px] font-sans-medium text-muted-foreground">
                    {sub.billing === 'Yearly' ? `${formatCurrency(sub.price / 12)}/mo` : 'monthly'}
                  </Text>
                </View>
              </View>
            ))}
            {subscriptions.length === 0 && (
              <Text className="home-empty-state">No subscriptions to analyze yet.</Text>
            )}
          </View>
        </View>

        <View className="mb-4">
          <ListHeading title="Spending by Category" />
          <View className="gap-5">
            {stats.categories.map((cat) => (
              <View key={cat.name} className="gap-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="size-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <Text className="text-base font-sans-semibold text-primary">{cat.name}</Text>
                  </View>
                  <Text className="text-base font-sans-bold text-primary">{formatCurrency(cat.amount)}</Text>
                </View>
                <View className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full" 
                    style={{ 
                      backgroundColor: cat.color,
                      width: `${cat.percentage}%` 
                    }} 
                  />
                </View>
                <Text className="text-[10px] font-sans-medium text-muted-foreground text-right">
                  {cat.percentage.toFixed(1)}% of total
                </Text>
              </View>
            ))}
            {stats.categories.length === 0 && (
              <Text className="home-empty-state">Add subscriptions to see category breakdown.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
