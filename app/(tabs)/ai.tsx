import * as React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Bot, MessageSquarePlus, PlayIcon, Send, User } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { APP_CONFIG } from '@/lib/app-config';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { getApiClient } from '@/lib/api-client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/lib/settings-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pumlCode?: string;
  timestamp: number;
}

export default function AIScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    apiUrl,
    aiProvider,
    aiModel,
    aiApiKey,
    aiCustomBaseUrl,
  } = useSettings();

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const inputRef = React.useRef<any>(null);

  const baseUrl = React.useMemo(() => {
    if (aiProvider === 'custom') {
      return aiCustomBaseUrl;
    }
    return APP_CONFIG.ai.providers[aiProvider]?.baseUrl || '';
  }, [aiProvider, aiCustomBaseUrl]);

  const scrollToBottom = React.useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const extractPumlCode = React.useCallback((text: string): string | null => {
    const pumlMatch = text.match(/@startuml[\s\S]*?@enduml/i);
    if (pumlMatch) {
      return pumlMatch[0];
    }
    const codeBlockMatch = text.match(/```(?:puml|plantuml)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch) {
      const code = codeBlockMatch[1].trim();
      if (code.includes('@startuml') && code.includes('@enduml')) {
        return code;
      }
    }
    return null;
  }, []);

  const handleSend = React.useCallback(async () => {
    if (!inputText.trim() || isLoading) return;
    if (!aiApiKey.trim()) {
      setError('Please set your API key in Settings');
      return;
    }
    if (!baseUrl.trim()) {
      setError('Please set your API base URL in Settings');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setError(null);
    setIsLoading(true);

    const prompt = inputText.trim();

    try {
      const requestBody = {
        baseUrl,
        apiKey: aiApiKey,
        model: aiModel,
        prompt,
        ...(conversationId && { conversationId }),
        stream: false,
      };

      const apiClient = getApiClient(apiUrl);
      const response = await apiClient.post<{ puml?: string; content?: string; conversationId?: string }>(
        '/api/v1/puml/generate',
        requestBody
      );
      const data = response.data;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.puml || data.content || '',
        pumlCode: extractPumlCode(data.puml || data.content || '') || undefined,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating');
    } finally {
      setIsLoading(false);
    }
  }, [
    inputText,
    isLoading,
    aiApiKey,
    baseUrl,
    apiUrl,
    aiModel,
    conversationId,
    extractPumlCode,
    scrollToBottom,
  ]);

  const handleRender = React.useCallback(
    async (pumlCode: string) => {
      try {
        const apiClient = getApiClient(apiUrl);
        const response = await apiClient.post<{ id: string }>('/api/v1/puml', {
          puml: pumlCode,
        });

        const data = response.data;
        if (!data.id) {
          throw new Error('Invalid response format');
        }

        router.replace({
          pathname: '/(tabs)',
          params: {
            loadCode: encodeURIComponent(pumlCode),
            loadId: data.id,
            loadType: 'png',
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render PUML code');
      }
    },
    [apiUrl, router]
  );

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleNewConversation = React.useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInputText('');
  }, []);

  const headerRight = React.useCallback(() => {
    if (messages.length === 0) return null;
    return (
      <TouchableOpacity
        onPress={handleNewConversation}
        style={{ marginRight: 8, padding: 8 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon as={MessageSquarePlus} className="size-5" />
      </TouchableOpacity>
    );
  }, [messages.length, handleNewConversation]);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerClassName="p-4"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 0,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}>
          {messages.length === 0 && (
            <Card className="mb-4">
              <CardContent className="p-6 gap-4 items-center">
                <Icon as={Bot} className="size-12 text-muted-foreground" />
                <Text className="text-center text-muted-foreground">
                  Start a conversation with AI to generate PlantUML diagrams. Ask me to create
                  diagrams like sequence diagrams, class diagrams, or any other PlantUML diagram.
                </Text>
              </CardContent>
            </Card>
          )}

          <View className="gap-2 mb-4">
            {messages.map((message) => (
              <Card key={message.id} className={message.role === 'user' ? 'bg-primary/10' : ''}>
                <CardContent className="px-4 gap-2">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Icon
                      as={message.role === 'user' ? User : Bot}
                      className={`size-4 ${message.role === 'user' ? 'text-primary' : 'text-secondary-foreground'}`}
                    />
                    <Text className="font-semibold text-sm">
                      {message.role === 'user' ? 'You' : 'AI'}
                    </Text>
                  </View>
                  <Text className="text-sm whitespace-pre-wrap">{message.content}</Text>
                  {message.pumlCode && (
                    <View className="mt-2 pt-2 border-t border-border">
                      <Button
                        onPress={() => handleRender(message.pumlCode!)}
                        className="w-full"
                        size="sm">
                        <Icon as={PlayIcon} className="size-4" />
                        <Text>Render</Text>
                      </Button>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
          </View>

          {error && (
            <Alert variant="destructive" icon={AlertCircle} className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <View
            className="border-t border-border bg-background p-4 gap-2"
            style={{
              paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom || 16,
              paddingTop: 16,
            }}>
            <View className="flex-row gap-2 items-center">
              <Textarea
                ref={inputRef}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask AI to generate a PlantUML diagram..."
                className="flex-1 rounded-2xl px-4"
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
                style={{ maxHeight: 120 }}
              />
              <Button
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
                size="icon">
                <Icon as={Send} className="size-4" />
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

