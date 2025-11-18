import { History, Home, Info, Settings } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Tabs } from 'expo-router';

export default function TabLayout() {
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
          title: 'PUML Viewer',
          headerTitle: 'PUML Viewer',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Icon as={Home} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerTitle: 'History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <Icon as={History} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Icon as={Settings} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          headerTitle: 'About',
          tabBarLabel: 'About',
          tabBarIcon: ({ color, size }) => <Icon as={Info} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

