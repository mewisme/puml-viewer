import * as Clipboard from 'expo-clipboard';
import * as React from 'react';

import { ActivityIndicator, Alert as RNAlert, ScrollView, TouchableOpacity, View } from 'react-native';
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
import { CopyIcon, EditIcon, QrCodeIcon, StarIcon, TrashIcon } from 'lucide-react-native';
import { HistoryItem, useHistory } from '@/lib/history-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeModal } from '@/components/qr-code-modal';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { generateDeeplink } from '@/lib/deeplink-utils';
import { getApiClient } from '@/lib/api-client';
import { useSettings } from '@/lib/settings-context';
import { useTranslation } from 'react-i18next';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { apiUrl } = useSettings();
  const { history, favorites, removeFromHistory, clearHistory, toggleFavorite, updateHistoryItem } = useHistory();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'png' | 'svg' | 'text' | 'favorites'>('all');
  const [qrModalVisible, setQrModalVisible] = React.useState(false);
  const [qrUrl, setQrUrl] = React.useState('');
  const [qrTitle, setQrTitle] = React.useState('');
  const [qrLoading, setQrLoading] = React.useState(false);
  const [editingTitleId, setEditingTitleId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteItemId, setDeleteItemId] = React.useState<string | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setQrModalVisible(false);
        setEditingTitleId(null);
        setEditingTitle('');
      };
    }, [])
  );

  const handleCopyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      RNAlert.alert(t('history.success'), t('history.codeCopiedToClipboard'), [{ text: 'OK' }]);
    } catch (err) {
      RNAlert.alert(t('history.error'), t('history.cannotCopyToClipboard'), [{ text: 'OK' }]);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteItemId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteItemId) {
      await removeFromHistory(deleteItemId);
      setDeleteItemId(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleClearAll = () => {
    setClearAllDialogOpen(true);
  };

  const handleConfirmClearAll = async () => {
    await clearHistory();
    setClearAllDialogOpen(false);
  };

  const handleLoadItem = async (item: HistoryItem) => {
    router.replace({
      pathname: '/(tabs)',
      params: {
        loadId: item.renderId,
        loadType: item.renderType,
        loadCode: encodeURIComponent(item.pumlCode),
      },
    });
  };

  const filteredHistory = React.useMemo(() => {
    let filtered = history;

    if (filterType === 'favorites') {
      filtered = favorites;
    } else if (filterType !== 'all') {
      filtered = history.filter((item) => item.renderType === filterType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.pumlCode.toLowerCase().includes(query) ||
          (item.title && item.title.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [history, favorites, filterType, searchQuery]);

  const handleShowQRCode = async (item: HistoryItem) => {
    try {
      setQrLoading(true);
      setQrTitle(item.title || t('history.pumlDiagram'));

      const apiClient = getApiClient(apiUrl);
      const response = await apiClient.post<{ id: string }>('/api/v1/puml', {
        puml: item.pumlCode,
      });

      const result = response.data;
      if (!result.id) {
        throw new Error('Invalid response format');
      }

      const deeplink = generateDeeplink(result.id);
      setQrUrl(deeplink);
      setQrModalVisible(true);
    } catch (err) {
      RNAlert.alert(t('history.error'), err instanceof Error ? err.message : t('history.failedToGenerateQrCode'), [{ text: 'OK' }]);
    } finally {
      setQrLoading(false);
    }
  };

  const handleEditTitle = (item: HistoryItem) => {
    setEditingTitleId(item.id);
    setEditingTitle(item.title || '');
  };

  const handleSaveTitle = async (id: string) => {
    await updateHistoryItem(id, { title: editingTitle.trim() || undefined });
    setEditingTitleId(null);
    setEditingTitle('');
  };

  const handleCancelEditTitle = () => {
    setEditingTitleId(null);
    setEditingTitle('');
  };

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t('history.title')}</CardTitle>
            {history.length > 0 && (
              <Button onPress={handleClearAll} variant="ghost" size="sm">
                <Text className="text-sm text-destructive">{t('history.clearAll')}</Text>
              </Button>
            )}
          </CardHeader>
          <CardContent className="gap-4">
            <View className="gap-4">
              <View className="gap-2">
                <Label>{t('history.search')}</Label>
                <Input
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('history.searchPlaceholder')}
                />
              </View>
              <View className="gap-2">
                <Label>{t('history.filter')}</Label>
                <View className="flex-row gap-2">
                  <Button
                    onPress={() => setFilterType('all')}
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1">
                    <Text>{t('history.all')}</Text>
                  </Button>
                  <Button
                    onPress={() => setFilterType('favorites')}
                    variant={filterType === 'favorites' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1">
                    <Icon as={StarIcon} className="size-4" />
                    <Text>{t('history.favorites')}</Text>
                  </Button>
                </View>
                <View className="flex-row gap-2">
                  <Button
                    onPress={() => setFilterType('png')}
                    variant={filterType === 'png' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1">
                    <Text>PNG</Text>
                  </Button>
                  <Button
                    onPress={() => setFilterType('svg')}
                    variant={filterType === 'svg' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1">
                    <Text>SVG</Text>
                  </Button>
                  <Button
                    onPress={() => setFilterType('text')}
                    variant={filterType === 'text' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1">
                    <Text>Text</Text>
                  </Button>
                </View>
              </View>
            </View>

            <Separator />

            {filteredHistory.length === 0 ? (
              <View className="py-8">
                <Text className="text-center text-muted-foreground">
                  {history.length === 0 ? t('history.noHistoryYet') : t('history.noItemsFound')}
                </Text>
              </View>
            ) : (
              filteredHistory.map((item) => (
                <View key={item.id} className="rounded-lg border border-border bg-muted p-3">
                  {editingTitleId === item.id ? (
                    <View className="mb-2 gap-2">
                      <Input
                        value={editingTitle}
                        onChangeText={setEditingTitle}
                        placeholder={t('history.enterTitleOptional')}
                        autoFocus
                      />
                      <View className="flex-row gap-2">
                        <Button
                          onPress={() => handleSaveTitle(item.id)}
                          variant="default"
                          size="sm"
                          className="flex-1">
                          <Text>{t('history.save')}</Text>
                        </Button>
                        <Button
                          onPress={handleCancelEditTitle}
                          variant="outline"
                          size="sm"
                          className="flex-1">
                          <Text>{t('history.cancel')}</Text>
                        </Button>
                      </View>
                    </View>
                  ) : (
                    <View className="mb-2 flex-row items-start justify-between">
                      <TouchableOpacity
                        onPress={() => handleLoadItem(item)}
                        activeOpacity={0.7}
                        className="flex-1">
                        {item.title && (
                          <Text className="text-sm font-semibold" numberOfLines={1}>
                            {item.title}
                          </Text>
                        )}
                        <Text className="text-sm font-medium" numberOfLines={2}>
                          {item.pumlCode.substring(0, 100)}
                          {item.pumlCode.length > 100 ? '...' : ''}
                        </Text>
                        <Text className="mt-1 text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()} • {item.renderType.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                      <View className="flex-row gap-1">
                        <Button
                          onPress={() => handleEditTitle(item)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8">
                          <Icon as={EditIcon} className="size-4" />
                        </Button>
                        <Button
                          onPress={() => toggleFavorite(item.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8">
                          <Icon
                            as={StarIcon}
                            className={item.isFavorite ? 'size-4 fill-yellow-500 text-yellow-500' : 'size-4'}
                          />
                        </Button>
                      </View>
                    </View>
                  )}
                  <Separator className="my-2" />
                  <View className="flex-row gap-2">
                    <Button
                      onPress={() => handleCopyCode(item.pumlCode)}
                      variant="outline"
                      size="sm"
                      className="flex-1">
                      <Icon as={CopyIcon} className="size-4" />
                      <Text>{t('history.copy')}</Text>
                    </Button>
                    <Button
                      onPress={() => handleShowQRCode(item)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={qrLoading}>
                      {qrLoading ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <>
                          <Icon as={QrCodeIcon} className="size-4" />
                          <Text>{t('history.qr')}</Text>
                        </>
                      )}
                    </Button>
                    <Button
                      onPress={() => handleDelete(item.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1">
                      <Icon as={TrashIcon} className="size-4" />
                      <Text>{t('history.delete')}</Text>
                    </Button>
                  </View>
                </View>
              ))
            )}
          </CardContent>
        </Card>
      </ScrollView>
      <QRCodeModal
        visible={qrModalVisible}
        onClose={() => setQrModalVisible(false)}
        url={qrUrl}
        title={qrTitle}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('history.delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('history.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setDeleteDialogOpen(false)}>
              <Text>{t('history.cancel')}</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleConfirmDelete} className="bg-destructive">
              <Text>{t('history.delete')}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('history.clearAll')}</AlertDialogTitle>
            <AlertDialogDescription>{t('history.clearAllConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setClearAllDialogOpen(false)}>
              <Text>{t('history.cancel')}</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleConfirmClearAll} className="bg-destructive">
              <Text>{t('history.clearAll')}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

