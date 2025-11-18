import * as Linking from 'expo-linking';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/lib/settings-context';
import { useUpdates } from '@/lib/updates-context';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_CONFIG, DEFAULT_API_URL, type AIProvider } from '@/lib/app-config';
import { ActivityIndicator, Alert as RNAlert } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';

export default function SettingsScreen() {
  const {
    apiUrl,
    setApiUrl,
    autoRender,
    setAutoRender,
    aiProvider,
    setAiProvider,
    aiModel,
    setAiModel,
    aiApiKey,
    setAiApiKey,
    aiCustomBaseUrl,
    setAiCustomBaseUrl,
  } = useSettings();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const {
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    checkForUpdates,
    downloadUpdate,
    reloadApp,
  } = useUpdates();
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [localApiUrl, setLocalApiUrl] = React.useState(apiUrl);
  const [localAiApiKey, setLocalAiApiKey] = React.useState(aiApiKey);
  const [localAiCustomBaseUrl, setLocalAiCustomBaseUrl] = React.useState(aiCustomBaseUrl);
  const [localAiModel, setLocalAiModel] = React.useState(aiModel);
  const [isDarkMode, setIsDarkMode] = React.useState(colorScheme === 'dark');

  React.useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  React.useEffect(() => {
    setLocalApiUrl(apiUrl);
  }, [apiUrl]);

  React.useEffect(() => {
    setLocalAiApiKey(aiApiKey);
  }, [aiApiKey]);

  React.useEffect(() => {
    setLocalAiCustomBaseUrl(aiCustomBaseUrl);
  }, [aiCustomBaseUrl]);

  React.useEffect(() => {
    setLocalAiModel(aiModel);
  }, [aiModel]);

  const handleSaveApiUrl = async () => {
    try {
      await setApiUrl(localApiUrl.trim());
    } catch (error) {
    }
  };

  const handleToggleTheme = () => {
    toggleColorScheme();
    setIsDarkMode(!isDarkMode);
  };

  const handleCheckForUpdates = async () => {
    try {
      const hasUpdate = await checkForUpdates();
      if (hasUpdate) {
        RNAlert.alert('Update Available', 'A new update is available. Would you like to download it?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              const downloaded = await downloadUpdate();
              if (downloaded) {
                RNAlert.alert(
                  'Update Downloaded',
                  'The update has been downloaded. The app will restart to apply the update.',
                  [
                    {
                      text: 'Restart Now',
                      onPress: async () => {
                        await reloadApp();
                      },
                    },
                    { text: 'Later', style: 'cancel' },
                  ]
                );
              } else {
                RNAlert.alert('Error', 'Failed to download update. Please try again later.', [{ text: 'OK' }]);
              }
            },
          },
        ]);
      } else {
        RNAlert.alert('No Updates', 'You are using the latest version.', [{ text: 'OK' }]);
      }
    } catch (error) {
      RNAlert.alert('Error', 'Failed to check for updates. Please try again later.', [{ text: 'OK' }]);
    }
  };

  const handleApplyUpdate = async () => {
    if (isUpdatePending) {
      RNAlert.alert('Restart Required', 'The app will restart to apply the update.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart Now',
          onPress: async () => {
            await reloadApp();
          },
        },
      ]);
    }
  };

  const handleOpenProjectLink = () => {
    Linking.openURL(APP_CONFIG.links.pumlServer);
  };

  const handleSaveAiApiKey = async () => {
    try {
      await setAiApiKey(localAiApiKey.trim());
    } catch (error) {
    }
  };

  const handleSaveAiCustomBaseUrl = async () => {
    try {
      await setAiCustomBaseUrl(localAiCustomBaseUrl.trim());
    } catch (error) {
    }
  };

  const handleSaveAiModel = async () => {
    try {
      await setAiModel(localAiModel.trim());
    } catch (error) {
    }
  };

  const handleProviderChange = async (value: Option | string) => {
    try {
      let providerStr: string;
      if (typeof value === 'string') {
        providerStr = value;
      } else if (value && typeof value === 'object' && 'value' in value) {
        providerStr = String(value.value);
      } else {
        return;
      }

      if (['openai', 'google', 'megallm', 'custom'].includes(providerStr)) {
        const provider = providerStr as AIProvider;
        await setAiProvider(provider);
      }
    } catch (error) {
    }
  };

  const availableModels = APP_CONFIG.ai.providers[aiProvider].models;
  const baseUrl = aiProvider === 'custom' ? aiCustomBaseUrl : APP_CONFIG.ai.providers[aiProvider].baseUrl;
  const isCustomProvider = aiProvider === 'custom';

  const providerOption: Option | undefined = React.useMemo(() => {
    if (!aiProvider) return undefined;
    return { value: aiProvider, label: aiProvider.charAt(0).toUpperCase() + aiProvider.slice(1) };
  }, [aiProvider]);

  const modelOption: Option | undefined = React.useMemo(() => {
    if (!aiModel || isCustomProvider) return undefined;
    return { value: aiModel, label: aiModel };
  }, [aiModel, isCustomProvider]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'android' ? 300 : 32,
          flexGrow: 1
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}>
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

        <Card>
          <CardHeader>
            <CardTitle>App Updates</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Text className="text-sm text-muted-foreground">
                Check for app updates and apply them when available.
              </Text>
              <View className="flex-row gap-2">
                <Button
                  onPress={handleCheckForUpdates}
                  disabled={isChecking || isUpdatePending}
                  variant="outline"
                  className="flex-1">
                  {isChecking ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text>Check for Updates</Text>
                  )}
                </Button>
                {isUpdatePending && (
                  <Button onPress={handleApplyUpdate} variant="default" className="flex-1">
                    <Text>Apply Update</Text>
                  </Button>
                )}
              </View>
              {isUpdateAvailable && !isUpdatePending && (
                <Text className="text-xs text-primary">Update available! Download it to apply.</Text>
              )}
              {isUpdatePending && (
                <Text className="text-xs text-primary">Update downloaded! Restart the app to apply.</Text>
              )}
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Settings</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>Provider</Label>
              <Select value={providerOption} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai" label="OpenAI" />
                  <SelectItem value="google" label="Google" />
                  <SelectItem value="megallm" label="MegaLLM" />
                  <SelectItem value="custom" label="Custom" />
                </SelectContent>
              </Select>
              {!isCustomProvider && baseUrl && (
                <Text className="text-xs text-muted-foreground">
                  {baseUrl}
                </Text>
              )}
            </View>

            {isCustomProvider && (
              <View className="gap-2">
                <Label>Base URL</Label>
                <Input
                  value={localAiCustomBaseUrl}
                  onChangeText={setLocalAiCustomBaseUrl}
                  placeholder="https://api.example.com/v1"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={handleSaveAiCustomBaseUrl}
                />
              </View>
            )}

            <View className="gap-2">
              <Label>Model</Label>
              {isCustomProvider ? (
                <Input
                  value={localAiModel}
                  onChangeText={setLocalAiModel}
                  placeholder="Enter model name"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={handleSaveAiModel}
                />
              ) : (
                <Select
                  value={modelOption}
                  onValueChange={(value: Option) => {
                    const modelStr = typeof value === 'string' ? value : (value?.value || '');
                    setAiModel(modelStr);
                  }}
                  disabled={availableModels.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <SelectItem key={model} value={model} label={model} />
                      ))
                    ) : (
                      <SelectItem value="" disabled label="No models available" />
                    )}
                  </SelectContent>
                </Select>
              )}
            </View>

            <View className="gap-2">
              <Label>API Key</Label>
              <Input
                value={localAiApiKey}
                onChangeText={setLocalAiApiKey}
                placeholder="Enter your API key"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                onBlur={handleSaveAiApiKey}
              />
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

