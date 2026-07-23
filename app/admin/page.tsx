import { createServerClient } from '@/lib/supabase/server'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const supabase = await createServerClient()
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false })

  const locales = Array.from(new Set((candidates || []).map(c => c.local_name))).sort()

  return <AdminDashboard candidates={candidates || []} locales={locales} />
}
