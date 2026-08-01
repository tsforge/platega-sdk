import { describe, expect, it } from 'vitest';
import {
    buildPgHmacAuthorizationHeader,
    buildPgHmacSignature,
    buildPgHmacStringToSign,
    sha256Hex,
} from './pg-hmac.util';

// Golden values from the Platega docs, computed independently from the utility
const EMPTY_BODY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

const SECRET = 'test-secret';
const MERCHANT_ID = '29ef6fa6-0d2b-466c-9604-0363a30436cc';
const TIMESTAMP = '1719403200';
const IDEMPOTENCY_KEY = '00000000-0000-0000-0000-446655440000';

const PAYOUT_BODY = JSON.stringify({
    cardNumber: '2200000000000000',
    amountRub: 1500,
    payoutMethod: 'CARD',
    currencyRequested: 'RUB',
});
const PAYOUT_BODY_SHA256 = 'd90e211f0801d4b7b40e0f5e8f6f2ebea2433bc63595666f7ec488d813d314fa';

describe('sha256Hex', () => {
    it('empty string hash matches the constant from the Platega docs', () => {
        expect(sha256Hex('')).toBe(EMPTY_BODY_SHA256);
    });

    it('request body hash', () => {
        expect(sha256Hex(PAYOUT_BODY)).toBe(PAYOUT_BODY_SHA256);
    });
});

describe('buildPgHmacStringToSign', () => {
    it('GET without body and idempotency-key: empty key slot and empty string hash', () => {
        const stringToSign = buildPgHmacStringToSign({
            method: 'GET',
            path: '/api/v1/cards',
            timestamp: TIMESTAMP,
        });
        expect(stringToSign).toBe(`GET\n/api/v1/cards\n${TIMESTAMP}\n\n${EMPTY_BODY_SHA256}`);
    });

    it('POST with body and idempotency-key: all five parts joined with \\n', () => {
        const stringToSign = buildPgHmacStringToSign({
            method: 'POST',
            path: '/api/v1/payouts/card-rub',
            timestamp: TIMESTAMP,
            idempotencyKey: IDEMPOTENCY_KEY,
            rawBody: PAYOUT_BODY,
        });
        expect(stringToSign).toBe(
            `POST\n/api/v1/payouts/card-rub\n${TIMESTAMP}\n${IDEMPOTENCY_KEY}\n${PAYOUT_BODY_SHA256}`,
        );
    });
});

describe('buildPgHmacSignature', () => {
    it('POST request signature matches the golden value', () => {
        const sig = buildPgHmacSignature(SECRET, {
            method: 'POST',
            path: '/api/v1/payouts/card-rub',
            timestamp: TIMESTAMP,
            idempotencyKey: IDEMPOTENCY_KEY,
            rawBody: PAYOUT_BODY,
        });
        expect(sig).toBe('/qdKmh0of0UUey8//EiJ8a/n9l9miIhvm9pVfYZ/2G0=');
    });

    it('GET request signature matches the golden value', () => {
        const sig = buildPgHmacSignature(SECRET, {
            method: 'GET',
            path: '/api/v1/cards',
            timestamp: TIMESTAMP,
        });
        expect(sig).toBe('JkLnWze7MAmjSuZoIOZdk5myWz0PRsoSDWvqo8XPplE=');
    });

    it('different secret produces a different signature', () => {
        const params = {
            method: 'GET',
            path: '/api/v1/cards',
            timestamp: TIMESTAMP,
        };
        expect(buildPgHmacSignature(SECRET, params)).not.toBe(
            buildPgHmacSignature('other-secret', params),
        );
    });

    it('changing the body changes the signature', () => {
        const base = {
            method: 'POST',
            path: '/api/v1/payouts/card-rub',
            timestamp: TIMESTAMP,
            idempotencyKey: IDEMPOTENCY_KEY,
        };
        expect(buildPgHmacSignature(SECRET, { ...base, rawBody: PAYOUT_BODY })).not.toBe(
            buildPgHmacSignature(SECRET, {
                ...base,
                rawBody: PAYOUT_BODY.replace('1500', '9999'),
            }),
        );
    });
});

describe('buildPgHmacAuthorizationHeader', () => {
    it('header is built as PG-HMAC kid=..., ts=..., sig=...', () => {
        const header = buildPgHmacAuthorizationHeader(MERCHANT_ID, SECRET, {
            method: 'GET',
            path: '/api/v1/cards',
            timestamp: TIMESTAMP,
        });
        expect(header).toBe(
            `PG-HMAC kid=${MERCHANT_ID}, ts=${TIMESTAMP}, sig=JkLnWze7MAmjSuZoIOZdk5myWz0PRsoSDWvqo8XPplE=`,
        );
    });
});
