export const PAYMENT_STATUS_VALUES = ['PENDING', 'CONFIRMED', 'CANCELED', 'CHARGEBACKED'] as const;

export type TPaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELED: 'CANCELED',
    CHARGEBACKED: 'CHARGEBACKED',
} as const satisfies Record<TPaymentStatus, TPaymentStatus>;

const paymentStatusValues: readonly string[] = PAYMENT_STATUS_VALUES;

export const isPaymentStatusGuard = (value: unknown): value is TPaymentStatus =>
    typeof value === 'string' && paymentStatusValues.includes(value);
