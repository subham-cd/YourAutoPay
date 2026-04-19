import { icons } from "./icons";

export const CATEGORIES: SubscriptionFormValues['category'][] = [
    'Entertainment',
    'AI Tools',
    'Developer Tools',
    'Design',
    'Productivity',
    'Other',
];

export const CATEGORY_COLORS: Record<SubscriptionFormValues['category'], string> = {
    Entertainment: '#ff6b6b',
    'AI Tools': '#b8d4e3',
    'Developer Tools': '#e8def8',
    Design: '#f5c542',
    Productivity: '#95e1d3',
    Other: '#d4d4d4',
};

export const tabs: AppTab[] = [
    { name: "index", title: "Home", icon: icons.home },
    { name: "subscriptions", title: "Subscriptions", icon: icons.wallet },
    { name: "insights", title: "Insights", icon: icons.activity },
    { name: "settings", title: "Settings", icon: icons.setting },
];

export const HOME_USER = {
    name: "Subham Singh",
};

export const HOME_BALANCE = {
    amount: 2489.48,
    nextRenewalDate: "2026-03-18T09:00:00.000Z",
};

export const UPCOMING_SUBSCRIPTIONS: UpcomingSubscription[] = [
    {
        id: "spotify",
        icon: icons.spotify,
        name: "Spotify",
        price: 5.99,
        currency: "INR",
        daysLeft: 2,
        timeLeftLabel: "2 days left",
    },
    {
        id: "notion",
        icon: icons.notion,
        name: "Notion",
        price: 12.0,
        currency: "INR",
        daysLeft: 4,
        timeLeftLabel: "4 days left",
    },
    {
        id: "figma",
        icon: icons.figma,
        name: "Figma",
        price: 15.0,
        currency: "INR",
        daysLeft: 6,
        timeLeftLabel: "6 days left",
    },
];

export const HOME_SUBSCRIPTIONS: Subscription[] = [
    {
        id: "adobe-creative-cloud",
        icon: icons.adobe,
        name: "Adobe Creative Cloud",
        plan: "Teams Plan",
        category: "Design",
        paymentMethod: "Visa ending in 8530",
        status: "active",
        startDate: "2025-03-20T10:00:00.000Z",
        price: 77.49,
        currency: "INR",
        billing: "Monthly",
        renewalDate: "2026-03-20T10:00:00.000Z",
        color: "#f5c542",
        notificationsEnabled: true,
        remindBeforeDays: 3,
    },
    {
        id: "github-pro",
        icon: icons.github,
        name: "GitHub Pro",
        plan: "Developer",
        category: "Developer Tools",
        paymentMethod: "Mastercard ending in 2408",
        status: "active",
        startDate: "2024-11-24T10:00:00.000Z",
        price: 9.99,
        currency: "INR",
        billing: "Monthly",
        renewalDate: "2026-03-24T10:00:00.000Z",
        color: "#e8def8",
        notificationsEnabled: true,
        remindBeforeDays: 1,
    },
    {
        id: "claude-pro",
        icon: icons.claude,
        name: "Claude Pro",
        plan: "Pro Plan",
        category: "AI Tools",
        paymentMethod: "Amex ending in 1010",
        status: "paused",
        startDate: "2025-06-27T10:00:00.000Z",
        price: 20.0,
        currency: "INR",
        billing: "Monthly",
        renewalDate: "2026-03-27T10:00:00.000Z",
        color: "#b8d4e3",
        notificationsEnabled: false,
        remindBeforeDays: 1,
    },
    {
        id: "canva-pro",
        icon: icons.canva,
        name: "Canva Pro",
        plan: "Yearly Access",
        category: "Design",
        paymentMethod: "Visa ending in 7784",
        status: "cancelled",
        startDate: "2024-04-02T10:00:00.000Z",
        price: 119.99,
        currency: "INR",
        billing: "Yearly",
        renewalDate: "2026-04-02T10:00:00.000Z",
        color: "#b8e8d0",
        notificationsEnabled: true,
        remindBeforeDays: 7,
    },
];
