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

export default function NotFoundScreen() {
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
          title: 'Not Found',
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
            <CardTitle>Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="items-center gap-4">
              <Text className="text-center text-lg font-semibold">
                Oops! This page doesn't exist.
              </Text>
              <Text className="text-center text-sm text-muted-foreground">
                The page you're looking for could not be found.
              </Text>
              <Link href="/(tabs)" asChild>
                <Button className="mt-4">
                  <Icon as={Home} className="size-4" />
                  <Text>Go to Home</Text>
                </Button>
              </Link>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </>
  );
}
