import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { apiGet } from '../../src/api'
import { Template } from '../../src/types'
import { colors, spacing, radius, fontSize } from '../../src/theme'

export default function SOPsScreen() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try { setTemplates(await apiGet('/api/templates-list')) } catch {}
  }, [])

  useEffect(() => { load() }, [])

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const filtered = templates.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.department.name.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc, t) => {
    const dept = t.department.name
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(t)
    return acc
  }, {} as Record<string, Template[]>)

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search SOPs..." placeholderTextColor={colors.gray[500]} />
      </View>
      <FlatList
        data={Object.entries(grouped)}
        keyExtractor={([dept]) => dept}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
        ListEmptyComponent={<Text style={styles.empty}>No SOPs found.</Text>}
        renderItem={({ item: [dept, tpls] }) => (
          <View style={styles.section}>
            <Text style={styles.deptTitle}>{dept}</Text>
            {tpls.map(t => (
              <TouchableOpacity key={t.id} style={styles.card} onPress={() => router.push(`/fill/${t.id}`)} activeOpacity={0.7}>
                <Text style={styles.cardTitle}>{t.title}</Text>
                {t.description && <Text style={styles.cardDesc} numberOfLines={1}>{t.description}</Text>}
                <Text style={styles.cardAction}>Tap to fill →</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  searchBox: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  searchInput: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: fontSize.md },
  section: { marginBottom: spacing.xl },
  deptTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.sm, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.gray[900] },
  cardDesc: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: 2 },
  cardAction: { fontSize: fontSize.xs, color: colors.primary, marginTop: spacing.sm, fontWeight: '500' },
  empty: { textAlign: 'center', color: colors.gray[500], marginTop: 40 },
})
