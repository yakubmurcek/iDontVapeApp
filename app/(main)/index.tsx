/**
 * Dashboard - Main screen with Bio-Twin and stats
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, DollarSign, Activity, AlertTriangle, List } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { BioTwinScene } from '@/components/BioTwin/BioTwinScene';
import { IntegrityRing } from '@/components/Dashboard/IntegrityRing';
import { MilestoneCard } from '@/components/Dashboard/MilestoneCard';
import { StatCard } from '@/components/Dashboard/StatCard';
import { Button } from '@/components/ui/Button';
import { GlowText } from '@/components/ui/GlowText';

export default function Dashboard() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Subscribe to user store
  const initialDamageScore = useUserStore(state => state.initialDamageScore);
  const getFormattedTimeSinceQuit = useUserStore(state => state.getFormattedTimeSinceQuit);
  const getSystemIntegrity = useUserStore(state => state.getSystemIntegrity);
  const getMoneySaved = useUserStore(state => state.getMoneySaved);
  const getCurrentMilestone = useUserStore(state => state.getCurrentMilestone);
  const getHoursSinceQuit = useUserStore(state => state.getHoursSinceQuit);
  
  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Get computed values
  const formattedTime = getFormattedTimeSinceQuit();
  const systemIntegrity = getSystemIntegrity();
  const moneySaved = getMoneySaved();
  const milestone = getCurrentMilestone();
  const hoursSinceQuit = getHoursSinceQuit();
  const damageLevel = 1 - systemIntegrity;
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <GlowText size="sm">PULMONARY SYSTEM RECOVERY</GlowText>
          
          {/* Time since quit */}
          <View style={styles.timeContainer}>
            <Clock size={16} color={Colors.dataBlue} />
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        </View>
        
        {/* Bio-Twin Scene */}
        <View style={styles.bioTwinContainer}>
          <BioTwinScene 
            damageLevel={initialDamageScore}
            recoveryProgress={systemIntegrity}
            height={320}
          />
          
          {/* Integrity Ring Overlay */}
          <View style={styles.integrityOverlay}>
            <IntegrityRing score={systemIntegrity} size={120} />
          </View>
        </View>
        
        {/* Stats Section */}
        <View style={styles.statsSection}>
          {/* Milestone Card */}
          <MilestoneCard 
            nextMilestone={milestone.next}
            progress={milestone.progress}
            hoursSinceQuit={hoursSinceQuit}
          />
          
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon={<DollarSign size={20} color={Colors.healthGreen} />}
              label="CREDITS SAVED"
              value={`$${moneySaved.toFixed(2)}`}
              color={Colors.healthGreen}
            />
            <StatCard
              icon={<Activity size={20} color={Colors.neonCyan} />}
              label="SYSTEM INTEGRITY"
              value={`${Math.round(systemIntegrity * 100)}%`}
              color={Colors.neonCyan}
            />
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.sosButtonContainer}>
            <LinearGradient
              colors={[Colors.cautionAmber, Colors.damageOrange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sosButton}
            >
              <Button
                title="SOS"
                onPress={() => router.push('/(main)/sos')}
                variant="ghost"
                icon={<AlertTriangle size={20} color="#000" />}
                style={styles.sosButtonInner}
                textStyle={styles.sosButtonText}
              />
            </LinearGradient>
          </View>
          
          <View style={styles.logsButtonContainer}>
            <Button
              title="Logs"
              onPress={() => router.push('/(main)/logs')}
              variant="secondary"
              icon={<List size={20} color={Colors.white} />}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  bioTwinContainer: {
    position: 'relative',
    marginTop: 8,
  },
  integrityOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 24,
  },
  sosButtonContainer: {
    flex: 1,
  },
  sosButton: {
    borderRadius: 14,
    shadowColor: Colors.cautionAmber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonInner: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  sosButtonText: {
    color: '#000',
  },
  logsButtonContainer: {
    flex: 1,
  },
});
