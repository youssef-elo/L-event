import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, Shadows } from '../styles/globalStyles';
import { useUser } from '../context/UserContext';
import CommentsRatingSection from './CommentsRatingSection';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function EventDetailsModal({ visible, event, onClose }) {
  const { attendEvent, hasAttendedEvent, user } = useUser();
  const [isBooking, setIsBooking] = useState(false);
  
  if (!event) return null;

  const isAlreadyAttended = hasAttendedEvent(event.id);

  // Handle missing image source for Firebase events
  const getImageSource = () => {
    if (event.imageSource) {
      return event.imageSource;
    }
    // Default images based on category or use placeholder
    const categoryImages = {
      'Technology': require('../../assets/placeholder1.png'),
      'Business': require('../../assets/placeholder2.png'),
      'Workshop': require('../../assets/placeholder3.png'),
      'Networking': require('../../assets/placeholder1.png'),
      'Conference': require('../../assets/placeholder2.png'),
      'Seminar': require('../../assets/placeholder3.png'),
    };
    return categoryImages[event.category] || require('../../assets/placeholder1.png');
  };

  const handleBookEvent = async () => {
    if (isAlreadyAttended) {
      Alert.alert('Already Booked', 'You have already booked this event!');
      return;
    }

    setIsBooking(true);
    try {
      const result = await attendEvent(event);
      if (result.success) {
          // Normal success message for other users
          Alert.alert(
            'Event Booked Successfully!', 
            `You've successfully booked "${event.title}". Your attendance has been recorded.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  onClose();
                }
              }
            ]
          );
      } else {
        Alert.alert('Booking Failed', 'Failed to book the event. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while booking the event.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar style="light" backgroundColor="#1987B5" />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#1987B5', '#0C3A61']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <View style={styles.placeholder} />
              <Text style={styles.headerTitle}>Event Details</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={getImageSource()} 
              style={styles.eventImage}
              resizeMode="cover"
            />
            {/* Date Badge Overlay */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeDay}>{event.date}</Text>
              <Text style={styles.dateBadgeMonth}>{event.month}</Text>
            </View>
          </View>

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            {/* Details Section */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <MaterialIcons name="access-time" size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{event.time}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialIcons name="people" size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Attendance</Text>
                <Text style={styles.detailValue}>{event.booked}/{event.total} people</Text>
              </View>
            </View>

            {/* Description Section */}
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.description}>
                Join us for an amazing {event.category.toLowerCase()} experience! This event promises to be engaging, 
                informative, and a great opportunity to network with like-minded individuals. 
                Don't miss out on this incredible opportunity to learn, grow, and connect.
              </Text>
            </View>

            {/* Booking Progress */}
            <View style={styles.bookingSection}>
              <Text style={styles.sectionTitle}>Booking Status</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(event.booked / event.total) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {event.booked} of {event.total} spots filled
                </Text>
              </View>
            </View>

            {/* Comments and Rating Section */}
            {isAlreadyAttended && (
              <CommentsRatingSection eventId={event.id} />
            )}
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={[styles.bookButton, isAlreadyAttended && styles.attendedButton]} 
            onPress={handleBookEvent}
            disabled={isBooking || isAlreadyAttended}
          >
            <LinearGradient
              colors={isAlreadyAttended ? ['#95A5A6', '#7F8C8D'] : ['#1987B5', '#0C3A61']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookButtonGradient}
            >
              <Text style={styles.bookButtonText}>
                {isBooking ? 'Booking...' : isAlreadyAttended ? 'Already Booked' : 'Book Now'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.white,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: screenWidth * 0.95,
    aspectRatio: 16 / 9,
    alignSelf: 'center',
    marginTop: Spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  dateBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 50,
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  dateBadgeDay: {
    fontSize: 18,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.text,
    lineHeight: 20,
  },
  dateBadgeMonth: {
    fontSize: 12,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  eventInfo: {
    padding: Spacing.lg,
  },
  eventTitle: {
    fontSize: Fonts.sizes.xxLarge,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: '#000000',
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  categoryText: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.white,
  },
  detailsSection: {
    marginBottom: Spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailLabel: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  detailValue: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.text,
  },
  descriptionSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bookingSection: {
    marginBottom: Spacing.xl,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomSection: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  attendedButton: {
    opacity: 0.7,
  },
  bookButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.white,
  },
});
