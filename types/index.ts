export interface Candidate {
  id: string
  local_name: string
  nombre: string
  apellido: string
  telefono: string | null
  email: string | null
  puesto: string | null
  cargado_por: string
  observaciones: string | null
  cv_url: string | null
  estado_contacto: 'No contactado' | 'Contactado'
  created_at: string
  created_by: string | null
}
