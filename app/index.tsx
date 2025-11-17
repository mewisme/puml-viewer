import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as React from 'react';

import { ActivityIndicator, Image, Platform, Alert as RNAlert, ScrollView, TouchableOpacity, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ClipboardPasteIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileImageIcon,
  FileTextIcon,
  ImageIcon,
  MoonStarIcon,
  PlayIcon,
  SunIcon,
  TypeIcon,
} from 'lucide-react-native';
import { File, Paths } from 'expo-file-system';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import ImageViewing from 'react-native-image-viewing';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { WebView } from 'react-native-webview';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: 'PUML Viewer',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const API_BASE_URL = 'https://spuml.mewis.me';

type RenderType = 'text' | 'svg' | 'png';

interface RenderResponse {
  id: string;
}

export default function Screen() {
  const insets = useSafeAreaInsets();
  const [pumlText, setPumlText] = React.useState('');
  const [renderId, setRenderId] = React.useState<string | null>(null);
  const [renderType, setRenderType] = React.useState<RenderType | null>(null);
  const [previewType, setPreviewType] = React.useState<RenderType | null>(null);
  const [rawContentUrl, setRawContentUrl] = React.useState<string | null>(null);
  const [rawContentText, setRawContentText] = React.useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setPumlText(text);
        setError(null);
      }
    } catch (err) {
      setError('Không thể đọc clipboard');
    }
  };

  const handleRender = async (type: RenderType) => {
    if (!pumlText.trim()) {
      setError('Vui lòng nhập PUML code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/render/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ puml: pumlText }),
      });

      if (!response.ok) {
        throw new Error(`Render failed: ${response.statusText}`);
      }

      const data: RenderResponse = await response.json();
      setRenderId(data.id);
      setRenderType(type);
      setPreviewType(type);

      await loadPreview(type, data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi render');
      setRawContentUrl(null);
      setRawContentText(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreview = async (type: RenderType, id: string) => {
    try {
      const url = `${API_BASE_URL}/api/v1/render/${type}/${id}/raw`;

      if (type === 'text') {
        const response = await fetch(url);
        const text = await response.text();
        setRawContentText(text);
        setRawContentUrl(null);
      } else if (type === 'svg') {
        setRawContentUrl(url);
        setRawContentText(null);
      } else {
        setRawContentUrl(url);
        setRawContentText(null);
      }
      setPreviewType(type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải preview');
    }
  };

  const handleDownloadPng = async () => {
    if (!renderId) return;

    try {
      const url = `${API_BASE_URL}/api/v1/render/png/${renderId}/raw`;

      if (Platform.OS === 'web') {
        if (typeof document !== 'undefined') {
          const link = document.createElement('a');
          link.href = url;
          link.download = `puml-${renderId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        const file = new File(Paths.cache, `puml-${renderId}.png`);
        const downloadedFile = await File.downloadFileAsync(url, file);

        RNAlert.alert(
          'Tải xuống thành công',
          `File đã được lưu tại: ${downloadedFile.uri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải xuống file');
    }
  };

  const handleRawView = () => {
    if (!renderId || !previewType) return;

    const url = `${API_BASE_URL}/api/v1/render/${previewType}/${renderId}/raw`;
    Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4 mt-10"
        contentContainerStyle={{ paddingTop: insets.top + 16 }}>
        <Card>
          <CardHeader>
            <CardTitle>Nhập PUML Code</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>PlantUML Diagram</Label>
              <Textarea
                value={pumlText}
                onChangeText={setPumlText}
                placeholder="@startuml&#10;Bob -> Alice : hello&#10;@enduml"
                className="min-h-64"
                numberOfLines={20}
              />
            </View>

            {error && (
              <Alert variant="destructive" icon={FileTextIcon}>
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <View className="flex-row gap-2">
              <Button onPress={handlePaste} variant="outline" className="flex-1">
                <Icon as={ClipboardPasteIcon} className="size-4" />
                <Text>Paste</Text>
              </Button>
              <Button
                onPress={() => handleRender('png')}
                disabled={isLoading || !pumlText.trim()}
                className="flex-1">
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Icon as={PlayIcon} className="size-4" />
                    <Text>Render</Text>
                  </>
                )}
              </Button>
            </View>
          </CardContent>
        </Card>

        {renderId && renderType && (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả Render</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              {previewType && (
                <View className="gap-2">
                  <Text className="text-sm font-medium">Preview ({previewType.toUpperCase()}):</Text>
                  <View className="items-center rounded-lg border border-border bg-muted p-4">
                    {previewType === 'png' && rawContentUrl && (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setIsImageZoomed(true)}
                        style={{ width: '100%' }}>
                        <Image
                          source={{ uri: rawContentUrl }}
                          style={{ width: '100%', minHeight: 400 }}
                          resizeMode="contain"
                          className="rounded-lg"
                        />
                      </TouchableOpacity>
                    )}
                    {previewType === 'svg' && rawContentUrl && (
                      <View style={{ width: '100%', height: 500 }}>
                        <WebView
                          source={{ uri: rawContentUrl }}
                          style={{ width: '100%', height: 500, backgroundColor: 'transparent' }}
                          scalesPageToFit={true}
                          showsVerticalScrollIndicator={false}
                          showsHorizontalScrollIndicator={false}
                          scrollEnabled={true}
                          bounces={false}
                          startInLoadingState={true}
                          renderLoading={() => (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                              <ActivityIndicator size="large" />
                            </View>
                          )}
                        />
                      </View>
                    )}
                    {previewType === 'text' && rawContentText && (
                      <ScrollView
                        style={{ width: '100%', maxHeight: 600 }}
                        className="rounded-lg bg-background p-4">
                        <Text className="font-mono text-sm">{rawContentText}</Text>
                      </ScrollView>
                    )}
                  </View>
                  <Separator />
                </View>
              )}

              <View className="gap-2">
                <Text className="text-sm text-muted-foreground">
                  Render ID: {renderId}
                </Text>
                <Separator />
              </View>

              <View className="gap-2">
                <Text className="text-sm font-medium">Xem preview:</Text>
                <View className="flex-row gap-2">
                  <Button
                    onPress={() => renderId && loadPreview('png', renderId)}
                    variant={previewType === 'png' ? 'default' : 'outline'}
                    disabled={isLoading || !renderId}
                    className="flex-1">
                    <Icon as={ImageIcon} className="size-4" />
                    <Text>PNG</Text>
                  </Button>
                  <Button
                    onPress={() => renderId && loadPreview('svg', renderId)}
                    variant={previewType === 'svg' ? 'default' : 'outline'}
                    disabled={isLoading || !renderId}
                    className="flex-1">
                    <Icon as={FileImageIcon} className="size-4" />
                    <Text>SVG</Text>
                  </Button>
                  <Button
                    onPress={() => renderId && loadPreview('text', renderId)}
                    variant={previewType === 'text' ? 'default' : 'outline'}
                    disabled={isLoading || !renderId}
                    className="flex-1">
                    <Icon as={TypeIcon} className="size-4" />
                    <Text>Text</Text>
                  </Button>
                </View>
              </View>

              {previewType === 'png' && (
                <View className="gap-2">
                  <Button onPress={handleDownloadPng} variant="secondary">
                    <Icon as={DownloadIcon} className="size-4" />
                    <Text>Tải xuống PNG</Text>
                  </Button>
                </View>
              )}

              <Separator />

              <Button onPress={handleRawView} variant="ghost">
                <Icon as={ExternalLinkIcon} className="size-4" />
                <Text>Raw View</Text>
              </Button>
            </CardContent>
          </Card>
        )}

        {rawContentUrl && (
          <ImageViewing
            images={[{ uri: rawContentUrl }]}
            imageIndex={0}
            visible={isImageZoomed}
            onRequestClose={() => setIsImageZoomed(false)}
            swipeToCloseEnabled={true}
            doubleTapToZoomEnabled={true}
          />
        )}
      </ScrollView>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="ios:size-9 rounded-full web:mx-4 bg-background">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}
