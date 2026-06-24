import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
  const { data: files } = await supabase.from('files').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
  return <DashboardClient profile={profile} files={files || []} userId={user.id} />
}