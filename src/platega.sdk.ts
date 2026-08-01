import { PlategaConfigCommand } from './commands';
import { PlategaHttpClient } from './core';
import {
    PaymentsModule,
    BalancesModule,
    ConversionsModule,
    RefundsModule,
    WithdrawalsModule,
} from './modules';
import { verifyCallback, TCallbackHeaders } from './utils';

export class Platega {
    public readonly payments: PaymentsModule;
    public readonly balances: BalancesModule;
    public readonly conversions: ConversionsModule;
    public readonly refunds: RefundsModule;
    public readonly withdrawals: WithdrawalsModule;

    private readonly merchantId: PlategaConfigCommand.ICtrConfig['merchantId'];
    private readonly secret: PlategaConfigCommand.ICtrConfig['secret'];

    constructor(config: PlategaConfigCommand.ICtrInput) {
        const parsedConfig = PlategaConfigCommand.RequestCtrConfigSchema.parse(config);
        const http = new PlategaHttpClient(parsedConfig);

        this.merchantId = parsedConfig.merchantId;
        this.secret = parsedConfig.secret;

        this.payments = new PaymentsModule(http);
        this.balances = new BalancesModule(http);
        this.conversions = new ConversionsModule(http);
        this.refunds = new RefundsModule(http);
        this.withdrawals = new WithdrawalsModule(http);
    }

    // Verify that a callback really comes from Platega: the request must carry
    // your X-MerchantId and X-Secret headers (timing-safe comparison).
    // Platega callbacks have no cryptographic signature, so for critical flows
    // additionally re-check the transaction via payments.getById(id)
    public verifyCallback(headers: TCallbackHeaders): boolean {
        return verifyCallback({ merchantId: this.merchantId, secret: this.secret }, headers);
    }
}
