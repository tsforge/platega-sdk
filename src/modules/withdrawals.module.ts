import crypto from 'node:crypto';
import { PLATEGA_API } from '../api';
import { PlategaHttpClient } from '../core';
import { CreatePayoutCommand, GetSavedCardsCommand, HTTP_METHOD } from '../commands';

export class WithdrawalsModule {
    constructor(private readonly http: PlategaHttpClient) {}

    // Payout to a RUB card via the Payout API (PG-HMAC signature)
    public async createCardRub(
        dto: CreatePayoutCommand.ICreatePayoutInput,
    ): Promise<CreatePayoutCommand.ICreatePayoutResponse> {
        const params = CreatePayoutCommand.RequestCreatePayoutSchema.parse(dto);
        const { idempotencyKey, ...payout } = params;

        const body: Record<string, unknown> = {
            amountRub: payout.amountRub,
            payoutMethod: payout.payoutMethod,
            currencyRequested: payout.currencyRequested,
        };
        if (payout.cardId) {
            body.cardId = payout.cardId;
        }
        if (payout.cardNumber) {
            body.cardNumber = payout.cardNumber;
        }

        return this.http.requestSigned<CreatePayoutCommand.ICreatePayoutResponse>(
            HTTP_METHOD.POST,
            PLATEGA_API.CREATE_PAYOUT_CARD_RUB,
            {
                body,
                idempotencyKey: idempotencyKey ?? crypto.randomUUID(),
            },
        );
    }

    // List of saved cards (PG-HMAC signature)
    public async getSavedCards(
        dto?: GetSavedCardsCommand.IGetSavedCardsQuery,
    ): Promise<GetSavedCardsCommand.IGetSavedCardsResponse> {
        const params = GetSavedCardsCommand.QueryGetSavedCardsSchema.parse(dto ?? {});
        return this.http.requestSigned<GetSavedCardsCommand.IGetSavedCardsResponse>(
            HTTP_METHOD.GET,
            PLATEGA_API.SAVED_CARDS,
            {
                query: { onlyActive: params.onlyActive },
            },
        );
    }
}
