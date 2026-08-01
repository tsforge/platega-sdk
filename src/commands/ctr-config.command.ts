import { z } from 'zod';

export namespace PlategaConfigCommand {
    export const RequestCtrConfigSchema = z.object({
        // X-MerchantId header
        merchantId: z.string(),
        // X-Secret header
        secret: z.string(),
        baseUrl: z.string().default('https://app.platega.io'),
    });

    export type ICtrConfig = z.infer<typeof RequestCtrConfigSchema>;
    export type ICtrInput = z.input<typeof RequestCtrConfigSchema>;
}
