import { z } from 'zod';
import { PAYMENT_STATUS_VALUES, CurrencySchema } from './constants';

export namespace CreatePaymentLinkV2Command {
    export const RequestCreatePaymentLinkV2Schema = z.object({
        paymentDetails: z.object({
            amount: z.number(),
            currency: CurrencySchema,
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

    export type ICreatePaymentLinkV2 = z.infer<typeof RequestCreatePaymentLinkV2Schema>;
    export type ICreatePaymentLinkV2Input = z.input<typeof RequestCreatePaymentLinkV2Schema>;

    export const ResponseCreatePaymentLinkV2Schema = z.object({
        transactionId: z.string(),
        status: z.enum(PAYMENT_STATUS_VALUES),
        url: z.string(),
        expiresIn: z.string().optional(),
        rate: z.number().optional(),
    });
    export type ICreatePaymentLinkV2Response = z.infer<typeof ResponseCreatePaymentLinkV2Schema>;
}
