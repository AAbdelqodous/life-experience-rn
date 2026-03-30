import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { AppText } from '../ui/AppText';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
  title: string;
  subtitle: string;
  backgroundColor?: string;
}

export function OnboardingSlide({
  title,
  subtitle,
  backgroundColor = '#E6F4FE',
}: OnboardingSlideProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.imageArea} />
      <View style={styles.textArea}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  imageArea: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(26,115,232,0.1)',
    marginBottom: 48,
  },
  textArea: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#555',
  },
});
