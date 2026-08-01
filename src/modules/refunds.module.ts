import { PLATEGA_API } from '../api';
import { PlategaHttpClient } from '../core';
import { CancelSupportedCommand, CancelTransactionCommand, HTTP_METHOD } from '../commands';

export class RefundsModule {
    constructor(private readonly http: PlategaHttpClient) {}

    // Check whether the transaction can be cancelled
    public async checkCancelSupported(
        id: string,
    ): Promise<CancelSupportedCommand.ICancelSupportedResponse> {
        const params = CancelSupportedCommand.RequestCancelSupportedSchema.parse({ id });
        return this.http.request<CancelSupportedCommand.ICancelSupportedResponse>(
            HTTP_METHOD.GET,
            PLATEGA_API.CANCEL_SUPPORTED(params.id),
        );
    }

    // Cancel the transaction (calling checkCancelSupported beforehand is recommended)
    public async cancel(id: string): Promise<CancelTransactionCommand.ICancelTransactionResponse> {
        const params = CancelTransactionCommand.RequestCancelTransactionSchema.parse({ id });
        return this.http.request<CancelTransactionCommand.ICancelTransactionResponse>(
            HTTP_METHOD.POST,
            PLATEGA_API.CANCEL_TRANSACTION(params.id),
        );
    }
}
