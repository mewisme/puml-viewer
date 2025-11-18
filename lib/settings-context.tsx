import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

const API_URL_KEY = '@puml_viewer_api_url';
const AUTO_RENDER_KEY = '@puml_viewer_auto_render';
export const DEFAULT_API_URL = 'https://spuml.mewis.me';

interface SettingsContextType {
  apiUrl: string;
  setApiUrl: (url: string) => Promise<void>;
  autoRender: boolean;
  setAutoRender: (enabled: boolean) => Promise<void>;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiUrl, setApiUrlState] = React.useState<string>(DEFAULT_API_URL);
  const [autoRender, setAutoRenderState] = React.useState<boolean>(true);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedUrl, savedAutoRender] = await Promise.all([
        AsyncStorage.getItem(API_URL_KEY),
        AsyncStorage.getItem(AUTO_RENDER_KEY),
      ]);
      if (savedUrl) {
        setApiUrlState(savedUrl);
      }
      if (savedAutoRender !== null) {
        setAutoRenderState(savedAutoRender === 'true');
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

  return (
    <SettingsContext.Provider value={{ apiUrl, setApiUrl, autoRender, setAutoRender }}>
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

