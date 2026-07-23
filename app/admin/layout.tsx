import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-brand-yellow">
      <header className="p-4 flex justify-between items-center text-white" style={{ backgroundColor: '#231f1f' }}>
        <h1 className="text-xl font-bold">Administración</h1>
        <LogoutButton />
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
