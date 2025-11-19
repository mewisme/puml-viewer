import * as Updates from 'expo-updates';

import React from 'react';

interface UpdatesContextType {
  isUpdateAvailable: boolean;
  isUpdatePending: boolean;
  isChecking: boolean;
  checkForUpdates: () => Promise<boolean>;
  downloadUpdate: () => Promise<boolean>;
  reloadApp: () => Promise<void>;
}

const UpdatesContext = React.createContext<UpdatesContextType | undefined>(undefined);

export function UpdatesProvider({ children }: { children: React.ReactNode }) {
  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);
  const [isUpdatePending, setIsUpdatePending] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);

  const checkForUpdates = React.useCallback(async (): Promise<boolean> => {
    if (!Updates.isEnabled) {
      return false;
    }

    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setIsUpdateAvailable(true);
        return true;
      } else {
        setIsUpdateAvailable(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setIsUpdateAvailable(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  React.useEffect(() => {
    if (!__DEV__ && Updates.isEnabled) {
      checkForUpdates();
    }
  }, [checkForUpdates]);

  const downloadUpdate = React.useCallback(async (): Promise<boolean> => {
    if (!Updates.isEnabled || !isUpdateAvailable) {
      return false;
    }

    try {
      setIsChecking(true);
      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        setIsUpdatePending(true);
        setIsUpdateAvailable(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error downloading update:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isUpdateAvailable]);

  const reloadApp = React.useCallback(async () => {
    if (!Updates.isEnabled || !isUpdatePending) {
      return;
    }

    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
    }
  }, [isUpdatePending]);

  return (
    <UpdatesContext.Provider
      value={{
        isUpdateAvailable,
        isUpdatePending,
        isChecking,
        checkForUpdates,
        downloadUpdate,
        reloadApp,
      }}>
      {children}
    </UpdatesContext.Provider>
  );
}

export function useUpdates() {
  const context = React.useContext(UpdatesContext);
  if (context === undefined) {
    throw new Error('useUpdates must be used within an UpdatesProvider');
  }
  return context;
}

