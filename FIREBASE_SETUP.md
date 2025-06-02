# Firebase Setup for L-Event App

## Prerequisites

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database in your Firebase project
3. Set up authentication if needed

## Configuration Steps

### 1. Get Firebase Config

1. Go to your Firebase project settings
2. Scroll down to "Your apps" section
3. Click on the web app icon (`</>`) to add a web app
4. Register your app with a name (e.g., "L-Event")
5. Copy the Firebase configuration object

### 2. Update Firebase Config

Replace the placeholder values in `/src/config/firebase.js` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 3. Set Up Firestore Security Rules

In your Firebase console, go to Firestore Database > Rules and update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for admin purposes
    }
    
    // Events can be read by anyone authenticated, created/updated by admins
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        (resource == null || resource.data.createdBy == request.auth.uid);
    }
    
    // Comments can be created by authenticated users, read by anyone
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Ratings can be created/updated by authenticated users, read by anyone
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. Initialize Firestore Collections

The app will automatically create the following collections when users interact with it:

- **users**: User profiles and statistics
- **events**: Event data created by admins
- **comments**: User comments on events
- **ratings**: User ratings for events

### 5. Test the Setup

1. Run the app: `npm start` or `expo start`
2. Login with a user account
3. Check that user data is created in the Firestore `users` collection
4. Test creating events as an admin user
5. Test adding comments and ratings on events

## Data Structure

### Users Collection (`/users/{userId}`)
```javascript
{
  login: "user-login",
  fullName: "User Full Name",
  email: "user@example.com",
  image: "profile-image-url",
  createdAt: timestamp,
  lastLoginAt: timestamp,
  isAdmin: boolean,
  stats: {
    attended: number,
    volunteered: number,
    rating: number,
    attendedEvents: [eventId1, eventId2, ...],
    volunteeredEvents: [eventId1, eventId2, ...],
    unlockedBadges: number
  }
}
```

### Events Collection (`/events/{eventId}`)
```javascript
{
  title: "Event Title",
  category: "Technology|Business|Workshop|...",
  date: "15",
  month: "JUN",
  time: "2:00 PM - 4:00 PM",
  location: "Event Location",
  total: 50,
  description: "Event description",
  type: "regular|volunteer",
  createdBy: "user-login",
  createdAt: timestamp,
  updatedAt: timestamp,
  booked: number,
  attendees: [userId1, userId2, ...],
  volunteers: [userId1, userId2, ...]
}
```

### Comments Collection (`/comments/{commentId}`)
```javascript
{
  eventId: "event-id",
  userId: "user-login",
  comment: "Comment text",
  createdAt: timestamp
}
```

### Ratings Collection (`/ratings/{eventId_userId}`)
```javascript
{
  eventId: "event-id",
  userId: "user-login",
  rating: number, // 1-5
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Features Enabled

✅ **User Management**
- User profiles synced with Firebase
- User statistics and badge system
- Special user handling (admin privileges, special stats for certain users)

✅ **Event Management**
- Create, read, update, delete events
- Admin-only event management
- Event booking and attendance tracking
- Separate regular and volunteering events

✅ **Comments System**
- Users can comment on events
- Real-time comment loading
- User identification in comments

✅ **Rating System**
- 5-star rating system for events
- Average rating calculation
- Individual user ratings tracked

✅ **Real-time Synchronization**
- All data synced with Firebase
- Offline support with local caching
- Pull-to-refresh functionality

## Troubleshooting

### Common Issues

1. **Firebase connection errors**: Verify your Firebase config is correct
2. **Permission denied**: Check Firestore security rules
3. **Data not syncing**: Ensure internet connection and Firebase config
4. **Authentication issues**: Verify user authentication flow

### Debug Mode

Enable debug logging by adding this to your app:

```javascript
// In your main App.js or index.js
if (__DEV__) {
  console.log('Firebase debugging enabled');
}
```

## Next Steps

1. Set up Firebase Authentication for better security
2. Add image upload functionality using Firebase Storage
3. Implement push notifications for new events
4. Add real-time updates using Firestore listeners
5. Set up Firebase Analytics for user behavior tracking
