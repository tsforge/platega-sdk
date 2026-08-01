import { z } from 'zod';

export namespace CancelTransactionCommand {
    export const RequestCancelTransactionSchema = z.object({
        id: z.string(),
    });

    export type ICancelTransaction = z.infer<typeof RequestCancelTransactionSchema>;

    export const ResponseCancelTransactionSchema = z.object({
        transactionId: z.string(),
        accepted: z.boolean(),
        // true — automatic cancellation is not possible, contact support
        manualControlRequired: z.boolean(),
        message: z.string().optional(),
    });
    export type ICancelTransactionResponse = z.infer<typeof ResponseCancelTransactionSchema>;
}
