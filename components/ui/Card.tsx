/**
 * Card - Container component with sci-fi styling
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderColor?: string;
}

export function Card({ children, style, borderColor }: CardProps) {
  return (
    <View style={[
      styles.card,
      borderColor && { borderColor, borderWidth: 1 },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
});
