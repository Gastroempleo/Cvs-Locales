import { createServerClient } from '@/lib/supabase/server'
import CandidateForm from './CandidateForm'
import CandidateTable from './CandidateTable'

export default async function LocalPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const localName = user?.user_metadata?.local_name

  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .eq('local_name', localName)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <CandidateForm localName={localName} />
      <CandidateTable candidates={candidates || []} />
    </div>
  )
}
