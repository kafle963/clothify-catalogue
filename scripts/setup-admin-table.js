// Script to create admin table in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pupkimkzrcddamkiufet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cGtpbWt6cmNkZGFta2l1ZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDE2NTksImV4cCI6MjA3MTc3NzY1OX0.lT72IF29buK9Ag8L8STUhcI_zSoGMEt_4GzkZqm-2fE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupAdminTable() {
  console.log('Setting up admin table...');
  
  try {
    // Check if admin table exists by trying to select from it
    const { data, error } = await supabase.from('admin').select('*').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Admin table does not exist. Please run the migration in Supabase dashboard.');
      console.log('Execute the SQL from: supabase/migrations/20250917000003_create_admin_tables.sql');
      return;
    }
    
    if (error) {
      console.error('Error checking admin table:', error);
      return;
    }
    
    console.log('Admin table exists and is accessible!');
    console.log('Current admin records:', data);
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupAdminTable();