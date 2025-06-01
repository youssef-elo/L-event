import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../styles/globalStyles';

export default function EventCard({ event, onPress }) {
  return (
    <TouchableOpacity style={styles.eventCard} onPress={() => onPress?.(event)}>
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

const styles = StyleSheet.create({
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
