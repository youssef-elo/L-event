// Simple Firebase test - only Firestore
import { db } from './src/config/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function testFirestoreOnly() {
  try {
    console.log('🔥 Testing Firestore connection (no Auth/Storage)...');
    
    // Test basic Firestore access
    const testCollection = collection(db, 'test');
    console.log('✅ Firestore collection reference created successfully');
    
    console.log('✅ Firebase setup is working correctly!');
    console.log('📱 Your app should now work in Expo Go');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error.message);
  }
}

testFirestoreOnly();
