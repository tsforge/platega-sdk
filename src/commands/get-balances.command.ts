import { z } from 'zod';
import { CurrencySchema } from './constants';

export namespace GetBalancesCommand {
    export const ResponseGetBalancesSchema = z.array(
        z.object({
            amount: z.number(),
            currency: CurrencySchema,
            frozenBalance: z.number().optional(),
        }),
    );
    export type IGetBalancesResponse = z.infer<typeof ResponseGetBalancesSchema>;
}
