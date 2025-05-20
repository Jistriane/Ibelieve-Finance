import { OpenFinanceScope } from '../config/openfinance';
export declare class OpenFinanceService {
    private redis;
    private config;
    constructor();
    private getAccessToken;
    getAuthorizationUrl(scopes: OpenFinanceScope[]): Promise<string>;
    handleCallback(code: string, state: string): Promise<void>;
    getFinancialData(accessToken: string, endpoint: string): Promise<any>;
    private exchangeCodeForToken;
    private generateState;
    makeRequest(endpoint: string, method?: string, body?: any): Promise<any>;
}
