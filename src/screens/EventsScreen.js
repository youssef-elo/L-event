import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../styles/globalStyles';
import { WalletIcon } from '../components/Icons';
import { useUser } from '../context/UserContext';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/EventCard';
import EventDetailsModal from '../components/EventDetailsModal';

const { width: screenWidth } = Dimensions.get('window');

// Rating Modal Component
function RatingModal({ visible, event, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleStarPress = (starIndex) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit({ rating, feedback });
      setRating(0);
      setFeedback('');
      onClose();
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity key={index} onPress={() => handleStarPress(index)}>
        <MaterialIcons
          name={index < rating ? 'star' : 'star-border'}
          size={32}
          color={index < rating ? '#FFD700' : Colors.textSecondary}
          style={styles.star}
        />
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.ratingModalContainer}>
          <View style={styles.ratingModalHeader}>
            <Text style={styles.ratingModalTitle}>Rate Event</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {event && (
            <Text style={styles.eventTitleText}>{event.title}</Text>
          )}
          
          <Text style={styles.ratingLabel}>How was your experience?</Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          <TextInput
            style={styles.feedbackInput}
            placeholder="Share your feedback (optional)"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          
          <View style={styles.ratingButtonContainer}>
            <TouchableOpacity
              style={[styles.ratingButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.ratingButton,
                styles.submitButton,
                rating === 0 && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={rating === 0}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function EventsScreen() {
  const { walletName, firstName, wallet, level, attendedEvents } = useUser();
  const { allEvents: events, isLoading: loading, loadAllEvents: fetchEvents } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [eventToRate, setEventToRate] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Get subscribed events (events user has registered for)
  const subscribedEvents = events.filter(event => 
    attendedEvents.some(attended => attended.id === event.id)
  );

  // Get events that need feedback (attended events without ratings)
  const eventsNeedingFeedback = subscribedEvents.filter(event => 
    !event.userRating // Assuming events have a userRating field when rated
  );

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  const handleRateEvent = (event) => {
    setEventToRate(event);
    setRatingModalVisible(true);
  };

  const handleRatingSubmit = ({ rating, feedback }) => {
    // Here you would typically save the rating to your backend
    console.log('Rating submitted:', { event: eventToRate, rating, feedback });
    // You could update the event in your context or refetch events
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const renderTabButton = (tabName, label) => (
    <View style={styles.tabItem}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => setActiveTab(tabName)}
      >
        <Text style={[
          styles.tabButtonText, 
          activeTab === tabName && styles.activeTabButtonText
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
      {activeTab === tabName && <View style={styles.tabUnderline} />}
    </View>
  );

  const renderEventsList = () => {
    let currentEvents;
    switch (activeTab) {
      case 'all':
        currentEvents = events;
        break;
      case 'subscribed':
        currentEvents = subscribedEvents;
        break;
      case 'feedback':
        currentEvents = eventsNeedingFeedback;
        break;
      default:
        currentEvents = events;
    }
    
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      );
    }

    if (currentEvents.length === 0) {
      let emptyMessage, emptySubtext;
      switch (activeTab) {
        case 'all':
          emptyMessage = 'No events available';
          emptySubtext = 'Pull down to refresh';
          break;
        case 'subscribed':
          emptyMessage = 'No subscribed events';
          emptySubtext = 'Register for events to see them here';
          break;
        case 'feedback':
          emptyMessage = 'No events need feedback';
          emptySubtext = 'Complete events will appear here for rating';
          break;
      }

      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name={activeTab === 'all' ? 'event' : activeTab === 'subscribed' ? 'event-note' : 'rate-review'} 
            size={80} 
            color={Colors.textSecondary} 
          />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          <Text style={styles.emptySubtext}>{emptySubtext}</Text>
        </View>
      );
    }

    return currentEvents.map((event) => (
      <View key={event.id} style={styles.eventWrapper}>
        <EventCard 
          event={event} 
          onPress={handleEventPress}
        />
        {activeTab === 'feedback' && (
          <TouchableOpacity
            style={styles.rateEventButton}
            onPress={() => handleRateEvent(event)}
          >
            <MaterialIcons name="star-rate" size={20} color={Colors.white} />
            <Text style={styles.rateEventButtonText}>Rate Event</Text>
          </TouchableOpacity>
        )}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#1987B5" />
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#1987B5', '#0C3A61']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.brandText}>{walletName || 'Student'}</Text>
          <View style={styles.headerRow}>
            <Text style={styles.statusText}>
              {level >= 10 ? 'Senior Student' : level >= 5 ? 'Advanced Student' : level >= 2 ? 'Intermediate Student' : 'Beginner Student'}
            </Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>{wallet}</Text>
              <WalletIcon width={20} height={20} style={styles.walletIcon} />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('all', 'All Events')}
        {renderTabButton('subscribed', 'Subscribed')}
        {renderTabButton('feedback', 'Feedback')}
      </View>

      {/* Events List */}
      <ScrollView 
        style={styles.eventsContainer} 
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
        {renderEventsList()}
      </ScrollView>

      {/* Event Details Modal */}
      <EventDetailsModal
        visible={modalVisible}
        event={selectedEvent}
        onClose={handleCloseModal}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={ratingModalVisible}
        event={eventToRate}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleRatingSubmit}
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
    paddingTop: 51,
    paddingBottom: Spacing.xl + 7,
    paddingHorizontal: Spacing.lg + 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    marginTop: Spacing.lg,
  },
  brandText: {
    fontSize: 24,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceText: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.white,
  },
  walletIcon: {
    // Icon positioning
  },
  statusText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.white,
  },
  // Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: 25 - Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    zIndex: 1,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    color: '#888888',
  },
  activeTabButtonText: {
    color: '#15397E',
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
  },
  tabUnderline: {
    width: 30,
    height: 2,
    backgroundColor: '#15397E',
    borderRadius: 1,
    marginTop: Spacing.xs,
  },
  eventsContainer: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: '#FAF9F6',
  },
  eventWrapper: {
    marginBottom: Spacing.sm,
  },
  rateEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: screenWidth * 0.05,
    marginTop: -Spacing.md,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    ...Shadows.light,
    gap: Spacing.xs,
  },
  rateEventButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Rating Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.large,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    maxWidth: screenWidth * 0.9,
    width: '100%',
    ...Shadows.medium,
  },
  ratingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ratingModalTitle: {
    fontSize: Fonts.sizes.xLarge,
    fontFamily: Fonts.getFontFamily('bold'),
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  eventTitleText: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('semibold'),
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  ratingLabel: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  star: {
    marginHorizontal: Spacing.xs,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.text,
    marginBottom: Spacing.lg,
    minHeight: 100,
  },
  ratingButtonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    color: Colors.textSecondary,
  },
  submitButtonText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
    color: Colors.white,
  },
});
