import crypto from 'node:crypto';

// Platega callbacks are not cryptographically signed: the request carries your own
// X-MerchantId and X-Secret headers, so authenticity is verified by comparing them
// with the credentials from your config. Comparison is timing-safe to prevent
// secret guessing via response-time analysis.
export interface IVerifyCallbackCredentials {
    merchantId: string;
    secret: string;
}

// Headers as provided by Node/express-like frameworks: names may be lowercased,
// values may be arrays
export type TCallbackHeaders = Record<string, string | string[] | undefined>;

const getHeader = (headers: TCallbackHeaders, name: string): string | undefined => {
    const value = headers[name] ?? headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
};

const timingSafeEqualStrings = (a: string, b: string): boolean => {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    if (bufferA.length !== bufferB.length) return false;
    return crypto.timingSafeEqual(bufferA, bufferB);
};

export const verifyCallback = (
    credentials: IVerifyCallbackCredentials,
    headers: TCallbackHeaders,
): boolean => {
    const merchantId = getHeader(headers, 'X-MerchantId');
    const secret = getHeader(headers, 'X-Secret');
    if (!merchantId || !secret) return false;
    // Both comparisons always run to keep the check timing-independent
    const merchantIdMatches = timingSafeEqualStrings(merchantId, credentials.merchantId);
    const secretMatches = timingSafeEqualStrings(secret, credentials.secret);
    return merchantIdMatches && secretMatches;
};
