/** @type {import('expo/config').ExpoConfig} */
export default {
  name: 'PUML Viewer',
  slug: 'puml-viewer',
  version: '0.0.5',
  description: 'A mobile application for viewing and rendering PlantUML diagrams. Create, preview, and manage your PlantUML diagrams on the go.',
  author: 'Mew',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'pv',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
  },
  android: {
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'me.mewis.pumlviewer',
    permissions: [
      'READ_MEDIA_IMAGES',
      'READ_EXTERNAL_STORAGE',
    ],
  },
  runtimeVersion: {
    policy: "appVersion"
  },
  plugins: [
    'expo-router',
    'expo-updates',
    [
      "expo-media-library",
      {
        "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
        "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
        "isAccessMediaLocationEnabled": true,
        "granularPermissions": ["photo"]
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: {
    url: 'https://u.expo.dev/33ab2485-6368-4d19-8a9c-dc913e021fc6',
    fallbackToCacheTimeout: 0,
  },
  extra: {
    router: {},
    eas: {
      projectId: '33ab2485-6368-4d19-8a9c-dc913e021fc6',
    },
  },
  owner: 'mewisme',
};