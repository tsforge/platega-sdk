export const CALLBACK_STATUS_VALUES = ['CONFIRMED', 'CANCELED', 'CHARGEBACKED'] as const;

export type TCallbackStatus = (typeof CALLBACK_STATUS_VALUES)[number];

export const CALLBACK_STATUS = {
    CONFIRMED: 'CONFIRMED',
    CANCELED: 'CANCELED',
    CHARGEBACKED: 'CHARGEBACKED',
} as const satisfies Record<TCallbackStatus, TCallbackStatus>;

const callbackStatusValues: readonly string[] = CALLBACK_STATUS_VALUES;

export const isCallbackStatusGuard = (value: unknown): value is TCallbackStatus =>
    typeof value === 'string' && callbackStatusValues.includes(value);
