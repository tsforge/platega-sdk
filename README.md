# Platega SDK

TypeScript SDK для платёжной системы [Platega](https://platega.io): приём платежей (СБП, карты, ЕРИП, криптовалюта), проверка статусов, отмены, выводы на карты и проверка callback'ов.

[Официальная документация Platega](https://docs.platega.io)

---

## Содержание

- [Возможности](#возможности)
- [Установка](#установка)
- [Шаг 0. Получите ключи](#шаг-0-получите-ключи)
- [Быстрый старт: принять первый платёж](#быстрый-старт-принять-первый-платёж)
- [Подключение SDK](#подключение-sdk)
- [Платежи — `platega.payments`](#платежи--plategapayments)
- [Балансы — `platega.balances`](#балансы--plategabalances)
- [Конвертации — `platega.conversions`](#конвертации--plategaconversions)
- [Возвраты — `platega.refunds`](#возвраты--plategarefunds)
- [Выводы — `platega.withdrawals`](#выводы--plategawithdrawals)
- [Callback'и: как принимать уведомления](#callbackи-как-принимать-уведомления)
- [Обработка ошибок](#обработка-ошибок)
- [Константы и типы](#константы-и-типы)

---

## Возможности

| Что нужно сделать                                   | Метод SDK                                |
| --------------------------------------------------- | ---------------------------------------- |
| Создать платёж с конкретным методом оплаты          | `platega.payments.create()`              |
| Создать платёжную ссылку (метод выберет плательщик) | `platega.payments.createLink()`          |
| Узнать статус платежа                               | `platega.payments.getById()`             |
| Получить балансы по всем валютам                    | `platega.balances.getAll()`              |
| История конвертаций                                 | `platega.conversions.list()`             |
| Проверить, можно ли отменить транзакцию             | `platega.refunds.checkCancelSupported()` |
| Отменить транзакцию (вернуть деньги)                | `platega.refunds.cancel()`               |
| Вывести деньги на рублёвую карту                    | `platega.withdrawals.createCardRub()`    |
| Список сохранённых карт для выводов                 | `platega.withdrawals.getSavedCards()`    |
| Проверить, что callback пришёл от Platega           | `platega.verifyCallback()`               |

## Установка

```bash
npm install @taforge7/platega-sdk
```

Требования: Node.js 18+ (используется встроенный `fetch`).

## Шаг 0. Получите ключи

Для работы нужны два значения — их выдаёт менеджер Platega при подключении, а также они доступны в личном кабинете на странице **«Настройки»**:

| Ключ           | Что это                       | Пример                                 |
| -------------- | ----------------------------- | -------------------------------------- |
| `X-MerchantId` | Идентификатор вашего магазина | `29ef6fa6-0d2b-466c-9604-0363a30436cc` |
| `X-Secret`     | Секретный API-ключ            | `iStHENoXjHdy78A4tGG3M6Tzq...`         |

> ⚠️ **Никогда не коммитьте ключи в git и не используйте их во фронтенде.** Храните в переменных окружения. Любой, кто узнает `X-Secret`, сможет делать запросы от вашего имени.

## Быстрый старт: принять первый платёж

```typescript
import { Platega } from '@taforge7/platega-sdk';

// 1. Создаём клиент (один раз на всё приложение)
const platega = new Platega({
    merchantId: process.env.PLATEGA_MERCHANT_ID!,
    secret: process.env.PLATEGA_SECRET!,
});

// 2. Создаём платёжную ссылку на 500 ₽
const payment = await platega.payments.createLink({
    paymentDetails: { amount: 500, currency: 'RUB' },
    description: 'Заказ №293',
    return: 'https://myshop.com/success', // куда вернуть после оплаты
    failedUrl: 'https://myshop.com/fail', // куда вернуть при ошибке
    payload: 'order-293', // ваши данные, вернутся в callback
});

// 3. Отправляем покупателя платить
console.log(payment.url); // → редиректим пользователя на эту ссылку
console.log(payment.transactionId); // → сохраняем у себя, по нему придёт callback

// 4. Когда покупатель оплатит — Platega пришлёт callback (см. раздел про callback'и)
//    и/или можно проверить статус вручную:
const status = await platega.payments.getById(payment.transactionId);
console.log(status.status); // 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'CHARGEBACKED'
```

Это всё: ссылка → редирект → callback. Дальше — подробности по каждому модулю.

## Подключение SDK

```typescript
const platega = new Platega({
    merchantId: '...', // обязателен — X-MerchantId из личного кабинета
    secret: '...', // обязателен — X-Secret из личного кабинета
    baseUrl: 'https://app.platega.io', // необязателен, это значение по умолчанию
});
```

Конфиг валидируется при создании: если забыли ключ — получите понятную ошибку сразу, а не при первом запросе. Главный класс построен по композиции: вся функциональность разложена по модулям `payments`, `balances`, `conversions`, `refunds`, `withdrawals`.

## Платежи — `platega.payments`

### `create()` — платёж с заданным методом оплаты

Используйте, когда сами показываете покупателю выбор способа оплаты.

```typescript
const payment = await platega.payments.create({
    paymentMethod: 2, // способ оплаты, см. таблицу ниже
    paymentDetails: { amount: 500, currency: 'RUB' },
    description: 'Заказ №293', // покупатель увидит этот текст
    return: 'https://myshop.com/success',
    failedUrl: 'https://myshop.com/fail',
    payload: 'order-293', // произвольная строка, вернётся в callback
    metadata: {
        userId: '123456789', // ID плательщика в вашей системе (нужен антифроду)
        userName: '@username',
    },
});

// payment.redirect — ссылка, куда отправить покупателя
// payment.transactionId — ID транзакции, сохраните его
```

**Коды методов оплаты** (константа `PAYMENT_METHOD`):

| Код | Константа                       | Способ оплаты                    |
| --- | ------------------------------- | -------------------------------- |
| 2   | `PAYMENT_METHOD.SBP`            | СБП (QR-код) + SberPay           |
| 3   | `PAYMENT_METHOD.ERIP`           | ЕРИП (Беларусь)                  |
| 6   | `PAYMENT_METHOD.SUBSCRIPTION`   | Подписка (рекуррентные списания) |
| 11  | `PAYMENT_METHOD.CARD_ACQUIRING` | Карточный эквайринг              |
| 12  | `PAYMENT_METHOD.INTERNATIONAL`  | Международная оплата             |
| 13  | `PAYMENT_METHOD.CRYPTO`         | Криптовалюта                     |

```typescript
import { PAYMENT_METHOD } from '@taforge7/platega-sdk';

await platega.payments.create({ paymentMethod: PAYMENT_METHOD.SBP, ... });
```

### `createLink()` — платёжная ссылка без метода

Используйте, когда покупатель сам выберет способ оплаты уже на странице Platega. Параметры те же, но без `paymentMethod`:

```typescript
const link = await platega.payments.createLink({
    paymentDetails: { amount: 500, currency: 'RUB' },
    description: 'Заказ №293',
    return: 'https://myshop.com/success',
    failedUrl: 'https://myshop.com/fail',
    payload: 'order-293',
});
// link.url — платёжная ссылка
// link.expiresIn — сколько живёт ссылка, формат HH:MM:SS
```

### `getById()` — статус платежа

```typescript
const tx = await platega.payments.getById('3fa85f64-5717-4562-b3fc-2c963f66afa6');

switch (tx.status) {
    case 'PENDING': // ждёт оплаты
    case 'CONFIRMED': // оплачен ✅
    case 'CANCELED': // отклонён / не оплачен
    case 'CHARGEBACKED': // был возврат средств
}
```

> В ответе этого эндпоинта поля `comission` и `mechantId` написаны с опечатками — это опечатки в самом API Platega, SDK сознательно повторяет их, чтобы типы совпадали с реальным JSON.

## Балансы — `platega.balances`

```typescript
const balances = await platega.balances.getAll();
// [
//   { amount: 15000.5, currency: 'RUB' },
//   { amount: 200, currency: 'USDT', frozenBalance: 500 },
// ]
```

`frozenBalance` — замороженная часть баланса (если есть).

## Конвертации — `platega.conversions`

История операций конвертации за период, с пагинацией:

```typescript
const conversions = await platega.conversions.list({
    from: '2026-01-01T00:00:00Z', // ISO 8601, обязателен
    to: '2026-01-31T23:59:59Z', // ISO 8601, обязателен
    page: 1, // необязателен, по умолчанию 1
    size: 20, // необязателен, по умолчанию 20
});
```

SDK валидирует даты до отправки запроса: `from`/`to` должны быть валидным ISO 8601 с временем (`2026-01-01T00:00:00Z` или с таймзоной `...+03:00`; просто `2026-01-01` не пройдёт), и `from` не может быть позже `to` — иначе получите `ZodError` с понятным сообщением.

> Структура ответа не описана в OpenAPI-спецификации Platega, поэтому тип ответа — `Record<string, unknown>`.

## Возвраты — `platega.refunds`

Отмена транзакции — двухшаговая операция. **Сначала проверьте возможность отмены**, потом отменяйте:

```typescript
// Шаг 1: можно ли отменить и сколько это будет стоить?
const check = await platega.refunds.checkCancelSupported(transactionId);

if (!check.supported) {
    console.log(check.blockReason); // например 'Insufficient funds'
    return;
}

console.log(check.totalDeductUsdt); // сколько USDT спишется с баланса
console.log(check.penaltyUsdt); // размер штрафа за отмену

// Шаг 2: отмена
const result = await platega.refunds.cancel(transactionId);

if (result.accepted) {
    // отмена принята ✅
} else if (result.manualControlRequired) {
    // автоматически отменить нельзя — обратитесь в поддержку Platega
    console.log(result.message);
}
```

## Выводы — `platega.withdrawals`

Payout API использует отдельную аутентификацию — подпись **PG-HMAC** (HMAC-SHA256 с временной меткой и хэшем тела). **SDK делает всё сам**, вам ничего подписывать не нужно.

### `createCardRub()` — вывод на рублёвую карту

```typescript
// По номеру карты:
const payout = await platega.withdrawals.createCardRub({
    cardNumber: '2200000000000000', // 16 цифр
    amountRub: 1500, // целое число, от 1000 до 87500 ₽
});

// Или по ID сохранённой карты:
const payout2 = await platega.withdrawals.createCardRub({
    cardId: 'saved-card-id',
    amountRub: 1500,
});

console.log(payout.withdrawalRecordId); // ID вывода
console.log(payout.status); // 'CREATED'
console.log(payout.cardMasked); // '**** 0000'
console.log(payout.amountUsdtDebited); // сколько USDT списано с баланса
```

Правила:

- передаётся **либо** `cardNumber`, **либо** `cardId` — SDK не даст отправить оба или ни одного;
- сумма — целое число от **1000 до 87500 RUB**;
- **идемпотентность**: каждый запрос получает уникальный `Idempotency-Key` (UUID). SDK генерирует его автоматически. Если хотите защититься от двойного вывода при ретраях на вашей стороне — передайте свой и переиспользуйте его при повторе:

```typescript
await platega.withdrawals.createCardRub({
    cardNumber: '2200000000000000',
    amountRub: 1500,
    idempotencyKey: 'ваш-стабильный-uuid-для-этого-вывода',
});
```

### `getSavedCards()` — сохранённые карты

```typescript
const cards = await platega.withdrawals.getSavedCards();
// только активные; чтобы получить все:
const allCards = await platega.withdrawals.getSavedCards({ onlyActive: false });

// [{ cardId, masked, last4, brand, label, status: 'ACTIVE' | 'DISABLED' | 'PENDING' }]
```

## Callback'и: как принимать уведомления

Когда статус транзакции меняется, Platega отправляет **POST** на ваш URL. Что нужно сделать:

**1. Укажите URL** в личном кабинете: Настройки → Callback URLs.

**2. Требования к endpoint'у**: публичный домен, HTTPS с валидным сертификатом (самоподписанные запрещены), ответ в течение 60 секунд. Если не ответили — Platega повторит до 3 раз с интервалом 5 минут (поэтому обработка должна быть идемпотентной: повторный callback не должен зачислить заказ дважды).

**3. Проверяйте подлинность.** У callback'ов Platega **нет криптографической подписи** — вместо неё запрос приходит с вашими же заголовками `X-MerchantId` и `X-Secret`. SDK сверяет их с конфигом timing-safe сравнением:

```typescript
import express from 'express';
import { Platega, TransactionCallbackCommand } from '@taforge7/platega-sdk';

const app = express();
app.use(express.json());

app.post('/platega/callback', async (req, res) => {
    // Шаг 1: это точно Platega? (сверка заголовков)
    if (!platega.verifyCallback(req.headers)) {
        return res.status(401).end();
    }

    // Шаг 2: парсим тело (мягкая валидация — неизвестные поля не ломают парсинг)
    const cb = TransactionCallbackCommand.TransactionCallbackSchema.parse(req.body);
    // cb: { id, amount, currency, status, paymentMethod, payload? }

    // Шаг 3 (для критичных операций): НЕ доверяем callback'у на слово,
    // перепроверяем статус запросом к API — его подделать нельзя
    const tx = await platega.payments.getById(cb.id);

    if (tx.status === 'CONFIRMED') {
        // Шаг 4: сверяем сумму и валюту с заказом и зачисляем (идемпотентно!)
        // markOrderPaid(cb.payload, cb.amount, cb.currency)
    }

    // Шаг 5: отвечаем 200, иначе Platega будет ретраить
    res.status(200).end();
});
```

Статусы в callback (константа `CALLBACK_STATUS`): `CONFIRMED` — оплачен, `CANCELED` — отклонён, `CHARGEBACKED` — возврат. `PENDING` в callback не приходит.

> `verifyCallback(req.headers)` работает напрямую с Express, Fastify, Koa, NestJS и голым `http`. Для фреймворков на Web-стандарте `Request` (Hono, Bun, Deno) разверните заголовки: `platega.verifyCallback(Object.fromEntries(request.headers))`.

## Обработка ошибок

SDK бросает ошибки в двух случаях:

```typescript
import { ZodError } from 'zod';

try {
    await platega.withdrawals.createCardRub({ amountRub: 500 }); // меньше минимума и нет карты
} catch (error) {
    if (error instanceof ZodError) {
        // 1. Ошибка валидации ДО отправки запроса:
        //    неверные параметры (сумма вне лимитов, нет cardId/cardNumber и т.п.)
        console.log(error.issues);
    } else if (error instanceof Error) {
        // 2. Ошибка API Platega: не-2xx ответ
        //    Формат: 'Platega API error <статус>: <тело ответа>'
        console.log(error.message); // например 'Platega API error 401: ...'
    }
}
```

| Код от API | Что значит                                                      |
| ---------- | --------------------------------------------------------------- |
| 400        | Ошибка валидации на стороне Platega                             |
| 401        | Неверные `merchantId`/`secret` (или сброшенный ключ для Payout) |
| 404        | Транзакция не найдена                                           |

## Константы и типы

> ⚠️ **Не создавайте свои константы для методов оплаты, статусов, валют и интервалов — всё уже есть в SDK.** Магические числа и строки (`paymentMethod: 2`, `status === 'CONFIRMED'`, `interval: '3'`) замените на `PAYMENT_METHOD.SBP`, `PAYMENT_STATUS.CONFIRMED`, `SUBSCRIPTION_INTERVAL.MONTH` — при изменениях в API обновится SDK, а не ваш код.

Всё экспортируется из корня пакета:

```typescript
import {
    // классы
    Platega,
    PlategaHttpClient,
    PaymentsModule,
    BalancesModule,
    ConversionsModule,
    RefundsModule,
    WithdrawalsModule,
    // эндпоинты
    PLATEGA_API,
    // константы + тип-гарды
    PAYMENT_METHOD,
    PAYMENT_METHOD_VALUES,
    isPaymentMethodGuard,
    PaymentMethodSchema, // 2 | 3 | 6 | 11 | 12 | 13
    SUBSCRIPTION_INTERVAL,
    SUBSCRIPTION_INTERVAL_VALUES,
    isSubscriptionIntervalGuard,
    SubscriptionIntervalSchema, // '1' день | '2' неделя | '3' месяц | '4' год
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
    CurrencySchema, // RUB | USD | EUR | USDT + любая строка
    HTTP_METHOD,
    HTTP_METHOD_VALUES,
    isHttpMethodGuard, // GET | POST
    // утилиты
    verifyCallback, // проверка callback-заголовков (timing-safe)
    sha256Hex,
    buildPgHmacStringToSign,
    buildPgHmacSignature,
    buildPgHmacAuthorizationHeader, // PG-HMAC
} from '@taforge7/platega-sdk';
```

Каждый метод API описан zod-схемами в namespace-командах (`CreatePaymentCommand`, `GetTransactionCommand`, ...) — из них же выводятся все типы запросов/ответов (`ICreatePaymentInput`, `IGetTransactionResponse` и т.д.).

## Лицензия

MIT
