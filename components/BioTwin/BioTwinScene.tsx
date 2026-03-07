/**
 * BioTwinScene - Main container for the Bio-Twin visualization
 * Organs are touchable to navigate to deep-dive screens
 */

import { OrganType } from '@/constants/milestones'
import React from 'react'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import { BloodVessels } from './BloodVessels'
import { Heart } from './Heart'
import { HologramFrame } from './HologramFrame'
import { Lungs } from './Lungs'

interface BioTwinSceneProps {
  recoveryProgress: number // 0-1
  height?: number
  onOrganPress?: (organ: OrganType) => void
  visualMode?: 'classic' | 'hologram'
  showFrame?: boolean
  animateFrame?: boolean
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export function BioTwinScene({
  recoveryProgress,
  height = 350,
  onOrganPress,
  visualMode = 'hologram',
  showFrame = true,
  animateFrame = true,
}: BioTwinSceneProps) {
  const isHologram = visualMode === 'hologram'
  const lightweightHologram = isHologram && !animateFrame

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.scene}>
        {/* Blood vessels in the background */}
        <TouchableOpacity
          style={[styles.bloodVesselsContainer, isHologram && styles.bloodVesselsContainerHolo]}
          onPress={() => onOrganPress?.('bloodVessels')}
          activeOpacity={0.7}
        >
          <BloodVessels
            recoveryProgress={recoveryProgress}
            width={SCREEN_WIDTH * 0.84}
            height={height * 0.82}
            animate={!lightweightHologram}
          />
        </TouchableOpacity>

        {/* Lungs positioned behind/around heart */}
        <TouchableOpacity
          style={styles.lungsContainer}
          onPress={() => onOrganPress?.('lungs')}
          activeOpacity={0.7}
        >
          <Lungs
            recoveryProgress={recoveryProgress}
            width={SCREEN_WIDTH * 0.84}
            height={height * 0.74}
            detailLevel={isHologram ? 'normal' : 'high'}
            animate={!lightweightHologram}
          />
        </TouchableOpacity>

        {/* Heart in the center-front */}
        <TouchableOpacity
          style={styles.heartContainer}
          onPress={() => onOrganPress?.('heart')}
          activeOpacity={0.7}
        >
          <Heart
            recoveryProgress={recoveryProgress}
            width={108}
            height={108}
            detailLevel={isHologram ? 'normal' : 'high'}
            animate
          />
        </TouchableOpacity>
      </View>

      {showFrame && isHologram && (
        <View
          pointerEvents="none"
          style={styles.foregroundOverlay}
        >
          <HologramFrame
            progress={recoveryProgress}
            width={SCREEN_WIDTH * 0.95}
            height={height * 0.98}
            showSweep={animateFrame}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scene: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodVesselsContainer: {
    position: 'absolute',
    top: '12%',
    alignItems: 'center',
    opacity: 0.3,
  },
  bloodVesselsContainerHolo: {
    opacity: 0.22,
  },
  lungsContainer: {
    position: 'absolute',
    top: '12%',
    alignItems: 'center',
  },
  heartContainer: {
    position: 'absolute',
    top: '27%',
    alignItems: 'center',
  },
  foregroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.78,
  },
})
