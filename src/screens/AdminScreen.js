import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Shadows } from '../styles/globalStyles';
import { useUser } from '../context/UserContext';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/EventCard';
import AdminEventModal from '../components/AdminEventModal';
import VolunteerRequestCard from '../components/VolunteerRequestCard';

const { width: screenWidth } = Dimensions.get('window');

export default function AdminScreen() {
  const { user } = useUser();
  const { 
    allEvents, 
    userEvents, 
    isLoading, 
    error, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    refreshEvents 
  } = useEvents();
  
  const allVolunteerRequests = [];
  const userVolunteerRequests = [];
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [eventType, setEventType] = useState('regular'); 
  const [refreshing, setRefreshing] = useState(false);

  const displayEvents = activeTab === 'all' ? allEvents : userEvents;
  const displayVolunteerRequests = activeTab === 'all' ? allVolunteerRequests : userVolunteerRequests;

  const handleCreateEvent = (type) => {
    setEventType(type);
    setModalMode('create');
    setSelectedEvent(null);
    setModalVisible(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setModalMode('edit');
    setEventType(event.type);
    setModalVisible(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (modalMode === 'create') {
        const result = await createEvent(eventData);
        if (result.success) {
          Alert.alert('Success', 'Event created successfully!');
        } else {
          Alert.alert('Error', result.error || 'Failed to create event');
        }
      } else {
        const result = await updateEvent(selectedEvent.id, eventData);
        if (result.success) {
          Alert.alert('Success', 'Event updated successfully!');
        } else {
          Alert.alert('Error', result.error || 'Failed to update event');
        }
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const result = await deleteEvent(eventId);
      if (result.success) {
        Alert.alert('Success', 'Event deleted successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to delete event');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1987B5', '#0C3A61']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <Text style={styles.userLogin}>{user?.login || 'admin'}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.createButtonsContainer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => handleCreateEvent('regular')}
        >
          <LinearGradient
            colors={['#1987B5', '#0C3A61']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <View style={styles.createEventContent}>
              <Text style={styles.createButtonText}>Create{'\n'}Event</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => handleCreateEvent('volunteer')}
        >
          <LinearGradient
            colors={['#19B57E', '#0C6110']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.manageButtonText}>Create Volunteering{'\n'}Event </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Events
          </Text>
          {activeTab === 'all' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
            My Events
          </Text>
          {activeTab === 'my' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.eventsContainer}>
          {displayEvents.map((event) => (
            <View key={event.id} style={styles.eventCardWrapper}>
              <EventCard 
                event={event} 
                onPress={() => handleEditEvent(event)}
              />
            </View>
          ))}
          
          {displayVolunteerRequests.map((request) => (
            <View key={request.id} style={styles.eventCardWrapper}>
              <VolunteerRequestCard 
                request={request} 
                onPress={() => handleEditEvent(request)}
              />
            </View>
          ))}

          {displayEvents.length === 0 && displayVolunteerRequests.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                {activeTab === 'all' ? 'No events or volunteer requests available' : 'You haven\'t created any events or volunteer requests yet'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AdminEventModal
        visible={modalVisible}
        event={selectedEvent}
        mode={modalMode}
        eventType={eventType}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingTop: 46,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    paddingHorizontal: Spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxLarge,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  userLogin: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  createButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg + 10,
    paddingBottom: Spacing.lg + 10,
    justifyContent: 'space-evenly',
  },
  createButton: {
    width: 139,
    height: 97,
    borderRadius: 12,
    ...Shadows.light,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  createEventContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  plusIcon: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 8,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    textAlign: 'center',
  },
  manageButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    textAlign: 'center',
    lineHeight: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Unbounded-Bold',
    fontWeight: 'bold',
    color: '#888888',
  },
  activeTabText: {
    color: '#15397E',
    fontFamily: 'Unbounded-Medium',
    fontWeight: '500',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '80%',
    backgroundColor: '#15397E',
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  eventsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  eventCardWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
