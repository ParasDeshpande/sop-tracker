import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native'
import { apiGet } from '../../src/api'
import { NotificationItem } from '../../src/types'
import { colors, spacing, radius, fontSize } from '../../src/theme'

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try { setNotifications(await apiGet('/api/notifications-list')) } catch {}
  }, [])

  useEffect(() => { load() }, [])
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  return (
    <FlatList
      style={styles.container}
      data={notifications}
      keyExtractor={n => n.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ padding: spacing.lg }}
      ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.card, !item.read && styles.unread]}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.sm },
  unread: { borderLeftWidth: 3, borderLeftColor: colors.primary, backgroundColor: colors.primaryLight },
  message: { fontSize: fontSize.sm, color: colors.gray[700], lineHeight: 20 },
  time: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: spacing.xs },
  empty: { textAlign: 'center', color: colors.gray[500], marginTop: 60 },
})
