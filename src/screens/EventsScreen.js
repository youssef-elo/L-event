import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../styles/globalStyles';
import { WalletIcon } from '../components/Icons';

const { width: screenWidth } = Dimensions.get('window');

// Sample event data based on the SVG design
const events = [
  {
    id: 1,
    title: 'Tech Conference 2024',
    date: '31',
    month: 'MAY',
    time: '09:00',
    price: '€25',
    location: '1337 Campus',
    category: 'Technology',
  },
  {
    id: 2,
    title: 'Startup Pitch Day',
    date: '33',
    month: 'JUN',
    time: '14:30',
    price: 'FREE',
    location: 'Innovation Hub',
    category: 'Business',
  },
  {
    id: 3,
    title: 'AI Workshop',
    date: '31',
    month: 'JUN',
    time: '10:00',
    price: '€15',
    location: 'Lab Room',
    category: 'Workshop',
  },
  {
    id: 4,
    title: 'Networking Event',
    date: '31',
    month: 'JUL',
    time: '18:00',
    price: '€10',
    location: 'Main Hall',
    category: 'Networking',
  },
];



function EventCard({ event }) {
  return (
    <TouchableOpacity style={styles.eventCard}>
      <View style={styles.eventImagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>IMG</Text>
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventDateSection}>
          <Text style={styles.eventDate}>{event.date}</Text>
          <Text style={styles.eventMonth}>{event.month}</Text>
        </View>
        <View style={styles.eventDetails}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventLocation}>{event.location}</Text>
          <Text style={styles.eventTime}>{event.time}</Text>
        </View>
        <View style={styles.eventPriceSection}>
          <Text style={styles.eventPrice}>{event.price}</Text>
          <Text style={styles.eventCategory}>{event.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function EventsScreen() {
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
          <Text style={styles.brandText}>yel-ouaz</Text>
          <View style={styles.headerRow}>
            <Text style={styles.statusText}>Serial Volunteer</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceText}>245</Text>
              <WalletIcon width={20} height={20} style={styles.walletIcon} />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Events List */}
      <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </ScrollView>
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
  eventsContainer: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: '#FAF9F6',
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.large,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  eventImagePlaceholder: {
    height: 120,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textMuted,
  },
  eventContent: {
    flexDirection: 'row',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  eventDateSection: {
    alignItems: 'center',
    marginRight: Spacing.lg,
    minWidth: 50,
  },
  eventDate: {
    fontSize: Fonts.sizes.xxlarge,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.primary,
  },
  eventMonth: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
    marginTop: -2,
  },
  eventDetails: {
    flex: 1,
    marginRight: Spacing.md,
  },
  eventTitle: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  eventLocation: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  eventTime: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textMuted,
  },
  eventPriceSection: {
    alignItems: 'flex-end',
  },
  eventPrice: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.primary,
  },
  eventCategory: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
