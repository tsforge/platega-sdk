import { z } from 'zod';
import { PAYMENT_STATUS_VALUES, CurrencySchema } from './constants';

export namespace GetTransactionCommand {
    export const RequestGetTransactionSchema = z.object({
        id: z.string(),
    });

    export type IGetTransaction = z.infer<typeof RequestGetTransactionSchema>;

    export const ResponseGetTransactionSchema = z.object({
        id: z.string(),
        status: z.enum(PAYMENT_STATUS_VALUES),
        paymentDetails: z
            .object({
                amount: z.number(),
                currency: CurrencySchema,
            })
            .optional(),
        merchantName: z.string().optional(),
        // Exactly 'mechantId' — a typo in the Platega API, the field arrives spelled this way
        mechantId: z.string().optional(),
        // 'comission' (not commission) — this is how the Platega API names the field
        comission: z.number().optional(),
        paymentMethod: z.string().optional(),
        expiresIn: z.string().optional(),
        return: z.string().optional(),
        comissionUsdt: z.number().optional(),
        amountUsdt: z.number().optional(),
        qr: z.string().optional(),
        payformSuccessUrl: z.string().optional(),
        payload: z.string().optional(),
        comissionType: z.number().optional(),
        externalId: z.string().optional(),
        description: z.string().optional(),
    });
    export type IGetTransactionResponse = z.infer<typeof ResponseGetTransactionSchema>;
}
