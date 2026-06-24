import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileIcon, ArrowLeft, Lock } from 'lucide-react'

export default async function UserPage({ params }: { params: { username: string } }) {
  const supabase = await createClient()

  // Must be logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get the logged-in user's profile
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('username, full_name')
    .eq('user_id', user.id)
    .single()

  // Get the target profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, bio')
    .eq('username', params.username)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <Link href="/dashboard" className="text-purple-400 hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  // Only the owner can view their own files
  const isOwner = myProfile?.username === params.username

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 text-purple-400 mx-auto" />
          <h1 className="text-2xl font-bold">Private Space</h1>
          <p className="text-gray-400">This space belongs to <span className="text-purple-300">{profile.full_name || profile.username}</span>.</p>
          <p className="text-gray-500 text-sm">Only the owner can view their files.</p>
          <Link href="/dashboard" className="inline-block mt-4 text-purple-400 hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  // Fetch owner's files
  const { data: files } = await supabase
    .from('files')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const getFileUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('files').getPublicUrl(storagePath)
    return data.publicUrl
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-300">{profile.full_name || profile.username}</h1>
          <p className="text-gray-400 mt-1">@{profile.username} · Your private space</p>
          {profile.bio && <p className="text-gray-300 mt-2">{profile.bio}</p>}
        </div>

        {!files || files.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No files uploaded yet.</p>
            <Link href="/dashboard" className="text-purple-400 hover:underline mt-2 inline-block">Go to Dashboard to upload</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file: any) => (
              <a
                key={file.file_id}
                href={getFileUrl(file.storage_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1a1a2e] rounded-xl p-4 hover:bg-[#16213e] transition-colors block"
              >
                {file.file_type?.startsWith('image/') ? (
                  <img
                    src={getFileUrl(file.storage_path)}
                    alt={file.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full h-40 bg-[#0f0f23] rounded-lg mb-3 flex items-center justify-center">
                    <FileIcon className="w-12 h-12 text-purple-400" />
                  </div>
                )}
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatSize(file.file_size || 0)}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
