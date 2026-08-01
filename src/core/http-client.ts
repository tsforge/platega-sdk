import { PlategaConfigCommand, THttpMethod } from '../commands';
import { buildPgHmacAuthorizationHeader } from '../utils';

export interface IRequestOptions {
    query?: Record<string, string | number | boolean | undefined>;
    body?: Record<string, unknown>;
}

export interface ISignedRequestOptions extends IRequestOptions {
    idempotencyKey?: string;
}

export class PlategaHttpClient {
    private readonly merchantId: PlategaConfigCommand.ICtrConfig['merchantId'];
    private readonly secret: PlategaConfigCommand.ICtrConfig['secret'];
    private readonly baseUrl: PlategaConfigCommand.ICtrConfig['baseUrl'];

    constructor(config: PlategaConfigCommand.ICtrConfig) {
        this.merchantId = config.merchantId;
        this.secret = config.secret;
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
    }

    // Merchant API requests: authentication via X-MerchantId / X-Secret headers
    public async request<T>(
        method: THttpMethod,
        path: string,
        options?: IRequestOptions,
    ): Promise<T> {
        return this.send<T>(method, path, options, {
            'X-MerchantId': this.merchantId,
            'X-Secret': this.secret,
        });
    }

    // Payout API requests: authentication via PG-HMAC signature (HMAC-SHA256)
    public async requestSigned<T>(
        method: THttpMethod,
        path: string,
        options?: ISignedRequestOptions,
    ): Promise<T> {
        const headers: Record<string, string> = {
            Authorization: buildPgHmacAuthorizationHeader(this.merchantId, this.secret, {
                method,
                path,
                timestamp: Math.floor(Date.now() / 1000).toString(),
                idempotencyKey: options?.idempotencyKey,
                rawBody: options?.body ? JSON.stringify(options.body) : '',
            }),
        };
        if (options?.idempotencyKey) {
            headers['Idempotency-Key'] = options.idempotencyKey;
        }

        return this.send<T>(method, path, options, headers);
    }

    private async send<T>(
        method: THttpMethod,
        path: string,
        options: IRequestOptions | undefined,
        headers: Record<string, string>,
    ): Promise<T> {
        const url = new URL(`${this.baseUrl}${path}`);
        if (options?.query) {
            for (const [key, value] of Object.entries(options.query)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            }
        }

        const init: RequestInit = { method, headers };
        if (options?.body) {
            headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(options.body);
        }

        const res = await fetch(url.toString(), init);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Platega API error ${res.status}: ${text}`);
        }
        return res.json() as Promise<T>;
    }
}
