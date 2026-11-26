import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && key && !url.includes('YOUR_PROJECT'))
export const supabase = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

export const MEDIA_BUCKET = 'portfolio-media'
export const mediaUrl = (path?: string | null) => {
  if (!path || !supabase) return ''
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}
