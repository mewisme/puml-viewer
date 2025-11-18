import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as React from 'react';
import * as Sharing from 'expo-sharing';

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
  PlayIcon,
  ShareIcon,
  TypeIcon,
  XIcon,
} from 'lucide-react-native';
import { File, Paths } from 'expo-file-system';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import ImageViewing from 'react-native-image-viewing';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { WebView } from 'react-native-webview';
import { useHistory } from '@/lib/history-context';
import { useSettings } from '@/lib/settings-context';
import { getApiClient } from '@/lib/api-client';

type RenderType = 'text' | 'svg' | 'png';

interface RenderResponse {
  id: string;
}

export default function Screen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { apiUrl, autoRender } = useSettings();
  const { addToHistory } = useHistory();
  const [pumlText, setPumlText] = React.useState('');
  const autoRenderTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [renderId, setRenderId] = React.useState<string | null>(null);
  const [renderType, setRenderType] = React.useState<RenderType | null>(null);
  const [previewType, setPreviewType] = React.useState<RenderType | null>(null);
  const [rawContentUrl, setRawContentUrl] = React.useState<string | null>(null);
  const [rawContentText, setRawContentText] = React.useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setIsImageZoomed(false);
      };
    }, [])
  );

  const removeThemePlain = React.useCallback((text: string): string => {
    return text.replace(/!theme\s+plain\s*/gi, '');
  }, []);

  const loadPreview = React.useCallback(async (type: RenderType, id: string) => {
    try {
      const apiClient = getApiClient(apiUrl);

      if (type === 'text') {
        const response = await apiClient.get(`/api/v1/render/${type}/${id}/raw`, {
          responseType: 'text',
        });
        setRawContentText(response.data);
        setRawContentUrl(null);
      } else if (type === 'svg') {
        setRawContentUrl(`${apiUrl}/api/v1/render/${type}/${id}/raw`);
        setRawContentText(null);
      } else {
        setRawContentUrl(`${apiUrl}/api/v1/render/${type}/${id}/raw`);
        setRawContentText(null);
      }
      setPreviewType(type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cannot load preview');
    }
  }, [apiUrl]);

  React.useEffect(() => {
    if (params.loadCode && params.loadId && params.loadType) {
      const code = decodeURIComponent(
        Array.isArray(params.loadCode) ? params.loadCode[0] : params.loadCode
      );
      const id = Array.isArray(params.loadId) ? params.loadId[0] : params.loadId;
      const type = (Array.isArray(params.loadType) ? params.loadType[0] : params.loadType) as RenderType;

      const cleanedCode = removeThemePlain(code);
      setPumlText(cleanedCode);
      setRenderId(id);
      setRenderType(type);
      setPreviewType(type);
      loadPreview(type, id);
    }
  }, [params.loadCode, params.loadId, params.loadType, loadPreview, removeThemePlain]);

  const handleRender = React.useCallback(async (type: RenderType, text?: string) => {
    const textToRender = text ?? pumlText;
    if (!textToRender.trim()) {
      setError('Please enter PUML code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cleanedPumlText = removeThemePlain(textToRender);
      const apiClient = getApiClient(apiUrl);
      const response = await apiClient.post<RenderResponse>(`/api/v1/render/${type}`, {
        puml: cleanedPumlText,
      });

      const data = response.data;
      setRenderId(data.id);
      setRenderType(type);
      setPreviewType(type);

      await loadPreview(type, data.id);

      await addToHistory({
        pumlCode: removeThemePlain(textToRender),
        renderId: data.id,
        renderType: type,
        previewUrl: type !== 'text' ? `${apiUrl}/api/v1/render/${type}/${data.id}/raw` : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while rendering');
      setRawContentUrl(null);
      setRawContentText(null);
    } finally {
      setIsLoading(false);
    }
  }, [pumlText, apiUrl, loadPreview, addToHistory, removeThemePlain]);

  const isValidPumlFormat = React.useCallback((text: string): boolean => {
    const trimmed = text.trim();
    return trimmed.includes('@startuml') && trimmed.includes('@enduml');
  }, []);

  const triggerAutoRender = React.useCallback(() => {
    if (!autoRender || !pumlText.trim() || !isValidPumlFormat(pumlText)) {
      return;
    }

    if (autoRenderTimeoutRef.current) {
      clearTimeout(autoRenderTimeoutRef.current);
    }

    autoRenderTimeoutRef.current = setTimeout(() => {
      if (!isLoading && isValidPumlFormat(pumlText)) {
        handleRender('png');
      }
    }, 300);
  }, [autoRender, pumlText, isLoading, isValidPumlFormat, handleRender]);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        const cleanedText = removeThemePlain(text);
        setPumlText(cleanedText);
        setError(null);
        if (autoRender && isValidPumlFormat(cleanedText)) {
          setTimeout(() => {
            handleRender('png', cleanedText);
          }, 500);
        }
      }
    } catch (err) {
      setError('Cannot read clipboard');
    }
  };

  const handleTextChange = (text: string) => {
    const cleanedText = removeThemePlain(text);
    setPumlText(cleanedText);
    setError(null);
    triggerAutoRender();
  };

  React.useEffect(() => {
    return () => {
      if (autoRenderTimeoutRef.current) {
        clearTimeout(autoRenderTimeoutRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setPumlText('');
    setRenderId(null);
    setRenderType(null);
    setPreviewType(null);
    setRawContentUrl(null);
    setRawContentText(null);
    setError(null);
    router.setParams({ loadId: undefined, loadType: undefined, loadCode: undefined });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      RNAlert.alert('Success', 'Code copied to clipboard', [{ text: 'OK' }]);
    } catch (err) {
      setError('Cannot copy to clipboard');
    }
  };


  const handleDownloadPng = async () => {
    if (!renderId) return;

    try {
      const url = `${apiUrl}/api/v1/render/png/${renderId}/raw`;

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
          'Download successful',
          `File saved at: ${downloadedFile.uri}`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cannot download file');
    }
  };

  const handleRawView = () => {
    if (!renderId || !previewType) return;

    const url = `${apiUrl}/api/v1/render/${previewType}/${renderId}/raw`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    if (!renderId || !previewType) return;

    try {
      const url = `${apiUrl}/api/v1/render/${previewType}/${renderId}/raw`;

      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({
            title: 'PlantUML Diagram',
            url: url,
          });
        } else {
          await Clipboard.setStringAsync(url);
          RNAlert.alert('Success', 'URL copied to clipboard', [{ text: 'OK' }]);
        }
      } else {
        if (previewType === 'png' || previewType === 'svg') {
          const file = new File(Paths.cache, `puml-${renderId}.${previewType === 'png' ? 'png' : 'svg'}`);
          await File.downloadFileAsync(url, file);

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(file.uri);
          } else {
            await Clipboard.setStringAsync(url);
            RNAlert.alert('Success', 'URL copied to clipboard', [{ text: 'OK' }]);
          }
        } else {
          await Clipboard.setStringAsync(rawContentText || '');
          RNAlert.alert('Success', 'Text copied to clipboard', [{ text: 'OK' }]);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cannot share');
    }
  };


  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Enter PUML Code</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>PlantUML Diagram</Label>
              <Textarea
                value={pumlText}
                onChangeText={handleTextChange}
                placeholder="@startuml&#10;Bob -> Alice : hello&#10;@enduml"
                className="min-h-64"
                numberOfLines={20}
              />
            </View>

            {error && (
              <Alert variant="destructive" icon={FileTextIcon}>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <View className="flex-row gap-2">
              <Button onPress={handlePaste} variant="outline" className="flex-1">
                <Icon as={ClipboardPasteIcon} className="size-4" />
                <Text>Paste</Text>
              </Button>
              <Button onPress={handleClear} variant="outline" disabled={!pumlText.trim()}>
                <Icon as={XIcon} className="size-4" />
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
              <CardTitle>Render Result</CardTitle>
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
                <Text className="text-sm font-medium">View preview:</Text>
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
                    <Text>Download PNG</Text>
                  </Button>
                </View>
              )}

              <Separator />

              <View className="flex-row gap-2">
                <Button onPress={handleRawView} variant="ghost" className="flex-1">
                  <Icon as={ExternalLinkIcon} className="size-4" />
                  <Text>Raw View</Text>
                </Button>
                <Button onPress={handleShare} variant="ghost" className="flex-1">
                  <Icon as={ShareIcon} className="size-4" />
                  <Text>Share</Text>
                </Button>
              </View>
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

