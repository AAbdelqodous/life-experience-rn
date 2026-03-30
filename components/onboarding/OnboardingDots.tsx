import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OnboardingDotsProps {
  count: number;
  activeIndex: number;
}

export function OnboardingDots({ count, activeIndex }: OnboardingDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === activeIndex && styles.activeDot]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C4D6F0',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#1A73E8',
  },
});
