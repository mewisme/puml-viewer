import { History, Home, Info, Settings, Bot } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: true,
        headerTransparent: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.pumlViewer'),
          headerTitle: t('tabs.pumlViewer'),
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Icon as={Home} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t('tabs.ai'),
          headerTitle: t('tabs.aiAssistant'),
          tabBarLabel: t('tabs.ai'),
          tabBarIcon: ({ color, size }) => <Icon as={Bot} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          headerTitle: t('tabs.history'),
          tabBarLabel: t('tabs.history'),
          tabBarIcon: ({ color, size }) => <Icon as={History} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          headerTitle: t('tabs.settings'),
          tabBarLabel: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => <Icon as={Settings} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t('tabs.about'),
          headerTitle: t('tabs.about'),
          tabBarLabel: t('tabs.about'),
          tabBarIcon: ({ color, size }) => <Icon as={Info} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

