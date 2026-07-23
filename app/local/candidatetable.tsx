import type { Candidate } from '@/types'

export default function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#231f1f' }}>
        Mis candidatos ({candidates.length})
      </h2>
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-sm" style={{ color: '#231f1f' }}>
            <th className="p-2">Fecha</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Puesto</th>
            <th className="p-2">Estado</th>
            <th className="p-2">CV</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(c => (
            <tr key={c.id} className="border-t" style={{ borderColor: '#d4d2c6' }}>
              <td className="p-2 text-sm">{new Date(c.created_at).toLocaleDateString()}</td>
              <td className="p-2">{c.nombre} {c.apellido}</td>
              <td className="p-2">{c.puesto}</td>
              <td className="p-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: c.estado_contacto === 'Contactado' ? '#9e7c45' : '#a8a59f' }}
                >
                  {c.estado_contacto}
                </span>
              </td>
              <td className="p-2">
                {c.cv_url && <a href={c.cv_url} target="_blank" className="text-brand-orange underline text-sm">Ver CV</a>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
