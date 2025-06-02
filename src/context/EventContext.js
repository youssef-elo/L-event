import React, { createContext, useContext, useState, useEffect } from 'react';
import FirebaseService from '../services/FirebaseService';
import { useUser } from './UserContext';

const EventContext = createContext();

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const [allEvents, setAllEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useUser();

  // Load all events from Firebase
  const loadAllEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await FirebaseService.getAllEvents();
      if (result.success) {
        setAllEvents(result.events);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load events created by the current user
  const loadUserEvents = async () => {
    if (!user?.login) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await FirebaseService.getUserEvents(user.login);
      if (result.success) {
        setUserEvents(result.events);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading user events:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new event
  const createEvent = async (eventData) => {
    if (!user?.login) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await FirebaseService.createEvent(eventData, user.login);
      if (result.success) {
        // Reload events to get the updated list
        await loadAllEvents();
        await loadUserEvents();
        return { success: true, eventId: result.eventId };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing event
  const updateEvent = async (eventId, eventData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await FirebaseService.updateEvent(eventId, eventData);
      if (result.success) {
        // Reload events to get the updated list
        await loadAllEvents();
        await loadUserEvents();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await FirebaseService.deleteEvent(eventId);
      if (result.success) {
        // Reload events to get the updated list
        await loadAllEvents();
        await loadUserEvents();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Book/Join an event
  const bookEvent = async (eventId, eventType = 'regular') => {
    if (!user?.login) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await FirebaseService.bookEvent(eventId, user.login, eventType);
      if (result.success) {
        // Reload events to update booking counts
        await loadAllEvents();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error booking event:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Add comment to an event
  const addComment = async (eventId, commentText) => {
    if (!user?.login) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await FirebaseService.addComment(eventId, user.login, commentText);
      return result;
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  };

  // Get comments for an event
  const getEventComments = async (eventId) => {
    try {
      const result = await FirebaseService.getEventComments(eventId);
      return result;
    } catch (error) {
      console.error('Error getting comments:', error);
      return { success: false, error: error.message };
    }
  };

  // Rate an event
  const rateEvent = async (eventId, rating) => {
    if (!user?.login) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await FirebaseService.rateEvent(eventId, user.login, rating);
      return result;
    } catch (error) {
      console.error('Error rating event:', error);
      return { success: false, error: error.message };
    }
  };

  // Get event rating
  const getEventRating = async (eventId) => {
    try {
      const result = await FirebaseService.getEventRating(eventId);
      return result;
    } catch (error) {
      console.error('Error getting event rating:', error);
      return { success: false, error: error.message };
    }
  };

  // Get user's rating for an event
  const getUserEventRating = async (eventId) => {
    if (!user?.login) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await FirebaseService.getUserEventRating(eventId, user.login);
      return result;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return { success: false, error: error.message };
    }
  };

  // Load events when user authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      loadAllEvents();
      loadUserEvents();
    }
  }, [isAuthenticated, user?.login]);

  // Load all events on provider initialization
  useEffect(() => {
    loadAllEvents();
  }, []);

  // Refresh events - useful for pull-to-refresh
  const refreshEvents = async () => {
    await Promise.all([loadAllEvents(), loadUserEvents()]);
  };

  // Filter events by type
  const getEventsByType = (type) => {
    return allEvents.filter(event => event.type === type);
  };

  // Get regular events
  const getRegularEvents = () => {
    return allEvents.filter(event => event.category !== 'Volunteering');
  };

  // Get volunteering events
  const getVolunteeringEvents = () => {
    return allEvents.filter(event => event.category === 'Volunteering');
  };

  const value = {
    // State
    allEvents,
    userEvents,
    isLoading,
    error,

    // Actions
    loadAllEvents,
    loadUserEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    bookEvent,
    refreshEvents,

    // Comments
    addComment,
    getEventComments,

    // Ratings
    rateEvent,
    getEventRating,
    getUserEventRating,

    // Helpers
    getEventsByType,
    getRegularEvents,
    getVolunteeringEvents,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export default EventContext;
