import * as React from 'react';

import { ActivityIndicator, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileTextIcon, Home } from 'lucide-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useSettings } from '@/lib/settings-context';
import { getApiClient } from '@/lib/api-client';
import { useTranslation } from 'react-i18next';

export default function PumlViewerScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { apiUrl } = useSettings();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const id = React.useMemo(() => {
    const idParam = params.id;
    return Array.isArray(idParam) ? idParam[0] : idParam;
  }, [params.id]);

  React.useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!id || typeof id !== 'string' || id.trim() === '') {
        router.replace('/(tabs)');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const apiClient = getApiClient(apiUrl);
        const response = await apiClient.get<{ puml: string }>(`/api/v1/puml/${id}`);
        
        const result = response.data;
        if (!result.puml) {
          router.replace('/(tabs)');
          return;
        }

        const pumlCode = result.puml;

        router.replace({
          pathname: '/(tabs)',
          params: {
            loadCode: encodeURIComponent(pumlCode),
            loadId: id,
            loadType: 'png',
          },
        });
      } catch (err) {
        router.replace('/(tabs)');
      }
    };

    fetchAndRedirect();
  }, [id, apiUrl, router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('pumlViewer.title'),
          headerTitle: t('pumlViewer.title'),
          headerTransparent: false,
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      {isLoading && (
        <View className="flex-1 items-center justify-center p-4">
          <Card>
            <CardContent className="items-center gap-4 p-6">
              <ActivityIndicator size="large" />
              <Text>{t('pumlViewer.loadingPumlDiagram')}</Text>
            </CardContent>
          </Card>
        </View>
      )}
      {error && (
        <View className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('pumlViewer.error')}</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              <Alert variant="destructive" icon={FileTextIcon}>
                <AlertTitle>{t('pumlViewer.failedToLoadDiagram')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onPress={() => router.replace('/(tabs)')} className="w-full">
                <Icon as={Home} className="size-4" />
                <Text>{t('pumlViewer.goToHome')}</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      )}
    </>
  );
}

