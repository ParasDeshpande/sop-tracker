import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useAuth } from '../src/context/AuthContext'
import { router } from 'expo-router'
import { colors, spacing, radius, fontSize } from '../src/theme'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email.trim() || !password) { Alert.alert('Error', 'Enter email and password'); return }
    setLoading(true)
    const result = await login(email.trim().toLowerCase(), password)
    setLoading(false)
    if (result.ok) router.replace('/(tabs)')
    else Alert.alert('Login Failed', result.error)
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logo}><Text style={styles.logoText}>SI</Text></View>
        <Text style={styles.brand}>Sumedha Infra</Text>
        <Text style={styles.subtitle}>SOP Management Platform</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Sign In</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@sumedhainfra.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••" secureTextEntry />
        </View>
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { width: 64, height: 64, borderRadius: radius.lg, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  logoText: { color: colors.white, fontSize: fontSize.xl, fontWeight: '800' },
  brand: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.primary },
  subtitle: { fontSize: fontSize.sm, color: colors.gray[500], marginTop: spacing.xs },
  form: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  formTitle: { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.lg, textAlign: 'center' },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { fontSize: fontSize.sm, fontWeight: '500', color: colors.gray[700], marginBottom: spacing.xs },
  input: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.md },
  button: { backgroundColor: colors.primary, paddingVertical: spacing.lg, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: fontSize.md, fontWeight: '600' },
})
