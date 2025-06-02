import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { OAUTH_CONFIG } from '../config/oauth';

// Complete the auth session for web browsers
WebBrowser.maybeCompleteAuthSession();

// 42 OAuth configuration from config file
const CLIENT_ID = OAUTH_CONFIG.CLIENT_ID;
const CLIENT_SECRET = OAUTH_CONFIG.CLIENT_SECRET;

// 42 OAuth endpoints
const AUTH_URL = OAUTH_CONFIG.AUTH_URL;
const TOKEN_URL = OAUTH_CONFIG.TOKEN_URL;
const USER_INFO_URL = OAUTH_CONFIG.USER_INFO_URL;

// Redirect URI - this should match what you've configured in your 42 app
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: OAUTH_CONFIG.APP_SCHEME,
  useProxy: true,
});

class Auth42Service {
  constructor() {
    this.discovery = {
      authorizationEndpoint: AUTH_URL,
      tokenEndpoint: TOKEN_URL,
    };
    
    // Debug OAuth config
    console.log('Auth42Service initialized with:');
    console.log('CLIENT_ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 10)}...` : 'MISSING');
    console.log('CLIENT_SECRET:', CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 10)}...` : 'MISSING');
    console.log('REDIRECT_URI:', REDIRECT_URI);
    console.log('AUTH_URL:', AUTH_URL);
  }

  // Start the OAuth flow
  async authenticate() {
    try {
      console.log('Starting 42 OAuth authentication...');
      const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        scopes: OAUTH_CONFIG.SCOPES,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        state: Crypto.randomUUID(),
      });

      const result = await request.promptAsync(this.discovery, {
        useProxy: true,
        showInRecents: true,
      });

      if (result.type === 'success') {
        // Exchange the authorization code for an access token
        const tokenResponse = await this.exchangeCodeForToken(result.params.code);
        
        if (tokenResponse.access_token) {
          // Fetch user information
          const userInfo = await this.fetchUserInfo(tokenResponse.access_token);
          
          return {
            success: true,
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            user: userInfo,
          };
        }
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Authentication cancelled by user',
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('42 OAuth Error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const tokenData = await response.json();
      
      if (!response.ok) {
        throw new Error(tokenData.error_description || 'Token exchange failed');
      }

      return tokenData;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  // Fetch user information using access token
  async fetchUserInfo(accessToken) {
    try {
      const response = await fetch(USER_INFO_URL, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const userData = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      // Extract only relevant data for the app (no raw data storage)
      const currentCampus = userData.campus && userData.campus.length > 0 ? userData.campus[0] : null;
      const currentCursus = userData.cursus_users && userData.cursus_users.length > 0 
        ? userData.cursus_users.find(cu => cu.cursus.name === '42cursus') || userData.cursus_users[0]
        : null;

      // Return only the data that the app actually needs
      return {
        id: userData.id,
        login: userData.login, // Wallet name (e.g., "yel-ouaz")
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        displayName: userData.displayname,
        fullName: `${userData.first_name} ${userData.last_name}`,
        image: userData.image?.link || userData.image?.versions?.medium || null,
        wallet: userData.wallet || 0,
        correctionPoint: userData.correction_point || 0,
        location: userData.location,
        
        // Campus information (minimal)
        campus: currentCampus ? {
          name: currentCampus.name,
          city: currentCampus.city,
          country: currentCampus.country,
        } : null,
        
        // Cursus information (only what we use)
        level: currentCursus?.level || 0,
        grade: currentCursus?.grade || null,
        blackholedAt: currentCursus?.blackholed_at || null,
        
        // Staff status
        isStaff: userData.staff || false,
      };
    } catch (error) {
      console.error('User info fetch error:', error);
      throw error;
    }
  }

  // Logout method (clears local tokens)
  logout() {
    // In a real app, you would also revoke the token on the server
    return Promise.resolve();
  }
}

export default new Auth42Service();
