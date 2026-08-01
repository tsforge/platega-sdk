import { z } from 'zod';
import {
    PAYMENT_STATUS_VALUES,
    CurrencySchema,
    PaymentMethodSchema,
    SubscriptionIntervalSchema,
} from './constants';

export namespace CreatePaymentCommand {
    export const RequestCreatePaymentSchema = z.object({
        paymentMethod: PaymentMethodSchema,
        paymentDetails: z.object({
            amount: z.number(),
            currency: CurrencySchema,
            // Charge interval for subscriptions (paymentMethod = 6), see SUBSCRIPTION_INTERVAL
            interval: SubscriptionIntervalSchema.optional(),
        }),
        description: z.string(),
        return: z.string().optional(),
        failedUrl: z.string().optional(),
        payload: z.string().optional(),
        metadata: z
            .object({
                userId: z.string().optional(),
                userName: z.string().optional(),
            })
            .optional(),
    });

    export type ICreatePayment = z.infer<typeof RequestCreatePaymentSchema>;
    export type ICreatePaymentInput = z.input<typeof RequestCreatePaymentSchema>;

    export const ResponseCreatePaymentSchema = z.object({
        transactionId: z.string(),
        paymentMethod: z.string(),
        redirect: z.string(),
        return: z.string().optional(),
        paymentDetails: z
            .object({
                amount: z.number(),
                currency: CurrencySchema,
            })
            .optional(),
        status: z.enum(PAYMENT_STATUS_VALUES),
        expiresIn: z.string().optional(),
        merchantId: z.string().optional(),
        usdtRate: z.number().optional(),
    });
    export type ICreatePaymentResponse = z.infer<typeof ResponseCreatePaymentSchema>;
}
