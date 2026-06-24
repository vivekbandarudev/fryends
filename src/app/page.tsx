import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, Upload, Lock } from 'lucide-react'
export default async function Home() {
  const supabase = createClient()
  const { data: profiles } = await supabase.from('profiles').select('username, full_name, bio')
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">fryends</h1>
        <p className="text-gray-400 text-xl mb-8">A private file showcase for our friend group</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition">Sign In</Link>
          <Link href="/signup" className="border border-purple-600 text-purple-400 hover:bg-purple-600/10 px-6 py-3 rounded-lg font-medium transition">Sign Up</Link>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 text-center"><Users className="w-8 h-8 text-purple-400 mx-auto mb-3"/><h3 className="font-semibold mb-1">5 Friend Spaces</h3><p className="text-gray-400 text-sm">Each friend gets their own space</p></div>
        <div className="bg-gray-900 rounded-xl p-6 text-center"><Upload className="w-8 h-8 text-pink-400 mx-auto mb-3"/><h3 className="font-semibold mb-1">All File Types</h3><p className="text-gray-400 text-sm">Photos, videos, docs and more</p></div>
        <div className="bg-gray-900 rounded-xl p-6 text-center"><Lock className="w-8 h-8 text-blue-400 mx-auto mb-3"/><h3 className="font-semibold mb-1">You Own Your Files</h3><p className="text-gray-400 text-sm">Only you can manage your files</p></div>
      </div>
      {profiles && profiles.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-200">Member Spaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <Link key={p.username} href={'/u/'+p.username} className="bg-gray-900 hover:bg-gray-800 rounded-xl p-6 text-center transition border border-gray-800 hover:border-purple-500">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold mx-auto mb-3">{p.username[0].toUpperCase()}</div>
                <p className="font-medium">{p.full_name || p.username}</p>
                <p className="text-gray-400 text-sm">@{p.username}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}