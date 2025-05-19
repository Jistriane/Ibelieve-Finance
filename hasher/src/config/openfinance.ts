export const openFinanceConfig = {
  clientId: process.env.OPENFINANCE_CLIENT_ID || 'test_client_id',
  clientSecret: process.env.OPENFINANCE_CLIENT_SECRET || 'test_client_secret',
  redirectUri: process.env.OPENFINANCE_REDIRECT_URI || 'http://localhost:3000/callback',
  authUrl: process.env.OPENFINANCE_AUTH_URL || 'http://localhost:3000/auth',
  tokenUrl: process.env.OPENFINANCE_TOKEN_URL || 'http://localhost:3000/token',
  userInfoUrl: process.env.OPENFINANCE_USERINFO_URL || 'http://localhost:3000/userinfo',
  baseUrl: process.env.OPENFINANCE_BASE_URL || 'http://localhost:3000/api',
  scope: process.env.OPENFINANCE_SCOPE || 'openid profile email accounts balance transactions',
  cache: {
    tokenKey: 'openfinance:token',
    tokenExpiration: 3600,
    dataExpiration: 300
  }
};
