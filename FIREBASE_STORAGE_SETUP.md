# Firebase Storage Setup Guide

## Issue
You're encountering the error: `Firebase Storage: An unknown error occurred, please check the error payload for server response. (storage/unknown)`

This error typically occurs when Firebase Storage security rules don't allow the upload operation.

## Solution: Update Firebase Storage Rules

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `levent-7fe55`
3. Navigate to **Storage** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Storage Rules
Replace your current rules with the following rules that allow public read/write access:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** These rules allow anyone to read and write to your storage. For production, you should implement proper authentication and more restrictive rules.

### Step 3: More Secure Rules (Recommended for Production)
For better security, use these rules that allow public read but require some basic validation for writes:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{imageId} {
      // Allow anyone to read event images
      allow read: if true;
      // Allow writes for image files under 5MB
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /{allPaths=**} {
      // Allow read access to all other files
      allow read: if true;
    }
  }
}
```

### Step 4: Alternative Solution (If Rules Don't Work)
If updating rules doesn't resolve the issue, the problem might be:

1. **Network connectivity** - Check your internet connection
2. **Firebase project configuration** - Verify the `storageBucket` in your config
3. **Expo/React Native permissions** - Ensure proper permissions for file access

### Step 5: Test the Upload
After updating the rules:
1. Wait a few minutes for the rules to propagate
2. Try uploading an image again in your app
3. Check the console logs for more detailed error information

### Alternative Approach (Temporary)
If you continue having issues, the app has been updated to gracefully handle upload failures by:
- Showing a user-friendly message
- Falling back to the default image
- Allowing the event to be created successfully
- Providing the option to edit the event later to add an image

## Checking Your Current Rules
To see your current Storage rules:
1. Go to Firebase Console > Storage > Rules
2. Your current rules should be visible in the editor

## Common Issues
- **Quota exceeded**: Check if you've exceeded Firebase's free tier limits
- **Invalid project**: Ensure your `storageBucket` URL is correct in `firebase.js`
- **Network issues**: Try from a different network or check firewall settings

## Need Help?
If you continue experiencing issues:
1. Check the Firebase Console logs
2. Verify your project configuration
3. Try the upload from Firebase Console directly to test connectivity
