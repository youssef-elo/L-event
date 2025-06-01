import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing } from '../styles/globalStyles';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your 1337 profile</Text>
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
    fontFamily: Fonts.family,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.medium,
  },
  subtitle: {
    fontSize: Fonts.sizes.large,
    fontFamily: Fonts.family,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
