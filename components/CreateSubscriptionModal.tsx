import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { posthog } from '@/src/config/posthog';
import {
  getNotificationSupportState,
} from '@/lib/notificationService';
import { resolveSubscriptionIcon } from '@/lib/subscriptionIconResolver';
import { toDateInputValue, toPeriodInputValue, toTimeInputValue } from '@/lib/utils';

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
  initialValues?: Subscription | null;
}

const CATEGORIES: SubscriptionFormValues['category'][] = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Other',
];

const CATEGORY_COLORS: Record<SubscriptionFormValues['category'], string> = {
  Entertainment: '#ff6b6b',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#f5c542',
  Productivity: '#95e1d3',
  Other: '#d4d4d4',
};

const REMINDER_OPTIONS = [1, 3, 7] as const;

const getDefaultRenewalDate = (billing: SubscriptionFormValues['billing']) =>
  dayjs().add(1, billing === 'Monthly' ? 'month' : 'year');

const getFormValues = (
  subscription?: Subscription | null
): SubscriptionFormValues => {
  const fallbackRenewalDate = getDefaultRenewalDate(
    subscription?.billing === 'Yearly' ? 'Yearly' : 'Monthly'
  );
  const renewalValue = subscription?.renewalDate
    ? dayjs(subscription.renewalDate)
    : fallbackRenewalDate;

  return {
    name: subscription?.name ?? '',
    price: typeof subscription?.price === 'number' ? String(subscription.price) : '',
    billing: subscription?.billing === 'Yearly' ? 'Yearly' : 'Monthly',
    category:
      (subscription?.category as SubscriptionFormValues['category']) ?? 'Other',
    paymentMethodInput: subscription?.paymentMethod ?? '',
    renewalDateInput: toDateInputValue(renewalValue.toISOString()),
    renewalTimeInput: toTimeInputValue(renewalValue.toISOString()) || '09:00',
    renewalPeriodInput: toPeriodInputValue(renewalValue.toISOString()),
    notificationsEnabled: subscription?.notificationsEnabled ?? true,
    remindBeforeDays: subscription?.remindBeforeDays ?? 3,
  };
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billing, setBilling] =
    useState<SubscriptionFormValues['billing']>('Monthly');
  const [category, setCategory] =
    useState<SubscriptionFormValues['category']>('Other');
  const [paymentMethodInput, setPaymentMethodInput] = useState('');
  const [renewalDateInput, setRenewalDateInput] = useState('');
  const [renewalTimeInput, setRenewalTimeInput] = useState('09:00');
  const [renewalPeriodInput, setRenewalPeriodInput] =
    useState<SubscriptionFormValues['renewalPeriodInput']>('AM');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [remindBeforeDays, setRemindBeforeDays] = useState(3);

  const isEditing = Boolean(initialValues);
  const notificationSupport = useMemo(() => getNotificationSupportState(), []);

  useEffect(() => {
    if (!visible) return;

    const values = getFormValues(initialValues);
    setName(values.name);
    setPrice(values.price);
    setBilling(values.billing);
    setCategory(values.category);
    setPaymentMethodInput(values.paymentMethodInput);
    setRenewalDateInput(values.renewalDateInput);
    setRenewalTimeInput(values.renewalTimeInput);
    setRenewalPeriodInput(values.renewalPeriodInput);
    setNotificationsEnabled(values.notificationsEnabled);
    setRemindBeforeDays(values.remindBeforeDays);
  }, [initialValues, visible]);

  const isValidPrice = () => {
    const trimmedPrice = price.trim();
    if (!trimmedPrice) return false;
    if (!/^\s*[+-]?(\d+(\.\d+)?|\.\d+)\s*$/.test(trimmedPrice)) return false;

    const numValue = Number(trimmedPrice);
    return Number.isFinite(numValue) && numValue > 0;
  };

  const parsedRenewalDateTime = useMemo(() => {
    const trimmedDate = renewalDateInput.trim();
    const trimmedTime = renewalTimeInput.trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      return null;
    }

    if (!/^\d{2}:\d{2}$/.test(trimmedTime)) {
      return null;
    }

    const [hoursString, minutesString] = trimmedTime.split(':');
    const hours = Number(hoursString);
    const minutes = Number(minutesString);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    const normalizedHour =
      renewalPeriodInput === 'AM'
        ? hours % 12
        : (hours % 12) + 12;

    const parsedDateTime = dayjs(trimmedDate)
      .hour(normalizedHour)
      .minute(minutes)
      .second(0)
      .millisecond(0);
    return parsedDateTime.isValid() ? parsedDateTime : null;
  }, [renewalDateInput, renewalPeriodInput, renewalTimeInput]);

  const renewalDateError = useMemo(() => {
    if (!renewalDateInput.trim()) {
      return 'Renewal date is required';
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(renewalDateInput.trim())) {
      return 'Use date format YYYY-MM-DD';
    }

    if (!renewalTimeInput.trim()) {
      return 'Renewal time is required';
    }

    if (!/^\d{2}:\d{2}$/.test(renewalTimeInput.trim())) {
      return 'Use time format hh:mm';
    }

    if (!parsedRenewalDateTime) {
      return 'Enter a valid renewal date and time';
    }

    if (!parsedRenewalDateTime.isAfter(dayjs())) {
      return 'Renewal date must be in the future';
    }

    if (
      notificationsEnabled &&
      !parsedRenewalDateTime.subtract(remindBeforeDays, 'day').isAfter(dayjs())
    ) {
      return `Reminder time has already passed. Choose a later renewal date or a smaller reminder window.`;
    }

    return null;
  }, [
    notificationsEnabled,
    parsedRenewalDateTime,
    remindBeforeDays,
    renewalDateInput,
    renewalTimeInput,
  ]);

  const isValidForm = name.trim() !== '' && isValidPrice() && !renewalDateError;

  const resetForm = () => {
    const values = getFormValues(null);
    setName(values.name);
    setPrice(values.price);
    setBilling(values.billing);
    setCategory(values.category);
    setPaymentMethodInput(values.paymentMethodInput);
    setRenewalDateInput(values.renewalDateInput);
    setRenewalTimeInput(values.renewalTimeInput);
    setRenewalPeriodInput(values.renewalPeriodInput);
    setNotificationsEnabled(values.notificationsEnabled);
    setRemindBeforeDays(values.remindBeforeDays);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBillingChange = (nextBilling: SubscriptionFormValues['billing']) => {
    setBilling(nextBilling);

    if (!initialValues) {
      const nextRenewalDate = getDefaultRenewalDate(nextBilling);
      setRenewalDateInput(nextRenewalDate.format('YYYY-MM-DD'));
      setRenewalTimeInput(nextRenewalDate.format('hh:mm'));
      setRenewalPeriodInput(nextRenewalDate.format('A') as 'AM' | 'PM');
    }
  };

  const handleSubmit = () => {
    if (!isValidForm || !parsedRenewalDateTime) return;

    const priceValue = Number(price.trim());
    const now = dayjs();

    const nextSubscription: Subscription = {
      id: initialValues?.id ?? `sub-${Date.now()}`,
      icon: initialValues?.icon ?? resolveSubscriptionIcon(name.trim()),
      name: name.trim(),
      plan: initialValues?.plan,
      category,
      paymentMethod: paymentMethodInput.trim() || undefined,
      status: initialValues?.status ?? 'active',
      startDate: initialValues?.startDate ?? now.toISOString(),
      price: priceValue,
      currency: initialValues?.currency ?? 'INR',
      billing,
      renewalDate: parsedRenewalDateTime.toISOString(),
      color: CATEGORY_COLORS[category],
      notificationsEnabled,
      remindBeforeDays,
      notificationId: initialValues?.notificationId,
    };

    onSubmit(nextSubscription);

    posthog.capture(isEditing ? 'subscription_updated' : 'subscription_created', {
      subscription_id: nextSubscription.id,
      subscription_name: nextSubscription.name,
      subscription_price: nextSubscription.price,
      subscription_billing: nextSubscription.billing,
      subscription_category: nextSubscription.category,
      renewal_date: nextSubscription.renewalDate,
      notifications_enabled: nextSubscription.notificationsEnabled,
      remind_before_days: nextSubscription.remindBeforeDays,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Pressable
            className="modal-container"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="modal-header">
              <Text className="modal-title">
                {isEditing ? 'Edit Subscription' : 'New Subscription'}
              </Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">X</Text>
              </Pressable>
            </View>

            <ScrollView
              className="p-5"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 20, paddingBottom: 20 }}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  placeholder="Subscription name"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className="auth-input"
                  placeholder="0.00"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Payment method</Text>
                <TextInput
                  className="auth-input"
                  placeholder="Google Pay, PhonePe, Visa, UPI..."
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={paymentMethodInput}
                  onChangeText={setPaymentMethodInput}
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Billing</Text>
                <View className="picker-row">
                  <Pressable
                    className={clsx(
                      'picker-option',
                      billing === 'Monthly' && 'picker-option-active'
                    )}
                    onPress={() => handleBillingChange('Monthly')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        billing === 'Monthly' && 'picker-option-text-active'
                      )}
                    >
                      Monthly
                    </Text>
                  </Pressable>
                  <Pressable
                    className={clsx(
                      'picker-option',
                      billing === 'Yearly' && 'picker-option-active'
                    )}
                    onPress={() => handleBillingChange('Yearly')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        billing === 'Yearly' && 'picker-option-text-active'
                      )}
                    >
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Next renewal date</Text>
                <TextInput
                  className={clsx('auth-input', renewalDateError && 'auth-input-error')}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={renewalDateInput}
                  onChangeText={setRenewalDateInput}
                  autoCapitalize="none"
                />
                <Text className="auth-helper">Use format `YYYY-MM-DD`</Text>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Renewal time</Text>
                <View className="picker-row">
                  <TextInput
                    className={clsx('auth-input flex-1', renewalDateError && 'auth-input-error')}
                    placeholder="hh:mm"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    value={renewalTimeInput}
                    onChangeText={setRenewalTimeInput}
                    autoCapitalize="none"
                  />
                  <Pressable
                    className={clsx(
                      'picker-option',
                      renewalPeriodInput === 'AM' && 'picker-option-active'
                    )}
                    onPress={() => setRenewalPeriodInput('AM')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        renewalPeriodInput === 'AM' && 'picker-option-text-active'
                      )}
                    >
                      AM
                    </Text>
                  </Pressable>
                  <Pressable
                    className={clsx(
                      'picker-option',
                      renewalPeriodInput === 'PM' && 'picker-option-active'
                    )}
                    onPress={() => setRenewalPeriodInput('PM')}
                  >
                    <Text
                      className={clsx(
                        'picker-option-text',
                        renewalPeriodInput === 'PM' && 'picker-option-text-active'
                      )}
                    >
                      PM
                    </Text>
                  </Pressable>
                </View>
                <Text className="auth-helper">12-hour format, for example `09:30` with `AM` or `06:45` with `PM`</Text>
                {renewalDateError && <Text className="auth-error">{renewalDateError}</Text>}
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((itemCategory) => (
                    <Pressable
                      key={itemCategory}
                      className={clsx(
                        'category-chip',
                        category === itemCategory && 'category-chip-active'
                      )}
                      onPress={() => setCategory(itemCategory)}
                    >
                      <Text
                        className={clsx(
                          'category-chip-text',
                          category === itemCategory &&
                            'category-chip-text-active'
                        )}
                      >
                        {itemCategory}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="auth-field">
                <View className="modal-toggle-row">
                  <View className="flex-1">
                    <Text className="auth-label">Reminder</Text>
                    <Text className="auth-helper">
                      {notificationSupport.supported
                        ? 'Local reminders will be scheduled for this device.'
                        : notificationSupport.reason}
                    </Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#d9d2b6', true: '#ea7a53' }}
                    thumbColor="#fff9e3"
                  />
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Remind me</Text>
                <View className="picker-row">
                  {REMINDER_OPTIONS.map((days) => (
                    <Pressable
                      key={days}
                      className={clsx(
                        'picker-option',
                        remindBeforeDays === days && 'picker-option-active',
                        !notificationsEnabled && 'picker-option-disabled'
                      )}
                      onPress={() => setRemindBeforeDays(days)}
                      disabled={!notificationsEnabled}
                    >
                      <Text
                        className={clsx(
                          'picker-option-text',
                          remindBeforeDays === days && 'picker-option-text-active',
                          !notificationsEnabled && 'picker-option-text-disabled'
                        )}
                      >
                        {days} day{days === 1 ? '' : 's'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                className={clsx('auth-button', !isValidForm && 'auth-button-disabled')}
                onPress={handleSubmit}
                disabled={!isValidForm}
              >
                <Text className="auth-button-text">
                  {isEditing ? 'Save Changes' : 'Create Subscription'}
                </Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
