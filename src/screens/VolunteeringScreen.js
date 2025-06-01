import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts, Spacing } from '../styles/globalStyles';

export default function VolunteeringScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteering</Text>
      <Text style={styles.subtitle}>Find volunteer opportunities</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.large,
  },
  title: {
    fontSize: Fonts.sizes.title,
    fontFamily: Fonts.getFontFamily('bold'),
    fontWeight: Fonts.getFontWeight('bold'),
    color: Colors.text,
    marginBottom: Spacing.medium,
  },
  subtitle: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.getFontFamily('regular'),
    fontWeight: Fonts.getFontWeight('regular'),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
