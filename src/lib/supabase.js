// supabase.js — Connects our app to the Supabase database.
//
// This reads two values from .env (or Vercel env):
//   VITE_SUPABASE_URL  — the address of your Supabase project
//   VITE_SUPABASE_ANON_KEY — a public key that lets the browser talk to Supabase
//
// The "VITE_" prefix is required by Vite — it tells the build tool
// "it's OK to include this in the browser bundle."
//
// If either value is missing, we do NOT call createClient — it throws "supabaseUrl is required"
// and would crash the whole app on load (blank page). Instead we export null and the UI explains.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
