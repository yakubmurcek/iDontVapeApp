/**
 * SOS View - Craving help with breathing exercise
 */

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Colors } from '@/constants/Colors'
import { useLogsStore } from '@/store/logsStore'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import {
  Candy,
  Droplet,
  Dumbbell,
  Footprints,
  Hand,
  MessageCircle,
  Play,
  Square,
  Waves,
  X,
} from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const CRAVING_TIPS = [
  {
    title: 'Drink ice water',
    desc: 'The cold sensation can distract your brain and reduce cravings.',
    icon: Droplet,
  },
  {
    title: 'Take a walk',
    desc: 'Even 5 minutes of movement releases dopamine naturally.',
    icon: Footprints,
  },
  {
    title: 'Chew gum or mints',
    desc: 'Keeping your mouth busy helps fight the oral fixation.',
    icon: Candy,
  },
  {
    title: 'Text a friend',
    desc: 'Social connection reduces stress and craving intensity.',
    icon: MessageCircle,
  },
  {
    title: 'Do 10 push-ups',
    desc: "Physical exertion redirects your body's energy.",
    icon: Dumbbell,
  },
  {
    title: 'Splash cold water',
    desc: 'Cold water on your face activates the dive reflex, calming nerves.',
    icon: Waves,
  },
]

export default function SOSView() {
  const router = useRouter()
  const addLog = useLogsStore((state) => state.addLog)

  const [cravingMinutes, setCravingMinutes] = useState(15)
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState('Breathe In')

  const breatheScale = useSharedValue(1)

  // Craving countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCravingMinutes((m) => Math.max(0, m - 1))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Breathing animation
  useEffect(() => {
    if (!isBreathing) return

    let isMounted = true

    const runCycle = () => {
      if (!isMounted || !isBreathing) return

      // Breathe in (4s)
      setBreathPhase('Breathe In')
      breatheScale.value = withTiming(1.4, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      })

      setTimeout(() => {
        if (!isMounted || !isBreathing) return
        // Hold (7s)
        setBreathPhase('Hold')

        setTimeout(() => {
          if (!isMounted || !isBreathing) return
          // Breathe out (8s)
          setBreathPhase('Breathe Out')
          breatheScale.value = withTiming(1, {
            duration: 8000,
            easing: Easing.inOut(Easing.ease),
          })

          setTimeout(() => {
            if (isMounted && isBreathing) {
              runCycle()
            }
          }, 8000)
        }, 7000)
      }, 4000)
    }

    runCycle()

    return () => {
      isMounted = false
    }
  }, [isBreathing, breatheScale])

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }))

  const toggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false)
      setBreathPhase('Breathe In')
      breatheScale.value = withTiming(1, { duration: 300 })
    } else {
      setIsBreathing(true)
    }
  }

  const handleResisted = () => {
    addLog('cravingResisted')
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Craving Help</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <X
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Craving Timer */}
        <Card
          borderColor="rgba(255, 184, 0, 0.3)"
          style={styles.timerCard}
        >
          <Text style={styles.timerLabel}>CRAVING WILL FADE IN</Text>
          <View style={styles.timerRow}>
            <Text style={styles.timerValue}>~{cravingMinutes}</Text>
            <Text style={styles.timerUnit}>min</Text>
          </View>
          <Text style={styles.timerSubtext}>
            Most cravings peak at 3-5 minutes and fade within 15-20 minutes
          </Text>
        </Card>

        {/* Breathing Exercise */}
        <Card style={styles.breathingCard}>
          <Text style={styles.sectionTitle}>4-7-8 BREATHING</Text>

          <View style={styles.breathingContainer}>
            {/* Outer ring */}
            <View style={styles.breathRingOuter} />

            {/* Animated circle */}
            <Animated.View style={[styles.breathCircle, breatheStyle]}>
              <LinearGradient
                colors={['rgba(0, 240, 255, 0.4)', 'rgba(0, 240, 255, 0.1)']}
                style={styles.breathGradient}
              />
            </Animated.View>

            {/* Phase text */}
            <Text style={styles.breathPhase}>{breathPhase}</Text>
          </View>

          <TouchableOpacity
            onPress={toggleBreathing}
            style={styles.breathButton}
          >
            {isBreathing ? (
              <Square
                size={20}
                color={Colors.white}
                fill={Colors.white}
              />
            ) : (
              <Play
                size={20}
                color="#000"
                fill="#000"
              />
            )}
            <Text style={[styles.breathButtonText, isBreathing && styles.breathButtonTextAlt]}>
              {isBreathing ? 'Stop' : 'Start Breathing'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionLabel}>QUICK DISTRACTIONS</Text>
          <FlatList
            horizontal
            data={CRAVING_TIPS}
            keyExtractor={(_, i) => i.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsList}
            renderItem={({ item }) => (
              <Card style={styles.tipCard}>
                <item.icon
                  size={24}
                  color={Colors.dataBlue}
                />
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text style={styles.tipDesc}>{item.desc}</Text>
              </Card>
            )}
          />
        </View>

        {/* I Resisted Button */}
        <View style={styles.resistedContainer}>
          <Button
            title="I Resisted This Craving!"
            onPress={handleResisted}
            icon={
              <Hand
                size={20}
                color="#000"
              />
            }
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  timerCard: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.cautionAmber,
  },
  timerUnit: {
    fontSize: 18,
    color: Colors.subtleText,
    marginLeft: 8,
  },
  timerSubtext: {
    fontSize: 12,
    color: Colors.subtleText,
    textAlign: 'center',
    marginTop: 12,
  },
  breathingCard: {
    marginTop: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neonCyan,
    letterSpacing: 1,
    marginBottom: 24,
  },
  breathingContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathRingOuter: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  breathCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  breathGradient: {
    width: '100%',
    height: '100%',
  },
  breathPhase: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  breathButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.neonCyan,
    borderRadius: 20,
  },
  breathButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  breathButtonTextAlt: {
    color: Colors.white,
  },
  tipsSection: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1,
    marginBottom: 12,
  },
  tipsList: {
    gap: 12,
    paddingRight: 20,
  },
  tipCard: {
    width: SCREEN_WIDTH * 0.55,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 12,
  },
  tipDesc: {
    fontSize: 12,
    color: Colors.subtleText,
    marginTop: 6,
    lineHeight: 18,
  },
  resistedContainer: {
    marginTop: 32,
  },
})
