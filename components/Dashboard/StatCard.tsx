/**
 * StatCard - Stats display with icon
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

export function StatCard({ icon, label, value, color = Colors.neonCyan }: StatCardProps) {
  return (
    <Card borderColor={`${color}20`} style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
