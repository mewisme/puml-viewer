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
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { t } = useTranslation();
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
    language,
    setLanguage,
    enableHaptics,
    setEnableHaptics,
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
      console.error('Failed to save API URL:', error);
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
        RNAlert.alert(t('settings.appUpdates.updateAvailableTitle'), t('settings.appUpdates.updateAvailableMessage'), [
          { text: t('settings.appUpdates.cancel'), style: 'cancel' },
          {
            text: t('settings.appUpdates.download'),
            onPress: async () => {
              const downloaded = await downloadUpdate();
              if (downloaded) {
                RNAlert.alert(
                  t('settings.appUpdates.updateDownloadedTitle'),
                  t('settings.appUpdates.updateDownloadedMessage'),
                  [
                    {
                      text: t('settings.appUpdates.restartNow'),
                      onPress: async () => {
                        await reloadApp();
                      },
                    },
                    { text: t('settings.appUpdates.later'), style: 'cancel' },
                  ]
                );
              } else {
                RNAlert.alert(t('settings.appUpdates.error'), t('settings.appUpdates.downloadError'), [{ text: 'OK' }]);
              }
            },
          },
        ]);
      } else {
        RNAlert.alert(t('settings.appUpdates.noUpdates'), t('settings.appUpdates.noUpdatesMessage'), [{ text: 'OK' }]);
      }
    } catch (error) {
      RNAlert.alert(t('settings.appUpdates.error'), t('settings.appUpdates.errorMessage'), [{ text: 'OK' }]);
    }
  };

  const handleApplyUpdate = async () => {
    if (isUpdatePending) {
      RNAlert.alert(t('settings.appUpdates.restartRequired'), t('settings.appUpdates.restartRequiredMessage'), [
        { text: t('settings.appUpdates.cancel'), style: 'cancel' },
        {
          text: t('settings.appUpdates.restartNow'),
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
      console.error('Failed to save AI API key:', error);
    }
  };

  const handleSaveAiCustomBaseUrl = async () => {
    try {
      await setAiCustomBaseUrl(localAiCustomBaseUrl.trim());
    } catch (error) {
      console.error('Failed to save AI custom base URL:', error);
    }
  };

  const handleSaveAiModel = async () => {
    try {
      await setAiModel(localAiModel.trim());
    } catch (error) {
      console.error('Failed to save AI model:', error);
    }
  };

  const handleLanguageChange = async (value: Option | string) => {
    try {
      let langStr: string;
      if (typeof value === 'string') {
        langStr = value;
      } else if (value && typeof value === 'object' && 'value' in value) {
        langStr = String(value.value);
      } else {
        return;
      }

      if (['en', 'vi'].includes(langStr)) {
        await setLanguage(langStr);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
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
      console.error('Failed to change AI provider:', error);
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

  const languageOption: Option | undefined = React.useMemo(() => {
    if (!language) return undefined;
    const labels: Record<string, string> = {
      en: 'English',
      vi: 'Tiếng Việt',
    };
    return { value: language, label: labels[language] || language };
  }, [language]);

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
            <CardTitle>{t('settings.title')}</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>{t('settings.apiUrl')}</Label>
              <Input
                value={localApiUrl}
                onChangeText={setLocalApiUrl}
                placeholder={t('settings.apiUrlPlaceholder')}
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
                    {t('settings.apiUrlNote')}
                  </Text>
                </>
              )}
            </View>

            <Separator />

            <View className="gap-2">
              <View className="flex-row items-center justify-end">
                <View className="flex-1 gap-1">
                  <Label>{t('settings.autoRender')}</Label>
                  <Text className="text-sm text-muted-foreground">
                    {t('settings.autoRenderDescription')}
                  </Text>
                </View>
                <Switch checked={autoRender} onCheckedChange={setAutoRender} />
              </View>
            </View>

            <Separator />

            <View className="gap-2">
              <View className="flex-row items-center justify-end">
                <View className="flex-1 gap-1">
                  <Label>{t('settings.hapticFeedback')}</Label>
                  <Text className="text-sm text-muted-foreground">
                    {t('settings.hapticFeedbackDescription')}
                  </Text>
                </View>
                <Switch checked={enableHaptics} onCheckedChange={setEnableHaptics} />
              </View>
            </View>

            <Separator />

            <View className="gap-2">
              <View className="flex-row items-center justify-end">
                <View className="flex-1 gap-1">
                  <Label>{t('settings.darkMode')}</Label>
                  <Text className="text-sm text-muted-foreground">
                    {t('settings.darkModeDescription')}
                  </Text>
                </View>
                <Switch checked={isDarkMode} onCheckedChange={handleToggleTheme} />
              </View>
            </View>

            <Separator />

            <View className="gap-2">
              <Label>{t('settings.language')}</Label>
              <Select value={languageOption} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.languageDescription')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" label="English" />
                  <SelectItem value="vi" label="Tiếng Việt" />
                </SelectContent>
              </Select>
              <Text className="text-xs text-muted-foreground">
                {t('settings.languageDescription')}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appUpdates.title')}</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Text className="text-sm text-muted-foreground">
                {t('settings.appUpdates.description')}
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
                    <Text>{t('settings.appUpdates.checkForUpdates')}</Text>
                  )}
                </Button>
                {isUpdatePending && (
                  <Button onPress={handleApplyUpdate} variant="default" className="flex-1">
                    <Text>{t('settings.appUpdates.applyUpdate')}</Text>
                  </Button>
                )}
              </View>
              {isUpdateAvailable && !isUpdatePending && (
                <Text className="text-xs text-primary">{t('settings.appUpdates.updateAvailable')}</Text>
              )}
              {isUpdatePending && (
                <Text className="text-xs text-primary">{t('settings.appUpdates.updateDownloaded')}</Text>
              )}
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.aiSettings.title')}</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>{t('settings.aiSettings.provider')}</Label>
              <Select value={providerOption} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.aiSettings.selectProvider')} />
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
                <Label>{t('settings.aiSettings.baseUrl')}</Label>
                <Input
                  value={localAiCustomBaseUrl}
                  onChangeText={setLocalAiCustomBaseUrl}
                  placeholder={t('settings.aiSettings.baseUrlPlaceholder')}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={handleSaveAiCustomBaseUrl}
                />
              </View>
            )}

            <View className="gap-2">
              <Label>{t('settings.aiSettings.model')}</Label>
              {isCustomProvider ? (
                <Input
                  value={localAiModel}
                  onChangeText={setLocalAiModel}
                  placeholder={t('settings.aiSettings.enterModelName')}
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
                    <SelectValue placeholder={t('settings.aiSettings.selectModel')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.length > 0 ? (
                      availableModels.map((model) => (
                        <SelectItem key={model} value={model} label={model} />
                      ))
                    ) : (
                      <SelectItem value="" disabled label={t('settings.aiSettings.noModelsAvailable')} />
                    )}
                  </SelectContent>
                </Select>
              )}
            </View>

            <View className="gap-2">
              <Label>{t('settings.aiSettings.apiKey')}</Label>
              <Input
                value={localAiApiKey}
                onChangeText={setLocalAiApiKey}
                placeholder={t('settings.aiSettings.apiKeyPlaceholder')}
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

