import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ngubvhvkfirinbdbanta.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndWJ2aHZrZmlyaW5iZGJhbnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NDQyNTQsImV4cCI6MjEwMDQyMDI1NH0.BUoIxNvxK_QpiGbjgueW9eCo5_dRrsLtZXOfJjtXSFY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)