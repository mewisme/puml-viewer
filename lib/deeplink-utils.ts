import Constants from 'expo-constants';

export function generateDeeplink(renderId: string): string {
  const isDev = __DEV__;
  
  if (isDev) {
    // Try to get hostUri from Constants
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.hostUri;
    
    if (hostUri) {
      // hostUri format: "192.168.1.1:8081" or "localhost:8081"
      return `exp://${hostUri}/--/${renderId}`;
    }
  }
  
  return `pv://${renderId}`;
}

export function parseDeeplink(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle exp:// format (dev mode)
    if (urlObj.protocol === 'exp:') {
      const pathMatch = urlObj.pathname.match(/^\/--\/(.+)$/);
      if (pathMatch) {
        return pathMatch[1];
      }
    }
    
    // Handle pv:// format (production)
    if (urlObj.protocol === 'pv:') {
      const id = urlObj.pathname.replace(/^\//, '');
      return id || null;
    }
    
    return null;
  } catch {
    return null;
  }
}

