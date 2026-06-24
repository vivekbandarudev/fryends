'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Trash2, FileIcon, ImageIcon, VideoIcon, LogOut, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
type Profile = { user_id: string; username: string; full_name: string; bio: string }
type FileRow = { file_id: string; name: string; storage_path: string; file_type: string; file_size: number; is_public: boolean; created_at: string }
export default function DashboardClient({ profile, files: initialFiles, userId }: { profile: Profile; files: FileRow[]; userId: string }) {
  const [files, setFiles] = useState(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true); setError('')
    try {
      const ext = file.name.split('.').pop()
      const path = userId+'/'+Date.now()+'.'+ext
      const { error: uploadErr } = await supabase.storage.from('files').upload(path, file)
      if (uploadErr) throw uploadErr
      const { data: row, error: dbErr } = await supabase.from('files').insert({ owner_id: profile.user_id, name: file.name, storage_path: path, file_type: file.type, file_size: file.size, is_public: true }).select().single()
      if (dbErr) throw dbErr
      setFiles(prev => [row, ...prev])
    } catch (err: any) { setError(err.message) }
    finally { setUploading(false); if(fileRef.current) fileRef.current.value='' }
  }
  async function handleDelete(f: FileRow) {
    if (!confirm('Delete "'+f.name+'"?')) return
    await supabase.storage.from('files').remove([f.storage_path])
    await supabase.from('files').delete().eq('file_id', f.file_id)
    setFiles(prev => prev.filter(x => x.file_id !== f.file_id))
  }
  async function handleLogout() { await supabase.auth.signOut(); router.push('/') }
  function fmt(b: number) { if(b<1024*1024) return (b/1024).toFixed(1)+' KB'; return (b/(1024*1024)).toFixed(1)+' MB' }
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-gray-900 rounded-2xl p-6">
          <div><h1 className="text-2xl font-bold">{profile?.full_name || profile?.username}</h1><p className="text-gray-400">@{profile?.username}</p></div>
          <div className="flex gap-3">
            <Link href={'/u/'+(profile?.username||'')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-2 rounded-lg"><ExternalLink className="w-4 h-4"/>Public Page</Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm border border-gray-700 px-3 py-2 rounded-lg"><LogOut className="w-4 h-4"/>Sign Out</button>
          </div>
        </div>
        <div className="mb-6">
          {error && <p className="text-red-400 text-sm mb-3 bg-red-400/10 p-3 rounded-lg">{error}</p>}
          <button onClick={()=>fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"><Upload className="w-4 h-4"/>{uploading?'Uploading...':'Upload File'}</button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}/>
        </div>
        {files.length===0 ? (
          <div className="text-center py-20 text-gray-500"><Upload className="w-12 h-12 mx-auto mb-3 opacity-30"/><p>No files yet. Upload your first file!</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map(f => {
              const url = SUPA_URL+'/storage/v1/object/public/files/'+f.storage_path
              return (
                <div key={f.file_id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 transition">
                  {f.file_type?.startsWith('image') ? <img src={url} alt={f.name} className="w-full h-40 object-cover"/> : f.file_type?.startsWith('video') ? <video src={url} className="w-full h-40 object-cover" controls/> : <div className="w-full h-40 flex items-center justify-center bg-gray-800"><FileIcon className="w-12 h-12 text-gray-600"/></div>}
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-gray-500">{fmt(f.file_size)}</p>
                    <div className="flex gap-2 mt-2">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300">View</a>
                      <button onClick={()=>handleDelete(f)} className="flex items-center gap-1 text-xs bg-red-900/30 hover:bg-red-900/60 px-2 py-1 rounded text-red-400"><Trash2 className="w-3 h-3"/>Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}