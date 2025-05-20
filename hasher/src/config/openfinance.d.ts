export type OpenFinanceScope = 'accounts' | 'balance' | 'transactions' | 'payments' | 'consents';
export interface OpenFinanceConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authUrl: string;
    tokenUrl: string;
    baseUrl: string;
    cache: {
        tokenKey: string;
        tokenExpiration: number;
        ttl: number;
    };
}
export declare const openFinanceConfig: OpenFinanceConfig;
