import type { ConfigContext, ExpoConfig } from 'expo/config';

type AppVariant = 'development' | 'preview' | 'production';

const APP_VARIANT: AppVariant =
  (process.env.APP_VARIANT as AppVariant) ?? 'production';

const VARIANT_CONFIG: Record<AppVariant, { name: string; identifier: string }> = {
  development: {
    name: 'PUML Viewer Dev',
    identifier: 'me.mewis.pumlviewer.dev',
  },
  preview: {
    name: 'PUML Viewer Preview',
    identifier: 'me.mewis.pumlviewer.preview',
  },
  production: {
    name: 'PUML Viewer',
    identifier: 'me.mewis.pumlviewer',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const { name, identifier } = VARIANT_CONFIG[APP_VARIANT];

  return {
    ...config,
    name,
    slug: 'puml-viewer',
    version: '0.0.6',
    description: 'A mobile application for viewing and rendering PlantUML diagrams. Create, preview, and manage your PlantUML diagrams on the go.',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    scheme: 'pv',
    platforms: ['ios', 'android'],
    ios: {
      ...config.ios,
      supportsTablet: false,
      bundleIdentifier: identifier,
    },
    android: {
      ...config.android,
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: identifier,
      permissions: ['READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE'],
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/33ab2485-6368-4d19-8a9c-dc913e021fc6',
      fallbackToCacheTimeout: 0,
      enabled: true,
    },
    plugins: [
      'expo-router',
      'expo-updates',
      [
        'expo-media-library',
        {
          photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
          savePhotosPermission: 'Allow $(PRODUCT_NAME) to save photos.',
          isAccessMediaLocationEnabled: true,
          granularPermissions: ['photo'],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      ...config.extra,
      router: {},
      eas: {
        projectId: '33ab2485-6368-4d19-8a9c-dc913e021fc6',
      },
    },
    owner: 'mewisme',
    githubUrl: 'https://github.com/mewisme/puml-viewer',
  };
};
