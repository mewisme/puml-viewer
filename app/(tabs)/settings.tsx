import * as Linking from 'expo-linking';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEFAULT_API_URL, useSettings } from '@/lib/settings-context';
import { ScrollView, View } from 'react-native';

import { APP_CONFIG } from '@/lib/app-config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';

export default function SettingsScreen() {
  const { apiUrl, setApiUrl, autoRender, setAutoRender } = useSettings();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [localApiUrl, setLocalApiUrl] = React.useState(apiUrl);
  const [isDarkMode, setIsDarkMode] = React.useState(colorScheme === 'dark');

  React.useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  React.useEffect(() => {
    setLocalApiUrl(apiUrl);
  }, [apiUrl]);

  const handleSaveApiUrl = async () => {
    try {
      await setApiUrl(localApiUrl.trim());
    } catch (error) {
      console.error('Failed to save API URL:', error);
    }
  };

  const handleToggleTheme = () => {
    toggleColorScheme();
    setIsDarkMode(!isDarkMode);
  };

  const handleOpenProjectLink = () => {
    Linking.openURL(APP_CONFIG.links.pumlServer);
  };

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>API URL</Label>
              <Input
                value={localApiUrl}
                onChangeText={setLocalApiUrl}
                placeholder="https://spuml.mewis.me"
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                onBlur={handleSaveApiUrl}
              />
              {(localApiUrl.trim() !== DEFAULT_API_URL || apiUrl !== DEFAULT_API_URL) && (
                <>
                  <Text className="text-xs text-primary underline" onPress={handleOpenProjectLink}>
                    {APP_CONFIG.links.pumlServer}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    Note: When using a custom API URL, you need to run a local PlantUML server. Please clone and run the project above to render PlantUML diagrams.
                  </Text>
                </>
              )}
            </View>

            <Separator />

            <View className="gap-2">
              <View className="flex-row items-center justify-end">
                <View className="flex-1 gap-1">
                  <Label>Auto Render</Label>
                  <Text className="text-sm text-muted-foreground">
                    Auto render after 300ms when format is valid
                  </Text>
                </View>
                <Switch checked={autoRender} onCheckedChange={setAutoRender} />
              </View>
            </View>

            <Separator />

            <View className="gap-2">
              <View className="flex-row items-center justify-end">
                <View className="flex-1 gap-1">
                  <Label>Dark Mode</Label>
                  <Text className="text-sm text-muted-foreground">
                    Toggle dark mode
                  </Text>
                </View>
                <Switch checked={isDarkMode} onCheckedChange={handleToggleTheme} />
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </>
  );
}

