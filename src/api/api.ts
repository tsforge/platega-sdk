export const PLATEGA_API = {
    CREATE_PAYMENT: '/transaction/process',
    CREATE_PAYMENT_LINK_V2: '/v2/transaction/process',
    TRANSACTION: (id: string) => `/transaction/${id}`,
    BALANCES: '/balance/all',
    CONVERSIONS: '/transaction/balance-unlock-operations',
    CANCEL_SUPPORTED: (id: string) => `/transaction/${id}/cancel-supported`,
    CANCEL_TRANSACTION: (id: string) => `/transaction/${id}/cancel`,
    CREATE_PAYOUT_CARD_RUB: '/api/v1/payouts/card-rub',
    SAVED_CARDS: '/api/v1/cards',
};
