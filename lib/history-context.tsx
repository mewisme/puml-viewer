import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

const HISTORY_KEY = '@puml_viewer_history';
const FAVORITES_KEY = '@puml_viewer_favorites';
const MAX_HISTORY_ITEMS = 50;

export interface HistoryItem {
  id: string;
  pumlCode: string;
  renderId: string;
  renderType: 'text' | 'svg' | 'png';
  createdAt: number;
  previewUrl?: string;
  isFavorite?: boolean;
  title?: string;
}

interface HistoryContextType {
  history: HistoryItem[];
  favorites: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateHistoryItem: (id: string, updates: Partial<HistoryItem>) => Promise<void>;
  getStatistics: () => {
    total: number;
    byType: { png: number; svg: number; text: number };
    favorites: number;
  };
}

const HistoryContext = React.createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        const savedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        const favoriteIds = savedFavorites ? JSON.parse(savedFavorites) : [];
        const historyWithFavorites = parsed.map((item: HistoryItem) => ({
          ...item,
          isFavorite: favoriteIds.includes(item.id),
        }));
        setHistory(historyWithFavorites);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      const favoriteIds = newHistory.filter((h) => h.isFavorite).map((h) => h.id);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save history:', error);
      throw error;
    }
  };

  const addToHistory = async (item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      isFavorite: false,
    };

    const updatedHistory = [newItem, ...history.filter((h) => h.renderId !== item.renderId)].slice(
      0,
      MAX_HISTORY_ITEMS
    );
    await saveHistory(updatedHistory);
  };

  const removeFromHistory = async (id: string) => {
    const updatedHistory = history.filter((h) => h.id !== id);
    await saveHistory(updatedHistory);
  };

  const clearHistory = async () => {
    await saveHistory([]);
  };

  const toggleFavorite = async (id: string) => {
    const updatedHistory = history.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    );
    await saveHistory(updatedHistory);
  };

  const updateHistoryItem = async (id: string, updates: Partial<HistoryItem>) => {
    const updatedHistory = history.map((item) => (item.id === id ? { ...item, ...updates } : item));
    await saveHistory(updatedHistory);
  };

  const favorites = React.useMemo(() => history.filter((item) => item.isFavorite), [history]);

  const getStatistics = () => {
    return {
      total: history.length,
      byType: {
        png: history.filter((h) => h.renderType === 'png').length,
        svg: history.filter((h) => h.renderType === 'svg').length,
        text: history.filter((h) => h.renderType === 'text').length,
      },
      favorites: favorites.length,
    };
  };

  return (
    <HistoryContext.Provider
      value={{
        history,
        favorites,
        addToHistory,
        removeFromHistory,
        clearHistory,
        toggleFavorite,
        updateHistoryItem,
        getStatistics,
      }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = React.useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}

