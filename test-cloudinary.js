// Test script to verify Cloudinary configuration and connectivity
import { FirebaseService } from './src/services/FirebaseService.js';

async function testCloudinary() {
  console.log('=== Cloudinary Test Script ===');
  
  // Test 1: Check environment variables
  console.log('\n1. Environment Variables:');
  console.log('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME:', process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME);
  console.log('EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET:', process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  
  // Test 2: Test connectivity
  console.log('\n2. Testing Cloudinary connectivity...');
  try {
    const connectionResult = await FirebaseService.testCloudinaryConnection();
    console.log('Connection test result:', connectionResult);
  } catch (error) {
    console.error('Connection test error:', error);
  }
  
  // Test 3: Try a simple fetch to Cloudinary
  console.log('\n3. Testing direct fetch to Cloudinary...');
  try {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxcgbchyt';
    const testURL = `https://api.cloudinary.com/v1_1/${cloudName}/image/list`;
    console.log('Testing URL:', testURL);
    
    const response = await fetch(testURL);
    console.log('Direct fetch status:', response.status);
    console.log('Direct fetch headers:', response.headers);
  } catch (error) {
    console.error('Direct fetch error:', error);
  }
}

// Run the test
testCloudinary().catch(console.error);
