import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken } from '../api/client'

interface User {
  id: number
  email: string
  name?: string | null
}

interface AuthResponse {
  token: string
  user: User
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// There's no "who am I" endpoint yet, so on refresh we just trust a stored
// token exists and let the first API call fail (-> logout) if it's stale.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('fitness_app_user')
    if (stored && getToken()) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  function persist(res: AuthResponse) {
    setToken(res.token)
    localStorage.setItem('fitness_app_user', JSON.stringify(res.user))
    setUser(res.user)
  }

  async function login(email: string, password: string) {
    const res = await api.post<AuthResponse>('/auth/login', { email, password })
    persist(res)
  }

  async function register(email: string, password: string, name?: string) {
    const res = await api.post<AuthResponse>('/auth/register', { email, password, name })
    persist(res)
  }

  function logout() {
    clearToken()
    localStorage.removeItem('fitness_app_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
