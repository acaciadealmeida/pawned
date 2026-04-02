// supabase.js — Connects our app to the Supabase database.
//
// This reads two values from the .env.local file:
//   VITE_SUPABASE_URL  — the address of your Supabase project
//   VITE_SUPABASE_ANON_KEY — a public key that lets the browser talk to Supabase
//
// The "VITE_" prefix is required by Vite — it tells the build tool
// "it's OK to include this in the browser bundle."

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// createClient gives us an object we can use to read/write to the database.
// We export it so any file in our app can use it.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
