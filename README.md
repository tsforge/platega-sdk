# Platega SDK

**English** | [Русский](./README.ru.md)

TypeScript SDK for the [Platega](https://platega.io) payment system: accept payments (SBP, cards, ERIP, crypto), check statuses, cancel transactions, pay out to cards and verify callbacks.

[Official Platega documentation](https://docs.platega.io)

---

## Table of contents

- [Features](#features)
- [Installation](#installation)
- [Getting your keys](#getting-your-keys)
- [Quick start: accept your first payment](#quick-start-accept-your-first-payment)
- [Setup](#setup)
- [Payments — `platega.payments`](#payments--plategapayments)
- [Balances — `platega.balances`](#balances--plategabalances)
- [Conversions — `platega.conversions`](#conversions--plategaconversions)
- [Refunds — `platega.refunds`](#refunds--plategarefunds)
- [Withdrawals — `platega.withdrawals`](#withdrawals--plategawithdrawals)
- [Callbacks: receiving notifications](#callbacks-receiving-notifications)
- [Error handling](#error-handling)
- [Constants and types](#constants-and-types)
- [Contributing](#contributing)

---

## Features

| What you need to do                              | SDK method                               |
| ------------------------------------------------ | ---------------------------------------- |
| Create a payment with a specific payment method  | `platega.payments.create()`              |
| Create a payment link (payer chooses the method) | `platega.payments.createLink()`          |
| Check payment status                             | `platega.payments.getById()`             |
| Get balances for all currencies                  | `platega.balances.getAll()`              |
| Conversion history                               | `platega.conversions.list()`             |
| Check whether a transaction can be cancelled     | `platega.refunds.checkCancelSupported()` |
| Cancel a transaction (refund)                    | `platega.refunds.cancel()`               |
| Pay out to a RUB card                            | `platega.withdrawals.createCardRub()`    |
| List saved cards for payouts                     | `platega.withdrawals.getSavedCards()`    |
| Verify that a callback really came from Platega  | `platega.verifyCallback()`               |

## Installation

```bash
npm install @tsforge7/platega-sdk
```

Requirements: Node.js 18+ (the built-in `fetch` is used).

## Getting your keys

You need two values — your Platega manager provides them during onboarding, and they are also available in the dashboard on the **"Settings"** page:

| Key            | What it is           | Example                                |
| -------------- | -------------------- | -------------------------------------- |
| `X-MerchantId` | Your shop identifier | `29ef6fa6-0d2b-466c-9604-0363a30436cc` |
| `X-Secret`     | Secret API key       | `iStHENoXjHdy78A4tGG3M6Tzq...`         |

> ⚠️ **Never commit keys to git and never use them in the frontend.** Keep them in environment variables. Anyone who knows your `X-Secret` can make requests on your behalf.

## Quick start: accept your first payment

```typescript
import { Platega } from '@tsforge7/platega-sdk';

// 1. Create a client (once per application)
const platega = new Platega({
    merchantId: process.env.PLATEGA_MERCHANT_ID!,
    secret: process.env.PLATEGA_SECRET!,
});

// 2. Create a payment link for 500 RUB
const payment = await platega.payments.createLink({
    paymentDetails: { amount: 500, currency: 'RUB' },
    description: 'Order #293',
    return: 'https://myshop.com/success', // where to return after payment
    failedUrl: 'https://myshop.com/fail', // where to return on failure
    payload: 'order-293', // your data, comes back in the callback
});

// 3. Send the customer to pay
console.log(payment.url); // → redirect the user to this link
console.log(payment.transactionId); // → store it, the callback references it

// 4. Once the customer pays, Platega sends a callback (see the callbacks section)
//    and/or you can check the status manually:
const status = await platega.payments.getById(payment.transactionId);
console.log(status.status); // 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'CHARGEBACKED'
```

That's it: link → redirect → callback. Details for each module below.

## Setup

```typescript
const platega = new Platega({
    merchantId: '...', // required — X-MerchantId from the dashboard
    secret: '...', // required — X-Secret from the dashboard
    baseUrl: 'https://app.platega.io', // optional, this is the default
});
```

The config is validated on creation: a missing key fails immediately with a clear error, not on the first request. The main class is built by composition: functionality is split into the `payments`, `balances`, `conversions`, `refunds` and `withdrawals` modules.

## Payments — `platega.payments`

### `create()` — payment with a specific method

Use it when you show the payment method choice to the customer yourself.

```typescript
const payment = await platega.payments.create({
    paymentMethod: 2, // payment method, see the table below
    paymentDetails: { amount: 500, currency: 'RUB' },
    description: 'Order #293', // the customer sees this text
    return: 'https://myshop.com/success',
    failedUrl: 'https://myshop.com/fail',
    payload: 'order-293', // arbitrary string, comes back in the callback
    metadata: {
        userId: '123456789', // payer ID in your system (needed for antifraud)
        userName: '@username',
    },
});

// payment.redirect — link to send the customer to
// payment.transactionId — transaction ID, store it
```

**Payment method codes** (the `PAYMENT_METHOD` constant):

| Code | Constant                        | Payment method           |
| ---- | ------------------------------- | ------------------------ |
| 2    | `PAYMENT_METHOD.SBP`            | SBP (QR code) + SberPay  |
| 3    | `PAYMENT_METHOD.ERIP`           | ERIP (Belarus)           |
| 6    | `PAYMENT_METHOD.SUBSCRIPTION`   | Subscription (recurring) |
| 11   | `PAYMENT_METHOD.CARD_ACQUIRING` | Card acquiring           |
| 12   | `PAYMENT_METHOD.INTERNATIONAL`  | International payment    |
| 13   | `PAYMENT_METHOD.CRYPTO`         | Cryptocurrency           |

```typescript
import { PAYMENT_METHOD } from '@tsforge7/platega-sdk';

await platega.payments.create({ paymentMethod: PAYMENT_METHOD.SBP, ... });
```

### `createLink()` — payment link without a method

Use it when the customer picks the payment method on the Platega page. Same parameters, just without `paymentMethod`:

```typescript
const link = await platega.payments.createLink({
    paymentDetails: { amount: 500, currency: 'RUB' },
    description: 'Order #293',
    return: 'https://myshop.com/success',
    failedUrl: 'https://myshop.com/fail',
    payload: 'order-293',
});
// link.url — the payment link
// link.expiresIn — link lifetime, HH:MM:SS format
```

### `getById()` — payment status

```typescript
const tx = await platega.payments.getById('3fa85f64-5717-4562-b3fc-2c963f66afa6');

switch (tx.status) {
    case 'PENDING': // waiting for payment
    case 'CONFIRMED': // paid ✅
    case 'CANCELED': // declined / not paid
    case 'CHARGEBACKED': // funds were returned
}
```

> The response of this endpoint contains misspelled fields `comission` and `mechantId` — these are typos in the Platega API itself. The SDK deliberately mirrors them so the types match the actual JSON.

## Balances — `platega.balances`

```typescript
const balances = await platega.balances.getAll();
// [
//   { amount: 15000.5, currency: 'RUB' },
//   { amount: 200, currency: 'USDT', frozenBalance: 500 },
// ]
```

`frozenBalance` — the frozen part of the balance (if any).

## Conversions — `platega.conversions`

Conversion operations history for a period, with pagination:

```typescript
const conversions = await platega.conversions.list({
    from: '2026-01-01T00:00:00Z', // ISO 8601, required
    to: '2026-01-31T23:59:59Z', // ISO 8601, required
    page: 1, // optional, defaults to 1
    size: 20, // optional, defaults to 20
});
```

The SDK validates dates before sending the request: `from`/`to` must be valid ISO 8601 with time (`2026-01-01T00:00:00Z` or with a timezone `...+03:00`; a bare `2026-01-01` won't pass), and `from` cannot be later than `to` — otherwise you get a `ZodError` with a clear message.

> The response shape is not declared in the Platega OpenAPI specification, so the response type is `Record<string, unknown>`.

## Refunds — `platega.refunds`

Cancelling a transaction is a two-step operation. **Check whether cancellation is possible first**, then cancel:

```typescript
// Step 1: can it be cancelled and how much will it cost?
const check = await platega.refunds.checkCancelSupported(transactionId);

if (!check.supported) {
    console.log(check.blockReason); // e.g. 'Insufficient funds'
    return;
}

console.log(check.totalDeductUsdt); // how much USDT will be debited from the balance
console.log(check.penaltyUsdt); // cancellation penalty

// Step 2: cancel
const result = await platega.refunds.cancel(transactionId);

if (result.accepted) {
    // cancellation accepted ✅
} else if (result.manualControlRequired) {
    // cannot be cancelled automatically — contact Platega support
    console.log(result.message);
}
```

## Withdrawals — `platega.withdrawals`

The Payout API uses separate authentication — a **PG-HMAC** signature (HMAC-SHA256 with a timestamp and a body hash). **The SDK handles all of it**, you don't sign anything yourself.

### `createCardRub()` — payout to a RUB card

```typescript
// By card number:
const payout = await platega.withdrawals.createCardRub({
    cardNumber: '2200000000000000', // 16 digits
    amountRub: 1500, // integer, from 1000 to 87500 RUB
});

// Or by saved card ID:
const payout2 = await platega.withdrawals.createCardRub({
    cardId: 'saved-card-id',
    amountRub: 1500,
});

console.log(payout.withdrawalRecordId); // payout ID
console.log(payout.status); // 'CREATED'
console.log(payout.cardMasked); // '**** 0000'
console.log(payout.amountUsdtDebited); // USDT debited from the balance
```

Rules:

- pass **either** `cardNumber` **or** `cardId` — the SDK won't let you send both or neither;
- the amount is an integer from **1000 to 87500 RUB**;
- **idempotency**: every request gets a unique `Idempotency-Key` (UUID). The SDK generates it automatically. To protect against double payouts on your own retries, pass your own key and reuse it on retry:

```typescript
await platega.withdrawals.createCardRub({
    cardNumber: '2200000000000000',
    amountRub: 1500,
    idempotencyKey: 'your-stable-uuid-for-this-payout',
});
```

### `getSavedCards()` — saved cards

```typescript
const cards = await platega.withdrawals.getSavedCards();
// active only; to get all of them:
const allCards = await platega.withdrawals.getSavedCards({ onlyActive: false });

// [{ cardId, masked, last4, brand, label, status: 'ACTIVE' | 'DISABLED' | 'PENDING' }]
```

## Callbacks: receiving notifications

When a transaction status changes, Platega sends a **POST** to your URL. What you need to do:

**1. Set the URL** in the dashboard: Settings → Callback URLs.

**2. Endpoint requirements**: public domain, HTTPS with a valid certificate (self-signed is forbidden), response within 60 seconds. If you don't respond, Platega retries up to 3 times with a 5-minute interval (so processing must be idempotent: a repeated callback must not credit the order twice).

**3. Verify authenticity.** Platega callbacks have **no cryptographic signature** — instead, the request carries your own `X-MerchantId` and `X-Secret` headers. The SDK compares them with your config using a timing-safe comparison:

```typescript
import express from 'express';
import { Platega, TransactionCallbackCommand } from '@tsforge7/platega-sdk';

const app = express();
app.use(express.json());

app.post('/platega/callback', async (req, res) => {
    // Step 1: is it really Platega? (header comparison)
    if (!platega.verifyCallback(req.headers)) {
        return res.status(401).end();
    }

    // Step 2: parse the body (loose validation — unknown fields don't break parsing)
    const cb = TransactionCallbackCommand.TransactionCallbackSchema.parse(req.body);
    // cb: { id, amount, currency, status, paymentMethod, payload? }

    // Step 3 (for critical flows): do NOT take the callback at its word,
    // re-check the status via the API — that response cannot be forged
    const tx = await platega.payments.getById(cb.id);

    if (tx.status === 'CONFIRMED') {
        // Step 4: verify the amount and currency against the order and credit it (idempotently!)
        // markOrderPaid(cb.payload, cb.amount, cb.currency)
    }

    // Step 5: respond with 200, otherwise Platega will retry
    res.status(200).end();
});
```

Callback statuses (the `CALLBACK_STATUS` constant): `CONFIRMED` — paid, `CANCELED` — declined, `CHARGEBACKED` — refunded. `PENDING` never arrives in a callback.

> `verifyCallback(req.headers)` works directly with Express, Fastify, Koa, NestJS and plain `http`. For frameworks built on the Web-standard `Request` (Hono, Bun, Deno), unwrap the headers: `platega.verifyCallback(Object.fromEntries(request.headers))`.

## Error handling

The SDK throws errors in two cases:

```typescript
import { ZodError } from 'zod';

try {
    await platega.withdrawals.createCardRub({ amountRub: 500 }); // below the minimum and no card
} catch (error) {
    if (error instanceof ZodError) {
        // 1. Validation error BEFORE the request is sent:
        //    invalid parameters (amount out of limits, no cardId/cardNumber, etc.)
        console.log(error.issues);
    } else if (error instanceof Error) {
        // 2. Platega API error: non-2xx response
        //    Format: 'Platega API error <status>: <response body>'
        console.log(error.message); // e.g. 'Platega API error 401: ...'
    }
}
```

| API status | Meaning                                               |
| ---------- | ----------------------------------------------------- |
| 400        | Validation error on the Platega side                  |
| 401        | Invalid `merchantId`/`secret` (or a reset Payout key) |
| 404        | Transaction not found                                 |

## Constants and types

> ⚠️ **Don't create your own constants for payment methods, statuses, currencies and intervals — the SDK already has them all.** Replace magic numbers and strings (`paymentMethod: 2`, `status === 'CONFIRMED'`, `interval: '3'`) with `PAYMENT_METHOD.SBP`, `PAYMENT_STATUS.CONFIRMED`, `SUBSCRIPTION_INTERVAL.MONTH` — when the API changes, the SDK gets updated, not your code.

Everything is exported from the package root:

```typescript
import {
    // classes
    Platega,
    PlategaHttpClient,
    PaymentsModule,
    BalancesModule,
    ConversionsModule,
    RefundsModule,
    WithdrawalsModule,
    // endpoints
    PLATEGA_API,
    // constants + type guards
    PAYMENT_METHOD,
    PAYMENT_METHOD_VALUES,
    isPaymentMethodGuard,
    PaymentMethodSchema, // 2 | 3 | 6 | 11 | 12 | 13
    SUBSCRIPTION_INTERVAL,
    SUBSCRIPTION_INTERVAL_VALUES,
    isSubscriptionIntervalGuard,
    SubscriptionIntervalSchema, // '1' day | '2' week | '3' month | '4' year
    PAYMENT_STATUS,
    PAYMENT_STATUS_VALUES,
    isPaymentStatusGuard, // PENDING | CONFIRMED | CANCELED | CHARGEBACKED
    CALLBACK_STATUS,
    CALLBACK_STATUS_VALUES,
    isCallbackStatusGuard, // CONFIRMED | CANCELED | CHARGEBACKED
    CARD_STATUS,
    CARD_STATUS_VALUES,
    isCardStatusGuard, // ACTIVE | DISABLED | PENDING
    CURRENCY,
    CURRENCY_VALUES,
    isCurrencyGuard,
    CurrencySchema, // RUB | USD | EUR | USDT + any string
    HTTP_METHOD,
    HTTP_METHOD_VALUES,
    isHttpMethodGuard, // GET | POST
    // utilities
    verifyCallback, // callback header verification (timing-safe)
    sha256Hex,
    buildPgHmacStringToSign,
    buildPgHmacSignature,
    buildPgHmacAuthorizationHeader, // PG-HMAC
} from '@tsforge7/platega-sdk';
```

Every API method is described by zod schemas inside namespace commands (`CreatePaymentCommand`, `GetTransactionCommand`, ...) — all request/response types are inferred from them (`ICreatePaymentInput`, `IGetTransactionResponse`, etc.).

## Contributing

**Found a bug?** Open an [Issue](https://github.com/tsforge/platega-sdk/issues/new) — describe what you did, what you expected and what you got (error code, SDK and Node versions). Please never include your `X-MerchantId`/`X-Secret` or real transaction data in an issue.

**Want to propose a change?** Direct pushes to the repository are not allowed — changes are accepted via a Merge Request from a fork:

1. **Fork** the repository — the "Fork" button on the [tsforge/platega-sdk](https://github.com/tsforge/platega-sdk) page.
2. **Clone your fork** and create a branch:

    ```bash
    git clone git@github.com:<your-login>/platega-sdk.git
    cd platega-sdk
    npm install
    git checkout -b fix/my-fix
    ```

3. **Make your changes** and make sure everything is green:

    ```bash
    npm test        # tests
    npm run lint    # linter
    npm run build   # build
    ```

    Cover new logic with tests (`*.spec.ts` next to the file), keep code comments in English.

4. **Push the branch to your fork** and open a Merge Request into `main` of the upstream repository. Describe what you changed and why; if the MR closes an issue, reference it (`Closes #N`).

## License

MIT
