import { z } from 'zod';
import { CARD_STATUS_VALUES } from './constants';

export namespace GetSavedCardsCommand {
    // Query params of GET /api/v1/cards
    export const QueryGetSavedCardsSchema = z.object({
        // Defaults to true; when false, DISABLED and PENDING cards are returned as well
        onlyActive: z.boolean().optional(),
    });

    export type IGetSavedCardsQuery = z.infer<typeof QueryGetSavedCardsSchema>;

    export const ResponseGetSavedCardsSchema = z.array(
        z.object({
            cardId: z.string(),
            masked: z.string(),
            last4: z.string(),
            brand: z.string(),
            label: z.string().optional(),
            status: z.enum(CARD_STATUS_VALUES),
        }),
    );
    export type IGetSavedCardsResponse = z.infer<typeof ResponseGetSavedCardsSchema>;
}
