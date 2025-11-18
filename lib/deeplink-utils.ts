import Constants from 'expo-constants';

export function generateDeeplink(renderId: string): string {
  const isDev = __DEV__;
  
  if (isDev) {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.hostUri;
    
    if (hostUri) {
      return `exp://${hostUri}/--/${renderId}`;
    }
  }
  
  return `pv://${renderId}`;
}

export function parseDeeplink(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.protocol === 'exp:') {
      const pathMatch = urlObj.pathname.match(/^\/--\/(.+)$/);
      if (pathMatch) {
        return pathMatch[1];
      }
    }
    
    if (urlObj.protocol === 'pv:') {
      const id = urlObj.pathname.replace(/^\//, '');
      return id || null;
    }
    
    return null;
  } catch {
    return null;
  }
}

