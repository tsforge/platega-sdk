import { z } from 'zod';

export const SUBSCRIPTION_INTERVAL_VALUES = ['1', '2', '3', '4'] as const;

export type TSubscriptionInterval = (typeof SUBSCRIPTION_INTERVAL_VALUES)[number];

export const SUBSCRIPTION_INTERVAL = {
    DAY: '1',
    WEEK: '2',
    MONTH: '3',
    YEAR: '4',
} as const satisfies Record<string, TSubscriptionInterval>;

const subscriptionIntervalValues: readonly string[] = SUBSCRIPTION_INTERVAL_VALUES;

export const isSubscriptionIntervalGuard = (value: unknown): value is TSubscriptionInterval =>
    typeof value === 'string' && subscriptionIntervalValues.includes(value);

export const SubscriptionIntervalSchema = z.enum(SUBSCRIPTION_INTERVAL_VALUES);
