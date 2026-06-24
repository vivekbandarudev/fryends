'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username, full_name: fullName } } })
    if (error) { setError(error.message); setLoading(false) } else router.push('/dashboard')
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">fryends</h1>
        <p className="text-gray-400 text-center mb-8">Create your space</p>
        <form onSubmit={handleSignup} className="bg-gray-900 rounded-2xl p-8 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</p>}
          <div><label className="block text-sm text-gray-400 mb-1">Full Name</label><input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"/></div>
          <div><label className="block text-sm text-gray-400 mb-1">Username</label><input type="text" value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none" placeholder="e.g. vivek"/></div>
          <div><label className="block text-sm text-gray-400 mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"/></div>
          <div><label className="block text-sm text-gray-400 mb-1">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"/></div>
          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition">{loading ? 'Creating...' : 'Create Account'}</button>
          <p className="text-center text-gray-400 text-sm">Have an account? <Link href="/login" className="text-purple-400 hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  )
}