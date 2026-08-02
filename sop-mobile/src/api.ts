import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from './config'

async function getCookies(): Promise<string> {
  return (await AsyncStorage.getItem('auth_cookies')) || ''
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const cookies = await getCookies()
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      ...(cookies ? { Cookie: cookies } : {}),
    },
    credentials: 'include',
  })
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export async function apiPost<T>(path: string, body: any): Promise<{ ok: boolean; data?: T; error?: string }> {
  const res = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return res.ok ? { ok: true, data } : { ok: false, error: data.error || 'Failed' }
}
