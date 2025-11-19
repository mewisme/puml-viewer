import * as Linking from 'expo-linking';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Stack, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { parseDeeplink } from '@/lib/deeplink-utils';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  React.useEffect(() => {
    const checkDeeplink = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const id = parseDeeplink(url);
        if (id) {
          router.replace(`/puml/${id}` as any);
        }
      }
    };

    checkDeeplink();
  }, [router]);

  return (
    <>
      <Stack.Screen
        options={{
          title: t('notFound.title'),
          headerTransparent: false,
          headerShown: true,
          headerBackVisible: false,
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('notFound.pageNotFound')}</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="items-center gap-4">
              <Text className="text-center text-lg font-semibold">
                {t('notFound.oopsPageDoesNotExist')}
              </Text>
              <Text className="text-center text-sm text-muted-foreground">
                {t('notFound.pageNotFoundMessage')}
              </Text>
              <Link href="/(tabs)" asChild>
                <Button className="mt-4">
                  <Icon as={Home} className="size-4" />
                  <Text>{t('notFound.goToHome')}</Text>
                </Button>
              </Link>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </>
  );
}
