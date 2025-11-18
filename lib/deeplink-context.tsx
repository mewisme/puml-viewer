import * as React from 'react';

interface DeeplinkContextType {
  deeplinkId: string | null;
  setDeeplinkId: (id: string | null) => void;
}

const DeeplinkContext = React.createContext<DeeplinkContextType | undefined>(undefined);

export function DeeplinkProvider({ children }: { children: React.ReactNode }) {
  const [deeplinkId, setDeeplinkId] = React.useState<string | null>(null);

  return (
    <DeeplinkContext.Provider value={{ deeplinkId, setDeeplinkId }}>
      {children}
    </DeeplinkContext.Provider>
  );
}

export function useDeeplink() {
  const context = React.useContext(DeeplinkContext);
  if (context === undefined) {
    throw new Error('useDeeplink must be used within a DeeplinkProvider');
  }
  return context;
}

