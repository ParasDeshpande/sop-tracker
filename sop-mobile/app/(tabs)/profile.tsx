import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '../../src/context/AuthContext'
import { router } from 'expo-router'
import { colors, spacing, radius, fontSize } from '../../src/theme'

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  const roleLabel = user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.role === 'ADMIN' ? 'Admin' : 'User'
  const roleColor = user?.role === 'SUPER_ADMIN' ? colors.primary : user?.role === 'ADMIN' ? colors.success : colors.gray[700]

  return (
    <View style={styles.container}>
      <View style={styles.avatarBox}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text></View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.row}><Text style={styles.rowLabel}>Version</Text><Text style={styles.rowValue}>1.0.0</Text></View>
        <View style={styles.row}><Text style={styles.rowLabel}>Platform</Text><Text style={styles.rowValue}>Sumedha Infra SOP</Text></View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], padding: spacing.lg },
  avatarBox: { alignItems: 'center', paddingVertical: spacing.xxl, backgroundColor: colors.white, borderRadius: radius.xl, marginBottom: spacing.lg, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.white },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.gray[900] },
  email: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: 2 },
  roleBadge: { marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radius.full },
  roleText: { fontSize: fontSize.sm, fontWeight: '600' },
  section: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.gray[500], marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  rowLabel: { fontSize: fontSize.md, color: colors.gray[700] },
  rowValue: { fontSize: fontSize.md, color: colors.gray[500] },
  logoutBtn: { backgroundColor: colors.dangerLight, paddingVertical: spacing.lg, borderRadius: radius.lg, alignItems: 'center' },
  logoutText: { color: colors.danger, fontWeight: '600', fontSize: fontSize.md },
})
