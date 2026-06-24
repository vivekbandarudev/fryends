import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileIcon, ArrowLeft } from 'lucide-react'
export default async function UserPage({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('username', params.username).single()
  if (!profile) notFound()
  const { data: files } = await supabase.from('files').select('*').eq('owner_id', profile.user_id).eq('is_public', true).order('created_at', { ascending: false })
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  function fmt(b: number) { if(!b) return ''; if(b<1024*1024) return (b/1024).toFixed(1)+' KB'; return (b/(1024*1024)).toFixed(1)+' MB' }
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6"><ArrowLeft className="w-4 h-4"/>Back to Home</Link>
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold mx-auto mb-4">{profile.username[0].toUpperCase()}</div>
          <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
          <p className="text-gray-400">@{profile.username}</p>
          {profile.bio && <p className="text-gray-300 mt-2 max-w-md mx-auto">{profile.bio}</p>}
          <p className="text-gray-500 text-sm mt-2">{files?.length||0} files</p>
        </div>
        {(!files||files.length===0) ? (
          <div className="text-center py-20 text-gray-500"><FileIcon className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>No public files yet</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map(f => {
              const url = SUPA_URL+'/storage/v1/object/public/files/'+f.storage_path
              return (
                <a key={f.file_id} href={url} target="_blank" rel="noopener noreferrer" className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition block">
                  {f.file_type?.startsWith('image') ? <img src={url} alt={f.name} className="w-full h-48 object-cover"/> : f.file_type?.startsWith('video') ? <video src={url} className="w-full h-48 object-cover"/> : <div className="w-full h-48 flex items-center justify-center bg-gray-800"><FileIcon className="w-16 h-16 text-gray-600"/></div>}
                  <div className="p-3"><p className="text-sm font-medium truncate text-gray-200">{f.name}</p><p className="text-xs text-gray-500">{fmt(f.file_size)}</p></div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}