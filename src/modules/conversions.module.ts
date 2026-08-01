import { PLATEGA_API } from '../api';
import { PlategaHttpClient } from '../core';
import { ListConversionsCommand, HTTP_METHOD } from '../commands';

export class ConversionsModule {
    constructor(private readonly http: PlategaHttpClient) {}

    public async list(
        dto: ListConversionsCommand.IListConversionsQueryInput,
    ): Promise<ListConversionsCommand.IListConversionsResponse> {
        const params = ListConversionsCommand.QueryListConversionsSchema.parse(dto);
        return this.http.request<ListConversionsCommand.IListConversionsResponse>(
            HTTP_METHOD.GET,
            PLATEGA_API.CONVERSIONS,
            {
                query: {
                    from: params.from,
                    to: params.to,
                    page: params.page,
                    size: params.size,
                },
            },
        );
    }
}
