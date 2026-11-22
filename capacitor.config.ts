import type { CapacitorConfig } from '@capacitor/cli';
const config = {
  appId: 'app.reeo.logic',
  appName: 'REEO',
  webDir: 'dist',
  backgroundColor: '#111111',
  android: { allowMixedContent: false },
  ios: { contentInset: 'automatic', preferredContentMode: 'mobile' },
} satisfies CapacitorConfig;
export default config;
