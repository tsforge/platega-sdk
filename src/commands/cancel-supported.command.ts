import { z } from 'zod';
import { CurrencySchema } from './constants';

export namespace CancelSupportedCommand {
    export const RequestCancelSupportedSchema = z.object({
        id: z.string(),
    });

    export type ICancelSupported = z.infer<typeof RequestCancelSupportedSchema>;

    export const ResponseCancelSupportedSchema = z.object({
        supported: z.boolean(),
        totalDeductUsdt: z.number().optional(),
        penaltyNativeAmount: z.number().optional(),
        penaltyNativeCurrency: CurrencySchema.optional(),
        penaltyUsdt: z.number().optional(),
        penaltyConversionRate: z.number().optional(),
        // Block reason when funds are insufficient, e.g. 'Insufficient funds'
        blockReason: z.string().optional(),
    });
    export type ICancelSupportedResponse = z.infer<typeof ResponseCancelSupportedSchema>;
}
