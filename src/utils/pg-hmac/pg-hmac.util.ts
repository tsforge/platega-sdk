import crypto from 'node:crypto';

// PG-HMAC signature for the Platega Payout API.
// String to sign: METHOD\nPATH\ntimestamp\nidempotency-key\nsha256_hex(body),
// signature: Base64(HMAC-SHA256(secret, stringToSign))
export interface IPgHmacSignParams {
    method: string;
    // Path without the query string, e.g. /api/v1/payouts/card-rub
    path: string;
    // Unix time in seconds; the server accepts requests within a ±300 seconds window
    timestamp: string;
    idempotencyKey?: string;
    // Raw request body exactly as it goes over the wire; empty string for GET
    rawBody?: string;
}

export const sha256Hex = (input: string): string =>
    crypto.createHash('sha256').update(input).digest('hex');

export const buildPgHmacStringToSign = (params: IPgHmacSignParams): string =>
    [
        params.method,
        params.path,
        params.timestamp,
        params.idempotencyKey ?? '',
        sha256Hex(params.rawBody ?? ''),
    ].join('\n');

export const buildPgHmacSignature = (secret: string, params: IPgHmacSignParams): string =>
    crypto.createHmac('sha256', secret).update(buildPgHmacStringToSign(params)).digest('base64');

export const buildPgHmacAuthorizationHeader = (
    merchantId: string,
    secret: string,
    params: IPgHmacSignParams,
): string =>
    `PG-HMAC kid=${merchantId}, ts=${params.timestamp}, sig=${buildPgHmacSignature(secret, params)}`;
