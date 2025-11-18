import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as React from 'react';
import * as Sharing from 'expo-sharing';

import { Alert as RNAlert } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadIcon } from 'lucide-react-native';
import { Modal, Platform, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import QRCode from 'react-native-qrcode-svg';
import { Text } from '@/components/ui/text';
import { XIcon } from 'lucide-react-native';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export function QRCodeModal({ visible, onClose, url, title }: QRCodeModalProps) {
  const qrCodeRef = React.useRef<any>(null);

  const handleShare = async () => {
    try {
      await Clipboard.setStringAsync(url);
      RNAlert.alert('Success', 'Deeplink copied to clipboard', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Failed to share:', error);
      RNAlert.alert('Error', 'Failed to copy URL', [{ text: 'OK' }]);
    }
  };

  const handleDownloadQR = async () => {
    try {
      if (!qrCodeRef.current) return;

      const dataUrl = qrCodeRef.current.getDataURL();
      const filename = `qrcode-${title || 'puml'}-${Date.now()}.png`;

      const base64Data = dataUrl.split(',')[1];
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(fileUri);
        RNAlert.alert('Success', 'QR code saved to gallery', [{ text: 'OK' }]);
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          RNAlert.alert('Error', 'Permission denied to save to gallery', [{ text: 'OK' }]);
        }
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
      RNAlert.alert('Error', 'Failed to download QR code', [{ text: 'OK' }]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{title || 'QR Code'}</CardTitle>
            <Button onPress={onClose} variant="ghost" size="icon" className="h-8 w-8">
              <Icon as={XIcon} className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="items-center gap-4">
            <View className="rounded-lg bg-white p-4">
              <QRCode ref={qrCodeRef} value={url} size={200} />
            </View>
            <Text className="text-center text-sm text-muted-foreground" numberOfLines={2}>
              {url}
            </Text>
            <View className="w-full flex-row gap-2">
              <Button onPress={handleShare} variant="outline" className="flex-1">
                <Text>Share URL</Text>
              </Button>
              <Button onPress={handleDownloadQR} variant="outline" className="flex-1">
                <Icon as={DownloadIcon} className="size-4" />
                <Text>Download QR</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    </Modal>
  );
}

