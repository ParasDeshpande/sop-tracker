import { Redirect } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { View, ActivityIndicator } from 'react-native'
import { colors } from '../src/theme'

export default function Index() {
  const { user, loading } = useAuth()
  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}><ActivityIndicator size="large" color={colors.primary} /></View>
  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />
}
