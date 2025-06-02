// 42 OAuth Configuration
// Credentials are loaded from environment variables (.env file)

export const OAUTH_CONFIG = {
  // Your 42 application client ID (from .env)
  CLIENT_ID: process.env.EXPO_PUBLIC_42_CLIENT_ID,
  
  // Your 42 application client secret (from .env)
  CLIENT_SECRET: process.env.EXPO_PUBLIC_42_CLIENT_SECRET,
  
  // Your app's redirect URI scheme (from .env)
  APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME,
  
  // 42 OAuth endpoints (these shouldn't change)
  AUTH_URL: 'https://api.intra.42.fr/oauth/authorize',
  TOKEN_URL: 'https://api.intra.42.fr/oauth/token',
  USER_INFO_URL: 'https://api.intra.42.fr/v2/me',
  
  // OAuth scopes
  SCOPES: ['public'],
};

// Instructions for setup:
// 1. Go to https://profile.intra.42.fr/oauth/applications
// 2. Create a new application
// 3. Set the redirect URI to: com.levent.app://oauth (or your custom scheme)
// 4. Copy the client ID and client secret to the .env file:
//    EXPO_PUBLIC_42_CLIENT_ID=your_client_id_here
//    EXPO_PUBLIC_42_CLIENT_SECRET=your_client_secret_here
// 5. Update EXPO_PUBLIC_APP_SCHEME in .env if you want to use a different scheme
