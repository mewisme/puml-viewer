import * as Linking from 'expo-linking';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLinkIcon, GithubIcon } from 'lucide-react-native';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { APP_CONFIG } from '@/lib/app-config';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useHistory } from '@/lib/history-context';

export default function AboutScreen() {
  const { getStatistics } = useHistory();
  const stats = getStatistics();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Text className="text-lg font-bold">{APP_CONFIG.name} v{APP_CONFIG.version}</Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm text-muted-foreground">{APP_CONFIG.description}</Text>
            </View>

            <Separator />

            <View className="gap-2">
              <Text className="text-sm text-muted-foreground">Made by <Text className="font-bold">{APP_CONFIG.author}</Text> with love.</Text>
            </View>

            <Separator />

            <View className="gap-2">
              <TouchableOpacity
                onPress={() => handleOpenLink(APP_CONFIG.links.github)}
                className="flex-row items-center gap-2 rounded-lg border border-border bg-muted p-3">
                <Icon as={GithubIcon} className="size-5" />
                <Text className="flex-1">GitHub</Text>
                <Icon as={ExternalLinkIcon} className="size-4" />
              </TouchableOpacity>
            </View>

            <Separator />

            <View className="gap-2">
              <Text className="text-sm font-medium">Statistics</Text>
              <View className="rounded-lg border border-border bg-muted p-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Total Diagrams</Text>
                  <Text className="text-sm font-medium">{stats.total}</Text>
                </View>
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">PNG</Text>
                  <Text className="text-sm font-medium">{stats.byType.png}</Text>
                </View>
                <View className="mt-1 flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">SVG</Text>
                  <Text className="text-sm font-medium">{stats.byType.svg}</Text>
                </View>
                <View className="mt-1 flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Text</Text>
                  <Text className="text-sm font-medium">{stats.byType.text}</Text>
                </View>
                <View className="mt-2 flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Favorites</Text>
                  <Text className="text-sm font-medium">{stats.favorites}</Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </>
  );
}

