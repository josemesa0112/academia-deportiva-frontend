import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wgpkkzinfhossgkgttpc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndncGtremluZmhvc3Nna2d0dHBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDg4NjQsImV4cCI6MjA5MTY4NDg2NH0.hGTrdOA024aVqLmc1h4rvoPsM-jD-Y9OqhVTfAJwfpM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)