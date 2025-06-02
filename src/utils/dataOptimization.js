// Data optimization utilities for Firebase storage
// This file contains utilities to ensure only relevant data is stored in Firebase

/**
 * Sanitize user data from 42API to store only app-relevant fields
 * Removes unnecessary data to optimize Firebase storage and reduce costs
 */
export const sanitizeUserDataForStorage = (userData) => {
  // Define only the fields our app actually uses
  const relevantFields = {
    // Core identity
    id: userData.id,
    login: userData.login,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    displayName: userData.displayName,
    fullName: userData.fullName,
    image: userData.image,
    
    // 42 specific data that affects app functionality
    wallet: userData.wallet || 0,
    correctionPoint: userData.correctionPoint || 0,
    location: userData.location,
    level: userData.level || 0,
    grade: userData.grade,
    blackholedAt: userData.blackholedAt,
    isStaff: userData.isStaff || false,
    
    // Campus info (minimal, only what we display)
    campus: userData.campus ? {
      name: userData.campus.name,
      city: userData.campus.city,
      country: userData.campus.country,
    } : null,
  };

  // Remove any undefined or null values to keep the document clean
  return Object.fromEntries(
    Object.entries(relevantFields).filter(([_, value]) => value !== undefined)
  );
};

/**
 * Sanitize event data to store only necessary fields
 */
export const sanitizeEventDataForStorage = (eventData) => {
  const relevantFields = {
    title: eventData.title,
    category: eventData.category,
    date: eventData.date,
    month: eventData.month,
    time: eventData.time,
    location: eventData.location,
    description: eventData.description || '',
    total: parseInt(eventData.total) || 0,
    booked: eventData.booked || 0,
    attendees: eventData.attendees || [],
    volunteers: eventData.volunteers || [],
    type: eventData.type || 'regular',
  };

  return Object.fromEntries(
    Object.entries(relevantFields).filter(([_, value]) => value !== undefined)
  );
};

/**
 * Calculate document size estimate for monitoring Firebase usage
 */
export const estimateDocumentSize = (data) => {
  const jsonString = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonString]).size;
  return {
    bytes: sizeInBytes,
    kb: (sizeInBytes / 1024).toFixed(2),
    isLarge: sizeInBytes > 1048576 // 1MB limit for Firestore documents
  };
};

/**
 * Log data optimization savings
 */
export const logDataOptimization = (originalData, optimizedData, dataType = 'data') => {
  const originalSize = estimateDocumentSize(originalData);
  const optimizedSize = estimateDocumentSize(optimizedData);
  const savings = ((originalSize.bytes - optimizedSize.bytes) / originalSize.bytes * 100).toFixed(1);
  
  console.log(`📊 ${dataType} optimization:`, {
    original: `${originalSize.kb} KB`,
    optimized: `${optimizedSize.kb} KB`,
    savings: `${savings}% saved`,
    fieldsRemoved: Object.keys(originalData).length - Object.keys(optimizedData).length
  });
};
