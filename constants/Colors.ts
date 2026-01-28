/**
 * iDontVape Color Palette
 * Deep space charcoal backgrounds with neon accents
 */

export const Colors = {
  // Backgrounds
  spaceCharcoal: '#0D0D12',
  cardBackground: '#14141C',
  
  // Health/Recovery
  neonCyan: '#00F0FF',
  healthGreen: '#00FF88',
  
  // UI/Data
  dataBlue: '#4D9EFF',
  
  // Warnings/Damage
  cautionAmber: '#FFB800',
  criticalRed: '#FF3B3B',
  damageOrange: '#FF6B35',
  
  // Text
  white: '#FFFFFF',
  subtleText: 'rgba(255, 255, 255, 0.6)',
  
  // Gradients (for use with LinearGradient)
  recoveryGradient: ['#00F0FF', '#00FF88'],
  damageGradient: ['#FF6B35', '#FF3B3B'],
};

// RGB values for interpolation
export const ColorRGB = {
  neonCyan: { r: 0, g: 240, b: 255 },
  healthGreen: { r: 0, g: 255, b: 136 },
  criticalRed: { r: 255, g: 59, b: 59 },
  damageOrange: { r: 255, g: 107, b: 53 },
};
