import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function LocalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  const localName = user.user_metadata?.local_name || 'Local'

  return (
    <div className="min-h-screen flex flex-col bg-brand-yellow">
      <header className="p-4 flex justify-between items-center text-white" style={{ backgroundColor: '#231f1f' }}>
        <h1 className="text-xl font-bold">{localName}</h1>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
