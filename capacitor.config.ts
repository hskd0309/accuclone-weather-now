
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.33ef8b5c02394226a2fd71502da446aa',
  appName: 'accuclone-weather-now',
  webDir: 'dist',
  server: {
    url: 'https://33ef8b5c-0239-4226-a2fd-71502da446aa.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3B82F6',
      showSpinner: false
    }
  }
};

export default config;
