import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAPACITOR_DEV_SERVER;

const config: CapacitorConfig = {
  appId: 'com.salonbooking.app',
  appName: 'Salon Booking',
  webDir: '../dist/public',
  ...(devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: true,
        },
      }
    : {}),
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f6efe6',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#f6efe6',
      overlaysWebView: false,
    },
  },
};

export default config;