/**
 * Button - Primary and secondary button variants
 */

import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/Colors'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  icon?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#000' : Colors.white}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              variant === 'primary' && styles.primaryText,
              variant === 'secondary' && styles.secondaryText,
              variant === 'danger' && styles.dangerText,
              variant === 'ghost' && styles.ghostText,
              icon ? styles.textWithIcon : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  )

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[fullWidth && styles.fullWidth, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={Colors.recoveryGradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            styles.primaryButton,
            isDisabled && styles.disabled,
            fullWidth && styles.fullWidth,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'danger' && styles.dangerButton,
        variant === 'ghost' && styles.ghostButton,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  primaryButton: {
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 59, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 59, 0.3)',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#000',
  },
  secondaryText: {
    color: Colors.white,
  },
  dangerText: {
    color: Colors.criticalRed,
  },
  ghostText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  textWithIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
})
