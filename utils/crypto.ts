import * as ExpoCrypto from 'expo-crypto'

/**
 * Generates a cryptographically secure random float between 0 (inclusive) and 1 (exclusive).
 * Mimics Math.random() but uses expo-crypto.
 */
export function getRandomFloat(): number {
  const array = new Uint32Array(1)
  ExpoCrypto.getRandomValues(array)
  // Divide by 2^32 to get a value in [0, 1)
  return array[0] / (0xffffffff + 1)
}
