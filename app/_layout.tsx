import '@/global.css';
import '@/lib/reanimated-config';

import * as Linking from 'expo-linking';
import * as React from 'react';

import { NAV_THEME } from '@/lib/theme';
import { HistoryProvider } from '@/lib/history-context';
import { SettingsProvider } from '@/lib/settings-context';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { parseDeeplink } from '@/lib/deeplink-utils';

export { ErrorBoundary } from 'expo-router';

function DeeplinkHandler() {
  const router = useRouter();

  React.useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      try {
        const id = parseDeeplink(event.url);
        if (!id) return;

        router.replace(`/puml/${id}`);
      } catch (err) {
        console.error('Failed to process deeplink:', err);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        const id = parseDeeplink(url);
        if (id) {
          handleDeepLink({ url });
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <SettingsProvider>
      <HistoryProvider>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <DeeplinkHandler />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
          <PortalHost />
        </ThemeProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}
