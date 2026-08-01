import { describe, expect, it } from 'vitest';
import { verifyCallback } from './verify-callback.util';

const CREDENTIALS = {
    merchantId: '29ef6fa6-0d2b-466c-9604-0363a30436cc',
    secret: 'iStHENoXjHdy78A4tGG3M6TzqLvtRe335bbIGGYYx1Sf',
};

describe('verifyCallback', () => {
    it('accepts valid headers in original case', () => {
        expect(
            verifyCallback(CREDENTIALS, {
                'X-MerchantId': CREDENTIALS.merchantId,
                'X-Secret': CREDENTIALS.secret,
            }),
        ).toBe(true);
    });

    it('accepts lowercased header names (Node/express normalize them)', () => {
        expect(
            verifyCallback(CREDENTIALS, {
                'x-merchantid': CREDENTIALS.merchantId,
                'x-secret': CREDENTIALS.secret,
            }),
        ).toBe(true);
    });

    it('accepts array header values and uses the first element', () => {
        expect(
            verifyCallback(CREDENTIALS, {
                'x-merchantid': [CREDENTIALS.merchantId],
                'x-secret': [CREDENTIALS.secret],
            }),
        ).toBe(true);
    });

    it('rejects a wrong secret', () => {
        expect(
            verifyCallback(CREDENTIALS, {
                'X-MerchantId': CREDENTIALS.merchantId,
                'X-Secret': 'wrong-secret-wrong-secret-wrong-secret-wrong',
            }),
        ).toBe(false);
    });

    it('rejects a wrong merchantId', () => {
        expect(
            verifyCallback(CREDENTIALS, {
                'X-MerchantId': '00000000-0000-0000-0000-000000000000',
                'X-Secret': CREDENTIALS.secret,
            }),
        ).toBe(false);
    });

    it('rejects a secret of different length without throwing', () => {
        expect(
            verifyCallback(CREDENTIALS, {
                'X-MerchantId': CREDENTIALS.merchantId,
                'X-Secret': 'short',
            }),
        ).toBe(false);
    });

    it('rejects when headers are missing', () => {
        expect(verifyCallback(CREDENTIALS, {})).toBe(false);
    });

    it('rejects when only one header is present', () => {
        expect(
            verifyCallback(CREDENTIALS, {
                'X-MerchantId': CREDENTIALS.merchantId,
            }),
        ).toBe(false);
    });

    it('rejects empty header values', () => {
        expect(
            verifyCallback(CREDENTIALS, {
                'X-MerchantId': '',
                'X-Secret': '',
            }),
        ).toBe(false);
    });
});
