import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function EventCard({ event, onPress }) {
  // Handle missing image source for Firebase events
  const getImageSource = () => {
    // If there's an imageSource property, use it
    if (event.imageSource) {
      return event.imageSource;
    }
    
    // If there's an imageUri with Firebase Storage URL, use it
    if (event.imageUri) {
      return { uri: event.imageUri };
    }
    
    // Use default.png as fallback for events with no image
    return require('../../assets/default.png');
  };

  return (
    <TouchableOpacity style={styles.eventCard} onPress={() => onPress?.(event)}>
      {/* Image section with overlaid date badge */}
      <View style={styles.imageContainer}>
        <View style={styles.eventImagePlaceholder}>
          <Image 
            source={getImageSource()} 
            style={styles.eventImage}
            resizeMode="cover"
          />
        </View>
        {/* Date badge positioned in top-right corner */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeDay}>{event.date}</Text>
          <Text style={styles.dateBadgeMonth}>{event.month}</Text>
        </View>
      </View>
      
      {/* Content section */}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        
        <View style={styles.eventInfo}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={16} color={Colors.textSecondary} />
            <Text style={styles.eventLocation}>{event.location}</Text>
          </View>
          
          <View style={styles.bottomRow}>
            <Text style={styles.eventTime}>{event.time}</Text>
            <Text style={styles.eventCounter}>{event.booked}/{event.total}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    width: screenWidth * 0.90,
    height: 250,
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: Spacing.lg,
    // iOS shadow properties
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Android shadow property
    elevation: 8,
    alignSelf: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    paddingHorizontal: Spacing.xs,
    paddingTop: 3,
    paddingBottom: 3,
    overflow: 'hidden',
  },
  eventImagePlaceholder: {
    flex: 1,
    height: 160,
    backgroundColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 42,
    height: 42,
    backgroundColor: Colors.white,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light,
  },
  dateBadgeDay: {
    fontSize: 16,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.text,
    lineHeight: 18,
  },
  dateBadgeMonth: {
    fontSize: 10,
    fontFamily: Fonts.getFontFamily('medium'),
    fontWeight: Fonts.getFontWeight('medium'),
    color: Colors.textSecondary,
    lineHeight: 12,
  },
  eventContent: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
    minHeight: 80,
  },
  eventTitle: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: '#000000',
    marginBottom: Spacing.xs,
    paddingLeft: 13,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    paddingLeft: 13,
  },
  eventLocation: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 13,
    paddingRight: 13,
  },
  eventTime: {
    fontSize: Fonts.sizes.small,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textMuted,
  },
  eventCounter: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.getFontFamily('semibold'),
    fontWeight: Fonts.getFontWeight('semibold'),
    color: Colors.primary,
  },
});
