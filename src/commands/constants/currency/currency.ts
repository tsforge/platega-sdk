import { z } from 'zod';

export const CURRENCY_VALUES = ['RUB', 'USD', 'EUR', 'USDT'] as const;

export type TCurrency = (typeof CURRENCY_VALUES)[number];

export const CURRENCY = {
    RUB: 'RUB',
    USD: 'USD',
    EUR: 'EUR',
    USDT: 'USDT',
} as const satisfies Record<TCurrency, TCurrency>;

const currencyValues: readonly string[] = CURRENCY_VALUES;

export const isCurrencyGuard = (value: unknown): value is TCurrency =>
    typeof value === 'string' && currencyValues.includes(value);

// Enum of known currencies + any other string
export const CurrencySchema = z.union([z.enum(CURRENCY_VALUES), z.string()]);
