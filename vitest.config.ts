import path from 'node:path'

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  define: {
    __DEV__: 'false',
  },
}
