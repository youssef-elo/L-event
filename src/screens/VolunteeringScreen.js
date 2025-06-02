import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Shadows } from '../styles/globalStyles';
import { useUser } from '../context/UserContext';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/EventCard';
import EventDetailsModal from '../components/EventDetailsModal';

export default function VolunteeringScreen() {
  const { walletName, firstName, wallet, level, attendedEvents } = useUser();
  const { allEvents: events, isLoading: loading, loadAllEvents: fetchEvents, getVolunteeringEvents } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events to show volunteering opportunities (volunteering events user hasn't attended)
  const volunteeringEvents = getVolunteeringEvents().filter(event => 
    !attendedEvents.some(attended => attended.id === event.id)
  );

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
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
          <Text style={styles.brandText}>Volunteer Opportunities</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{attendedEvents.length}</Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{volunteeringEvents.length}</Text>
              <Text style={styles.statLabel}>Available Events</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

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
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading volunteer opportunities...</Text>
          </View>
        ) : volunteeringEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="volunteer-activism" size={80} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No volunteer opportunities</Text>
            <Text style={styles.emptySubtext}>
              {events.length > 0 
                ? "You've attended all available events!" 
                : "Check back later for new events"
              }
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Opportunities</Text>
              <Text style={styles.sectionSubtitle}>
                Volunteer at events to earn points and badges
              </Text>
            </View>
            {volunteeringEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onPress={handleEventPress}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Event Details Modal */}
      <EventDetailsModal
        visible={modalVisible}
        event={selectedEvent}
        onClose={handleCloseModal}
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
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.white,
  },
  statLabel: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  eventsContainer: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: '#FAF9F6',
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xLarge,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textSecondary,
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
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
