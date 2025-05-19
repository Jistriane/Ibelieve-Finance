export declare const openFinanceConfig: {
    clientId: string | undefined;
    clientSecret: string | undefined;
    redirectUri: string | undefined;
    scope: string[];
    authUrl: string | undefined;
    tokenUrl: string | undefined;
    userInfoUrl: string | undefined;
    endpoints: {
        accounts: string;
        balances: string;
        transactions: string;
        loans: string;
    };
    cache: {
        ttl: number;
        prefix: string;
    };
};
export declare const openFinanceScopes: {
    readonly accounts: "accounts";
    readonly balances: "balances";
    readonly transactions: "transactions";
    readonly loans: "loans";
};
export type OpenFinanceScope = typeof openFinanceScopes[keyof typeof openFinanceScopes];
