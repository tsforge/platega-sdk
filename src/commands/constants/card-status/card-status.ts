export const CARD_STATUS_VALUES = ['ACTIVE', 'DISABLED', 'PENDING'] as const;

export type TCardStatus = (typeof CARD_STATUS_VALUES)[number];

export const CARD_STATUS = {
    ACTIVE: 'ACTIVE',
    DISABLED: 'DISABLED',
    PENDING: 'PENDING',
} as const satisfies Record<TCardStatus, TCardStatus>;

const cardStatusValues: readonly string[] = CARD_STATUS_VALUES;

export const isCardStatusGuard = (value: unknown): value is TCardStatus =>
    typeof value === 'string' && cardStatusValues.includes(value);
