import { z } from 'zod';

export namespace ListConversionsCommand {
    // Query params of GET /transaction/balance-unlock-operations
    export const QueryListConversionsSchema = z
        .object({
            // ISO 8601, e.g. 2025-01-01T00:00:00Z or 2025-01-01T00:00:00+03:00
            from: z.iso.datetime({ offset: true }),
            to: z.iso.datetime({ offset: true }),
            page: z.union([z.string(), z.number()]).default(1),
            size: z.union([z.string(), z.number()]).default(20),
        })
        .refine((query) => Date.parse(query.from) <= Date.parse(query.to), {
            message: "'from' must not be later than 'to'",
        });

    export type IListConversionsQuery = z.infer<typeof QueryListConversionsSchema>;
    export type IListConversionsQueryInput = z.input<typeof QueryListConversionsSchema>;

    // Response shape is not declared in the Platega OpenAPI specification
    export type IListConversionsResponse = Record<string, unknown>;
}
