'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CandidateForm({ localName }: { localName: string }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    puesto: '',
    cargadoPor: '',
    observaciones: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Debe adjuntar el CV')
      return
    }

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, value))
    formData.append('cv', file)

    setLoading(true)
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        toast.success('Candidato cargado correctamente')
        setForm({
          nombre: '', apellido: '', telefono: '', email: '', puesto: '', cargadoPor: '', observaciones: '',
        })
        setFile(null)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Error al cargar')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "p-3 rounded border w-full focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#a8a59f' }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#231f1f' }}>Cargar nuevo candidato</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required placeholder="Nombre" value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          className={inputClass} style={inputStyle} />
        <input required placeholder="Apellido" value={form.apellido}
          onChange={e => setForm({ ...form, apellido: e.target.value })}
          className={inputClass} style={inputStyle} />
        <input placeholder="Teléfono" value={form.telefono}
          onChange={e => setForm({ ...form, telefono: e.target.value })}
          className={inputClass} style={inputStyle} />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className={inputClass} style={inputStyle} />
        <input placeholder="Puesto" value={form.puesto}
          onChange={e => setForm({ ...form, puesto: e.target.value })}
          className={inputClass} style={inputStyle} />
        <input required placeholder="Quién lo cargó" value={form.cargadoPor}
          onChange={e => setForm({ ...form, cargadoPor: e.target.value })}
          className={inputClass} style={inputStyle} />
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium" style={{ color: '#231f1f' }}>Observaciones</label>
          <textarea value={form.observaciones}
            onChange={e => setForm({ ...form, observaciones: e.target.value })}
            className={inputClass} style={inputStyle} rows={2} />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium" style={{ color: '#231f1f' }}>Adjuntar CV (PDF/Word/Imagen)</label>
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full" required />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={loading}
            className="px-6 py-3 rounded font-semibold text-white transition-colors"
            style={{ backgroundColor: loading ? '#a8a59f' : '#9e7c45' }}
            onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = '#755a2d')}
            onMouseOut={e => !loading && (e.currentTarget.style.backgroundColor = '#9e7c45')}
          >
            {loading ? 'Guardando...' : 'Guardar candidato'}
          </button>
        </div>
      </form>
    </div>
  )
}
