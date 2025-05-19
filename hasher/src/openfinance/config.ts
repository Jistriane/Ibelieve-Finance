import { config } from 'dotenv';

config();

export const openFinanceConfig = {
  clientId: process.env.OPEN_FINANCE_CLIENT_ID,
  clientSecret: process.env.OPEN_FINANCE_CLIENT_SECRET,
  redirectUri: process.env.OPEN_FINANCE_REDIRECT_URI,
  scope: process.env.OPEN_FINANCE_SCOPE?.split(' ') || [],
  authUrl: process.env.OPEN_FINANCE_AUTH_URL,
  tokenUrl: process.env.OPEN_FINANCE_TOKEN_URL,
  userInfoUrl: process.env.OPEN_FINANCE_USERINFO_URL,
  endpoints: {
    accounts: '/accounts',
    balances: '/balances',
    transactions: '/transactions',
    loans: '/loans'
  },
  cache: {
    ttl: 3600, // 1 hora
    prefix: 'openfinance_'
  }
};

export const openFinanceScopes = {
  accounts: 'accounts',
  balances: 'balances',
  transactions: 'transactions',
  loans: 'loans'
} as const;

export type OpenFinanceScope = typeof openFinanceScopes[keyof typeof openFinanceScopes]; 