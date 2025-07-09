"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// Create a single supabase client for client-side usage
let supabaseClient: ReturnType<typeof createBrowserSupabaseClient> | null = null

export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Use a singleton pattern to avoid multiple instances
export const getSupabaseBrowserClient = () => {
  if (!supabaseClient) {
    supabaseClient = createBrowserSupabaseClient()
  }
  return supabaseClient
}
