import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../styles/globalStyles';
import { MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function VolunteerRequestCard({ request, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(request)}>
      <View style={styles.cardBackground}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="volunteer-activism" size={24} color={Colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{request.title}</Text>
            <Text style={styles.subtitle}>{request.volunteersNeeded ? `${request.volunteersNeeded} volunteers needed` : request.description}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.9,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    overflow: 'hidden',
    ...Shadows.light,
  },
  cardBackground: {
    backgroundColor: Colors.lightBlue,
    padding: Spacing.md,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.getFontFamily('bold'),
    fontSize: Fonts.sizes.large,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.getFontFamily('regular'),
    fontSize: Fonts.sizes.medium,
    color: Colors.textSecondary,
  },
});
