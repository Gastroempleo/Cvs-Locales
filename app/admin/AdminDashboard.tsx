'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import type { Candidate } from '@/types'

export default function AdminDashboard({ candidates, locales }: { candidates: Candidate[]; locales: string[] }) {
  const router = useRouter()
  const [filterLocal, setFilterLocal] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [puestoFilter, setPuestoFilter] = useState('')

  const filtered = useMemo(() => {
    return candidates.filter(c => {
      if (filterLocal.length > 0 && !filterLocal.includes(c.local_name)) return false
      if (search && !`${c.nombre} ${c.apellido} ${c.puesto}`.toLowerCase().includes(search.toLowerCase())) return false
      if (dateFrom && new Date(c.created_at) < new Date(dateFrom)) return false
      if (dateTo && new Date(c.created_at) > new Date(dateTo + 'T23:59:59')) return false
      if (puestoFilter && c.puesto?.toLowerCase() !== puestoFilter.toLowerCase()) return false
      return true
    })
  }, [candidates, filterLocal, search, dateFrom, dateTo, puestoFilter])

  const total = filtered.length
  const contactados = filtered.filter(c => c.estado_contacto === 'Contactado').length
  const noContactados = total - contactados

  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach(c => map.set(c.local_name, (map.get(c.local_name) || 0) + 1))
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
  }, [filtered])

  const marcarContactado = async (id: string) => {
    const res = await fetch(`/api/candidates/${id}/contact`, { method: 'PATCH' })
    if (res.ok) {
      toast.success('Marcado como contactado')
      router.refresh()
    } else {
      toast.error('Error al actualizar')
    }
  }

  const toggleLocal = (loc: string) => {
    setFilterLocal(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc])
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold" style={{ color: '#231f1f' }}>Dashboard de Administración</h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1" style={{ color: '#231f1f' }}>Locales</label>
          <div className="flex flex-wrap gap-2">
            {locales.map(loc => (
              <button key={loc} onClick={() => toggleLocal(loc)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${filterLocal.includes(loc)
                  ? 'bg-brand-orange text-white border-brand-orange'
                  : 'bg-white text-brand-dark border-brand-gray'}`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
        <input type="text" placeholder="Buscar nombre o puesto" value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 rounded border" style={{ borderColor: '#a8a59f' }} />
        <div className="flex gap-2">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="p-2 rounded border" style={{ borderColor: '#a8a59f' }} />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="p-2 rounded border" style={{ borderColor: '#a8a59f' }} />
        </div>
        <input type="text" placeholder="Filtrar por puesto" value={puestoFilter}
          onChange={e => setPuestoFilter(e.target.value)}
          className="p-2 rounded border" style={{ borderColor: '#a8a59f' }} />
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-3xl font-bold" style={{ color: '#231f1f' }}>{total}</p>
          <p className="text-sm" style={{ color: '#a8a59f' }}>Total candidatos</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-3xl font-bold" style={{ color: '#9e7c45' }}>{contactados}</p>
          <p className="text-sm" style={{ color: '#a8a59f' }}>Contactados</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <p className="text-3xl font-bold" style={{ color: '#755a2d' }}>{noContactados}</p>
          <p className="text-sm" style={{ color: '#a8a59f' }}>No contactados</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#231f1f' }}>Candidatos por local</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#a8a59f" />
            <XAxis dataKey="name" stroke="#231f1f" />
            <YAxis stroke="#231f1f" />
            <Tooltip />
            <Bar dataKey="count" fill="#9e7c45" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla */}
      <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#231f1f' }}>Listado de candidatos</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left" style={{ color: '#231f1f' }}>
              <th className="p-2">Fecha</th>
              <th className="p-2">Local</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Puesto</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t" style={{ borderColor: '#d4d2c6' }}>
                <td className="p-2">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-2">{c.local_name}</td>
                <td className="p-2">{c.nombre} {c.apellido}</td>
                <td className="p-2">{c.puesto}</td>
                <td className="p-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: c.estado_contacto === 'Contactado' ? '#9e7c45' : '#a8a59f' }}>
                    {c.estado_contacto}
                  </span>
                </td>
                <td className="p-2 flex gap-2">
                  {c.estado_contacto === 'No contactado' && (
                    <button onClick={() => marcarContactado(c.id)}
                      className="px-3 py-1 rounded text-white text-xs transition-colors"
                      style={{ backgroundColor: '#9e7c45' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#755a2d'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = '#9e7c45'}
                    >
                      Marcar Contactado
                    </button>
                  )}
                  {c.cv_url && <a href={c.cv_url} target="_blank" className="text-brand-orange underline text-xs">Ver CV</a>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
