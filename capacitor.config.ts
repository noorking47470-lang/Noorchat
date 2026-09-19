import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.noorchat.android',
  appName: 'Noor Chat',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#042f2e',
    allowMixedContent: true,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#042f2e',
      showSpinner: false,
    },
  },
};

export default config;
