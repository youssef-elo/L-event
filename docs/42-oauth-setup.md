# 42 OAuth Setup Instructions

## Prerequisites
To use 42 OAuth authentication in this app, you need to:

1. Have a 42 account
2. Access to the 42 OAuth application management

## Setup Steps

### 1. Create a 42 OAuth Application

1. Go to [42 OAuth Applications](https://profile.intra.42.fr/oauth/applications)
2. Click "New Application"
3. Fill in the application details:
   - **Name**: L'EVENT (or your preferred name)
   - **Description**: Event management app for 42 students
   - **Website**: Your app's website (optional)
   - **Redirect URI**: `com.levent.app://oauth`

### 2. Configure the App

1. After creating the application, copy the **Client ID** and **Client Secret**
2. Open `/src/config/oauth.js`
3. Replace the placeholder values:
   ```javascript
   export const OAUTH_CONFIG = {
     CLIENT_ID: 'your_actual_client_id_here',
     CLIENT_SECRET: 'your_actual_client_secret_here',
     // ... rest of config
   };
   ```

### 3. Test the Authentication

1. Start the app: `npm start`
2. Navigate to the login screen
3. Tap "Authenticate with 42"
4. You should be redirected to 42's OAuth page
5. After authorization, you'll be redirected back to the app

## Configuration Options

You can customize the OAuth configuration in `/src/config/oauth.js`:

- **APP_SCHEME**: Change the URL scheme (remember to update `app.json` too)
- **SCOPES**: Modify the OAuth scopes requested
- **Endpoints**: 42 API endpoints (shouldn't need changes)

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Ensure the redirect URI in your 42 app matches exactly: `com.levent.app://oauth`
   - Check that the `scheme` in `app.json` matches your configuration

2. **"Client authentication failed"**
   - Verify your Client ID and Client Secret are correct
   - Make sure there are no extra spaces or characters

3. **App doesn't redirect back**
   - Check the URL scheme configuration in `app.json`
   - Ensure the redirect URI is properly configured

### Testing on Different Platforms

- **iOS Simulator**: OAuth should work with the proxy
- **Android Emulator**: OAuth should work with the proxy
- **Physical Device**: May need additional configuration for custom schemes

## Security Notes

- Never commit your actual Client ID and Client Secret to version control
- Consider using environment variables for production builds
- The Client Secret should ideally be handled server-side in production

## API Endpoints Used

- **Authorization**: `https://api.intra.42.fr/oauth/authorize`
- **Token Exchange**: `https://api.intra.42.fr/oauth/token`
- **User Info**: `https://api.intra.42.fr/v2/me`

## User Data Retrieved

The app retrieves the following user information from 42:

- User ID
- Login (username)
- Email
- First and Last Name
- Display Name
- Profile Image
- Campus Information
- Cursus Information

This data can be used throughout the app for personalization and user management.
