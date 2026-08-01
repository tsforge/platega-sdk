export const HTTP_METHOD_VALUES = ['GET', 'POST'] as const;

export type THttpMethod = (typeof HTTP_METHOD_VALUES)[number];

export const HTTP_METHOD = {
    GET: 'GET',
    POST: 'POST',
} as const satisfies Record<THttpMethod, THttpMethod>;

const httpMethodValues: readonly string[] = HTTP_METHOD_VALUES;

export const isHttpMethodGuard = (value: unknown): value is THttpMethod =>
    typeof value === 'string' && httpMethodValues.includes(value);
