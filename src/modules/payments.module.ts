import { PLATEGA_API } from '../api';
import { PlategaHttpClient } from '../core';
import {
    CreatePaymentCommand,
    CreatePaymentLinkV2Command,
    GetTransactionCommand,
    HTTP_METHOD,
} from '../commands';

export class PaymentsModule {
    constructor(private readonly http: PlategaHttpClient) {}

    // Create a payment with an explicit payment method
    public async create(
        dto: CreatePaymentCommand.ICreatePaymentInput,
    ): Promise<CreatePaymentCommand.ICreatePaymentResponse> {
        const body = CreatePaymentCommand.RequestCreatePaymentSchema.parse(dto);
        return this.http.request<CreatePaymentCommand.ICreatePaymentResponse>(
            HTTP_METHOD.POST,
            PLATEGA_API.CREATE_PAYMENT,
            { body },
        );
    }

    // Create a payment link without a predefined method (v2)
    public async createLink(
        dto: CreatePaymentLinkV2Command.ICreatePaymentLinkV2Input,
    ): Promise<CreatePaymentLinkV2Command.ICreatePaymentLinkV2Response> {
        const body = CreatePaymentLinkV2Command.RequestCreatePaymentLinkV2Schema.parse(dto);
        return this.http.request<CreatePaymentLinkV2Command.ICreatePaymentLinkV2Response>(
            HTTP_METHOD.POST,
            PLATEGA_API.CREATE_PAYMENT_LINK_V2,
            { body },
        );
    }

    // Check payment status
    public async getById(id: string): Promise<GetTransactionCommand.IGetTransactionResponse> {
        const params = GetTransactionCommand.RequestGetTransactionSchema.parse({ id });
        return this.http.request<GetTransactionCommand.IGetTransactionResponse>(
            HTTP_METHOD.GET,
            PLATEGA_API.TRANSACTION(params.id),
        );
    }
}
