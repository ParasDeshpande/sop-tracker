import { Tabs } from 'expo-router'
import { useAuth } from '../../src/context/AuthContext'
import { colors } from '../../src/theme'
import { View, Text } from 'react-native'

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ fontSize: 10, color: focused ? colors.primary : colors.gray[500], fontWeight: focused ? '600' : '400' }}>{label}</Text>
}

export default function TabsLayout() {
  const { user } = useAuth()

  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.white,
      headerTitleStyle: { fontWeight: '600' },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray[500],
      tabBarStyle: { paddingBottom: 4, height: 56 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'SOPs', tabBarIcon: ({ focused }) => <TabIcon label="📋" focused={focused} /> }} />
      <Tabs.Screen name="tasks" options={{ title: 'My Tasks', tabBarIcon: ({ focused }) => <TabIcon label="✅" focused={focused} /> }} />
      <Tabs.Screen name="submissions" options={{ title: 'History', tabBarIcon: ({ focused }) => <TabIcon label="📁" focused={focused} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts', tabBarIcon: ({ focused }) => <TabIcon label="🔔" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} /> }} />
    </Tabs>
  )
}
