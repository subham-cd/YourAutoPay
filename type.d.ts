import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        renewalDate?: string;
        color?: string;
        notificationsEnabled?: boolean;
        remindBeforeDays?: number;
        notificationId?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onEditPress?: () => void;
        onDeletePress?: () => void;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
        timeLeftLabel: string;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }

    interface SubscriptionFormValues {
        name: string;
        price: string;
        billing: "Monthly" | "Yearly";
        category: "Entertainment" | "AI Tools" | "Developer Tools" | "Design" | "Productivity" | "Other";
        paymentMethodInput: string;
        renewalDateInput: string;
        renewalTimeInput: string;
        renewalPeriodInput: "AM" | "PM";
        notificationsEnabled: boolean;
        remindBeforeDays: number;
    }
}

export {};
