import { z } from 'zod';

export namespace CreatePayoutCommand {
    export const RequestCreatePayoutSchema = z
        .object({
            // Saved card ID (alternative to cardNumber)
            cardId: z.string().optional(),
            // Recipient card number, 16 digits (alternative to cardId)
            cardNumber: z.string().optional(),
            amountRub: z.number().int().min(1000).max(87500),
            payoutMethod: z.literal('CARD').default('CARD'),
            currencyRequested: z.literal('RUB').default('RUB'),
            // UUID; generated automatically when not provided
            idempotencyKey: z.string().optional(),
        })
        .refine((data) => Boolean(data.cardId) !== Boolean(data.cardNumber), {
            message: 'Either cardId or cardNumber must be provided',
        });

    export type ICreatePayout = z.infer<typeof RequestCreatePayoutSchema>;
    export type ICreatePayoutInput = z.input<typeof RequestCreatePayoutSchema>;

    export const ResponseCreatePayoutSchema = z.object({
        withdrawalRecordId: z.string(),
        // Equals 'CREATED' right after creation
        status: z.string(),
        cardMasked: z.string(),
        amountUsdtDebited: z.number(),
    });
    export type ICreatePayoutResponse = z.infer<typeof ResponseCreatePayoutSchema>;
}
