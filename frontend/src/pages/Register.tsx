import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type RequiredField = 'name' | 'emailOrPhone' | 'password'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<Record<RequiredField, boolean>>({
    name: false,
    emailOrPhone: false,
    password: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function markTouched(field: RequiredField) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function inputClass(field: RequiredField, value: string) {
    const invalid = touched[field] && !value
    return `mt-1 w-full rounded border px-3 py-2 focus:outline-none ${
      invalid ? 'border-red-500 focus:border-red-500' : 'border-ink/20 focus:border-ember'
    }`
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, emailOrPhone: true, password: true })
    if (!name || !emailOrPhone || !password) return
    setError(null)
    setSubmitting(true)
    try {
      await register(emailOrPhone, password, name, username || undefined)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-ink/70">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => markTouched('name')}
            className={inputClass('name', name)}
          />
        </div>
        <div>
          <label className="block text-sm text-ink/70">
            Email / Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            onBlur={() => markTouched('emailOrPhone')}
            className={inputClass('emailOrPhone', emailOrPhone)}
          />
        </div>
        <div>
          <label className="block text-sm text-ink/70">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded border border-ink/20 px-3 py-2 focus:border-ember focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-ink/70">
            Password <span className="text-red-600">*</span>
          </label>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => markTouched('password')}
            className={inputClass('password', password)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-ember py-2 font-medium text-white hover:bg-ember-dark disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="text-steel hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
