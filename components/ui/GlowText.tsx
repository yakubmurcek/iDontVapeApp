/**
 * GlowText - Text with neon glow effect
 */

import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface GlowTextProps {
  children: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: TextStyle;
}

export function GlowText({ 
  children, 
  color = Colors.neonCyan,
  size = 'md',
  style,
}: GlowTextProps) {
  const fontSize = {
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
  }[size];
  
  return (
    <Text style={[
      styles.text,
      { 
        color,
        fontSize,
        textShadowColor: color,
      },
      style,
    ]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
});
