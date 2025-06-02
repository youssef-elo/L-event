import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Auth42Service from '../services/Auth42Service';
import FirebaseService from '../services/FirebaseService';
import { sanitizeUserDataForStorage, logDataOptimization } from '../utils/dataOptimization';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [userStats, setUserStats] = useState({
    attended: 0,
    volunteered: 0,
    rating: 0,
    attendedEvents: [],
    volunteeredEvents: [],
    unlockedBadges: 0 // Start with 0 unlocked badges
  });

  // List of admin users
  const adminUsers = ['yel-ouaz', 'hrochd', 'youbihi', 'aerrfig'];

  // Function to check if user is admin
  const isAdmin = () => {
    return user && adminUsers.includes(user.login);
  };

  // Function to reset stats for demo purposes
  const resetStats = async () => {
    const defaultStats = {
      attended: 0,
      volunteered: 0,
      rating: 0,
      attendedEvents: [],
      volunteeredEvents: [],
      unlockedBadges: 0
    };
    
    setUserStats(defaultStats);
    await AsyncStorage.setItem('userStats', JSON.stringify(defaultStats));
    return { success: true };
  };

  // Helper function to get user title based on badges
  const getUserTitle = (unlockedBadges) => {
    switch (unlockedBadges) {
      case 0: return "Attendee";
      case 1: return "Volunteer";
      case 2: return "Support Scout";
      case 3: return "Event Guardian";
      case 4: return "Serial Volunteer";
      case 5: return "Community Hero";
      default: return "Attendee";
    }
  };

  // Helper function to get ring color based on badges
  const getRingColor = (unlockedBadges) => {
    switch (unlockedBadges) {
      case 0: return "#FFFFFF";
      case 1: return "#565656";
      case 2: return "#B08D57";
      case 3: return "#C0C0C0";
      case 4: return "#F9C538";
      case 5: return "#A24BB1";
      default: return "#FFFFFF";
    }
  };

  // Check if user is already authenticated on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('accessToken');
      const savedUser = await AsyncStorage.getItem('userData');
      
      if (savedToken && savedUser) {
        const userData = JSON.parse(savedUser);
        setAccessToken(savedToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Load user data from Firebase
        try {
          const firebaseUser = await FirebaseService.getUser(userData.login);
          if (firebaseUser.success) {
            setUserStats(firebaseUser.user.stats);
            // Update local storage with Firebase data
            await AsyncStorage.setItem('userStats', JSON.stringify(firebaseUser.user.stats));
          } else {
            // If user doesn't exist in Firebase, create them
            await FirebaseService.createOrUpdateUser(userData);
            const newFirebaseUser = await FirebaseService.getUser(userData.login);
            if (newFirebaseUser.success) {
              setUserStats(newFirebaseUser.user.stats);
              await AsyncStorage.setItem('userStats', JSON.stringify(newFirebaseUser.user.stats));
            }
          }
        } catch (firebaseError) {
          console.error('Firebase error, falling back to local storage:', firebaseError);
          // Fallback to local storage if Firebase fails
          const savedStats = await AsyncStorage.getItem('userStats');
          if (savedStats) {
            setUserStats(JSON.parse(savedStats));
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      const result = await Auth42Service.authenticate();
      
      if (result.success) {
        // Save user data and token locally
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        
        if (result.refreshToken) {
          await AsyncStorage.setItem('refreshToken', result.refreshToken);
        }
        
        setUser(result.user);
        setAccessToken(result.accessToken);
        setIsAuthenticated(true);
        
        // Optimize user data before storing in Firebase
        const optimizedUserData = sanitizeUserDataForStorage(result.user);
        
        // Log optimization savings (only in development)
        if (__DEV__) {
          logDataOptimization(result.user, optimizedUserData, 'User data');
        }
        
        // Create or update user in Firebase with optimized data
        const firebaseResult = await FirebaseService.createOrUpdateUser(optimizedUserData);
        
        if (firebaseResult.success) {
          // Load user data from Firebase
          const userData = await FirebaseService.getUser(result.user.login);
          if (userData.success) {
            setUserStats(userData.user.stats);
            // Update local storage with Firebase data
            await AsyncStorage.setItem('userStats', JSON.stringify(userData.user.stats));
          }
        }
        
        // Special case for user 'hrochd' to set specific stats
        if (result.user.login === 'hrochd') {
          setUserStats({
            attended: 20,
            volunteered: 20,
            rating: 4,
            attendedEvents: [],
            volunteeredEvents: [],
            unlockedBadges: 7
          });
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData', 'userStats']);
      
      // Clear state
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      setUserStats({
        attended: 0,
        volunteered: 0,
        rating: 0,
        attendedEvents: [],
        volunteeredEvents: [],
        unlockedBadges: 0
      });
      
      // Call the service logout method
      await Auth42Service.logout();
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUserData = async () => {
    if (!accessToken) return;
    
    try {
      const updatedUser = await Auth42Service.fetchUserInfo(accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to attend an event
  const attendEvent = async (event) => {
    try {
      
      // Normal handling for other users
      const newAttendedEvents = [...userStats.attendedEvents, event.id];
      const newAttendedCount = userStats.attended + 1;
      
      const updatedStats = {
        ...userStats,
        attended: newAttendedCount,
        attendedEvents: newAttendedEvents
      };
      
      setUserStats(updatedStats);
      
      // Update Firebase
      await FirebaseService.updateUserStats(user.login, updatedStats);
      // Also book the event in Firebase
      await FirebaseService.bookEvent(event.id, user.login, 'regular');
      await AsyncStorage.setItem('userStats', JSON.stringify(updatedStats));
      
      return { success: true, stats: updatedStats };
    } catch (error) {
      console.error('Error attending event:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to volunteer for an event
  const volunteerEvent = async (event) => {
    try {
      // Special handling for hrochd
      
      // Normal handling for other users
      const newVolunteeredEvents = [...userStats.volunteeredEvents, event.id];
      const newVolunteeredCount = userStats.volunteered + 1;
      
      // Calculate new badge unlocks based on volunteering
      let newUnlockedBadges = 0;
      if (newVolunteeredCount >= 1) newUnlockedBadges = 1;
      if (newVolunteeredCount >= 3) newUnlockedBadges = 2;
      if (newVolunteeredCount >= 10) newUnlockedBadges = 3;
      if (newVolunteeredCount >= 25) newUnlockedBadges = 4;
      if (newVolunteeredCount >= 30 && userStats.rating >= 4.7) newUnlockedBadges = 5;
      
      const updatedStats = {
        ...userStats,
        volunteered: newVolunteeredCount,
        volunteeredEvents: newVolunteeredEvents,
        unlockedBadges: newUnlockedBadges
      };
      
      setUserStats(updatedStats);
      
      // Update Firebase
      await FirebaseService.updateUserStats(user.login, updatedStats);
      // Also book the volunteer event in Firebase
      await FirebaseService.bookEvent(event.id, user.login, 'volunteer');
      await AsyncStorage.setItem('userStats', JSON.stringify(updatedStats));
      
      return { success: true, stats: updatedStats };
    } catch (error) {
      console.error('Error volunteering for event:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to update user rating
  const updateRating = async (newRating) => {
    try {
      // Check if 5th badge should be unlocked with new rating
      let newUnlockedBadges = userStats.unlockedBadges;
      if (userStats.volunteered >= 30 && newRating >= 4.7 && newUnlockedBadges < 5) {
        newUnlockedBadges = 5;
      }
      
      const updatedStats = {
        ...userStats,
        rating: newRating,
        unlockedBadges: newUnlockedBadges
      };
      
      setUserStats(updatedStats);
      
      // Update Firebase
      await FirebaseService.updateUserStats(user.login, updatedStats);
      await AsyncStorage.setItem('userStats', JSON.stringify(updatedStats));
      
      return { success: true, stats: updatedStats };
    } catch (error) {
      console.error('Error updating rating:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to check if user has attended an event
  const hasAttendedEvent = (eventId) => {
    return userStats.attendedEvents.includes(eventId);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    userStats,
    login,
    logout,
    refreshUserData,
    attendEvent,
    volunteerEvent,
    updateRating,
    hasAttendedEvent,
    resetStats,
    getUserTitle,
    getRingColor,
    isAdmin,
    
    // Helper getters for commonly used data
    get walletName() {
      return user?.login || '';
    },
    get fullName() {
      return user?.fullName || '';
    },
    get firstName() {
      return user?.firstName || '';
    },
    get lastName() {
      return user?.lastName || '';
    },
    get email() {
      return user?.email || '';
    },
    get profileImage() {
      return user?.image || '';
    },
    get campus() {
      return user?.campus?.name || '';
    },
    get level() {
      return user?.cursus?.level || 0;
    },
    get wallet() {
      return user?.wallet || 0;
    },
    get correctionPoints() {
      return user?.correctionPoint || 0;
    },
    
    // Statistics getters
    get attendedCount() {
      return userStats.attended;
    },
    get volunteeredCount() {
      return userStats.volunteered;
    },
    get userRating() {
      return userStats.rating;
    },
    get unlockedBadges() {
      return userStats.unlockedBadges;
    },
    get attendedEvents() {
      return userStats.attendedEvents || [];
    },
    get volunteeredEvents() {
      return userStats.volunteeredEvents || [];
    },
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
