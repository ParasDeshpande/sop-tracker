import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../config'
import { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({} as AuthState)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem('auth_user').then(data => {
      if (data) setUser(JSON.parse(data))
      setLoading(false)
    })
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Get CSRF token
      const csrfRes = await fetch(`${API_BASE_URL}/api/auth/csrf`)
      const { csrfToken } = await csrfRes.json()

      // Sign in
      const res = await fetch(`${API_BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&csrfToken=${csrfToken}&json=true`,
        redirect: 'manual',
      })

      const cookies = res.headers.get('set-cookie') || ''

      // Fetch session
      const sessionRes = await fetch(`${API_BASE_URL}/api/auth/session`, { headers: { Cookie: cookies } })
      const session = await sessionRes.json()

      if (session?.user?.id) {
        const userData: User = { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role, departmentId: session.user.departmentId }
        await AsyncStorage.setItem('auth_cookies', cookies)
        await AsyncStorage.setItem('auth_user', JSON.stringify(userData))
        setUser(userData)
        return { ok: true }
      }
      return { ok: false, error: 'Invalid email or password' }
    } catch (err: any) {
      return { ok: false, error: 'Network error. Check your connection.' }
    }
  }

  const logout = async () => {
    await AsyncStorage.multiRemove(['auth_cookies', 'auth_user'])
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
