import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { apiGet } from '../../src/api'
import { Submission } from '../../src/types'
import { colors, spacing, radius, fontSize } from '../../src/theme'

export default function SubmissionsScreen() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try { setSubmissions(await apiGet('/api/submissions-list')) } catch {}
  }, [])

  useEffect(() => { load() }, [])
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const filtered = submissions.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.template.title.toLowerCase().includes(search.toLowerCase())
  )

  const statusStyle = (status: string) => {
    if (status === 'APPROVED') return { bg: colors.successLight, text: colors.success }
    if (status === 'REJECTED') return { bg: colors.dangerLight, text: colors.danger }
    if (status === 'PENDING_APPROVAL') return { bg: colors.warningLight, text: colors.warning }
    return { bg: colors.primaryLight, text: colors.primary }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search submissions..." placeholderTextColor={colors.gray[500]} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={s => s.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
        ListEmptyComponent={<Text style={styles.empty}>No submissions yet.</Text>}
        renderItem={({ item }) => {
          const s = statusStyle(item.status)
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: s.bg }]}><Text style={[styles.badgeText, { color: s.text }]}>{item.status.replace('_', ' ')}</Text></View>
              </View>
              <Text style={styles.meta}>{item.template.title} • {item.department.name}</Text>
              <Text style={styles.date}>{new Date(item.submittedAt).toLocaleDateString()} {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  searchBox: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  searchInput: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: fontSize.md },
  card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.sm, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize.md, fontWeight: '600', flex: 1, marginRight: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  meta: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: 4 },
  date: { fontSize: fontSize.xs, color: colors.gray[300], marginTop: 4 },
  empty: { textAlign: 'center', color: colors.gray[500], marginTop: 60 },
})
