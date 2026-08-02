import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { apiGet } from '../../src/api'
import { ProjectTask } from '../../src/types'
import { colors, spacing, radius, fontSize } from '../../src/theme'

export default function TasksScreen() {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try { setTasks(await apiGet('/api/my-tasks')) } catch {}
  }, [])

  useEffect(() => { load() }, [])
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const pending = tasks.filter(t => t.status !== 'COMPLETED')
  const completed = tasks.filter(t => t.status === 'COMPLETED')

  const statusStyle = (status: string) => {
    if (status === 'COMPLETED') return { bg: colors.successLight, text: colors.success }
    if (status === 'OVERDUE') return { bg: colors.dangerLight, text: colors.danger }
    return { bg: colors.warningLight, text: colors.warning }
  }

  const renderTask = (task: ProjectTask, showAction: boolean) => {
    const s = statusStyle(task.status)
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{task.template.title}</Text>
          <View style={[styles.badge, { backgroundColor: s.bg }]}><Text style={[styles.badgeText, { color: s.text }]}>{task.status}</Text></View>
        </View>
        <Text style={styles.cardMeta}>{task.project.name} — {task.project.client}</Text>
        {task.dueDate && <Text style={styles.due}>Due: {task.dueDate}</Text>}
        {task.notes && <Text style={styles.notes}>{task.notes}</Text>}
        {showAction && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/fill/${task.template.id}?projectSOPId=${task.id}&projectId=${task.projectId}`)} activeOpacity={0.7}>
            <Text style={styles.actionText}>Fill & Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <FlatList
      style={styles.container}
      data={[...pending, ...completed]}
      keyExtractor={t => t.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ padding: spacing.lg }}
      ListEmptyComponent={<Text style={styles.empty}>No tasks assigned to you yet.</Text>}
      ListHeaderComponent={pending.length > 0 ? <Text style={styles.sectionTitle}>Pending ({pending.length})</Text> : null}
      renderItem={({ item, index }) => (
        <>
          {index === pending.length && completed.length > 0 && <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Completed ({completed.length})</Text>}
          {renderTask(item, item.status !== 'COMPLETED')}
        </>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.gray[700], marginBottom: spacing.sm },
  card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  cardMeta: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: 4 },
  due: { fontSize: fontSize.xs, color: colors.danger, marginTop: 4, fontWeight: '500' },
  notes: { fontSize: fontSize.xs, color: colors.gray[500], marginTop: 2, fontStyle: 'italic' },
  actionBtn: { marginTop: spacing.md, backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  actionText: { color: colors.white, fontWeight: '600', fontSize: fontSize.sm },
  empty: { textAlign: 'center', color: colors.gray[500], marginTop: 60 },
})
