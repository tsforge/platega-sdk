import { PLATEGA_API } from '../api';
import { PlategaHttpClient } from '../core';
import { GetBalancesCommand, HTTP_METHOD } from '../commands';

export class BalancesModule {
    constructor(private readonly http: PlategaHttpClient) {}

    public async getAll(): Promise<GetBalancesCommand.IGetBalancesResponse> {
        return this.http.request<GetBalancesCommand.IGetBalancesResponse>(
            HTTP_METHOD.GET,
            PLATEGA_API.BALANCES,
        );
    }
}
