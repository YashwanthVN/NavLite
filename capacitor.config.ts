import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vectra.app',
  appName: 'Vectra',
  webDir: 'dist',
  server: {
    url: "http://192.168.1.7:5173" ,
    cleartext: true
  }
};

export default config;
