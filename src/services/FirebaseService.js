import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

class FirebaseService {
  // Users Collection
  static USERS_COLLECTION = 'users';
  static EVENTS_COLLECTION = 'events';
  static COMMENTS_COLLECTION = 'comments';
  static RATINGS_COLLECTION = 'ratings';

  // ============ USER OPERATIONS ============
  
  /**
   * Create or update user profile in Firestore
   * Only stores relevant app data, not the entire 42API response
   */
  static async createOrUpdateUser(userData) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userData.login);
      
      // Check if user already exists
      const userDoc = await getDoc(userRef);
      
      // Only store app-relevant fields
      const relevantUserData = {
        id: userData.id,
        login: userData.login,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName,
        fullName: userData.fullName,
        image: userData.image,
        wallet: userData.wallet,
        correctionPoint: userData.correctionPoint,
        location: userData.location,
        campus: userData.campus,
        level: userData.level,
        grade: userData.grade,
        blackholedAt: userData.blackholedAt,
        isStaff: userData.isStaff,
      };
      
      if (userDoc.exists()) {
        // Update existing user with new login info but preserve stats
        const existingData = userDoc.data();
        await updateDoc(userRef, {
          ...relevantUserData,
          lastLoginAt: serverTimestamp(),
          // Preserve existing stats and events
          stats: existingData.stats || {
            attended: 0,
            volunteered: 0,
            rating: 0,
            attendedEvents: [],
            volunteeredEvents: [],
            unlockedBadges: 0
          }
        });
        return { success: true, isNewUser: false };
      } else {
        // Create new user with default stats
        const newUserData = {
          ...relevantUserData,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          stats: {
            attended: 0,
            volunteered: 0,
            rating: 0,
            attendedEvents: [],
            volunteeredEvents: [],
            unlockedBadges: 0
          },
          isAdmin: ['yel-ouaz', 'hrochd', 'youbihi', 'aerrfig'].includes(userData.login)
        };
        
        // Special stats for certain users
        if (userData.login === 'hrochd') {
          newUserData.stats = {
            attended: 2,
            volunteered: 7,
            rating: 3.7,
            attendedEvents: [],
            volunteeredEvents: [],
            unlockedBadges: 0
          };
        } else if (['yel-ouaz'].includes(userData.login)) {
          newUserData.stats = {
            attended: 100,
            volunteered: 100,
            rating: 5.1,
            attendedEvents: Array.from({ length: 100 }, (_, i) => `event_${i + 1}`),
            volunteeredEvents: Array.from({ length: 100 }, (_, i) => `volunteer_event_${i + 1}`),
            unlockedBadges: 5
          };
        }
        
        await setDoc(userRef, newUserData);
        return { success: true, isNewUser: true };
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUser(userId) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { success: true, user: userDoc.data() };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user stats
   */
  static async updateUserStats(userId, newStats) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        stats: newStats,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add event to user's attended/volunteered list
   */
  static async addEventToUser(userId, eventId, eventType) {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const fieldName = eventType === 'volunteer' ? 'stats.volunteeredEvents' : 'stats.attendedEvents';
      const countField = eventType === 'volunteer' ? 'stats.volunteered' : 'stats.attended';
      
      await updateDoc(userRef, {
        [fieldName]: arrayUnion(eventId),
        [countField]: increment(1),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding event to user:', error);
      return { success: false, error: error.message };
    }
  }

  // ============ EVENT OPERATIONS ============
  
  /**
   * Create a new event
   */
  static async createEvent(eventData, creatorId) {
    try {
      const eventRef = await addDoc(collection(db, this.EVENTS_COLLECTION), {
        ...eventData,
        createdBy: creatorId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        booked: 0,
        attendees: [],
        volunteers: []
      });
      
      return { success: true, eventId: eventRef.id };
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing event
   */
  static async updateEvent(eventId, eventData) {
    try {
      const eventRef = doc(db, this.EVENTS_COLLECTION, eventId);
      await updateDoc(eventRef, {
        ...eventData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an event
   */
  static async deleteEvent(eventId) {
    try {
      const eventRef = doc(db, this.EVENTS_COLLECTION, eventId);
      await deleteDoc(eventRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all events
   */
  static async getAllEvents() {
    try {
      const eventsRef = collection(db, this.EVENTS_COLLECTION);
      // Try with ordering first, fallback to simple query if index not available
      let querySnapshot;
      
      try {
        const eventsQuery = query(eventsRef, orderBy('createdAt', 'desc'));
        querySnapshot = await getDocs(eventsQuery);
      } catch (indexError) {
        console.log('Using simple query without ordering due to index requirement');
        // Fallback to simple query without ordering
        querySnapshot = await getDocs(eventsRef);
      }
      
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort in JavaScript to ensure consistent ordering
      events.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime; // Descending order (newest first)
      });
      
      return { success: true, events };
    } catch (error) {
      console.error('Error getting events:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get events created by a specific user
   */
  static async getUserEvents(userId) {
    try {
      const eventsRef = collection(db, this.EVENTS_COLLECTION);
      // Simplified query - only filter by createdBy to avoid composite index requirement
      const eventsQuery = query(eventsRef, where('createdBy', '==', userId));
      const querySnapshot = await getDocs(eventsQuery);
      
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      events.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime; // Descending order
      });
      
      return { success: true, events };
    } catch (error) {
      console.error('Error getting user events:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Book/Join an event
   */
  static async bookEvent(eventId, userId, eventType = 'regular') {
    try {
      const eventRef = doc(db, this.EVENTS_COLLECTION, eventId);
      const attendeeField = eventType === 'volunteer' ? 'volunteers' : 'attendees';
      
      await updateDoc(eventRef, {
        [attendeeField]: arrayUnion(userId),
        booked: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Also add to user's attended/volunteered events
      await this.addEventToUser(userId, eventId, eventType);
      
      return { success: true };
    } catch (error) {
      console.error('Error booking event:', error);
      return { success: false, error: error.message };
    }
  }

  // ============ COMMENT OPERATIONS ============
  
  /**
   * Add a comment to an event
   */
  static async addComment(eventId, userId, commentText) {
    try {
      const commentRef = await addDoc(collection(db, this.COMMENTS_COLLECTION), {
        eventId,
        userId,
        comment: commentText,
        createdAt: serverTimestamp()
      });
      
      return { success: true, commentId: commentRef.id };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comments for an event
   */
  static async getEventComments(eventId) {
    try {
      const commentsRef = collection(db, this.COMMENTS_COLLECTION);
      // Simplified query - only filter by eventId to avoid composite index requirement
      const commentsQuery = query(commentsRef, where('eventId', '==', eventId));
      const querySnapshot = await getDocs(commentsQuery);
      
      const comments = [];
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort in JavaScript instead of Firestore to avoid index requirement
      comments.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime; // Descending order (newest first)
      });
      
      return { success: true, comments };
    } catch (error) {
      console.error('Error getting comments:', error);
      return { success: false, error: error.message };
    }
  }

  // ============ RATING OPERATIONS ============
  
  /**
   * Add or update a rating for an event
   */
  static async rateEvent(eventId, userId, rating) {
    try {
      const ratingId = `${eventId}_${userId}`;
      const ratingRef = doc(db, this.RATINGS_COLLECTION, ratingId);
      
      await setDoc(ratingRef, {
        eventId,
        userId,
        rating,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error rating event:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get average rating for an event
   */
  static async getEventRating(eventId) {
    try {
      const ratingsRef = collection(db, this.RATINGS_COLLECTION);
      const ratingsQuery = query(ratingsRef, where('eventId', '==', eventId));
      const querySnapshot = await getDocs(ratingsQuery);
      
      let totalRating = 0;
      let ratingCount = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        totalRating += data.rating;
        ratingCount++;
      });
      
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      
      return { success: true, averageRating, ratingCount };
    } catch (error) {
      console.error('Error getting event rating:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's rating for an event
   */
  static async getUserEventRating(eventId, userId) {
    try {
      const ratingId = `${eventId}_${userId}`;
      const ratingRef = doc(db, this.RATINGS_COLLECTION, ratingId);
      const ratingDoc = await getDoc(ratingRef);
      
      if (ratingDoc.exists()) {
        return { success: true, rating: ratingDoc.data().rating };
      } else {
        return { success: true, rating: null };
      }
    } catch (error) {
      console.error('Error getting user rating:', error);
      return { success: false, error: error.message };
    }
  }

  // ============ IMAGE UPLOAD OPERATIONS ============
  
  /**
   * Upload image to Firebase Storage
   * @param {string} imageUri - Local file URI from ImagePicker
   * @param {string} folder - Storage folder (e.g., 'events')
   * @param {string} fileName - Custom filename (optional)
   * @returns {Promise<{success: boolean, downloadURL?: string, error?: string}>}
   */
  static async uploadImage(imageUri, folder = 'images', fileName = null) {
    try {
      console.log('Starting image upload:', { imageUri, folder, fileName });
      
      // Validate imageUri
      if (!imageUri) {
        throw new Error('Image URI is required');
      }
      
      // Check if storage is properly configured
      if (!storage) {
        throw new Error('Firebase Storage is not properly configured');
      }
      
      // Convert URI to blob
      console.log('Fetching image from URI...');
      const response = await fetch(imageUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('Image blob created:', { type: blob.type, size: blob.size });
      
      // Validate blob
      if (blob.size === 0) {
        throw new Error('Image file is empty');
      }
      
      // Check blob size (limit to 10MB)
      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('Image file is too large (max 10MB)');
      }
      
      // Generate filename if not provided
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileExtension = blob.type.includes('png') ? 'png' : 'jpg';
      const finalFileName = fileName || `event_${timestamp}_${randomId}.${fileExtension}`;
      
      console.log('Generated filename:', finalFileName);
      
      // Create storage reference
      const storageRef = ref(storage, `${folder}/${finalFileName}`);
      console.log('Storage reference created:', storageRef.fullPath);
      
      // Set metadata
      const metadata = {
        contentType: blob.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
        }
      };
      
      // Upload the blob
      console.log('Starting upload to Firebase Storage...');
      const snapshot = await uploadBytes(storageRef, blob, metadata);
      console.log('Upload successful:', snapshot.metadata.fullPath);
      
      // Get download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      return { success: true, downloadURL, fileName: finalFileName };
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        serverResponse: error.serverResponse,
        customData: error.customData
      });
      
      // Provide more specific error messages
      let userFriendlyMessage = error.message;
      if (error.code === 'storage/unauthorized') {
        userFriendlyMessage = 'Upload permission denied. Please check Firebase Storage rules.';
      } else if (error.code === 'storage/quota-exceeded') {
        userFriendlyMessage = 'Storage quota exceeded. Please upgrade your Firebase plan.';
      } else if (error.code === 'storage/unauthenticated') {
        userFriendlyMessage = 'Authentication required for upload.';
      } else if (error.code === 'storage/unknown') {
        userFriendlyMessage = 'Upload failed due to server error. Please check your Firebase Storage configuration and rules.';
      }
      
      return { success: false, error: userFriendlyMessage };
    }
  }

  /**
   * Delete image from Firebase Storage
   * @param {string} imagePath - Full path to the image in storage
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async deleteImage(imagePath) {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload image to Cloudinary
   * @param {string} imageUri - Local file URI from ImagePicker
   * @param {string} folder - Cloudinary folder (e.g., 'events')
   * @returns {Promise<{success: boolean, cloudinaryURL?: string, error?: string}>}
   */
  static async uploadImageToCloudinary(imageUri, folder = 'events') {
    try {
      console.log('Starting image upload to Cloudinary:', { imageUri, folder });

      // Debug environment variables
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      console.log('Environment variables:', { 
        cloudName: cloudName ? `${cloudName.substring(0, 3)}...` : 'undefined', 
        uploadPreset: uploadPreset ? `${uploadPreset.substring(0, 3)}...` : 'undefined' 
      });

      // Validate imageUri
      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      // Validate environment variables
      if (!cloudName || !uploadPreset) {
        console.error('Missing environment variables:', { cloudName, uploadPreset });
        throw new Error('Missing Cloudinary configuration. Check environment variables.');
      }

      // For React Native, we need to handle file URIs differently
      let fileUri = imageUri;
      if (imageUri.startsWith('file://')) {
        // On Android, we might need to use the URI as-is
        fileUri = imageUri;
      }

      console.log('Preparing form data...');
      // Prepare form data with React Native compatible approach
      const formData = new FormData();
      
      // Use the React Native way to append files
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg', // Specify the mime type
        name: 'image.jpg',
      });
      
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'events/images');

      // Prepare Cloudinary upload URL
      const cloudinaryUploadURL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log('Cloudinary upload URL:', cloudinaryUploadURL);

      // Upload to Cloudinary with enhanced options
      console.log('Attempting upload to Cloudinary...');
      const cloudinaryResponse = await fetch(cloudinaryUploadURL, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let React Native set it automatically for FormData
      });

      console.log('Cloudinary response status:', cloudinaryResponse.status);
      
      if (!cloudinaryResponse.ok) {
        const errorText = await cloudinaryResponse.text();
        console.error('Cloudinary error response:', errorText);
        throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status} ${cloudinaryResponse.statusText} - ${errorText}`);
      }

      const cloudinaryData = await cloudinaryResponse.json();
      console.log('Cloudinary upload successful:', cloudinaryData);

      return { success: true, cloudinaryURL: cloudinaryData.secure_url };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Alternative Cloudinary upload using base64
   * @param {string} imageUri - Local file URI
   * @param {string} folder - Cloudinary folder
   * @returns {Promise<{success: boolean, cloudinaryURL?: string, error?: string}>}
   */
  static async uploadImageToCloudinaryBase64(imageUri, folder = 'events') {
    try {
      console.log('Starting base64 upload to Cloudinary:', { imageUri, folder });

      // Debug environment variables
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      console.log('Environment variables:', { cloudName, uploadPreset });

      // Validate environment variables
      if (!cloudName || !uploadPreset) {
        throw new Error('Missing Cloudinary configuration. Check environment variables.');
      }

      // Convert image to base64
      console.log('Converting image to base64...');
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Convert blob to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      console.log('Base64 conversion completed, length:', base64.length);

      // Prepare upload data
      const uploadData = {
        file: base64,
        upload_preset: uploadPreset,
        folder: 'events/images',
      };

      // Upload to Cloudinary
      const cloudinaryUploadURL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log('Uploading to:', cloudinaryUploadURL);

      const cloudinaryResponse = await fetch(cloudinaryUploadURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      });

      console.log('Cloudinary response status:', cloudinaryResponse.status);

      if (!cloudinaryResponse.ok) {
        const errorText = await cloudinaryResponse.text();
        console.error('Cloudinary error response:', errorText);
        throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status} ${cloudinaryResponse.statusText} - ${errorText}`);
      }

      const cloudinaryData = await cloudinaryResponse.json();
      console.log('Upload successful:', cloudinaryData.secure_url);

      return {
        success: true,
        cloudinaryURL: cloudinaryData.secure_url
      };

    } catch (error) {
      console.error('Cloudinary base64 upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test Cloudinary connectivity and configuration
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async testCloudinaryConnection() {
    try {
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      console.log('Testing Cloudinary connection...');
      console.log('Cloud name:', cloudName);
      console.log('Upload preset:', uploadPreset);
      
      if (!cloudName || !uploadPreset) {
        return {
          success: false,
          error: 'Missing Cloudinary environment variables'
        };
      }

      // Test a simple GET request to Cloudinary API
      const testURL = `https://api.cloudinary.com/v1_1/${cloudName}/image/list`;
      const response = await fetch(testURL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Test response status:', response.status);
      
      if (response.ok) {
        return {
          success: true,
          message: 'Cloudinary connection successful'
        };
      } else {
        return {
          success: false,
          error: `Connection test failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      console.error('Cloudinary connection test error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default FirebaseService;
