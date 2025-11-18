import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { APP_CONFIG, DEFAULT_API_URL, type AIProvider } from './app-config';

const API_URL_KEY = '@puml_viewer_api_url';
const AUTO_RENDER_KEY = '@puml_viewer_auto_render';
const AI_PROVIDER_KEY = '@puml_viewer_ai_provider';
const AI_MODEL_KEY = '@puml_viewer_ai_model';
const AI_API_KEY_KEY = '@puml_viewer_ai_api_key';
const AI_CUSTOM_BASE_URL_KEY = '@puml_viewer_ai_custom_base_url';

interface SettingsContextType {
  apiUrl: string;
  setApiUrl: (url: string) => Promise<void>;
  autoRender: boolean;
  setAutoRender: (enabled: boolean) => Promise<void>;
  aiProvider: AIProvider;
  setAiProvider: (provider: AIProvider) => Promise<void>;
  aiModel: string;
  setAiModel: (model: string) => Promise<void>;
  aiApiKey: string;
  setAiApiKey: (key: string) => Promise<void>;
  aiCustomBaseUrl: string;
  setAiCustomBaseUrl: (url: string) => Promise<void>;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiUrl, setApiUrlState] = React.useState<string>(DEFAULT_API_URL);
  const [autoRender, setAutoRenderState] = React.useState<boolean>(true);
  const [aiProvider, setAiProviderState] = React.useState<AIProvider>(
    APP_CONFIG.ai.defaultProvider
  );
  const [aiModel, setAiModelState] = React.useState<string>(APP_CONFIG.ai.defaultModel);
  const [aiApiKey, setAiApiKeyState] = React.useState<string>('');
  const [aiCustomBaseUrl, setAiCustomBaseUrlState] = React.useState<string>('');

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedUrl, savedAutoRender, savedAiProvider, savedAiModel, savedAiApiKey, savedAiCustomBaseUrl] =
        await Promise.all([
          AsyncStorage.getItem(API_URL_KEY),
          AsyncStorage.getItem(AUTO_RENDER_KEY),
          AsyncStorage.getItem(AI_PROVIDER_KEY),
          AsyncStorage.getItem(AI_MODEL_KEY),
          AsyncStorage.getItem(AI_API_KEY_KEY),
          AsyncStorage.getItem(AI_CUSTOM_BASE_URL_KEY),
        ]);
      if (savedUrl) {
        setApiUrlState(savedUrl);
      }
      if (savedAutoRender !== null) {
        setAutoRenderState(savedAutoRender === 'true');
      }
      if (savedAiProvider) {
        const provider = savedAiProvider as AIProvider;
        setAiProviderState(provider);
        if (savedAiModel) {
          setAiModelState(savedAiModel);
        } else {
          const models = APP_CONFIG.ai.providers[provider].models;
          if (models.length > 0) {
            setAiModelState(models[0]);
          }
        }
      }
      if (savedAiApiKey) {
        setAiApiKeyState(savedAiApiKey);
      }
      if (savedAiCustomBaseUrl) {
        setAiCustomBaseUrlState(savedAiCustomBaseUrl);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const setApiUrl = async (url: string) => {
    try {
      await AsyncStorage.setItem(API_URL_KEY, url);
      setApiUrlState(url);
    } catch (error) {
      console.error('Failed to save API URL:', error);
      throw error;
    }
  };

  const setAutoRender = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(AUTO_RENDER_KEY, enabled.toString());
      setAutoRenderState(enabled);
    } catch (error) {
      console.error('Failed to save auto render setting:', error);
      throw error;
    }
  };

  const setAiProvider = async (provider: AIProvider) => {
    try {
      const providerStr = String(provider);
      await AsyncStorage.setItem(AI_PROVIDER_KEY, providerStr);
      setAiProviderState(provider);
      if (provider !== 'custom') {
        const models = APP_CONFIG.ai.providers[provider].models;
        if (models.length > 0) {
          const firstModel = models[0];
          await AsyncStorage.setItem(AI_MODEL_KEY, firstModel);
          setAiModelState(firstModel);
        }
      }
    } catch (error) {
      console.error('Failed to save AI provider:', error);
      throw error;
    }
  };

  const setAiModel = async (model: string) => {
    try {
      const modelStr = String(model);
      await AsyncStorage.setItem(AI_MODEL_KEY, modelStr);
      setAiModelState(modelStr);
    } catch (error) {
      console.error('Failed to save AI model:', error);
      throw error;
    }
  };

  const setAiApiKey = async (key: string) => {
    try {
      await AsyncStorage.setItem(AI_API_KEY_KEY, key);
      setAiApiKeyState(key);
    } catch (error) {
      console.error('Failed to save AI API key:', error);
      throw error;
    }
  };

  const setAiCustomBaseUrl = async (url: string) => {
    try {
      const urlStr = String(url);
      await AsyncStorage.setItem(AI_CUSTOM_BASE_URL_KEY, urlStr);
      setAiCustomBaseUrlState(urlStr);
    } catch (error) {
      console.error('Failed to save AI custom base URL:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        apiUrl,
        setApiUrl,
        autoRender,
        setAutoRender,
        aiProvider,
        setAiProvider,
        aiModel,
        setAiModel,
        aiApiKey,
        setAiApiKey,
        aiCustomBaseUrl,
        setAiCustomBaseUrl,
      }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

