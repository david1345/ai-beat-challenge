// API Configuration
// Real-device testing (Expo Go): set EXPO_PUBLIC_API_BASE_URL to your Mac LAN IP.
// Example: EXPO_PUBLIC_API_BASE_URL=http://172.30.1.69:3001
const DEV_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://172.30.1.69:3001';

export const API_BASE_URL = __DEV__
  ? DEV_API_BASE_URL
  : 'https://your-vercel-app.vercel.app';
