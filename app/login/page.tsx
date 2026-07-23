'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error('Credenciales incorrectas')
      setLoading(false)
      return
    }

    const role = data.user?.user_metadata?.role
    if (role === 'admin') router.push('/admin')
    else router.push('/local')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#d4d2c6' }}>
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: '#231f1f' }}>Gestión de CVs</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded border focus:outline-none focus:ring-2"
            style={{ borderColor: '#a8a59f' }}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded border focus:outline-none focus:ring-2"
            style={{ borderColor: '#a8a59f' }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded font-semibold text-white transition-colors"
            style={{ backgroundColor: loading ? '#a8a59f' : '#9e7c45' }}
            onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = '#755a2d')}
            onMouseOut={e => !loading && (e.currentTarget.style.backgroundColor = '#9e7c45')}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
