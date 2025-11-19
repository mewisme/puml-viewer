import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import * as MediaLibrary from 'expo-media-library';
import * as React from 'react';
import * as Sharing from 'expo-sharing';

import { ActivityIndicator, Image, Alert as RNAlert, ScrollView, TouchableOpacity, View } from 'react-native';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Sparkles,
  TypeIcon,
  XIcon,
  Zap,
} from 'lucide-react-native';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { File, Paths } from 'expo-file-system';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { APP_CONFIG } from '@/lib/app-config';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import ImageViewing from 'react-native-image-viewing';
import { Label } from '@/components/ui/label';
import Markdown from 'react-native-markdown-display';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { WebView } from 'react-native-webview';
import { getApiClient } from '@/lib/api-client';
import { getLanguageCode } from '@/lib/i18n';
import { useColorScheme } from 'nativewind';
import { useHistory } from '@/lib/history-context';
import { useSettings } from '@/lib/settings-context';
import { useTranslation } from 'react-i18next';

type RenderType = 'text' | 'svg' | 'png';

interface RenderResponse {
  id: string;
}

export default function Screen() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const params = useLocalSearchParams();
  const router = useRouter();
  const {
    apiUrl,
    autoRender,
    enableHaptics,
    aiProvider,
    aiModel,
    aiApiKey,
    aiCustomBaseUrl,
  } = useSettings();
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
  const [explainResult, setExplainResult] = React.useState<string | null>(null);
  const [optimizeResult, setOptimizeResult] = React.useState<string | null>(null);
  const [isExplaining, setIsExplaining] = React.useState(false);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [isExplainDialogOpen, setIsExplainDialogOpen] = React.useState(false);
  const [isOptimizeDialogOpen, setIsOptimizeDialogOpen] = React.useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);

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
      setError(err instanceof Error ? err.message : t('home.cannotLoadPreview'));
    }
  }, [apiUrl, t]);

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

      loadPreview(type, id).then(() => {
        addToHistory({
          pumlCode: cleanedCode,
          renderId: id,
          renderType: type,
          previewUrl: type !== 'text' ? `${apiUrl}/api/v1/render/${type}/${id}/raw` : undefined,
        });
        if (enableHaptics) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      });
    }
  }, [params.loadCode, params.loadId, params.loadType, loadPreview, removeThemePlain, addToHistory, apiUrl, enableHaptics]);

  const handleRender = React.useCallback(async (type: RenderType, text?: string) => {
    const textToRender = text ?? pumlText;
    if (!textToRender.trim()) {
      setError(t('home.pleaseEnterPumlCode'));
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

      if (enableHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('home.errorOccurredWhileRendering'));
      setRawContentUrl(null);
      setRawContentText(null);
    } finally {
      setIsLoading(false);
    }
  }, [pumlText, apiUrl, loadPreview, addToHistory, removeThemePlain, t]);

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
      setError(t('home.cannotReadClipboard'));
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
    setIsClearDialogOpen(true);
  };

  const handleConfirmClear = () => {
    setPumlText('');
    setRenderId(null);
    setRenderType(null);
    setPreviewType(null);
    setRawContentUrl(null);
    setRawContentText(null);
    setError(null);
    setExplainResult(null);
    setOptimizeResult(null);
    router.setParams({ loadId: undefined, loadType: undefined, loadCode: undefined });
    setIsClearDialogOpen(false);
  };

  const handleDownloadPng = async () => {
    if (!renderId) return;

    try {
      const url = `${apiUrl}/api/v1/render/png/${renderId}/raw`;
      const filename = `puml-${renderId}-${Date.now()}.png`;

      const downloadedFile = await File.downloadFileAsync(url, new File(Paths.cache, filename));

      const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
      if (status !== 'granted') {
        RNAlert.alert(t('home.error'), t('home.permissionDeniedToSave'), [{ text: 'OK' }]);
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);

      const albumName = 'PUML Viewer';
      let album = await MediaLibrary.getAlbumAsync(albumName);

      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      RNAlert.alert(t('home.success'), t('home.pngSavedToAlbum'), [{ text: 'OK' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('home.cannotDownloadFile'));
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

      if (previewType === 'png' || previewType === 'svg') {
        const filename = `puml-${renderId}.${previewType === 'png' ? 'png' : 'svg'}`;
        const downloadedFile = await File.downloadFileAsync(url, new File(Paths.cache, filename), {
          idempotent: true,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadedFile.uri);
        } else {
          await Clipboard.setStringAsync(url);
          RNAlert.alert(t('home.success'), t('home.urlCopiedToClipboard'), [{ text: 'OK' }]);
        }
      } else {
        await Clipboard.setStringAsync(rawContentText || '');
        RNAlert.alert(t('home.success'), t('home.textCopiedToClipboard'), [{ text: 'OK' }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('home.cannotShare'));
    }
  };

  const baseUrl = React.useMemo(() => {
    if (aiProvider === 'custom') {
      return aiCustomBaseUrl;
    }
    return APP_CONFIG.ai.providers[aiProvider]?.baseUrl || '';
  }, [aiProvider, aiCustomBaseUrl]);

  const handleExplain = React.useCallback(async () => {
    if (!pumlText.trim()) {
      setError(t('home.pleaseEnterPumlCode'));
      return;
    }
    if (!aiApiKey.trim()) {
      setError(t('home.pleaseSetApiKey'));
      return;
    }
    if (!baseUrl.trim()) {
      setError(t('home.pleaseSetApiBaseUrl'));
      return;
    }

    setIsExplaining(true);
    setError(null);
    setExplainResult(null);

    try {
      const cleanedPumlText = removeThemePlain(pumlText);
      const apiClient = getApiClient(apiUrl);
      const response = await apiClient.post<{ content?: string; explanation?: string }>(
        '/api/v1/puml/explain',
        {
          baseUrl,
          apiKey: aiApiKey,
          model: aiModel,
          puml: cleanedPumlText,
          language: getLanguageCode(),
          stream: false,
        }
      );

      const data = response.data;
      const explanation = data.content || data.explanation || '';
      setExplainResult(explanation);
      setIsExplainDialogOpen(true);

      if (enableHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('home.errorOccurredWhileExplaining'));
    } finally {
      setIsExplaining(false);
    }
  }, [pumlText, apiUrl, baseUrl, aiApiKey, aiModel, removeThemePlain, enableHaptics, t]);

  const handleOptimize = React.useCallback(async () => {
    if (!pumlText.trim()) {
      setError(t('home.pleaseEnterPumlCode'));
      return;
    }
    if (!aiApiKey.trim()) {
      setError(t('home.pleaseSetApiKey'));
      return;
    }
    if (!baseUrl.trim()) {
      setError(t('home.pleaseSetApiBaseUrl'));
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setOptimizeResult(null);

    try {
      const cleanedPumlText = removeThemePlain(pumlText);
      const apiClient = getApiClient(apiUrl);
      const response = await apiClient.post<{ puml?: string; content?: string }>(
        '/api/v1/puml/optimize',
        {
          baseUrl,
          apiKey: aiApiKey,
          model: aiModel,
          puml: cleanedPumlText,
          stream: false,
        }
      );

      const data = response.data;
      const optimizedPuml = data.puml || data.content || '';
      setOptimizeResult(optimizedPuml);
      setIsOptimizeDialogOpen(true);

      if (optimizedPuml.trim()) {
        await handleRender('png', optimizedPuml);
      }

      if (enableHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('home.errorOccurredWhileOptimizing'));
    } finally {
      setIsOptimizing(false);
    }
  }, [pumlText, apiUrl, baseUrl, aiApiKey, aiModel, removeThemePlain, enableHaptics, t, handleRender]);

  const handleUseOptimizedCode = React.useCallback(() => {
    if (optimizeResult) {
      setPumlText(optimizeResult);
      setOptimizeResult(null);
      setError(null);
    }
  }, [optimizeResult]);

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>{t('home.title')}</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-2">
              <Label>{t('home.plantUmlDiagram')}</Label>
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
                <AlertTitle>{t('home.error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <View className="flex-row gap-2">
              <Button onPress={handlePaste} variant="outline" className="flex-1">
                <Icon as={ClipboardPasteIcon} className="size-4" />
                <Text>{t('home.paste')}</Text>
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
                    <Text>{t('home.render')}</Text>
                  </>
                )}
              </Button>
            </View>

            <View className="flex-row gap-2">
              <Button
                onPress={handleExplain}
                disabled={isExplaining || !pumlText.trim()}
                variant="secondary"
                className="flex-1">
                {isExplaining ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <>
                    <Icon as={Sparkles} className="size-4" />
                    <Text>{t('home.explain')}</Text>
                  </>
                )}
              </Button>
              <Button
                onPress={handleOptimize}
                disabled={isOptimizing || !pumlText.trim()}
                variant="secondary"
                className="flex-1">
                {isOptimizing ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <>
                    <Icon as={Zap} className="size-4" />
                    <Text>{t('home.optimize')}</Text>
                  </>
                )}
              </Button>
            </View>
          </CardContent>
        </Card>

        <Dialog
          open={isExplainDialogOpen}
          onOpenChange={(open) => {
            setIsExplainDialogOpen(open);
            if (!open) {
              setExplainResult(null);
            }
          }}>
          <DialogContent style={{ maxHeight: '80%' }}>
            <DialogHeader>
              <DialogTitle>{t('home.explainResult')}</DialogTitle>
            </DialogHeader>
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 16 }}
              className="rounded-lg bg-muted p-4">
              {explainResult && (
                <Markdown
                  style={{
                    body: {
                      fontSize: 14,
                      paddingBottom: 8,
                    },
                    paragraph: {
                      marginTop: 8,
                      marginBottom: 8,
                    },
                    heading1: {
                      fontSize: 24,
                      fontWeight: 'bold',
                      marginTop: 12,
                      marginBottom: 8,
                    },
                    heading2: {
                      fontSize: 20,
                      fontWeight: 'bold',
                      marginTop: 10,
                      marginBottom: 6,
                    },
                    heading3: {
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginTop: 8,
                      marginBottom: 4,
                    },
                    code_inline: {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 4,
                      fontSize: 13,
                    },
                    code_block: {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      padding: 12,
                      borderRadius: 6,
                      marginVertical: 8,
                    },
                    link: {
                      color: colorScheme === 'dark' ? '#60a5fa' : '#2563eb',
                    },
                    list_item: {
                      marginVertical: 4,
                    },
                    bullet_list: {
                      marginVertical: 8,
                    },
                    ordered_list: {
                      marginVertical: 8,
                    },
                  }}>
                  {explainResult}
                </Markdown>
              )}
            </ScrollView>
          </DialogContent>
        </Dialog>

        {renderId && renderType && (
          <Card>
            <CardHeader>
              <CardTitle>{t('home.renderResult')}</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              {previewType && (
                <View className="gap-2">
                  <Text className="text-sm font-medium">{t('home.preview')} ({previewType.toUpperCase()}):</Text>
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
                  {t('home.renderId')}: {renderId}
                </Text>
                <Separator />
              </View>

              <View className="gap-2">
                <Text className="text-sm font-medium">{t('home.viewPreview')}:</Text>
                <View className="flex-row gap-2">
                  <Button
                    onPress={() => renderId && loadPreview('png', renderId)}
                    variant={previewType === 'png' ? 'default' : 'outline'}
                    disabled={isLoading || !renderId}
                    className="flex-1">
                    <Icon as={ImageIcon} className="size-4" />
                    <Text>{t('home.png')}</Text>
                  </Button>
                  <Button
                    onPress={() => renderId && loadPreview('svg', renderId)}
                    variant={previewType === 'svg' ? 'default' : 'outline'}
                    disabled={isLoading || !renderId}
                    className="flex-1">
                    <Icon as={FileImageIcon} className="size-4" />
                    <Text>{t('home.svg')}</Text>
                  </Button>
                  <Button
                    onPress={() => renderId && loadPreview('text', renderId)}
                    variant={previewType === 'text' ? 'default' : 'outline'}
                    disabled={isLoading || !renderId}
                    className="flex-1">
                    <Icon as={TypeIcon} className="size-4" />
                    <Text>{t('home.text')}</Text>
                  </Button>
                </View>
              </View>

              {previewType === 'png' && (
                <View className="gap-2">
                  <Button onPress={handleDownloadPng} variant="secondary">
                    <Icon as={DownloadIcon} className="size-4" />
                    <Text>{t('home.downloadPng')}</Text>
                  </Button>
                </View>
              )}

              <Separator />

              <View className="flex-row gap-2">
                <Button onPress={handleRawView} variant="ghost" className="flex-1">
                  <Icon as={ExternalLinkIcon} className="size-4" />
                  <Text>{t('home.rawView')}</Text>
                </Button>
                <Button onPress={handleShare} variant="ghost" className="flex-1">
                  <Icon as={ShareIcon} className="size-4" />
                  <Text>{t('home.share')}</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        <Dialog
          open={isOptimizeDialogOpen}
          onOpenChange={(open) => {
            setIsOptimizeDialogOpen(open);
            if (!open) {
              setOptimizeResult(null);
            }
          }}>
          <DialogContent style={{ maxHeight: '80%' }}>
            <DialogHeader>
              <DialogTitle>{t('home.optimizeResult')}</DialogTitle>
            </DialogHeader>
            <View className="gap-4">
              <ScrollView
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 16 }}
                className="rounded-lg bg-muted p-4">
                {optimizeResult && (
                  <Text className="font-mono text-sm whitespace-pre-wrap">{optimizeResult}</Text>
                )}
              </ScrollView>
              <Button
                onPress={() => {
                  handleUseOptimizedCode();
                  setIsOptimizeDialogOpen(false);
                }}
                className="w-full">
                <Icon as={PlayIcon} className="size-4" />
                <Text>{t('home.useOptimizedCode')}</Text>
              </Button>
            </View>
          </DialogContent>
        </Dialog>

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

        <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('home.clear')}</AlertDialogTitle>
              <AlertDialogDescription>{t('home.clearConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onPress={() => setIsClearDialogOpen(false)}>
                <Text>{t('history.cancel')}</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={handleConfirmClear} className="bg-destructive">
                <Text>{t('home.clear')}</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ScrollView>
    </>
  );
}

