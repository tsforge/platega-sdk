import { z } from 'zod';
import { CurrencySchema } from './constants';

// Transaction status change callback: Platega sends a POST to your URL
// (Settings → Callback URLs) with X-MerchantId and X-Secret headers
export namespace TransactionCallbackCommand {
    // Loose validation: unknown fields are kept and do not cause errors,
    // status is not restricted to an enum (check it via isCallbackStatusGuard)
    export const TransactionCallbackSchema = z.looseObject({
        // Transaction ID (UUID)
        id: z.string(),
        amount: z.number(),
        currency: CurrencySchema,
        status: z.string(),
        // Payment method ID
        paymentMethod: z.number(),
        payload: z.string().optional(),
    });

    export type ITransactionCallback = z.infer<typeof TransactionCallbackSchema>;
}
