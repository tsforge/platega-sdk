import { z } from 'zod';

export const PAYMENT_METHOD_VALUES = [2, 3, 6, 11, 12, 13] as const;

export type TPaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

export const PAYMENT_METHOD = {
    SBP: 2,
    ERIP: 3,
    SUBSCRIPTION: 6,
    CARD_ACQUIRING: 11,
    INTERNATIONAL: 12,
    CRYPTO: 13,
} as const satisfies Record<string, TPaymentMethod>;

const paymentMethodValues: readonly number[] = PAYMENT_METHOD_VALUES;

export const isPaymentMethodGuard = (value: unknown): value is TPaymentMethod =>
    typeof value === 'number' && paymentMethodValues.includes(value);

export const PaymentMethodSchema = z.literal(PAYMENT_METHOD_VALUES);
